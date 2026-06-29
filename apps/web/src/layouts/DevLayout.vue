<script setup lang="ts">
/**
 * DevLayout — Component library documentation layout
 * Sidebar navigation + main content area, similar to Element Plus docs.
 */
import { computed } from "vue";
import { useRoute, RouterLink } from "vue-router";

const route = useRoute();

interface NavGroup {
  title: string;
  items: { label: string; path: string; icon?: string; todo?: boolean }[];
}

const navGroups = computed<NavGroup[]>(() => [
  {
    title: "入门",
    items: [
      { label: "介绍", path: "/development", icon: "📖" },
      { label: "快速开始", path: "/development/getting-started", icon: "🚀" },
      { label: "主题定制", path: "/development/theming", icon: "🎨" },
    ],
  },
  {
    title: "基础组件",
    items: [
      { label: "Button 按钮", path: "/development/button", icon: "🔘" },
      { label: "Input 输入框", path: "/development/input", icon: "✏️" },
      { label: "Select 选择器", path: "/development/select", icon: "📋" },
      { label: "Checkbox 复选框", path: "/development/checkbox", icon: "☑️" },
      { label: "Radio 单选框", path: "/development/radio", icon: "🔘" },
      { label: "Slider 滑块", path: "/development/slider", icon: "🎚️" },
    ],
  },
  {
    title: "数据展示",
    items: [
      { label: "Progress 进度条", path: "/development/progress", icon: "📊" },
      { label: "Tag 标签", path: "/development/tag", icon: "🏷️" },
      { label: "Divider 分割线", path: "/development/divider", icon: "➖" },
      { label: "Panel 面板", path: "/development/panel", icon: "📦" },
      { label: "Portrait 肖像", path: "/development/portrait", icon: "👤" },
      { label: "ResourceBar 资源条", path: "/development/resource-bar", icon: "💰" },
    ],
  },
  {
    title: "导航",
    items: [{ label: "Tab 标签页", path: "/development/tab", icon: "📑" }],
  },
  {
    title: "弹出层",
    items: [
      { label: "Tooltip 文字提示", path: "/development/tooltip", icon: "💬" },
      { label: "Popover 弹出框", path: "/development/popover", icon: "🪧" },
      { label: "Modal 对话框", path: "/development/modal", icon: "🪟" },
      { label: "Toast 通知", path: "/development/toast", icon: "🔔" },
    ],
  },
  {
    title: "游戏专用",
    items: [{ label: "UnitBar 单位操作栏", path: "/development/unit-bar", icon: "⚔️" }],
  },
  {
    title: "Civ 6 游戏 UI (TODO)",
    items: [
      { label: "TopBar 顶部信息栏", path: "/development/top-bar", icon: "📊", todo: true },
      { label: "MiniMap 小地图", path: "/development/minimap", icon: "🗺️", todo: true },
      { label: "CityPanel 城市面板", path: "/development/city-panel", icon: "🏙️", todo: true },
      {
        label: "ProductionMenu 生产菜单",
        path: "/development/production-menu",
        icon: "⚒️",
        todo: true,
      },
      { label: "TechTree 科技树", path: "/development/tech-tree", icon: "🔬", todo: true },
      { label: "CivicTree 政策树", path: "/development/civic-tree", icon: "📜", todo: true },
      { label: "LeaderPanel 领袖面板", path: "/development/leader-panel", icon: "👑", todo: true },
      {
        label: "WorldRankings 世界排名",
        path: "/development/world-rankings",
        icon: "🏆",
        todo: true,
      },
      { label: "Notification 游戏通知", path: "/development/notification", icon: "🔔", todo: true },
      { label: "ActionMenu 行动菜单", path: "/development/action-menu", icon: "🎯", todo: true },
      {
        label: "ResourceIcon 资源图标",
        path: "/development/resource-icon",
        icon: "💎",
        todo: true,
      },
      { label: "TurnButton 回合按钮", path: "/development/turn-button", icon: "⏭️", todo: true },
      { label: "TradePanel 交易面板", path: "/development/trade-panel", icon: "🤝", todo: true },
      {
        label: "EspionagePanel 间谍面板",
        path: "/development/espionage-panel",
        icon: "🕵️",
        todo: true,
      },
      {
        label: "ReligionPanel 宗教面板",
        path: "/development/religion-panel",
        icon: "⛪",
        todo: true,
      },
      { label: "GreatPeople 伟人面板", path: "/development/great-people", icon: "🌟", todo: true },
      {
        label: "WonderComplete 奇观建成",
        path: "/development/wonder-complete",
        icon: "🏛️",
        todo: true,
      },
    ],
  },
]);

