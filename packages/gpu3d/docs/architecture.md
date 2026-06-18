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
┌──────────────────────────────────────────────────────────────────┐
│                    DOM Layer (Vue DOM Renderer)                   │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  <GpuCanvas> → 渲染 <canvas> DOM 元素                      │   │
│  │  拦截 slot children → 传递给 GPU Renderer                  │   │
│  └────────────────────────────────────────────────────────────┘   │
│                              │ slots.default()                    │
│                              ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │         GPU Layer (Vue createRenderer)                      │   │
│  │  <gpu-pipeline> <gpu-vertex-buffer> <gpu-draw> ...         │   │
│  │  createElement → GPU 资源节点                                │   │
│  │  patchProp → writeBuffer (高频更新)                         │   │
│  │  insert/remove → SceneNode 树管理                           │   │
│  └────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬───────────────────────────────────┘
                               │ mount 时一次性初始化 + patchProp 增量
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Native Layer (Imperative)                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Scene Graph    │  │  Draw Commands  │  │  Render Loop    │  │
│  │  (SceneNode)    │──│  (per-node)     │──│  (rAF)          │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                        WebGPU Layer                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Device   │  │ Buffer   │  │ Texture  │  │ Pipeline │         │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘         │
└──────────────────────────────────────────────────────────────────┘
```

---

## 第一部分：双渲染器架构

### DOM 渲染器 + GPU 渲染器协作

gpu3d 采用**双渲染器架构**：DOM 渲染器负责 `<canvas>` 元素，GPU 渲染器负责 canvas 内的所有 GPU 资源。

```
┌─────────────────────────────────────────────────────────┐
│  Vue DOM Renderer                                        │
│    <GpuCanvas>  ← defineComponent，渲染 <canvas> DOM     │
│         │                                                │
│         │ slots.default() → VNode[]                      │
│         ▼                                                │
│  Vue GPU Renderer (createRenderer)                       │
│    <gpu-pipeline>       → PipelineNode                   │
│    <gpu-vertex-buffer>  → VertexBufferNode               │
│    <gpu-draw>           → DrawNode                       │
└─────────────────────────────────────────────────────────┘
```

### GpuCanvas：DOM-GPU 桥梁

`GpuCanvas` 是唯一使用 DOM 渲染器的组件，它：

1. 渲染 `<canvas>` DOM 元素
2. 初始化 WebGPU device/context
3. 创建 `GpuContainer`（GPU 渲染器容器，持有 scene 引用）
4. 启动 `RenderLoop`（独立于 Vue 响应式的 rAF 循环）
5. 通过 `watchEffect` 拦截 slot children，调用 `gpuRender` 渲染

```typescript
export const GpuCanvas = defineComponent({
  props: { width: Number, height: Number },
  setup(props, { slots }) {
    const canvasRef = ref<HTMLCanvasElement>();
    const gpuContainerRef = ref<GpuContainer | null>(null);
    let renderLoop: RenderLoop | null = null;
    let device: GPUDevice | null = null;

    watchEffect(() => {
      const container = gpuContainerRef.value;
      if (!container) return;
      const vnodes = slots.default?.() ?? [];
      gpuRender(h(Fragment, null, vnodes), container);
    });

    onMounted(async () => {
      const canvas = canvasRef.value!;
      device = await createDevice();
      const format = navigator.gpu.getPreferredCanvasFormat();
      const context = configureCanvasContext(canvas, device, format);

      const scene = new Scene();
      renderLoop = new RenderLoop(device, context, scene.root);
      renderLoop.start();

      // 创建容器后赋值给 ref，触发 watchEffect
      gpuContainerRef.value = new GpuContainer(device, context, format, scene);
    });

    onUnmounted(() => {
      renderLoop?.stop();
      gpuContainerRef.value?.dispose();
      device?.destroy();
    });

    return () =>
      h("canvas", {
        ref: canvasRef,
        width: props.width,
        height: props.height,
      });
  },
});
```

### gpuRender：GPU 渲染器入口

`gpuRender` 是由 `createRenderer` 返回的 `render` 函数，它处理 VNode 树并调用对应的 HostNode 操作。

```typescript
const { render: gpuRender, createApp: createGpuApp } = createRenderer(hostEnv);
```

---

## 第二部分：GPU 元素类型体系

### 低频资源 → 组件级元素

低频资源在 mount 时创建，unmount 时销毁，生命周期等同于组件。

| 元素类型             | GPU 资源            | 创建时机 | 销毁时机                     |
| -------------------- | ------------------- | -------- | ---------------------------- |
| `gpu-pipeline`       | GPURenderPipeline   | mount    | unmount → pipeline.destroy() |
| `gpu-vertex-buffer`  | GPUBuffer (VERTEX)  | mount    | unmount → buffer.destroy()   |
| `gpu-uniform-buffer` | GPUBuffer (UNIFORM) | mount    | unmount → buffer.destroy()   |
| `gpu-texture`        | GPUTexture          | mount    | unmount → texture.destroy()  |

### 高频资源 → 属性级更新

高频资源通过 `patchProp` 拦截变化，调用 `device.queue.writeBuffer` 增量更新。

| 元素类型             | 高频属性                    | 更新机制                  | 调用                                        |
| -------------------- | --------------------------- | ------------------------- | ------------------------------------------- |
| `gpu-vertex-buffer`  | `data`                      | patchProp → writeBuffer   | `device.queue.writeBuffer(buffer, 0, data)` |
| `gpu-uniform-buffer` | `data`                      | patchProp → writeBuffer   | `device.queue.writeBuffer(buffer, 0, data)` |
| `gpu-draw`           | `vertexCount`               | patchProp → 更新节点属性  | 直接修改 DrawNode.vertexCount               |
| `gpu-pipeline`       | `vertexCode`/`fragmentCode` | patchProp → 重建 pipeline | 重新 createRenderPipeline                   |

### createElement 映射

```typescript
createElement(type: string, ...): GpuHostNode {
  switch (type) {
    case 'gpu-pipeline':
      return new PipelineNode()       // 占位，mount 时创建真实 pipeline
    case 'gpu-vertex-buffer':
      return new VertexBufferNode()   // 占位，mount 时创建真实 buffer
    case 'gpu-uniform-buffer':
      return new UniformBufferNode()  // 占位，mount 时创建真实 buffer
    case 'gpu-draw':
      return new DrawNode()           // 纯数据节点，无 GPU 资源
    default:
      throw new Error(`Unknown GPU element type: ${type}`)
  }
}
```

### patchProp 映射

`patchProp` 是连接 Vue 响应式系统与 GPU 资源的**核心入口**。需要注意：自定义元素（既非 Vue 组件也非保留 HTML 元素）的属性名在模板编译时**不会**自动从 kebab-case 转 camelCase——`patchProp` 入口必须先归一化才能命中具体节点属性的 camelCase 约定（详见第七部分「自定义元素属性名归一化」）。

```typescript
/**
 * 将 kebab-case 字符串转换为 camelCase
 * "vertex-code" -> "vertexCode"
 */
