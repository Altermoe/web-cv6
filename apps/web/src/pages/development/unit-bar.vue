<script setup lang="ts">
import { CvButton, CvUnitBar } from "@webcv6/ui";
</script>

<template>
  <div class="doc-page">
    <h1 class="doc-page__title">UnitBar 单位操作栏</h1>
    <p class="doc-page__desc">选中单位后显示的操作按钮栏。</p>
    <h2 class="doc-section__title">近战单位</h2>
    <div class="doc-demo">
      <CvUnitBar>
        <CvButton size="sm">🏃 移动</CvButton>
        <CvButton size="sm" variant="danger">⚔️ 攻击</CvButton>
        <CvButton size="sm" variant="info">🛡️ 防御</CvButton>
        <CvButton size="sm" variant="secondary">⏭️ 跳过</CvButton>
      </CvUnitBar>
    </div>
    <h2 class="doc-section__title">远程单位</h2>
    <div class="doc-demo">
      <CvUnitBar>
        <CvButton size="sm">🏃 移动</CvButton>
        <CvButton size="sm" variant="danger">🏹 射击</CvButton>
        <CvButton size="sm" variant="warning">🗡️ 近战</CvButton>
        <CvButton size="sm" variant="info">🛡️ 防御</CvButton>
        <CvButton size="sm" variant="secondary">⏭️ 跳过</CvButton>
      </CvUnitBar>
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
</style>
