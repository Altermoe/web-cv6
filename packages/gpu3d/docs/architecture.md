# gpu3d 架构设计文档

## 概述

`@webcv6/gpu3d` 是 Web-CV6 项目的 3D 渲染核心，代号 VGP（Vue Graphics Pipeline）。本模块采用纯 WebGPU + WGSL 构建渲染引擎，通过 Vue 3 `createRenderer` 生态实现声明式资源管理与高性能运行时隔离。

### 核心设计目标

1. **声明式资源管理**: 利用 Vue 组件生命周期自动管理 WebGPU 资源生命周期
2. **高性能运行时隔离**: 渲染循环与 Vue VNode Diff 完全解耦
3. **数据驱动更新**: 响应式系统精准驱动 GPU 资源增量更新

---

## 架构总览

```
┌─────────────────────────────────────────────────────────────────┐
│                        Vue Layer (Declarative)                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Vue Component Tree (VNode)                  │    │
│  │  <Terrain /> <Unit /> <City /> <Effect /> <Indicator /> │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │ mount / unmount                   │
│                              ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │            Vue createRenderer (Host Env)                 │    │
│  │     拦截 mountComponent / updateComponent / unmount      │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────┬───────────────────────────────────┘
                              │ 一次性初始化
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Native Layer (Imperative)                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │  Scene Graph    │  │  Render Graph   │  │  Render Loop    │   │
│  │  (Native Tree)  │──│  (DAG)          │──│  (Pure JS/WGSL) │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        WebGPU Layer                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Device   │  │ Buffer   │  │ Texture  │  │ Pipeline │          │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 第一部分：三大核心设计理念

### 1. 声明式资源管理

#### 技术实现

Vue 3 `createRenderer` 允许开发者自定义渲染器宿主环境。我们将 WebGPU 资源（Buffer、Texture、Pipeline）映射为"宿主元素"，通过 Vue 组件生命周期自动管理其创建与销毁。

```typescript
// packages/gpu3d/src/createGPURenderer.ts

interface GPURendererOptions {
  canvas: HTMLCanvasElement;
  adapter: GPUAdapter;
  antialias?: boolean;
  powerPreference?: "high-performance" | "low-power";
}

export function createGPURenderer(options: GPURendererOptions): GPURenderer {
  const device = await adapter.requestDevice({
    requiredLimits: {
      maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize,
    },
  });

  // 创建 Vue 自定义渲染器
  const renderer = createRenderer<SceneNodeOptions, GPUResource>({
    createElement(type) {
      // type: 'scene' | 'terrain' | 'unit' | 'mesh' | 'light' | 'camera'
      return createSceneNode(type, device);
    },

    insert(child, parent, anchor) {
      // 插入到原生场景树
      parent.sceneNode.addChild(child.sceneNode, anchor);
    },

    remove(child) {
      // 从场景树移除，触发 GPU 资源销毁
      child.sceneNode.remove();
      child.dispose(); // 调用 GPU 资源释放
    },

    patchProp(node, key, prevValue, nextValue) {
      // 拦截属性变化，触发 GPU 资源更新
      node.patchProperty(key, prevValue, nextValue);
    },

    move(child, parent, anchor) {
      parent.sceneNode.moveChild(child.sceneNode, anchor);
    },
  });

  return renderer;
}
```

#### 资源类型映射

| Vue Component          | WebGPU Resource                            | 生命周期                     |
| ---------------------- | ------------------------------------------ | ---------------------------- |
| `<Terrain />`          | Buffer (vertex/index), Texture (heightmap) | mount 时创建，unmount 时销毁 |
| `<Unit />`             | Buffer, BindGroup (material)               | mount 时创建，unmount 时销毁 |
| `<Mesh />`             | Buffer, Pipeline                           | mount 时编译，unmount 时销毁 |
| `<DirectionalLight />` | Buffer (UBO)                               | mount 时创建，update 时写入  |
| `<Camera />`           | Buffer (UBO, ViewProj matrix)              | mount 时创建，每帧更新       |

#### GPU 内存垃圾回收

```typescript
class GPUResource {
  protected refs: Set<string> = new Set();

  addRef(id: string) {
    this.refs.add(id);
  }

  release(id: string) {
    this.refs.delete(id);
    if (this.refs.size === 0) {
      this.disposeGPU();
    }
  }

