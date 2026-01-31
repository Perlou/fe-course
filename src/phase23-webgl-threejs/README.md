# Phase 23: WebGL 与 Three.js

> **目标**：掌握 3D 图形开发  
> **预计时长**：3 周

## 📚 学习目标

1. 理解 WebGL 基础概念
2. 掌握 Three.js 核心 API
3. 了解着色器编程
4. 实现 3D 交互效果

## 知识要点

- WebGL 基础 (顶点、片元着色器)
- Three.js 场景、相机、渲染器
- 几何体、材质、光照
- 动画与交互
- 性能优化

## 核心概念

```javascript
// Three.js 基础
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  renderer.render(scene, camera);
}
```

---

> 完成本阶段后，你应该能够开发 3D Web 应用。
