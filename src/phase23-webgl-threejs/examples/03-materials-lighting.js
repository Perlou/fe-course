// 材质与光照详解
// 运行: node 03-materials-lighting.js

console.log("=== 材质与光照 ===\n");

// ========== 1. 光照模型 ==========
console.log("1. 光照模型 (Lighting Models)\n");

class LightingModel {
  // 环境光
  static ambient(lightColor, intensity) {
    return lightColor.map((c) => c * intensity);
  }

  // 漫反射 (Lambert)
  static diffuse(lightDir, normal, lightColor, intensity) {
    const dot = Math.max(0, this.dot3(lightDir, normal));
    return lightColor.map((c) => c * dot * intensity);
  }

  // 镜面反射 (Phong)
  static specular(lightDir, normal, viewDir, shininess, lightColor) {
    const reflect = this.reflect(this.negate(lightDir), normal);
    const dot = Math.max(0, this.dot3(reflect, viewDir));
    const spec = Math.pow(dot, shininess);
    return lightColor.map((c) => c * spec);
  }

  // 辅助函数
  static dot3(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  static negate(v) { return v.map((c) => -c); }
  static normalize(v) {
    const len = Math.sqrt(v.reduce((s, c) => s + c * c, 0));
    return v.map((c) => c / len);
  }
  static reflect(incident, normal) {
    const d = 2 * this.dot3(incident, normal);
    return incident.map((c, i) => c - d * normal[i]);
  }
  static add(a, b) { return a.map((c, i) => Math.min(1, c + (b[i] || 0))); }
}

// 计算一个点的光照
const lightDir = LightingModel.normalize([1, 1, 1]);
const normal = [0, 1, 0];   // 朝上
const viewDir = LightingModel.normalize([0, 1, 1]);
const lightColor = [1, 1, 1];  // 白光
const objectColor = [0.2, 0.6, 1.0]; // 蓝色

const ambient = LightingModel.ambient(objectColor, 0.2);
const diffuse = LightingModel.diffuse(lightDir, normal, objectColor, 0.8);
const specular = LightingModel.specular(lightDir, normal, viewDir, 32, lightColor);
const final = LightingModel.add(LightingModel.add(ambient, diffuse), specular);

console.log(`  光照方向:  [${lightDir.map(v => v.toFixed(2))}]`);
console.log(`  法线方向:  [${normal}]`);
console.log(`  物体颜色:  [${objectColor}]`);
console.log(`  环境光:    [${ambient.map(v => v.toFixed(3))}]`);
console.log(`  漫反射:    [${diffuse.map(v => v.toFixed(3))}]`);
console.log(`  镜面反射:  [${specular.map(v => v.toFixed(3))}]`);
console.log(`  最终颜色:  [${final.map(v => v.toFixed(3))}]`);

// ========== 2. PBR 材质参数 ==========
console.log("\n2. PBR 材质参数\n");

const materials = [
  { name: "金属", roughness: 0.1, metalness: 1.0, color: "#C0C0C0" },
  { name: "塑料", roughness: 0.4, metalness: 0.0, color: "#FF4444" },
  { name: "木材", roughness: 0.8, metalness: 0.0, color: "#8B6914" },
  { name: "玻璃", roughness: 0.0, metalness: 0.0, color: "#FFFFFF" },
  { name: "橡胶", roughness: 1.0, metalness: 0.0, color: "#222222" },
];

console.log("  PBR 材质参数 (MeshStandardMaterial):");
console.log("  ┌────────┬───────────┬───────────┬────────┐");
console.log("  │ 名称   │ roughness │ metalness │ 颜色   │");
console.log("  ├────────┼───────────┼───────────┼────────┤");
materials.forEach((m) => {
  console.log(`  │ ${m.name.padEnd(6)} │ ${m.roughness.toFixed(1).padStart(9)} │ ${m.metalness.toFixed(1).padStart(9)} │ ${m.color} │`);
});
console.log("  └────────┴───────────┴───────────┴────────┘");

// ========== 3. 光源类型 ==========
console.log("\n3. 光源类型\n");
console.log(`
  ┌──────────────────┬──────────────────────────────────┐
  │ 光源类型          │ 说明                             │
  ├──────────────────┼──────────────────────────────────┤
  │ AmbientLight     │ 环境光: 均匀照亮所有物体         │
  │                  │ 无方向、无阴影                    │
  ├──────────────────┼──────────────────────────────────┤
  │ DirectionalLight │ 平行光: 模拟太阳光               │
  │                  │ 有方向、可投射阴影               │
  ├──────────────────┼──────────────────────────────────┤
  │ PointLight       │ 点光源: 模拟灯泡                 │
  │                  │ 向所有方向发光、有衰减            │
  ├──────────────────┼──────────────────────────────────┤
  │ SpotLight        │ 聚光灯: 圆锥形光束               │
  │                  │ 有方向、角度、衰减               │
  ├──────────────────┼──────────────────────────────────┤
  │ HemisphereLight  │ 半球光: 天空光 + 地面光          │
  │                  │ 模拟户外环境                     │
  ├──────────────────┼──────────────────────────────────┤
  │ RectAreaLight    │ 矩形面光: 模拟窗户/显示器        │
  │                  │ 仅 MeshStandardMaterial          │
  └──────────────────┴──────────────────────────────────┘
`);

// ========== 4. 纹理 ==========
console.log("4. 纹理类型\n");
console.log(`
  纹理贴图类型:
  ┌────────────────┬────────────────────────────────┐
  │ map            │ 颜色贴图 (漫反射)                │
  │ normalMap      │ 法线贴图 (表面细节)              │
  │ roughnessMap   │ 粗糙度贴图                      │
  │ metalnessMap   │ 金属度贴图                      │
  │ aoMap          │ 环境遮蔽贴图                    │
  │ bumpMap        │ 凹凸贴图                        │
  │ emissiveMap    │ 自发光贴图                      │
  │ envMap         │ 环境贴图 (反射)                  │
  │ displacementMap│ 置换贴图 (改变几何体)            │
  └────────────────┴────────────────────────────────┘

  加载:
  const loader = new THREE.TextureLoader();
  const texture = loader.load('texture.jpg');
  const material = new THREE.MeshStandardMaterial({ map: texture });
`);

console.log("=== 材质与光照完成 ===");
