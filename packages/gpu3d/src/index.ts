// @webcv6/gpu3d - Vue Graphics Pipeline
// 声明式 WebGPU 3D 渲染引擎

// Backend - WebGPU 设备初始化
export {
  requestAdapter,
  createDevice,
  configureCanvasContext,
  type DeviceOptions,
  type GPU,
} from "./backend";

// Scene - 原生场景树
export { SceneNode, Scene } from "./scene";

// Render - 渲染管线
export { RenderPass, RenderLoop } from "./render";

// Renderer - Vue createRenderer 自定义渲染器
export {
  gpuRender,
  createApp,
  createGpuApp,
  GpuContainer,
  PipelineNode,
  VertexBufferNode,
  DrawNode,
  TextHostNode,
  type GpuHostNode,
  type HostNode,
  hostEnv,
  createGpuContainer,
} from "./renderer";

// Components - 声明式 GPU 组件
export { GpuCanvas } from "./components";
