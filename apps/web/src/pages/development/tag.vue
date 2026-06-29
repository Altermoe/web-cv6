<script setup lang="ts">
import { CvTag } from "@webcv6/ui";
</script>

<template>
  <div class="doc-page">
    <h1 class="doc-page__title">Tag 标签</h1>
    <p class="doc-page__desc">用于标记时代、单位等级、资源类型等。</p>
    <h2 class="doc-section__title">基础用法</h2>
    <div class="doc-demo">
      <div class="doc-demo__row">
        <CvTag>古典时代</CvTag>
        <CvTag variant="info">科学研究中</CvTag>
        <CvTag variant="success">已完成</CvTag>
        <CvTag variant="warning">需注意</CvTag>
        <CvTag variant="danger">战争!</CvTag>
        <CvTag variant="secondary">和平</CvTag>
      </div>
    </div>
    <h2 class="doc-section__title">带图标</h2>
    <div class="doc-demo">
      <div class="doc-demo__row">
        <CvTag icon="🔬">科学研究</CvTag>
        <CvTag icon="🏛️" variant="info">文化政策</CvTag>
        <CvTag icon="⛪" variant="warning">宗教信仰</CvTag>
        <CvTag icon="🗡️" variant="danger">军事力量</CvTag>
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
  gap: 8px;
  flex-wrap: wrap;
}
</style>
