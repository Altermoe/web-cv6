<script setup lang="ts">
/**
 * MapPreview — 地图预览 + 玩家列表面板
 * 右栏：根据地图类型显示缩略图，显示玩家和AI列表
 */
import { computed } from "vue";
import { CvPanel, CvDivider, CvScrollArea } from "@webcv6/ui";

const props = defineProps<{
  mapType: string;
  mapSize: string;
}>();

const mapName = computed(() => {
  const names: Record<string, string> = {
    continents: "大陆",
    fractal: "分形",
    inland_sea: "内海",
    island_plates: "岛屿板块",
    pangaea: "盘古大陆",
    shuffle: "随机",
  };
  return names[props.mapType] ?? "未知";
});

const civCount = computed(() => {
  const counts: Record<string, number> = {
    duel: 2,
    tiny: 4,
    small: 6,
    standard: 8,
    large: 10,
    huge: 12,
  };
  return counts[props.mapSize] ?? 8;
});

const cityStateCount = computed(() => {
  const counts: Record<string, number> = {
    duel: 4,
    tiny: 8,
    small: 12,
    standard: 16,
    large: 20,
    huge: 24,
  };
  return counts[props.mapSize] ?? 16;
});

const mapColors: Record<string, string> = {
  continents: "#3a6b4a",
  fractal: "#5a7a3a",
  inland_sea: "#2a5a8a",
  island_plates: "#3a7a9a",
  pangaea: "#6a7a4a",
  shuffle: "#5a5a5a",
};

const mapPatterns: Record<string, string> = {
  continents:
    "radial-gradient(ellipse 60% 40% at 30% 50%, #4a8a5a 0%, transparent 100%), radial-gradient(ellipse 40% 30% at 70% 60%, #4a8a5a 0%, transparent 100%), radial-gradient(circle 15px at 80% 30%, #4a8a5a 0%, transparent 100%)",
  fractal:
    "radial-gradient(ellipse 30% 50% at 25% 40%, #4a8a5a 0%, transparent 100%), radial-gradient(ellipse 45% 35% at 65% 55%, #4a8a5a 0%, transparent 100%), radial-gradient(ellipse 20% 25% at 50% 25%, #4a8a5a 0%, transparent 100%)",
  inland_sea: "radial-gradient(ellipse 50% 45% at 50% 50%, #2a6a9a 0%, transparent 100%)",
  island_plates:
    "radial-gradient(circle 25px at 20% 40%, #4a8a5a 0%, transparent 100%), radial-gradient(circle 20px at 50% 30%, #4a8a5a 0%, transparent 100%), radial-gradient(circle 30px at 70% 60%, #4a8a5a 0%, transparent 100%)",
  pangaea: "radial-gradient(ellipse 70% 55% at 50% 50%, #4a8a5a 0%, transparent 100%)",
  shuffle:
    "radial-gradient(circle 20px at 30% 40%, #4a8a5a 0%, transparent 100%), radial-gradient(circle 25px at 60% 55%, #4a8a5a 0%, transparent 100%)",
};
</script>

<template>
  <CvPanel title="地图与玩家" class="map-preview">
    <div class="map-preview__map" :style="{ background: mapColors[mapType] ?? '#5a5a5a' }">
      <div class="map-preview__pattern" :style="{ background: mapPatterns[mapType] ?? '' }" />
      <div class="map-preview__label">
        <span class="map-preview__map-name">{{ mapName }}</span>
        <span class="map-preview__map-size">{{ civCount }} 文明 · {{ cityStateCount }} 城邦</span>
      </div>
    </div>

    <CvDivider ornamental />

    <div class="map-preview__players">
      <div class="map-preview__players-header">
        <span>玩家</span>
        <span class="map-preview__players-count">1</span>
      </div>
      <CvScrollArea type="hover" class="map-preview__player-list">
        <div class="map-preview__player">
          <span class="map-preview__player-icon">👤</span>
          <span class="map-preview__player-name">玩家</span>
          <span class="map-preview__player-tag">人类</span>
        </div>
      </CvScrollArea>
    </div>

    <CvDivider ornamental label="AI 对手" />

    <div class="map-preview__ai">
      <CvScrollArea type="hover" class="map-preview__ai-list">
        <div v-for="i in Math.min(civCount - 1, 6)" :key="i" class="map-preview__ai-item">
          <span class="map-preview__ai-icon">🤖</span>
          <span class="map-preview__ai-name">AI 文明 {{ i }}</span>
          <span class="map-preview__ai-tag">随机</span>
        </div>
        <div v-if="civCount > 7" class="map-preview__ai-more">+{{ civCount - 7 }} 更多 AI...</div>
      </CvScrollArea>
    </div>
  </CvPanel>
</template>

<style scoped>
.map-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* === Map Thumbnail === */
.map-preview__map {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: var(--civ-radius-md);
  border: 1px solid var(--civ-border-default);
  overflow: hidden;
  transition: background var(--civ-transition-normal);
}
.map-preview__pattern {
  position: absolute;
  inset: 0;
  transition: background var(--civ-transition-normal);
}
.map-preview__label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 12px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
}
.map-preview__map-name {
  font-family: var(--civ-font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--civ-gold-300);
}
.map-preview__map-size {
  font-size: 11px;
  color: var(--civ-text-secondary);
}

/* === Player List === */
.map-preview__players,
.map-preview__ai {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.map-preview__players-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--civ-text-muted);
}
.map-preview__players-count {
  background: var(--civ-gold-800);
  color: var(--civ-gold-300);
  padding: 1px 8px;
  border-radius: 10px;
  font-size: 11px;
}

.map-preview__player-list,
.map-preview__ai-list {
  max-height: 120px;
}

.map-preview__player,
.map-preview__ai-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: var(--civ-radius-sm);
  transition: background var(--civ-transition-fast);
}
.map-preview__player {
  background: rgba(230, 180, 34, 0.1);
  border: 1px solid rgba(230, 180, 34, 0.2);
}

.map-preview__player-icon,
.map-preview__ai-icon {
  font-size: 14px;
}
.map-preview__player-name,
.map-preview__ai-name {
  flex: 1;
  font-size: 13px;
  color: var(--civ-text-primary);
}
.map-preview__player-tag,
.map-preview__ai-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 8px;
  background: var(--civ-bg-surface);
  color: var(--civ-text-muted);
}
.map-preview__ai-more {
  text-align: center;
  font-size: 11px;
  color: var(--civ-text-muted);
  padding: 4px;
}
</style>
