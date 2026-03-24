// 3D 动画与交互详解
// 运行: node 04-animation-interaction.js

console.log("=== 3D 动画与交互 ===\n");

// ========== 1. 动画系统 ==========
console.log("1. 动画系统\n");

class AnimationMixer {
  constructor() {
    this.animations = [];
    this.time = 0;
  }

  addAnimation(name, keyframes) {
    this.animations.push({ name, keyframes, currentKey: 0 });
    return this;
  }

  // 线性插值
  lerp(a, b, t) {
    if (typeof a === "number") return a + (b - a) * t;
    return { x: this.lerp(a.x, b.x, t), y: this.lerp(a.y, b.y, t), z: this.lerp(a.z, b.z, t) };
  }

  update(deltaTime) {
    this.time += deltaTime;
    const results = {};

    this.animations.forEach((anim) => {
      const { keyframes } = anim;
      const totalDuration = keyframes[keyframes.length - 1].time;
      const loopedTime = this.time % totalDuration;

      // 找到当前关键帧
      let k0 = 0, k1 = 1;
      for (let i = 0; i < keyframes.length - 1; i++) {
        if (loopedTime >= keyframes[i].time && loopedTime < keyframes[i + 1].time) {
          k0 = i; k1 = i + 1;
          break;
        }
      }

      const t = (loopedTime - keyframes[k0].time) / (keyframes[k1].time - keyframes[k0].time);
      results[anim.name] = this.lerp(keyframes[k0].value, keyframes[k1].value, t);
    });

    return results;
  }
}

const mixer = new AnimationMixer();

mixer.addAnimation("position", [
  { time: 0, value: { x: 0, y: 0, z: 0 } },
  { time: 1, value: { x: 5, y: 3, z: 0 } },
  { time: 2, value: { x: 0, y: 0, z: 0 } },
]);

mixer.addAnimation("rotation", [
  { time: 0, value: 0 },
  { time: 2, value: Math.PI * 2 },
]);

// 模拟几帧
for (let i = 0; i <= 4; i++) {
  const t = i * 0.5;
  mixer.time = 0;
  const state = mixer.update(t);
  const pos = state.position;
  console.log(`  t=${t.toFixed(1)}s: pos=(${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}) rot=${state.rotation.toFixed(2)}rad`);
}

// ========== 2. Raycaster 交互 ==========
console.log("\n2. Raycaster 射线检测\n");

class Raycaster {
  constructor() {
    this.origin = { x: 0, y: 0, z: 0 };
    this.direction = { x: 0, y: 0, z: -1 };
  }

  setFromCamera(mouseNDC, cameraPos) {
    this.origin = { ...cameraPos };
    // 简化: 从相机位置向鼠标 NDC 方向发射
    this.direction = {
      x: mouseNDC.x,
      y: mouseNDC.y,
      z: -1,
    };
  }

  // 射线与球体相交检测
  intersectSphere(center, radius) {
    const dx = this.origin.x - center.x;
    const dy = this.origin.y - center.y;
    const dz = this.origin.z - center.z;

    const a = this.direction.x ** 2 + this.direction.y ** 2 + this.direction.z ** 2;
    const b = 2 * (dx * this.direction.x + dy * this.direction.y + dz * this.direction.z);
    const c = dx ** 2 + dy ** 2 + dz ** 2 - radius ** 2;
    const disc = b * b - 4 * a * c;

    return disc >= 0;
  }

  // 射线与 AABB 相交
  intersectBox(min, max) {
    let tmin = -Infinity, tmax = Infinity;

    for (const axis of ["x", "y", "z"]) {
      const invD = 1 / this.direction[axis];
      let t0 = (min[axis] - this.origin[axis]) * invD;
      let t1 = (max[axis] - this.origin[axis]) * invD;
      if (invD < 0) [t0, t1] = [t1, t0];
      tmin = Math.max(tmin, t0);
      tmax = Math.min(tmax, t1);
    }

    return tmax >= Math.max(tmin, 0);
  }
}

const ray = new Raycaster();
ray.origin = { x: 0, y: 0, z: 10 };
ray.direction = { x: 0, y: 0, z: -1 };

console.log(`  射线: 原点 (0,0,10) 方向 (0,0,-1)`);
console.log(`  球体 (0,0,0) r=2: ${ray.intersectSphere({ x: 0, y: 0, z: 0 }, 2) ? "✅ 命中" : "❌ 未命中"}`);
console.log(`  球体 (5,0,0) r=1: ${ray.intersectSphere({ x: 5, y: 0, z: 0 }, 1) ? "✅ 命中" : "❌ 未命中"}`);
console.log(`  盒子 (-1,-1,-1)~(1,1,1): ${ray.intersectBox({ x: -1, y: -1, z: -1 }, { x: 1, y: 1, z: 1 }) ? "✅ 命中" : "❌ 未命中"}`);
console.log(`  盒子 (3,3,3)~(5,5,5): ${ray.intersectBox({ x: 3, y: 3, z: 3 }, { x: 5, y: 5, z: 5 }) ? "✅ 命中" : "❌ 未命中"}`);

// ========== 3. OrbitControls 原理 ==========
console.log("\n3. OrbitControls 原理\n");
console.log(`
  轨道控制器: 围绕目标点旋转相机

  球坐标系:
  ┌──────────────────────────────────────────┐
  │  x = r * sin(φ) * cos(θ)                │
  │  y = r * cos(φ)                          │
  │  z = r * sin(φ) * sin(θ)                │
  │                                          │
  │  r: 到目标点的距离 (缩放控制)            │
  │  θ: 水平角 (鼠标左右拖拽)               │
  │  φ: 垂直角 (鼠标上下拖拽)               │
  │                                          │
  │  操作:                                    │
  │  Left drag   → 旋转 (θ, φ)              │
  │  Right drag  → 平移 (target)             │
  │  Scroll      → 缩放 (r)                 │
  │  enableDamping → 惯性效果                │
  └──────────────────────────────────────────┘
`);

// ========== 4. GSAP 3D 动画 ==========
console.log("4. GSAP + Three.js 动画\n");
console.log(`
  import gsap from 'gsap';

  // 位置动画
  gsap.to(mesh.position, {
    x: 5, y: 2,
    duration: 2,
    ease: 'power2.inOut',
    yoyo: true,
    repeat: -1,
  });

  // 旋转动画
  gsap.to(mesh.rotation, {
    y: Math.PI * 2,
    duration: 4,
    ease: 'none',
    repeat: -1,
  });

  // 材质动画
  gsap.to(mesh.material.color, {
    r: 1, g: 0, b: 0,
    duration: 1,
  });

  // 时间线
  const tl = gsap.timeline({ repeat: -1 });
  tl.to(mesh.position, { y: 3, duration: 1 })
    .to(mesh.rotation, { z: Math.PI, duration: 0.5 })
    .to(mesh.position, { y: 0, duration: 1 });
`);

console.log("=== 3D 动画与交互完成 ===");
