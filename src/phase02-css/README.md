# Phase 2: CSS 精通

> **目标**：掌握 CSS 布局与现代特性  
> **预计时长**：2 周

---

## 📚 本阶段内容

### 学习目标

1. 理解选择器与优先级计算
2. 掌握 Flexbox 和 Grid 布局
3. 学会使用 CSS 动画
4. 实现响应式设计

### 知识要点

- 选择器与优先级
- 盒模型与 BFC
- Flexbox 布局
- Grid 布局
- 过渡与动画
- 响应式设计
- CSS 变量

### 实战项目

**响应式组件库**：创建一套响应式 UI 组件

---

## 📂 目录结构

```
phase02-css/
├── CONCEPT.md          # 核心概念
├── README.md           # 阶段概述（本文件）
├── examples/           # 示例代码
│   ├── 01-selectors.css
│   ├── 02-box-model.css
│   ├── 03-flexbox.css
│   ├── 04-grid.css
│   ├── 05-animations.css
│   └── 06-responsive.css
└── exercises/          # 练习题
    └── component-library/
```

---

## 🎯 核心概念速览

### 1. 选择器优先级

```
!important > 内联样式 > ID > 类/属性/伪类 > 元素/伪元素 > 通配符

计算规则: (a, b, c, d)
a: 内联样式
b: ID 选择器数量
c: 类/属性/伪类数量
d: 元素/伪元素数量
```

### 2. Flexbox 布局

```css
.container {
  display: flex;
  justify-content: center; /* 主轴对齐 */
  align-items: center; /* 交叉轴对齐 */
  flex-wrap: wrap; /* 换行 */
}

.item {
  flex: 1 1 auto; /* grow shrink basis */
}
```

### 3. Grid 布局

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto;
  gap: 20px;
}
```

### 4. 响应式设计

```css
/* 移动优先 */
.container {
  width: 100%;
}

@media (min-width: 768px) {
  .container {
    max-width: 720px;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 960px;
  }
}
```

---

## 📝 练习任务

1. **选择器练习**：计算各种选择器组合的优先级
2. **布局练习**：使用 Flexbox 和 Grid 实现常见布局
3. **动画练习**：制作 loading 动画和 hover 效果
4. **实战项目**：响应式组件库（按钮、卡片、导航栏）

---

## 📖 扩展阅读

- [MDN CSS 指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS)
- [CSS Tricks](https://css-tricks.com/)
- [Flexbox Froggy](https://flexboxfroggy.com/)
- [Grid Garden](https://cssgridgarden.com/)

---

> 完成本阶段后，你应该能够使用 CSS 实现复杂的响应式布局和动画效果。
