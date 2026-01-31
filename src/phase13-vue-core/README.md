# Phase 13: Vue 核心原理

> **目标**：深入理解 Vue 核心原理  
> **预计时长**：2 周

---

## 📚 本阶段内容

### 学习目标

1. 理解 Vue 3 响应式原理
2. 掌握编译器原理
3. 理解 Diff 算法优化
4. 了解组件系统实现

### 知识要点

- 响应式原理 (Proxy)
- 依赖收集与触发
- 模板编译
- Diff 算法 (最长递增子序列)
- 组件挂载与更新

### 实战项目

**手写 Mini Vue**：实现简化版 Vue 3

---

## 📂 目录结构

```
phase13-vue-core/
├── CONCEPT.md
├── README.md
├── examples/
│   ├── 01-reactivity.js
│   ├── 02-compiler.js
│   ├── 03-diff.js
│   └── 04-component.js
└── exercises/
    └── mini-vue/
```

---

## 🎯 核心概念速览

### 响应式

```javascript
const state = reactive({ count: 0 });
effect(() => console.log(state.count));
state.count++; // 自动触发 effect
```

### Diff 优化

```
最长递增子序列 (LIS) 算法
最小化 DOM 移动操作
```

---

> 完成本阶段后，你应该能够理解 Vue 内部工作原理。
