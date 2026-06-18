# gpu3d MVP-1 计划：自定义渲染架构 + 彩色三角形

> 目标：实现 Vue 3 `createRenderer` 自定义渲染器架构，在 apps/web 中渲染出彩色三角形。
> 每完成一个步骤更新本文档的状态标记。

---

## 步骤总览

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
| 11 | 端到端验证：build + dev | [x] | typecheck ✅ build ✅ lint ✅ format ✅ |

---

## 验证结果

- `pnpm -F @webcv6/gpu3d typecheck` ✅ 0 errors
- `pnpm -F @webcv6/gpu3d lint` ✅ 0 warnings, 0 errors
- `pnpm -F @webcv6/gpu3d format:check` ✅ all correct
- `pnpm -F @webcv6/web lint` ✅ 0 warnings, 0 errors
- `pnpm -F @webcv6/web format:check` ✅ all correct
- `pnpm -F @webcv6/web build` ✅ 389ms (vue-tsc + Vite 8 Rolldown)

---

## 步骤详情

### Step 1: gpu3d 项目基础设施
- ✅ 创建 `packages/gpu3d/tsconfig.json`（extends ../../tsconfig.base.json, types: ["@webgpu/types"]）
- ✅ 创建 `packages/gpu3d/.oxlintrc.json`
- ✅ 创建 `packages/gpu3d/.oxfmtrc.json`
- ✅ 更新 `packages/gpu3d/package.json`：devDependencies 使用 catalog: 协议，添加 vue + @webgpu/types
- ✅ 创建 src 目录结构：backend/scene/render/renderer/components/port/sim

### Step 2: @webcv6/core 最小可用骨架
- ✅ 创建 `packages/core/tsconfig.json`
- ✅ 创建 `packages/core/src/index.ts`（空导出占位）
- ✅ 创建 `packages/core/src/types/index.ts`、protocol/、utils/、constants/ 占位
- ✅ 确保 gpu3d 能正确引用 @webcv6/core

### Step 3: gpu3d/backend — WebGPU 设备初始化
- ✅ `src/backend/adapter.ts`：GPUAdapter 获取与适配
- ✅ `src/backend/device.ts`：GPUDevice 创建与配置
- ✅ `src/backend/context.ts`：GPUCanvasContext 配置（canvas.getContext('webgpu')）
- ✅ `src/backend/types.ts`：GPU 类型别名
- ✅ `src/backend/index.ts`：统一导出

### Step 4: gpu3d/scene — 原生场景树节点
- ✅ `src/scene/node.ts`：SceneNode 类（id、parent、children、gpuResources、insertBefore/removeChild）
- ✅ `src/scene/scene.ts`：Scene 根节点（管理节点树、dispose 递归销毁）
- ✅ `src/scene/index.ts`：统一导出

### Step 5: gpu3d/render — RenderGraph + RenderLoop
- ✅ `src/render/render-loop.ts`：requestAnimationFrame 循环，脱离 Vue 运行
- ✅ `src/render/render-pass.ts`：RenderPass 抽象接口
- ✅ `src/render/passes/triangle-pass.ts`：三角形渲染 Pass（含 vertex buffer + pipeline）
- ✅ `src/render/index.ts`：统一导出

### Step 6: gpu3d/shaders — 彩色三角形 WGSL
- ✅ 着色器代码内联在 TrianglePass.init() 中
- ✅ 顶点着色器：3 顶点 + 顶点颜色（position vec2f + color vec3f）
- ✅ 片元着色器：插值颜色输出

### Step 7: gpu3d Vue createRenderer 自定义渲染器
- ✅ `src/renderer/host-node.ts`：ContainerHostNode/ElementHostNode/TextHostNode
- ✅ `src/renderer/host-env.ts`：RendererOptions 实现（createElement、patchProp、insert、remove 等）
- ✅ `src/renderer/create-renderer.ts`：createRenderer 封装 + createGpuApp 工厂函数
- ✅ `src/renderer/index.ts`：统一导出

### Step 8: gpu3d 声明式组件
- ✅ `src/components/gpu-canvas.ts`：GpuCanvas defineComponent（初始化 device、context、RenderLoop）
- ✅ `src/components/gpu-triangle.ts`：GpuTriangle defineComponent（声明式三角形）
- ✅ `src/components/index.ts`：统一导出

### Step 9: gpu3d 统一导出
- ✅ `src/index.ts`：导出 createGpuApp、GpuCanvas、GpuTriangle、backend/scene/render API
- ✅ `src/port/index.ts`：占位
- ✅ `src/sim/index.ts`：占位

### Step 10: apps/web 集成
- ✅ 创建 `apps/web/src/views/SceneView.vue`：使用 GpuCanvas 渲染彩色三角形
- ✅ 更新 router 添加 /scene 路由
- ✅ HomeView 添加导航到 SceneView 的入口

### Step 11: 端到端验证
- ✅ gpu3d typecheck 通过（0 errors）
- ✅ gpu3d lint 0 warnings, 0 errors
- ✅ gpu3d format:check all correct
- ✅ web lint 0 warnings, 0 errors
- ✅ web format:check all correct
- ✅ web build 389ms 通过
- ⏳ dev server 渲染验证（需浏览器访问）

---

## 修复记录

- `context.ts`：`canvas.getContext('webgpu')` 需要类型断言为 `GPUCanvasContext | null`，不能用 `RenderingContext`
- `GPUBufferUsage`：TS6 lib.dom.d.ts 不含 WebGPU 类型，需安装 `@webgpu/types` 并在 tsconfig types 中声明
- `apps/web` 也需添加 `@webgpu/types` 到 tsconfig.types 和 devDependencies
- gpu3d/.oxlintrc.json：关闭 unicorn/no-null、no-zero-fractions、capitalized-comments 等与 GPU 代码冲突的规则

---

## 架构关键决策

1. **Vue createRenderer 而非 JSX**：使用 Vue 模板/SFC + 自定义渲染器，保持 Vue 生态兼容性
2. **双树架构**：Vue VNode Tree 操作 HostNode，HostNode 映射到 SceneNode（原生场景树），RenderLoop 直接遍历场景树
3. **GpuCanvas 使用标准 defineComponent**：canvas 元素本身是 DOM 元素，只有子组件走 GPU 渲染器
4. **着色器内联**：MVP-1 阶段 WGSL 直接内联在 TypeScript 中，不单独建 .wgsl 文件
5. **@webgpu/types 补充**：TypeScript 6.0 的 lib.dom.d.ts 不含完整 WebGPU 类型定义
