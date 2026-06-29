<script setup lang="ts">
/**
 * CvButton — Civ 6 styled button
 * Golden-bordered action button with optional icon, loading state, and size variants.
 */
import { computed } from "vue";
import type { UiSize, UiVariant, UiShape } from "../../types/common";

const props = withDefaults(
  defineProps<{
    variant?: UiVariant;
    size?: UiSize;
    shape?: UiShape;
    disabled?: boolean;
    loading?: boolean;
    icon?: string;
    block?: boolean;
  }>(),
  {
    variant: "primary",
    size: "md",
    shape: "rounded",
    disabled: false,
    loading: false,
    block: false,
  },
);

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const classes = computed(() => [
  "cv-button",
  `cv-button--${props.variant}`,
  `cv-button--${props.size}`,
  `cv-button--${props.shape}`,
  {
    "cv-button--disabled": props.disabled,
    "cv-button--loading": props.loading,
    "cv-button--block": props.block,
  },
]);

function handleClick(e: MouseEvent) {
  if (props.disabled || props.loading) return;
  emit("click", e);
}
</script>

<template>
  <button :class="classes" :disabled="disabled || loading" @click="handleClick">
    <span v-if="loading" class="cv-button__spinner" />
    <span v-else-if="icon" class="cv-button__icon">{{ icon }}</span>
    <span class="cv-button__text">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.cv-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: var(--civ-font-sans);
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--civ-gold-700);
  transition: all var(--civ-transition-fast);
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  user-select: none;
}

/* Sizes */
.cv-button--sm {
  padding: 4px 12px;
  font-size: 12px;
  height: 28px;
}
.cv-button--md {
  padding: 6px 18px;
  font-size: 14px;
  height: 36px;
}
.cv-button--lg {
  padding: 8px 24px;
  font-size: 16px;
  height: 44px;
}
.cv-button--xl {
  padding: 10px 32px;
  font-size: 18px;
  height: 52px;
}

/* Shapes */
.cv-button--rect {
  border-radius: var(--civ-radius-sm);
}
.cv-button--rounded {
  border-radius: var(--civ-radius-md);
}
.cv-button--pill {
  border-radius: 999px;
}

/* Variant: primary (gold) */
.cv-button--primary {
  background: linear-gradient(180deg, var(--civ-gold-600) 0%, var(--civ-gold-800) 100%);
  color: var(--civ-gold-50);
  border-color: var(--civ-gold-600);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
.cv-button--primary:hover:not(.cv-button--disabled) {
  background: linear-gradient(180deg, var(--civ-gold-500) 0%, var(--civ-gold-700) 100%);
  border-color: var(--civ-gold-500);
  box-shadow: var(--civ-shadow-glow);
}
.cv-button--primary:active:not(.cv-button--disabled) {
  background: linear-gradient(180deg, var(--civ-gold-700) 0%, var(--civ-gold-900) 100%);
}

/* Variant: secondary (stone) */
.cv-button--secondary {
  background: linear-gradient(180deg, var(--civ-stone-600) 0%, var(--civ-stone-800) 100%);
  color: var(--civ-stone-100);
  border-color: var(--civ-stone-600);
}
.cv-button--secondary:hover:not(.cv-button--disabled) {
  background: linear-gradient(180deg, var(--civ-stone-500) 0%, var(--civ-stone-700) 100%);
  border-color: var(--civ-stone-500);
}

/* Variant: success */
.cv-button--success {
  background: linear-gradient(180deg, #388e3c 0%, #2e7d32 100%);
  color: #e8f5e9;
  border-color: #388e3c;
}
.cv-button--success:hover:not(.cv-button--disabled) {
  background: linear-gradient(180deg, #43a047 0%, #388e3c 100%);
  box-shadow: 0 0 12px rgba(76, 175, 80, 0.3);
}

/* Variant: warning */
.cv-button--warning {
  background: linear-gradient(180deg, #ef6c00 0%, #e65100 100%);
  color: #fff3e0;
  border-color: #ef6c00;
}
.cv-button--warning:hover:not(.cv-button--disabled) {
  background: linear-gradient(180deg, #f57c00 0%, #ef6c00 100%);
  box-shadow: 0 0 12px rgba(255, 152, 0, 0.3);
}

/* Variant: danger */
.cv-button--danger {
  background: linear-gradient(180deg, #d32f2f 0%, #b71c1c 100%);
  color: #ffebee;
  border-color: #d32f2f;
}
.cv-button--danger:hover:not(.cv-button--disabled) {
  background: linear-gradient(180deg, #e53935 0%, #d32f2f 100%);
  box-shadow: 0 0 12px rgba(244, 67, 54, 0.3);
}

/* Variant: info */
.cv-button--info {
  background: linear-gradient(180deg, #1565c0 0%, #0d47a1 100%);
  color: #e3f2fd;
  border-color: #1565c0;
}
.cv-button--info:hover:not(.cv-button--disabled) {
  background: linear-gradient(180deg, #1976d2 0%, #1565c0 100%);
  box-shadow: 0 0 12px rgba(33, 150, 243, 0.3);
}

/* States */
.cv-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.5);
}
.cv-button--loading {
  cursor: wait;
  pointer-events: none;
}
.cv-button--block {
  display: flex;
  width: 100%;
}

/* Spinner */
.cv-button__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: cv-spin 0.6s linear infinite;
}
@keyframes cv-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

/* Variant: ghost (transparent) */
.cv-button--ghost {
  background: transparent;
  color: var(--civ-text-muted);
  border-color: var(--civ-border-default);
}
.cv-button--ghost:hover:not(.cv-button--disabled) {
  background: rgba(230, 180, 34, 0.05);
  border-color: var(--civ-gold-700);
  color: var(--civ-text-secondary);
}
