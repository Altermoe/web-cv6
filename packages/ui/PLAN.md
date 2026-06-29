# @webcv6/ui 组件库开发计划

## 概览

基于《文明 6》游戏 UI 设计的 Vue 3 组件库，为 Web-CV6 游戏提供标准化 UI 组件。

**设计原则**：
- 完整的 TypeScript 类型提示
- CSS 变量主题系统（`--civ-*` 前缀）
- Scoped CSS 避免样式冲突
- 支持 Vue 3 Composition API

---

## 已完成组件（19 个）

### 基础组件
| 组件 | 文件 | 变体/特性 |
|------|------|-----------|
| CvButton | button/ | 6 变体（primary/secondary/ghost/danger/gold/stone）× 4 尺寸 × 3 形状 + 加载态 |
| CvInput | input/ | 前缀/后缀图标、清空按钮、密码切换 |
| CvSelect | select/ | 基于 reka-ui Select、ScrollArea 滚动、图标选项、清空功能 |
| CvCheckbox | checkbox/ | 复选框 |
| CvRadio | radio/ | 单选框 |
| CvSlider | slider/ | 滑块 |

### 数据展示
| 组件 | 文件 | 变体/特性 |
|------|------|-----------|
| CvProgress | progress/ | 条纹动画、4 变体 |
| CvTag | tag/ | 6 变体、可关闭 |
| CvDivider | divider/ | 装饰分割线 |
| CvPanel | panel/ | 可折叠面板 |
| CvPortrait | portrait/ | 圆形/方形、徽章 |
| CvResourceBar | resource-bar/ | 带进度条的资源展示 |

### 导航
| 组件 | 文件 | 变体/特性 |
|------|------|-----------|
| CvTab | tab/ | 标签页导航 |

### 弹出层
| 组件 | 文件 | 变体/特性 |
|------|------|-----------|
| CvTooltip | tooltip/ | 文字提示 |
| CvPopover | popover/ | 点击触发弹窗、命名插槽（trigger/default/header） |
| CvModal | modal/ | 4 尺寸、Teleport、命名插槽（default/footer） |
| CvToast | toast/ | 自动消失通知 |

### 游戏专用
| 组件 | 文件 | 变体/特性 |
|------|------|-----------|
| CvUnitBar | unit-bar/ | 单位生命/行动值 |

### 滚动
| 组件 | 文件 | 变体/特性 |
|------|------|-----------|
| CvScrollArea | scroll-area/ | 基于 reka-ui ScrollArea、Civ 6 风格滚动条、hover 模式 |

---

## 待实现组件（17 个 TODO）

基于《文明 6》游戏界面分析，识别出以下待实现组件：

### 全局 UI
| 组件 | 路由 | 描述 | 优先级 |
|------|------|------|--------|
| TopBar | /development/top-bar | 回合数、金币、科技、文化、信仰等全局资源信息栏 | P0 |
| TurnButton | /development/turn-button | 右下角"下一回合"按钮 | P0 |
| Notification | /development/notification | 回合开始、事件触发等游戏通知 | P0 |
| MiniMap | /development/minimap | 左下角小地图，支持点击定位 | P1 |

### 城市管理
| 组件 | 路由 | 描述 | 优先级 |
|------|------|------|--------|
| CityPanel | /development/city-panel | 城市详情面板（市民增长、宜居度、住房） | P0 |
| ProductionMenu | /development/production-menu | 城市生产选择菜单 | P0 |
| ResourceIcon | /development/resource-icon | 单个资源图标展示 | P1 |

### 科技与政策
| 组件 | 路由 | 描述 | 优先级 |
|------|------|------|--------|
| TechTree | /development/tech-tree | 科技研究树状图 | P1 |
| CivicTree | /development/civic-tree | 市政政策树 | P1 |

### 外交与世界
| 组件 | 路由 | 描述 | 优先级 |
|------|------|------|--------|
| LeaderPanel | /development/leader-panel | 领袖外交界面 | P1 |
| WorldRankings | /development/world-rankings | 世界排名面板 | P2 |
| TradePanel | /development/trade-panel | 交易谈判界面 | P2 |

### 专项系统
| 组件 | 路由 | 描述 | 优先级 |
|------|------|------|--------|
| EspionagePanel | /development/espionage-panel | 间谍任务面板 | P2 |
| ReligionPanel | /development/religion-panel | 宗教管理面板 | P2 |
| GreatPeople | /development/great-people | 伟人招募面板 | P2 |
| WonderComplete | /development/wonder-complete | 奇观建成庆祝动画 | P3 |
| ActionMenu | /development/action-menu | 单位右键上下文菜单 | P1 |

---

## 已保存的参考截图

截图保存在项目根目录 `shortcuts/`（已 git 忽略）：
- `civ6_hud_overview.jpg` — 游戏主界面概览
- `civ6_tech_tree.jpg` — 科技树界面
- `civ6_diplomacy.jpg` — 外交界面
- `civ6_city_detail.jpg` — 城市详情面板
- `civ6_gameplay_hud.jpg` — 游戏 HUD
- `civ6_world_rankings.jpg` — 世界排名面板
- `civ6_map_ui.jpg` — 地图界面
- `civ6_map_menu.jpg` — 地图菜单

---

## 文件结构

```
packages/ui/
├── src/
│   ├── components/          # 18 个已实现组件
│   │   ├── button/
│   │   ├── input/
│   │   ├── select/
│   │   ├── ... (共 18 个)
│   ├── types/
│   │   └── common.ts        # UiSize, UiVariant, UiShape, Placement
│   ├── styles/
│   │   ├── variables.css    # Civ 6 主题 CSS 变量
│   │   ├── base.css         # 全局基础样式
│   │   └── index.css        # 样式入口
│   ├── index.ts             # 组件库主入口
│   └── components/
│       └── index.ts         # 组件导出
├── package.json
├── tsconfig.json
├── vite.config.ts
└── PLAN.md
```

apps/web 开发文档：
```
apps/web/src/pages/development/  # 38 个文档页面（21 已实现 + 17 TODO）
apps/web/src/layouts/DevLayout.vue  # 文档布局（侧边栏导航）
```

---

## 下一步

1. **P0 组件实现**：TopBar、TurnButton、Notification、CityPanel、ProductionMenu
2. **P1 组件实现**：MiniMap、ResourceIcon、TechTree、CivicTree、LeaderPanel、ActionMenu
3. **P2 组件实现**：WorldRankings、TradePanel、EspionagePanel、ReligionPanel、GreatPeople
4. **P3 组件实现**：WonderComplete（动画组件）
5. **组件文档完善**：为已实现的 18 个组件补充更多 demo 和 API 文档
