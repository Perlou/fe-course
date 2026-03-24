// 手写图表引擎详解
// 运行: node 04-binddata-bindvisualization.js

console.log("=== 数据可视化 ===\n");

// ========== 1. 手写柱状图 (ASCII) ==========
console.log("1. 手写柱状图引擎\n");

class BarChart {
  constructor(options = {}) {
    this.width = options.width || 40;
    this.height = options.height || 10;
    this.barChar = options.barChar || "█";
    this.emptyChar = " ";
  }

  render(data, labels) {
    const maxVal = Math.max(...data.map((d) => d.value));

    // 标题
    if (labels?.title) {
      console.log(`  ${labels.title}`);
      console.log(`  ${"─".repeat(this.width)}`);
    }

    // 绘制每个柱子
    data.forEach((item) => {
      const barLen = Math.round((item.value / maxVal) * (this.width - 15));
      const bar = this.barChar.repeat(barLen);
      const label = item.label.padEnd(8);
      const value = item.value.toString().padStart(4);
      console.log(`  ${label} ${bar} ${value}`);
    });

    console.log();
  }
}

const barChart = new BarChart({ width: 50 });

barChart.render([
  { label: "1月", value: 120 },
  { label: "2月", value: 200 },
  { label: "3月", value: 150 },
  { label: "4月", value: 300 },
  { label: "5月", value: 250 },
  { label: "6月", value: 180 },
], { title: "📊 月度销售额" });

// ========== 2. 手写折线图 (ASCII) ==========
console.log("2. 手写折线图引擎\n");

class LineChart {
  constructor(width = 40, height = 12) {
    this.width = width;
    this.height = height;
  }

  render(data, title = "") {
    if (title) console.log(`  ${title}`);

    const maxVal = Math.max(...data);
    const minVal = Math.min(...data);
    const range = maxVal - minVal || 1;

    // 创建网格
    const grid = Array(this.height).fill(null).map(() => Array(this.width).fill(" "));

    // Y 轴
    for (let y = 0; y < this.height; y++) {
      grid[y][0] = "│";
    }
    // X 轴
    for (let x = 0; x < this.width; x++) {
      grid[this.height - 1][x] = "─";
    }
    grid[this.height - 1][0] = "└";

    // 绘制数据点
    const step = Math.max(1, Math.floor((this.width - 2) / (data.length - 1)));
    const points = [];

    data.forEach((val, i) => {
      const x = 1 + i * step;
      const y = this.height - 2 - Math.round(((val - minVal) / range) * (this.height - 3));
      if (x < this.width && y >= 0 && y < this.height) {
        grid[y][x] = "●";
        points.push({ x, y });
      }
    });

    // 连线
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      for (let x = p1.x + 1; x < p2.x; x++) {
        const t = (x - p1.x) / (p2.x - p1.x);
        const y = Math.round(p1.y + (p2.y - p1.y) * t);
        if (y >= 0 && y < this.height && grid[y][x] === " ") {
          grid[y][x] = "·";
        }
      }
    }

    // Y 轴标签
    const yLabels = [maxVal, Math.round((maxVal + minVal) / 2), minVal];
    const yPositions = [0, Math.floor(this.height / 2), this.height - 2];

    // 输出
    grid.forEach((row) => {
      console.log("  " + row.join(""));
    });

    console.log(`  ${minVal}${" ".repeat(Math.floor(this.width / 2) - 4)}${maxVal}\n`);
  }
}

const lineChart = new LineChart(35, 10);
lineChart.render([30, 50, 40, 80, 60, 90, 70, 100], "📈 趋势图");

// ========== 3. 饼图 (文本) ==========
console.log("3. 饼图数据\n");

class PieChart {
  constructor(data) {
    this.data = data;
    this.total = data.reduce((sum, d) => sum + d.value, 0);
  }

  render() {
    const chars = ["█", "▓", "▒", "░", "▪", "▫"];

    this.data.forEach((item, i) => {
      const pct = ((item.value / this.total) * 100).toFixed(1);
      const barLen = Math.round((item.value / this.total) * 30);
      const bar = (chars[i % chars.length]).repeat(barLen);
      console.log(`  ${chars[i % chars.length]} ${item.label.padEnd(10)} ${bar} ${pct}%`);
    });

    console.log(`  ────────────────────────────────────`);
    console.log(`  总计: ${this.total}\n`);
  }
}

const pie = new PieChart([
  { label: "React", value: 45 },
  { label: "Vue", value: 30 },
  { label: "Angular", value: 15 },
  { label: "Svelte", value: 7 },
  { label: "Other", value: 3 },
]);
pie.render();

// ========== 4. 比例尺 ==========
console.log("4. 比例尺 (Scale)\n");

function linearScale(domain, range) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const ratio = (r1 - r0) / (d1 - d0);

  const scale = (value) => r0 + (value - d0) * ratio;
  scale.invert = (value) => d0 + (value - r0) / ratio;
  scale.domain = domain;
  scale.range = range;

  return scale;
}

function colorScale(domain, colors) {
  return (value) => {
    const idx = Math.min(
      Math.floor(((value - domain[0]) / (domain[1] - domain[0])) * colors.length),
      colors.length - 1
    );
    return colors[Math.max(0, idx)];
  };
}

const xScale = linearScale([0, 100], [0, 400]);
console.log(`  linearScale([0,100], [0,400]):`);
console.log(`    50 → ${xScale(50)}`);
console.log(`    75 → ${xScale(75)}`);
console.log(`    invert(200) → ${xScale.invert(200)}`);

const heat = colorScale([0, 100], ["🟢", "🟡", "🟠", "🔴"]);
console.log(`\n  colorScale: 10→${heat(10)}, 40→${heat(40)}, 70→${heat(70)}, 95→${heat(95)}\n`);

console.log("=== 数据可视化完成 ===");
