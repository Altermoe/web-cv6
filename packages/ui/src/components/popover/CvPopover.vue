<script setup lang="ts">
/**
 * CvPopover — Civ 6 styled popover panel
 * Ornate bordered popup with title, used for leader info, tech details, etc.
 */
import { ref } from "vue";
import type { Placement } from "../../types/common";

const props = withDefaults(
  defineProps<{
    title?: string;
    placement?: Placement;
    trigger?: "hover" | "click";
    width?: string;
  }>(),
  {
    placement: "bottom",
    trigger: "click",
    width: "200px",
  },
);

const open = ref(false);
let hoverTimer: ReturnType<typeof setTimeout> | null = null;

function show() {
  if (props.trigger === "hover") {
    hoverTimer = setTimeout(() => {
      open.value = true;
    }, 200);
  } else {
    open.value = !open.value;
  }
}

function hide() {
  if (hoverTimer) clearTimeout(hoverTimer);
  open.value = false;
}
</script>

<template>
  <div class="cv-popover-wrapper" @mouseenter="trigger === 'hover' ? show() : undefined" @mouseleave="trigger === 'hover' ? hide() : undefined">
    <div @click="trigger === 'click' ? show() : undefined">
      <slot name="trigger" />
    </div>
    <Transition name="cv-popover">
      <div v-if="open" class="cv-popover" :class="`cv-popover--${placement}`" :style="{ width }" @click.stop>
        <div v-if="title || $slots.header" class="cv-popover__header">
          <slot name="header">{{ title }}</slot>
        </div>
        <div class="cv-popover__body">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.cv-popover-wrapper {
  display: inline-flex;
  position: relative;
}
.cv-popover {
  position: absolute;
  background: var(--civ-bg-panel);
  border: 1px solid var(--civ-gold-700);
  box-shadow: var(--civ-shadow-lg);
  z-index: 2000;
}
.cv-popover--top {
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}
.cv-popover--bottom {
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}
.cv-popover__header {
  padding: 8px 12px;
  border-bottom: 1px solid var(--civ-border-default);
  font-weight: 600;
  color: var(--civ-gold-400);
  font-size: 13px;
}
.cv-popover__body {
  padding: 8px 12px;
  font-size: 13px;
  color: var(--civ-text-primary);
}
.cv-popover-enter-active,
.cv-popover-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.cv-popover-enter-from,
.cv-popover-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
}
</style>
