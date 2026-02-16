// 浏览器 Performance API 详解
// 运行环境: 浏览器控制台 或 Node.js (部分 API)
// 在浏览器中打开一个 HTML 页面后，在控制台粘贴运行

console.log("=== Performance API 详解 ===\n");

// ========== 1. performance.now() 高精度计时 ==========
console.log("1. performance.now() 高精度计时");

// performance.now() 返回微秒级精度的时间戳
const start = performance.now();

// 模拟耗时操作
let sum = 0;
for (let i = 0; i < 1000000; i++) {
  sum += Math.sqrt(i);
}

const end = performance.now();
console.log(`  计算耗时: ${(end - start).toFixed(2)} ms`);
console.log(`  计算结果: ${sum.toFixed(0)}`);

// 对比 Date.now()
console.log(`
  performance.now() vs Date.now():
  ┌──────────────────┬──────────────────────────────────┐
  │ performance.now() │ 微秒精度，单调递增，不受系统时钟影响 │
  │ Date.now()        │ 毫秒精度，可能受时钟调整影响        │
  └──────────────────┴──────────────────────────────────┘
`);

// ========== 2. 封装性能测量工具 ==========
console.log("2. 封装性能测量工具");

/**
 * 测量函数执行时间
 * @param {string} label - 标签名
 * @param {Function} fn - 要测量的函数
 * @param {number} iterations - 迭代次数
 */
function benchmark(label, fn, iterations = 1000) {
  // 预热 (让 JIT 编译器优化)
  for (let i = 0; i < 10; i++) fn();

  const times = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    times.push(performance.now() - start);
  }

  times.sort((a, b) => a - b);
  const avg = times.reduce((a, b) => a + b) / times.length;
  const median = times[Math.floor(times.length / 2)];
  const p95 = times[Math.floor(times.length * 0.95)];
  const min = times[0];
  const max = times[times.length - 1];

  console.log(`  [${label}]`);
  console.log(`    平均: ${avg.toFixed(4)} ms`);
  console.log(`    中位: ${median.toFixed(4)} ms`);
  console.log(`    P95:  ${p95.toFixed(4)} ms`);
  console.log(`    最小: ${min.toFixed(4)} ms | 最大: ${max.toFixed(4)} ms`);

  return { avg, median, p95, min, max };
}

// 对比不同数组遍历方式
console.log("\n  数组遍历性能对比 (10000 元素):");
const arr = Array.from({ length: 10000 }, (_, i) => i);

benchmark("for 循环", () => {
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i];
}, 500);

benchmark("for...of", () => {
  let s = 0;
  for (const v of arr) s += v;
}, 500);

benchmark("forEach", () => {
  let s = 0;
  arr.forEach((v) => (s += v));
}, 500);

benchmark("reduce", () => {
  arr.reduce((a, b) => a + b, 0);
}, 500);

// ========== 3. Performance Mark & Measure ==========
console.log("\n3. Performance Mark & Measure");

// 标记 (Mark) - 在时间线上打点
performance.mark("task-start");

// 模拟异步任务
function simulateTask() {
  const data = [];
  for (let i = 0; i < 100000; i++) {
    data.push({ id: i, value: Math.random() });
  }
  return data.filter((item) => item.value > 0.5).sort((a, b) => a.value - b.value);
}

const result = simulateTask();
performance.mark("task-end");

// 测量 (Measure) - 计算两个标记之间的时间
performance.measure("task-duration", "task-start", "task-end");

const measures = performance.getEntriesByName("task-duration");
console.log(`  任务耗时: ${measures[0].duration.toFixed(2)} ms`);
console.log(`  结果数量: ${result.length}`);

// 清理标记
performance.clearMarks();
performance.clearMeasures();

// ========== 4. Performance Observer ==========
console.log("\n4. Performance Observer (浏览器环境)");

console.log(`
  // 在浏览器中使用 PerformanceObserver 监控性能
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log(\`[\${entry.entryType}] \${entry.name}: \${entry.duration.toFixed(2)}ms\`);
    }
  });

  // 监控多种性能指标
  observer.observe({
    entryTypes: ['measure', 'resource', 'paint', 'largest-contentful-paint']
  });
`);

// ========== 5. 导航计时 (Navigation Timing) ==========
console.log("5. 导航计时 (浏览器环境)");

console.log(`
  // 获取页面加载各阶段耗时
  const timing = performance.getEntriesByType('navigation')[0];

  // 关键性能指标
  const metrics = {
    // DNS 解析时间
    dns: timing.domainLookupEnd - timing.domainLookupStart,
    // TCP 连接时间
    tcp: timing.connectEnd - timing.connectStart,
    // TLS 握手时间
    tls: timing.secureConnectionStart > 0
      ? timing.connectEnd - timing.secureConnectionStart : 0,
    // 首字节时间 (TTFB)
    ttfb: timing.responseStart - timing.requestStart,
    // 内容下载时间
    download: timing.responseEnd - timing.responseStart,
    // DOM 解析时间
    domParse: timing.domInteractive - timing.responseEnd,
    // DOM 完成时间
    domComplete: timing.domComplete - timing.domInteractive,
    // 页面完全加载时间
    total: timing.loadEventEnd - timing.navigationStart,
  };

  console.table(metrics);

  ┌─────────────────────────────────────────────────────────┐
  │                    导航计时流程                            │
  ├─────────────────────────────────────────────────────────┤
  │                                                         │
  │  navigationStart                                        │
  │       ↓                                                 │
  │  redirectStart → redirectEnd                            │
  │       ↓                                                 │
  │  fetchStart                                             │
  │       ↓                                                 │
  │  domainLookupStart → domainLookupEnd    (DNS)           │
  │       ↓                                                 │
  │  connectStart → connectEnd              (TCP)           │
  │       ↓                                                 │
  │  requestStart → responseStart           (TTFB)          │
  │       ↓                                                 │
  │  responseStart → responseEnd            (下载)          │
  │       ↓                                                 │
  │  domInteractive                         (DOM 可交互)    │
  │       ↓                                                 │
  │  domContentLoadedEventEnd               (DOMReady)      │
  │       ↓                                                 │
  │  domComplete → loadEventEnd             (完全加载)      │
  │                                                         │
  └─────────────────────────────────────────────────────────┘
`);