  disposeGPU() {
    // 销毁 WebGPU 资源
    this.buffer?.destroy();
    this.texture?.destroy();
    this.pipeline?.destroy();
  }
}
```

---

### 2. 高性能运行时隔离

#### 设计原则

Vue 组件树仅负责"声明式资源描述"，在 mount 阶段一次性生成底层原生场景树。真正的渲染循环（Render Loop）完全运行在原生层，不涉及任何 Vue 响应式追踪或 VNode Diff。

#### 双树架构

```
┌─────────────────────────────────────────────────────────────┐
│                    VNode Tree (声明式)                        │
│  生命周期: mount -> 运行 -> unmount (一次性)                  │
│  职责: 描述 GPU 资源需求                                      │
│  更新: 仅在属性变化时 patchProp，不触发渲染                    │
└─────────────────────────────────────────────────────────────┘
                              │
                    Vue createRenderer
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Native Scene Tree (命令式)                    │
│  生命周期: 持续运行 (持续)                                    │
│  职责: 维护场景图状态，执行变换 hierarchy                     │
│  更新: 每帧更新 World Matrix，从 WorldState 同步位置          │
└─────────────────────────────────────────────────────────────┘
```

#### 实现机制

```typescript
// packages/gpu3d/src/scene/Scene.ts

export class Scene {
  private root: SceneNode;
  private renderGraph: RenderGraph;
  private renderLoop: RenderLoop;

  constructor(device: GPUDevice) {
    this.root = new SceneNode("root");
    this.renderGraph = new RenderGraph(device);
    this.renderLoop = new RenderLoop(device, this.root, this.renderGraph);
  }

  // Vue mount 时调用：构建原生场景树
  buildFromVNode(vnode: VNode) {
    const node = this.createNativeNode(vnode);
    this.root.addChild(node);

    // 递归构建子树
    vnode.children?.forEach((child) => {
      this.buildFromVNode(child);
    });
  }

  // Vue unmount 时调用：清理节点
  removeNode(nodeId: string) {
    const node = this.root.findById(nodeId);
    node?.remove();
  }

  // 启动渲染循环（与 Vue 解耦）
  start() {
    this.renderLoop.start();
  }

  stop() {
    this.renderLoop.stop();
  }
}

// packages/gpu3d/src/render/RenderLoop.ts

export class RenderLoop {
  private running = false;
  private frameId: number = 0;

  start() {
    this.running = true;
    this.tick();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frameId);
  }

  private tick = () => {
    if (!this.running) return;

    const frame = this.device.queue.submit([]);
    this.frameId = requestAnimationFrame(this.tick);
  };
}
```

#### RenderGraph 设计

RenderGraph 是一个有向无环图（DAG），描述渲染管线的执行顺序：

```typescript
// packages/gpu3d/src/render/RenderGraph.ts

export class RenderGraph {
  private passes: Map<string, RenderPass> = new Map();
  private dependencies: Map<string, string[]> = new Map();

  addPass(pass: RenderPass, deps: string[] = []) {
    this.passes.set(pass.name, pass);
    this.dependencies.set(pass.name, deps);
  }

  execute(device: GPUDevice, context: RenderContext) {
    const order = this.topologicalSort();

    for (const passName of order) {
      const pass = this.passes.get(passName)!;
      pass.execute(device, context);
    }
  }

  private topologicalSort(): string[] {
    // Kahn 算法拓扑排序
    const visited = new Set<string>();
    const result: string[] = [];

    const dfs = (node: string) => {
      if (visited.has(node)) return;
      visited.add(node);

      for (const dep of this.dependencies.get(node) || []) {
        dfs(dep);
      }

      result.push(node);
    };

    for (const node of this.passes.keys()) {
      dfs(node);
    }

    return result;
  }
}
```

---

### 3. 数据驱动更新

#### 响应式更新链路

```typescript
// Vue 响应式数据
const unitPosition = reactive({ x: 0, y: 0, z: 0 })

// 绑定到 Mesh 组件
<Mesh position={unitPosition} />

// Vue patchProp 拦截属性变化
patchProp(node, 'position', prev, next) {
  // next = { x: 1, y: 0, z: 0 }
  node.updatePosition(next)
}

// 增量更新 GPU Buffer
class MeshNode {
  updatePosition(position: Vec3) {
    const matrix = mat4.translate(position)
    this.device.queue.writeBuffer(
      this.transformBuffer,
      0,
      new Float32Array(matrix)
    )
  }
}
```

#### 批量更新优化

```typescript
export class BatchUpdateManager {
  private pendingWrites: Map<GPUTexture | GPUBuffer, Data> = new Map();
  private frameScheduled = false;

