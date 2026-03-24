# Phase 23: WebGL 与 Three.js

> **目标**：掌握 3D 图形开发  
> **预计时长**：3 周

---

## 📚 本阶段内容

### 学习目标

1. 理解 WebGL 渲染管线与着色器编程
2. 掌握 Three.js 核心 API（场景/相机/渲染器/几何体/材质/光照）
3. 实现 3D 动画与交互（Raycaster / OrbitControls）
4. 了解 React Three Fiber 声明式 3D 开发
5. 掌握 3D 性能优化策略

### 知识要点

- WebGL 渲染管线（顶点着色器 → 片元着色器）
- Three.js 场景图（Scene → Camera → Renderer）
- 几何体（Box, Sphere, Plane, Custom）
- 材质（Basic, Standard, Physical, Shader）
- 光照（Ambient, Directional, Point, Spot）
- 动画（RAF / GSAP / Tween）
- 交互（Raycaster, OrbitControls）
- React Three Fiber + Drei

### 实战项目

**3D 产品展示**：可交互的 3D 模型查看器

---

## 📂 目录结构

```
phase23-webgl-threejs/
├── CONCEPT.md
├── README.md
├── examples/
│   ├── 01-bindwebgl-bindbs.js         # WebGL 渲染管线
│   ├── 02-bindthreejs-bindcore.js     # Three.js 核心概念
│   ├── 03-bindmaterials-bindlighting.js # 材质与光照
│   ├── 04-bindanimation-bindinteraction.js # 动画与交互
│   └── 05-bind3d-bindmath.js          # 3D 数学基础
└── exercises/
    └── bind3d-bindviewer/              # 3D 产品展示
        └── README.md
```

---

## 🎯 核心概念速览

### 渲染管线

```
顶点数据 → 顶点着色器 → 图元装配 → 光栅化 → 片元着色器 → 帧缓冲
  (坐标)     (变换)       (三角形)   (像素)     (颜色)       (屏幕)
```

### Three.js 架构

```
Scene (场景)
├── Camera (相机)
│   ├── PerspectiveCamera   透视 (近大远小)
│   └── OrthographicCamera  正交 (无透视)
├── Light (光源)
│   ├── AmbientLight       环境光
│   ├── DirectionalLight   平行光 (太阳)
│   └── PointLight         点光源 (灯泡)
├── Mesh (网格 = Geometry + Material)
│   ├── BoxGeometry        立方体
│   ├── SphereGeometry     球体
│   └── MeshStandardMaterial PBR 材质
└── Renderer (渲染器)
    └── WebGLRenderer      GPU 渲染
```

---

> 完成本阶段后，你应该能够开发 3D Web 应用。
