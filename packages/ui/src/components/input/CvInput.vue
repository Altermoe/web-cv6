<script setup lang="ts">
/**
 * CvInput — Civ 6 styled text input
 * Stone-bordered input with gold focus ring, optional prefix/suffix icons.
 */
import { computed, ref } from "vue";
import type { UiSize } from "../../types/common";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
    size?: UiSize;
    disabled?: boolean;
    readonly?: boolean;
    clearable?: boolean;
    prefixIcon?: string;
    suffixIcon?: string;
    type?: "text" | "password" | "number" | "search";
  }>(),
  {
    modelValue: "",
    size: "md",
    disabled: false,
    readonly: false,
    clearable: false,
    type: "text",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  clear: [];
}>();

const focused = ref(false);
const inputRef = ref<HTMLInputElement>();

const classes = computed(() => [
  "cv-input",
  `cv-input--${props.size}`,
  {
    "cv-input--focused": focused.value,
    "cv-input--disabled": props.disabled,
    "cv-input--readonly": props.readonly,
    "cv-input--has-prefix": !!props.prefixIcon,
    "cv-input--has-suffix": !!props.suffixIcon || (props.clearable && props.modelValue),
  },
]);

function onInput(e: Event) {
  const target = e.target as HTMLInputElement;
  emit("update:modelValue", target.value);
}

function onFocus(e: FocusEvent) {
  focused.value = true;
  emit("focus", e);
}

function onBlur(e: FocusEvent) {
  focused.value = false;
  emit("blur", e);
}

function onClear() {
  emit("update:modelValue", "");
  emit("clear");
  inputRef.value?.focus();
}
</script>

<template>
  <div :class="classes">
    <span v-if="prefixIcon" class="cv-input__prefix">{{ prefixIcon }}</span>
    <input
      ref="inputRef"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      class="cv-input__native"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
    />
    <span
      v-if="clearable && modelValue && !disabled"
      class="cv-input__clear"
      @click="onClear"
    >
      ✕
    </span>
    <span v-else-if="suffixIcon" class="cv-input__suffix">{{ suffixIcon }}</span>
  </div>
</template>

<style scoped>
.cv-input {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--civ-bg-primary);
  border: 1px solid var(--civ-border-default);
  transition: all var(--civ-transition-fast);
  font-family: var(--civ-font-sans);
}

/* Sizes */
.cv-input--sm {
  height: 28px;
  padding: 0 8px;
  font-size: 12px;
}
.cv-input--md {
  height: 36px;
  padding: 0 12px;
  font-size: 14px;
}
.cv-input--lg {
  height: 44px;
  padding: 0 16px;
  font-size: 16px;
}
.cv-input--xl {
  height: 52px;
  padding: 0 20px;
  font-size: 18px;
}

/* States */
.cv-input--focused {
  border-color: var(--civ-gold-400);
  box-shadow: 0 0 0 2px rgba(230, 180, 34, 0.2);
}
.cv-input--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.cv-input--readonly {
  background: var(--civ-bg-secondary);
}

/* Native input */
.cv-input__native {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--civ-text-primary);
  font: inherit;
  min-width: 0;
}
.cv-input__native::placeholder {
  color: var(--civ-text-muted);
}
.cv-input__native::-webkit-search-cancel-button {
  display: none;
}

/* Prefix / Suffix / Clear */
.cv-input__prefix,
.cv-input__suffix {
  color: var(--civ-text-muted);
  font-size: 0.9em;
  flex-shrink: 0;
}
.cv-input__clear {
  color: var(--civ-text-muted);
  cursor: pointer;
  font-size: 12px;
  padding: 2px;
  flex-shrink: 0;
}
.cv-input__clear:hover {
  color: var(--civ-danger);
}
</style>
