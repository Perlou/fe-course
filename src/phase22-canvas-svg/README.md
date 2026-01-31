# Phase 22: Canvas 与 SVG

> **目标**：掌握 Canvas 和 SVG 绑图  
> **预计时长**：2 周

## 📚 学习目标

1. 掌握 Canvas 2D 绑图
2. 理解 SVG 基础与动画
3. 了解图表库原理
4. 实现数据可视化

## 知识要点

- Canvas 2D API
- SVG 基础元素
- SVG 动画 (SMIL, CSS, JS)
- D3.js 基础
- 图表库 (ECharts, Chart.js)

## 核心概念

```javascript
// Canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.fillRect(10, 10, 100, 100);

// SVG
<svg width="200" height="200">
  <circle cx="100" cy="100" r="50" fill="blue" />
</svg>;
```

---

> 完成本阶段后，你应该能够实现基础的数据可视化。
