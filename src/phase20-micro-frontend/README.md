# Phase 20: 微前端

> **目标**：掌握微前端架构  
> **预计时长**：2 周

---

## 📚 本阶段内容

### 学习目标

1. 理解微前端概念与适用场景
2. 掌握主流微前端方案（qiankun / Module Federation / Web Components）
3. 实现 JS 沙箱隔离机制
4. 解决样式隔离与应用间通信
5. 了解微前端路由与生命周期管理

### 知识要点

- 微前端架构设计与适用场景
- qiankun 框架使用
- Webpack Module Federation
- JS 沙箱（快照沙箱 / Proxy 沙箱）
- 样式隔离（Shadow DOM / CSS Modules / 命名空间）
- 应用间通信（CustomEvent / 发布订阅）
- 路由劫持与生命周期管理
- Web Components 方案

### 实战项目

**微前端管理平台**：主应用 + 多子应用集成

---

## 📂 目录结构

```
phase20-micro-frontend/
├── CONCEPT.md
├── README.md
├── examples/
│   ├── 01-js-sandbox.js          # JS 沙箱原理
│   ├── 02-css-isolation.js       # 样式隔离方案
│   ├── 03-app-communication.js   # 应用间通信
│   ├── 04-lifecycle.js           # 生命周期管理
│   └── 05-module-federation.js   # Module Federation
└── exercises/
    └── micro-app/                # 微前端实战
        └── README.md
```

---

## 🎯 核心概念速览

### 微前端架构

```
┌──────────────────────────────────────────────────┐
│                 主应用 (Shell)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ 子应用 A  │  │ 子应用 B  │  │ 子应用 C  │       │
│  │  React   │  │   Vue    │  │  Angular  │       │
│  │  独立部署 │  │  独立部署 │  │  独立部署 │       │
│  └──────────┘  └──────────┘  └──────────┘       │
│                                                  │
│  路由分发 + 沙箱隔离 + 样式隔离 + 通信            │
└──────────────────────────────────────────────────┘
```

### 方案对比

```
qiankun         — 成熟稳定，基于 single-spa
Module Federation — Webpack 原生，运行时共享
Web Components   — 浏览器原生，Shadow DOM
iframe          — 最简单，隔离最彻底，但体验差
```

---

> 完成本阶段后，你应该能够设计和实现微前端架构。
