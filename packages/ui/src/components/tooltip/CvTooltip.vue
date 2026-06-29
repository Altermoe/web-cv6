<script setup lang="ts">
/**
 * CvTooltip — Civ 6 styled tooltip
 * Gold-bordered info popup on hover.
 */
import { ref } from "vue";
import type { Placement } from "../../types/common";

const props = withDefaults(
  defineProps<{
    content?: string;
    placement?: Placement;
    delay?: number;
  }>(),
  {
    placement: "top",
    delay: 300,
  },
);

const visible = ref(false);
let timer: ReturnType<typeof setTimeout> | null = null;

function show() {
  timer = setTimeout(() => {
    visible.value = true;
  }, props.delay);
}

function hide() {
  if (timer) clearTimeout(timer);
  visible.value = false;
}
</script>

<template>
  <div class="cv-tooltip-wrapper" @mouseenter="show" @mouseleave="hide" @focus="show" @blur="hide">
    <slot />
    <Transition name="cv-tooltip">
      <div v-if="visible && (content || $slots.content)" class="cv-tooltip" :class="`cv-tooltip--${placement}`">
        <slot name="content">{{ content }}</slot>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.cv-tooltip-wrapper {
  display: inline-flex;
  position: relative;
}
.cv-tooltip {
  position: absolute;
  padding: 4px 10px;
  background: var(--civ-bg-panel);
  border: 1px solid var(--civ-gold-700);
  color: var(--civ-text-primary);
  font-size: 12px;
  font-family: var(--civ-font-sans);
  white-space: nowrap;
  box-shadow: var(--civ-shadow-md);
  z-index: 2000;
  pointer-events: none;
}
/* Placement */
.cv-tooltip--top {
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
}
.cv-tooltip--bottom {
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
}
.cv-tooltip--left {
  right: calc(100% + 6px);
  top: 50%;
  transform: translateY(-50%);
}
.cv-tooltip--right {
  left: calc(100% + 6px);
  top: 50%;
  transform: translateY(-50%);
}
/* Transition */
.cv-tooltip-enter-active,
.cv-tooltip-leave-active {
  transition: opacity 0.15s ease;
}
.cv-tooltip-enter-from,
.cv-tooltip-leave-to {
  opacity: 0;
}
</style>
