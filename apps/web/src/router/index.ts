import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/pages/index.vue"),
    },
    {
      path: "/scene",
      name: "scene",
      component: () => import("@/views/SceneView.vue"),
    },
    {
      path: "/development",
      component: () => import("@/pages/development.vue"),
      children: [
        {
          path: "",
          name: "dev-overview",
          component: () => import("@/pages/development/index.vue"),
        },
        {
          path: "getting-started",
          name: "dev-getting-started",
          component: () => import("@/pages/development/getting-started.vue"),
        },
        {
          path: "theming",
          name: "dev-theming",
          component: () => import("@/pages/development/theming.vue"),
        },
        // === 基础组件 ===
        {
          path: "button",
          name: "dev-button",
          component: () => import("@/pages/development/button.vue"),
        },
        {
          path: "input",
          name: "dev-input",
          component: () => import("@/pages/development/input.vue"),
        },
        {
          path: "select",
          name: "dev-select",
          component: () => import("@/pages/development/select.vue"),
        },
        {
          path: "checkbox",
          name: "dev-checkbox",
          component: () => import("@/pages/development/checkbox.vue"),
        },
        {
          path: "radio",
          name: "dev-radio",
          component: () => import("@/pages/development/radio.vue"),
        },
        {
          path: "slider",
          name: "dev-slider",
          component: () => import("@/pages/development/slider.vue"),
        },
        // === 数据展示 ===
        {
          path: "progress",
          name: "dev-progress",
          component: () => import("@/pages/development/progress.vue"),
        },
        { path: "tag", name: "dev-tag", component: () => import("@/pages/development/tag.vue") },
        {
          path: "divider",
          name: "dev-divider",
          component: () => import("@/pages/development/divider.vue"),
        },
        {
          path: "panel",
          name: "dev-panel",
          component: () => import("@/pages/development/panel.vue"),
        },
        {
          path: "portrait",
          name: "dev-portrait",
          component: () => import("@/pages/development/portrait.vue"),
        },
        {
          path: "resource-bar",
          name: "dev-resource-bar",
          component: () => import("@/pages/development/resource-bar.vue"),
        },
        // === 导航 ===
        { path: "tab", name: "dev-tab", component: () => import("@/pages/development/tab.vue") },
        // === 弹出层 ===
        {
          path: "tooltip",
          name: "dev-tooltip",
          component: () => import("@/pages/development/tooltip.vue"),
        },
        {
          path: "popover",
          name: "dev-popover",
          component: () => import("@/pages/development/popover.vue"),
        },
        {
          path: "modal",
          name: "dev-modal",
          component: () => import("@/pages/development/modal.vue"),
        },
        {
          path: "toast",
          name: "dev-toast",
          component: () => import("@/pages/development/toast.vue"),
        },
        // === 游戏专用 ===
        {
          path: "unit-bar",
          name: "dev-unit-bar",
          component: () => import("@/pages/development/unit-bar.vue"),
        },
        // === TODO: 待实现的 Civ 6 游戏 UI 组件 ===
        {
          path: "top-bar",
          name: "dev-top-bar",
          component: () => import("@/pages/development/top-bar.vue"),
        },
        {
          path: "minimap",
          name: "dev-minimap",
          component: () => import("@/pages/development/minimap.vue"),
        },
        {
          path: "city-panel",
          name: "dev-city-panel",
          component: () => import("@/pages/development/city-panel.vue"),
        },
        {
          path: "production-menu",
          name: "dev-production-menu",
          component: () => import("@/pages/development/production-menu.vue"),
        },
        {
          path: "tech-tree",
          name: "dev-tech-tree",
          component: () => import("@/pages/development/tech-tree.vue"),
        },
        {
          path: "civic-tree",
          name: "dev-civic-tree",
          component: () => import("@/pages/development/civic-tree.vue"),
        },
        {
          path: "leader-panel",
          name: "dev-leader-panel",
          component: () => import("@/pages/development/leader-panel.vue"),
        },
        {
          path: "world-rankings",
          name: "dev-world-rankings",
          component: () => import("@/pages/development/world-rankings.vue"),
        },
        {
          path: "notification",
          name: "dev-notification",
          component: () => import("@/pages/development/notification.vue"),
        },
        {
          path: "action-menu",
          name: "dev-action-menu",
          component: () => import("@/pages/development/action-menu.vue"),
        },
        {
          path: "resource-icon",
          name: "dev-resource-icon",
          component: () => import("@/pages/development/resource-icon.vue"),
        },
        {
          path: "turn-button",
          name: "dev-turn-button",
          component: () => import("@/pages/development/turn-button.vue"),
        },
        {
          path: "trade-panel",
          name: "dev-trade-panel",
          component: () => import("@/pages/development/trade-panel.vue"),
        },
        {
          path: "espionage-panel",
          name: "dev-espionage-panel",
          component: () => import("@/pages/development/espionage-panel.vue"),
        },
        {
          path: "religion-panel",
          name: "dev-religion-panel",
          component: () => import("@/pages/development/religion-panel.vue"),
        },
        {
          path: "great-people",
          name: "dev-great-people",
          component: () => import("@/pages/development/great-people.vue"),
        },
        {
          path: "wonder-complete",
          name: "dev-wonder-complete",
          component: () => import("@/pages/development/wonder-complete.vue"),
        },
      ],
    },
  ],
});

export default router;
