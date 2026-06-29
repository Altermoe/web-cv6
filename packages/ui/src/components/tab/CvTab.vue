<script setup lang="ts">
/**
 * CvTab — Civ 6 styled tab navigation
 * Used in city panels, diplomacy screens, settings, etc.
 */
import { computed, provide } from "vue";

export interface TabItem {
  key: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    tabs?: TabItem[];
    size?: "sm" | "md" | "lg";
    bordered?: boolean;
  }>(),
  {
    modelValue: "",
    size: "md",
    bordered: true,
  },
);

const emit = defineEmits<{
  "update:modelValue": [key: string];
}>();

provide("activeTab", computed(() => props.modelValue));

function selectTab(tab: TabItem) {
  if (tab.disabled) return;
  emit("update:modelValue", tab.key);
}
</script>

<template>
  <div class="cv-tabs" :class="[`cv-tabs--${size}`, { 'cv-tabs--bordered': bordered }]">
    <div class="cv-tabs__nav">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="cv-tabs__tab"
        :class="{
          'cv-tabs__tab--active': tab.key === modelValue,
          'cv-tabs__tab--disabled': tab.disabled,
        }"
        @click="selectTab(tab)"
      >
        <span v-if="tab.icon" class="cv-tabs__tab-icon">{{ tab.icon }}</span>
        {{ tab.label }}
      </button>
    </div>
    <div class="cv-tabs__content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.cv-tabs {
  font-family: var(--civ-font-sans);
  color: var(--civ-text-primary);
}
.cv-tabs--bordered {
  border: 1px solid var(--civ-border-default);
}

.cv-tabs__nav {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--civ-border-default);
  background: var(--civ-bg-secondary);
  overflow-x: auto;
}
.cv-tabs--sm .cv-tabs__tab {
  padding: 6px 12px;
  font-size: 12px;
}
.cv-tabs--md .cv-tabs__tab {
  padding: 8px 16px;
  font-size: 14px;
}
.cv-tabs--lg .cv-tabs__tab {
  padding: 10px 20px;
  font-size: 16px;
}

.cv-tabs__tab {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--civ-text-secondary);
  cursor: pointer;
  font: inherit;
  white-space: nowrap;
  transition: all var(--civ-transition-fast);
}
.cv-tabs__tab:hover:not(.cv-tabs__tab--disabled) {
  color: var(--civ-text-primary);
  background: rgba(255, 255, 255, 0.03);
}
.cv-tabs__tab--active {
  color: var(--civ-gold-400);
  border-bottom-color: var(--civ-gold-500);
}
.cv-tabs__tab--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.cv-tabs__tab-icon {
  font-size: 0.9em;
}

.cv-tabs__content {
  padding: 16px;
}
</style>
