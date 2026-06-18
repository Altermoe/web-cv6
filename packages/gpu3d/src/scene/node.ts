let nodeIdCounter = 0;

/**
 * 原生场景树节点，独立于 Vue VNode
 * GPU 资源引用挂载在 node 上，由 RenderLoop 直接遍历读取
 * GPU 资源生命周期由 HostNode 管理，SceneNode 仅持有引用
 */
export class SceneNode {
  readonly id: number;
  readonly type: string;
  parent: SceneNode | null = null;
  children: SceneNode[] = [];

  /** GPU 资源引用（由 HostNode 同步） */
  gpuResources: Map<string, GPUObjectBase> = new Map();

  /** 渲染管线（由 PipelineNode 同步） */
  pipeline: GPURenderPipeline | null = null;
  /** 顶点缓冲（由 VertexBufferNode 同步） */
  vertexBuffer: GPUBuffer | null = null;
  /** 顶点布局（由 VertexBufferNode 同步） */
  vertexLayout: GPUVertexBufferLayout | null = null;
  /** 绘制参数（由 DrawNode 同步） */
  drawParams: { vertexCount: number; instanceCount: number } | null = null;

  constructor(type: string) {
    this.id = nodeIdCounter++;
    this.type = type;
  }

  addChild(child: SceneNode): void {
    if (child.parent) {
      child.parent.removeChild(child);
    }
    child.parent = this;
    this.children.push(child);
  }

  removeChild(child: SceneNode): void {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parent = null;
    }
  }

  insertBefore(child: SceneNode, anchor: SceneNode | null): void {
    if (child.parent) {
      child.parent.removeChild(child);
    }
    child.parent = this;

    if (anchor) {
      const idx = this.children.indexOf(anchor);
      if (idx !== -1) {
        this.children.splice(idx, 0, child);
        return;
      }
    }
    this.children.push(child);
  }

  /**
   * 销毁此节点及其所有子节点的树结构
   * 注意：GPU 资源由 HostNode.dispose() 负责销毁，此处仅清理引用
   */
  dispose(): void {
    for (const child of this.children) {
      child.dispose();
    }
    this.pipeline = null;
    this.vertexBuffer = null;
    this.vertexLayout = null;
    this.drawParams = null;
    this.gpuResources.clear();
    this.children = [];
    this.parent = null;
  }
}
