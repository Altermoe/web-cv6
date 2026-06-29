<script setup lang="ts">
import { ref } from "vue";
import { CvProgress } from "@webcv6/ui";

const production = ref(67);
const research = ref(42);
const growth = ref(85);
</script>

<template>
  <div class="doc-page">
    <h1 class="doc-page__title">Progress 进度条</h1>
    <p class="doc-page__desc">用于展示生产进度、研究进度、人口增长等。</p>
    <h2 class="doc-section__title">基础用法</h2>
    <div class="doc-demo">
      <div class="doc-demo__col">
        <div>
          <span class="doc-demo__label">🔨 生产进度</span>
          <CvProgress :percentage="production" show-label />
        </div>
        <div>
          <span class="doc-demo__label">🔬 研究进度</span>
          <CvProgress :percentage="research" variant="info" show-label />
        </div>
        <div>
          <span class="doc-demo__label">🌾 人口增长</span>
          <CvProgress :percentage="growth" variant="success" show-label />
        </div>
        <div>
          <span class="doc-demo__label">❤️ 生命值</span>
          <CvProgress :percentage="30" variant="danger" show-label striped animated />
        </div>
      </div>
    </div>
    <h2 class="doc-section__title">尺寸</h2>
    <div class="doc-demo">
      <div class="doc-demo__col">
        <CvProgress :percentage="60" size="sm" />
        <CvProgress :percentage="60" size="md" />
        <CvProgress :percentage="60" size="lg" />
        <CvProgress :percentage="60" size="xl" />
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
.doc-demo__col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.doc-demo__label {
  color: var(--civ-text-muted);
  font-size: 13px;
  display: block;
  margin-bottom: 4px;
}
</style>
