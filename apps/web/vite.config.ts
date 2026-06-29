import vue from "@vitejs/plugin-vue";
import unocss from "unocss/vite";
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [
    vue({
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
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
