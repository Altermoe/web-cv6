import type { SceneNode } from "../scene";

/**
 * 渲染循环，独立于 Vue 响应式系统运行
 * 通过 requestAnimationFrame 驱动，深度遍历场景树执行 draw calls
 */
export class RenderLoop {
  private rafId = 0;
  private running = false;
  private sceneRoot: SceneNode;

  constructor(
    private device: GPUDevice,
    private context: GPUCanvasContext,
    sceneRoot: SceneNode,
  ) {
    this.sceneRoot = sceneRoot;
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
    const textureView = this.context.getCurrentTexture().createView();

    const passEncoder = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0.05, g: 0.05, b: 0.08, a: 1.0 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });

    // 深度遍历场景树，执行 draw calls
    this.renderNode(this.sceneRoot, passEncoder);

    passEncoder.end();
    this.device.queue.submit([encoder.finish()]);
    this.rafId = requestAnimationFrame(this.frame);
  };

  /**
   * 递归渲染场景节点
   * 遇到 pipeline 节点设置管线，遇到 vertex-buffer 设置缓冲，遇到 draw 执行绘制
   */
  private renderNode(node: SceneNode, encoder: GPURenderPassEncoder): void {
    if (node.pipeline) {
      encoder.setPipeline(node.pipeline);
    }
    if (node.vertexBuffer && node.vertexLayout) {
      // MVP-2: 每个 pipeline 下按子节点顺序分配 buffer slot
      // TODO: 多 vertex buffer 场景需要计算 slot 索引
      encoder.setVertexBuffer(0, node.vertexBuffer);
    }
    if (node.drawParams) {
      encoder.draw(node.drawParams.vertexCount, node.drawParams.instanceCount);
    }

    // 递归渲染子节点
    for (const child of node.children) {
      this.renderNode(child, encoder);
    }
  }
}
