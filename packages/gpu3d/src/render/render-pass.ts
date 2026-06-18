/**
 * RenderPass 抽象基类
 * 每个 Pass 负责一类渲染任务（如 G-Buffer、光照、后处理）
 */
export abstract class RenderPass {
  abstract readonly name: string;

  /**
   * 执行此 Pass 的渲染命令
   */
  abstract execute(encoder: GPUCommandEncoder, context: GPUCanvasContext, device: GPUDevice): void;
}
