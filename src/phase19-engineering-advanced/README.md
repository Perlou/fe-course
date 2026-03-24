# Phase 19: 工程化进阶

> **目标**：掌握企业级前端工程化  
> **预计时长**：2 周

---

## 📚 本阶段内容

### 学习目标

1. 掌握 Monorepo 架构（pnpm workspaces + Turborepo）
2. 实现完善的自动化测试（单元测试 + E2E 测试）
3. 设计并开发 UI 组件库
4. 搭建文档系统（Storybook / VitePress）
5. 掌握版本管理与发布流程（Changesets）
6. 了解代码质量保障体系

### 知识要点

- Monorepo 管理（pnpm workspace, Turborepo, Nx）
- 单元测试（Vitest / Jest + Testing Library）
- E2E 测试（Playwright / Cypress）
- 组件库设计原则与开发
- 文档系统（Storybook, VitePress）
- 版本管理（Changesets, Semantic Versioning）
- 代码质量（ESLint, Prettier, Husky, lint-staged）

### 实战项目

**企业级 UI 组件库**：从零搭建 Monorepo 组件库

---

## 📂 目录结构

```
phase19-engineering-advanced/
├── CONCEPT.md
├── README.md
├── examples/
│   ├── 01-testing-basics.js       # 测试基础与框架
│   ├── 02-component-testing.js    # 组件测试模式
│   ├── 03-monorepo-tools.js       # Monorepo 工具链
│   ├── 04-component-library.js    # 组件库设计
│   └── 05-versioning.js           # 版本管理与发布
└── exercises/
    └── ui-library/                # UI 组件库实战
        └── README.md
```

---

## 🎯 核心概念速览

### 工程化全景

```
代码质量    ESLint + Prettier + TypeScript
├── 测试    Vitest (单元) + Playwright (E2E)
├── 构建    Vite + Rollup + Turborepo
├── 文档    Storybook + VitePress
├── 版本    Changesets + Semantic Versioning
└── 发布    npm publish + GitHub Actions
```

### 测试金字塔

```
        ╱╲
       ╱ E2E ╲         少量，慢，验证完整流程
      ╱────────╲
     ╱ 集成测试  ╲       中量，验证模块交互
    ╱──────────────╲
   ╱   单元测试     ╲    大量，快，验证函数逻辑
  ╱──────────────────╲
```

---

> 完成本阶段后，你应该能够搭建企业级前端工程。
