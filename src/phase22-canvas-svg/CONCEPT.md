# Canvas 与 SVG 深入解析

## 📌 一、Canvas vs SVG

```
┌─────────────────┬─────────────────┬─────────────────┐
│                 │     Canvas      │      SVG        │
├─────────────────┼─────────────────┼─────────────────┤
│ 基于            │ 像素（位图）    │ 矢量 (XML)      │
│ 缩放            │ 失真            │ 无损            │
│ 事件处理        │ 需要计算坐标    │ 原生 DOM 事件   │
│ 动画            │ 重绘整个画布    │ CSS/SMIL 动画   │
│ 性能            │ 元素多时好      │ 元素少时好      │
│ SEO             │ 不可索引        │ 可索引          │
│ 适用场景        │ 游戏、粒子效果  │ 图标、图表      │
│ DOM 节点        │ 单个 <canvas>   │ 每个图形一个    │
│ 像素操作        │ ✅ 支持         │ ❌ 不支持       │
│ 可访问性        │ ❌ 差           │ ✅ 好 (ARIA)    │
└─────────────────┴─────────────────┴─────────────────┘
```

---

## 📌 二、Canvas 2D

### 1. 基础绘图

```javascript
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 矩形
ctx.fillStyle = 'blue';
ctx.fillRect(10, 10, 100, 100);    // 填充矩形
ctx.strokeRect(120, 10, 100, 100); // 描边矩形
ctx.clearRect(20, 20, 80, 80);     // 清除区域

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
ctx.quadraticCurveTo(100, 200, 190, 250);
ctx.stroke();
```

### 2. 样式与渐变

```javascript
// 线条样式
ctx.lineWidth = 2;
ctx.lineCap = 'round';   // butt, round, square
ctx.lineJoin = 'round';  // miter, round, bevel

// 线性渐变
const linear = ctx.createLinearGradient(0, 0, 200, 0);
linear.addColorStop(0, '#ff6b6b');
linear.addColorStop(1, '#4ecdc4');
ctx.fillStyle = linear;

// 径向渐变
const radial = ctx.createRadialGradient(100, 100, 20, 100, 100, 80);
radial.addColorStop(0, 'white');
radial.addColorStop(1, 'blue');

// 阴影
ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
ctx.shadowBlur = 10;
ctx.shadowOffsetX = 5;

// 文本
ctx.font = '24px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('Hello Canvas', 100, 50);
```

### 3. 变换与状态

```javascript
ctx.save();                // 保存状态
ctx.translate(100, 100);   // 平移坐标原点
ctx.rotate(Math.PI / 4);   // 旋转 45°
ctx.scale(2, 2);           // 缩放 2 倍
ctx.fillRect(-25, -25, 50, 50);
ctx.restore();             // 恢复状态
```

### 4. 动画循环

```javascript
let x = 0;
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillRect(x, 100, 50, 50);
  x = (x + 2) % canvas.width;
  requestAnimationFrame(animate);
}
animate();
```

### 5. Canvas 事件处理

```javascript
// Canvas 没有内置事件，需手动计算坐标
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // 检测点击是否在图形内
  shapes.forEach(shape => {
    if (isPointInShape(x, y, shape)) {
      shape.onClick();
    }
  });
});

// 碰撞检测: 圆形
function isPointInCircle(px, py, cx, cy, r) {
  return Math.sqrt((px - cx) ** 2 + (py - cy) ** 2) <= r;
}

// 碰撞检测: 矩形
function isPointInRect(px, py, rx, ry, rw, rh) {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}
```

---

## 📌 三、SVG

### 1. 基础元素

```html
<svg width="400" height="300" viewBox="0 0 400 300">
  <rect x="10" y="10" width="100" height="80" fill="blue" rx="10" />
  <circle cx="200" cy="50" r="40" fill="red" />
  <ellipse cx="350" cy="50" rx="40" ry="25" fill="green" />
  <line x1="10" y1="120" x2="110" y2="120" stroke="black" />
  <polyline points="140,120 160,90 180,120" fill="none" stroke="black" />
  <polygon points="260,90 290,120 230,120" fill="orange" />
  <text x="200" y="280" text-anchor="middle">Hello SVG</text>
</svg>
```

### 2. SVG Path 命令

```
┌────────┬───────────────────────────────────┐
│ 命令    │ 说明                              │
├────────┼───────────────────────────────────┤
│ M x y  │ 移动到 (moveTo)                   │
│ L x y  │ 直线到 (lineTo)                   │
│ H x    │ 水平线                            │
│ V y    │ 垂直线                            │
│ C      │ 三次贝塞尔曲线                    │
│ Q      │ 二次贝塞尔曲线                    │
│ A      │ 弧线                              │
│ Z      │ 闭合路径                          │
│ 小写    │ 相对坐标 (m/l/h/v/c/q/a/z)       │
└────────┴───────────────────────────────────┘

<path d="M 10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80" />
```

### 3. SVG 动画

```html
<!-- SMIL 动画 -->
<circle cx="50" cy="50" r="20" fill="red">
  <animate attributeName="cx" from="50" to="350" dur="2s"
           repeatCount="indefinite" />
</circle>

<!-- CSS 动画 -->
<style>
  @keyframes rotate { to { transform: rotate(360deg); } }
  .spin { animation: rotate 2s linear infinite; transform-origin: center; }
</style>
<rect class="spin" x="-25" y="-25" width="50" height="50" />

<!-- JS 动画 -->
<script>
  const circle = document.querySelector('circle');
  let cx = 50;
  function animate() {
    cx = (cx + 2) % 400;
    circle.setAttribute('cx', cx);
    requestAnimationFrame(animate);
  }
</script>
```

---

## 📌 四、像素操作

```javascript
// 获取像素数据
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const data = imageData.data; // Uint8ClampedArray [R,G,B,A, R,G,B,A, ...]

// 灰度化
for (let i = 0; i < data.length; i += 4) {
  const gray = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
  data[i] = data[i+1] = data[i+2] = gray;
}
ctx.putImageData(imageData, 0, 0);

// 其他效果: 反色、模糊、锐化、边缘检测
```

---

## 📌 五、D3.js

```javascript
import * as d3 from 'd3';

// 选择与数据绑定
d3.select('svg')
  .selectAll('circle')
  .data([10, 20, 30, 40, 50])
  .join('circle')
  .attr('cx', (d, i) => 50 + i * 60)
  .attr('cy', 50)
  .attr('r', d => d)
  .attr('fill', 'steelblue');

// 比例尺
const xScale = d3.scaleLinear().domain([0, 100]).range([0, 400]);
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// 坐标轴
const xAxis = d3.axisBottom(xScale);
d3.select('svg').append('g').call(xAxis);

// 过渡动画
d3.selectAll('circle')
  .transition()
  .duration(1000)
  .attr('r', d => d * 2);
```

---

## 📌 六、ECharts

```javascript
import * as echarts from 'echarts';

const chart = echarts.init(document.getElementById('chart'));

chart.setOption({
  title: { text: '销售数据' },
  tooltip: { trigger: 'axis' },
  xAxis: { data: ['1月', '2月', '3月', '4月'] },
  yAxis: {},
  series: [
    { type: 'bar', data: [100, 200, 150, 300] },
    { type: 'line', data: [80, 180, 200, 280] },
  ],
});

window.addEventListener('resize', () => chart.resize());
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