function camelizeKey(key: string): string {
  if (!key.includes("-")) return key;
  return key.replace(/-(?<c>[a-z])/g, (_, c: string) => c.toUpperCase());
}

patchProp(el: GpuHostNode, key: string, prev: unknown, next: unknown): void {
  const normalizedKey = camelizeKey(key);

  // gpu-vertex-buffer:data (高频) → 增量写 buffer
  if (el instanceof VertexBufferNode && normalizedKey === "data") {
    el.writeData(next as Float32Array);
    return;
  }

  // gpu-pipeline:vertexCode/fragmentCode/topology/format (低频) → 重建 pipeline
  if (el instanceof PipelineNode) {
    if (normalizedKey === "vertexCode" || normalizedKey === "fragmentCode" ||
        normalizedKey === "topology"   || normalizedKey === "format") {
      // 赋值并按需重建（rebuild 内部用 try/catch 保护，失败时设置 skipDraw）
      // ...
      return;
    }
  }

  // gpu-draw:vertexCount/instanceCount (高频) → 同步到 SceneNode
  if (el instanceof DrawNode) {
    if (normalizedKey === "vertexCount" || normalizedKey === "instanceCount") {
      el[normalizedKey] = next as number;
      el.updateDrawParams();
      return;
    }
  }

  // 通用属性兜底
  el.props[normalizedKey] = next;
}
```

---

## 第三部分：HostNode 类型系统

### 类型层级

```typescript
// 基础类型
abstract class GpuHostNode {
  type: string;
  sceneNode: SceneNode;
  props: Record<string, unknown> = {};
  parent: GpuHostNode | null = null;
  children: GpuHostNode[] = [];
}

