<script setup lang="ts">
import { CvButton, CvPopover } from "@webcv6/ui";
</script>

<template>
  <div class="doc-page">
    <h1 class="doc-page__title">Popover 弹出框</h1>
    <p class="doc-page__desc">点击触发的详情弹窗，用于领袖介绍、城市详情等。</p>

    <h2 class="doc-section__title">基础用法</h2>
    <div class="doc-demo">
      <div class="doc-demo__row">
        <CvPopover title="🏛️ 北京" width="240px">
          <template #trigger>
            <CvButton size="sm">查看城市</CvButton>
          </template>
          <p style="font-size: 12px; color: var(--civ-text-secondary)">人口: 15 | 产能: 24/回合</p>
          <p style="font-size: 12px; color: var(--civ-text-secondary)">建筑: 宫殿, 粮仓, 神庙</p>
        </CvPopover>
        <CvPopover title="⚔️ 蛮族营地" placement="top" width="200px">
          <template #trigger>
            <CvButton size="sm" variant="danger">蛮族情报</CvButton>
          </template>
          <p style="font-size: 12px; color: var(--civ-text-secondary)">附近有蛮族巡逻队</p>
        </CvPopover>
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
  gap: 12px;
}
</style>
