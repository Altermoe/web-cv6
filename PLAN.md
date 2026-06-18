# gpu3d 开发计划

| 阶段 | 状态 | 范围 |
|------|------|------|
| MVP-1 | ✅ 完成 | 自定义渲染架构 + 硬编码彩色三角形 |
| MVP-2 | ✅ 完成 | 真正的 createRenderer 驱动 + GPU 资源解耦 |

---

## MVP-1：自定义渲染架构 + 彩色三角形 ✅ 完成

**目标**：实现 Vue 3 `createRenderer` 自定义渲染器架构，在 apps/web 中渲染出彩色三角形。

| # | 步骤 | 状态 | 说明 |
|---|------|------|------|
| 1 | gpu3d 项目基础设施 | [x] | tsconfig、.oxlintrc.json、.oxfmtrc.json、目录结构 |
| 2 | @webcv6/core 最小可用骨架 | [x] | 空导出占位，供 gpu3d 依赖 |
| 3 | gpu3d/backend：WebGPU 设备初始化 | [x] | GPUDevice 获取、配置、错误处理 |
| 4 | gpu3d/scene：原生场景树节点 | [x] | SceneNode、Scene 根节点 |
| 5 | gpu3d/render：RenderGraph + RenderLoop | [x] | 渲染循环、Pass 抽象 |
| 6 | gpu3d/shaders：彩色三角形 WGSL | [x] | 顶点+片元着色器（内联在 TrianglePass 中） |
| 7 | gpu3d Vue createRenderer 自定义渲染器 | [x] | HostNode、createElement、patchProp、insert/remove、mount/unmount |
| 8 | gpu3d 声明式组件：GpuCanvas + GpuTriangle | [x] | Vue SFC 组件包装 |
| 9 | gpu3d/index.ts 统一导出 | [x] | 对外 API facade |
| 10 | apps/web 集成：SceneView 页面 | [x] | 路由 + 导航 + GpuCanvas 渲染三角形 |
| 11 | 端到端验证：build + dev | [x] | typecheck ✅ build ✅ lint ✅ format ✅ 浏览器渲染 ✅ |

**MVP-1 验证结果**：
- gpu3d typecheck ✅ 0 errors
- gpu3d lint ✅ 0 warnings, 0 errors
- gpu3d format:check ✅ all correct
- web lint ✅ 0 warnings, 0 errors
- web format:check ✅ all correct
- web build ✅ 389ms
- **浏览器渲染验证 ✅**：彩色三角形完美渲染

**MVP-1 局限**：
1. 三角形数据硬编码在 gpu3d 库内（TrianglePass 中的 vertex buffer）
2. createRenderer 定义了接口，但 GpuCanvas 仍使用标准 defineComponent，未真正驱动自定义渲染
3. 高频资源（vertex data）无法响应式更新

---

## MVP-2：真正的 createRenderer 架构 + 资源解耦

**目标**：将硬编码的 GPU 资源解耦，低频资源架构为组件，高频资源架构为属性/状态。GpuCanvas 拦截 slot children，通过 createRenderer 渲染 GPU 元素树。

**核心改造**：
1. **移除硬编码**：TrianglePass 不再内联 vertex buffer 和 pipeline
2. **GPU 元素类型**：定义 `gpu-pipeline`、`gpu-vertex-buffer`、`gpu-draw` 等自定义元素类型
3. **真正的 createRenderer**：createElement/patchProp/insert/remove 驱动 GPU 资源创建与更新
4. **高频更新**：patchProp 拦截 data 属性变化，调用 `device.queue.writeBuffer` 增量更新
5. **场景树驱动**：RenderLoop 从 SceneNode 树读取 pipeline/buffer/draw 配置，不再使用固定 Pass 列表

---

| # | 步骤 | 状态 | 说明 |
|---|------|------|------|
| MVP2-1 | 更新架构文档（architecture.md） | [x] | 反映 createRenderer 驱动架构 + 元素类型定义 |
| MVP2-2 | 扩展 HostNode 类型系统 | [x] | 新增 PipelineNode/VertexBufferNode/DrawNode 等类型 |
| MVP2-3 | 实现 createElement（GPU 元素创建） | [x] | 根据 type 创建对应 GPU 资源节点 |
| MVP2-4 | 实现 patchProp（高频更新） | [x] | `data` 属性 → writeBuffer，`code`/`format` → pipeline 重建 |
| MVP2-5 | 实现 insert/remove（场景树管理） | [x] | insertBefore/removeChild 驱动 SceneNode 操作 |
| MVP2-6 | GpuCanvas 拦截 slot children | [x] | watchEffect 监听 slot 变化，调用 gpuRender |
| MVP2-7 | 移除 TrianglePass 硬编码 | [x] | 改为从 SceneNode 树动态读取配置 |
| MVP2-8 | RenderLoop 场景树遍历 | [x] | 深度遍历 SceneNode，执行所有 DrawNode |
| MVP2-9 | apps/web API 更新 | [x] | 使用新的声明式 API（gpu-pipeline 等） |
| MVP2-10 | 端到端验证：响应式三角形 | [x] | color/position 响应式更新，vertex 数据实时刷新 |

