# Phase 3: JavaScript 核心

> **目标**：深入理解 JavaScript 核心原理  
> **预计时长**：3 周

---

## 📚 本阶段内容

### 学习目标

1. 理解作用域与闭包
2. 掌握原型与原型链
3. 理解 this 绑定规则
4. 掌握异步编程与事件循环

### 知识要点

- 变量与数据类型
- 作用域链与闭包
- 原型与原型链
- this 绑定
- 事件循环
- Promise 与 async/await

### 实战项目

**手写 Promise**：实现符合 A+ 规范的 Promise

---

## 📂 目录结构

```
phase03-javascript/
├── CONCEPT.md          # 核心概念
├── README.md           # 阶段概述（本文件）
├── examples/           # 示例代码
│   ├── 01-variables.js
│   ├── 02-scope.js
│   ├── 03-closure.js
│   ├── 04-prototype.js
│   ├── 05-this.js
│   ├── 06-event-loop.js
│   └── 07-promise.js
└── exercises/          # 练习题
    └── promise-aplus/
```

---

## 🎯 核心概念速览

### 1. 闭包

```javascript
function createCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    getCount: () => count,
  };
}
const counter = createCounter();
counter.increment(); // 1
```

### 2. 原型链

```
实例 → 构造函数.prototype → Object.prototype → null
```

### 3. this 绑定

```
优先级: new > 显式绑定 > 隐式绑定 > 默认绑定
```

### 4. 事件循环

```
同步代码 → 微任务 → 渲染 → 宏任务
```

---

## 📝 练习任务

1. **闭包练习**：实现防抖、节流、柯里化
2. **原型链练习**：实现 `new`、`instanceof`、继承
3. **this 练习**：实现 `call`、`apply`、`bind`
4. **实战项目**：手写符合 A+ 规范的 Promise

---

> 完成本阶段后，你应该深入理解 JavaScript 核心机制。
