# 🎨 3D 产品展示

> 使用 Three.js 创建交互式 3D 产品展示应用，深入理解 WebGL 渲染原理

## 📖 项目简介

使用 **Three.js + GSAP + Vite** 实现一个交互式 3D 耳机展示应用，涵盖 3D 渲染的核心概念：

- ✅ **程序化建模** — 几何体组合构建耳机 (Torus/Cylinder/Sphere)
- ✅ **PBR 材质** — 4 种预设 (哑光黑/银色/玫瑰金/午夜蓝) + 平滑过渡
- ✅ **相机控制** — OrbitControls + 阻尼 + 角度限制 + 触摸适配
- ✅ **光照系统** — 5 种光源组合 + PCF 软阴影
- ✅ **爆炸图** — GSAP 驱动零部件分离/组装动画
- ✅ **热点标注** — 3D→屏幕坐标投射 + 脉冲动画 + 详情弹窗
- ✅ **射线检测** — Raycaster hover 高亮 + 点击交互
- ✅ **性能监控** — FPS / Draw Calls / Triangles 实时显示

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
# → http://localhost:3000
```

## 📂 目录结构

```
06-3d-showcase/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.js                  # 入口 (组装 + 动画循环)
│   ├── style.css                # 全局样式
│   ├── scene/                   # 🎬 3D 场景
│   │   ├── Scene.js             # 场景 + 雾效
│   │   ├── Camera.js            # 透视相机 + resize
│   │   ├── Renderer.js          # WebGL 渲染器 + 色调映射
│   │   ├── Controls.js          # OrbitControls 封装
│   │   └── Lights.js            # 多光源 + 阴影 + 地板
│   ├── product/                 # 🎧 产品模型
│   │   ├── ProductBuilder.js    # 程序化耳机构建
│   │   └── MaterialManager.js   # PBR 材质预设 + 切换
│   ├── interactions/            # 🖱️ 交互
│   │   ├── Hotspots.js          # 热点标注系统
│   │   ├── Animator.js          # 爆炸/组装动画
│   │   └── Interaction.js       # Raycaster 交互
│   └── ui/                      # 🎛️ UI 控制
│       └── UI.js                # 浮动控制面板
└── public/
```

## 🔍 核心原理

### 渲染管线

```
设置场景 → 创建几何体 → 应用材质 → 配置光照
    ↓
requestAnimationFrame 循环
    ├── 更新 OrbitControls
    ├── 更新热点坐标 (3D → 2D 投射)
    ├── Raycaster 交互检测
    ├── renderer.render(scene, camera)
    └── 更新 FPS 统计
```

### 爆炸图动画

```
原始状态                    爆炸状态
     ┌──头带──┐                 头带 ↑ 上移
     │  ┃  ┃  │            
   左杆 │  │ 右杆          ← 左杆    右杆 →
     │  ┃  ┃  │
   左耳罩  右耳罩         ← 左耳罩    右耳罩 →

GSAP Timeline 控制各零部件位移
```

## 📚 对照学习

| 本项目 | 生产级实现 |
|---|---|
| `ProductBuilder.js` 几何体组合 | Blender → GLTF 导出 |
| `MaterialManager.js` PBR | Three.js MeshPhysicalMaterial |
| `Hotspots.js` 坐标投射 | CSS2DRenderer |
| `Animator.js` GSAP | React Spring / Framer Motion |
| `Controls.js` OrbitControls | TransformControls / FlyControls |
| `Interaction.js` Raycaster | @react-three/drei |

---

> 💡 这个项目覆盖了 Phase 22 (Canvas/SVG)、Phase 23 (WebGL/Three.js) 和 Phase 24 (WebGPU/WASM) 的核心知识点
