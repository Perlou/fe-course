# 性能优化深入解析

## 📌 一、性能指标

### 1. Core Web Vitals

```
┌─────────────────────────────────────────────────────────────┐
│                    Core Web Vitals                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LCP (Largest Contentful Paint)                             │
│  • 最大内容绘制时间                                          │
│  • 优秀: < 2.5s, 需改进: 2.5-4s, 差: > 4s                   │
│  • 优化: 预加载资源、优化图片、SSR                           │
│                                                             │
│  FID (First Input Delay)                                    │
│  • 首次输入延迟                                              │
│  • 优秀: < 100ms, 需改进: 100-300ms, 差: > 300ms            │
│  • 优化: 代码分割、减少 JS 执行、Web Worker                  │
│                                                             │
│  CLS (Cumulative Layout Shift)                              │
│  • 累积布局偏移                                              │
│  • 优秀: < 0.1, 需改进: 0.1-0.25, 差: > 0.25                │
│  • 优化: 预留尺寸、字体 display:swap                         │
│                                                             │
│  INP (Interaction to Next Paint)                            │
│  • 交互到下一次绘制                                          │
│  • 优秀: < 200ms, 需改进: 200-500ms, 差: > 500ms            │
│  • 优化: 长任务拆分、yield to main thread                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. 其他指标

```
TTFB (Time to First Byte)    — 首字节时间
FCP (First Contentful Paint) — 首次内容绘制
TTI (Time to Interactive)    — 可交互时间
TBT (Total Blocking Time)    — 总阻塞时间
Speed Index                   — 速度指数
```

---

## 📌 二、加载性能优化

### 1. 资源加载策略

```html
<!-- 预加载关键资源 -->
<link rel="preload" href="critical.css" as="style" />
<link rel="preload" href="font.woff2" as="font" crossorigin />

<!-- 预连接 (DNS + TCP + TLS) -->
<link rel="preconnect" href="https://api.example.com" />
<link rel="dns-prefetch" href="https://cdn.example.com" />

<!-- 预获取下一页资源 -->
<link rel="prefetch" href="next-page.js" />

<!-- 图片懒加载 -->
<img loading="lazy" src="image.jpg" alt="" />

<!-- 响应式图片 -->
<picture>
  <source srcset="image.avif" type="image/avif" />
  <source srcset="image.webp" type="image/webp" />
  <img src="image.jpg" alt="" />
</picture>
```

### 2. 代码分割

```javascript
// 路由级别懒加载
const Dashboard = lazy(() => import('./pages/Dashboard'));

// 命名 chunk
const HeavyChart = lazy(() =>
  import(/* webpackChunkName: "chart" */ './components/Chart')
);

// 条件加载
button.addEventListener('click', async () => {
  const { exportPDF } = await import('./utils/pdf');
  exportPDF(data);
});
```

### 3. 缓存策略

```
┌──────────────────────────────────────────────────────────┐
│              HTTP 缓存策略                                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  强缓存 (不请求服务器):                                   │
│  Cache-Control: max-age=31536000, immutable              │
│  → 适合: 带 hash 的静态资源 (app.a1b2c3.js)              │
│                                                          │
│  协商缓存 (请求服务器验证):                               │
│  ETag: "abc123"                                          │
│  Last-Modified: Wed, 01 Jan 2025 00:00:00 GMT            │
│  → 适合: HTML、API 响应                                   │
│                                                          │
│  不缓存:                                                  │
│  Cache-Control: no-store                                 │
│  → 适合: 实时数据                                         │
│                                                          │
│  推荐策略:                                                │
│  • HTML:     no-cache (协商缓存)                          │
│  • JS/CSS:   max-age=1y + 文件名 hash                    │
│  • 图片:     max-age=1y + CDN                             │
│  • API:      no-store 或 短 TTL                           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 4. 压缩

```
文本压缩: Gzip (通用) / Brotli (更小 15-20%)
图片格式: AVIF > WebP > JPEG > PNG
JS 压缩:  Terser (tree-shaking + minify + mangle)
CSS 压缩: cssnano / lightningcss
```

---

## 📌 三、运行时性能优化

### 1. 避免重排重绘

