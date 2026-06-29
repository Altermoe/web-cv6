<script setup lang="ts">
/**
 * AdvancedSettings — 高级设置面板
 * 玩家/AI/城邦配置、地图环境、游戏规则、开关选项
 */
import { CvSelect, CvPanel, CvDivider, CvSwitch, CvScrollArea } from "@webcv6/ui";
import type { SelectOption } from "@webcv6/ui";

// === 玩家/AI/城邦 ===
const aiCount = defineModel<string>("aiCount", { default: "7" });
const cityStateCount = defineModel<string>("cityStateCount", { default: "12" });

const aiCountOptions: SelectOption[] = Array.from({ length: 12 }, (_, i) => ({
  label: String(i),
  value: String(i),
}));

const cityStateOptions: SelectOption[] = [
  { label: "无", value: "0" },
  { label: "少量 (4)", value: "4" },
  { label: "标准 (12)", value: "12" },
  { label: "大量 (20)", value: "20" },
  { label: "巨量 (24)", value: "24" },
];

// === 地图环境 ===
const resources = defineModel<string>("resources", { default: "standard" });
const temperature = defineModel<string>("temperature", { default: "standard" });
const rainfall = defineModel<string>("rainfall", { default: "standard" });
const seaLevel = defineModel<string>("seaLevel", { default: "standard" });
const worldAge = defineModel<string>("worldAge", { default: "standard" });

const envOptions: SelectOption[] = [
  { label: "随机", value: "random" },
  { label: "稀少 / 干燥 / 低 / 新", value: "low" },
  { label: "标准", value: "standard" },
  { label: "丰富 / 湿润 / 高 / 旧", value: "high" },
];

// === 游戏规则 ===
const startEra = defineModel<string>("startEra", { default: "ancient" });
const startPosition = defineModel<string>("startPosition", { default: "standard" });

const eraOptions: SelectOption[] = [
  { label: "远古时代 Ancient", value: "ancient" },
  { label: "古典时代 Classical", value: "classical" },
  { label: "中世纪 Medieval", value: "medieval" },
  { label: "文艺复兴 Renaissance", value: "renaissance" },
  { label: "工业时代 Industrial", value: "industrial" },
  { label: "现代 Modern", value: "modern" },
  { label: "原子时代 Atomic", value: "atomic" },
  { label: "信息时代 Information", value: "information" },
];

const positionOptions: SelectOption[] = [
  { label: "均衡 Balanced", value: "balanced" },
  { label: "标准 Standard", value: "standard" },
  { label: "传奇 Legendary", value: "legendary" },
];

// === 胜利条件 ===
const victoryScience = defineModel<boolean>("victoryScience", { default: true });
const victoryCulture = defineModel<boolean>("victoryCulture", { default: true });
const victoryDomination = defineModel<boolean>("victoryDomination", { default: true });
const victoryReligion = defineModel<boolean>("victoryReligion", { default: true });
const victoryDiplomacy = defineModel<boolean>("victoryDiplomacy", { default: true });
const victoryScore = defineModel<boolean>("victoryScore", { default: true });

// === 开关选项 ===
const noBarbarians = defineModel<boolean>("noBarbarians", { default: false });
const noTribalVillages = defineModel<boolean>("noTribalVillages", { default: false });
const sharedVision = defineModel<boolean>("sharedVision", { default: false });

// === 种子 ===
const mapSeed = defineModel<string>("mapSeed", { default: "" });

function generateSeed() {
  mapSeed.value = String(Math.floor(Math.random() * 999999));
}
</script>

