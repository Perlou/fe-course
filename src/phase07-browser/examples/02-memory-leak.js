// 内存泄漏场景与排查
// 运行: node --expose-gc 02-memory-leak.js
// --expose-gc 标志允许手动触发垃圾回收

console.log("=== 内存泄漏场景与排查 ===\n");

// 工具函数: 获取当前内存使用量
function getMemoryUsage() {
  const mem = process.memoryUsage();
  return {
    heapUsed: (mem.heapUsed / 1024 / 1024).toFixed(2) + " MB",
    heapTotal: (mem.heapTotal / 1024 / 1024).toFixed(2) + " MB",
    rss: (mem.rss / 1024 / 1024).toFixed(2) + " MB",
    external: (mem.external / 1024 / 1024).toFixed(2) + " MB",
  };
}

function forceGC() {
  if (global.gc) {
    global.gc();
  } else {
    console.log("  ⚠️ 请使用 --expose-gc 标志运行: node --expose-gc 02-memory-leak.js");
  }
}

console.log("初始内存:", getMemoryUsage());

// ========== 1. 意外的全局变量 ==========
console.log("\n1. 意外的全局变量");

function leakGlobal() {
  // ❌ 忘记使用 let/const，变量成为全局变量
  // leakedData = new Array(100000).fill('leak');

  // ✅ 正确写法
  const localData = new Array(100000).fill("safe");
  return localData.length;
}

leakGlobal();
console.log("  全局变量泄漏 → 使用 let/const 避免");
console.log(`
  ❌ function foo() { bar = 'global'; }     // 意外全局
  ❌ function foo() { this.bar = 'global'; } // 严格模式下 this 是 undefined
  ✅ function foo() { const bar = 'local'; } // 局部变量
`);

// ========== 2. 遗忘的定时器 ==========
console.log("2. 遗忘的定时器");

class DataFetcher {
  constructor() {
    this.data = new Array(10000).fill("data");
    this.timer = null;
  }

  // ❌ 启动定时器但忘记清理
  startPollingBad() {
    this.timer = setInterval(() => {
      // 即使 DataFetcher 实例不再使用，
      // 定时器中的闭包仍持有 this 引用，导致无法回收
      console.log("  polling...", this.data.length);
    }, 1000);
  }

  // ✅ 提供清理方法
  startPollingGood() {
    this.timer = setInterval(() => {
      console.log("  polling...", this.data.length);
    }, 1000);
  }

  // 必须在销毁时调用
  destroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.data = null; // 释放大数据
  }
}

const fetcher = new DataFetcher();
// fetcher.startPollingGood();
// ...使用完毕后
// fetcher.destroy();
console.log("  定时器泄漏 → 组件/对象销毁时记得 clearInterval/clearTimeout");

// ========== 3. 闭包引起的泄漏 ==========
console.log("\n3. 闭包引起的泄漏");

forceGC();
const memBefore = process.memoryUsage().heapUsed;

// ❌ 闭包持有大量数据引用
function createLeakyClosure() {
  const hugeData = new Array(100000).fill("x".repeat(100));

  return function () {
    // 即使只用了 hugeData.length，整个 hugeData 数组都不能被回收
    return hugeData.length;
  };
}

const leakyFn = createLeakyClosure();
console.log("  闭包返回:", leakyFn());

const memAfterLeak = process.memoryUsage().heapUsed;
console.log(`  闭包泄漏占用: ${((memAfterLeak - memBefore) / 1024 / 1024).toFixed(2)} MB`);

// ✅ 优化: 只保留需要的数据
function createSafeClosure() {
  const hugeData = new Array(100000).fill("x".repeat(100));
  const length = hugeData.length; // 提取需要的值
  // hugeData 在函数返回后就可以被回收了

  return function () {
    return length;
  };
}

console.log(`
  闭包泄漏优化:
  ❌ return () => hugeData.length;     // 整个 hugeData 被保留
  ✅ const len = hugeData.length;      // 只保留需要的值
     return () => len;
`);

// ========== 4. 事件监听器泄漏 ==========
console.log("4. 事件监听器泄漏");

const { EventEmitter } = require("events");

class Component {
  constructor(emitter) {
    this.data = new Array(10000).fill("component-data");
    this.emitter = emitter;

    // 保存 handler 引用以便移除
    this.handleEvent = this._onEvent.bind(this);
    this.emitter.on("update", this.handleEvent);
  }

  _onEvent(data) {
    // 处理事件
  }

  // ✅ 提供清理方法
  destroy() {
    this.emitter.removeListener("update", this.handleEvent);
    this.data = null;
  }
}

const emitter = new EventEmitter();

// ❌ 不断创建但不清理
console.log("  模拟创建 100 个组件 (不清理)...");
const components = [];
for (let i = 0; i < 100; i++) {
  components.push(new Component(emitter));
}
console.log(`  事件监听器数量: ${emitter.listenerCount("update")}`);

// ✅ 正确清理
components.forEach((c) => c.destroy());
console.log(`  清理后监听器数量: ${emitter.listenerCount("update")}`);

console.log(`
  事件监听器泄漏预防:
  1. 保存 handler 引用 → this.handler = this.onEvent.bind(this)
  2. 组件销毁时移除 → emitter.removeListener('event', this.handler)
  3. 使用 AbortController (浏览器) → signal 参数自动清理
`);

// ========== 5. DOM 引用泄漏 (浏览器环境) ==========
console.log("5. DOM 引用泄漏 (浏览器环境)");

