<script setup lang="ts">
/**
 * CvSelect — Civ 6 styled dropdown select
 * Stone-bordered dropdown with gold highlight on selected item.
 */
import { computed, nextTick, ref } from "vue";
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

const open = ref(false);
const dropdownRef = ref<HTMLDivElement>();

const selectedLabel = computed(() => {
  const opt = props.options.find((o) => o.value === props.modelValue);
  return opt?.label ?? "";
});

const classes = computed(() => [
  "cv-select",
  `cv-select--${props.size}`,
  {
    "cv-select--open": open.value,
    "cv-select--disabled": props.disabled,
  },
]);

function toggle() {
  if (props.disabled) return;
  open.value = !open.value;
}

function select(option: SelectOption) {
  if (option.disabled) return;
  emit("update:modelValue", option.value);
  emit("change", option.value);
  open.value = false;
}

function onClear(e: MouseEvent) {
  e.stopPropagation();
  emit("update:modelValue", "");
  emit("change", "");
}

function onClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    open.value = false;
  }
}

// Register global click listener
nextTick(() => {
  if (typeof document !== "undefined") {
    document.addEventListener("click", onClickOutside);
  }
});
</script>

<template>
  <div ref="dropdownRef" :class="classes" @click="toggle">
    <div class="cv-select__trigger">
      <span class="cv-select__value">{{ selectedLabel || placeholder }}</span>
      <span v-if="clearable && modelValue != null && modelValue !== ''" class="cv-select__clear" @click="onClear">✕</span>
      <span class="cv-select__arrow" :class="{ 'cv-select__arrow--open': open }">▾</span>
    </div>
    <Transition name="cv-select-dropdown">
      <div v-if="open" class="cv-select__dropdown">
        <div
          v-for="opt in options"
          :key="opt.value"
          class="cv-select__option"
          :class="{
            'cv-select__option--selected': opt.value === modelValue,
            'cv-select__option--disabled': opt.disabled,
          }"
          @click.stop="select(opt)"
        >
          <span v-if="opt.icon" class="cv-select__option-icon">{{ opt.icon }}</span>
          {{ opt.label }}
        </div>
        <div v-if="options.length === 0" class="cv-select__empty">无选项</div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.cv-select {
  display: inline-flex;
  align-items: center;
  position: relative;
  background: var(--civ-bg-primary);
  border: 1px solid var(--civ-border-default);
  cursor: pointer;
  font-family: var(--civ-font-sans);
  transition: all var(--civ-transition-fast);
  user-select: none;
}

/* Sizes */
.cv-select--sm {
  height: 28px;
  padding: 0 8px;
  font-size: 12px;
}
.cv-select--md {
  height: 36px;
  padding: 0 12px;
  font-size: 14px;
}
.cv-select--lg {
  height: 44px;
  padding: 0 16px;
  font-size: 16px;
}
.cv-select--xl {
  height: 52px;
  padding: 0 20px;
  font-size: 18px;
}

.cv-select--open {
  border-color: var(--civ-gold-400);
  box-shadow: 0 0 0 2px rgba(230, 180, 34, 0.2);
}
.cv-select--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cv-select__trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
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
  transition: transform var(--civ-transition-fast);
  font-size: 10px;
}
.cv-select__arrow--open {
  transform: rotate(180deg);
}
.cv-select__clear {
  color: var(--civ-text-muted);
  font-size: 12px;
  cursor: pointer;
}
.cv-select__clear:hover {
  color: var(--civ-danger);
}

/* Dropdown */
.cv-select__dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  min-width: 100%;
  background: var(--civ-bg-panel);
  border: 1px solid var(--civ-gold-700);
  box-shadow: var(--civ-shadow-lg);
  z-index: 1000;
  max-height: 240px;
  overflow-y: auto;
}
.cv-select__option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  color: var(--civ-text-primary);
  transition: background var(--civ-transition-fast);
}
.cv-select__option:hover:not(.cv-select__option--disabled) {
  background: var(--civ-bg-surface);
}
.cv-select__option--selected {
  background: rgba(230, 180, 34, 0.15);
  color: var(--civ-gold-400);
  border-left: 2px solid var(--civ-gold-500);
}
.cv-select__option--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.cv-select__empty {
  padding: 8px 12px;
  color: var(--civ-text-muted);
  text-align: center;
  font-size: 12px;
}

/* Transition */
.cv-select-dropdown-enter-active,
.cv-select-dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.cv-select-dropdown-enter-from,
.cv-select-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
