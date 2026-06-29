<script setup lang="ts">
/**
 * Civ 6 Main Menu — 首页
 * 还原《文明6》PC版主菜单界面风格
 */
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const ready = ref(false);
const activeIndex = ref(1); // "单人游戏" 默认高亮

onMounted(() => {
  requestAnimationFrame(() => {
    ready.value = true;
  });
});

interface MenuItem {
  label: string;
  icon?: string;
  action?: () => void;
  disabled?: boolean;
}

const menuItems: MenuItem[] = [
  { label: "额外内容", icon: "⚙", disabled: true },
  { label: "单人游戏", action: () => router.push("/game/create") },
  { label: "多人游戏", disabled: true },
  { label: "游戏设置", disabled: true },
  { label: "组件文档", action: () => router.push("/development") },
  { label: "制作人员", action: () => router.push("/development") },
];

function selectItem(index: number) {
  activeIndex.value = index;
  const item = menuItems[index];
  if (item.action) {
    item.action();
  }
}
</script>

<template>
  <div class="main-menu">
    <!-- 背景层：暖棕/羊皮纸质感 -->
    <div class="main-menu__bg" />
    <div class="main-menu__vignette" />

    <!-- 标题区：左上角 -->
    <header class="main-menu__header" :class="{ 'is-ready': ready }">
      <div class="title-group">
        <span class="main-menu__subtitle">SID MEIER'S</span>
        <h1 class="main-menu__title">
          <span class="title__civ">CIVILIZATION</span>
          <span class="title__emblem">
            <span class="emblem__circle">
              <span class="emblem__roman">VI</span>
            </span>
          </span>
        </h1>
      </div>
    </header>

    <!-- 主菜单：右对齐文字链接 -->
    <nav class="main-menu__nav" :class="{ 'is-ready': ready }">
      <div
        v-for="(item, i) in menuItems"
        :key="item.label"
        class="menu-link"
        :class="{
          'is-active': activeIndex === i,
          'is-disabled': item.disabled,
        }"
        :style="{ '--i': i }"
        @click="!item.disabled && selectItem(i)"
        @mouseenter="!item.disabled && (activeIndex = i)"
      >
        <span v-if="item.icon" class="menu-link__icon">{{ item.icon }}</span>
        <span class="menu-link__text">{{ item.label }}</span>
      </div>
    </nav>

    <!-- 底部信息栏 -->
    <footer class="main-menu__footer" :class="{ 'is-ready': ready }">
      <div class="footer__left">
        <span class="footer__logos">2K &nbsp;|&nbsp; FIRAXIS</span>
        <span class="footer__version">VERSION 1.0.1</span>
      </div>
      <div class="footer__right">
        <span class="footer__build">WEB BUILD</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* ============================================================
   Civ 6 Main Menu — PC 版风格还原
   ============================================================ */

.main-menu {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  font-family: var(--civ-font-sans);
  color: var(--civ-text-primary);
}

/* --- 背景层：暖棕/羊皮纸质感 --- */
.main-menu__bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(ellipse 100% 80% at 30% 50%, rgba(90, 70, 40, 0.35) 0%, transparent 70%),
    radial-gradient(ellipse 60% 60% at 70% 30%, rgba(60, 50, 30, 0.25) 0%, transparent 60%),
    linear-gradient(180deg, #2a2318 0%, #1e1a12 30%, #151209 70%, #0e0c07 100%);
}

/* 纸张纹理叠加 */
.main-menu__bg::before {
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

/* 地图纹理暗纹 */
.main-menu__bg::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle 400px at 20% 60%, rgba(80, 60, 30, 0.15) 0%, transparent 100%),
    radial-gradient(circle 300px at 80% 30%, rgba(60, 45, 20, 0.1) 0%, transparent 100%);
}

/* 暗角效果 */
.main-menu__vignette {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: radial-gradient(ellipse 75% 70% at 35% 45%, transparent 0%, rgba(0, 0, 0, 0.6) 100%);
  pointer-events: none;
}

