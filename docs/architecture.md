# Web-CV6 架构文档

> 本文档是 [proposal.md](../proposal.md) 的工程化细化。所有重大架构变更需先在此追加 ADR(架构决策记录),再回头同步计划书。

---

## 1. 顶层架构概览

Web-CV6 采用**混合架构**:

- **3D 场景层**:地图 / 运动对象 / 特效,由 **纯 WebGPU + WGSL** 自研渲染(不依赖 WebGL / Three.js / Babylon.js)。
- **平面 UI 层**:HUD / 菜单 / 模态 / 设置,全部由 **DOM + Vue 3 + Pinia** 承载,不进入 WebGPU 通道。
- **3D ↔ UI 通信**:通过 `bridge/` 下的事件总线 + 状态切片契约,严禁跨层调用。
- **后端**:可选(下文 §3)。在离线 / 加载完成后,前端可独立支撑单机游戏。
- **项目结构**:**monorepo(pnpm workspaces)**,将 3D 核心、UI、应用层、后端、共享协议等拆为独立 package。

```
┌──────────────────────┐
│  Frontend App (Vue3) │  ← 平面 UI + Pinia 状态
└──────────┬───────────┘
           │ 状态 / 事件契约 (bridge)
┌──────────┴───────────┐
│  3D Core (WebGPU)    │  ← 地图 / 单位 / 特效渲染
└──────────┬───────────┘
           │
┌──────────┴───────────┐
│  Backend(可选)       │  ← 计算下沉 / 多人同步
└──────────────────────┘
```

---

## 2. Monorepo 项目结构(pnpm)

### 2.1 为什么 monorepo
- **3D 核心**与**前端应用**生命周期完全不同,需要独立打包(3D 核心可被其他前端甚至工具复用)。
- **共享协议**(事件 / 类型 / 配置)在多端复用,放 package 内统一升级。
- **可分阶段交付**:先做 3D core + frontend 跑起来,后端按需引入,无需重构仓库结构。

### 2.2 工作区布局

```
web-cv6/
├── pnpm-workspace.yaml
├── package.json                # 根(仅 devDeps / scripts)
├── tsconfig.base.json          # 共享 TS 配置
├── proposal.md
├── docs/
│   ├── architecture.md         # 本文件
│   ├── adr/                    # 架构决策记录
│   └── milestones/             # 里程碑复盘
├── packages/
│   ├── core/                   # @webcv6/core  共享类型 / 工具 / 协议
│   │   ├── src/types/          # 公共类型(命令、事件、世界状态)
│   │   ├── src/protocol/       # bridge 通信契约
│   │   ├── src/utils/          # 数学、ID、时间等纯函数
│   │   └── src/constants/      # 共享常量(地块类型、阵营等)
│   ├── gpu3d/                  # @webcv6/gpu3d  3D 核心(WebGPU)
│   │   ├── src/backend/        # WebGPU 设备 / 队列 / 资源抽象
│   │   ├── src/render/         # 渲染图、Pass、相机
│   │   ├── src/scene/          # 场景图、实体
│   │   ├── src/sim/            # 回合、地图、规则(纯函数式)
│   │   ├── src/shaders/        # *.wgsl
│   │   └── src/port/           # InputPort / StateStream(对外契约)
│   ├── ui/                     # @webcv6/ui  Vue3 组件库(可选)
│   │   ├── src/components/
│   │   └── src/styles/
│   └── server/                 # @webcv6/server  后端(可选)
│       └── src/                # 见 §3
└── apps/
    ├── web/                    # @webcv6/web  主前端(Vite + Vue3)
    │   ├── src/views/          # 页面:主菜单、HUD、设置
    │   ├── src/stores/         # Pinia stores
    │   ├── src/bridge/         # 前端 bridge 适配器
    │   ├── index.html
    │   └── vite.config.ts
    └── devtools/               # @webcv6/devtools  调试 / 检视工具(可选)
```

### 2.3 依赖方向(强制)

```
apps/web  →  packages/ui  →  packages/core
       \                    ↗
        →  packages/gpu3d ─┘
        →  packages/server →  packages/core
```

