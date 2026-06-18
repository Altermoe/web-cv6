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
export { RenderPass, RenderLoop, TrianglePass } from "./render";

// Renderer - Vue createRenderer 自定义渲染器
export {
  render,
  createApp,
  createGpuApp,
  ContainerHostNode,
  ElementHostNode,
  TextHostNode,
  type HostNode,
  hostEnv,
  initContainerScene,
} from "./renderer";

// Components - 声明式 GPU 组件
export { GpuCanvas, GpuTriangle } from "./components";
