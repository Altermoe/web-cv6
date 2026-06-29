<script setup lang="ts">
import { ref } from "vue";
import { CvTab } from "@webcv6/ui";

const active = ref("production");
const tabs = [
  { key: "production", label: "🔨 生产", icon: "🔨" },
  { key: "science", label: "🔬 科学", icon: "🔬" },
  { key: "culture", label: "🏛️ 文化", icon: "🏛️" },
  { key: "faith", label: "🙏 信仰", icon: "🙏" },
];
</script>

<template>
  <div class="doc-page">
    <h1 class="doc-page__title">Tab 标签页</h1>
    <p class="doc-page__desc">分隔内容的导航组件。</p>
    <h2 class="doc-section__title">基础用法</h2>
    <div class="doc-demo">
      <CvTab v-model="active" :tabs="tabs">
        <div v-if="active === 'production'">
          <p style="color: var(--civ-text-secondary)">正在建造: 奇观「大金字塔」 — 还需 12 回合</p>
        </div>
        <div v-else-if="active === 'science'">
          <p style="color: var(--civ-text-secondary)">正在研究: 天文学 — 还需 8 回合</p>
        </div>
        <div v-else-if="active === 'culture'">
          <p style="color: var(--civ-text-secondary)">市政: 外交政治 — 还需 15 回合</p>
        </div>
        <div v-else>
          <p style="color: var(--civ-text-secondary)">信仰值: 340 — 可购买使徒</p>
        </div>
      </CvTab>
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
