<script setup lang="ts">
/**
 * CvProgress — Civ 6 styled progress bar
 * Used for production queues, research progress, unit XP, etc.
 */
import { computed } from "vue";
import type { UiSize, UiVariant } from "../../types/common";

const props = withDefaults(
  defineProps<{
    percentage?: number;
    size?: UiSize;
    variant?: UiVariant;
    showLabel?: boolean;
    striped?: boolean;
    animated?: boolean;
  }>(),
  {
    percentage: 0,
    size: "md",
    variant: "primary",
    showLabel: false,
    striped: false,
    animated: false,
  },
);

const clamped = computed(() => Math.max(0, Math.min(100, props.percentage)));

const barClasses = computed(() => [
  "cv-progress__bar",
  `cv-progress__bar--${props.variant}`,
  {
    "cv-progress__bar--striped": props.striped,
    "cv-progress__bar--animated": props.animated,
  },
]);
</script>

<template>
  <div class="cv-progress" :class="`cv-progress--${size}`">
    <div class="cv-progress__track">
      <div :class="barClasses" :style="{ width: clamped + '%' }">
        <span v-if="showLabel && clamped > 10" class="cv-progress__label">
          {{ Math.round(clamped) }}%
        </span>
      </div>
    </div>
    <span v-if="showLabel && clamped <= 10" class="cv-progress__label-outside">
      {{ Math.round(clamped) }}%
    </span>
  </div>
</template>

<style scoped>
.cv-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.cv-progress--sm {
  height: 6px;
}
.cv-progress--md {
  height: 10px;
}
.cv-progress--lg {
  height: 14px;
}
.cv-progress--xl {
  height: 18px;
}

.cv-progress__track {
  flex: 1;
  height: 100%;
  background: var(--civ-stone-700);
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid var(--civ-border-default);
}
.cv-progress__bar {
  height: 100%;
  border-radius: 1px;
  transition: width var(--civ-transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}
.cv-progress__bar--primary {
  background: linear-gradient(90deg, var(--civ-gold-800), var(--civ-gold-400));
}
.cv-progress__bar--success {
  background: linear-gradient(90deg, #2e7d32, #4caf50);
}
.cv-progress__bar--warning {
  background: linear-gradient(90deg, #e65100, #ff9800);
}
.cv-progress__bar--danger {
  background: linear-gradient(90deg, #b71c1c, #f44336);
}
.cv-progress__bar--info {
  background: linear-gradient(90deg, #0d47a1, #2196f3);
}
.cv-progress__bar--secondary {
  background: linear-gradient(90deg, var(--civ-stone-700), var(--civ-stone-500));
}

.cv-progress__bar--striped {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.1) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.1) 75%,
    transparent 75%,
    transparent
  );
  background-size: 16px 16px;
}
.cv-progress__bar--animated.cv-progress__bar--striped {
  animation: cv-progress-stripes 0.8s linear infinite;
}
@keyframes cv-progress-stripes {
  from {
    background-position: 16px 0;
  }
  to {
    background-position: 0 0;
  }
}

.cv-progress__label {
  font-size: 10px;
  color: var(--civ-gold-50);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
}
.cv-progress__label-outside {
  font-size: 12px;
  color: var(--civ-text-secondary);
  font-variant-numeric: tabular-nums;
  min-width: 32px;
}
</style>
