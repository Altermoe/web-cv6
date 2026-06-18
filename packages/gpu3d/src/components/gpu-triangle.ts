import { defineComponent, h } from "vue";

/**
 * GpuTriangle 声明式组件
 * 在 GPU 场景中声明一个彩色三角形
 * 实际渲染由 TrianglePass 处理，此组件负责场景树节点的生命周期
 */
export const GpuTriangle = defineComponent({
  name: "GpuTriangle",

  props: {
    /** 三角形类型标识（暂无实际用途，用于后续扩展） */
    variant: { type: String, default: "default" },
  },

  setup() {
    // MVP-1: 三角形的顶点数据和 pipeline 在 TrianglePass 中硬编码
    // 后续 MVP 会将 vertex buffer 和 pipeline 绑定到场景节点上
    return () => h("gpu-triangle");
  },
});
