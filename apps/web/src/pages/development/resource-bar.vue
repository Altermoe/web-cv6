<script setup lang="ts">
import { CvResourceBar } from "@webcv6/ui";
</script>

<template>
  <div class="doc-page">
    <h1 class="doc-page__title">ResourceBar 资源条</h1>
    <p class="doc-page__desc">显示金币、科技、文化、信仰等资源数值。</p>
    <h2 class="doc-section__title">顶部资源栏</h2>
    <div class="doc-demo">
      <div class="doc-demo__row">
        <CvResourceBar icon="💰" label="金币" :value="2450" />
        <CvResourceBar icon="🔬" label="科技" :value="120" variant="info" />
        <CvResourceBar icon="🏛️" label="文化" :value="85" variant="warning" />
        <CvResourceBar icon="🙏" label="信仰" :value="340" />
      </div>
    </div>
    <h2 class="doc-section__title">带进度条</h2>
    <div class="doc-demo">
      <div class="doc-demo__col">
        <CvResourceBar icon="🌾" label="粮食" :value="45" :max-value="60" show-bar />
        <CvResourceBar
          icon="🔨"
          label="产能"
          :value="18"
          :max-value="30"
          show-bar
          variant="warning"
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
  gap: 8px;
  flex-wrap: wrap;
}
.doc-demo__col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
