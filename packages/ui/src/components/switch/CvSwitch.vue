<script setup lang="ts">
/**
 * CvSwitch — Civ 6 styled toggle switch
 * Gold-accented on/off toggle for game settings.
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
  "cv-switch",
  {
    "cv-switch--checked": props.modelValue,
    "cv-switch--disabled": props.disabled,
  },
]);

function toggle() {
  if (props.disabled) return;
  emit("update:modelValue", !props.modelValue);
}
</script>

<template>
  <label :class="classes" @click.prevent="toggle">
    <span class="cv-switch__track">
      <span class="cv-switch__thumb" />
    </span>
    <span v-if="label || $slots.default" class="cv-switch__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<style scoped>
.cv-switch {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-family: var(--civ-font-sans);
  font-size: 14px;
  color: var(--civ-text-primary);
  user-select: none;
}
.cv-switch--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.cv-switch__track {
  position: relative;
  width: 40px;
  height: 20px;
  border-radius: 10px;
  background: var(--civ-stone-800);
  border: 1px solid var(--civ-border-default);
  transition: all var(--civ-transition-fast);
  flex-shrink: 0;
}
.cv-switch--checked .cv-switch__track {
  background: var(--civ-gold-800);
  border-color: var(--civ-gold-600);
}
.cv-switch:hover:not(.cv-switch--disabled) .cv-switch__track {
  border-color: var(--civ-gold-600);
}
.cv-switch__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--civ-stone-300);
  transition: all var(--civ-transition-fast);
}
.cv-switch--checked .cv-switch__thumb {
  left: 22px;
  background: var(--civ-gold-300);
  box-shadow: 0 0 6px rgba(230, 180, 34, 0.5);
}
.cv-switch__label {
  white-space: nowrap;
}
</style>
