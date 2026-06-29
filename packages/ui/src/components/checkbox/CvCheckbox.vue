<script setup lang="ts">
/**
 * CvCheckbox — Civ 6 styled checkbox
 * Gold-bordered checkbox with checkmark animation.
 */
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    disabled?: boolean;
    label?: string;
  }>(),
  {
    modelValue: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const classes = computed(() => [
  "cv-checkbox",
  {
    "cv-checkbox--checked": props.modelValue,
    "cv-checkbox--disabled": props.disabled,
  },
]);

function toggle() {
  if (props.disabled) return;
  emit("update:modelValue", !props.modelValue);
}
</script>

<template>
  <label :class="classes" @click.prevent="toggle">
    <span class="cv-checkbox__box">
      <svg v-if="modelValue" class="cv-checkbox__check" viewBox="0 0 16 16" fill="none">
        <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
    <span v-if="label || $slots.default" class="cv-checkbox__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<style scoped>
.cv-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-family: var(--civ-font-sans);
  font-size: 14px;
  color: var(--civ-text-primary);
  user-select: none;
}
.cv-checkbox--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.cv-checkbox__box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 1px solid var(--civ-border-default);
  background: var(--civ-bg-primary);
  border-radius: var(--civ-radius-sm);
  transition: all var(--civ-transition-fast);
  flex-shrink: 0;
}
.cv-checkbox--checked .cv-checkbox__box {
  background: var(--civ-gold-700);
  border-color: var(--civ-gold-500);
  color: var(--civ-gold-50);
}
.cv-checkbox:hover:not(.cv-checkbox--disabled) .cv-checkbox__box {
  border-color: var(--civ-gold-600);
}
.cv-checkbox__check {
  width: 12px;
  height: 12px;
}
</style>