console.log(`
  // ❌ 脱离 DOM 的引用
  const elementCache = {};

  function addButton() {
    const btn = document.createElement('button');
    btn.id = 'myBtn';
    document.body.appendChild(btn);
    elementCache['myBtn'] = btn; // 缓存引用
  }

  function removeButton() {
    const btn = document.getElementById('myBtn');
    document.body.removeChild(btn);
    // elementCache['myBtn'] 仍然引用着已删除的 DOM
    // 整个 DOM 子树都无法被回收!
  }

  // ✅ 正确写法
  function removeButtonFixed() {
    const btn = document.getElementById('myBtn');
    document.body.removeChild(btn);
    delete elementCache['myBtn']; // 清除缓存引用
  }

  // ✅ 更好: 使用 WeakRef 或 WeakMap
  const weakCache = new WeakMap();
  weakCache.set(btn, { someData: 'value' });
  // 当 btn 被 DOM 移除后，WeakMap 条目自动清除
`);

// ========== 6. WeakMap / WeakSet 防泄漏 ==========
console.log("6. WeakMap / WeakSet 防泄漏");

forceGC();
const memBeforeWeak = process.memoryUsage().heapUsed;

// ❌ 使用 Map → 键对象无法被回收
const strongMap = new Map();

// ✅ 使用 WeakMap → 键对象可以被回收
const weakMap = new WeakMap();

function demonstrateWeakMap() {
  let bigObj = { data: new Array(50000).fill("weak-data") };

  weakMap.set(bigObj, "metadata");
  console.log("  WeakMap has key:", weakMap.has(bigObj));

  // 解除引用后，bigObj 可以被垃圾回收
  bigObj = null;

  // WeakMap 中的条目也会被自动清除
  // (无法直接验证，因为 WeakMap 不可遍历)
}

demonstrateWeakMap();
forceGC();

console.log(`
  Map vs WeakMap:
  ┌─────────────┬─────────────────────┬──────────────────────┐
  │             │       Map           │      WeakMap         │
  ├─────────────┼─────────────────────┼──────────────────────┤
  │ 键类型      │ 任意值               │ 只能是对象           │
  │ 键是否可回收 │ 不可以 (强引用)      │ 可以 (弱引用)        │
  │ 可遍历      │ ✅ (for...of)       │ ❌                   │
  │ .size       │ ✅                  │ ❌                   │
  │ 使用场景    │ 通用缓存             │ 对象关联元数据        │
  └─────────────┴─────────────────────┴──────────────────────┘
`);

// ========== 7. 内存分析工具 ==========
console.log("7. 内存分析工具");

// Node.js 中分析内存
function analyzeMemory() {
  const mem = process.memoryUsage();
  console.log(`
  ┌──────────────────────────────────────────────┐
  │              当前内存状态                       │
  ├──────────────┬───────────────────────────────┤
  │ RSS (常驻)   │ ${(mem.rss / 1024 / 1024).toFixed(2).padStart(10)} MB       │
  │ Heap Total   │ ${(mem.heapTotal / 1024 / 1024).toFixed(2).padStart(10)} MB       │
  │ Heap Used    │ ${(mem.heapUsed / 1024 / 1024).toFixed(2).padStart(10)} MB       │
  │ External     │ ${(mem.external / 1024 / 1024).toFixed(2).padStart(10)} MB       │
  │ Array Buffer │ ${(mem.arrayBuffers / 1024 / 1024).toFixed(2).padStart(10)} MB       │
  └──────────────┴───────────────────────────────┘
  `);
}

analyzeMemory();

console.log(`
  Chrome DevTools 内存排查流程:
  ┌───────────────────────────────────────────────┐
  │ 1. 打开 DevTools → Memory 面板                 │
  │ 2. 选择 "Heap snapshot" → 拍摄初始快照          │
  │ 3. 执行可能泄漏的操作                           │
  │ 4. 拍摄第二个快照                               │
  │ 5. 选择 "Comparison" 视图对比差异               │
  │ 6. 按 "Size Delta" 排序找出增长的对象           │
  │ 7. 查看 "Retaining path" 找到引用链             │
  │ 8. 找到泄漏源头并修复                           │
  └───────────────────────────────────────────────┘
`);

// ========== 8. 内存泄漏检测辅助 ==========
console.log("8. 内存泄漏检测辅助");

class MemoryLeakDetector {
  constructor(label, thresholdMB = 10) {
    this.label = label;
    this.threshold = thresholdMB * 1024 * 1024;
    this.snapshots = [];
  }

  snapshot() {
    forceGC();
    const mem = process.memoryUsage();
    this.snapshots.push({
      timestamp: Date.now(),
      heapUsed: mem.heapUsed,
    });
    return this;
  }

  report() {
    if (this.snapshots.length < 2) {
      console.log("  需要至少 2 个快照");
      return;
    }

    const first = this.snapshots[0];
    const last = this.snapshots[this.snapshots.length - 1];
    const growth = last.heapUsed - first.heapUsed;
    const isLeaking = growth > this.threshold;

    console.log(`  [${this.label}] 内存检测报告:`);
    console.log(`    快照数: ${this.snapshots.length}`);
    console.log(`    初始: ${(first.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`    最终: ${(last.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`    增长: ${(growth / 1024 / 1024).toFixed(2)} MB`);
    console.log(`    状态: ${isLeaking ? "⚠️ 可能存在泄漏!" : "✅ 正常"}`);
  }
}

// 使用示例
const detector = new MemoryLeakDetector("测试场景", 5);

detector.snapshot();

// 模拟一些操作
const tempData = [];
for (let i = 0; i < 50; i++) {
  tempData.push(new Array(10000).fill(Math.random()));
}

detector.snapshot();

// 清理
tempData.length = 0;
detector.snapshot();
detector.report();

console.log("\n=== 内存泄漏学习完成 ===");
