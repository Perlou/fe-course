# Phase 10: 构建工具深入

> **目标**：深入理解构建工具原理  
> **预计时长**：2 周

---

## 📚 本阶段内容

### 学习目标

1. 理解 Webpack 核心概念
2. 掌握 Loader 和 Plugin 原理
3. 了解 Vite 原理
4. 手写简易打包器

### 知识要点

- Webpack 核心概念
- Loader 机制
- Plugin 机制
- Vite 开发与生产模式
- Babel 与 SWC
- 构建性能优化

### 实战项目

**手写 Mini Webpack**：实现简化版打包器

---

## 📂 目录结构

```
phase10-build-tools/
├── CONCEPT.md
├── README.md
├── examples/
│   ├── 01-webpack-config.js
│   ├── 02-custom-loader.js
│   ├── 03-custom-plugin.js
│   └── 04-vite-config.js
└── exercises/
    └── mini-webpack/
```

---

## 🎯 核心概念速览

### Webpack 核心

```
Entry → Loader → Plugin → Output
  ↓        ↓        ↓        ↓
入口    转换模块   扩展功能   输出文件
```

### Vite 原理

```
开发: 原生 ESM + esbuild 预构建
生产: Rollup 打包
```

---

> 完成本阶段后，你应该能够深入理解并优化构建配置。
