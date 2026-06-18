/**
 * 配置 canvas 的 WebGPU 上下文
 */
export function configureCanvasContext(
  canvas: HTMLCanvasElement,
  device: GPUDevice,
  format?: GPUTextureFormat,
): GPUCanvasContext {
  const ctx = canvas.getContext("webgpu") as GPUCanvasContext | null;
  if (!ctx) {
    throw new Error("Failed to get WebGPU context from canvas.");
  }

  const preferredFormat = format ?? navigator.gpu.getPreferredCanvasFormat();

  ctx.configure({
    device,
    format: preferredFormat,
    alphaMode: "premultiplied",
  });

  return ctx;
}
