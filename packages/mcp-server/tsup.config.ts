import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node26",
  dts: true,
  clean: true,
  splitting: false,
  external: ["playwright-core", "chromium-bidi"],
  banner: {
    js: "#!/usr/bin/env node",
  },
});
