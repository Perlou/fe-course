// 运行时性能优化详解
// 运行: node 03-runtime-optimize.js

console.log("=== 运行时性能优化 ===\n");

// ========== 1. 防抖与节流 ==========
console.log("1. 防抖 (Debounce) vs 节流 (Throttle)\n");

function debounce(fn, delay, immediate = false) {
  let timer = null;
  return function (...args) {
    const callNow = immediate && !timer;
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (!immediate) fn.apply(this, args);
    }, delay);
    if (callNow) fn.apply(this, args);
  };
}

function throttle(fn, delay) {
  let lastTime = 0;
  let timer = null;
  return function (...args) {
    const now = Date.now();
    const remaining = delay - (now - lastTime);
    if (remaining <= 0) {
      clearTimeout(timer);
      timer = null;
      fn.apply(this, args);
      lastTime = now;
    } else if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, args);
        lastTime = Date.now();
        timer = null;
      }, remaining);
    }
  };
}

// 测试防抖
let debounceLog = [];
const debouncedFn = debounce((val) => debounceLog.push(val), 50);

// 模拟快速连续调用
for (let i = 0; i < 5; i++) debouncedFn(i);

setTimeout(() => {
  console.log(`  防抖: 连续调用 5 次, 实际执行 ${debounceLog.length} 次, 值: [${debounceLog}]`);
  console.log("  → 只执行最后一次 (适合搜索框输入)\n");

  // 测试节流
  let throttleLog = [];
  const throttledFn = throttle((val) => throttleLog.push(val), 30);

  const start = Date.now();
  const interval = setInterval(() => {
    if (Date.now() - start > 100) {
      clearInterval(interval);
      console.log(`  节流: 高频调用 ~100ms, 实际执行 ${throttleLog.length} 次`);
      console.log("  → 固定频率执行 (适合滚动/拖拽)\n");
      continueDemo();
    }
    throttledFn(Date.now() - start);
  }, 5);
}, 100);

function continueDemo() {
  // ========== 2. requestAnimationFrame ==========
  console.log("2. requestAnimationFrame vs setTimeout\n");

  console.log(`  setTimeout(fn, 16):
    ❌ 不与屏幕刷新率同步
    ❌ 可能掉帧或过度渲染
    ❌ 后台标签页仍执行

  requestAnimationFrame(fn):
    ✅ 与 60fps 屏幕刷新同步
    ✅ 每帧只执行一次
    ✅ 后台标签页自动暂停
    ✅ 浏览器自动优化
`);

  // 模拟动画帧
  let frames = 0;
  const animStart = Date.now();
  function mockRAF() {
    frames++;
    if (Date.now() - animStart < 50) {
      setTimeout(mockRAF, 16); // 模拟 60fps
    } else {
      console.log(`  模拟动画: ${frames} 帧 / ${Date.now() - animStart}ms ≈ ${Math.round(frames / ((Date.now() - animStart) / 1000))} fps\n`);
    }
  }
  mockRAF();

  // ========== 3. 批量 DOM 操作 ==========
  setTimeout(() => {
    console.log("3. 批量 DOM 操作 (Document Fragment)\n");

    // 模拟 DOM 操作计数
    let domOps = 0;

    // ❌ 逐个插入
    domOps = 0;
    for (let i = 0; i < 1000; i++) {
      domOps++; // 每次 appendChild = 一次重排
    }
    console.log(`  ❌ 逐个插入: ${domOps} 次 DOM 操作 (${domOps} 次重排)`);

    // ✅ DocumentFragment
    domOps = 0;
    domOps++; // 创建 Fragment
    for (let i = 0; i < 1000; i++) {
      // append to Fragment (不触发重排)
    }
    domOps++; // 一次性 appendChild
    console.log(`  ✅ Fragment: ${domOps} 次 DOM 操作 (1 次重排)`);

    // ✅ innerHTML
    domOps = 1;
    console.log(`  ✅ innerHTML: ${domOps} 次 DOM 操作 (1 次重排)\n`);

    // ========== 4. 长任务拆分 ==========
    console.log("4. 长任务拆分 (Yield to Main Thread)\n");

    async function processLargeArray(items) {
      const CHUNK_SIZE = 100;
      const results = [];
      let processed = 0;

      for (let i = 0; i < items.length; i += CHUNK_SIZE) {
        const chunk = items.slice(i, i + CHUNK_SIZE);
        chunk.forEach((item) => results.push(item * 2));
        processed += chunk.length;

        // 每处理一块就让出主线程
        if (i + CHUNK_SIZE < items.length) {
          await new Promise((r) => setTimeout(r, 0));
        }
      }

      return { processed, results: results.length };
    }

    const items = Array.from({ length: 500 }, (_, i) => i);
    const start2 = Date.now();
    processLargeArray(items).then(({ processed }) => {
      console.log(`  处理 ${processed} 项, 分 ${Math.ceil(processed / 100)} 块`);
      console.log(`  每块处理后 yield 给主线程, 避免长任务阻塞`);
      console.log(`  耗时: ${Date.now() - start2}ms\n`);

      showReflowTriggers();
    });
  }, 100);
}

function showReflowTriggers() {
  // ========== 5. 重排重绘触发 ==========
  console.log("5. 触发重排的属性\n");
  console.log(`
  读取以下属性会触发 强制同步布局 (Forced Reflow):
  ┌──────────────────────────────────────────────────┐
  │ offset*:  offsetTop, offsetLeft, offsetWidth...  │
  │ scroll*:  scrollTop, scrollLeft, scrollWidth...  │
  │ client*:  clientTop, clientLeft, clientWidth...  │
  │ 方法:     getComputedStyle(), getBoundingClient  │
  └──────────────────────────────────────────────────┘

  不触发重排 (合成层, GPU 加速):
  ┌──────────────────────────────────────────────────┐
  │ transform, opacity, filter, will-change          │
  └──────────────────────────────────────────────────┘

  优化原则:
  1. 读写分离: 先批量读取，再批量写入
  2. 用 transform 替代 top/left
  3. 用 class 替代逐个修改 style
  4. 离线操作: display:none → 修改 → display:block
`);

  console.log("=== 运行时性能优化完成 ===");
}
