import { SceneNode } from "./node";

/**
 * 场景根节点，管理整棵原生场景树
 */
export class Scene {
  readonly root: SceneNode;

  constructor() {
    this.root = new SceneNode("scene-root");
  }

  /**
   * 深度优先遍历场景树，收集所有指定类型的节点
   */
  queryByType(type: string): SceneNode[] {
    const result: SceneNode[] = [];
    const stack = [this.root];
    while (stack.length > 0) {
      const node = stack.pop()!;
      if (node.type === type) {
        result.push(node);
      }
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push(node.children[i]);
      }
    }
    return result;
  }

  dispose(): void {
    this.root.dispose();
  }
}