// ========== 6. 资源加载计时 ==========
console.log("6. 资源加载计时 (浏览器环境)");

console.log(`
  // 获取所有资源的加载时间
  const resources = performance.getEntriesByType('resource');

  // 按类型分组
  const grouped = {};
  resources.forEach(res => {
    const type = res.initiatorType; // script, css, img, fetch 等
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push({
      name: res.name.split('/').pop(), // 文件名
      duration: res.duration.toFixed(2) + 'ms',
      size: res.transferSize + ' bytes',
    });
  });

  // 找出最慢的资源
  const slowest = resources
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 5)
    .map(r => ({
      name: r.name.split('/').pop(),
      duration: r.duration.toFixed(2) + 'ms',
    }));

  console.log('最慢的 5 个资源:', slowest);
`);

// ========== 7. Core Web Vitals 测量 ==========
console.log("7. Core Web Vitals (浏览器环境)");

console.log(`
  // LCP (Largest Contentful Paint) - 最大内容绘制
  new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log('LCP:', lastEntry.startTime.toFixed(2), 'ms');
    // 好: < 2.5s | 需改进: 2.5-4s | 差: > 4s
  }).observe({ type: 'largest-contentful-paint', buffered: true });

  // FID (First Input Delay) - 首次输入延迟
  new PerformanceObserver((entryList) => {
    const entry = entryList.getEntries()[0];
    console.log('FID:', entry.processingStart - entry.startTime, 'ms');
    // 好: < 100ms | 需改进: 100-300ms | 差: > 300ms
  }).observe({ type: 'first-input', buffered: true });

  // CLS (Cumulative Layout Shift) - 累积布局偏移
  let clsValue = 0;
  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    }
    console.log('CLS:', clsValue.toFixed(4));
    // 好: < 0.1 | 需改进: 0.1-0.25 | 差: > 0.25
  }).observe({ type: 'layout-shift', buffered: true });

  ┌─────────────────────────────────────────────────────────┐
  │                  Core Web Vitals 标准                     │
  ├──────────┬──────────┬──────────────┬─────────────────────┤
  │ 指标      │ 好        │ 需改进        │ 差                 │
  ├──────────┼──────────┼──────────────┼─────────────────────┤
  │ LCP      │ < 2.5s   │ 2.5s - 4s    │ > 4s               │
  │ FID      │ < 100ms  │ 100ms - 300ms│ > 300ms            │
  │ CLS      │ < 0.1    │ 0.1 - 0.25   │ > 0.25             │
  │ INP      │ < 200ms  │ 200ms - 500ms│ > 500ms            │
  └──────────┴──────────┴──────────────┴─────────────────────┘
`);

// ========== 8. 性能监控封装 ==========
console.log("8. 性能监控工具封装");

class PerformanceMonitor {
  constructor() {
    this.metrics = {};
  }

  // 测量同步函数
  measure(name, fn) {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;

    if (!this.metrics[name]) {
      this.metrics[name] = [];
    }
    this.metrics[name].push(duration);

    return result;
  }

  // 测量异步函数
  async measureAsync(name, fn) {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    if (!this.metrics[name]) {
      this.metrics[name] = [];
    }
    this.metrics[name].push(duration);

    return result;
  }

  // 获取统计报告
  report() {
    const report = {};
    for (const [name, times] of Object.entries(this.metrics)) {
      const sorted = [...times].sort((a, b) => a - b);
      report[name] = {
        count: times.length,
        avg: (times.reduce((a, b) => a + b) / times.length).toFixed(2) + " ms",
        min: sorted[0].toFixed(2) + " ms",
        max: sorted[sorted.length - 1].toFixed(2) + " ms",
        p50: sorted[Math.floor(sorted.length * 0.5)].toFixed(2) + " ms",
        p99: sorted[Math.floor(sorted.length * 0.99)].toFixed(2) + " ms",
      };
    }
    return report;
  }
}

// 使用示例
const monitor = new PerformanceMonitor();

for (let i = 0; i < 100; i++) {
  monitor.measure("array-sort", () => {
    const arr = Array.from({ length: 1000 }, () => Math.random());
    arr.sort((a, b) => a - b);
  });

  monitor.measure("object-create", () => {
    const objs = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `item-${i}`,
      value: Math.random(),
    }));
  });
}

console.log("  性能报告:");
console.log(JSON.stringify(monitor.report(), null, 4));

console.log("\n=== Performance API 完成 ===");
