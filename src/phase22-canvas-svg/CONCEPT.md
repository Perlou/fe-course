# Canvas 与 SVG 深入解析

## 📌 一、Canvas vs SVG

```
┌─────────────────┬─────────────────┬─────────────────┐
│                 │     Canvas      │      SVG        │
├─────────────────┼─────────────────┼─────────────────┤
│ 基于            │ 像素（位图）    │ 矢量            │
│ 缩放            │ 失真            │ 无损            │
│ 事件处理        │ 需要计算        │ 原生支持        │
│ 动画            │ 重绘整个画布    │ DOM 操作        │
│ 性能            │ 元素多时好      │ 元素少时好      │
│ 适用场景        │ 游戏、粒子效果  │ 图标、图表      │
└─────────────────┴─────────────────┴─────────────────┘
```

---

## 📌 二、Canvas 2D

### 1. 基础绘图

```javascript
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// 矩形
ctx.fillStyle = "blue";
ctx.fillRect(10, 10, 100, 100);
ctx.strokeRect(120, 10, 100, 100);
ctx.clearRect(20, 20, 80, 80);

// 路径
ctx.beginPath();
ctx.moveTo(10, 150);
ctx.lineTo(110, 150);
ctx.lineTo(60, 200);
ctx.closePath();
ctx.fill();

// 圆弧
ctx.beginPath();
ctx.arc(200, 175, 50, 0, Math.PI * 2);
ctx.stroke();

// 贝塞尔曲线
ctx.beginPath();
ctx.moveTo(10, 250);
ctx.quadraticCurveTo(100, 200, 190, 250); // 二次
ctx.bezierCurveTo(10, 300, 190, 300, 10, 350); // 三次
ctx.stroke();
```

### 2. 样式与文本

```javascript
// 线条样式
ctx.lineWidth = 2;
ctx.lineCap = "round"; // butt, round, square
ctx.lineJoin = "round"; // miter, round, bevel

// 渐变
const gradient = ctx.createLinearGradient(0, 0, 200, 0);
gradient.addColorStop(0, "red");
gradient.addColorStop(1, "blue");
ctx.fillStyle = gradient;

// 阴影
ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
ctx.shadowBlur = 10;
ctx.shadowOffsetX = 5;
ctx.shadowOffsetY = 5;

// 文本
ctx.font = "24px Arial";
ctx.fillText("Hello Canvas", 10, 50);
ctx.strokeText("Hello Canvas", 10, 100);
ctx.textAlign = "center";
ctx.textBaseline = "middle";
```

### 3. 变换与动画

```javascript
// 变换
ctx.save();
ctx.translate(100, 100);
ctx.rotate(Math.PI / 4);
ctx.scale(2, 2);
ctx.fillRect(-25, -25, 50, 50);
ctx.restore();

// 动画
let x = 0;
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillRect(x, 100, 50, 50);
  x += 2;
  if (x > canvas.width) x = 0;
  requestAnimationFrame(animate);
}
animate();
```

---

## 📌 三、SVG

### 1. 基础元素

```html
<svg width="400" height="300" viewBox="0 0 400 300">
  <!-- 矩形 -->
  <rect x="10" y="10" width="100" height="80" fill="blue" rx="10" />

  <!-- 圆 -->
  <circle cx="200" cy="50" r="40" fill="red" />

  <!-- 椭圆 -->
  <ellipse cx="350" cy="50" rx="40" ry="25" fill="green" />

  <!-- 线 -->
  <line x1="10" y1="120" x2="110" y2="120" stroke="black" stroke-width="2" />

  <!-- 折线 -->
  <polyline points="140,120 160,90 180,120 200,90" fill="none" stroke="black" />

  <!-- 多边形 -->
  <polygon points="260,90 290,120 230,120" fill="orange" />

  <!-- 路径 -->
  <path
    d="M 10 200 Q 100 150 190 200 T 370 200"
    fill="none"
    stroke="purple"
    stroke-width="2"
  />

  <!-- 文本 -->
  <text x="200" y="280" text-anchor="middle" fill="black">Hello SVG</text>
</svg>
```

### 2. SVG 动画

```html
<!-- SMIL 动画 -->
<circle cx="50" cy="50" r="20" fill="red">
  <animate
    attributeName="cx"
    from="50"
    to="350"
    dur="2s"
    repeatCount="indefinite"
  />
</circle>

<!-- CSS 动画 -->
<style>
  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  .spinning {
    animation: rotate 2s linear infinite;
    transform-origin: center;
  }
</style>
<rect class="spinning" x="-25" y="-25" width="50" height="50" />

<!-- JS 动画 -->
<script>
  const circle = document.querySelector("circle");
  let cx = 50;
  function animate() {
    cx = (cx + 2) % 400;
    circle.setAttribute("cx", cx);
    requestAnimationFrame(animate);
  }
  animate();
</script>
```

---

## 📌 四、D3.js

```javascript
import * as d3 from "d3";

// 选择与绑定数据
d3.select("svg")
  .selectAll("circle")
  .data([10, 20, 30, 40, 50])
  .join("circle")
  .attr("cx", (d, i) => 50 + i * 60)
  .attr("cy", 50)
  .attr("r", (d) => d)
  .attr("fill", "steelblue");

// 比例尺
const xScale = d3.scaleLinear().domain([0, 100]).range([0, 400]);

const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// 坐标轴
const xAxis = d3.axisBottom(xScale);
d3.select("svg").append("g").call(xAxis);

// 过渡动画
d3.selectAll("circle")
  .transition()
  .duration(1000)
  .attr("r", (d) => d * 2);
```

---

## 📌 五、ECharts

```javascript
import * as echarts from "echarts";

const chart = echarts.init(document.getElementById("chart"));

chart.setOption({
  title: { text: "销售数据" },
  tooltip: {},
  xAxis: { data: ["1月", "2月", "3月", "4月"] },
  yAxis: {},
  series: [
    {
      type: "bar",
      data: [100, 200, 150, 300],
    },
  ],
});

// 响应式
window.addEventListener("resize", () => chart.resize());
```

---

## 📚 推荐学习资源

| 资源       | 链接                             |
| ---------- | -------------------------------- |
| MDN Canvas | developer.mozilla.org/Canvas_API |
| SVG 教程   | developer.mozilla.org/SVG        |
| D3.js      | d3js.org                         |
| ECharts    | echarts.apache.org               |

---
