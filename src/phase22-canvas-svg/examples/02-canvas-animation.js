// Canvas 动画与交互详解
// 运行: node 02-canvas-animation.js

console.log("=== Canvas 动画与交互 ===\n");

// ========== 1. 动画循环 ==========
console.log("1. 动画循环 (Game Loop)\n");

class GameLoop {
  constructor(fps = 60) {
    this.fps = fps;
    this.frameTime = 1000 / fps;
    this.running = false;
    this.frameCount = 0;
    this.elapsed = 0;
  }

  start(update, maxFrames = 10) {
    this.running = true;
    const startTime = Date.now();

    const loop = () => {
      if (!this.running || this.frameCount >= maxFrames) {
        this.stop();
        return;
      }

      const now = Date.now();
      const delta = now - startTime - this.elapsed;

      if (delta >= this.frameTime) {
        const dt = delta / 1000; // 秒
        update(dt, this.frameCount);
        this.elapsed += this.frameTime;
        this.frameCount++;
      }

      if (this.running) setTimeout(loop, 1);
    };

    loop();
  }

  stop() {
    this.running = false;
    console.log(`  总帧数: ${this.frameCount}, 目标帧率: ${this.fps}fps\n`);
  }
}

// 弹跳球动画
class Ball {
  constructor(x, y, vx, vy, radius) {
    this.x = x;  this.y = y;
    this.vx = vx; this.vy = vy;
    this.radius = radius;
    this.trail = [];
  }

  update(dt, canvasWidth, canvasHeight) {
    this.trail.push({ x: Math.round(this.x), y: Math.round(this.y) });
    if (this.trail.length > 5) this.trail.shift();

    this.x += this.vx * dt * 60;
    this.y += this.vy * dt * 60;

    // 边界反弹
    if (this.x - this.radius < 0 || this.x + this.radius > canvasWidth) {
      this.vx *= -1;
      this.x = Math.max(this.radius, Math.min(canvasWidth - this.radius, this.x));
    }
    if (this.y - this.radius < 0 || this.y + this.radius > canvasHeight) {
      this.vy *= -1;
      this.y = Math.max(this.radius, Math.min(canvasHeight - this.radius, this.y));
    }
  }
}

const ball = new Ball(20, 10, 3, 2, 5);
const loop = new GameLoop(60);

console.log("  弹跳球动画帧:");
loop.start((dt, frame) => {
  ball.update(dt, 100, 50);
  console.log(`    帧 ${frame}: x=${Math.round(ball.x)}, y=${Math.round(ball.y)}`);
}, 8);

// ========== 2. 粒子系统 ==========
setTimeout(() => {
  console.log("2. 粒子系统\n");

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 4;
      this.vy = (Math.random() - 0.5) * 4;
      this.life = 1.0;
      this.decay = 0.02 + Math.random() * 0.03;
      this.size = 2 + Math.random() * 3;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.05; // 重力
      this.life -= this.decay;
    }

    get alive() { return this.life > 0; }
  }

  class ParticleSystem {
    constructor() {
      this.particles = [];
    }

    emit(x, y, count = 10) {
      for (let i = 0; i < count; i++) {
        this.particles.push(new Particle(x, y));
      }
    }

    update() {
      this.particles.forEach((p) => p.update());
      this.particles = this.particles.filter((p) => p.alive);
    }

    get count() { return this.particles.length; }
  }

  const ps = new ParticleSystem();
  ps.emit(50, 50, 20);
  console.log(`  发射粒子: ${ps.count} 个`);

  for (let i = 0; i < 10; i++) {
    ps.update();
  }
  console.log(`  10 帧后剩余: ${ps.count} 个`);

  for (let i = 0; i < 30; i++) {
    ps.update();
  }
  console.log(`  40 帧后剩余: ${ps.count} 个 (自动消亡)\n`);

  // ========== 3. 缓动函数 ==========
  console.log("3. 缓动函数 (Easing)\n");

  const easings = {
    linear: (t) => t,
    easeInQuad: (t) => t * t,
    easeOutQuad: (t) => t * (2 - t),
    easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: (t) => t * t * t,
    easeOutCubic: (t) => (--t) * t * t + 1,
    easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    easeOutElastic: (t) => t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1,
    easeOutBounce: (t) => {
      if (t < 1 / 2.75) return 7.5625 * t * t;
      if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
      if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    },
  };

  const steps = 10;
  Object.entries(easings).slice(0, 5).forEach(([name, fn]) => {
    const values = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      values.push(fn(t).toFixed(2));
    }
    const bar = values.map((v) => {
      const height = Math.round(parseFloat(v) * 5);
      return "▁▂▃▄▅▆▇█"[Math.min(height, 7)] || "▁";
    }).join("");
    console.log(`  ${name.padEnd(16)} ${bar}`);
  });

  // ========== 4. 精灵动画 ==========
  console.log("\n4. 精灵动画 (SpriteSheet)\n");

  class SpriteAnimation {
    constructor(frames, fps) {
      this.frames = frames;
      this.fps = fps;
      this.currentFrame = 0;
      this.elapsed = 0;
    }

    update(dt) {
      this.elapsed += dt;
      if (this.elapsed >= 1 / this.fps) {
        this.currentFrame = (this.currentFrame + 1) % this.frames.length;
        this.elapsed = 0;
      }
    }

    get frame() { return this.frames[this.currentFrame]; }
  }

  const walkAnim = new SpriteAnimation(["🚶", "🚶‍♂️", "🏃", "🏃‍♂️"], 4);
  const display = [];
  for (let i = 0; i < 8; i++) {
    display.push(walkAnim.frame);
    walkAnim.update(0.25);
  }
  console.log(`  行走动画: ${display.join(" → ")}\n`);

  console.log("=== Canvas 动画完成 ===");
}, 200);
