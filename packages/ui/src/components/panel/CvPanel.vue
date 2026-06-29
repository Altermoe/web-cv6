<script setup lang="ts">
/**
 * CvPanel — Civ 6 styled container panel
 * Ornate bordered panel with optional title, used for city screens, leader info, etc.
 */
import type { UiSize } from "../../types/common";

const props = withDefaults(
  defineProps<{
    title?: string;
    size?: UiSize;
    bordered?: boolean;
    collapsible?: boolean;
    collapsed?: boolean;
  }>(),
  {
    size: "md",
    bordered: true,
    collapsible: false,
    collapsed: false,
  },
);

const emit = defineEmits<{
  "update:collapsed": [value: boolean];
}>();

function toggleCollapse() {
  emit("update:collapsed", !props.collapsed);
}
</script>

<template>
  <div class="cv-panel" :class="[`cv-panel--${size}`, { 'cv-panel--bordered': bordered }]">
    <div v-if="title || $slots.header" class="cv-panel__header" @click="collapsible ? toggleCollapse() : undefined">
      <slot name="header">
        <span class="cv-panel__title">{{ title }}</span>
      </slot>
      <span v-if="collapsible" class="cv-panel__toggle" :class="{ 'cv-panel__toggle--collapsed': collapsed }">▾</span>
    </div>
    <Transition name="cv-panel-body">
      <div v-if="!collapsed" class="cv-panel__body">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.cv-panel {
  background: var(--civ-bg-panel);
  font-family: var(--civ-font-sans);
  color: var(--civ-text-primary);
}
.cv-panel--bordered {
  border: 1px solid var(--civ-border-default);
}
.cv-panel--sm {
  font-size: 12px;
}
.cv-panel--md {
  font-size: 14px;
}
.cv-panel--lg {
  font-size: 16px;
}
.cv-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--civ-border-default);
  background: var(--civ-bg-secondary);
  cursor: default;
}
.cv-panel--bordered .cv-panel__header {
  border-bottom-color: var(--civ-gold-800);
}
.cv-panel__title {
  font-family: var(--civ-font-display);
  color: var(--civ-gold-400);
  font-weight: 600;
}
.cv-panel__toggle {
  color: var(--civ-text-muted);
  transition: transform var(--civ-transition-fast);
}
.cv-panel__toggle--collapsed {
  transform: rotate(-90deg);
}
.cv-panel__body {
  padding: 12px;
}
.cv-panel-body-enter-active,
.cv-panel-body-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.cv-panel-body-enter-from,
.cv-panel-body-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
