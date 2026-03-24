# 🖼️ 高性能图像处理器实战

## 项目概述

使用 WebAssembly + Canvas 实现一个浏览器内实时图像滤镜处理器，对比 JS 与 WASM 性能。

## 技术栈

```
图像处理: Rust → WebAssembly (wasm-pack)
渲染: Canvas 2D API
UI: HTML/CSS/JS
对比: JS 原生实现 vs WASM 实现
```

## 功能需求

### 滤镜效果

1. **灰度化** — 加权平均法
2. **反色** — RGB 取反
3. **模糊** — 3x3 / 5x5 均值/高斯模糊
4. **锐化** — 卷积核
5. **边缘检测** — Sobel 算子
6. **亮度/对比度** — 系数调节

### 交互

1. 上传图片 → Canvas 显示
2. 选择滤镜 → 实时预览
3. 性能计时 → JS vs WASM 对比
4. 导出结果

## 实现步骤

### Step 1: Rust WASM 模块

```rust
#[wasm_bindgen]
pub fn grayscale(data: &mut [u8]) { ... }
pub fn blur(data: &mut [u8], w: u32, h: u32) { ... }
pub fn edge_detect(data: &mut [u8], w: u32, h: u32) { ... }
```

### Step 2: JS 对照实现

```javascript
function grayscaleJS(imageData) { ... }
function blurJS(imageData) { ... }
```

### Step 3: Canvas UI

1. 图片上传与显示
2. 滤镜切换按钮
3. 性能计时展示

## 学习要点

- [ ] Rust → WASM 编译流程
- [ ] wasm-bindgen 数据传递
- [ ] Canvas getImageData/putImageData
- [ ] 性能测量与对比
- [ ] 卷积核原理
