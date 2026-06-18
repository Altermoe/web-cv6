# gpu3d (VGP - Vue Graphics Pipeline)

`@webcv6/gpu3d` 是 Web-CV6 项目的 3D 渲染核心子包，采用纯 WebGPU + WGSL 自研渲染引擎。通过 Vue 3 `createRenderer` 生态实现声明式资源管理与高性能运行时隔离。

## 设计理念

### 1. 声明式资源管理
利用 Vue 3 `createRenderer` 自定义渲染器构建，组件生命周期（mount/unmount）自动映射 WebGPU 资源的创建与销毁（Buffer, Texture, Pipeline）。实现低心智负担的 GPU 内存垃圾回收（GC）。

### 2. 高性能运行时隔离
Vue 只负责"资源声明与管线编排"，在组件挂载时生成底层原生场景树（Scene）与渲染图（RenderGraph）。真正的每帧渲染循环（Render Loop）完全脱离 Vue VNode Diff，避免 JS 层 CPU 开销爆炸。

### 3. 数据驱动更新
利用 Vue 响应式系统，在 `patchProp` 阶段精准拦截属性变化，通过 `device.queue.writeBuffer` 增量更新 GPU 显存。

## 技术栈

| 层级 | 技术选型 |
|------|----------|
| 图形 API | WebGPU + WGSL |
| 组件框架 | Vue 3 (createRenderer) |
| 状态管理 | Pinia (仅 UI 层) |
| 核心逻辑 | TypeScript (ES2022+) |

## 快速上手

### 安装依赖

```bash
pnpm install @webcv6/gpu3d
```

### 基础使用

```typescript
import { createApp } from 'vue'
import { createGPURenderer, Scene, Camera, DirectionalLight } from '@webcv6/gpu3d'

// 创建 GPU 渲染器
const gpuRenderer = createGPURenderer({
  canvas: document.querySelector('canvas') as HTMLCanvasElement,
  adapter: await navigator.gpu.requestAdapter(),
})

// 创建场景
const scene = new Scene()

// 创建相机
const camera = new Camera({
  fov: 60,
  near: 0.1,
  far: 1000,
  position: [0, 10, 20]
})

// 创建光源
const light = new DirectionalLight({
  direction: [-1, -1, -1],
  intensity: 1.0
})

// 挂载到渲染器
gpuRenderer.mount(scene, camera, light)

// 启动渲染循环
gpuRenderer.start()

// 销毁
gpuRenderer.unmount()
```

### 与 Vue 组件集成

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useGPU } from '@webcv6/gpu3d'

const gpu = useGPU()

onMounted(() => {
  gpu.mount()
})

onUnmounted(() => {
  gpu.unmount()
})
</script>

<template>
  <GPUCanvas />
</template>
```

## 目录结构

```
packages/gpu3d/
├── src/
│   ├── backend/              # WebGPU 设备 / 队列 / 资源抽象
│   │   ├── Device.ts         # GPU 设备管理
│   │   ├── Buffer.ts         # GPU Buffer 封装
│   │   ├── Texture.ts        # 纹理资源管理
│   │   └── Pipeline.ts       # 渲染管线封装
│   ├── render/               # 渲染图、Pass、相机
│   │   ├── RenderGraph.ts    # 渲染图编排
│   │   ├── RenderPass.ts     # 渲染通道基类
│   │   ├── GBufferPass.ts    # G-Buffer 通道
│   │   ├── LightPass.ts      # 光照通道
│   │   ├── PostPass.ts       # 后处理通道
│   │   └── Camera.ts         # 相机系统
│   ├── scene/                # 场景图、实体
│   │   ├── Scene.ts          # 场景容器
│   │   ├── Entity.ts         # 场景实体
│   │   ├── Mesh.ts           # 网格组件
│   │   ├── Transform.ts      # 变换组件
│   │   └── Terrain.ts        # 地形组件
│   ├── sim/                  # 回合、地图、规则 (纯函数式)
│   │   ├── WorldState.ts     # 世界状态定义
│   │   ├── TurnManager.ts    # 回合管理
│   │   ├── MapGenerator.ts   # 地图生成
│   │   └── Rules.ts          # 游戏规则
│   ├── shaders/              # WGSL 着色器源码
│   │   ├── terrain.wgsl      # 地形着色器
│   │   ├── unit.wgsl         # 单位着色器
│   │   ├── lighting.wgsl     # 光照着色器
│   │   └── postprocess.wgsl  # 后处理着色器
│   ├── port/                 # 对外契约
│   │   ├── InputPort.ts      # 输入端口定义
│   │   └── StateStream.ts    # 状态流接口
│   └── index.ts              # 包入口
├── package.json
└── tsconfig.json
```

## API 概览

### 核心导出

```typescript
// 主入口
export { createGPURenderer } from './createGPURenderer'
export type { GPURendererOptions, GPURenderer } from './types'

// 场景模块
export { Scene } from './scene/Scene'
export { Entity } from './scene/Entity'
export { Mesh } from './scene/Mesh'
export { Transform } from './scene/Transform'
export { Terrain } from './scene/Terrain'

// 渲染模块
export { Camera } from './render/Camera'
export { DirectionalLight } from './render/DirectionalLight'
export { RenderGraph } from './render/RenderGraph'

// 模拟模块
export { WorldState } from './sim/WorldState'
export { createWorld } from './sim/createWorld'

// 端口模块
export type { InputPort } from './port/InputPort'
export type { StateStream } from './port/StateStream'
```

### 子模块导出

```typescript
import { Device } from '@webcv6/gpu3d/backend'
import { RenderGraph } from '@webcv6/gpu3d/render'
import { Scene } from '@webcv6/gpu3d/scene'
import { WorldState } from '@webcv6/gpu3d/sim'
import { InputPort } from '@webcv6/gpu3d/port'
```

## 与上层应用的集成方式

### 依赖方向

```
apps/web → packages/ui → packages/core
       \                ↗
        → packages/gpu3d ┘
```

`gpu3d` 只依赖 `@webcv6/core`，不得反向依赖 apps 或 ui。

### 通信架构

```
┌─────────────────────────────────────────────────────────┐
│                     UI Layer (Vue + Pinia)               │
│   HUD / Menu / Modal / Settings / 选中状态 / 回合控制    │
└─────────────────────┬───────────────────────────────────┘
                      │ StateStream (只读投影)
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   Bridge Layer (EventBus)                │
│         输入事件 / 状态同步 / 相机位姿订阅                │
└─────────────────────┬───────────────────────────────────┘
                      │ InputPort / StateStream
                      ▼
┌─────────────────────────────────────────────────────────┐
│               3D Layer (gpu3d - Pure WebGPU)             │
│        地形 / 单位 / 城市 / 特效 / 小地图 / 选中环        │
└─────────────────────────────────────────────────────────┘
```

### 输入输出契约

**InputPort** - 接收标准化输入：
- 点击坐标（屏幕空间 → 世界空间转换）
- 拖拽操作（相机控制、框选）
- 键盘事件（快捷键、回合结束）

**StateStream** - 可订阅的世界状态：
- `selectedUnit`: 当前选中单位
- `turnNumber`: 回合数
- `resources`: 资源状态
- `cameraPose`: 相机位姿（位置、朝向、缩放）

### 禁止事项

- 3D 层禁止调用任何 UI 组件 / DOM API
- UI 层禁止直接访问 WebGPU 设备或着色器
- gpu3d 禁止依赖 apps 或 packages/ui

## 许可证

MIT
