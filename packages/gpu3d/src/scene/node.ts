let nodeIdCounter = 0;

/**
 * 原生场景树节点，独立于 Vue VNode
 * GPU 资源挂载在 node 上，由 RenderLoop 直接遍历
 */
export class SceneNode {
  readonly id: number;
  readonly type: string;
  parent: SceneNode | null = null;
  children: SceneNode[] = [];
  gpuResources: Map<string, GPUObjectBase> = new Map();

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
   * 销毁此节点及其所有子节点持有的 GPU 资源
   */
  dispose(): void {
    for (const child of this.children) {
      child.dispose();
    }
    for (const resource of this.gpuResources.values()) {
      if ("destroy" in resource && typeof resource.destroy === "function") {
        resource.destroy();
      }
    }
    this.gpuResources.clear();
    this.children = [];
    this.parent = null;
  }
}
