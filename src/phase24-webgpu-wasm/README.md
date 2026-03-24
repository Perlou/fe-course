# Phase 24: WebGPU 与 WebAssembly

> **目标**：探索前端高性能计算  
> **预计时长**：2 周

---

## 📚 本阶段内容

### 学习目标

1. 了解 WebGPU API 与渲染管线
2. 掌握 WGSL 着色器语言基础
3. 理解 WebAssembly 原理与加载机制
4. 了解 Rust/C++ 编译到 WASM 的流程
5. 掌握 JS ↔ WASM 数据交互与性能优化

### 知识要点

- WebGPU API（适配器/设备/管线/命令编码器）
- WGSL 着色器语言（顶点/片元/计算）
- 计算着色器（GPU 通用计算）
- WebAssembly 二进制格式与内存模型
- wasm-bindgen / Emscripten 工具链
- JS ↔ WASM 数据传递（共享内存 / TypedArray）
- 性能对比与适用场景

### 实战项目

**高性能图像处理器**：WASM + Canvas 实现实时滤镜

---

## 📂 目录结构

```
phase24-webgpu-wasm/
├── CONCEPT.md
├── README.md
├── examples/
│   ├── 01-webgpu-bindbs.js          # WebGPU 基础
│   ├── 02-wasm-bindbs.js            # WebAssembly 基础
│   ├── 03-wasm-bindmemory.js        # WASM 内存模型
│   ├── 04-bindcompute-bindshader.js # GPU 计算着色器
│   └── 05-bindperf-bindcomparison.js # 性能对比
└── exercises/
    └── bindwasm-bindimage/           # 图像处理实战
        └── README.md
```

---

## 🎯 核心概念速览

### WebGPU vs WebGL

```
┌─────────────┬──────────────────┬──────────────────┐
│             │     WebGL        │     WebGPU       │
├─────────────┼──────────────────┼──────────────────┤
│ API 风格    │ 有状态 (全局状态)│ 无状态 (管线对象)│
│ 着色器语言  │ GLSL             │ WGSL             │
│ 计算着色器  │ ❌               │ ✅               │
│ 多线程      │ ❌               │ ✅ (命令编码)    │
│ 性能        │ 好               │ 更好             │
│ 底层 API    │ OpenGL ES        │ Vulkan/Metal/D3D │
│ 兼容性      │ 广泛             │ 新兴 (Chrome)    │
└─────────────┴──────────────────┴──────────────────┘
```

### WASM 适用场景

```
✅ 适合 WASM:              ❌ 不适合:
├── 计算密集型             ├── DOM 操作
├── 游戏引擎               ├── 简单 UI 交互
├── 音视频编解码            ├── 小型计算
├── 图像处理               ├── 网络 IO
├── 物理模拟               └── 常规业务逻辑
├── 加密算法
└── CAD / 科学计算
```

---

> 完成本阶段后，你将了解前端高性能计算的前沿技术。
