// Node.js 事件循环与异步详解
// 运行: node 01-event-loop.js

console.log("=== Node.js 事件循环 ===\n");

// ========== 1. 同步 vs 异步 ==========
console.log("1. 同步 vs 异步\n");

console.log("  同步开始");

// 微任务: process.nextTick (优先级最高)
process.nextTick(() => console.log("  2️⃣  process.nextTick"));

// 微任务: Promise
Promise.resolve().then(() => console.log("  3️⃣  Promise.then"));

// 微任务: queueMicrotask
queueMicrotask(() => console.log("  4️⃣  queueMicrotask"));

// 宏任务: setTimeout (timers 阶段)
setTimeout(() => console.log("  5️⃣  setTimeout"), 0);

// 宏任务: setImmediate (check 阶段)
setImmediate(() => console.log("  6️⃣  setImmediate"));

console.log("  1️⃣  同步结束");
console.log("  预期顺序: 同步 → nextTick → Promise → queueMicrotask → setTimeout → setImmediate\n");

// ========== 2. 事件循环阶段 ==========
setTimeout(() => {
  console.log("2. 事件循环6个阶段");
  console.log(`
  ┌──────────────────────┐
  │  1. timers           │ ← setTimeout, setInterval
  ├──────────────────────┤
  │  2. pending callbacks│ ← 系统回调 (如 TCP 错误)
  ├──────────────────────┤
  │  3. idle, prepare    │ ← 内部使用
  ├──────────────────────┤
  │  4. poll             │ ← I/O 回调 (fs, network)
  ├──────────────────────┤
  │  5. check            │ ← setImmediate
  ├──────────────────────┤
  │  6. close callbacks  │ ← socket.on('close')
  └──────────────────────┘

  每个阶段之间都会执行微任务队列:
  process.nextTick() > Promise.then() > queueMicrotask()
`);

  // ========== 3. nextTick vs Promise ==========
  console.log("3. nextTick vs Promise 优先级\n");

  Promise.resolve().then(() => console.log("  Promise 1"));
  process.nextTick(() => console.log("  nextTick 1"));
  Promise.resolve().then(() => console.log("  Promise 2"));
  process.nextTick(() => console.log("  nextTick 2"));
  // 输出: nextTick 1 → nextTick 2 → Promise 1 → Promise 2
  // nextTick 队列会完全清空后才执行 Promise 队列

  setTimeout(() => {
    // ========== 4. setTimeout vs setImmediate ==========
    console.log("\n4. setTimeout vs setImmediate\n");

    // 在顶层，顺序不确定
    // 在 I/O 回调中，setImmediate 总是先于 setTimeout
    const fs = require("fs");
    fs.readFile(__filename, () => {
      setTimeout(() => console.log("  I/O 中的 setTimeout"), 0);
      setImmediate(() => console.log("  I/O 中的 setImmediate (总是更快)"));
    });

    // ========== 5. 阻塞事件循环演示 ==========
    setTimeout(() => {
      console.log("\n5. 阻塞事件循环\n");

      console.log("  ❌ 阻塞示例: 同步大量计算会卡住整个服务");
      console.log("  ✅ 解决方案:");
      console.log("     a) 使用 Worker Threads");
      console.log("     b) 拆分为多个 setImmediate 任务");
      console.log("     c) 使用子进程 child_process");

      // Worker Threads 示例
      console.log(`
  // 使用 Worker Threads 避免阻塞
  const { Worker, isMainThread, parentPort } = require('worker_threads');

  if (isMainThread) {
    const worker = new Worker(__filename);
    worker.on('message', (result) => console.log('结果:', result));
    worker.postMessage({ task: 'heavy-computation' });
  } else {
    parentPort.on('message', (data) => {
      // 在独立线程中执行 CPU 密集型任务
      const result = heavyComputation(data);
      parentPort.postMessage(result);
    });
  }
`);

      // ========== 6. 实用异步模式 ==========
      console.log("6. 实用异步模式\n");

      // 串行执行
      async function serial() {
        const results = [];
        const tasks = [1, 2, 3];
        for (const t of tasks) {
          const r = await new Promise((resolve) =>
            setTimeout(() => resolve(t * 10), 10)
          );
          results.push(r);
        }
        return results;
      }

      // 并行执行
      async function parallel() {
        const tasks = [1, 2, 3].map(
          (t) => new Promise((resolve) => setTimeout(() => resolve(t * 10), 10))
        );
        return Promise.all(tasks);
      }

      // 并行限制
      async function parallelLimit(tasks, limit) {
        const results = [];
        const executing = new Set();

        for (const task of tasks) {
          const p = task().then((result) => {
            executing.delete(p);
            return result;
          });
          executing.add(p);
          results.push(p);

          if (executing.size >= limit) {
            await Promise.race(executing);
          }
        }

        return Promise.all(results);
      }

      Promise.all([serial(), parallel()]).then(([s, p]) => {
        console.log("  串行结果:", s);
        console.log("  并行结果:", p);
        console.log("\n=== 事件循环完成 ===");
      });
    }, 50);
  }, 50);
}, 50);