---

### MVP-2 设计要点

**GPU 元素类型（由 createElement 处理）**：
- `gpu-pipeline`：GPURenderPipeline（低频），通过 `vertex-code`、`fragment-code`、`topology`、`format` props 创建
- `gpu-vertex-buffer`：GPUBuffer（Buffer 低频，Data 高频），`size`/`usage` 创建 buffer，`data` prop → writeBuffer
- `gpu-uniform-buffer`：GPUBuffer（Buffer 低频，Data 高频），`data` prop → writeBuffer
- `gpu-draw`：Draw 命令（高频），`vertexCount`、`instanceCount` prop 每帧读取
- `gpu-texture`：GPUTexture（低频），后续扩展

**低频 vs 高频资源划分**：
| 资源类型 | 更新频率 | 架构方式 | 示例 |
|---|---|---|---|
| Pipeline (GPURenderPipeline) | 低 | 组件级 | gpu-pipeline 元素 |
| Buffer 分配 (GPUBuffer size/usage) | 低 | 组件级 | gpu-vertex-buffer size |
| Buffer 数据 (vertex/uniform) | 高 | 属性/状态 | gpu-vertex-buffer data prop |
| Draw 参数 (vertexCount) | 高 | 属性/状态 | gpu-draw vertexCount prop |

**GpuCanvas 架构改造**：
```typescript
export const GpuCanvas = defineComponent({
  props: { width: Number, height: Number },
  setup(props, { slots }) {
    const canvasRef = ref<HTMLCanvasElement>()
    let gpuContainer: GpuContainer | null = null
    let renderLoop: RenderLoop | null = null

    onMounted(async () => {
      const canvas = canvasRef.value!
      const device = await createDevice()
      const format = navigator.gpu.getPreferredCanvasFormat()
      const context = configureCanvasContext(canvas, device, format)

      gpuContainer = new GpuContainer(device, context, format)
      const scene = gpuContainer.getScene()
      renderLoop = new RenderLoop(device, context, scene)
      renderLoop.start()

      // 拦截 slot children，用 GPU renderer 处理
      watchEffect(() => {
        const vnodes = slots.default?.() ?? []
        gpuRender(vnodes, gpuContainer)
      })
    })

    onUnmounted(() => {
      renderLoop?.stop()
      gpuContainer?.dispose()
    })

    return () => h('canvas', { ref: canvasRef, width: props.width, height: props.height })
  },
})
```

**用户 API 目标（在 apps/web）**：
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
import { GpuCanvas } from '@webcv6/gpu3d'
import { ref, reactive } from 'vue'

const vertShader = `...`
const fragShader = `...`
const format = 'bgra8unorm'

// 响应式顶点数据
const vertices = ref(new Float32Array([
  0, 0.5,  1, 0, 0,
  -0.5, -0.5, 0, 1, 0,
  0.5, -0.5, 0, 0, 1,
]))

const vertexLayout = {
  arrayStride: 20,
  attributes: [
    { shaderLocation: 0, offset: 0, format: 'float32x2' },
    { shaderLocation: 1, offset: 8, format: 'float32x3' },
  ],
}

// 响应式更新（高频）
vertices.value[0] = 0.1 // 触发 patchProp → writeBuffer
</script>
```

**核心流程**：
1. `GpuCanvas` 渲染 DOM `<canvas>`，初始化 WebGPU device/context
2. `watchEffect` 捕获 slot children（VNode 树）
3. `gpuRender(vnodes, container)` 调用 createRenderer 的 `render()` 函数
4. Vue 自定义渲染器处理 VNode 树：
   - `createElement('gpu-pipeline', props)` → 创建 PipelineNode
   - `createElement('gpu-vertex-buffer', props)` → 创建 VertexBufferNode
   - `createElement('gpu-draw', props)` → 创建 DrawNode
5. `insert/remove` 维护 HostNode/SceneNode 双树结构
6. RenderLoop 深度遍历 SceneNode，读取配置并执行 draw calls

---

### MVP-2 验收标准

- [x] GpuCanvas 拦截 slot children 成功
- [x] `gpuRender` 能正确渲染 GPU 元素树到 canvas
- [x] `createElement` 创建的 PipelineNode/VertexBufferNode/DrawNode 正确映射到 GPU 资源
- [x] `patchProp` 拦截 `data` 属性变化并调用 `writeBuffer`
- [x] 修改响应式 vertices 后，canvas 中三角形实时更新
- [x] typecheck/lint/format/build 全量通过
- [x] 浏览器渲染验证：响应式三角形正常工作

**MVP-2 验证结果**：
- gpu3d typecheck ✅ 0 errors
- gpu3d lint ✅ 0 warnings, 0 errors
- gpu3d format:check ✅ all correct
- web typecheck ✅ 0 errors
- web lint ✅ 0 warnings, 0 errors
- web format:check ✅ all correct
- web build ✅ 419ms, SceneView 10.18 kB
- **浏览器渲染验证 ✅**：彩色三角形正常渲染

---

## 后续 MVP 规划（未开始）

### MVP-3：材质系统 + Uniform Buffer
- gpu-uniform-buffer 元素
- bind group 管理
- PBR 基础材质

### MVP-4：纹理加载 + 实例化渲染
- gpu-texture 元素
- 实例化 vertex buffer
- MVP 风格地形渲染

### MVP-5：相机控制 + 交互
- PerspectiveCamera 元素
- OrbitControls（基于 InputPort）
- 拾取/射线检测

---

## 附录：MVP-1 修复记录

- `context.ts`：`canvas.getContext('webgpu')` 需要类型断言为 `GPUCanvasContext | null`
- `GPUBufferUsage`：TS6 lib.dom.d.ts 不含 WebGPU 类型，需安装 `@webgpu/types` 并在 tsconfig types 中声明
- `apps/web` 也需添加 `@webgpu/types` 到 tsconfig.types 和 devDependencies
- gpu3d/.oxlintrc.json：关闭 unicorn/no-null、no-zero-fractions、capitalized-comments 等与 GPU 代码冲突的规则

---

## 附录：MVP-2 修复记录

### 1. 自定义元素属性名 kebab → camel 未归一化（核心 bug）

**症状**：浏览器控制台每帧刷屏 `Entry point "vertexMain" doesn't exist in the shader module`，重复 250+ 次后浏览器触发 `WebGPU: too many warnings` 上限。

