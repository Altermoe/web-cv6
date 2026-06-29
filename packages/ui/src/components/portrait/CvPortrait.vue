<script setup lang="ts">
/**
 * CvPortrait — Civ 6 styled leader/unit portrait
 * Ornate circular or square frame for leader portraits and unit icons.
 */
import type { UiVariant } from "../../types/common";

const props = withDefaults(
  defineProps<{
    src?: string;
    name?: string;
    variant?: UiVariant;
    shape?: "circle" | "square";
    size?: number;
    badge?: string;
  }>(),
  {
    variant: "primary",
    shape: "circle",
    size: 64,
  },
);
</script>

<template>
  <div
    class="cv-portrait"
    :class="[`cv-portrait--${variant}`, `cv-portrait--${shape}`]"
    :style="{ width: size + 'px', height: size + 'px' }"
  >
    <img v-if="src" :src="src" :alt="name || ''" class="cv-portrait__img" />
    <div v-else class="cv-portrait__placeholder">
      <slot>{{ name?.charAt(0) || '?' }}</slot>
    </div>
    <span v-if="badge" class="cv-portrait__badge">{{ badge }}</span>
  </div>
</template>

<style scoped>
.cv-portrait {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid var(--civ-gold-700);
  box-shadow: var(--civ-shadow-md);
}
.cv-portrait--circle {
  border-radius: 50%;
}
.cv-portrait--square {
  border-radius: var(--civ-radius-md);
}
.cv-portrait--primary {
  border-color: var(--civ-gold-600);
}
.cv-portrait--info {
  border-color: #1565c0;
}
.cv-portrait__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cv-portrait__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--civ-bg-secondary);
  color: var(--civ-gold-400);
  font-size: 1.5em;
  font-weight: 600;
  font-family: var(--civ-font-display);
}
.cv-portrait__badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: var(--civ-gold-700);
  color: var(--civ-gold-50);
  font-size: 10px;
  padding: 1px 4px;
  border-radius: var(--civ-radius-sm);
  font-family: var(--civ-font-sans);
  font-weight: 600;
}
</style>
