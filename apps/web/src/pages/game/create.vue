<script setup lang="ts">
/**
 * CreateGame — 文明6 创建游戏界面
 * 三栏布局：左（文明选择）| 中（基础设置）| 右（地图预览）
 * 底部：高级设置 / 开始游戏 / 返回 / 重置
 */
import { ref } from "vue";
import { useRouter } from "vue-router";
import { CvButton, CvModal } from "@webcv6/ui";
import CivilizationPicker from "@/components/game/CivilizationPicker.vue";
import BasicSettings from "@/components/game/BasicSettings.vue";
import MapPreview from "@/components/game/MapPreview.vue";
import AdvancedSettings from "@/components/game/AdvancedSettings.vue";

const router = useRouter();

// === 基础设置状态 ===
const civilization = ref("random");
const difficulty = ref("prince");
const speed = ref("standard");
const mapType = ref("continents");
const mapSize = ref("standard");

// === 高级设置状态 ===
const showAdvanced = ref(false);
const advancedDefaults = {
  aiCount: "7",
  cityStateCount: "12",
  resources: "standard",
  temperature: "standard",
  rainfall: "standard",
  seaLevel: "standard",
  worldAge: "standard",
  startEra: "ancient",
  startPosition: "standard",
  victoryScience: true,
  victoryCulture: true,
  victoryDomination: true,
  victoryReligion: true,
  victoryDiplomacy: true,
  victoryScore: true,
  noBarbarians: false,
  noTribalVillages: false,
  sharedVision: false,
  mapSeed: "",
};
const advanced = ref({ ...advancedDefaults });

function resetDefaults() {
  civilization.value = "random";
  difficulty.value = "prince";
  speed.value = "standard";
  mapType.value = "continents";
  mapSize.value = "standard";
  advanced.value = { ...advancedDefaults };
}

function startGame() {
  // TODO: 启动游戏逻辑
  console.log("Starting game with settings:", {
    civilization: civilization.value,
    difficulty: difficulty.value,
    speed: speed.value,
    mapType: mapType.value,
    mapSize: mapSize.value,
    advanced: advanced.value,
  });
}
</script>

<template>
  <div class="create-game">
    <!-- 背景 -->
    <div class="create-game__bg" />
    <div class="create-game__vignette" />

    <!-- 标题 -->
    <header class="create-game__header">
      <h1 class="create-game__title">创建游戏</h1>
      <span class="create-game__subtitle">CREATE GAME</span>
    </header>

    <!-- 三栏主内容 -->
    <div class="create-game__body">
      <div class="create-game__col create-game__col--left">
        <CivilizationPicker v-model="civilization" />
      </div>

      <div class="create-game__col create-game__col--center">
        <BasicSettings
          v-model:difficulty="difficulty"
          v-model:speed="speed"
          v-model:mapType="mapType"
          v-model:mapSize="mapSize"
        />
      </div>

      <div class="create-game__col create-game__col--right">
        <MapPreview :map-type="mapType" :map-size="mapSize" />
      </div>
    </div>

    <!-- 底部按钮栏 -->
    <footer class="create-game__footer">
      <CvButton variant="ghost" size="md" @click="showAdvanced = true"> ⚙ 高级设置 </CvButton>

      <div class="create-game__footer-spacer" />

      <CvButton variant="ghost" size="md" @click="resetDefaults"> 🔄 重置默认 </CvButton>

      <CvButton variant="ghost" size="md" @click="router.back()"> ← 返回 </CvButton>

      <CvButton variant="primary" size="lg" @click="startGame"> ▶ 开始游戏 </CvButton>
    </footer>

    <!-- 高级设置弹窗 -->
    <CvModal v-model="showAdvanced" title="⚙ 高级设置" size="lg">
      <AdvancedSettings
        v-model:ai-count="advanced.aiCount"
        v-model:city-state-count="advanced.cityStateCount"
        v-model:resources="advanced.resources"
        v-model:temperature="advanced.temperature"
        v-model:rainfall="advanced.rainfall"
        v-model:sea-level="advanced.seaLevel"
        v-model:world-age="advanced.worldAge"
        v-model:start-era="advanced.startEra"
        v-model:start-position="advanced.startPosition"
        v-model:victory-science="advanced.victoryScience"
        v-model:victory-culture="advanced.victoryCulture"
        v-model:victory-domination="advanced.victoryDomination"
        v-model:victory-religion="advanced.victoryReligion"
        v-model:victory-diplomacy="advanced.victoryDiplomacy"
        v-model:victory-score="advanced.victoryScore"
        v-model:no-barbarians="advanced.noBarbarians"
        v-model:no-tribal-villages="advanced.noTribalVillages"
        v-model:shared-vision="advanced.sharedVision"
        v-model:map-seed="advanced.mapSeed"
      />

      <template #footer>
        <div class="create-game__modal-footer">
          <CvButton variant="ghost" @click="showAdvanced = false">← 返回</CvButton>
          <CvButton variant="primary" @click="showAdvanced = false">✓ 确认</CvButton>
        </div>
      </template>
    </CvModal>
  </div>
</template>

<style scoped>
.create-game {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: var(--civ-font-sans);
  color: var(--civ-text-primary);
}

/* === 背景（与主菜单一致） === */
.create-game__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(ellipse 100% 80% at 30% 50%, rgba(90, 70, 40, 0.35) 0%, transparent 70%),
    radial-gradient(ellipse 60% 60% at 70% 30%, rgba(60, 50, 30, 0.25) 0%, transparent 60%),
    linear-gradient(180deg, #2a2318 0%, #1e1a12 30%, #151209 70%, #0e0c07 100%);
}
.create-game__bg::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 3px,
      rgba(120, 100, 60, 0.015) 3px,
      rgba(120, 100, 60, 0.015) 4px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 4px,
      rgba(100, 80, 50, 0.01) 4px,
      rgba(100, 80, 50, 0.01) 5px
    );
  opacity: 0.8;
}
.create-game__vignette {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: radial-gradient(ellipse 80% 75% at 40% 45%, transparent 0%, rgba(0, 0, 0, 0.55) 100%);
  pointer-events: none;
}

/* === 标题 === */
.create-game__header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding: 20px 40px 0;
}
.create-game__title {
  font-family: var(--civ-font-display);
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(180deg, var(--civ-gold-200) 0%, var(--civ-gold-600) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.create-game__subtitle {
  font-size: 11px;
  letter-spacing: 4px;
  color: var(--civ-stone-500);
  text-transform: uppercase;
}

/* === 三栏主体 === */
.create-game__body {
  position: relative;
  z-index: 10;
  flex: 1;
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 16px;
  padding: 16px 40px;
  min-height: 0;
}
.create-game__col {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.create-game__col--left,
.create-game__col--right {
  overflow-y: auto;
}

/* === 底部按钮栏 === */
.create-game__footer {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 40px 20px;
  border-top: 1px solid rgba(100, 80, 40, 0.25);
  background: rgba(10, 8, 5, 0.5);
}
.create-game__footer-spacer {
  flex: 1;
}

/* === 高级设置弹窗 === */
.create-game__modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* === 响应式 === */
@media (max-width: 1200px) {
  .create-game__body {
    grid-template-columns: 240px 1fr 280px;
    padding: 12px 20px;
  }
}
@media (max-width: 900px) {
  .create-game__body {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }
}
</style>
