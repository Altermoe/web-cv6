# 贡献指南

## 开发规则

### 1. 全 TypeScript 开发

- **所有代码必须使用 TypeScript**，禁止 `.js` / `.jsx` 文件
- 组件必须使用 `<script setup lang="ts">`
- 所有 props 必须通过 `defineProps<{}>()` 泛型语法定义类型
- 所有 emits 必须通过 `defineEmits<{}>()` 泛型语法定义类型
- 导出类型使用 `export type`，导入类型使用 `import type`
- 配置文件（vite.config.ts、tsconfig.json 等）统一使用 `.ts` 扩展名

### 2. 提交前检查

每次开发完成后，**必须**依次执行以下检查，全部通过后方可提交：

```bash
# 1. 格式化（oxfmt）
pnpm -C apps/web format:fix
pnpm -C packages/ui format:fix

# 2. 代码检查（oxlint）
pnpm -C apps/web lint
pnpm -C packages/ui lint

# 3. 类型检查（vue-tsc）
pnpm -C apps/web typecheck
pnpm -C packages/ui typecheck
```

**任何一项检查未通过，禁止提交代码。**

### 3. 组件开发规范

- 组件文件放在 `packages/ui/src/components/{组件名}/` 目录
- 每个组件包含 `CvXxx.vue` 和 `index.ts` 两个文件
- 使用 Scoped CSS 避免样式冲突
- 所有颜色、字体使用 CSS 变量（`--civ-*` 前缀）
- 文档页面放在 `apps/web/src/pages/development/` 目录
- 文档页面必须 import 并使用对应组件

### 4. Git 提交规范

- 提交信息使用中文，格式：`<类型>: <描述>`
- 类型：feat / fix / docs / style / refactor / test / chore
- 示例：`feat: 添加 CvDatePicker 组件`
