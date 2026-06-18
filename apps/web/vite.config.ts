import vue from "@vitejs/plugin-vue";
import unocss from "unocss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    vue({
      // gpu3d 声明式 GPU 元素（<gpu-pipeline>、<gpu-vertex-buffer>、<gpu-draw> 等）
      // 不属于 Vue 组件，也不属于 DOM 原生元素，由 @webcv6/gpu3d 的 createRenderer 处理。
      // 通过 isCustomElement 告知 Vue 编译器：这些标签直接作为原生元素创建
      // （h("gpu-pipeline", ...)），运行时由 gpu3d 的 hostEnv.createElement 接管。
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith("gpu-"),
        },
      },
    }),
    unocss(),
  ],
  server: {
    port: 26618,
  },
  resolve: {
    tsconfigPaths: true,
  },
});
