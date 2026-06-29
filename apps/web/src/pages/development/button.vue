<script setup lang="ts">
/**
 * /development/button — CvButton documentation
 */
import { ref } from "vue";
import { CvButton } from "@webcv6/ui";

const loading = ref(false);

function simulateLoading() {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 2000);
}
</script>

<template>
  <div class="doc-page">
    <h1 class="doc-page__title">Button 按钮</h1>
    <p class="doc-page__desc">常用的操作按钮，采用 Civ 6 金色渐变风格。</p>

    <h2 class="doc-section__title">基础用法</h2>
    <div class="doc-demo">
      <div class="doc-demo__row">
        <CvButton>Primary</CvButton>
        <CvButton variant="secondary">Secondary</CvButton>
        <CvButton variant="success">Success</CvButton>
        <CvButton variant="warning">Warning</CvButton>
        <CvButton variant="danger">Danger</CvButton>
        <CvButton variant="info">Info</CvButton>
      </div>
    </div>

    <h2 class="doc-section__title">尺寸</h2>
    <div class="doc-demo">
      <div class="doc-demo__row">
        <CvButton size="sm">Small</CvButton>
        <CvButton size="md">Medium</CvButton>
        <CvButton size="lg">Large</CvButton>
        <CvButton size="xl">X-Large</CvButton>
      </div>
    </div>

    <h2 class="doc-section__title">圆角形状</h2>
    <div class="doc-demo">
      <div class="doc-demo__row">
        <CvButton shape="rect">Rect</CvButton>
        <CvButton shape="rounded">Rounded</CvButton>
        <CvButton shape="pill">Pill</CvButton>
      </div>
    </div>

    <h2 class="doc-section__title">图标与加载</h2>
    <div class="doc-demo">
      <div class="doc-demo__row">
        <CvButton icon="⚔️">Attack</CvButton>
        <CvButton icon="🛡️" variant="info">Defend</CvButton>
        <CvButton :loading="loading" @click="simulateLoading">
          {{ loading ? "Building..." : "Build Wonder" }}
        </CvButton>
      </div>
    </div>

    <h2 class="doc-section__title">禁用状态</h2>
    <div class="doc-demo">
      <div class="doc-demo__row">
        <CvButton disabled>Disabled</CvButton>
        <CvButton variant="secondary" disabled>Disabled</CvButton>
      </div>
    </div>

    <h2 class="doc-section__title">按钮组</h2>
    <div class="doc-demo">
      <div class="doc-demo__row">
        <div class="inline-flex gap-1">
          <CvButton size="sm">Move</CvButton>
          <CvButton size="sm" variant="danger">Attack</CvButton>
          <CvButton size="sm" variant="info">Fortify</CvButton>
          <CvButton size="sm" variant="secondary">Skip</CvButton>
        </div>
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
