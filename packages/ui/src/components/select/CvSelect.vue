<script setup lang="ts">
/**
 * CvSelect — Civ 6 styled dropdown select
 * Built on reka-ui Select primitives with ScrollArea for long lists.
 */
import { computed } from "vue";
import {
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from "reka-ui";
import {
  ScrollAreaRoot,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "reka-ui";
import type { UiSize } from "../../types/common";

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  icon?: string;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    options?: SelectOption[];
    placeholder?: string;
    size?: UiSize;
    disabled?: boolean;
    clearable?: boolean;
  }>(),
  {
    options: () => [],
    size: "md",
    disabled: false,
    clearable: false,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string | number];
  change: [value: string | number];
}>();

const classes = computed(() => [
  "cv-select",
  `cv-select--${props.size}`,
  { "cv-select--disabled": props.disabled },
]);

function onUpdate(val: string | number | undefined) {
  const v = val ?? "";
  emit("update:modelValue", v);
  emit("change", v);
}

function onClear(e: MouseEvent) {
  e.stopPropagation();
  emit("update:modelValue", "");
  emit("change", "");
}
</script>

<template>
  <div :class="classes">
    <SelectRoot
      :model-value="modelValue"
      :disabled="disabled"
      @update:model-value="onUpdate"
    >
      <SelectTrigger class="cv-select__trigger">
        <SelectValue :placeholder="placeholder" class="cv-select__value" />
        <SelectIcon class="cv-select__arrow">▾</SelectIcon>
      </SelectTrigger>

      <SelectPortal>
        <SelectContent class="cv-select__content" position="popper" :side-offset="4">
          <ScrollAreaRoot type="auto" class="cv-select__scroll-root">
            <SelectViewport as-child>
              <ScrollAreaViewport class="cv-select__scroll-viewport">
                <SelectItem
                  v-for="opt in options"
                  :key="String(opt.value)"
                  :value="opt.value"
                  :disabled="opt.disabled"
                  class="cv-select__item"
                >
                  <span v-if="opt.icon" class="cv-select__item-icon">{{ opt.icon }}</span>
                  <SelectItemText>{{ opt.label }}</SelectItemText>
                  <SelectItemIndicator class="cv-select__indicator">✓</SelectItemIndicator>
                </SelectItem>

                <SelectSeparator v-if="options.length > 0" class="cv-select__separator" />
              </ScrollAreaViewport>
            </SelectViewport>

            <ScrollAreaScrollbar
              class="cv-select__scrollbar"
              orientation="vertical"
            >
              <ScrollAreaThumb class="cv-select__scrollbar-thumb" />
            </ScrollAreaScrollbar>
          </ScrollAreaRoot>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>

    <span
      v-if="clearable && modelValue != null && modelValue !== ''"
      class="cv-select__clear"
      @click="onClear"
    >✕</span>
  </div>
</template>

<style scoped>
.cv-select {
  display: inline-flex;
  align-items: center;
  position: relative;
  font-family: var(--civ-font-sans);
  user-select: none;
}

/* === Trigger === */
.cv-select__trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--civ-bg-primary);
  border: 1px solid var(--civ-border-default);
  cursor: pointer;
  font-family: var(--civ-font-sans);
  transition: all var(--civ-transition-fast);
  outline: none;
  width: 100%;
}

.cv-select__trigger[data-state="open"] {
  border-color: var(--civ-gold-400);
  box-shadow: 0 0 0 2px rgba(230, 180, 34, 0.2);
}

.cv-select__trigger[data-disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Sizes */
.cv-select--sm .cv-select__trigger {
  height: 28px;
  padding: 0 8px;
  font-size: 12px;
}
.cv-select--md .cv-select__trigger {
  height: 36px;
  padding: 0 12px;
  font-size: 14px;
}
.cv-select--lg .cv-select__trigger {
  height: 44px;
  padding: 0 16px;
  font-size: 16px;
}
.cv-select--xl .cv-select__trigger {
  height: 52px;
  padding: 0 20px;
  font-size: 18px;
}

.cv-select__value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--civ-text-primary);
}

.cv-select__arrow {
  color: var(--civ-text-muted);
  font-size: 10px;
  transition: transform var(--civ-transition-fast);
}

.cv-select__clear {
  position: absolute;
  right: 28px;
  color: var(--civ-text-muted);
  font-size: 12px;
  cursor: pointer;
  line-height: 1;
}
.cv-select__clear:hover {
  color: var(--civ-danger);
}

/* === Content (dropdown) === */
.cv-select__content {
  z-index: 1000;
  background: var(--civ-bg-panel);
  border: 1px solid var(--civ-gold-700);
  box-shadow: var(--civ-shadow-lg);
  border-radius: var(--civ-radius-md);
  overflow: hidden;
  min-width: var(--reka-select-trigger-width);
  max-height: 280px;
}

.cv-select__scroll-root {
  width: 100%;
  max-height: 280px;
}

.cv-select__scroll-viewport {
  width: 100%;
  max-height: 280px;
  padding: 4px 0;
}

/* === Scrollbar === */
.cv-select__scrollbar {
  display: flex;
  user-select: none;
  touch-action: none;
  width: 8px;
  padding: 2px;
  transition: background var(--civ-transition-fast);
  background: rgba(26, 25, 21, 0.3);
  border-radius: 8px;
}

.cv-select__scrollbar:hover {
  background: rgba(26, 25, 21, 0.5);
}

.cv-select__scrollbar-thumb {
  flex: 1;
  background: var(--civ-stone-500);
  border-radius: 8px;
  border: 1px solid var(--civ-stone-700);
  transition: background var(--civ-transition-fast);
}

.cv-select__scrollbar-thumb:hover {
  background: var(--civ-gold-600);
  border-color: var(--civ-gold-500);
}

/* === Items === */
.cv-select__item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  color: var(--civ-text-primary);
  cursor: pointer;
  outline: none;
  transition: background var(--civ-transition-fast);
  font-size: inherit;
  position: relative;
  border-radius: 0;
}

.cv-select__item[data-highlighted] {
  background: var(--civ-bg-surface);
}

.cv-select__item[data-state="checked"] {
  background: rgba(230, 180, 34, 0.15);
  color: var(--civ-gold-400);
}

.cv-select__item[data-disabled] {
  opacity: 0.4;
  cursor: not-allowed;
}

.cv-select__item-icon {
  margin-right: 2px;
}

.cv-select__indicator {
  position: absolute;
  right: 8px;
  color: var(--civ-gold-500);
  font-size: 12px;
}

.cv-select__separator {
  height: 1px;
  background: var(--civ-border-default);
  margin: 4px 0;
}
</style>
