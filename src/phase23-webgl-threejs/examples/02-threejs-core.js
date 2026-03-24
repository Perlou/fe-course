// Three.js 核心概念详解
// 运行: node 02-threejs-core.js (模拟场景图)

console.log("=== Three.js 核心概念 ===\n");

// ========== 1. 模拟 Three.js 场景图 ==========
console.log("1. 模拟场景图 (Scene Graph)\n");

class Object3D {
  constructor(type, name) {
    this.type = type;
    this.name = name || type;
    this.position = { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scale = { x: 1, y: 1, z: 1 };
    this.children = [];
    this.parent = null;
    this.visible = true;
  }

  add(child) {
    child.parent = this;
    this.children.push(child);
    return this;
  }

  remove(child) {
    const idx = this.children.indexOf(child);
    if (idx > -1) {
      this.children.splice(idx, 1);
      child.parent = null;
    }
    return this;
  }

  traverse(callback, depth = 0) {
    callback(this, depth);
    this.children.forEach((child) => child.traverse(callback, depth + 1));
  }

  setPosition(x, y, z) {
    this.position = { x, y, z };
    return this;
  }
}

class Scene extends Object3D {
  constructor() {
    super("Scene", "scene");
    this.background = "#222222";
  }
}

class Mesh extends Object3D {
  constructor(geometry, material) {
    super("Mesh");
    this.geometry = geometry;
    this.material = material;
    this.name = geometry.type;
  }
}

class Light extends Object3D {
  constructor(type, color, intensity) {
    super("Light", type);
    this.color = color;
    this.intensity = intensity;
  }
}

class Camera extends Object3D {
  constructor(fov, aspect, near, far) {
    super("Camera", "PerspectiveCamera");
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
  }
}

// 构建场景
const scene = new Scene();

const camera = new Camera(75, 16 / 9, 0.1, 1000);
camera.setPosition(0, 5, 10);

const ambientLight = new Light("AmbientLight", "#ffffff", 0.5);
const dirLight = new Light("DirectionalLight", "#ffffff", 1);
dirLight.setPosition(5, 10, 5);

const cube = new Mesh(
  { type: "BoxGeometry", params: [1, 1, 1] },
  { type: "MeshStandardMaterial", color: "#00ff00", roughness: 0.5 }
);
cube.setPosition(0, 1, 0);

const sphere = new Mesh(
  { type: "SphereGeometry", params: [0.5, 32, 32] },
  { type: "MeshPhongMaterial", color: "#ff0000", shininess: 100 }
);
sphere.setPosition(3, 1, 0);

const floor = new Mesh(
  { type: "PlaneGeometry", params: [10, 10] },
  { type: "MeshStandardMaterial", color: "#808080" }
);
floor.rotation.x = -Math.PI / 2;

// 层级: 组
const group = new Object3D("Group", "ObjectGroup");
group.add(cube).add(sphere);

scene.add(camera);
scene.add(ambientLight);
scene.add(dirLight);
scene.add(group);
scene.add(floor);

// 渲染场景树
console.log("  场景图:");
scene.traverse((obj, depth) => {
  const indent = "  " + "  ".repeat(depth);
  const pos = `(${obj.position.x}, ${obj.position.y}, ${obj.position.z})`;
  let info = obj.name;
  if (obj.geometry) info += ` [${obj.geometry.type}]`;
  if (obj.material) info += ` [${obj.material.type}]`;
  if (obj.intensity !== undefined) info += ` intensity=${obj.intensity}`;
  if (obj.fov) info += ` fov=${obj.fov}°`;
  console.log(`${indent}├── ${info} @ ${pos}`);
});

// ========== 2. 几何体参数 ==========
console.log("\n2. 几何体参数\n");

const geometries = [
  { name: "BoxGeometry", params: "(w, h, d)", vertices: 36, desc: "立方体" },
  { name: "SphereGeometry", params: "(r, wSeg, hSeg)", vertices: "32*32*6", desc: "球体" },
  { name: "CylinderGeometry", params: "(rT, rB, h, seg)", vertices: "32*2+32", desc: "圆柱" },
  { name: "PlaneGeometry", params: "(w, h)", vertices: 6, desc: "平面" },
  { name: "TorusGeometry", params: "(r, tube, rSeg, tSeg)", vertices: "16*100*6", desc: "圆环" },
  { name: "ConeGeometry", params: "(r, h, seg)", vertices: "32+32", desc: "圆锥" },
];

geometries.forEach((g) => {
  console.log(`  ${g.name.padEnd(20)} ${g.params.padEnd(22)} ${g.desc}`);
});

// ========== 3. 材质对比 ==========
console.log("\n3. 材质对比\n");
console.log(`
  ┌──────────────────────┬──────┬──────┬──────┬──────┐
  │ 材质                  │ 光照 │ 反射 │ 性能 │ 真实 │
  ├──────────────────────┼──────┼──────┼──────┼──────┤
  │ MeshBasicMaterial    │  ❌  │  ❌  │ ⭐⭐⭐ │ ⭐   │
  │ MeshLambertMaterial  │  ✅  │  ❌  │ ⭐⭐⭐ │ ⭐⭐  │
  │ MeshPhongMaterial    │  ✅  │ 高光 │ ⭐⭐  │ ⭐⭐  │
  │ MeshStandardMaterial │  ✅  │ PBR  │ ⭐⭐  │ ⭐⭐⭐ │
  │ MeshPhysicalMaterial │  ✅  │ PBR+ │ ⭐   │ ⭐⭐⭐⭐│
  │ ShaderMaterial       │ 自定义│自定义│ 可控 │ 可控 │
  └──────────────────────┴──────┴──────┴──────┴──────┘
`);

console.log("=== Three.js 核心完成 ===");
