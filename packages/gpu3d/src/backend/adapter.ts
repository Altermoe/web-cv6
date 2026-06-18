import type { GPU } from "./types";

/**
 * 请求 GPUAdapter，不支持 WebGPU 时抛出错误
 */
export async function requestAdapter(): Promise<GPUAdapter> {
  if (!navigator.gpu) {
    throw new Error(
      "WebGPU is not supported in this browser. " + "Please use Chrome 113+ or Edge 113+.",
    );
  }
  const gpu: GPU = navigator.gpu;
  const adapter = await gpu.requestAdapter();
  if (!adapter) {
    throw new Error("Failed to request GPUAdapter. No compatible GPU found.");
  }
  return adapter;
}
