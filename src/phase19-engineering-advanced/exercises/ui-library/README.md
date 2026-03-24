# 🧩 企业级 UI 组件库实战

## 项目概述

从零搭建一个 Monorepo 组件库，包含组件开发、测试、文档、版本管理和自动发布。

## 技术栈

```
构建:   pnpm workspace + Turborepo + Vite
组件:   React + TypeScript + CSS Modules
测试:   Vitest + Testing Library
E2E:    Playwright
文档:   Storybook
版本:   Changesets
CI/CD:  GitHub Actions
```

## 项目结构

```
ui-library/
├── packages/
│   ├── ui/                    # 组件库
│   │   ├── src/
│   │   │   ├── button/        # Button 组件
│   │   │   ├── input/         # Input 组件
│   │   │   ├── modal/         # Modal 组件
│   │   │   ├── theme/         # Design Tokens
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── vite.config.ts
│   ├── hooks/                 # 共享 Hooks
│   ├── utils/                 # 工具函数
│   └── eslint-config/         # 共享 ESLint
├── apps/
│   └── docs/                  # Storybook 文档站
├── pnpm-workspace.yaml
├── turbo.json
├── .changeset/
└── package.json
```

## 实现步骤

### Step 1: 初始化 Monorepo

1. pnpm workspace 配置
2. Turborepo 构建流水线
3. 共享 TSConfig 和 ESLint

### Step 2: 开发核心组件

1. Design Tokens (CSS Variables)
2. Button (variants, sizes, loading, icon)
3. Input (label, error, validation)
4. Modal (portal, animation, accessibility)

### Step 3: 测试

1. Vitest 单元测试 (每个组件)
2. Storybook 可视化测试
3. Playwright E2E 测试

### Step 4: 文档与发布

1. Storybook 配置与部署
2. Changesets 版本管理
3. npm 发布 CI/CD

## 学习要点

- [ ] Monorepo 项目搭建
- [ ] 组件 API 设计原则
- [ ] Design Tokens 系统
- [ ] 单元测试与覆盖率
- [ ] Storybook 文档驱动
- [ ] Changesets 版本管理
- [ ] npm 包发布流程

## 进阶挑战

- [ ] 添加暗色主题支持
- [ ] 实现 CSS-in-JS 方案
- [ ] 添加视觉回归测试 (Chromatic)
- [ ] 支持 SSR (Next.js 兼容)
- [ ] 添加无障碍 (a11y) 测试
