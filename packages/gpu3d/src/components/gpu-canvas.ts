import { defineComponent, Fragment, h, onMounted, onUnmounted, ref, watchEffect } from "vue";
import { createDevice, configureCanvasContext } from "../backend";
import { Scene } from "../scene";
import { RenderLoop } from "../render";
import { gpuRender, GpuContainer } from "../renderer";
import type { HostNode } from "../renderer/host-node";

/**
 * GpuCanvas 组件 — DOM 渲染器与 GPU 渲染器的桥梁
 *
 * 1. 渲染 <canvas> DOM 元素（DOM 渲染器）
 * 2. 初始化 WebGPU device / context
 * 3. 创建 GpuContainer（GPU 渲染器容器）
 * 4. 通过 watchEffect 拦截 slot children，调用 gpuRender 渲染
 */
export const GpuCanvas = defineComponent({
  name: "GpuCanvas",

  props: {
    width: { type: Number, default: 800 },
    height: { type: Number, default: 600 },
  },

  setup(props, { slots }) {
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const gpuContainerRef = ref<GpuContainer | null>(null);
    let renderLoop: RenderLoop | null = null;
    let device: GPUDevice | null = null;
    let scene: Scene | null = null;

    // 核心：拦截 slot，用 GPU renderer 渲染
    // 当 slot 中的响应式数据变化时，watchEffect 自动重新执行
    watchEffect(() => {
      const container = gpuContainerRef.value;
      if (!container) return;
      const vnodes = slots.default?.() ?? [];
      gpuRender(h(Fragment, null, vnodes), container as HostNode);
    });

    onMounted(async () => {
      const canvas = canvasRef.value;
      if (!canvas) return;

      device = await createDevice();
      const format = navigator.gpu.getPreferredCanvasFormat();
      const context = configureCanvasContext(canvas, device, format);

      scene = new Scene();

      // 启动渲染循环（在 gpuContainer 赋值之前，确保 render loop 先就绪）
      renderLoop = new RenderLoop(device, context, scene.root);
      renderLoop.start();

      // 创建容器 → 触发 watchEffect → gpuRender 挂载 GPU 元素树
      gpuContainerRef.value = new GpuContainer(device, context, format, scene);
    });

    onUnmounted(() => {
      renderLoop?.stop();
      gpuContainerRef.value?.dispose();
      device?.destroy();
    });

    // 只渲染 canvas DOM 元素，slot children 由 GPU 渲染器处理
    return () => {
      return h("canvas", {
        ref: canvasRef,
        width: props.width,
        height: props.height,
        style: "display: block;",
      });
    };
  },
});
