# 🎮 3D 产品展示实战

## 项目概述

使用 Three.js 构建一个可交互的 3D 产品查看器，支持 360° 旋转预览、材质切换和动画效果。

## 技术栈

```
渲染: Three.js + WebGLRenderer
控制: OrbitControls
加载: GLTFLoader (3D 模型)
动画: GSAP + requestAnimationFrame
UI:   HTML/CSS 覆盖层
```

## 功能需求

### 核心功能

1. **3D 模型加载** — 加载 GLTF/GLB 模型
2. **360° 旋转** — OrbitControls 鼠标交互
3. **材质切换** — 点击按钮切换颜色/材质
4. **入场动画** — 模型从远到近 + 旋转入场
5. **响应式** — 自适应窗口大小

### 进阶功能

1. 环境贴图反射
2. 阴影效果
3. 后处理效果 (Bloom)
4. 标注点 (Annotation)

## 实现步骤

### Step 1: 场景搭建

1. Scene + Camera + Renderer
2. OrbitControls
3. 光照 (Ambient + Directional)
4. 地面 + 阴影

### Step 2: 模型加载

1. GLTFLoader 加载模型
2. 模型居中与缩放
3. 材质配置

### Step 3: 交互动画

1. Raycaster 点击交互
2. GSAP 入场动画
3. 材质切换 UI

## 学习要点

- [ ] Three.js 基础设置
- [ ] 相机与光照
- [ ] 模型加载与材质
- [ ] Raycaster 交互
- [ ] 动画系统
- [ ] 3D 数学 (向量/矩阵)
