// 性能指标与监控详解
// 运行: node 01-performance-metrics.js

console.log("=== 性能指标与监控 ===\n");

// ========== 1. 模拟 Performance API ==========
console.log("1. 模拟 Performance API\n");

class PerformanceMonitor {
  constructor() {
    this.marks = new Map();
    this.measures = [];
    this.entries = [];
    this.startTime = Date.now();
  }

  // performance.mark()
  mark(name) {
    this.marks.set(name, Date.now() - this.startTime);
  }

  // performance.measure()
  measure(name, startMark, endMark) {
    const start = this.marks.get(startMark) || 0;
    const end = this.marks.get(endMark) || Date.now() - this.startTime;
    const duration = end - start;
    this.measures.push({ name, start, duration });
    return { name, duration };
  }

  // 记录资源加载
  recordResource(name, size, duration) {
    this.entries.push({ name, type: "resource", size, duration });
  }

  // 输出报告
  report() {
    console.log("  📊 性能报告:");
    this.measures.forEach((m) => {
      const bar = "█".repeat(Math.min(Math.round(m.duration / 5), 30));
      console.log(`    ${m.name}: ${m.duration}ms ${bar}`);
    });
    if (this.entries.length > 0) {
      console.log("\n  📦 资源加载:");
      this.entries.forEach((e) => {
        console.log(`    ${e.name}: ${e.duration}ms (${(e.size / 1024).toFixed(1)}KB)`);
      });
    }
  }
}

const perf = new PerformanceMonitor();

// 模拟页面加载
perf.mark("navigationStart");
perf.mark("domContentLoaded");
perf.mark("load");

// 模拟各阶段耗时
perf.marks.set("navigationStart", 0);
perf.marks.set("TTFB", 120);
perf.marks.set("FCP", 350);
perf.marks.set("LCP", 1200);
perf.marks.set("domContentLoaded", 800);
perf.marks.set("load", 1500);
perf.marks.set("TTI", 2000);

perf.measure("TTFB", "navigationStart", "TTFB");
perf.measure("FCP", "navigationStart", "FCP");
perf.measure("LCP", "navigationStart", "LCP");
perf.measure("DOM Ready", "navigationStart", "domContentLoaded");
perf.measure("Page Load", "navigationStart", "load");
perf.measure("TTI", "navigationStart", "TTI");

perf.recordResource("app.js", 250 * 1024, 180);
perf.recordResource("vendor.js", 150 * 1024, 120);
perf.recordResource("styles.css", 30 * 1024, 25);
perf.recordResource("hero.webp", 80 * 1024, 95);

perf.report();

// ========== 2. Core Web Vitals 评分 ==========
console.log("\n2. Core Web Vitals 评分\n");

function evaluateVitals(metrics) {
  const thresholds = {
    LCP: { good: 2500, poor: 4000, unit: "ms" },
    FID: { good: 100, poor: 300, unit: "ms" },
    CLS: { good: 0.1, poor: 0.25, unit: "" },
    INP: { good: 200, poor: 500, unit: "ms" },
  };

  Object.entries(metrics).forEach(([name, value]) => {
    const t = thresholds[name];
    if (!t) return;

    let status, emoji;
    if (value <= t.good) { status = "优秀"; emoji = "🟢"; }
    else if (value <= t.poor) { status = "需改进"; emoji = "🟡"; }
    else { status = "差"; emoji = "🔴"; }

    console.log(`  ${emoji} ${name}: ${value}${t.unit} (${status})`);
  });
}

evaluateVitals({
  LCP: 1800,
  FID: 45,
  CLS: 0.05,
  INP: 150,
});

console.log("\n  优化后:");
evaluateVitals({
  LCP: 4500,
  FID: 250,
  CLS: 0.3,
  INP: 600,
});

// ========== 3. 性能预算 ==========
console.log("\n3. 性能预算 (Performance Budget)\n");

class PerformanceBudget {
  constructor(budgets) {
    this.budgets = budgets;
  }

  check(actuals) {
    let allPassed = true;
    console.log("  预算检查:");

    Object.entries(this.budgets).forEach(([key, budget]) => {
      const actual = actuals[key];
      if (actual === undefined) return;

      const passed = actual <= budget;
      const icon = passed ? "✅" : "❌";
      const pct = ((actual / budget) * 100).toFixed(0);
      allPassed = allPassed && passed;

      console.log(`  ${icon} ${key}: ${actual} / ${budget} (${pct}%)`);
    });

    console.log(`\n  ${allPassed ? "✅ 全部通过" : "❌ 超出预算"}\n`);
    return allPassed;
  }
}

const budget = new PerformanceBudget({
  "JS 总大小 (KB)": 300,
  "CSS 总大小 (KB)": 50,
  "图片总大小 (KB)": 500,
  "LCP (ms)": 2500,
  "TBT (ms)": 200,
  "请求数": 30,
});

budget.check({
  "JS 总大小 (KB)": 280,
  "CSS 总大小 (KB)": 35,
  "图片总大小 (KB)": 620,
  "LCP (ms)": 1800,
  "TBT (ms)": 180,
  "请求数": 25,
});

// ========== 4. 性能时间线 ==========
console.log("4. 页面加载时间线\n");
console.log(`
  0ms         500ms       1000ms      1500ms      2000ms
  │            │            │           │           │
  ├── TTFB ──→│            │           │           │
  │    120ms   │            │           │           │
  │            ├─ FCP ─────→│           │           │
  │            │   350ms    │           │           │
  │            │            ├── LCP ───→│           │
  │            │            │   1200ms  │           │
  │            │      DOM ──┤   800ms   │           │
  │            │            │     Load ─┤  1500ms   │
  │            │            │           │    TTI ───┤ 2000ms
  │            │            │           │           │
`);

console.log("=== 性能指标完成 ===");
