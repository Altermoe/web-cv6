import { Scene } from "../scene";
import {
  GpuContainer,
  PipelineNode,
  VertexBufferNode,
  DrawNode,
  TextHostNode,
  GpuHostNode,
  type HostNode,
} from "./host-node";
import type { RendererOptions } from "vue";

type HostElement = HostNode;

/**
 * 尝试挂载节点及其子树的 GPU 资源
 * 在 insert 时调用，如果节点已有 container 祖先则立即构建 GPU 资源
 */
function tryMount(node: GpuHostNode): void {
  const container = node.getContainer();
  if (!container) return;

  if (node instanceof PipelineNode) {
    // 先挂载所有子节点（收集 buffer layout）
    for (const child of node.children) {
      mountChild(child, container);
    }
    // 再构建 pipeline（需要子节点的 layout）
    void node.buildPipeline(container.device);
  } else if (node instanceof VertexBufferNode) {
    node.buildBuffer(container.device);
    // 如果父 pipeline 已构建，需要重建（新 buffer layout）
    if (node.parent instanceof PipelineNode && node.parent.pipeline) {
      void node.parent.rebuildPipeline();
    }
  } else if (node instanceof DrawNode) {
    node.updateDrawParams();
  }
}

/**
 * 递归挂载子节点的 GPU 资源
 */
function mountChild(node: GpuHostNode, container: GpuContainer): void {
  if (node instanceof VertexBufferNode) {
    node.buildBuffer(container.device);
  } else if (node instanceof DrawNode) {
    node.updateDrawParams();
  }
  for (const child of node.children) {
    mountChild(child, container);
  }
}

/**
 * 递归释放节点及其子树的 GPU 资源
 */
function disposeSubtree(node: GpuHostNode): void {
  for (const child of node.children) {
    disposeSubtree(child);
  }
  node.dispose();
}

/**
 * 将 kebab-case 字符串转换为 camelCase（最小化实现，不依赖 @vue/shared）
 * "vertex-code" -> "vertexCode"
 * "data" -> "data"
 * "x-y-z" -> "xYZ"
 */
function camelizeKey(key: string): string {
  if (!key.includes("-")) return key;
  return key.replace(/-(?<c>[a-z])/g, (_, c: string) => c.toUpperCase());
}

/**
 * Vue createRenderer 所需的节点操作环境
 * 核心机制：将 Vue 的 VNode 操作映射到 GPU 资源管理
 */
