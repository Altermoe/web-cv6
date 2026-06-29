<script setup lang="ts">
import { ref } from "vue";
import { CvSlider } from "@webcv6/ui";

const volume = ref(70);
const brightness = ref(50);
const speed = ref(3);
</script>

<template>
  <div class="doc-page">
    <h1 class="doc-page__title">Slider 滑块</h1>
    <p class="doc-page__desc">用于设置音量、亮度等连续数值。</p>
    <h2 class="doc-section__title">基础用法</h2>
    <div class="doc-demo">
      <div class="doc-demo__col">
        <div class="doc-demo__row">
          <span class="doc-demo__label" style="width: 60px">音量</span
          ><CvSlider v-model="volume" :max="100" />
        </div>
        <div class="doc-demo__row">
          <span class="doc-demo__label" style="width: 60px">亮度</span
          ><CvSlider v-model="brightness" :max="100" />
        </div>
        <div class="doc-demo__row">
          <span class="doc-demo__label" style="width: 60px">速度</span
          ><CvSlider v-model="speed" :min="1" :max="5" />
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
  gap: 12px;
}
.doc-demo__col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.doc-demo__label {
  color: var(--civ-text-muted);
  font-size: 13px;
}
</style>
