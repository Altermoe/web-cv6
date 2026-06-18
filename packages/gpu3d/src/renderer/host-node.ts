import { Scene, SceneNode } from "../scene";

/**
 * HostNode: Vue 自定义渲染器操作的"DOM 节点"
 * GPU 元素类型体系：每个 HostNode 对应一类 GPU 资源
 */
export type HostNode = GpuContainer | PipelineNode | VertexBufferNode | DrawNode | TextHostNode;

/**
 * GPU 元素节点抽象基类
 * 映射到原生场景树，通过 parent 链可回溯到 GpuContainer 获取 device
 */
export abstract class GpuHostNode {
  abstract readonly type: string;
  sceneNode!: SceneNode;
  props: Record<string, unknown> = {};
  parent: GpuHostNode | null = null;
  children: GpuHostNode[] = [];

  protected constructor() {
    // 子类必须初始化 sceneNode
  }

  abstract dispose(): void;

  /**
   * 沿 parent 链向上查找 GpuContainer
   */
  getContainer(): GpuContainer | null {
    if (this instanceof GpuContainer) return this;
    if (this.parent) return this.parent.getContainer();
    return null;
  }

  insertChild(child: GpuHostNode, anchor?: GpuHostNode | null): void {
    child.parent = this;
    if (anchor) {
      const idx = this.children.indexOf(anchor);
      if (idx !== -1) {
        this.children.splice(idx, 0, child);
      } else {
        this.children.push(child);
      }
    } else {
      this.children.push(child);
    }
  }

  removeChild(child: GpuHostNode): void {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parent = null;
    }
  }
}

/**
 * 容器节点：对应 GpuCanvas，持有 device/context/format/scene
 */
export class GpuContainer extends GpuHostNode {
  readonly type = "container";
  device: GPUDevice;
  context: GPUCanvasContext;
  format: GPUTextureFormat;
  scene: Scene;

  constructor(
    device: GPUDevice,
    context: GPUCanvasContext,
    format: GPUTextureFormat,
    scene: Scene,
  ) {
    super();
    this.device = device;
    this.context = context;
    this.format = format;
    this.scene = scene;
    this.sceneNode = scene.root;
  }

  dispose(): void {
    this.scene.dispose();
  }
}

/**
 * Pipeline 节点：低频 GPU 资源，mount 时创建，unmount 时销毁
 * 收集子节点 VertexBufferNode 的 layout 构建 GPURenderPipeline
 */
export class PipelineNode extends GpuHostNode {
  readonly type = "gpu-pipeline";
  pipeline: GPURenderPipeline | null = null;
  vertexCode = "";
  fragmentCode = "";
  topology: GPUPrimitiveTopology = "triangle-list";
  format: GPUTextureFormat = "bgra8unorm";

  constructor() {
    super();
    this.sceneNode = new SceneNode("gpu-pipeline");
  }

  /**
   * 从 device + 当前 props 构建 GPURenderPipeline
   * 收集子节点 VertexBufferNode 的 layout 作为 vertex buffers
   */
  buildPipeline(device: GPUDevice): void {
    // GPURenderPipeline 无 destroy()，由 GC 回收
    this.pipeline = null;

    // 收集子节点中 VertexBufferNode 的 layout
    const bufferLayouts: GPUVertexBufferLayout[] = [];
    for (const child of this.children) {
      if (child instanceof VertexBufferNode && child.layout) {
        bufferLayouts.push(child.layout);
      }
    }

    const combinedCode = `${this.vertexCode}\n${this.fragmentCode}`;
    const shaderModule = device.createShaderModule({ code: combinedCode });

    this.pipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: shaderModule,
        entryPoint: "vertexMain",
        buffers: bufferLayouts,
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fragmentMain",
        targets: [{ format: this.format }],
      },
      primitive: {
        topology: this.topology,
      },
    });

    this.sceneNode.pipeline = this.pipeline;
  }

  /**
   * 重建 pipeline（shader 代码 / topology / format 变化时）
   */
  rebuildPipeline(): void {
    const container = this.getContainer();
    if (!container) return;
    this.buildPipeline(container.device);
  }

  dispose(): void {
    // GPURenderPipeline 无 destroy()，由 GC 回收
    this.pipeline = null;
    this.sceneNode.pipeline = null;
  }
}

/**
 * Vertex Buffer 节点：低频创建 + 高频 data 更新
 */
export class VertexBufferNode extends GpuHostNode {
  readonly type = "gpu-vertex-buffer";
  buffer: GPUBuffer | null = null;
  layout: GPUVertexBufferLayout | null = null;
  data: Float32Array | null = null;

  constructor() {
    super();
    this.sceneNode = new SceneNode("gpu-vertex-buffer");
  }

  /**
   * 从 device + props 创建 GPUBuffer 并写入初始数据
   */
  buildBuffer(device: GPUDevice): void {
    this.buffer?.destroy();

    if (!this.data) return;

    this.buffer = device.createBuffer({
      size: this.data.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(this.buffer, 0, this.data);

    this.sceneNode.vertexBuffer = this.buffer;
    if (this.layout) {
      this.sceneNode.vertexLayout = this.layout;
    }
  }

  /**
   * 高频更新：通过 writeBuffer 增量写入新数据
   */
  writeData(data: Float32Array): void {
    this.data = data;
    if (!this.buffer) return;

    const container = this.getContainer();
    if (!container) return;

    // 如果数据大小超过 buffer 容量，需要重建
    if (data.byteLength > this.buffer.size) {
      this.buildBuffer(container.device);
      return;
    }

    container.device.queue.writeBuffer(this.buffer, 0, data);
  }

  dispose(): void {
    this.buffer?.destroy();
    this.buffer = null;
    this.sceneNode.vertexBuffer = null;
    this.sceneNode.vertexLayout = null;
  }
}

/**
 * Draw 命令节点：纯数据，无 GPU 资源
 * 高频更新 vertexCount / instanceCount
 */
export class DrawNode extends GpuHostNode {
  readonly type = "gpu-draw";
  vertexCount = 0;
  instanceCount = 1;
  firstVertex = 0;
  firstInstance = 0;

  constructor() {
    super();
    this.sceneNode = new SceneNode("gpu-draw");
    this.sceneNode.drawParams = { vertexCount: 0, instanceCount: 1 };
  }

  updateDrawParams(): void {
    this.sceneNode.drawParams = {
      vertexCount: this.vertexCount,
      instanceCount: this.instanceCount,
    };
  }

  dispose(): void {
    this.sceneNode.drawParams = null;
  }
}

/**
 * 文本节点（WebGPU 场景中暂不使用，但 createRenderer 要求实现）
 */
export class TextHostNode {
  readonly type = "text";
  text: string;

  constructor(text: string) {
    this.text = text;
  }
}