// 容器节点（GpuCanvas 对应）
class GpuContainer extends GpuHostNode {
  readonly type = "container";
  device: GPUDevice;
  context: GPUCanvasContext;
  format: GPUTextureFormat;
  scene: Scene;
}

// Pipeline 节点
class PipelineNode extends GpuHostNode {
  readonly type = "gpu-pipeline";
  pipeline: GPURenderPipeline | null = null;
  vertexCode: string = "";
  fragmentCode: string = "";
  topology: GPUPrimitiveTopology = "triangle-list";
  format: GPUTextureFormat = "bgra8unorm";

  // 从 device + props 构建真实 pipeline
  // 内部用 try/catch 保护：shader 编译错误或 entry point 缺失时
  // 设置 sceneNode.skipDraw = true 并 console.error，避免每帧刷屏
  buildPipeline(device: GPUDevice): boolean;

  // 当 vertexCode/fragmentCode/topology/format 变化时重建
  rebuildPipeline(): boolean;

  dispose(): void; // GPURenderPipeline 无 destroy()，置 null 即可由 GC 回收
}

// Vertex Buffer 节点
class VertexBufferNode extends GpuHostNode {
  readonly type = "gpu-vertex-buffer";
  buffer: GPUBuffer | null = null;
  layout: GPUVertexBufferLayout;
  data: Float32Array;

  // 高频更新：writeBuffer
  writeData(data: Float32Array): void;

  // 从 device + props 创建真实 buffer
  buildBuffer(device: GPUDevice): void;

  dispose(): void; // buffer.destroy()
}

// Draw 命令节点
class DrawNode extends GpuHostNode {
  readonly type = "gpu-draw";
  vertexCount: number = 0;
  instanceCount: number = 1;
  firstVertex: number = 0;
  firstInstance: number = 0;
}
```

---

## 第四部分：场景树与渲染循环

### SceneNode 扩展

SceneNode 存储渲染所需的关键信息，RenderLoop 直接遍历场景树执行 draw calls。

```typescript
class SceneNode {
  type: string; // 'gpu-pipeline' | 'gpu-vertex-buffer' | 'gpu-draw' | ...
  gpuResources: Map<string, GPUObjectBase>;

  // 渲染相关数据（由 HostNode 同步过来）
  pipeline: GPURenderPipeline | null;
  vertexBuffer: GPUBuffer | null;
  vertexLayout: GPUVertexBufferLayout | null;
  drawParams: { vertexCount: number; instanceCount: number } | null;

  // 管线不可用标记（shader 编译失败、entry point 缺失等）
  // RenderLoop 遇到此标志会跳过本节点及子树的 setPipeline/draw，
  // 避免每帧刷 WebGPU 校验错误日志
  skipDraw: boolean;
}
```

### RenderLoop：场景树驱动渲染

RenderLoop 不再持有固定 Pass 列表，而是深度遍历 SceneNode 树，根据节点类型执行对应操作：

```typescript
class RenderLoop {
  private frame(): void {
    const encoder = this.device.createCommandEncoder();
    const textureView = this.context.getCurrentTexture().createView();

    const passEncoder = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0.05, g: 0.05, b: 0.08, a: 1.0 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });

    // 深度遍历场景树
    this.renderNode(this.scene.root, passEncoder);

    passEncoder.end();
    this.device.queue.submit([encoder.finish()]);
    this.rafId = requestAnimationFrame(this.frame);
  }

  private renderNode(node: SceneNode, encoder: GPURenderPassEncoder): void {
    // 跳过无效 pipeline 节点及子树（避免每帧重复触发 WebGPU 校验错误）
    if (node.skipDraw) return;

    if (node.pipeline) {
      encoder.setPipeline(node.pipeline);
    }
    if (node.vertexBuffer && node.vertexLayout) {
      // MVP-2: 单 vertex buffer 场景固定使用 slot 0
      // TODO: 多 vertex buffer 场景需要计算 slot 索引
      encoder.setVertexBuffer(0, node.vertexBuffer);
    }
    if (node.drawParams) {
      encoder.draw(node.drawParams.vertexCount, node.drawParams.instanceCount);
    }

    // 递归渲染子节点
    for (const child of node.children) {
      this.renderNode(child, encoder);
    }
  }
}
```

---

## 第五部分：声明式资源管理

### Vue 生命周期映射

```
┌─────────────────────────────────────────────────────────────┐
│                     Vue Component Lifecycle                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  setup() ──> onMounted() ──> [patchProp x N] ──> onUnmounted│
│     │              │                    │                  │
│     ▼              ▼                    ▼                  │
│  创建响应式    createElement          remove              │
│  上下文        → buildPipeline()      → dispose()         │
│                → buildBuffer()         → pipeline.destroy │
│                                       → buffer.destroy   │
│                                                             │
│                       patchProp                              │
│                       → writeBuffer (高频)                   │
│                       → rebuildPipeline (低频)              │
└─────────────────────────────────────────────────────────────┘
```

### GPU 内存垃圾回收

每个 GpuHostNode 在 `remove` 时调用 `dispose()`，释放其持有的所有 GPU 资源。SceneNode 的 `dispose` 会递归销毁子节点。

```typescript
class PipelineNode extends GpuHostNode {
  dispose(): void {
    this.pipeline?.destroy();
    this.pipeline = null;
  }
}