  scheduleWrite(buffer: GPUBuffer, data: ArrayBuffer) {
    this.pendingWrites.set(buffer, data);
    this.scheduleFlush();
  }

  private scheduleFlush() {
    if (this.frameScheduled) return;
    this.frameScheduled = true;

    requestAnimationFrame(() => {
      this.flush();
      this.frameScheduled = false;
    });
  }

  flush() {
    for (const [buffer, data] of this.pendingWrites) {
      this.device.queue.writeBuffer(buffer, 0, data);
    }
    this.pendingWrites.clear();
  }
}
```

---

## 第二部分：子模块职责与接口

### backend 模块

`packages/gpu3d/src/backend/`

职责：封装 WebGPU 底层 API，提供资源抽象。

```typescript
// Device.ts
export class GPUBackend {
  constructor(adapter: GPUAdapter) {
    this.device = await adapter.requestDevice();
    this.limits = this.device.limits;
    this.features = this.device.features;
  }

  createBuffer(descriptor: GPUBufferDescriptor): GPUBuffer {
    return this.device.createBuffer(descriptor);
  }

  createTexture(descriptor: GPUTextureDescriptor): GPUTexture {
    return this.device.createTexture(descriptor);
  }

  createShaderModule(wgsl: string): GPUShaderModule {
    return this.device.createShaderModule({ code: wgsl });
  }

  createPipeline(descriptor: GPURenderPipelineDescriptor): GPURenderPipeline {
    return this.device.createRenderPipeline(descriptor);
  }
}

// Buffer.ts
export class GPUBuffer {
  constructor(
    private device: GPUDevice,
    private descriptor: GPUBufferDescriptor,
  ) {
    this.buffer = device.createBuffer(descriptor);
  }

  write(data: ArrayBuffer, offset = 0) {
    this.device.queue.writeBuffer(this.buffer, offset, data);
  }

  read(): Promise<ArrayBuffer> {
    const reader = this.buffer.mapReadAsync();
    return this.device.queue.onSubmittedWorkDone().then(() => reader.getData());
  }

  destroy() {
    this.buffer.destroy();
  }
}
```

---

### scene 模块

`packages/gpu3d/src/scene/`

职责：维护场景图结构（Scene Tree），管理实体与组件。

```typescript
// Scene.ts
export class Scene {
  root: SceneNode;
  cameras: Camera[] = [];
  lights: Light[] = [];

  addEntity(entity: Entity) {
    this.root.addChild(entity.node);
  }

  removeEntity(id: string) {
    this.root.removeChildById(id);
  }

  traverse(callback: (node: SceneNode) => void) {
    this.root.traverse(callback);
  }
}

// Entity.ts
export class Entity {
  readonly id: string;
  node: SceneNode;
  components: Component[] = [];

  addComponent<T extends Component>(component: T): T {
    component.attach(this);
    this.components.push(component);
    return component;
  }

  getComponent<T extends Component>(type: new () => T): T | undefined {
    return this.components.find((c) => c instanceof type);
  }
}

// Transform.ts
export class Transform implements Component {
  position: Vec3 = vec3.create();
  rotation: Quaternion = quat.create();
  scale: Vec3 = vec3.fromValues(1, 1, 1);
  worldMatrix: Mat4 = mat4.create();

  updateWorldMatrix(parent?: Mat4) {
    mat4.fromRotationTranslationScale(this.worldMatrix, this.rotation, this.position, this.scale);
    if (parent) {
      mat4.multiply(this.worldMatrix, parent, this.worldMatrix);
    }
  }
}
```

---

### render 模块

`packages/gpu3d/src/render/`

职责：实现渲染管线，管理相机、光照、渲染 Pass。

```typescript
// RenderGraph.ts
export class RenderGraph {
  passes: RenderPass[] = [];

  addPass(pass: RenderPass) {
    this.passes.push(pass);
  }

  execute(context: RenderContext) {
    for (const pass of this.passes) {
      pass.execute(context);
    }
  }
}

// Camera.ts
export class Camera {
  fov: number;
  near: number;
  far: number;
  aspect: number;

  viewMatrix: Mat4 = mat4.create();
  projectionMatrix: Mat4 = mat4.create();
  viewProjectionMatrix: Mat4 = mat4.create();

  // UBO 数据布局
  toUBO(): Float32Array {
    return new Float32Array([
      ...this.viewMatrix,
      ...this.projectionMatrix,
      ...this.viewProjectionMatrix,
      this.near,
      this.far,
      this.aspect,
      0, // padding
    ]);
  }
}

