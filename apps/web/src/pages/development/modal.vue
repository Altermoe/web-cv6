<script setup lang="ts">
import { ref } from "vue";
import { CvButton, CvModal } from "@webcv6/ui";
const showModal = ref(false);
</script>

<template>
  <div class="doc-page">
    <h1 class="doc-page__title">Modal 对话框</h1>
    <p class="doc-page__desc">弹出式对话框，用于外交谈判、奇观建成等重要事件。</p>
    <h2 class="doc-section__title">基础用法</h2>
    <div class="doc-demo">
      <CvButton @click="showModal = true">弹出对话框</CvButton>
    </div>
    <CvModal v-model="showModal" title="🏛️ 奇观建成!" size="md">
      <div style="text-align: center; padding: 16px 0">
        <p style="font-size: 48px; margin-bottom: 8px">🏆</p>
        <p
          style="
            font-size: 18px;
            color: var(--civ-gold-400);
            font-family: var(--civ-font-display);
            margin-bottom: 8px;
          "
        >
          大金字塔已建成!
        </p>
        <p style="color: var(--civ-text-secondary)">
          你的文明获得了 +2 信仰，所有金字塔建筑 +1 产能
        </p>
      </div>
      <template #footer>
        <CvButton @click="showModal = false">太棒了!</CvButton>
      </template>
    </CvModal>
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
</style>
