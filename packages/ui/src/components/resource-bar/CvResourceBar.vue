<script setup lang="ts">
/**
 * CvResourceBar — Civ 6 styled resource display bar
 * Shows a resource icon, label, and current/max value.
 * Used for gold, science, culture, faith, production, food, etc.
 */
import { computed } from "vue";
import type { UiVariant } from "../../types/common";

const props = withDefaults(
  defineProps<{
    label?: string;
    icon?: string;
    value?: number;
    maxValue?: number;
    variant?: UiVariant;
    showBar?: boolean;
  }>(),
  {
    value: 0,
    variant: "primary",
    showBar: false,
  },
);

const percentage = computed(() => {
  if (props.maxValue == null || props.maxValue <= 0) return 0;
  return Math.max(0, Math.min(100, (props.value / props.maxValue) * 100));
});
</script>

<template>
  <div class="cv-resource-bar" :class="`cv-resource-bar--${variant}`">
    <span v-if="icon" class="cv-resource-bar__icon">{{ icon }}</span>
    <span class="cv-resource-bar__label">{{ label }}</span>
    <span class="cv-resource-bar__value">{{ value }}</span>
    <div v-if="showBar" class="cv-resource-bar__track">
      <div class="cv-resource-bar__fill" :style="{ width: percentage + '%' }" />
    </div>
  </div>
</template>

<style scoped>
.cv-resource-bar {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--civ-font-sans);
  font-size: 13px;
  color: var(--civ-text-primary);
  padding: 2px 8px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: var(--civ-radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.cv-resource-bar--primary {
  color: var(--civ-gold-300);
}
.cv-resource-bar--success {
  color: var(--civ-success);
}
.cv-resource-bar--warning {
  color: var(--civ-warning);
}
.cv-resource-bar--danger {
  color: var(--civ-danger);
}
.cv-resource-bar--info {
  color: var(--civ-info);
}
.cv-resource-bar__icon {
  font-size: 1.1em;
}
.cv-resource-bar__label {
  color: var(--civ-text-secondary);
}
.cv-resource-bar__value {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}
.cv-resource-bar__track {
  width: 40px;
  height: 4px;
  background: var(--civ-stone-700);
  border-radius: 2px;
  overflow: hidden;
}
.cv-resource-bar__fill {
  height: 100%;
  background: currentColor;
  border-radius: 2px;
}
</style>