export const hostEnv: RendererOptions<HostElement, HostElement> = {
  /* ---- 节点创建 ---- */

  createElement(type: string): HostElement {
    switch (type) {
      case "gpu-pipeline": {
        return new PipelineNode();
      }
      case "gpu-vertex-buffer": {
        return new VertexBufferNode();
      }
      case "gpu-draw": {
        return new DrawNode();
      }
      default: {
        throw new Error(`Unknown GPU element type: ${type}`);
      }
    }
  },

  createText(text: string): HostElement {
    return new TextHostNode(text);
  },

  /* ---- 节点关系 ---- */

  insert(child: HostElement, parent: HostElement, anchor?: HostElement | null): void {
    if (child instanceof TextHostNode || parent instanceof TextHostNode) return;

    const childNode = child as GpuHostNode;
    const parentNode = parent as GpuHostNode;

    // 1. 建立 HostNode 父子关系
    parentNode.insertChild(childNode, anchor as GpuHostNode | null);

    // 2. 建立 SceneNode 父子关系
    const anchorScene = anchor instanceof GpuHostNode ? anchor.sceneNode : null;
    parentNode.sceneNode.insertBefore(childNode.sceneNode, anchorScene);

    // 3. 尝试挂载 GPU 资源
    tryMount(childNode);
  },

  remove(node: HostElement): void {
    if (!(node instanceof GpuHostNode)) return;

    const parent = node.parent;

    // 1. 释放 GPU 资源（含子树）
    disposeSubtree(node);

    // 2. 从 HostNode 树移除
    parent?.removeChild(node);

    // 3. 从 SceneNode 树移除
    node.sceneNode.parent?.removeChild(node.sceneNode);

    // 4. 如果移除的是 VertexBufferNode，重建父 Pipeline
    if (node instanceof VertexBufferNode && parent instanceof PipelineNode && parent.pipeline) {
      void parent.rebuildPipeline();
    }
  },

  parentNode(node: HostElement): HostElement | null {
    if (node instanceof GpuHostNode) {
      return node.parent as HostNode | null;
    }
    return null;
  },

  nextSibling(node: HostElement): HostElement | null {
    if (node instanceof GpuHostNode && node.parent) {
      const idx = node.parent.children.indexOf(node);
      if (idx !== -1 && idx < node.parent.children.length - 1) {
        return node.parent.children[idx + 1] as HostNode;
      }
    }
    return null;
  },

  /* ---- 属性操作 ---- */

  patchProp(el: HostElement, key: string, _prevValue: unknown, nextValue: unknown): void {
    if (!(el instanceof GpuHostNode)) return;

    // 自定义元素既非 Vue 组件也非保留 HTML 元素，模板编译器不会自动转换属性名
    // （参见编译产物：<gpu-pipeline :vertex-code="..."> 仍以 "vertex-code" 传入）
    // 这里在分发到具体 handler 之前统一转为 camelCase，与 GPU 节点属性名约定保持一致。
    const normalizedKey = camelizeKey(key);

    // PipelineNode 属性
    if (el instanceof PipelineNode) {
      if (normalizedKey === "vertexCode") {
        el.vertexCode = nextValue as string;
        if (el.pipeline) void el.rebuildPipeline();
        return;
      }
      if (normalizedKey === "fragmentCode") {
        el.fragmentCode = nextValue as string;
        if (el.pipeline) void el.rebuildPipeline();
        return;
      }
      if (normalizedKey === "topology") {
        el.topology = nextValue as GPUPrimitiveTopology;
        if (el.pipeline) void el.rebuildPipeline();
        return;
      }
      if (normalizedKey === "format") {
        el.format = nextValue as GPUTextureFormat;
        if (el.pipeline) void el.rebuildPipeline();
        return;
      }
    }

    // VertexBufferNode 属性
    if (el instanceof VertexBufferNode) {
      if (normalizedKey === "data") {
        el.writeData(nextValue as Float32Array);
        return;
      }
      if (normalizedKey === "layout") {
        el.layout = nextValue as GPUVertexBufferLayout;
        if (el.buffer) {
          const container = el.getContainer();
          if (container) el.buildBuffer(container.device);
          if (el.parent instanceof PipelineNode && el.parent.pipeline) {
            void el.parent.rebuildPipeline();
          }
        }
        return;
      }
    }

    // DrawNode 属性
    if (el instanceof DrawNode) {
      if (normalizedKey === "vertexCount") {
        el.vertexCount = nextValue as number;
        el.updateDrawParams();
        return;
      }
      if (normalizedKey === "instanceCount") {
        el.instanceCount = nextValue as number;
        el.updateDrawParams();
        return;
      }
      if (normalizedKey === "firstVertex") {
        el.firstVertex = nextValue as number;
        el.updateDrawParams();
        return;
      }
      if (normalizedKey === "firstInstance") {
        el.firstInstance = nextValue as number;
        el.updateDrawParams();
        return;
      }
    }

    // 通用属性存储：归一化后存入，方便用户调试时按原 key 查询
    el.props[normalizedKey] = nextValue;
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
    if (node instanceof TextHostNode) {
      return new TextHostNode(node.text);
    }
    // GPU 元素节点不支持克隆（GPU 资源不可复制）
    throw new Error("cloneNode is not supported for GPU element nodes");
  },
};

/**
 * 创建 GpuContainer 并绑定场景
 * 在 GpuCanvas 挂载时调用
 */
export function createGpuContainer(
  device: GPUDevice,
  context: GPUCanvasContext,
  format: GPUTextureFormat,
  scene: Scene,
): GpuContainer {
  return new GpuContainer(device, context, format, scene);
}
