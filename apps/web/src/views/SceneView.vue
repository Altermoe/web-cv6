<script setup lang="ts">
import { GpuCanvas } from "@webcv6/gpu3d";
import { ref } from "vue";

const canvasWidth = ref(800);
const canvasHeight = ref(600);
</script>

<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen gap-6 bg-gray-950 text-gray-100"
  >
    <h1 class="text-3xl font-bold tracking-tight">WebGPU Triangle</h1>
    <p class="text-gray-400">gpu3d MVP-1: Vue createRenderer + WebGPU</p>

    <div class="rounded-lg overflow-hidden border border-gray-800 shadow-lg">
      <GpuCanvas :width="canvasWidth" :height="canvasHeight" />
    </div>

    <p class="text-xs text-gray-600">如果看到彩色三角形，说明 WebGPU 渲染管线工作正常</p>
  </div>
</template>
