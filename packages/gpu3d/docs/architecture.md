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
3. 创建 `GpuContainer`（GPU 渲染器容器）
4. 通过 `watchEffect` 拦截 slot children，调用 `gpuRender` 渲染

```typescript
export const GpuCanvas = defineComponent({
  props: { width: Number, height: Number },
  setup(props, { slots }) {
    const canvasRef = ref<HTMLCanvasElement>();
    let gpuContainer: GpuContainer | null = null;
    let renderLoop: RenderLoop | null = null;

    onMounted(async () => {
      const canvas = canvasRef.value!;
      const device = await createDevice();
      const format = navigator.gpu.getPreferredCanvasFormat();
      const context = configureCanvasContext(canvas, device, format);

      gpuContainer = new GpuContainer(device, context, format);
      renderLoop = new RenderLoop(device, context, gpuContainer.getScene());
      renderLoop.start();

      // 核心：拦截 slot，用 GPU renderer 渲染
      watchEffect(() => {
        const vnodes = slots.default?.() ?? [];
        gpuRender(vnodes, gpuContainer);
      });
    });

    onUnmounted(() => {
      renderLoop?.stop();
      gpuContainer?.dispose();
    });

    // 只渲染 canvas DOM 元素，不渲染 slot children
    return () => h("canvas", { ref: canvasRef, width: props.width, height: props.height });
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

```typescript
patchProp(el: GpuHostNode, key: string, prev: unknown, next: unknown): void {
  if (el instanceof VertexBufferNode && key === 'data') {
    // 高频路径：增量更新 vertex data
    el.writeData(next as Float32Array)
    return
  }
  if (el instanceof UniformBufferNode && key === 'data') {
    // 高频路径：增量更新 uniform data
    el.writeData(next as Float32Array)
    return
  }
  if (el instanceof PipelineNode && (key === 'vertexCode' || key === 'fragmentCode')) {
    // 低频路径：重建 pipeline（shader 变化）
    el.rebuildPipeline(next)
    return
  }
  if (el instanceof DrawNode && (key === 'vertexCount' || key === 'instanceCount')) {
    // 高频路径：更新 draw 参数
    el[key] = next
    return
  }
  // 通用属性存储
  el.props[key] = next
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
  buildPipeline(device: GPUDevice): void;
  rebuildPipeline(code: string): void;

  dispose(): void; // pipeline.destroy()
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
    if (node.pipeline) {
      encoder.setPipeline(node.pipeline);
    }
    if (node.vertexBuffer && node.vertexLayout) {
      const bufferIndex = this.findBufferIndex(node);
      encoder.setVertexBuffer(bufferIndex, node.vertexBuffer);
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

## 第七部分：用户 API

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

## 第八部分：子模块职责

### backend 模块

`src/backend/` — 封装 WebGPU 底层 API

- `adapter.ts`：GPUAdapter 获取
- `device.ts`：GPUDevice 创建
- `context.ts`：GPUCanvasContext 配置
- `types.ts`：GPU 类型别名

### scene 模块

`src/scene/` — 原生场景树

- `node.ts`：SceneNode 类（parent/children/gpuResources/pipeline/buffer/drawParams）
- `scene.ts`：Scene 根节点（遍历、dispose）

### render 模块

`src/render/` — 渲染循环

- `render-loop.ts`：rAF 循环，深度遍历场景树执行 draw calls
- `render-pass.ts`：RenderPass 抽象（保留，后续扩展用）

### renderer 模块

`src/renderer/` — Vue createRenderer 自定义渲染器

- `host-node.ts`：GpuHostNode 体系（GpuContainer/PipelineNode/VertexBufferNode/DrawNode/TextHostNode）
- `host-env.ts`：RendererOptions 实现（createElement/patchProp/insert/remove/setElementText/parentNode等）
- `create-renderer.ts`：createRenderer 封装 + gpuRender + createGpuApp
- `index.ts`：统一导出

### components 模块

`src/components/` — Vue 组件（DOM 层桥梁）

- `gpu-canvas.ts`：GpuCanvas defineComponent（唯一使用 DOM 渲染器的组件）

---

## 版本历史

| 版本  | 日期       | 描述                                                           |
| ----- | ---------- | -------------------------------------------------------------- |
| 1.0.0 | -          | 初始架构设计                                                   |
| 2.0.0 | 2026-06-18 | MVP-2 架构重构：双渲染器架构、GPU 元素类型体系、场景树驱动渲染 |
