import { createRenderer as vueCreateRenderer } from "vue";
import { hostEnv } from "./host-env";
import type { HostNode } from "./host-node";

/**
 * 基于 Vue createRenderer 的 GPU 自定义渲染器
 * 返回的 render 函数和 createApp 与标准 Vue 相同，但操作的是 HostNode 而非 DOM
 */
const { render, createApp } = vueCreateRenderer<HostNode, HostNode>(hostEnv);

export { render, createApp };

/**
 * createGpuApp: 封装 createApp，提供更简洁的 API
 */
export function createGpuApp() {
  return createApp;
}
