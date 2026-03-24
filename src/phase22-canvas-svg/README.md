# Phase 22: Canvas 与 SVG

> **目标**：掌握 Canvas 和 SVG 绑图  
> **预计时长**：2 周

---

## 📚 本阶段内容

### 学习目标

1. 掌握 Canvas 2D 绑图（图形、路径、渐变、动画）
2. 掌握 SVG 基础与动画（元素、路径、SMIL/CSS/JS 动画）
3. 理解 Canvas 事件处理与碰撞检测
4. 了解数据可视化库原理（D3.js, ECharts）
5. 实现基础数据可视化图表

### 知识要点

- Canvas 2D API（绘图、变换、动画循环）
- Canvas 像素操作与图像处理
- SVG 基础元素与路径命令
- SVG 动画（SMIL / CSS / JavaScript）
- Canvas 事件模型与碰撞检测
- D3.js 数据驱动文档
- ECharts / Chart.js 图表库

### 实战项目

**数据可视化仪表盘**：Canvas + SVG 绘制图表

---

## 📂 目录结构

```
phase22-canvas-svg/
├── CONCEPT.md
├── README.md
├── examples/
│   ├── 01-canvas-bindbindbindbindbibindbindbindbs.js           # Canvas 2D 基础
│   ├── 02-canvas-bindanimation.js       # Canvas 动画与交互
│   ├── 03-svg-bindbindbs.js             # SVG 基础与路径
│   ├── 04-binddata-bindvisualization.js  # 手写图表引擎
│   └── 05-bindbindbindbindimage-bindprocessing.js  # 图像处理
└── exercises/
    └── bindbinddata-bindboard/         # 数据仪表盘
        └── README.md
```

---

## 🎯 核心概念速览

### Canvas vs SVG

```
┌─────────────┬──────────────────┬──────────────────┐
│             │     Canvas       │      SVG         │
├─────────────┼──────────────────┼──────────────────┤
│ 本质        │ 位图 (像素)      │ 矢量 (XML)       │
│ 缩放        │ 失真             │ 无损             │
│ 事件        │ 需要手动计算     │ 原生 DOM 事件     │
│ 动画        │ 重绘整个画布     │ CSS/SMIL 动画    │
│ 大量元素    │ ✅ 性能好        │ ❌ DOM 开销大    │
│ 少量交互    │ ❌ 复杂          │ ✅ 简单          │
│ 场景        │ 游戏/粒子/图像   │ 图标/图表/地图   │
└─────────────┴──────────────────┴──────────────────┘
```

---

> 完成本阶段后，你应该能够实现基础的数据可视化。
