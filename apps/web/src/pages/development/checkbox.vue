<script setup lang="ts">
import { computed, ref } from "vue";
import { CvCheckbox } from "@webcv6/ui";
const enabled = ref(true);
const science = ref(true);
const culture = ref(true);
const religion = ref(false);
const espionage = ref(false);
const flags = computed(() => ({
  science: science.value,
  culture: culture.value,
  religion: religion.value,
  espionage: espionage.value,
}));
</script>

<template>
  <div class="doc-page">
    <h1 class="doc-page__title">Checkbox 复选框</h1>
    <p class="doc-page__desc">用于多选场景，如选择启用的游戏功能。</p>
    <h2 class="doc-section__title">基础用法</h2>
    <div class="doc-demo">
      <div class="doc-demo__row">
        <CvCheckbox v-model="enabled" label="启用自动探索" />
        <span class="doc-demo__label">{{ enabled ? "已启用" : "已禁用" }}</span>
      </div>
    </div>
    <h2 class="doc-section__title">复选框组</h2>
    <div class="doc-demo">
      <div class="doc-demo__col">
        <CvCheckbox v-model="science" label="科学研究" />
        <CvCheckbox v-model="culture" label="文化政策" />
        <CvCheckbox v-model="religion" label="宗教信仰" />
        <CvCheckbox v-model="espionage" label="间谍活动" />
        <span class="doc-demo__label">已选: {{ Object.entries(flags).filter(([,v]) => v).map(([k]) => k).join(", ") || "无" }}</span>
      </div>
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
  gap: 12px;
}
.doc-demo__col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.doc-demo__label {
  color: var(--civ-text-muted);
  font-size: 13px;
}
</style>