- 任何 package **不得反向依赖** apps 或上层。
- `packages/core` 是叶子包,只能依赖纯 TypeScript / 浏览器原生 API,无运行时框架依赖。
- 跨包访问通过 **ESM workspace 协议**(`workspace:*`),不使用相对路径跨包引用。

### 2.4 pnpm 关键配置

`pnpm-workspace.yaml`:
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

`package.json`(根):
- 统一 `engines.node`,统一 `packageManager` 锁版本。
- 仅持有 devDeps:typescript / eslint / prettier / vitest / playwright / commitlint 等。
- 通过 `pnpm -r build` / `pnpm -r test` 统一调度。

### 2.5 构建与发布
- 每个 package 独立 `tsc --build`,输出 `dist/`。
- `apps/web` 通过 Vite alias 引用 workspace 包的 `src`(开发态),生产构建时消费 `dist`。
- 共享类型由 `packages/core` 单点导出,TS 严格模式全栈开 `strict: true`。
- 任何 package 升级协议前需先在 `docs/adr/` 留档。

---

## 3. 后端(可选,非强制)

### 3.1 定位
后端 **不是强制选项**。本项目在以下两种模式下都能运行:

| 模式 | 触发条件 | 行为 |
| --- | --- | --- |
| **单机离线模式(默认)** | 用户首次加载完成后,无后端可达 | 全部计算 / 持久化在前端完成,IndexedDB 存档 |
| **联机/辅助计算模式** | 检测到后端服务可达且用户在设置中启用 | 将可下沉到服务端的计算 / 同步逻辑上送 |

### 3.2 后端职责(可选启用时)
- **计算下沉**:复杂寻路、大规模 AI、规则回放模拟(Lobby / 训练场)。
- **多人同步**:房间、玩家回合转发、断线重连、事件顺序保证。
- **存档中转**:跨设备同步存档;**不强制**,离线存档仍由前端自主管理。
- **资源分发**:模型 / 纹理 / 着色器缓存 CDN(可独立于业务后端)。

### 3.3 后端约束
- 后端 **不持有世界真理**:游戏规则的最终权威仍在 `packages/gpu3d/sim` 的纯函数式中,后端只做"计算副本 / 同步中转"。
- 通信协议与前端共享 `packages/core/protocol`;后端不得私自定义私有事件。
- 不引入重量级框架:默认 Node + Fastify / Hono + WebSocket,数据库按需(SQLite / Postgres)。
- 单机模式下,前端不强制连后端;**前端代码不得假设后端一定可用**(连接失败必须有降级路径)。

### 3.4 前端对后端的契约
- `apps/web` 中的 `bridge/` 通过接口 `BackendTransport` 隔离:
  - `connect(): Promise<Session>`
  - `send(event): Promise<void>`
  - `subscribe(handler): Unsubscribe`
- 离线模式下 `BackendTransport` 替换为 `NoopTransport`,业务代码不感知差异。

---

## 4. 前端(Vue 3 + Pinia + TypeScript)

### 4.1 形态
- **构建工具**:Vite + `@vitejs/plugin-vue`。
- **视图**:Vue 3 + `<script setup>` + SFC。
- **状态**:Pinia(`setup` 风格 stores)。
- **类型**:TypeScript strict 全栈。

### 4.2 Pinia 状态分层

游戏核心状态统一存放在 Pinia store 中,作为**世界真理的"投影 / 视图"**。

| Store | 范围 | 说明 |
| --- | --- | --- |
| `useGameStore` | **世界状态** | 回合数、当前玩家、地图摘要、选区、相机位姿 |
| `usePlayerStore` | **玩家私有** | 金币 / 科技 / 文化 / 信仰 / 旅游,科技/政策进度 |
| `useUnitStore` | **单位集合** | 所有可见单位的派生快照(由 sim 订阅投影) |
| `useCityStore` | **城市集合** | 城市列表 + 各自产出 / 满意度 |
| `useUiStore` | **UI 局部** | 模态开闭、HUD 显隐、布局、主题、当前路由 |
| `useSettingsStore` | **用户偏好** | 键位、音量、画质、i18n、是否启用后端 |
| `useCommandStore` | **命令队列** | 玩家操作的暂存 / 撤销 / 重做 |

### 4.3 状态来源与流向

