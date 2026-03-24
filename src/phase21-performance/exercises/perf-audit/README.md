# 🚀 性能优化实战

## 项目概述

对一个性能较差的页面进行全面分析与优化，覆盖加载性能和运行时性能。

## 优化目标

```
Core Web Vitals:
  LCP  < 2.5s
  FID  < 100ms
  CLS  < 0.1
  INP  < 200ms

加载:
  JS 总大小 < 300KB (gzip)
  首屏加载 < 3s
  请求数   < 30

运行时:
  60fps 无掉帧
  内存无泄漏
```

## 优化检查清单

### 加载性能

- [ ] 代码分割 (路由级 + 组件级)
- [ ] Tree Shaking (移除未使用代码)
- [ ] 图片优化 (WebP/AVIF + 懒加载)
- [ ] 字体优化 (display:swap + preload)
- [ ] HTTP 缓存策略
- [ ] CDN 加速
- [ ] Gzip / Brotli 压缩

### 运行时性能

- [ ] 避免强制同步布局
- [ ] 使用 transform 代替 top/left
- [ ] 大列表使用虚拟滚动
- [ ] 搜索框使用防抖
- [ ] 滚动/拖拽使用节流
- [ ] 长任务拆分 (yield to main)
- [ ] 使用 Web Worker 处理计算

### 内存管理

- [ ] 清理事件监听
- [ ] 清理定时器
- [ ] 取消未完成请求
- [ ] 使用 WeakMap/WeakRef

## 工具

```
分析: Chrome DevTools Performance / Lighthouse
监控: web-vitals / PerformanceObserver
构建: webpack-bundle-analyzer / source-map-explorer
```