// RenderPass.ts
export abstract class RenderPass {
  abstract name: string;
  abstract execute(context: RenderContext): void;

  protected beginPass(encoder: GPURenderPassEncoder) {
    // 设置视口、裁剪等
  }
}
```

---

### sim 模块

`packages/gpu3d/src/sim/`

职责：纯函数式游戏状态管理，不依赖任何 WebGPU / DOM API。

```typescript
// WorldState.ts
export interface WorldState {
  turn: number;
  players: Player[];
  entities: Map<string, GameEntity>;
  map: GameMap;
  rules: GameRules;
}

// 纯函数式转换
export const WorldState = {
  nextTurn(state: WorldState): WorldState {
    return {
      ...state,
      turn: state.turn + 1,
      players: state.players.map((p) => ({
        ...p,
        resources: calculateProduction(p.resources),
      })),
    };
  },

  moveUnit(state: WorldState, unitId: string, target: Vec2): WorldState {
    const unit = state.entities.get(unitId);
    if (!unit || unit.type !== "unit") return state;

    return {
      ...state,
      entities: new Map(state.entities).set(unitId, {
        ...unit,
        position: target,
      }),
    };
  },
};

// TurnManager.ts
export class TurnManager {
  private state: WorldState;
  private subscribers: Set<(state: WorldState) => void> = new Set();

  dispatch(action: GameAction): WorldState {
    const newState = WorldState.apply(this.state, action);
    this.state = newState;
    this.notify();
    return newState;
  }

  subscribe(callback: (state: WorldState) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notify() {
    for (const sub of this.subscribers) {
      sub(this.state);
    }
  }
}
```

---

### port 模块

`packages/gpu3d/src/port/`

职责：定义对外契约，解耦 UI 层与 3D 层。

```typescript
// InputPort.ts
export interface InputPort {
  // 屏幕坐标转世界射线
  screenToRay(screenPos: Vec2, camera: Camera): Ray;

  // 射线与场景求交
  raycast(ray: Ray, scene: Scene): RaycastHit | null;

  // 框选
  boxSelect(screenBox: Box2, camera: Camera): GameEntity[];

  // 拾取
  pick(screenPos: Vec2, camera: Camera): GameEntity | null;
}

// StateStream.ts
export interface StateStream {
  // 当前选中单位
  selectedUnit$: Observable<GameEntity | null>;

  // 回合数
  turnNumber$: Observable<number>;

  // 相机位姿
  cameraPose$: Observable<CameraPose>;

  // 实体状态
  entityState$(id: string): Observable<GameEntity>;

  // 资源状态
  resources$: Observable<Resources>;
}
```

---

## 第三部分：渲染管线架构

### 渲染 Pass 序列

```
┌─────────────────────────────────────────────────────────────┐
│                      Frame Start                             │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   G-Buffer Pass (MRT)                        │
│  Targets:                                                     │
│    - Position (RGBA32F)                                      │
│    - Normal (RGBA32F)                                         │
│    - Albedo (RGBA8Unorm)                                      │
│    - Roughness/Metallic (RG8Unorm)                            │
│  Contents:                                                   │
│    - Terrain layer (instanced)                               │
│    - Unit layer (instanced)                                   │
│    - City layer (instanced)                                   │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Light Pass                                  │
│  Inputs: G-Buffer                                             │
│  Operations:                                                  │
│    - Directional light + ShadowMap                           │
│    - PCF soft shadows                                         │
│    - PBR BRDF shading                                         │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Post-Process Pass                            │
│  Operations:                                                  │
│    - Tone mapping (ACES)                                     │
│    - FXAA anti-aliasing                                      │
│    - Vignette (optional)                                     │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Composite Pass                             │
│  Operations:                                                  │
│    - 3D UI overlay (minimap, indicators)                     │
│    - Selection ring                                          │
│    - Damage numbers                                          │
└─────────────────────────┬───────────────────────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      Frame End                                │
└─────────────────────────────────────────────────────────────┘
```

### ShadowMap 实现

```typescript
// 单方向光 ShadowMap + PCF 软阴影
export class ShadowMapPass extends RenderPass {
  private shadowMap: GPUTexture;
  private shadowPass: GPURenderPass;

