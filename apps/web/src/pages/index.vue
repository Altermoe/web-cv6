<script setup lang="ts">
/**
 * Civ 6 Main Menu — 首页
 * 还原《文明6》主菜单界面风格
 */
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { CvButton } from "@webcv6/ui";

const router = useRouter();
const ready = ref(false);

onMounted(() => {
  requestAnimationFrame(() => {
    ready.value = true;
  });
});

function goScene() {
  router.push("/scene");
}
function goDev() {
  router.push("/development");
}
</script>

<template>
  <div class="main-menu">
    <!-- 背景层 -->
    <div class="main-menu__bg" />
    <div class="main-menu__vignette" />

    <!-- 罗盘装饰 -->
    <div class="main-menu__compass" :class="{ 'is-ready': ready }">
      <div class="compass__outer" />
      <div class="compass__inner" />
      <div class="compass__needle" />
    </div>

    <!-- 标题 -->
    <header class="main-menu__header" :class="{ 'is-ready': ready }">
      <span class="main-menu__subtitle">Sid Meier's</span>
      <h1 class="main-menu__title">
        <span class="title__civ">Civilization</span>
        <span class="title__vi">VI</span>
      </h1>
      <span class="main-menu__tagline">Web Edition</span>
    </header>

    <!-- 主菜单按钮 -->
    <nav class="main-menu__nav" :class="{ 'is-ready': ready }">
      <div class="menu-item" style="--i: 0">
        <CvButton variant="primary" size="xl" block @click="goScene">
          开始游戏
        </CvButton>
      </div>
      <div class="menu-item" style="--i: 1">
        <CvButton variant="primary" size="xl" block @click="goDev">
          组件文档
        </CvButton>
      </div>
      <div class="menu-item" style="--i: 2">
        <CvButton variant="secondary" size="xl" block disabled>
          多人游戏
        </CvButton>
      </div>
      <div class="menu-item" style="--i: 3">
        <CvButton variant="secondary" size="xl" block disabled>
          游戏设置
        </CvButton>
      </div>
      <div class="menu-item" style="--i: 4">
        <CvButton variant="ghost" size="lg" block disabled>
          制作人员
        </CvButton>
      </div>
    </nav>

    <!-- 底部信息栏 -->
    <footer class="main-menu__footer" :class="{ 'is-ready': ready }">
      <div class="footer__news">
        <span class="footer__news-label">公告</span>
        <span class="footer__news-text">
          Web-CV6 — 基于 WebGPU + Vue 3 的文明类游戏引擎
        </span>
      </div>
      <div class="footer__version">v0.1.0-alpha</div>
    </footer>
  </div>
</template>

<style scoped>
/* ============================================================
   Civ 6 Main Menu
   ============================================================ */

.main-menu {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: var(--civ-font-sans);
  color: var(--civ-text-primary);
}

/* --- 背景层 --- */
.main-menu__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(ellipse 120% 80% at 50% 40%, rgba(15, 52, 96, 0.6) 0%, transparent 70%),
    radial-gradient(ellipse 80% 60% at 30% 70%, rgba(30, 42, 58, 0.8) 0%, transparent 60%),
    linear-gradient(180deg, #0a0f1a 0%, #0d1b2a 30%, #1b2838 60%, #0a0f1a 100%);
  background-size: 100% 100%;
}

/* 地图网格纹理叠加 */
.main-menu__bg::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 59px,
      rgba(230, 180, 34, 0.03) 59px,
      rgba(230, 180, 34, 0.03) 60px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 59px,
      rgba(230, 180, 34, 0.03) 59px,
      rgba(230, 180, 34, 0.03) 60px
    );
}

/* 暗角效果 */
.main-menu__vignette {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, rgba(0, 0, 0, 0.5) 100%);
  pointer-events: none;
}

/* --- 罗盘装饰（左上角）--- */
.main-menu__compass {
  position: absolute;
  top: 32px;
  left: 32px;
  width: 80px;
  height: 80px;
  z-index: 10;
  opacity: 0;
  transform: scale(0.8) rotate(-30deg);
  transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}
.main-menu__compass.is-ready {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.compass__outer {
  position: absolute;
  inset: 0;
  border: 2px solid var(--civ-gold-700);
  border-radius: 50%;
  animation: compass-rotate-reverse 30s linear infinite;
}
.compass__outer::before {
  content: "";
  position: absolute;
  top: -4px;
  left: 50%;
  width: 8px;
  height: 8px;
  margin-left: -4px;
  background: var(--civ-gold-500);
  border-radius: 50%;
}

.compass__inner {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  border: 1px solid var(--civ-gold-800);
  border-radius: 50%;
  animation: compass-rotate 20s linear infinite;
}

.compass__needle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 36px;
  margin-left: -1px;
  margin-top: -18px;
  background: linear-gradient(180deg, var(--civ-gold-400) 50%, var(--civ-stone-600) 50%);
}

