// 内存管理详解
// 运行: node 04-memory-management.js

console.log("=== 内存管理 ===\n");

// ========== 1. 内存泄漏场景 ==========
console.log("1. 常见内存泄漏场景\n");

// 场景 1: 闭包泄漏
function closureLeak() {
  const largeData = new Array(10000).fill("data");
  return function () {
    return largeData.length; // largeData 无法被回收
  };
}

const leakyFn = closureLeak();
console.log(`  场景1 - 闭包: largeData (${leakyFn()} 项) 被闭包持有, 无法回收`);

// 场景 2: 事件监听未清理
class EventLeakDemo {
  constructor() {
    this.listeners = [];
  }

  // ❌ 忘记清理
  addListener(handler) {
    this.listeners.push(handler);
  }

  // ✅ 正确清理
  removeAllListeners() {
    const count = this.listeners.length;
    this.listeners = [];
    return count;
  }
}

const demo = new EventLeakDemo();
for (let i = 0; i < 100; i++) {
  demo.addListener(() => {});
}
console.log(`  场景2 - 事件监听: ${demo.listeners.length} 个监听器未清理`);
const removed = demo.removeAllListeners();
console.log(`  ✅ 清理: 移除 ${removed} 个监听器`);

// 场景 3: 定时器泄漏
class TimerLeakDemo {
  constructor() {
    this.timers = [];
  }

  start() {
    const id = setInterval(() => {}, 1000);
    this.timers.push(id);
  }

  // 必须在组件卸载时调用
  destroy() {
    this.timers.forEach(clearInterval);
    const count = this.timers.length;
    this.timers = [];
    return count;
  }
}

const timerDemo = new TimerLeakDemo();
for (let i = 0; i < 5; i++) timerDemo.start();
console.log(`  场景3 - 定时器: ${timerDemo.timers.length} 个定时器运行中`);
const cleared = timerDemo.destroy();
console.log(`  ✅ 清理: 清除 ${cleared} 个定时器`);

// ========== 2. WeakRef 与 WeakMap ==========
console.log("\n2. 弱引用 (WeakRef / WeakMap)\n");

// WeakMap — 不阻止 key 被垃圾回收
const cache = new WeakMap();

function getCached(obj) {
  if (cache.has(obj)) {
    console.log("  [WeakMap] 命中缓存");
    return cache.get(obj);
  }
  const result = { computed: Math.random() };
  cache.set(obj, result);
  console.log("  [WeakMap] 计算并缓存");
  return result;
}

let obj1 = { id: 1 };
getCached(obj1); // 计算
getCached(obj1); // 命中缓存
obj1 = null;
console.log("  obj1 = null → WeakMap 中的缓存会被自动回收 ✅");

// WeakRef
class WeakCache {
  constructor() {
    this.cache = new Map();
  }

  set(key, value) {
    this.cache.set(key, new WeakRef(value));
  }

  get(key) {
    const ref = this.cache.get(key);
    if (!ref) return undefined;
    const value = ref.deref();
    if (!value) {
      this.cache.delete(key); // 已被回收
      return undefined;
    }
    return value;
  }
}

console.log("\n  WeakRef 缓存:");
const weakCache = new WeakCache();
let bigData = { name: "bigData", data: new Array(1000) };
weakCache.set("data", bigData);
console.log(`  设置: ${weakCache.get("data")?.name}`);
bigData = null; // 允许 GC 回收
console.log(`  释放后: WeakRef.deref() 可能返回 undefined`);

// ========== 3. 内存快照分析 ==========
console.log("\n3. 内存使用分析\n");

const memUsage = process.memoryUsage();
console.log(`  堆内存使用: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
console.log(`  堆内存总量: ${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
console.log(`  RSS:        ${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`);

// 模拟内存增长
const arrays = [];
for (let i = 0; i < 10; i++) {
  arrays.push(new Array(10000).fill(i));
}
const afterMem = process.memoryUsage();
const delta = (afterMem.heapUsed - memUsage.heapUsed) / 1024;
console.log(`\n  分配 10 个大数组后:`);
console.log(`  堆内存增长: +${delta.toFixed(0)} KB`);
arrays.length = 0; // 释放
console.log(`  释放后: arrays.length = 0 (等待 GC)`);

// ========== 4. 防泄漏模式 ==========
console.log("\n4. 防泄漏最佳实践\n");
console.log(`
  React 组件:
  ┌─────────────────────────────────────────────────┐
  │ useEffect(() => {                               │
  │   const controller = new AbortController();     │
  │   const timer = setInterval(() => {}, 1000);    │
  │   window.addEventListener('resize', handler);   │
  │                                                 │
  │   // ✅ 清理函数                                 │
  │   return () => {                                │
  │     controller.abort();          // 取消请求    │
  │     clearInterval(timer);        // 清除定时器  │
  │     window.removeEventListener('resize', handler); │
  │   };                                            │
  │ }, []);                                         │
  └─────────────────────────────────────────────────┘

  Vue 组件:
  ┌─────────────────────────────────────────────────┐
  │ onMounted(() => {                               │
  │   window.addEventListener('resize', handler);   │
  │ });                                             │
  │                                                 │
  │ onUnmounted(() => {                             │
  │   window.removeEventListener('resize', handler);│
  │ });                                             │
  └─────────────────────────────────────────────────┘

  检测工具:
  • Chrome DevTools → Memory → Heap Snapshot
  • Performance Monitor → JS Heap Size
  • FinalizationRegistry (代码中检测)
`);

console.log("=== 内存管理完成 ===");
