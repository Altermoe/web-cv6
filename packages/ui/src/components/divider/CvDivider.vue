<script setup lang="ts">
/**
 * CvDivider — Civ 6 styled divider
 * Decorative horizontal line with optional label and gold ornament style.
 */
withDefaults(
  defineProps<{
    label?: string;
    ornamental?: boolean;
  }>(),
  {
    ornamental: false,
  },
);
</script>

<template>
  <div class="cv-divider" :class="{ 'cv-divider--ornamental': ornamental }">
    <div v-if="ornamental" class="cv-divider__line cv-divider__line--left" />
    <div v-if="label || $slots.default" class="cv-divider__content">
      <slot>{{ label }}</slot>
    </div>
    <div v-if="ornamental" class="cv-divider__line cv-divider__line--right" />
    <div v-if="!ornamental && !label && !$slots.default" class="cv-divider__line cv-divider__line--full" />
  </div>
</template>

<style scoped>
.cv-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--civ-text-muted);
  font-family: var(--civ-font-sans);
  font-size: 12px;
  user-select: none;
}
.cv-divider__line {
  flex: 1;
  height: 1px;
}
.cv-divider__line--full {
  background: var(--civ-border-default);
}
.cv-divider__line--left,
.cv-divider__line--right {
  background: linear-gradient(90deg, transparent, var(--civ-gold-700));
}
.cv-divider__line--right {
  background: linear-gradient(90deg, var(--civ-gold-700), transparent);
}
.cv-divider--ornamental {
  gap: 16px;
}
.cv-divider__content {
  white-space: nowrap;
  color: var(--civ-gold-600);
  font-weight: 500;
}
</style>
