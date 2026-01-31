# Phase 9: 工程化基础

> **目标**：掌握前端工程化基础  
> **预计时长**：1 周

---

## 📚 本阶段内容

### 学习目标

1. 理解模块化发展历程
2. 掌握包管理工具使用
3. 配置代码规范与格式化
4. 建立 Git 工作流

### 知识要点

- 模块化发展史 (IIFE, CommonJS, AMD, ESM)
- 包管理 (npm, yarn, pnpm)
- ESLint 与 Prettier
- Git Hooks (Husky, lint-staged)
- Commit 规范 (Conventional Commits)

### 实战项目

**项目脚手架 CLI**：创建自定义脚手架工具

---

## 📂 目录结构

```
phase09-engineering-basic/
├── CONCEPT.md
├── README.md
├── examples/
│   ├── 01-npm-scripts.json
│   ├── 02-eslint-config.js
│   ├── 03-prettier-config.js
│   └── 04-husky-setup.sh
└── exercises/
    └── project-cli/
```

---

## 🎯 核心概念速览

### npm scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --fix",
    "prepare": "husky install"
  }
}
```

### ESLint + Prettier

```javascript
// .eslintrc.js
module.exports = {
  extends: ["eslint:recommended", "prettier"],
  rules: { "no-unused-vars": "warn" },
};
```

---

> 完成本阶段后，你应该能够搭建标准化的前端项目工程。
