import type { Scene } from "../scene";
import type { RenderPass } from "./render-pass";

/**
 * 渲染循环，独立于 Vue 响应式系统运行
 * 通过 requestAnimationFrame 驱动，每帧遍历场景树执行所有 Pass
 */
export class RenderLoop {
  private rafId = 0;
  private running = false;
  private passes: RenderPass[] = [];

  constructor(
    private device: GPUDevice,
    private context: GPUCanvasContext,
    _scene: Scene,
  ) {}

  addPass(pass: RenderPass): void {
    this.passes.push(pass);
  }

  removePass(name: string): void {
    this.passes = this.passes.filter((p) => p.name !== name);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.frame();
  }

  stop(): void {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  private frame = (): void => {
    if (!this.running) return;

    const encoder = this.device.createCommandEncoder();

    for (const pass of this.passes) {
      pass.execute(encoder, this.context, this.device);
    }

    this.device.queue.submit([encoder.finish()]);
    this.rafId = requestAnimationFrame(this.frame);
  };
}
