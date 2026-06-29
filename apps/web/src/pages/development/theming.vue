<script setup lang="ts">
</script>

<template>
  <div class="doc-page">
    <h1 class="doc-page__title">主题定制</h1>
    <p class="doc-page__desc">通过 CSS 变量自定义组件的外观。</p>
    <h2 class="doc-section__title">核心变量</h2>
    <pre class="doc-code"><code>:root {
  /* 主色调：金色 */
  --civ-gold-400: #e6b422;
  --civ-gold-500: #d4a017;

  /* 背景色 */
  --civ-bg-primary: #1a1a2e;
  --civ-bg-panel: #1e2a3a;

  /* 文字色 */
  --civ-text-primary: #f0ebe0;
  --civ-text-secondary: #b5b0a1;

  /* 边框 */
  --civ-border-default: #3a3830;
  --civ-border-active: var(--civ-gold-500);
}</code></pre>
    <h2 class="doc-section__title">覆盖主题</h2>
    <pre class="doc-code"><code>/* 自定义暗色主题 */
:root {
  --civ-bg-primary: #0d1117;
  --civ-bg-panel: #161b22;
  --civ-gold-400: #f0c040;
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
