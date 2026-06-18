import { createRenderer as vueCreateRenderer } from "vue";
import { hostEnv } from "./host-env";
import type { HostNode } from "./host-node";

/**
 * 基于 Vue createRenderer 的 GPU 自定义渲染器
 * gpuRender 将 VNode 树渲染到 GpuContainer 中
 * createApp 用于创建独立 GPU 应用
 */
const { render: gpuRender, createApp } = vueCreateRenderer<HostNode, HostNode>(hostEnv);

export { gpuRender, createApp };

/**
 * createGpuApp: 封装 createApp，提供更简洁的 API
 */
export function createGpuApp() {
  return createApp;
}