/* --- 标题区：左上角 --- */
.main-menu__header {
  position: absolute;
  top: 40px;
  left: 48px;
  z-index: 10;
  opacity: 0;
  transform: translateY(-16px);
  transition: all 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.2s;
}
.main-menu__header.is-ready {
  opacity: 1;
  transform: translateY(0);
}

.title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.main-menu__subtitle {
  font-family: var(--civ-font-sans);
  font-size: 11px;
  letter-spacing: 5px;
  text-transform: uppercase;
  color: var(--civ-stone-400);
}

.main-menu__title {
  font-family: var(--civ-font-display);
  font-size: 38px;
  font-weight: 700;
  line-height: 1;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 14px;
}

.title__civ {
  background: linear-gradient(180deg, #f0ebe0 0%, #d1cdc2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title__emblem {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.emblem__circle {
  width: 48px;
  height: 48px;
  border: 2px solid var(--civ-gold-600);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, rgba(30, 25, 15, 0.8) 0%, rgba(20, 17, 10, 0.9) 100%);
}

.emblem__roman {
  font-family: var(--civ-font-display);
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(180deg, var(--civ-gold-300) 0%, var(--civ-gold-700) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* --- 菜单：右侧偏上，文字链接风格 --- */
.main-menu__nav {
  position: absolute;
  top: 50%;
  right: 12%;
  transform: translateY(-50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 200px;
}

.menu-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 20px;
  font-family: var(--civ-font-display);
  font-size: 18px;
  letter-spacing: 1.5px;
  color: var(--civ-stone-400);
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0;
  transform: translateX(20px);
  transition:
    opacity 0.4s ease,
    transform 0.4s ease,
    color 0.2s ease,
    text-shadow 0.2s ease;
  transition-delay: calc(0.3s + var(--i) * 0.06s);
}

.main-menu__nav.is-ready .menu-link {
  opacity: 1;
  transform: translateX(0);
}

.menu-link:hover:not(.is-disabled) {
  color: var(--civ-gold-200);
  text-shadow: 0 0 12px rgba(230, 180, 34, 0.3);
}

.menu-link.is-active:not(.is-disabled) {
  color: var(--civ-gold-100);
  text-shadow: 0 0 16px rgba(230, 180, 34, 0.4);
}

/* 高亮条：选中项左侧金色竖线 */
.menu-link.is-active:not(.is-disabled)::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  background: var(--civ-gold-400);
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(230, 180, 34, 0.5);
}

.menu-link.is-disabled {
  color: var(--civ-stone-600);
  cursor: default;
}

.menu-link__icon {
  font-size: 16px;
  opacity: 0.7;
}

.menu-link__text {
  white-space: nowrap;
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
  padding: 10px 32px;
  border-top: 1px solid rgba(100, 80, 40, 0.2);
  background: rgba(10, 8, 5, 0.6);
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.5s ease 0.8s;
}
.main-menu__footer.is-ready {
  opacity: 1;
  transform: translateY(0);
}

.footer__left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.footer__logos {
  font-family: var(--civ-font-sans);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 3px;
  color: var(--civ-stone-500);
  text-transform: uppercase;
}

.footer__version {
  font-size: 10px;
  color: var(--civ-stone-600);
  font-family: monospace;
}

.footer__right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.footer__build {
  font-size: 10px;
  color: var(--civ-stone-600);
  font-family: monospace;
  letter-spacing: 1px;
}

/* --- 响应式 --- */
@media (max-width: 768px) {
  .main-menu__header {
    top: 24px;
    left: 24px;
  }
  .main-menu__title {
    font-size: 28px;
  }
  .emblem__circle {
    width: 36px;
    height: 36px;
  }
  .emblem__roman {
    font-size: 14px;
  }
  .main-menu__nav {
    right: 8%;
    min-width: 160px;
  }
  .menu-link {
    font-size: 15px;
    padding: 6px 16px;
  }
}
</style>