@keyframes compass-rotate {
  to { transform: rotate(360deg); }
}
@keyframes compass-rotate-reverse {
  to { transform: rotate(-360deg); }
}

/* --- 标题区 --- */
.main-menu__header {
  position: relative;
  z-index: 10;
  text-align: center;
  margin-bottom: 48px;
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.2s;
}
.main-menu__header.is-ready {
  opacity: 1;
  transform: translateY(0);
}

.main-menu__subtitle {
  display: block;
  font-family: var(--civ-font-display);
  font-size: 14px;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: var(--civ-text-secondary);
  margin-bottom: 4px;
}

.main-menu__title {
  font-family: var(--civ-font-display);
  font-size: 64px;
  font-weight: 700;
  line-height: 1;
  margin: 0;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 12px;
}

.title__civ {
  background: linear-gradient(180deg, #f0ebe0 0%, #d1cdc2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title__vi {
  background: linear-gradient(180deg, var(--civ-gold-300) 0%, var(--civ-gold-700) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 72px;
}

.main-menu__tagline {
  display: block;
  font-size: 11px;
  letter-spacing: 6px;
  text-transform: uppercase;
  color: var(--civ-text-muted);
  margin-top: 8px;
}

/* --- 菜单按钮区 --- */
.main-menu__nav {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 320px;
}

.menu-item {
  opacity: 0;
  transform: translateX(-24px);
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(0.3s + var(--i) * 0.08s);
}
.main-menu__nav.is-ready .menu-item {
  opacity: 1;
  transform: translateX(0);
}

/* 覆盖 CvButton 的 block 样式，让菜单按钮更宽更高 */
.main-menu__nav :deep(.cv-button) {
  font-family: var(--civ-font-display);
  font-size: 16px;
  letter-spacing: 2px;
  height: 48px;
  border-radius: var(--civ-radius-sm);
}

/* secondary 变体微调：更暗的底色 */
.main-menu__nav :deep(.cv-button--secondary) {
  background: linear-gradient(180deg, rgba(36, 52, 71, 0.9) 0%, rgba(26, 25, 21, 0.9) 100%);
  border-color: var(--civ-gold-800);
  color: var(--civ-text-secondary);
}
.main-menu__nav :deep(.cv-button--secondary:hover:not(.cv-button--disabled)) {
  background: linear-gradient(180deg, rgba(46, 62, 81, 0.95) 0%, rgba(36, 45, 31, 0.95) 100%);
  border-color: var(--civ-gold-600);
  color: var(--civ-text-primary);
}

/* ghost 变体微调 */
.main-menu__nav :deep(.cv-button--ghost) {
  background: transparent;
  border-color: var(--civ-border-default);
  color: var(--civ-text-muted);
  height: 36px;
  font-size: 13px;
}
.main-menu__nav :deep(.cv-button--ghost:hover:not(.cv-button--disabled)) {
  background: rgba(230, 180, 34, 0.05);
  border-color: var(--civ-gold-700);
  color: var(--civ-text-secondary);
}

/* --- 底部信息栏 --- */
.main-menu__footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  border-top: 1px solid var(--civ-border-default);
  background: rgba(10, 15, 26, 0.8);
  backdrop-filter: blur(8px);
  opacity: 0;
  transform: translateY(12px);
  transition: all 0.5s ease 0.8s;
}
.main-menu__footer.is-ready {
  opacity: 1;
  transform: translateY(0);
}

.footer__news {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
  flex: 1;
}

.footer__news-label {
  flex-shrink: 0;
  padding: 2px 8px;
  background: var(--civ-gold-700);
  color: var(--civ-gold-100);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  border-radius: var(--civ-radius-sm);
  text-transform: uppercase;
}

.footer__news-text {
  font-size: 12px;
  color: var(--civ-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.footer__version {
  flex-shrink: 0;
  font-size: 11px;
  color: var(--civ-text-muted);
  font-family: monospace;
}

/* --- 响应式 --- */
@media (max-width: 640px) {
  .main-menu__title {
    font-size: 40px;
  }
  .title__vi {
    font-size: 48px;
  }
  .main-menu__nav {
    width: 280px;
  }
  .main-menu__compass {
    width: 48px;
    height: 48px;
    top: 16px;
    left: 16px;
  }
}
</style>
