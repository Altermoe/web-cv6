import { SceneNode } from "../scene";

/**
 * HostNode: Vue 自定义渲染器操作的"DOM 节点"
 * 不是真实 DOM，而是映射到原生场景树的中间层
 */
export type HostNode = ContainerHostNode | ElementHostNode | TextHostNode;

/**
 * 容器节点：对应 GpuCanvas，持有 device/context/scene/renderLoop
 */
export class ContainerHostNode {
  readonly type = "container";
  device: GPUDevice | null = null;
  context: GPUCanvasContext | null = null;
  sceneNode: SceneNode | null = null;
}

/**
 * 元素节点：对应 GpuTriangle 等 GPU 资源组件
 */
export class ElementHostNode {
  readonly type = "element";
  elementType: string;
  sceneNode: SceneNode;
  props: Record<string, unknown> = {};

  constructor(elementType: string) {
    this.elementType = elementType;
    this.sceneNode = new SceneNode(elementType);
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
