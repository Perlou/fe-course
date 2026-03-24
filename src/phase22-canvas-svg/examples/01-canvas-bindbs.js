// Canvas 2D 基础详解
// 运行: node 01-canvas-bindbs.js (手写 Canvas 2D 引擎)

console.log("=== Canvas 2D 基础 ===\n");

// ========== 1. 模拟 Canvas 2D Context ==========
console.log("1. 模拟 Canvas 2D Context\n");

class MockCanvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.pixels = Array(height).fill(null).map(() => Array(width).fill(" "));
    this.fillChar = "█";
    this.strokeChar = "░";
    this.stateStack = [];
    this.translateX = 0;
    this.translateY = 0;
  }

  // 填充矩形
  fillRect(x, y, w, h) {
    x += this.translateX;
    y += this.translateY;
    for (let row = y; row < y + h && row < this.height; row++) {
      for (let col = x; col < x + w && col < this.width; col++) {
        if (row >= 0 && col >= 0) this.pixels[row][col] = this.fillChar;
      }
    }
  }

  // 描边矩形
  strokeRect(x, y, w, h) {
    x += this.translateX;
    y += this.translateY;
    for (let col = x; col < x + w && col < this.width; col++) {
      if (y >= 0) this.pixels[y][col] = this.strokeChar;
      if (y + h - 1 < this.height) this.pixels[y + h - 1][col] = this.strokeChar;
    }
    for (let row = y; row < y + h && row < this.height; row++) {
      if (x >= 0) this.pixels[row][x] = this.strokeChar;
      if (x + w - 1 < this.width) this.pixels[row][x + w - 1] = this.strokeChar;
    }
  }

  // 画圆 (Bresenham 算法简化)
  fillCircle(cx, cy, r) {
    cx += this.translateX;
    cy += this.translateY;
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        if (x * x + y * y <= r * r) {
          const px = cx + x;
          const py = cy + y;
          if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
            this.pixels[py][px] = this.fillChar;
          }
        }
      }
    }
  }

  // 画线 (DDA 算法)
  drawLine(x1, y1, x2, y2) {
    x1 += this.translateX; y1 += this.translateY;
    x2 += this.translateX; y2 += this.translateY;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    const xInc = dx / steps;
    const yInc = dy / steps;
    let x = x1, y = y1;
    for (let i = 0; i <= steps; i++) {
      const px = Math.round(x);
      const py = Math.round(y);
      if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
        this.pixels[py][px] = this.strokeChar;
      }
      x += xInc;
      y += yInc;
    }
  }

  // 清除
  clearRect(x, y, w, h) {
    for (let row = y; row < y + h && row < this.height; row++) {
      for (let col = x; col < x + w && col < this.width; col++) {
        if (row >= 0 && col >= 0) this.pixels[row][col] = " ";
      }
    }
  }

  // 状态保存/恢复
  save() {
    this.stateStack.push({ tx: this.translateX, ty: this.translateY, fc: this.fillChar });
  }

  restore() {
    const state = this.stateStack.pop();
    if (state) {
      this.translateX = state.tx;
      this.translateY = state.ty;
      this.fillChar = state.fc;
    }
  }

  translate(x, y) {
    this.translateX += x;
    this.translateY += y;
  }

  // 渲染到控制台
  render() {
    const border = "+" + "-".repeat(this.width) + "+";
    console.log("  " + border);
    this.pixels.forEach((row) => {
      console.log("  |" + row.join("") + "|");
    });
    console.log("  " + border);
  }
}

// 绘制示例
const canvas = new MockCanvas(40, 15);

// 填充矩形
canvas.fillRect(2, 1, 8, 4);
console.log("  fillRect(2, 1, 8, 4)");

// 描边矩形
canvas.strokeRect(12, 1, 10, 5);
console.log("  strokeRect(12, 1, 10, 5)");

// 圆形
canvas.fillCircle(32, 4, 3);
console.log("  fillCircle(32, 4, 3)");

// 对角线
canvas.drawLine(2, 8, 38, 13);
console.log("  drawLine(2, 8, 38, 13)\n");

canvas.render();

// ========== 2. Canvas 绘图 API 总结 ==========
console.log("\n2. Canvas 2D API 总结\n");
console.log(`
  绘图方法:
  ┌──────────────────────────────────────────────────────┐
  │ 矩形    │ fillRect, strokeRect, clearRect            │
  ├─────────┼──────────────────────────────────────────┤
  │ 路径    │ beginPath, moveTo, lineTo, closePath      │
  │         │ arc, arcTo, quadraticCurveTo, bezierCurveTo│
  ├─────────┼──────────────────────────────────────────┤
  │ 样式    │ fillStyle, strokeStyle, lineWidth         │
  │         │ lineCap, lineJoin, globalAlpha            │
  ├─────────┼──────────────────────────────────────────┤
  │ 渐变    │ createLinearGradient, createRadialGradient│
  ├─────────┼──────────────────────────────────────────┤
  │ 文本    │ fillText, strokeText, font, textAlign     │
  ├─────────┼──────────────────────────────────────────┤
  │ 变换    │ translate, rotate, scale, save, restore  │
  ├─────────┼──────────────────────────────────────────┤
  │ 像素    │ getImageData, putImageData, createImageData│
  └─────────┴──────────────────────────────────────────┘
`);

// ========== 3. 碰撞检测 ==========
console.log("3. 碰撞检测算法\n");

function isPointInRect(px, py, rx, ry, rw, rh) {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

function isPointInCircle(px, py, cx, cy, r) {
  return (px - cx) ** 2 + (py - cy) ** 2 <= r * r;
}

function isRectOverlap(r1, r2) {
  return r1.x < r2.x + r2.w && r1.x + r1.w > r2.x &&
         r1.y < r2.y + r2.h && r1.y + r1.h > r2.y;
}

function isCircleOverlap(c1, c2) {
  const dist = Math.sqrt((c1.x - c2.x) ** 2 + (c1.y - c2.y) ** 2);
  return dist <= c1.r + c2.r;
}

console.log(`  点(50, 50) 在 Rect(0,0,100,100): ${isPointInRect(50, 50, 0, 0, 100, 100)}`);
console.log(`  点(150, 50) 在 Rect(0,0,100,100): ${isPointInRect(150, 50, 0, 0, 100, 100)}`);
console.log(`  点(50, 50) 在 Circle(50,50,30): ${isPointInCircle(50, 50, 50, 50, 30)}`);
console.log(`  两矩形重叠: ${isRectOverlap({ x: 0, y: 0, w: 100, h: 100 }, { x: 50, y: 50, w: 100, h: 100 })}`);
console.log(`  两圆重叠: ${isCircleOverlap({ x: 0, y: 0, r: 30 }, { x: 40, y: 0, r: 20 })}`);

console.log("\n=== Canvas 2D 基础完成 ===");
