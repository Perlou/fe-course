# Phase 4: DOM/BOM 编程

> **目标**：掌握 DOM 操作与事件机制  
> **预计时长**：1 周

---

## 📚 本阶段内容

### 学习目标

1. 掌握 DOM 查询与操作
2. 理解事件流与事件委托
3. 熟悉 BOM API
4. 了解本地存储方案

### 知识要点

- DOM 查询方法
- DOM 增删改操作
- 事件冒泡与捕获
- 事件委托
- BOM API (window, location, history)
- 本地存储 (localStorage, sessionStorage)

### 实战项目

**待办事项应用**：实现增删改查、筛选、本地存储

---

## 📂 目录结构

```
phase04-dom-bom/
├── CONCEPT.md          # 核心概念
├── README.md           # 阶段概述（本文件）
├── examples/
│   ├── 01-dom-query.js
│   ├── 02-dom-manipulation.js
│   ├── 03-event-basics.js
│   ├── 04-event-delegation.js
│   └── 05-storage.js
└── exercises/
    └── todo-app/
```

---

## 🎯 核心概念速览

### 1. DOM 查询

```javascript
document.getElementById("id");
document.querySelector(".class");
document.querySelectorAll(".class");
element.closest(".parent");
```

### 2. 事件流

```
捕获阶段 → 目标阶段 → 冒泡阶段
```

### 3. 事件委托

```javascript
parent.addEventListener("click", (e) => {
  if (e.target.matches(".item")) {
    // 处理
  }
});
```

---

## 📝 练习任务

1. 实现 DOM 增删改查操作
2. 实现事件委托处理列表点击
3. **实战项目**：待办事项应用

---

> 完成本阶段后，你应该能够熟练操作 DOM 和处理事件。
