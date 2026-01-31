# Phase 5: ES6+ 新特性

> **目标**：掌握现代 JavaScript 特性  
> **预计时长**：1 周

---

## 📚 本阶段内容

### 学习目标

1. 掌握 let/const 与块级作用域
2. 理解解构赋值与展开运算符
3. 掌握 ES Modules
4. 了解迭代器、生成器、Proxy

### 知识要点

- let/const 与暂时性死区
- 解构赋值
- 箭头函数
- 模板字符串
- ES Modules
- 迭代器与生成器
- Proxy 与 Reflect

### 实战项目

**交互式简历**：使用 ES6+ 特性构建模块化项目

---

## 📂 目录结构

```
phase05-es6plus/
├── CONCEPT.md
├── README.md
├── examples/
│   ├── 01-let-const.js
│   ├── 02-destructuring.js
│   ├── 03-arrow-functions.js
│   ├── 04-modules.js
│   ├── 05-iterator.js
│   ├── 06-generator.js
│   └── 07-proxy.js
└── exercises/
    └── interactive-resume/
```

---

## 🎯 核心概念速览

### 1. 解构赋值

```javascript
const [a, b, ...rest] = [1, 2, 3, 4];
const { name, age = 18 } = user;
```

### 2. 箭头函数

```javascript
const add = (a, b) => a + b;
// 没有自己的 this，继承外层
```

### 3. Proxy

```javascript
const proxy = new Proxy(target, {
  get(target, key) {
    return target[key];
  },
  set(target, key, value) {
    target[key] = value;
    return true;
  },
});
```

---

> 完成本阶段后，你应该熟练使用 ES6+ 现代语法。