```javascript
// ❌ 多次读写交替 → 强制同步布局
element.style.width = '100px';
const width = element.offsetWidth; // 强制重排!
element.style.height = '100px';

// ✅ 批量读取，批量写入
const width = element.offsetWidth;
const height = element.offsetHeight;
element.style.cssText = 'width: 100px; height: 100px;';

// ✅ 使用 transform 代替位置属性 (走合成层)
element.style.transform = 'translateX(100px)';

// ✅ 使用 requestAnimationFrame
function animate() {
  element.style.transform = `translateX(${x}px)`;
  requestAnimationFrame(animate);
}
```

### 2. 触发重排的属性

```
读取以下属性会触发强制重排:
offsetTop/Left/Width/Height
scrollTop/Left/Width/Height
clientTop/Left/Width/Height
getComputedStyle()
getBoundingClientRect()

不触发重排的属性 (走合成层):
transform, opacity
filter, will-change
```

### 3. 防抖节流

```javascript
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

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

### 4. Web Worker

```javascript
// main.js
const worker = new Worker('heavy-task.js');
worker.postMessage({ data: largeArray });
worker.onmessage = (e) => {
  console.log('结果:', e.data);
};

// heavy-task.js
self.onmessage = (e) => {
  const result = heavyComputation(e.data);
  self.postMessage(result);
};
```

---

## 📌 四、虚拟列表

```
┌──────────────────────────────────────────────────────┐
│              虚拟列表原理                              │
├──────────────────────────────────────────────────────┤
│                                                      │
│  问题: 10000 条数据 = 10000 个 DOM 节点 → 卡顿      │
│                                                      │
│  解决: 只渲染可视区域内的项目                        │
│                                                      │
│  ┌─────────────────────┐                             │
│  │  上方占位 (padding)  │ ← 不渲染                   │
│  ├─────────────────────┤                             │
│  │  可视区域 (渲染)     │ ← 只渲染这些 DOM           │
│  │  Item 15            │                             │
│  │  Item 16            │                             │
│  │  Item 17            │                             │
│  │  ...                │                             │
│  │  Item 25            │                             │
│  ├─────────────────────┤                             │
│  │  下方占位 (padding)  │ ← 不渲染                   │
│  └─────────────────────┘                             │
│                                                      │
│  库: react-window / react-virtuoso / vue-virtual     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 📌 五、内存管理

### 常见内存泄漏

```javascript
// 1. 未清理的事件监听
element.addEventListener('click', handler);
// 忘记 removeEventListener → 泄漏

// 2. 未清理的定时器
const id = setInterval(() => {}, 1000);
// 忘记 clearInterval → 泄漏

// 3. 闭包持有大对象引用
function create() {
  const hugeData = new Array(1000000);
  return () => hugeData.length; // hugeData 无法回收
}

// 4. 脱离 DOM 的引用
const btn = document.getElementById('btn');
document.body.removeChild(btn);
// btn 变量仍持有引用 → 泄漏

// 5. 全局变量
function leak() {
  leaked = 'oops'; // 没有 let/const → 全局变量
}
```

### WeakRef 和 FinalizationRegistry

```javascript
// WeakRef — 弱引用，不阻止垃圾回收
const weakRef = new WeakRef(largeObject);
const obj = weakRef.deref(); // 可能返回 undefined

// FinalizationRegistry — 对象被回收时的回调
const registry = new FinalizationRegistry((value) => {
  console.log(`${value} 被回收了`);
});
registry.register(someObject, 'someObject');
```

---

## 📌 六、性能监控

### Performance API

```javascript
// 页面加载性能
const timing = performance.getEntriesByType('navigation')[0];
console.log('DOM Ready:', timing.domContentLoadedEventEnd);
console.log('Page Load:', timing.loadEventEnd);

// 资源加载
const resources = performance.getEntriesByType('resource');
resources.forEach(r => console.log(r.name, r.duration));

// 自定义标记
performance.mark('start');
// ... 操作
performance.mark('end');
performance.measure('operation', 'start', 'end');

// Web Vitals
import { onLCP, onFID, onCLS, onINP } from 'web-vitals';
onLCP(console.log);
onCLS(console.log);
```

### Lighthouse

```
npx lighthouse https://example.com --output html --output-path report.html
```

---

## 📚 推荐学习资源

| 资源           | 链接                    |
| -------------- | ----------------------- |
| web.dev        | web.dev/performance     |
| Lighthouse     | developer.chrome.com    |
| web-vitals     | github.com/GoogleChrome |

---