<template>
  <div class="advanced-settings">
    <CvScrollArea type="hover" class="advanced-settings__scroll">
      <div class="advanced-settings__content">
        <!-- 玩家/AI/城邦 -->
        <CvPanel title="玩家与 AI" class="advanced-settings__section">
          <div class="advanced-settings__row">
            <div class="advanced-settings__field">
              <label class="advanced-settings__label">AI 文明数量</label>
              <CvSelect v-model="aiCount" :options="aiCountOptions" size="md" />
            </div>
            <div class="advanced-settings__field">
              <label class="advanced-settings__label">城邦数量</label>
              <CvSelect v-model="cityStateCount" :options="cityStateOptions" size="md" />
            </div>
          </div>
        </CvPanel>

        <!-- 地图环境 -->
        <CvPanel title="地图环境" class="advanced-settings__section">
          <div class="advanced-settings__env-grid">
            <div class="advanced-settings__field">
              <label class="advanced-settings__label">可用资源</label>
              <CvSelect v-model="resources" :options="envOptions" size="md" />
            </div>
            <div class="advanced-settings__field">
              <label class="advanced-settings__label">温度</label>
              <CvSelect v-model="temperature" :options="envOptions" size="md" />
            </div>
            <div class="advanced-settings__field">
              <label class="advanced-settings__label">降雨量</label>
              <CvSelect v-model="rainfall" :options="envOptions" size="md" />
            </div>
            <div class="advanced-settings__field">
              <label class="advanced-settings__label">海平面</label>
              <CvSelect v-model="seaLevel" :options="envOptions" size="md" />
            </div>
            <div class="advanced-settings__field">
              <label class="advanced-settings__label">世界纪元</label>
              <CvSelect v-model="worldAge" :options="envOptions" size="md" />
            </div>
          </div>
        </CvPanel>

        <!-- 游戏规则 -->
        <CvPanel title="游戏规则" class="advanced-settings__section">
          <div class="advanced-settings__row">
            <div class="advanced-settings__field">
              <label class="advanced-settings__label">起始时代</label>
              <CvSelect v-model="startEra" :options="eraOptions" size="md" />
            </div>
            <div class="advanced-settings__field">
              <label class="advanced-settings__label">起始位置</label>
              <CvSelect v-model="startPosition" :options="positionOptions" size="md" />
            </div>
          </div>

          <CvDivider ornamental label="胜利条件" />

          <div class="advanced-settings__victories">
            <CvSwitch v-model="victoryScience" label="🔬 科技胜利" />
            <CvSwitch v-model="victoryCulture" label="🎭 文化胜利" />
            <CvSwitch v-model="victoryDomination" label="⚔️ 统治胜利" />
            <CvSwitch v-model="victoryReligion" label="✝️ 宗教胜利" />
            <CvSwitch v-model="victoryDiplomacy" label="🤝 外交胜利" />
            <CvSwitch v-model="victoryScore" label="📊 分数胜利" />
          </div>
        </CvPanel>

        <!-- 开关选项 -->
        <CvPanel title="其他选项" class="advanced-settings__section">
          <div class="advanced-settings__toggles">
            <CvSwitch v-model="noBarbarians" label="无蛮族" />
            <CvSwitch v-model="noTribalVillages" label="无部落村庄" />
            <CvSwitch v-model="sharedVision" label="团队共享视野" />
          </div>

          <CvDivider ornamental label="地图种子" />

          <div class="advanced-settings__seed">
            <CvSelect
              v-model="mapSeed"
              :options="[{ label: mapSeed || '随机', value: mapSeed }]"
              size="md"
            />
            <button class="advanced-settings__seed-btn" @click="generateSeed">🎲 随机种子</button>
          </div>
        </CvPanel>
      </div>
    </CvScrollArea>
  </div>
</template>

<style scoped>
.advanced-settings {
  width: 100%;
}
.advanced-settings__scroll {
  max-height: 60vh;
}
.advanced-settings__content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.advanced-settings__section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.advanced-settings__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.advanced-settings__env-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.advanced-settings__env-grid .advanced-settings__field:last-child {
  grid-column: 1 / -1;
}
.advanced-settings__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.advanced-settings__label {
  font-family: var(--civ-font-display);
  font-size: 12px;
  font-weight: 600;
  color: var(--civ-gold-400);
  letter-spacing: 0.5px;
}
.advanced-settings__victories {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.advanced-settings__toggles {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.advanced-settings__seed {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}
.advanced-settings__seed-btn {
  padding: 8px 14px;
  background: var(--civ-bg-surface);
  border: 1px solid var(--civ-border-default);
  border-radius: var(--civ-radius-md);
  color: var(--civ-text-secondary);
  font-family: var(--civ-font-sans);
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--civ-transition-fast);
}
.advanced-settings__seed-btn:hover {
  border-color: var(--civ-gold-600);
  color: var(--civ-gold-300);
}
</style>
