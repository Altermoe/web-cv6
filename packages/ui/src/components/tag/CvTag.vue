<script setup lang="ts">
/**
 * CvTag — Civ 6 styled tag / badge
 * Used for era labels, unit promotions, resource types, etc.
 */
import type { UiVariant, UiSize } from "../../types/common";

const props = withDefaults(
  defineProps<{
    variant?: UiVariant;
    size?: UiSize;
    closable?: boolean;
    icon?: string;
  }>(),
  {
    variant: "primary",
    size: "md",
    closable: false,
  },
);

const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <span class="cv-tag" :class="[`cv-tag--${variant}`, `cv-tag--${size}`]">
    <span v-if="icon" class="cv-tag__icon">{{ icon }}</span>
    <slot />
    <button v-if="closable" class="cv-tag__close" @click="emit('close')">✕</button>
  </span>
</template>

<style scoped>
.cv-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--civ-font-sans);
  border: 1px solid;
  user-select: none;
}
.cv-tag--sm {
  padding: 1px 6px;
  font-size: 11px;
}
.cv-tag--md {
  padding: 2px 8px;
  font-size: 12px;
}
.cv-tag--lg {
  padding: 4px 12px;
  font-size: 14px;
}
.cv-tag--xl {
  padding: 6px 14px;
  font-size: 16px;
}
.cv-tag--primary {
  background: rgba(230, 180, 34, 0.15);
  border-color: var(--civ-gold-700);
  color: var(--civ-gold-300);
}
.cv-tag--secondary {
  background: rgba(127, 121, 106, 0.2);
  border-color: var(--civ-stone-600);
  color: var(--civ-stone-300);
}
.cv-tag--success {
  background: rgba(76, 175, 80, 0.15);
  border-color: #388e3c;
  color: #81c784;
}
.cv-tag--warning {
  background: rgba(255, 152, 0, 0.15);
  border-color: #ef6c00;
  color: #ffb74d;
}
.cv-tag--danger {
  background: rgba(244, 67, 54, 0.15);
  border-color: #d32f2f;
  color: #ef9a9a;
}
.cv-tag--info {
  background: rgba(33, 150, 243, 0.15);
  border-color: #1565c0;
  color: #90caf9;
}
.cv-tag__close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 10px;
  padding: 0;
  margin-left: 2px;
  opacity: 0.7;
}
.cv-tag__close:hover {
  opacity: 1;
}
</style>
