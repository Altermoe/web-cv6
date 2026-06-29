<script setup lang="ts">
/**
 * CvModal — Civ 6 styled modal dialog
 * Ornate gold-bordered overlay with close button.
 */
import { watch } from "vue";
import type { UiSize } from "../../types/common";

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    title?: string;
    size?: UiSize;
    closable?: boolean;
    maskClosable?: boolean;
  }>(),
  {
    size: "md",
    closable: true,
    maskClosable: true,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

function close() {
  emit("update:modelValue", false);
}

function onMaskClick() {
  if (props.maskClosable) close();
}

watch(
  () => props.modelValue,
  (v) => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = v ? "hidden" : "";
    }
  },
);
</script>

<template>
  <Teleport to="body">
    <Transition name="cv-modal">
      <div v-if="modelValue" class="cv-modal-mask" @click="onMaskClick">
        <div class="cv-modal-container" :class="`cv-modal--${size}`" @click.stop>
          <div class="cv-modal__header">
            <span class="cv-modal__title">{{ title }}</span>
            <button v-if="closable" class="cv-modal__close" @click="close">✕</button>
          </div>
          <div class="cv-modal__body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="cv-modal__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cv-modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  backdrop-filter: blur(2px);
}
.cv-modal-container {
  background: var(--civ-bg-panel);
  border: 1px solid var(--civ-gold-700);
  box-shadow: var(--civ-shadow-lg), 0 0 30px rgba(230, 180, 34, 0.1);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}
.cv-modal--sm {
  width: 360px;
}
.cv-modal--md {
  width: 520px;
}
.cv-modal--lg {
  width: 720px;
}
.cv-modal--xl {
  width: 900px;
}

.cv-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--civ-border-default);
}
.cv-modal__title {
  font-family: var(--civ-font-display);
  color: var(--civ-gold-400);
  font-size: 16px;
  font-weight: 600;
}
.cv-modal__close {
  background: none;
  border: none;
  color: var(--civ-text-muted);
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
}
.cv-modal__close:hover {
  color: var(--civ-danger);
}
.cv-modal__body {
  padding: 16px;
  overflow-y: auto;
  color: var(--civ-text-primary);
}
.cv-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--civ-border-default);
}

.cv-modal-enter-active,
.cv-modal-leave-active {
  transition: opacity 0.2s ease;
}
.cv-modal-enter-from,
.cv-modal-leave-to {
  opacity: 0;
}
.cv-modal-enter-active .cv-modal-container,
.cv-modal-leave-active .cv-modal-container {
  transition: transform 0.2s ease;
}
.cv-modal-enter-from .cv-modal-container,
.cv-modal-leave-to .cv-modal-container {
  transform: scale(0.95);
}
</style>