  execute(context: RenderContext) {
    const light = context.scene.lights[0] as DirectionalLight;

    // 1. 渲染 ShadowMap
    const encoder = context.device.createRenderPassEncoder({
      colorAttachments: [],
      depthStencilAttachment: {
        view: this.shadowMap.createView(),
        depthClearValue: 1.0,
        depthLoadOp: "clear",
        depthStoreOp: "store",
      },
    });

    // 设置正交投影（光源视角）
    const lightView = this.calculateLightView(light);
    const lightProj = mat4.ortho(-50, 50, -50, 50, 0.1, 200);

    // 渲染深度到 ShadowMap
    for (const entity of context.scene.entities) {
      encoder.drawInstanced(entity.vertexCount, entity.instanceCount);
    }

    encoder.end();

    // 2. 在 LightPass 中使用 ShadowMap
    context.setBindGroup("shadowMap", this.shadowMap);
  }
}
```

### 实例化渲染

```typescript
// 统一的实例数据 Buffer 布局
interface InstanceData {
  worldMatrix: Float32Array; // 4x4 = 16 floats
  normalMatrix: Float32Array; // 3x3 = 9 floats (mat3)
  color: Float32Array; // 4 floats (RGBA)
}

// @group(1) @binding(0) var<storage, read> instances : array<InstanceData>;
export const instanceShader = `
struct InstanceData {
  worldMatrix : mat4x4<f32>,
  normalMatrix : mat3x3<f32>,
  color : vec4<f32>,
}

@group(1) @binding(0) var<storage, read> instances : array<InstanceData>;

@vertex
fn main(
  @builtin(vertex_index) vertexIndex : u32,
  @builtin(instance_index) instanceIndex : u32
) -> VertexOutput {
  var instance = instances[instanceIndex];
  var pos = positions[vertexIndex];
  
  // 应用实例变换
  let worldPos = instance.worldMatrix * vec4<f32>(pos, 1.0);
  
  return VertexOutput(
    position: viewProj * worldPos,
    worldPos: worldPos.xyz,
    normal: instance.normalMatrix * normals[vertexIndex],
    color: instance.color,
  );
}
`;
```

---

## 第四部分：资源生命周期管理

### Vue 生命周期映射

```
┌─────────────────────────────────────────────────────────────┐
│                     Vue Component Lifecycle                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  setup() ──> onMounted() ──> [patchProp x N] ──> onUnmounted│
│     │              │                    │                  │
│     ▼              ▼                    ▼                  │
│  创建响应式    mountComponent        unmountComponent       │
│  上下文        → 创建 GPU 资源        → 销毁 GPU 资源       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 完整生命周期示例

```typescript
// Terrain Component 实现
export function createTerrainVNode(props: TerrainProps): VNode {
  return {
    type: "terrain",
    props: {
      heightmap: props.heightmap,
      size: props.size,
      tileCount: props.tileCount,
    },
  };
}

// SceneNode 实现
class TerrainNode extends SceneNode {
  private vertexBuffer: GPUBuffer;
  private indexBuffer: GPUBuffer;
  private heightmapTexture: GPUTexture;
  private pipeline: GPURenderPipeline;

  constructor(device: GPUDevice, props: TerrainProps) {
    super("terrain");

    // 1. 创建 GPU 资源 (mount 时)
    this.vertexBuffer = device.createBuffer({
      size: props.tileCount * 6 * 4 * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    this.indexBuffer = device.createBuffer({
      size: props.tileCount * 6 * Uint16Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    });

    this.heightmapTexture = device.createTexture({
      size: [props.size, props.size],
      format: "r32float",
      usage: GPUTextureUsage.SAMPLED | GPUTextureUsage.COPY_DST,
    });

    this.pipeline = device.createRenderPipeline({
      vertex: { module: terrainShader, entryPoint: "main" },
      fragment: { module: terrainShader, entryPoint: "fragment" },
      // ...
    });
  }

  patchProperty(key: string, prev: any, next: any) {
    switch (key) {
      case "heightmap":
        this.device.queue.writeTexture(
          { texture: this.heightmapTexture },
          next,
          { rowsPerImage: this.heightmapTexture.width },
          [this.heightmapTexture.width, this.heightmapTexture.height],
        );
        break;
      case "visible":
        this.hidden = !next;
        break;
    }
  }

  dispose() {
    // 销毁 GPU 资源 (unmount 时)
    this.vertexBuffer.destroy();
    this.indexBuffer.destroy();
    this.heightmapTexture.destroy();
    this.pipeline.destroy();
  }
}
```

---

## 第五部分：与 @webcv6/core 的依赖关系

### 依赖约束

```
packages/core/          # 共享类型、工具函数
       │
       ▼
packages/gpu3d/         # 3D 渲染核心 (反向禁止)
       │
       ▼
packages/ui/            # Vue 组件库
       │
       ▼
apps/web/               # 主应用
```

### 共享类型 (从 @webcv6/core 导入)

```typescript
// 基础数学类型
import { Vec2, Vec3, Vec4, Mat4, Quaternion } from "@webcv6/core/math";

// 游戏实体接口
import { GameEntity, Unit, City, Tile } from "@webcv6/core/entities";

// 事件类型
import { GameEvent, InputEvent, SelectEvent } from "@webcv6/core/events";

// 常量定义
import { TILE_SIZE, HEX_SIZE, MAP_MAX_SIZE } from "@webcv6/core/constants";
```

### 禁止的依赖

- `gpu3d` 不得 import `vue` 以外的任何 UI 组件
- `gpu3d` 不得 import `apps/` 下的任何模块
- `gpu3d` 不得使用 `document`、`window` 等 DOM API

---

## 第六部分：性能策略

### 实例化渲染

所有同类型物体（地形 tile、单位、建筑）使用 Instance Rendering：

```typescript
class InstancedMesh {
  private maxInstances: number;
  private instanceBuffer: GPUBuffer;
  private instanceCount: number = 0;

  addInstance(data: InstanceData) {
    if (this.instanceCount >= this.maxInstances) {
      this.grow();
    }
    this.writeInstance(this.instanceCount++, data);
  }

  removeInstance(index: number) {
    // 与最后一个交换，保持紧凑
    this.swapWithLast(index);
    this.instanceCount--;
  }

  draw(encoder: GPURenderPassEncoder) {
    encoder.drawIndexed(this.indexCount, this.instanceCount);
  }
}
```

### LOD (Level of Detail)

```typescript
export class LODMesh {
  levels: Mesh[] = [];
  distances: number[] = []; // [10, 30, 60, 100] - 切换距离阈值

  getLevel(cameraDistance: number): Mesh {
    for (let i = this.distances.length - 1; i >= 0; i--) {
      if (cameraDistance >= this.distances[i]) {
        return this.levels[i];
      }
    }
    return this.levels[0];
  }
}
```

### 渲染图裁剪

```typescript
export class CullingPass extends RenderPass {
  execute(context: RenderContext) {
    const camera = context.camera;
    const frustum = camera.getFrustum();

    context.visibleEntities = [];

    for (const entity of context.scene.entities) {
      const bounds = entity.getBoundingBox();
      if (frustum.intersects(bounds)) {
        context.visibleEntities.push(entity);
      }
    }

    // 按 Pass 分类可见实体
    context.opaqueEntities = context.visibleEntities.filter((e) => e.material.opaque);
    context.transparentEntities = context.visibleEntities.filter((e) => !e.material.opaque);
  }
}
```

### 批处理 (Batching)

```typescript
export class BatchManager {
  batches: Map<string, Batch> = new Map();

  addToBatch(entity: MeshEntity) {
    const key = `${entity.material.id}:${entity.vertexFormat}`;

    if (!this.batches.has(key)) {
      this.batches.set(key, new Batch(key));
    }

    this.batches.get(key)!.add(entity);
  }

  flush(encoder: GPURenderPassEncoder) {
    for (const batch of this.batches.values()) {
      batch.draw(encoder);
    }
  }
}
```

---

## 附录：着色器 UBO 布局

### 统一 Uniform Buffer

```wgsl
// CameraUBO - 每个相机一个
struct CameraUBO {
  viewMatrix: mat4x4<f32>,
  projectionMatrix: mat4x4<f32>,
  viewProjectionMatrix: mat4x4<f32>,
  cameraPosition: vec3<f32>,
  padding1: f32,
  cameraDirection: vec3<f32>,
  padding2: f32,
}

// LightUBO - 每个光源一个
struct LightUBO {
  direction: vec3<f32>,
  padding1: f32,
  color: vec3<f32>,
  intensity: f32,
  ambient: f32,
  padding2: vec3<f32>,
}

// TerrainUBO - 全局地形参数
struct TerrainUBO {
  tileSize: f32,
  heightScale: f32,
  mapSize: vec2<f32>,
  time: f32,
}

// TimeUBO - 时间相关
struct TimeUBO {
  deltaTime: f32,
  totalTime: f32,
  frameCount: u32,
  padding: u32,
}
```

---

## 版本历史

| 版本  | 日期 | 描述         |
| ----- | ---- | ------------ |
| 1.0.0 | -    | 初始架构设计 |