class VertexBufferNode extends GpuHostNode {
  dispose(): void {
    this.buffer?.destroy();
    this.buffer = null;
  }
}
```

---

## 第六部分：数据驱动更新

### 响应式更新链路

```
Vue reactive data (ref/reactive)
        │
        ▼
  Vue VNode patch
        │
        ▼
  createRenderer.patchProp
        │
        ├── data prop (高频) ──> device.queue.writeBuffer
        │
        ├── vertexCount prop (高频) ──> DrawNode.vertexCount = next
        │
        └── code prop (低频) ──> pipeline.rebuild()
```

### 批量更新优化（未来）

```typescript
export class BatchUpdateManager {
  private pendingWrites: Map<GPUBuffer, ArrayBuffer> = new Map();

  scheduleWrite(buffer: GPUBuffer, data: ArrayBuffer) {
    this.pendingWrites.set(buffer, data);
  }

  flush(device: GPUDevice) {
    for (const [buffer, data] of this.pendingWrites) {
      device.queue.writeBuffer(buffer, 0, data);
    }
    this.pendingWrites.clear();
  }
}
```

---

## 第七部分：自定义元素属性名归一化

### 问题

`createRenderer` 创建的自定义元素（`<gpu-pipeline>`、`<gpu-vertex-buffer>`、`<gpu-draw>`）**既不是 Vue 组件也不是保留 HTML 元素**。Vue 模板编译器对它们的处理方式与对 Vue 组件不同——**不会自动把 kebab-case 转为 camelCase**。

可以通过查看 `apps/web/dist/assets/SceneView-*.js` 编译产物确认这一点：

```js
// 编译后
s(`gpu-pipeline`,{"vertex-code":L,"fragment-code":R,topology:`triangle-list`,format:o(a)}, ...)
s(`gpu-draw`,{"vertex-count":3}, null, -1)
```

而 Vue 组件会做这种转换——比如 `<MyComponent :some-prop="x" />` 编译后传给组件 setup 的 prop 名是 `someProp`。对自定义元素**不会**做这种转换，因为 Vue 模板编译器按 HTML 元素规范将属性原样保留。

### 后果

如果 `patchProp` 直接用 `key === "vertexCode"`（camelCase）匹配，永远不会命中从模板传过来的 `"vertex-code"`，导致 `vertexCode/fragmentCode` 等属性保持默认空串，shader 编译失败，每帧刷屏 `Entry point "vertexMain" doesn't exist` 错误。

### 修复

在 `patchProp` 入口先把 `key` 通过 `camelizeKey()` 归一化为 camelCase，再分发到具体节点属性的判断：

```typescript
function camelizeKey(key: string): string {
  if (!key.includes("-")) return key;
  return key.replace(/-(?<c>[a-z])/g, (_, c: string) => c.toUpperCase());
}

patchProp(el, key, prev, next) {
  const normalizedKey = camelizeKey(key);
  // 后续所有 key === "..." 判断都基于 normalizedKey
  // ...
}
```

