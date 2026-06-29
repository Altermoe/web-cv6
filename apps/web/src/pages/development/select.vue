<script setup lang="ts">
import { ref } from "vue";
import { CvSelect } from "@webcv6/ui";

const civilization = ref("");
const civOptions = [
  { label: "中国 (秦始皇)", value: "china", icon: "🐉" },
  { label: "美国 (罗斯福)", value: "usa", icon: "🦅" },
  { label: "罗马 (图拉真)", value: "rome", icon: "🏛️" },
  { label: "埃及 (克娄巴特拉)", value: "egypt", icon: "🏜️" },
  { label: "日本 (圣德太子)", value: "japan", icon: "⛩️" },
  { label: "德国 (腓特烈)", value: "germany", icon: "🦅" },
];

const era = ref("classical");
const eraOptions = [
  { label: "远古时代", value: "ancient" },
  { label: "古典时代", value: "classical" },
  { label: "中世纪", value: "medieval" },
  { label: "文艺复兴", value: "renaissance" },
  { label: "工业时代", value: "industrial" },
  { label: "现代", value: "modern" },
  { label: "原子能时代", value: "atomic" },
  { label: "信息时代", value: "information" },
];
</script>

<template>
  <div class="doc-page">
    <h1 class="doc-page__title">Select 选择器</h1>
    <p class="doc-page__desc">下拉选择器，用于选择文明、时代等。</p>

    <h2 class="doc-section__title">基础用法</h2>
    <div class="doc-demo">
      <div class="doc-demo__row">
        <CvSelect v-model="era" :options="eraOptions" placeholder="选择时代" style="width: 200px" />
        <span class="doc-demo__label">当前: {{ era }}</span>
      </div>
    </div>

    <h2 class="doc-section__title">带图标选项</h2>
    <div class="doc-demo">
      <div class="doc-demo__row">
        <CvSelect
          v-model="civilization"
          :options="civOptions"
          placeholder="选择你的文明"
          style="width: 260px"
          clearable
        />
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
.doc-demo__label {
  color: var(--civ-text-muted);
  font-size: 13px;
}
</style>
