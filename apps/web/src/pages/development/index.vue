<script setup lang="ts">
 /**
 * /development — Introduction page
 */
</script>

<template>
  <div class="doc-page">
    <h1 class="doc-page__title">Web-CV6 UI 组件库</h1>
    <p class="doc-page__desc">
      面向 WebGPU 文明类游戏的 Vue 3 组件库，灵感来自 Sid Meier's Civilization VI 的界面设计。
      提供金色边框、石质面板、古典衬线字体等 Civ 6 标志性视觉元素。
    </p>

    <div class="doc-page__features">
      <div class="doc-feature">
        <span class="doc-feature__icon">🎨</span>
        <h3>Civ 6 主题</h3>
        <p>金色、石质、古典三套配色体系，内置 CSS 变量方便定制</p>
      </div>
      <div class="doc-feature">
        <span class="doc-feature__icon">⚡</span>
        <h3>Vue 3 + TypeScript</h3>
        <p>完整类型提示，Composition API 优先，零运行时依赖</p>
      </div>
      <div class="doc-feature">
        <span class="doc-feature__icon">🎮</span>
        <h3>游戏 UI 专用</h3>
        <p>资源条、单位操作栏、肖像框等游戏界面组件</p>
      </div>
    </div>

    <div class="doc-page__install">
      <h2>安装</h2>
      <pre class="doc-code"><code>import { CvButton, CvPanel, CvResourceBar } from "@webcv6/ui";
import "@webcv6/ui/styles";</code></pre>
    </div>
  </div>
</template>

<style scoped>
.doc-page__title {
  font-family: var(--civ-font-display);
  font-size: 28px;
  color: var(--civ-gold-400);
  margin-bottom: 12px;
}
.doc-page__desc {
  color: var(--civ-text-secondary);
  line-height: 1.8;
  margin-bottom: 32px;
}
.doc-page__features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}
.doc-feature {
  padding: 16px;
  background: var(--civ-bg-surface);
  border: 1px solid var(--civ-border-default);
  border-radius: var(--civ-radius-md);
}
.doc-feature__icon {
  font-size: 24px;
  display: block;
  margin-bottom: 8px;
}
.doc-feature h3 {
  color: var(--civ-gold-400);
  font-size: 14px;
  margin-bottom: 4px;
}
.doc-feature p {
  color: var(--civ-text-muted);
  font-size: 12px;
}
.doc-page__install h2 {
  color: var(--civ-gold-400);
  font-size: 18px;
  margin-bottom: 8px;
}
.doc-code {
  background: var(--civ-bg-primary);
  border: 1px solid var(--civ-border-default);
  padding: 12px 16px;
  border-radius: var(--civ-radius-md);
  font-size: 13px;
  color: var(--civ-text-secondary);
  overflow-x: auto;
}
</style>