function isActive(path: string): boolean {
  if (path === "/development") {
    return route.path === "/development";
  }
  return route.path.startsWith(path);
}
</script>

<template>
  <div class="dev-layout">
    <aside class="dev-layout__sidebar">
      <div class="dev-layout__logo">
        <RouterLink to="/development" class="dev-layout__logo-link">
          <span class="dev-layout__logo-icon">⚔️</span>
          <span class="dev-layout__logo-text">Web-CV6 UI</span>
        </RouterLink>
        <span class="dev-layout__version">v0.0.1</span>
      </div>

      <nav class="dev-layout__nav">
        <div v-for="group in navGroups" :key="group.title" class="dev-layout__group">
          <div class="dev-layout__group-title">{{ group.title }}</div>
          <RouterLink
            v-for="item in group.items"
            :key="item.path"
            :to="item.path"
            class="dev-layout__link"
            :class="{
              'dev-layout__link--active': isActive(item.path),
              'dev-layout__link--todo': item.todo,
            }"
          >
            <span class="dev-layout__link-icon">{{ item.icon }}</span>
            {{ item.label }}
            <span v-if="item.todo" class="dev-layout__link-badge">TODO</span>
          </RouterLink>
        </div>
      </nav>
    </aside>

    <main class="dev-layout__main">
      <div class="dev-layout__content">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.dev-layout {
  display: flex;
  min-height: 100vh;
  background: var(--civ-bg-primary);
  color: var(--civ-text-primary);
  font-family: var(--civ-font-sans);
}

/* Sidebar */
.dev-layout__sidebar {
  width: 260px;
  min-width: 260px;
  background: var(--civ-bg-secondary);
  border-right: 1px solid var(--civ-border-default);
  overflow-y: auto;
  position: sticky;
  top: 0;
  height: 100vh;
}
.dev-layout__logo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--civ-border-default);
}
.dev-layout__logo-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--civ-gold-400);
}
.dev-layout__logo-icon {
  font-size: 20px;
}
.dev-layout__logo-text {
  font-family: var(--civ-font-display);
  font-size: 16px;
  font-weight: 700;
}
.dev-layout__version {
  font-size: 11px;
  color: var(--civ-text-muted);
  background: var(--civ-bg-panel);
  padding: 2px 6px;
  border-radius: var(--civ-radius-sm);
}

/* Navigation */
.dev-layout__nav {
  padding: 8px 0;
}
.dev-layout__group {
  margin-bottom: 4px;
}
.dev-layout__group-title {
  padding: 8px 16px 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--civ-text-muted);
}
.dev-layout__link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  color: var(--civ-text-secondary);
  text-decoration: none;
  font-size: 13px;
  transition: all var(--civ-transition-fast);
  border-left: 3px solid transparent;
}
.dev-layout__link:hover {
  color: var(--civ-text-primary);
  background: rgba(255, 255, 255, 0.03);
}
.dev-layout__link--active {
  color: var(--civ-gold-400);
  background: rgba(230, 180, 34, 0.08);
  border-left-color: var(--civ-gold-500);
}
.dev-layout__link--todo {
  opacity: 0.6;
}
.dev-layout__link--todo:hover {
  opacity: 1;
}
.dev-layout__link-icon {
  font-size: 14px;
  width: 20px;
  text-align: center;
}
.dev-layout__link-badge {
  margin-left: auto;
  font-size: 10px;
  padding: 1px 5px;
  background: var(--civ-gold-700);
  color: var(--civ-gold-400);
  border-radius: 3px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* Main */
.dev-layout__main {
  flex: 1;
  min-width: 0;
}
.dev-layout__content {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 40px;
}
</style>
