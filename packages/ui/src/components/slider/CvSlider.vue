<script setup lang="ts">
/**
 * CvSlider — Civ 6 styled range slider
 * Stone track with gold thumb, used for settings like volume, brightness, etc.
 */
import { computed, ref } from "vue";
import type { UiSize } from "../../types/common";

const props = withDefaults(
  defineProps<{
    modelValue?: number;
    min?: number;
    max?: number;
    step?: number;
    size?: UiSize;
    disabled?: boolean;
    showValue?: boolean;
  }>(),
  {
    modelValue: 0,
    min: 0,
    max: 100,
    step: 1,
    size: "md",
    disabled: false,
    showValue: true,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: number];
}>();

const trackRef = ref<HTMLDivElement>();
const dragging = ref(false);

const percentage = computed(() => {
  const range = props.max - props.min;
  if (range === 0) return 0;
  return ((props.modelValue - props.min) / range) * 100;
});

const classes = computed(() => [
  "cv-slider",
  `cv-slider--${props.size}`,
  {
    "cv-slider--disabled": props.disabled,
    "cv-slider--dragging": dragging.value,
  },
]);

function onTrackClick(e: MouseEvent) {
  if (props.disabled || !trackRef.value) return;
  const rect = trackRef.value.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const raw = props.min + ratio * (props.max - props.min);
  const snapped = Math.round(raw / props.step) * props.step;
  emit("update:modelValue", Math.max(props.min, Math.min(props.max, snapped)));
}

function onDecrease() {
  if (props.disabled) return;
  const next = Math.max(props.min, props.modelValue - props.step);
  emit("update:modelValue", next);
}

function onIncrease() {
  if (props.disabled) return;
  const next = Math.min(props.max, props.modelValue + props.step);
  emit("update:modelValue", next);
}
</script>

<template>
  <div :class="classes">
    <button class="cv-slider__btn" :disabled="disabled" @click="onDecrease">−</button>
    <div ref="trackRef" class="cv-slider__track" @click="onTrackClick">
      <div class="cv-slider__fill" :style="{ width: percentage + '%' }" />
      <div class="cv-slider__thumb" :style="{ left: percentage + '%' }" />
    </div>
    <button class="cv-slider__btn" :disabled="disabled" @click="onIncrease">+</button>
    <span v-if="showValue" class="cv-slider__value">{{ modelValue }}</span>
  </div>
</template>

<style scoped>
.cv-slider {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--civ-font-sans);
  color: var(--civ-text-primary);
  user-select: none;
}
.cv-slider--disabled {
  opacity: 0.5;
  pointer-events: none;
}
.cv-slider__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: var(--civ-stone-700);
  border: 1px solid var(--civ-border-default);
  color: var(--civ-text-secondary);
  cursor: pointer;
  border-radius: var(--civ-radius-sm);
  font-size: 14px;
  flex-shrink: 0;
}
.cv-slider__btn:hover {
  background: var(--civ-stone-600);
  border-color: var(--civ-gold-700);
}
.cv-slider__track {
  position: relative;
  flex: 1;
  height: 6px;
  background: var(--civ-stone-700);
  border-radius: 3px;
  cursor: pointer;
}
.cv-slider__fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, var(--civ-gold-800), var(--civ-gold-500));
  border-radius: 3px;
  transition: width var(--civ-transition-fast);
}
.cv-slider__thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  background: var(--civ-gold-400);
  border: 2px solid var(--civ-gold-600);
  border-radius: 50%;
  box-shadow: var(--civ-shadow-sm);
  transition: left var(--civ-transition-fast);
}
.cv-slider__value {
  min-width: 32px;
  text-align: center;
  font-size: 12px;
  color: var(--civ-gold-400);
  font-variant-numeric: tabular-nums;
}
</style>
