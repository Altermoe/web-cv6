import { SceneNode } from "../../scene";
import type { RenderPass } from "../render-pass";

/**
 * 彩色三角形渲染 Pass (MVP-1)
 * 从场景树中查找 triangle 类型的节点，渲染其绑定的 pipeline
 */
export class TrianglePass implements RenderPass {
  readonly name = "triangle";

  private pipeline: GPURenderPipeline | null = null;
  private vertexBuffer: GPUBuffer | null = null;

  /**
   * 初始化 pipeline 和 vertex buffer（仅调用一次）
   */
  init(device: GPUDevice, format: GPUTextureFormat): void {
    // 彩色三角形顶点数据: position(x,y) + color(r,g,b)
    const vertices = new Float32Array([
      // position     // color
      0.0,
      0.5,
      1.0,
      0.0,
      0.0, // 顶部 - 红色
      -0.5,
      -0.5,
      0.0,
      1.0,
      0.0, // 左下 - 绿色
      0.5,
      -0.5,
      0.0,
      0.0,
      1.0, // 右下 - 蓝色
    ]);

    this.vertexBuffer = device.createBuffer({
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(this.vertexBuffer, 0, vertices);

    const shaderCode = /* wgsl */ `
      struct VertexOutput {
        @builtin(position) position: vec4f,
        @location(0) color: vec3f,
      }

      @vertex
      fn vertexMain(
        @location(0) pos: vec2f,
        @location(1) col: vec3f,
      ) -> VertexOutput {
        var output: VertexOutput;
        output.position = vec4f(pos, 0.0, 1.0);
        output.color = col;
        return output;
      }

      @fragment
      fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
        return vec4f(input.color, 1.0);
      }
    `;

    const shaderModule = device.createShaderModule({ code: shaderCode });

    this.pipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: shaderModule,
        entryPoint: "vertexMain",
        buffers: [
          {
            arrayStride: 5 * 4, // 5 floats * 4 bytes
            attributes: [
              { shaderLocation: 0, offset: 0, format: "float32x2" as const }, // position
              { shaderLocation: 1, offset: 2 * 4, format: "float32x3" as const }, // color
            ],
          },
        ],
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fragmentMain",
        targets: [{ format }],
      },
      primitive: {
        topology: "triangle-list",
      },
    });
  }

  execute(encoder: GPUCommandEncoder, context: GPUCanvasContext, _device: GPUDevice): void {
    if (!this.pipeline || !this.vertexBuffer) return;

    const textureView = context.getCurrentTexture().createView();

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

    passEncoder.setPipeline(this.pipeline);
    passEncoder.setVertexBuffer(0, this.vertexBuffer);
    passEncoder.draw(3);
    passEncoder.end();
  }

  /**
   * 将 GPU 资源绑定到场景节点（供 createRenderer 使用）
   */
  bindToNode(_node: SceneNode): void {
    // MVP-1: 三角形 pass 不需要从节点读取资源
    // 后续 MVP 会从节点读取 transform、material 等
  }

  dispose(): void {
    this.vertexBuffer?.destroy();
    this.pipeline = null;
    this.vertexBuffer = null;
  }
}
