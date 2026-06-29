<script setup lang="ts">
/**
 * CvUnitBar — Civ 6 styled unit action bar
 * Horizontal bar of action buttons for a selected unit (Move, Attack, Fortify, etc.)
 */
</script>

<template>
  <div class="cv-unit-bar">
    <slot />
  </div>
</template>

<style scoped>
.cv-unit-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--civ-border-default);
  border-radius: var(--civ-radius-md);
}
</style>
