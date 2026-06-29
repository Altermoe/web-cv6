<script setup lang="ts">
import { CvDivider } from "@webcv6/ui";
</script>

<template>
  <div class="doc-page">
    <h1 class="doc-page__title">Divider 分割线</h1>
    <p class="doc-page__desc">用于分隔内容区域的装饰线。</p>
    <h2 class="doc-section__title">基础用法</h2>
    <div class="doc-demo">
      <p class="doc-demo__text">上方内容</p>
      <CvDivider />
      <p class="doc-demo__text">下方内容</p>
    </div>
    <h2 class="doc-section__title">带文本</h2>
    <div class="doc-demo">
      <CvDivider label="回合 100" />
      <CvDivider label="文艺复兴时代" />
    </div>
    <h2 class="doc-section__title">装饰线</h2>
    <div class="doc-demo">
      <CvDivider ornamental label="世界议会" />
      <CvDivider ornamental />
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
.doc-demo__text {
  color: var(--civ-text-muted);
  font-size: 13px;
  margin: 8px 0;
}
</style>
