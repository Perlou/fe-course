// 3D 数学基础详解
// 运行: node 05-3d-math.js

console.log("=== 3D 数学基础 ===\n");

// ========== 1. 向量运算 ==========
console.log("1. 向量运算 (Vector3)\n");

class Vec3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x; this.y = y; this.z = z;
  }

  add(v) { return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z); }
  sub(v) { return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z); }
  scale(s) { return new Vec3(this.x * s, this.y * s, this.z * s); }

  dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z; }

  cross(v) {
    return new Vec3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  length() { return Math.sqrt(this.dot(this)); }

  normalize() {
    const len = this.length();
    return len > 0 ? this.scale(1 / len) : new Vec3();
  }

  lerp(v, t) {
    return new Vec3(
      this.x + (v.x - this.x) * t,
      this.y + (v.y - this.y) * t,
      this.z + (v.z - this.z) * t
    );
  }

  angleTo(v) {
    const d = this.dot(v) / (this.length() * v.length());
    return Math.acos(Math.max(-1, Math.min(1, d)));
  }

  toString() { return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)})`; }
}

const a = new Vec3(1, 2, 3);
const b = new Vec3(4, 5, 6);

console.log(`  a = ${a}`);
console.log(`  b = ${b}`);
console.log(`  a + b = ${a.add(b)}`);
console.log(`  a - b = ${a.sub(b)}`);
console.log(`  a · b = ${a.dot(b)} (点积)`);
console.log(`  a × b = ${a.cross(b)} (叉积)`);
console.log(`  |a| = ${a.length().toFixed(3)} (长度)`);
console.log(`  normalize(a) = ${a.normalize()}`);
console.log(`  lerp(a, b, 0.5) = ${a.lerp(b, 0.5)}`);
console.log(`  angle(a, b) = ${(a.angleTo(b) * 180 / Math.PI).toFixed(1)}°`);

// ========== 2. 矩阵运算 ==========
console.log("\n2. 变换矩阵 (4x4)\n");

class Mat4 {
  constructor() {
    // 单位矩阵 (列主序)
    this.elements = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ];
  }

  static identity() { return new Mat4(); }

  static translation(x, y, z) {
    const m = new Mat4();
    m.elements[12] = x;
    m.elements[13] = y;
    m.elements[14] = z;
    return m;
  }

  static scaling(sx, sy, sz) {
    const m = new Mat4();
    m.elements[0] = sx;
    m.elements[5] = sy;
    m.elements[10] = sz;
    return m;
  }

  static rotationY(angle) {
    const m = new Mat4();
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    m.elements[0] = c;
    m.elements[2] = s;
    m.elements[8] = -s;
    m.elements[10] = c;
    return m;
  }

  // 矩阵 * 向量
  transformPoint(v) {
    const e = this.elements;
    return new Vec3(
      e[0] * v.x + e[4] * v.y + e[8] * v.z + e[12],
      e[1] * v.x + e[5] * v.y + e[9] * v.z + e[13],
      e[2] * v.x + e[6] * v.y + e[10] * v.z + e[14]
    );
  }

  toString() {
    const e = this.elements;
    const rows = [];
    for (let r = 0; r < 4; r++) {
      rows.push(`  │ ${[e[r], e[r + 4], e[r + 8], e[r + 12]].map(v => v.toFixed(2).padStart(6)).join(" ")} │`);
    }
    return rows.join("\n");
  }
}

const point = new Vec3(1, 0, 0);
console.log(`  原始点: ${point}`);

const translated = Mat4.translation(3, 2, 0).transformPoint(point);
console.log(`  平移(3,2,0): ${translated}`);

const rotated = Mat4.rotationY(Math.PI / 2).transformPoint(point);
console.log(`  旋转Y(90°): ${rotated}`);

const scaled = Mat4.scaling(2, 2, 2).transformPoint(point);
console.log(`  缩放(2,2,2): ${scaled}`);

// ========== 3. 投影 ==========
console.log("\n3. 投影矩阵\n");
console.log(`
  透视投影 (PerspectiveCamera):
  ┌──────────────────────────────────────┐
  │  近大远小，符合人眼视觉              │
  │                                      │
  │  参数:                                │
  │  fov     — 视野角度 (通常 45-75°)    │
  │  aspect  — 宽高比 (canvas.w / h)     │
  │  near    — 近裁剪面 (0.1)            │
  │  far     — 远裁剪面 (1000)           │
  │                                      │
  │  ⚠️ near 不要设太小 (z-fighting)     │
  └──────────────────────────────────────┘

  正交投影 (OrthographicCamera):
  ┌──────────────────────────────────────┐
  │  无透视变形，平行线保持平行           │
  │  适合: 2D 游戏、CAD、UI 叠加         │
  │                                      │
  │  参数: left, right, top, bottom      │
  └──────────────────────────────────────┘
`);

// ========== 4. 四元数 ==========
console.log("4. 四元数 (Quaternion)\n");

class Quaternion {
  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x; this.y = y; this.z = z; this.w = w;
  }

  static fromAxisAngle(axis, angle) {
    const halfAngle = angle / 2;
    const s = Math.sin(halfAngle);
    return new Quaternion(axis.x * s, axis.y * s, axis.z * s, Math.cos(halfAngle));
  }

  // 球面线性插值
  static slerp(q1, q2, t) {
    let dot = q1.x * q2.x + q1.y * q2.y + q1.z * q2.z + q1.w * q2.w;
    if (dot < 0) { dot = -dot; q2 = new Quaternion(-q2.x, -q2.y, -q2.z, -q2.w); }

    if (dot > 0.9999) {
      // 接近相同, 线性插值
      return new Quaternion(
        q1.x + (q2.x - q1.x) * t, q1.y + (q2.y - q1.y) * t,
        q1.z + (q2.z - q1.z) * t, q1.w + (q2.w - q1.w) * t
      );
    }

    const theta = Math.acos(dot);
    const sinTheta = Math.sin(theta);
    const w1 = Math.sin((1 - t) * theta) / sinTheta;
    const w2 = Math.sin(t * theta) / sinTheta;

    return new Quaternion(
      q1.x * w1 + q2.x * w2, q1.y * w1 + q2.y * w2,
      q1.z * w1 + q2.z * w2, q1.w * w1 + q2.w * w2
    );
  }

  toString() { return `(${this.x.toFixed(3)}, ${this.y.toFixed(3)}, ${this.z.toFixed(3)}, ${this.w.toFixed(3)})`; }
}

const yAxis = new Vec3(0, 1, 0).normalize();
const q1 = Quaternion.fromAxisAngle(yAxis, 0);
const q2 = Quaternion.fromAxisAngle(yAxis, Math.PI / 2);

console.log(`  q1 (0°):   ${q1}`);
console.log(`  q2 (90°):  ${q2}`);
console.log(`  slerp 0.5: ${Quaternion.slerp(q1, q2, 0.5)} (45°)`);
console.log(`
  四元数 vs 欧拉角:
  • 四元数: 无万向锁, 平滑插值 (slerp)
  • 欧拉角: 直观, 但有万向锁问题
  • Three.js: mesh.quaternion / mesh.rotation (互相转换)
`);

console.log("=== 3D 数学基础完成 ===");
