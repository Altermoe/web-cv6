<script setup lang="ts">
import { CvButton, CvTooltip } from "@webcv6/ui";
</script>

<template>
  <div class="doc-page">
    <h1 class="doc-page__title">Tooltip 文字提示</h1>
    <p class="doc-page__desc">鼠标悬停时的简短提示。</p>
    <h2 class="doc-section__title">基础用法</h2>
    <div class="doc-demo">
      <div class="doc-demo__row">
        <CvTooltip content="生产力 +15%">
          <CvButton size="sm">🔨 工厂</CvButton>
        </CvTooltip>
        <CvTooltip content="解锁「天文学」科技" placement="bottom">
          <CvButton size="sm" variant="info">🔬 观测</CvButton>
        </CvTooltip>
        <CvTooltip content="防御力 +5" placement="left">
          <CvButton size="sm" variant="secondary">🛡️ 城墙</CvButton>
        </CvTooltip>
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
</style>
