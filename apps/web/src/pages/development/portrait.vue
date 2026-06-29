<script setup lang="ts">
import { CvPortrait } from "@webcv6/ui";
</script>

<template>
  <div class="doc-page">
    <h1 class="doc-page__title">Portrait 肖像</h1>
    <p class="doc-page__desc">领袖或单位头像框，支持圆形和方形。</p>
    <h2 class="doc-section__title">基础用法</h2>
    <div class="doc-demo">
      <div class="doc-demo__row">
        <CvPortrait name="秦始皇" :size="64" />
        <CvPortrait name="Roosevelt" :size="64" shape="square" variant="info" />
        <CvPortrait name="?" :size="48" />
        <CvPortrait name="Caesar" :size="80" badge="⚔️" />
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
  gap: 16px;
}
</style>
