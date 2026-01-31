# Phase 11: React 核心原理

> **目标**：深入理解 React 核心原理  
> **预计时长**：2 周

---

## 📚 本阶段内容

### 学习目标

1. 理解 JSX 编译原理
2. 掌握虚拟 DOM 与 Diff 算法
3. 深入理解 Fiber 架构
4. 理解 Hooks 实现原理

### 知识要点

- JSX 原理
- 虚拟 DOM
- Fiber 架构
- Reconciliation
- Hooks 原理
- 并发模式

### 实战项目

**手写 Mini React**：实现简化版 React

---

## 📂 目录结构

```
phase11-react-core/
├── CONCEPT.md
├── README.md
├── examples/
│   ├── 01-jsx-transform.jsx
│   ├── 02-virtual-dom.js
│   ├── 03-fiber.js
│   └── 04-hooks.js
└── exercises/
    └── mini-react/
```

---

## 🎯 核心概念速览

### Fiber 架构

```
Current Fiber Tree ←→ WorkInProgress Fiber Tree
                   (双缓存，commit 时切换)
```

### Hooks 链表

```
fiber.memoizedState → Hook1 → Hook2 → Hook3 → null
```

---

> 完成本阶段后，你应该能够理解 React 内部工作原理。
