<script setup lang="ts">
import { ref } from "vue";
import { CvButton, CvToast } from "@webcv6/ui";

interface ToastItem {
  id: number;
  message: string;
  variant: "primary" | "danger" | "warning" | "success" | "info";
  icon: string;
}

const toasts = ref<ToastItem[]>([]);
let nextId = 0;

function show(message: string, variant: "primary" | "danger" | "warning" | "success" | "info" = "primary", icon = "🔔") {
  const id = nextId++;
  toasts.value.push({ id, message, variant, icon });
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, 3500);
}
</script>

<template>
  <div class="doc-page">
    <h1 class="doc-page__title">Toast 通知</h1>
    <p class="doc-page__desc">游戏事件的即时通知，如回合开始、科技完成等。</p>
    <h2 class="doc-section__title">触发通知</h2>
    <div class="doc-demo">
      <div class="doc-demo__row">
        <CvButton size="sm" @click="show('回合 50 开始', 'primary', '📅')">回合通知</CvButton>
        <CvButton size="sm" variant="success" @click="show('天文学研究完成!', 'success', '🔬')"
          >科技完成</CvButton
        >
        <CvButton
          size="sm"
          variant="warning"
          @click="show('蛮族袭击了你的开拓者!', 'warning', '⚔️')"
          >蛮族袭击</CvButton
        >
        <CvButton size="sm" variant="danger" @click="show('城市遭受围攻!', 'danger', '🏰')"
          >围城警告</CvButton
        >
      </div>
    </div>
    <div
      style="
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 5000;
        display: flex;
        flex-direction: column;
        gap: 8px;
      "
    >
      <CvToast
        v-for="t in toasts"
        :key="t.id"
        :message="t.message"
        :variant="t.variant"
        :icon="t.icon"
      />
    </div>
  </div>
</template>

<style scoped>
.doc-page__title {
  font-family: var(--civ-font-display);
  font-size: 28px;
  color: var(--civ-gold-400);
  margin-bottom: 8px;
}
.doc-page__desc {
  color: var(--civ-text-secondary);
  margin-bottom: 24px;
}
.doc-section__title {
  color: var(--civ-gold-400);
  font-size: 18px;
  margin: 24px 0 12px;
  font-family: var(--civ-font-display);
}
.doc-demo {
  padding: 16px;
  background: var(--civ-bg-surface);
  border: 1px solid var(--civ-border-default);
  border-radius: var(--civ-radius-md);
  margin-bottom: 16px;
}
.doc-demo__row {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
