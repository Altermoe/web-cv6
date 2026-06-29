<script setup lang="ts">
</script>

<template>
  <div class="doc-page">
    <h1 class="doc-page__title">快速开始</h1>
    <p class="doc-page__desc">如何在你的 WebGPU 文明游戏中使用 @webcv6/ui 组件。</p>
    <h2 class="doc-section__title">引入样式</h2>
    <pre class="doc-code"><code>import "@webcv6/ui/styles";</code></pre>
    <h2 class="doc-section__title">按需引入</h2>
    <pre
      class="doc-code"
    ><code>import { CvButton, CvPanel, CvResourceBar } from "@webcv6/ui";</code></pre>
    <h2 class="doc-section__title">全局注册（可选）</h2>
    <pre class="doc-code"><code>import * as CvUI from "@webcv6/ui";

const app = createApp(App);
for (const [name, component] of Object.entries(CvUI)) {
  if (name.startsWith("Cv")) {
    app.component(name, component);
  }
}</code></pre>
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
.doc-code {
  background: var(--civ-bg-primary);
  border: 1px solid var(--civ-border-default);
  padding: 12px 16px;
  border-radius: var(--civ-radius-md);
  font-size: 13px;
  color: var(--civ-text-secondary);
  overflow-x: auto;
  margin-bottom: 16px;
}
</style>
