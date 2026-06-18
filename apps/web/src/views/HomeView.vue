<script setup lang="ts">
import { Toggle } from "reka-ui";
import { ref } from "vue";
import { useCounterStore } from "../stores/counter";
import { RouterLink } from "vue-router";

const counter = useCounterStore();
const pressed = ref(false);
</script>

<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen gap-8 bg-gray-950 text-gray-100"
  >
    <h1 class="text-4xl font-bold tracking-tight">Web-CV6</h1>
    <p class="text-gray-400">WebGPU + Vue3 文明类游戏</p>

    <div class="flex items-center gap-4 text-2xl">
      <button
        class="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 transition-colors cursor-pointer"
        @click="counter.decrement()"
      >
        -
      </button>
      <span class="w-16 text-center tabular-nums">
        {{ counter.count }}
      </span>
      <button
        class="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 transition-colors cursor-pointer"
        @click="counter.increment()"
      >
        +
      </button>
    </div>

    <p class="text-sm text-gray-500">双倍: {{ counter.doubleCount }}</p>

    <Toggle
      v-model:pressed="pressed"
      class="px-4 py-2 rounded transition-colors cursor-pointer"
      :class="pressed ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'"
    >
      reka-ui Toggle: {{ pressed ? "ON" : "OFF" }}
    </Toggle>

    <RouterLink
      to="/scene"
      class="px-6 py-3 rounded-lg bg-violet-700 hover:bg-violet-600 transition-colors text-white font-medium"
    >
      WebGPU Scene Demo
    </RouterLink>
  </div>
</template>
