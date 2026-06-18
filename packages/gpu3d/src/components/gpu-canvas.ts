import { defineComponent, h, onMounted, onUnmounted, ref } from "vue";
import { createDevice, configureCanvasContext } from "../backend";
import { Scene } from "../scene";
import { RenderLoop, TrianglePass } from "../render";

/**
 * GpuCanvas 组件
 * 负责初始化 WebGPU 设备、创建 canvas context、启动 RenderLoop
 * 子组件（如 GpuTriangle）会挂载到此组件的场景树中
 */
export const GpuCanvas = defineComponent({
  name: "GpuCanvas",

  props: {
    width: { type: Number, default: 800 },
    height: { type: Number, default: 600 },
  },

  setup(props) {
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    const scene = new Scene();
    let renderLoop: RenderLoop | null = null;
    let device: GPUDevice | null = null;

    onMounted(async () => {
      const canvas = canvasRef.value;
      if (!canvas) return;

      device = await createDevice();
      const format = navigator.gpu.getPreferredCanvasFormat();
      const context = configureCanvasContext(canvas, device, format);

      // 创建三角形 Pass 并初始化
      const trianglePass = new TrianglePass();
      trianglePass.init(device, format);

      // 启动渲染循环
      renderLoop = new RenderLoop(device, context, scene);
      renderLoop.addPass(trianglePass);
      renderLoop.start();
    });

    onUnmounted(() => {
      renderLoop?.stop();
      scene.dispose();
      device?.destroy();
    });

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
