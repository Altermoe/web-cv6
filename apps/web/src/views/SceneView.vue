<script setup lang="ts">
import { GpuCanvas } from "@webcv6/gpu3d";
import { ref } from "vue";

const canvasWidth = ref(800);
const canvasHeight = ref(600);

const format = navigator.gpu.getPreferredCanvasFormat();

const vertShader = `
  struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec3f,
  }

  @vertex
  fn vertexMain(
    @location(0) pos: vec2f,
    @location(1) col: vec3f,
  ) -> VertexOutput {
    var output: VertexOutput;
    output.position = vec4f(pos, 0.0, 1.0);
    output.color = col;
    return output;
  }
`;

const fragShader = `
  @fragment
  fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
    return vec4f(input.color, 1.0);
  }
`;

const vertices = ref(new Float32Array([0, 0.5, 1, 0, 0, -0.5, -0.5, 0, 1, 0, 0.5, -0.5, 0, 0, 1]));

const vertexLayout = {
  arrayStride: 20,
  attributes: [
    { shaderLocation: 0, offset: 0, format: "float32x2" as GPUVertexFormat },
    { shaderLocation: 1, offset: 8, format: "float32x3" as GPUVertexFormat },
  ],
};
</script>

<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen gap-6 bg-gray-950 text-gray-100"
  >
    <h1 class="text-3xl font-bold tracking-tight">WebGPU Triangle</h1>
    <p class="text-gray-400">gpu3d MVP-2: 声明式 GPU 元素 + createRenderer</p>

    <div class="rounded-lg overflow-hidden border border-gray-800 shadow-lg">
      <GpuCanvas :width="canvasWidth" :height="canvasHeight">
        <gpu-pipeline
          :vertex-code="vertShader"
          :fragment-code="fragShader"
          topology="triangle-list"
          :format="format"
        >
          <gpu-vertex-buffer :data="vertices" :layout="vertexLayout" />
          <gpu-draw :vertex-count="3" />
        </gpu-pipeline>
      </GpuCanvas>
    </div>

    <p class="text-xs text-gray-600">如果看到彩色三角形，说明声明式 GPU 元素体系工作正常</p>
  </div>
</template>