这样用户在模板里写 `vertex-code` 或 `vertexCode` 都能命中，符合 Vue 模板的自然写法（kebab-case），同时内部节点属性保持 camelCase 命名的一致性。

---

## 第八部分：用户 API

### 声明式模板

```vue
<template>
  <GpuCanvas :width="800" :height="600">
    <gpu-pipeline
      :vertex-code="vertShader"
      :fragment-code="fragShader"
      topology="triangle-list"
      :format="format"
    >
      <gpu-vertex-buffer :data="vertices" :layout="vertexLayout" />
      <gpu-draw :vertex-count="3" />
    </gpu-pipeline>
  </GpuCanvas>
</template>

<script setup lang="ts">
import { GpuCanvas } from "@webcv6/gpu3d";
import { ref } from "vue";

const vertShader = `
  struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec3f,
  }
  @vertex
  fn vertexMain(
    @location(0) pos: vec2f,
    @location(1) col: vec3f,
  ) -> VertexOutput {
    var output: VertexOutput;
    output.position = vec4f(pos, 0.0, 1.0);
    output.color = col;
    return output;
  }
`;

const fragShader = `
  @fragment
  fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
    return vec4f(input.color, 1.0);
  }
`;

const format = navigator.gpu.getPreferredCanvasFormat();

const vertices = ref(new Float32Array([0, 0.5, 1, 0, 0, -0.5, -0.5, 0, 1, 0, 0.5, -0.5, 0, 0, 1]));

const vertexLayout = {
  arrayStride: 20,
  attributes: [
    { shaderLocation: 0, offset: 0, format: "float32x2" },
    { shaderLocation: 1, offset: 8, format: "float32x3" },
  ],
};

// 高频更新：修改 vertices.value 会触发 patchProp → writeBuffer
function updateTriangle() {
  vertices.value = new Float32Array([0.1, 0.6, 1, 0, 0, -0.4, -0.4, 0, 1, 0, 0.6, -0.4, 0, 0, 1]);
}
</script>
```

---

## 第九部分：子模块职责

### backend 模块

`src/backend/` — 封装 WebGPU 底层 API

- `adapter.ts`：GPUAdapter 获取
- `device.ts`：GPUDevice 创建
- `context.ts`：GPUCanvasContext 配置
- `types.ts`：GPU 类型别名

### scene 模块

`src/scene/` — 原生场景树

- `node.ts`：SceneNode 类（parent/children/gpuResources/pipeline/buffer/drawParams/skipDraw）
- `scene.ts`：Scene 根节点（遍历、dispose）

### render 模块

`src/render/` — 渲染循环

- `render-loop.ts`：rAF 循环，深度遍历场景树执行 draw calls
- `render-pass.ts`：RenderPass 抽象（保留，后续扩展用）

### renderer 模块

`src/renderer/` — Vue createRenderer 自定义渲染器

- `host-node.ts`：GpuHostNode 体系（GpuContainer/PipelineNode/VertexBufferNode/DrawNode/TextHostNode）
- `host-env.ts`：RendererOptions 实现（createElement/patchProp/insert/remove/setElementText/parentNode等）+ camelizeKey 工具
- `create-renderer.ts`：createRenderer 封装 + gpuRender + createGpuApp
- `index.ts`：统一导出

### components 模块

`src/components/` — Vue 组件（DOM 层桥梁）

- `gpu-canvas.ts`：GpuCanvas defineComponent（唯一使用 DOM 渲染器的组件）

---

## 第十部分：版本历史

| 版本  | 日期       | 描述                                                                                               |
| ----- | ---------- | -------------------------------------------------------------------------------------------------- |
| 1.0.0 | -          | 初始架构设计                                                                                       |
| 2.0.0 | 2026-06-18 | MVP-2 架构重构：双渲染器架构、GPU 元素类型体系、场景树驱动渲染                                     |
| 2.0.1 | 2026-06-18 | MVP-2 修复：patchProp kebab→camel 归一化、PipelineNode.buildPipeline 失败保护 + SceneNode.skipDraw |
