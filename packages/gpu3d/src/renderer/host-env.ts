import { Scene } from "../scene";
import { ContainerHostNode, ElementHostNode, TextHostNode, type HostNode } from "./host-node";
import type { RendererOptions } from "vue";

type HostElement = HostNode;

/**
 * Vue createRenderer 所需的节点操作环境
 * 核心机制：将 Vue 的 VNode 操作映射到原生场景树的增删改
 */
export const hostEnv: RendererOptions<HostElement, HostElement> = {
  /* ---- 节点创建 ---- */

  createElement(type: string): HostElement {
    if (type === "gpu-canvas") {
      return new ContainerHostNode();
    }
    return new ElementHostNode(type);
  },

  createText(text: string): HostElement {
    return new TextHostNode(text);
  },

  /* ---- 节点关系 ---- */

  insert(child: HostElement, parent: HostElement, anchor?: HostElement | null): void {
    if (child instanceof ContainerHostNode || parent instanceof TextHostNode) {
      return;
    }

    if (parent instanceof ContainerHostNode) {
      if (child instanceof ElementHostNode && parent.sceneNode) {
        const anchorScene = anchor instanceof ElementHostNode ? anchor.sceneNode : null;
        parent.sceneNode.insertBefore(child.sceneNode, anchorScene);
      }
      return;
    }

    if (parent instanceof ElementHostNode && child instanceof ElementHostNode) {
      parent.sceneNode.insertBefore(
        child.sceneNode,
        anchor instanceof ElementHostNode ? anchor.sceneNode : null,
      );
    }
  },

  remove(node: HostElement): void {
    if (node instanceof ElementHostNode) {
      node.sceneNode.parent?.removeChild(node.sceneNode);
      node.sceneNode.dispose();
    }
  },

  parentNode(_node: HostElement): HostElement | null {
    // MVP-1: 暂不实现回溯
    return null;
  },

  nextSibling(_node: HostElement): HostElement | null {
    return null;
  },

  /* ---- 属性操作 ---- */

  patchProp(el: HostElement, key: string, _prevValue: unknown, nextValue: unknown): void {
    if (el instanceof ElementHostNode) {
      el.props[key] = nextValue;
      // 数据驱动更新：后续 MVP 会触发 device.queue.writeBuffer
    }
  },

  setElementText(_node: HostElement, _text: string): void {
    // GPU 节点不支持文本内容
  },

  /* ---- 注释/克隆 ---- */

  createComment(_text: string): HostElement {
    return new TextHostNode("");
  },

  setText(node: HostElement, text: string): void {
    if (node instanceof TextHostNode) {
      node.text = text;
    }
  },

  cloneNode(node: HostElement): HostElement {
    if (node instanceof ContainerHostNode) {
      const clone = new ContainerHostNode();
      clone.device = node.device;
      clone.context = node.context;
      clone.sceneNode = node.sceneNode;
      return clone;
    }
    if (node instanceof ElementHostNode) {
      const clone = new ElementHostNode(node.elementType);
      clone.props = { ...node.props };
      return clone;
    }
    return new TextHostNode((node as TextHostNode).text);
  },
};

/**
 * 创建一个 Scene 实例并绑定到 ContainerHostNode
 * 在 GpuCanvas 挂载时调用
 */
export function initContainerScene(container: ContainerHostNode, scene: Scene): void {
  container.sceneNode = scene.root;
}
