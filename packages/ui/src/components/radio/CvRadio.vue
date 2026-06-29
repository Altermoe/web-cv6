<script setup lang="ts">
/**
 * CvRadio — Civ 6 styled radio button
 */
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    value?: string | number;
    disabled?: boolean;
    label?: string;
  }>(),
  {
    disabled: false,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string | number];
}>();

const checked = computed(() => props.modelValue === props.value);

const classes = computed(() => [
  "cv-radio",
  {
    "cv-radio--checked": checked.value,
    "cv-radio--disabled": props.disabled,
  },
]);

function select() {
  if (props.disabled) return;
  if (props.value !== undefined) emit("update:modelValue", props.value);
}
</script>

<template>
  <label :class="classes" @click.prevent="select">
    <span class="cv-radio__circle">
      <span v-if="checked" class="cv-radio__dot" />
    </span>
    <span v-if="label || $slots.default" class="cv-radio__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<style scoped>
.cv-radio {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-family: var(--civ-font-sans);
  font-size: 14px;
  color: var(--civ-text-primary);
  user-select: none;
}
.cv-radio--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.cv-radio__circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 1px solid var(--civ-border-default);
  background: var(--civ-bg-primary);
  border-radius: 50%;
  transition: all var(--civ-transition-fast);
  flex-shrink: 0;
}
.cv-radio--checked .cv-radio__circle {
  border-color: var(--civ-gold-500);
}
.cv-radio:hover:not(.cv-radio--disabled) .cv-radio__circle {
  border-color: var(--civ-gold-600);
}
.cv-radio__dot {
  width: 8px;
  height: 8px;
  background: var(--civ-gold-400);
  border-radius: 50%;
}
</style>
