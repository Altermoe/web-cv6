<script setup lang="ts">
import { ref } from "vue";
import { CvRadio } from "@webcv6/ui";
const difficulty = ref("king");
const difficulties = [
  { label: "开拓者", value: "settler" },
  { label: "酋长", value: "chieftain" },
  { label: "战王", value: "warlord" },
  { label: "王子", value: "prince" },
  { label: "国王", value: "king" },
  { label: "皇帝", value: "emperor" },
  { label: "不朽", value: "immortal" },
  { label: "天神", value: "deity" },
];
</script>

<template>
  <div class="doc-page">
    <h1 class="doc-page__title">Radio 单选框</h1>
    <p class="doc-page__desc">在多个选项中选择一个，如难度等级、胜利条件等。</p>
    <h2 class="doc-section__title">选择难度</h2>
    <div class="doc-demo">
      <div class="doc-demo__col">
        <CvRadio
          v-for="d in difficulties"
          :key="d.value"
          v-model="difficulty"
          :value="d.value"
          :label="d.label"
        />
        <span class="doc-demo__label">当前: {{ difficulty }}</span>
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
