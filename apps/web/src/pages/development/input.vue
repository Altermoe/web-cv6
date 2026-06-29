<script setup lang="ts">
import { ref } from "vue";
import { CvInput } from "@webcv6/ui";

const text = ref("");
const password = ref("");
const search = ref("");
const clearable = ref("Hello World");
</script>

<template>
  <div class="doc-page">
    <h1 class="doc-page__title">Input 输入框</h1>
    <p class="doc-page__desc">通过键盘输入内容，带有金色聚焦环。</p>

    <h2 class="doc-section__title">基础用法</h2>
    <div class="doc-demo">
      <div class="doc-demo__row">
        <CvInput v-model="text" placeholder="请输入内容..." style="width: 240px" />
        <span class="doc-demo__label">值: {{ text || "(空)" }}</span>
      </div>
    </div>

    <h2 class="doc-section__title">带图标</h2>
    <div class="doc-demo">
      <div class="doc-demo__row">
        <CvInput prefix-icon="🔍" v-model="search" placeholder="搜索..." style="width: 240px" />
        <CvInput suffix-icon="📅" placeholder="选择日期" style="width: 240px" />
      </div>
    </div>

    <h2 class="doc-section__title">可清空</h2>
    <div class="doc-demo">
      <div class="doc-demo__row">
        <CvInput v-model="clearable" clearable placeholder="可清空" style="width: 240px" />
      </div>
    </div>

    <h2 class="doc-section__title">密码与禁用</h2>
    <div class="doc-demo">
      <div class="doc-demo__row">
        <CvInput v-model="password" type="password" placeholder="密码" style="width: 240px" />
        <CvInput disabled placeholder="禁用" style="width: 240px" />
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
  flex-wrap: wrap;
}
.doc-demo__label {
  color: var(--civ-text-muted);
  font-size: 13px;
}
</style>
