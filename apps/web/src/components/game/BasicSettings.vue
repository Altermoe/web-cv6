<script setup lang="ts">
/**
 * BasicSettings — 基础游戏设置面板
 * 中栏：难度、速度、地图类型、地图大小
 */
import { CvSelect, CvPanel, CvDivider } from "@webcv6/ui";
import type { SelectOption } from "@webcv6/ui";

const difficulty = defineModel<string>("difficulty", { default: "prince" });
const speed = defineModel<string>("speed", { default: "standard" });
const mapType = defineModel<string>("mapType", { default: "continents" });
const mapSize = defineModel<string>("mapSize", { default: "standard" });

const difficultyOptions: SelectOption[] = [
  { label: "开拓者 Settler", value: "settler" },
  { label: "酋长 Chieftain", value: "chieftain" },
  { label: "军阀 Warlord", value: "warlord" },
  { label: "王子 Prince", value: "prince" },
  { label: "国王 King", value: "king" },
  { label: "皇帝 Emperor", value: "emperor" },
  { label: "不朽 Immortal", value: "immortal" },
  { label: "神级 Deity", value: "deity" },
];

const speedOptions: SelectOption[] = [
  { label: "在线 Online", value: "online" },
  { label: "迅捷 Quick", value: "quick" },
  { label: "标准 Standard", value: "standard" },
  { label: "史诗 Epic", value: "epic" },
  { label: "马拉松 Marathon", value: "marathon" },
];

const mapTypeOptions: SelectOption[] = [
  { label: "大陆 Continents", value: "continents" },
  { label: "分形 Fractal", value: "fractal" },
  { label: "内海 Inland Sea", value: "inland_sea" },
  { label: "岛屿板块 Island Plates", value: "island_plates" },
  { label: "盘古大陆 Pangaea", value: "pangaea" },
  { label: "随机 Shuffle", value: "shuffle" },
];

const mapSizeOptions: SelectOption[] = [
  { label: "决斗 Duel — 2 文明", value: "duel" },
  { label: "小型 Tiny — 4 文明", value: "tiny" },
  { label: "小型 Small — 6 文明", value: "small" },
  { label: "标准 Standard — 8 文明", value: "standard" },
  { label: "大型 Large — 10 文明", value: "large" },
  { label: "巨大 Huge — 12 文明", value: "huge" },
];
</script>

<template>
  <CvPanel title="游戏设置" class="basic-settings">
    <div class="basic-settings__grid">
      <div class="basic-settings__field">
        <label class="basic-settings__label">游戏难度</label>
        <CvSelect v-model="difficulty" :options="difficultyOptions" size="md" />
        <span class="basic-settings__hint">AI 获得的能力加成</span>
      </div>

      <div class="basic-settings__field">
        <label class="basic-settings__label">游戏速度</label>
        <CvSelect v-model="speed" :options="speedOptions" size="md" />
        <span class="basic-settings__hint">每回合时间跨度</span>
      </div>

      <CvDivider ornamental label="地图" />

      <div class="basic-settings__field">
        <label class="basic-settings__label">地图类型</label>
        <CvSelect v-model="mapType" :options="mapTypeOptions" size="md" />
      </div>

      <div class="basic-settings__field">
        <label class="basic-settings__label">地图大小</label>
        <CvSelect v-model="mapSize" :options="mapSizeOptions" size="md" />
      </div>
    </div>
  </CvPanel>
</template>

<style scoped>
.basic-settings {
  display: flex;
  flex-direction: column;
}
.basic-settings__grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.basic-settings__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.basic-settings__label {
  font-family: var(--civ-font-display);
  font-size: 13px;
  font-weight: 600;
  color: var(--civ-gold-400);
  letter-spacing: 0.5px;
}
.basic-settings__hint {
  font-size: 11px;
  color: var(--civ-text-muted);
}
</style>
