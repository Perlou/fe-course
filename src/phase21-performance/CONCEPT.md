# 性能优化深入解析

## 📌 一、性能指标

### Core Web Vitals

```
┌─────────────────────────────────────────────────────────────┐
│                    Core Web Vitals                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LCP (Largest Contentful Paint)                             │
│  • 最大内容绘制时间                                          │
│  • 优秀: < 2.5s, 需改进: 2.5-4s, 差: > 4s                   │
│                                                             │
│  FID (First Input Delay)                                    │
│  • 首次输入延迟                                              │
│  • 优秀: < 100ms, 需改进: 100-300ms, 差: > 300ms            │
│                                                             │
│  CLS (Cumulative Layout Shift)                              │
│  • 累积布局偏移                                              │
│  • 优秀: < 0.1, 需改进: 0.1-0.25, 差: > 0.25                │
│                                                             │
│  INP (Interaction to Next Paint)                            │
│  • 交互到下一次绘制                                          │
│  • 优秀: < 200ms, 需改进: 200-500ms, 差: > 500ms            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📌 二、加载性能优化

### 1. 资源优化

```html
<!-- 预加载关键资源 -->
<link rel="preload" href="critical.css" as="style" />
<link rel="preload" href="font.woff2" as="font" crossorigin />

<!-- 预连接 -->
<link rel="preconnect" href="https://api.example.com" />
<link rel="dns-prefetch" href="https://cdn.example.com" />

<!-- 预获取 -->
<link rel="prefetch" href="next-page.js" />

<!-- 图片懒加载 -->
<img loading="lazy" src="image.jpg" alt="" />

<!-- 响应式图片 -->
<picture>
  <source srcset="image.webp" type="image/webp" />
  <source srcset="image.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="" />
</picture>
```

### 2. 代码分割

```javascript
// 路由级别
const Dashboard = lazy(() => import("./pages/Dashboard"));

// 组件级别
const HeavyChart = lazy(() =>
  import(/* webpackChunkName: "chart" */ "./components/Chart")
);

// 条件加载
button.addEventListener("click", async () => {
  const { exportPDF } = await import("./utils/pdf");
  exportPDF(data);
});
```

### 3. 图片优化

```javascript
// 使用 WebP/AVIF
// 使用 srcset 响应式图片
// 使用 loading="lazy"
// 使用 CDN 图片处理

// Next.js Image
import Image from "next/image";
<Image src="/image.jpg" width={800} height={600} placeholder="blur" />;
```

---

## 📌 三、渲染性能优化

### 1. 避免重排重绘

```javascript
// ❌ 多次读写交替
element.style.width = "100px";
const width = element.offsetWidth; // 强制重排
element.style.height = "100px";

// ✅ 批量读取，批量写入
const width = element.offsetWidth;
const height = element.offsetHeight;
element.style.cssText = "width: 100px; height: 100px;";

// ✅ 使用 transform 代替位置属性
element.style.transform = "translateX(100px)";

// ✅ 使用 requestAnimationFrame
function animate() {
  element.style.transform = `translateX(${x}px)`;
  requestAnimationFrame(animate);
}
```

### 2. 虚拟列表

```javascript
// 只渲染可见区域的元素
// 使用 react-window / vue-virtual-scroller

import { FixedSizeList } from "react-window";

<FixedSizeList height={400} itemCount={10000} itemSize={50}>
  {Row}
</FixedSizeList>;
```

### 3. 防抖节流

```javascript
// 防抖: 延迟执行，连续触发只执行最后一次
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// 节流: 固定频率执行
function throttle(fn, delay) {
  let lastTime = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn(...args);
      lastTime = now;
    }
  };
}
```

---

## 📌 四、性能监控

### Performance API

```javascript
// 页面加载性能
const timing = performance.getEntriesByType("navigation")[0];
console.log("DOM Ready:", timing.domContentLoadedEventEnd - timing.startTime);
console.log("Page Load:", timing.loadEventEnd - timing.startTime);

// 资源加载
const resources = performance.getEntriesByType("resource");
resources.forEach((r) => {
  console.log(r.name, r.duration);
});

// 自定义标记
performance.mark("start");
// ... 操作
performance.mark("end");
performance.measure("operation", "start", "end");

// Web Vitals
import { onLCP, onFID, onCLS } from "web-vitals";

onLCP(console.log);
onFID(console.log);
onCLS(console.log);
```

---

## 📚 推荐学习资源

| 资源       | 链接                                       |
| ---------- | ------------------------------------------ |
| web.dev    | web.dev/performance                        |
| Lighthouse | developers.google.com/web/tools/lighthouse |

---
