import { requestAdapter } from "./adapter";

export interface DeviceOptions {
  requiredFeatures?: GPUFeatureName[];
  requiredLimits?: Record<string, number>;
}

/**
 * 创建 GPUDevice
 */
export async function createDevice(options: DeviceOptions = {}): Promise<GPUDevice> {
  const adapter = await requestAdapter();

  const { requiredFeatures, requiredLimits } = options;

  const device = await adapter.requestDevice({
    requiredFeatures: requiredFeatures ?? [],
    requiredLimits: requiredLimits ?? {},
  });

  device.lost.then((info) => {
    console.error(`WebGPU device lost: reason=${info.reason}, message=${info.message}`);
  });

  return device;
}
