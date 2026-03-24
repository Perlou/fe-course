# Phase 21: 性能优化

> **目标**：掌握前端性能优化  
> **预计时长**：2 周

---

## 📚 本阶段内容

### 学习目标

1. 理解性能指标（Core Web Vitals: LCP/FID/CLS/INP）
2. 掌握加载性能优化（资源压缩、懒加载、预加载、代码分割）
3. 掌握运行时性能优化（重排重绘、虚拟列表、防抖节流）
4. 掌握内存管理与泄漏检测
5. 学会性能监控与分析工具（Performance API, Lighthouse）

### 知识要点

- Core Web Vitals（LCP, FID, CLS, INP）
- 资源优化（压缩、CDN、缓存策略）
- 代码优化（Tree Shaking、Code Splitting、动态导入）
- 渲染优化（避免重排重绘、合成层、will-change）
- 虚拟列表与大数据渲染
- 防抖 / 节流 / requestAnimationFrame
- 内存泄漏检测与修复
- Performance API 与 Lighthouse

### 实战项目

**性能优化实战**：对一个低性能页面进行分析与优化

---

## 📂 目录结构

```
phase21-performance/
├── CONCEPT.md
├── README.md
├── examples/
│   ├── 01-performance-metrics.js   # 性能指标与监控
│   ├── 02-loading-optimize.js      # 加载性能优化
│   ├── 03-runtime-optimize.js      # 运行时性能优化
│   ├── 04-memory-management.js     # 内存管理
│   └── 05-virtual-list.js          # 虚拟列表实现
└── exercises/
    └── perf-audit/                 # 性能优化实战
        └── README.md
```

---

## 🎯 核心概念速览

### 性能优化全景

```
加载性能                  运行时性能
├── 资源压缩 (gzip/br)   ├── 避免重排重绘
├── 代码分割             ├── 虚拟列表
├── 懒加载               ├── 防抖节流
├── 预加载/预连接        ├── Web Worker
├── CDN 加速             ├── requestAnimationFrame
└── HTTP 缓存            └── 合成层优化

监控分析
├── Core Web Vitals
├── Performance API
├── Lighthouse
└── Chrome DevTools
```

---

> 完成本阶段后，你应该能够分析和优化前端性能。
