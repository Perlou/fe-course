# Phase 24: WebGPU 与 WebAssembly

> **目标**：探索前端高性能计算  
> **预计时长**：2 周

## 📚 学习目标

1. 了解 WebGPU 基础
2. 理解 WebAssembly 原理
3. 掌握 Rust/C++ 编译到 WASM
4. 了解应用场景

## 知识要点

- WebGPU API 基础
- 计算着色器
- WebAssembly 基础
- Rust/Emscripten 编译
- 性能对比与优化

## 核心概念

```javascript
// WebGPU
const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();

// WebAssembly
const { instance } = await WebAssembly.instantiateStreaming(
  fetch("module.wasm")
);
const result = instance.exports.add(1, 2);
```

---

> 完成本阶段后，你将了解前端高性能计算的前沿技术。