```
              ┌────────────────────────────────────────────┐
              │           packages/gpu3d (sim)              │
              │   纯函数式世界模拟(WorldState → WorldState) │
              └───────────────────┬────────────────────────┘
                                  │ StateStream(可订阅)
                                  ▼
              ┌────────────────────────────────────────────┐
              │        apps/web/src/bridge 适配器           │
              │   监听 sim 事件 → 更新 Pinia store         │
              └───────────────────┬────────────────────────┘
                                  ▼
              ┌────────────────────────────────────────────┐
              │             Pinia stores                   │
              │   真理视图 + UI 派生状态(getters)           │
              └───────────────────┬────────────────────────┘
                                  ▼
              ┌────────────────────────────────────────────┐
              │          Vue 组件 / HUD / 菜单              │
              └────────────────────────────────────────────┘
                                  │ 用户交互
                                  ▼
              ┌────────────────────────────────────────────┐
              │        useCommandStore / bridge.send       │
              │   Command → sim.applyCommand(state, cmd)   │
              └────────────────────────────────────────────┘
```

**关键约束**
- **状态真理在 `sim`(纯函数)**,Pinia 只持有"为视图服务的投影";严禁在 store 内做规则计算。
- 所有 store action **不直接修改世界状态**,只通过 bridge 发送 `Command` 并由 sim 反馈后回写。
- 跨 store 派生用 `getters`,**不允许**在一个 store action 里 set 另一个 store 的状态。
- 持久化:除 `useUiStore` / `useSettingsStore` 走 `localStorage` 外,世界状态由 sim 的存档模块统一管理(IndexedDB)。

### 4.4 与 3D 核心的边界
- 前端 **不直接调用** WebGPU device / 着色器;通过 `@webcv6/gpu3d` 导出的 `Renderer` 高级 API 操作。
- UI 组件 **不感知** WebGPU;3D 画布仅作为 DOM 中的 `<canvas>` 节点,被 Vue 组件挂载。
- 输入分发:DOM 事件由 Vue 监听 → 命中 HUD 元素则 UI 消费 → 否则转发到 `Renderer.inputPort`。

### 4.5 目录约定(apps/web)
```
apps/web/src/
├── main.ts                    # 入口:挂载 App、注册 Pinia、初始化 bridge
├── App.vue
├── views/                     # 页面:MainMenu / GameHUD / Settings
├── stores/                    # Pinia stores(见 §4.2)
├── bridge/                    # bridge 适配器、命令构造器
├── components/                # 通用组件
├── i18n/                      # 多语言
├── styles/                    # 全局样式、CSS 变量
└── assets/                    # 静态资源
```

---

## 5. 数据流与契约总览

| 契约 | 方向 | 载体 |
| --- | --- | --- |
| `Command` | UI → sim | 玩家操作(结束回合、移动单位、造建筑…) |
| `WorldEvent` | sim → UI | 世界变化(回合推进、单位阵亡、城市建成…) |
| `StateSnapshot` | sim → UI | 状态切片(用于首屏 hydrate / 断线重连) |
| `BackendTransport` | app ↔ server(可选) | WebSocket / HTTP,启用后端时使用 |

所有契约在 `packages/core/protocol` 单点定义,3D core、UI、后端**严格共用**。

---

## 6. ADR(架构决策记录)

| 编号 | 标题 | 状态 |
| --- | --- | --- |
| ADR-0001 | 混合架构:WebGPU + DOM UI 分层 | 已采纳 |
| ADR-0002 | 3D 核心与前端应用分包的 monorepo 布局 | 已采纳 |
| ADR-0003 | 后端可选,默认单机离线模式 | 已采纳 |
| ADR-0004 | 游戏核心状态权威在 sim,Pinia 仅为视图 | 已采纳 |
| ADR-0005 | UI 框架选用 Vue 3 + Pinia | 已采纳 |
| 计划中 | 响应式框架最终选型对比(Vue/Svelte/Solid) | 待评审 |
| 计划中 | 3D 核心 API 形态(Renderer facade) | 待评审 |

> 新增 ADR 模板:`docs/adr/NNNN-title.md`,包含 背景 / 决策 / 后果 / 备选。

---

*本文档随项目演进持续更新;任何重大架构变更需先在此追加 ADR。*
