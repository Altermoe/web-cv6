<script setup lang="ts">
import { CvPanel } from "@webcv6/ui";
import { ref } from "vue";
const collapsed = ref(false);
</script>

<template>
  <div class="doc-page">
    <h1 class="doc-page__title">Panel 面板</h1>
    <p class="doc-page__desc">内容容器，用于城市信息、科技详情等。</p>
    <h2 class="doc-section__title">基础用法</h2>
    <div class="doc-demo">
      <CvPanel title="🏛️ 城市中心">
        <p style="color: var(--civ-text-secondary); font-size: 13px">
          人口: 12 | 粮食: 45/60 | 产能: 18/回合
        </p>
      </CvPanel>
    </div>
    <h2 class="doc-section__title">可折叠</h2>
    <div class="doc-demo">
      <CvPanel title="📜 政策槽位" v-model:collapsed="collapsed" collapsible>
        <p style="color: var(--civ-text-secondary); font-size: 13px">军事: 重装步兵 +10% 生产力</p>
        <p style="color: var(--civ-text-secondary); font-size: 13px">经济: 金币 +2/回合</p>
      </CvPanel>
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