**根因**：Vue 模板编译器对 `createRenderer` 创建的**自定义元素**（既非 Vue 组件也非保留 HTML 元素，如 `<gpu-pipeline>`、`<gpu-draw>`）**不会自动把 kebab-case 转 camelCase**——通过查看 `apps/web/dist/assets/SceneView-*.js` 编译产物可确认：

```js
s(`gpu-pipeline`,{"vertex-code":L,"fragment-code":R,topology:`triangle-list`,format:o(a)}, ...)
s(`gpu-draw`,{"vertex-count":3}, null, -1)
```

而 `hostEnv.patchProp` 所有判断写的是 camelCase（`key === "vertexCode"` 等），永远不匹配 → `PipelineNode.vertexCode/fragmentCode` 保持默认空串 → `createShaderModule({ code: "" })` 产出的 module 不含 `vertexMain` → `createRenderPipeline` 报 EntryPoint 错误。

**修复**：`hostEnv.patchProp` 入口加 `camelizeKey()` 归一化，模板写 `vertex-code` 或 `vertexCode` 都能命中。

### 2. 管线构建失败时每帧持续报错（健壮性 bug）

**症状**：根因 #1 触发后，`RenderLoop` 每帧 `setPipeline(invalidPipeline)` 持续刷屏，浏览器报 250+ 次。

**根因**：`PipelineNode.buildPipeline` 未捕获 `createRenderPipeline` 异常，且 `RenderLoop.renderNode` 不区分管线是否可用。

**修复**：
- `PipelineNode.buildPipeline` 用 try/catch 包裹，失败时 `console.error` 一次性输出原因，并把 `sceneNode.skipDraw = true`
- `SceneNode` 新增 `skipDraw` 字段
- `RenderLoop.renderNode` 入口检查 `skipDraw`，命中则跳过本节点及子树

### 3. MVP-2 阶段文件清单

| 文件 | 变更 |
|---|---|
| `packages/gpu3d/src/renderer/host-env.ts` | 加 `camelizeKey()` 工具；`patchProp` 用归一化 key 匹配；显式 `void` 丢弃 `rebuildPipeline` 返回值 |
| `packages/gpu3d/src/renderer/host-node.ts` | `PipelineNode.buildPipeline` 加 try/catch + 防御性空字符串检查，返回 boolean；`rebuildPipeline` 透传 boolean |
| `packages/gpu3d/src/scence/node.ts` | 新增 `skipDraw` 字段，`dispose` 时重置 |
| `packages/gpu3d/src/render/render-loop.ts` | `renderNode` 入口检查 `skipDraw` 跳过无效管线 |
| `apps/web/src/views/SceneView.vue` | 切换为声明式 API（`<gpu-pipeline>`、`<gpu-vertex-buffer>`、`<gpu-draw>`） |
| `packages/gpu3d/docs/architecture.md` | 同步更新 createRenderer 驱动架构文档 |

---

## 架构关键决策

1. **Vue createRenderer 而非 JSX**：使用 Vue 模板/SFC + 自定义渲染器，保持 Vue 生态兼容性
2. **双树架构**：Vue VNode Tree 操作 HostNode，HostNode 映射到 SceneNode（原生场景树），RenderLoop 直接遍历场景树
3. **GpuCanvas 使用标准 defineComponent**：canvas 元素本身是 DOM 元素，只有子组件走 GPU 渲染器
4. **低频资源 → 组件，高频资源 → 属性**：Pipeline/Buffer 创建是低频（组件），Buffer 数据更新是高频（patchProp → writeBuffer）
5. **@webgpu/types 补充**：TypeScript 6.0 的 lib.dom.d.ts 不含完整 WebGPU 类型定义