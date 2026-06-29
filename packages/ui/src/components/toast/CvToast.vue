<script setup lang="ts">
/**
 * CvToast — Civ 6 styled notification toast
 * Animated notification popup for game events, research complete, etc.
 */
import { onMounted, ref } from "vue";
import type { UiVariant } from "../../types/common";

const props = withDefaults(
  defineProps<{
    message?: string;
    variant?: UiVariant;
    duration?: number;
    icon?: string;
  }>(),
  {
    variant: "info",
    duration: 3000,
  },
);

const emit = defineEmits<{
  close: [];
}>();

const visible = ref(false);

onMounted(() => {
  requestAnimationFrame(() => {
    visible.value = true;
  });
  if (props.duration > 0) {
    setTimeout(() => {
      visible.value = false;
      setTimeout(() => emit("close"), 200);
    }, props.duration);
  }
});
</script>

<template>
  <Transition name="cv-toast">
    <div v-if="visible" class="cv-toast" :class="`cv-toast--${variant}`">
      <span v-if="icon" class="cv-toast__icon">{{ icon }}</span>
      <span class="cv-toast__message">{{ message }}</span>
      <slot />
    </div>
  </Transition>
</template>

<style scoped>
.cv-toast {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--civ-bg-panel);
  border: 1px solid var(--civ-border-default);
  box-shadow: var(--civ-shadow-lg);
  font-family: var(--civ-font-sans);
  font-size: 14px;
  color: var(--civ-text-primary);
  border-left: 3px solid var(--civ-gold-500);
}
.cv-toast--success {
  border-left-color: var(--civ-success);
}
.cv-toast--warning {
  border-left-color: var(--civ-warning);
}
.cv-toast--danger {
  border-left-color: var(--civ-danger);
}
.cv-toast--info {
  border-left-color: var(--civ-info);
}
.cv-toast--primary {
  border-left-color: var(--civ-gold-500);
}
.cv-toast__icon {
  font-size: 1.1em;
}
.cv-toast-enter-active,
.cv-toast-leave-active {
  transition: all 0.3s ease;
}
.cv-toast-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.cv-toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
