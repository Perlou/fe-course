// SVG 基础与路径详解
// 运行: node 03-svg-bindbs.js

console.log("=== SVG 基础与路径 ===\n");

// ========== 1. SVG 元素构建器 ==========
console.log("1. SVG 元素构建器\n");

class SVGBuilder {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.elements = [];
  }

  rect(x, y, w, h, attrs = {}) {
    this.elements.push({
      tag: "rect",
      attrs: { x, y, width: w, height: h, ...attrs },
    });
    return this;
  }

  circle(cx, cy, r, attrs = {}) {
    this.elements.push({
      tag: "circle",
      attrs: { cx, cy, r, ...attrs },
    });
    return this;
  }

  line(x1, y1, x2, y2, attrs = {}) {
    this.elements.push({
      tag: "line",
      attrs: { x1, y1, x2, y2, stroke: "black", ...attrs },
    });
    return this;
  }

  text(x, y, content, attrs = {}) {
    this.elements.push({
      tag: "text",
      attrs: { x, y, ...attrs },
      content,
    });
    return this;
  }

  path(d, attrs = {}) {
    this.elements.push({
      tag: "path",
      attrs: { d, fill: "none", stroke: "black", ...attrs },
    });
    return this;
  }

  // 生成 SVG 字符串
  toString() {
    const children = this.elements.map((el) => {
      const attrStr = Object.entries(el.attrs)
        .map(([k, v]) => `${k}="${v}"`)
        .join(" ");
      if (el.content) {
        return `  <${el.tag} ${attrStr}>${el.content}</${el.tag}>`;
      }
      return `  <${el.tag} ${attrStr} />`;
    });

    return [
      `<svg width="${this.width}" height="${this.height}" viewBox="0 0 ${this.width} ${this.height}">`,
      ...children,
      `</svg>`,
    ].join("\n");
  }
}

const svg = new SVGBuilder(400, 200);
svg
  .rect(10, 10, 80, 60, { fill: "#3b82f6", rx: 8 })
  .circle(150, 40, 30, { fill: "#ef4444" })
  .line(200, 10, 300, 70, { "stroke-width": 2 })
  .text(200, 120, "Hello SVG", { "text-anchor": "middle", "font-size": 20 })
  .path("M 10 150 Q 100 100 200 150 T 390 150", { stroke: "#10b981", "stroke-width": 2 });

console.log(svg.toString());

// ========== 2. SVG Path 命令 ==========
console.log("\n2. SVG Path 命令详解\n");

class PathParser {
  parse(d) {
    const commands = [];
    const regex = /([MLHVCSQTAZ])\s*([\d.,\s-]*)/gi;
    let match;

    while ((match = regex.exec(d)) !== null) {
      const cmd = match[1];
      const params = match[2].trim().split(/[\s,]+/).filter(Boolean).map(Number);
      commands.push({ command: cmd, params, relative: cmd === cmd.toLowerCase() });
    }

    return commands;
  }

  explain(d) {
    const map = {
      M: "移动到", m: "相对移动",
      L: "直线到", l: "相对直线",
      H: "水平线到", h: "相对水平",
      V: "垂直线到", v: "相对垂直",
      C: "三次贝塞尔", c: "相对三次贝塞尔",
      S: "平滑三次贝塞尔", s: "相对平滑",
      Q: "二次贝塞尔", q: "相对二次贝塞尔",
      T: "平滑二次贝塞尔", t: "相对平滑二次",
      A: "弧线", a: "相对弧线",
      Z: "闭合路径", z: "闭合路径",
    };

    const commands = this.parse(d);
    commands.forEach((cmd) => {
      const desc = map[cmd.command] || "未知";
      const params = cmd.params.length > 0 ? `(${cmd.params.join(", ")})` : "";
      console.log(`    ${cmd.command} ${cmd.params.join(" ")} → ${desc} ${params}`);
    });
  }
}

const parser = new PathParser();

console.log("  心形路径:");
const heartPath = "M 100 30 C 100 0, 50 0, 50 30 C 50 60, 100 80, 100 100 C 100 80, 150 60, 150 30 C 150 0, 100 0, 100 30 Z";
parser.explain(heartPath);

// ========== 3. viewBox 与坐标 ==========
console.log("\n3. SVG viewBox 与坐标系统\n");
console.log(`
  <svg width="400" height="300" viewBox="0 0 100 75">
       ^^^^^^^^^^^             ^^^^^^^^^^^^^^^
       实际尺寸                 虚拟坐标系

  viewBox = "minX minY width height"

  • 虚拟坐标系中 (50, 37.5) = 实际 (200, 150)
  • 自动缩放: 无论实际尺寸如何，都映射到 viewBox
  • preserveAspectRatio: 控制缩放方式

  preserveAspectRatio 选项:
  ┌─────────────────┬──────────────────────────┐
  │ none            │ 拉伸填充 (可能变形)      │
  │ xMidYMid meet   │ 居中，保持比例，完整显示  │
  │ xMidYMid slice  │ 居中，保持比例，裁剪超出  │
  └─────────────────┴──────────────────────────┘
`);

// ========== 4. SVG 滤镜与渐变 ==========
console.log("4. SVG 滤镜与渐变\n");
console.log(`
  <!-- 线性渐变 -->
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#ff6b6b" />
      <stop offset="100%" style="stop-color:#4ecdc4" />
    </linearGradient>
  </defs>
  <rect fill="url(#grad1)" width="200" height="100" />

  <!-- 模糊滤镜 -->
  <defs>
    <filter id="blur">
      <feGaussianBlur stdDeviation="5" />
    </filter>
  </defs>
  <circle filter="url(#blur)" cx="100" cy="100" r="50" />

  <!-- 阴影 -->
  <defs>
    <filter id="shadow">
      <feDropShadow dx="3" dy="3" stdDeviation="2" flood-opacity="0.3" />
    </filter>
  </defs>
`);

console.log("=== SVG 基础完成 ===");
