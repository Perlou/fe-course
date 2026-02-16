// 渲染优化实践
// 运行环境: 浏览器 (在 HTML 中引入或控制台运行)
// 本文件展示各种渲染优化技巧和原理

console.log("=== 渲染优化实践 ===\n");

// ========== 1. 重排 vs 重绘 vs 合成 ==========
console.log("1. 重排 vs 重绘 vs 合成");

console.log(`
  渲染流水线:
  JS → Style → Layout → Paint → Composite

  性能成本: Layout > Paint > Composite

  ┌─────────────────┬─────────────────────────────────────┐
  │ 触发重排 (最贵)  │ width, height, margin, padding,     │
  │                 │ top, left, display, font-size,       │
  │                 │ offsetWidth, scrollTop (读取也触发)   │
  ├─────────────────┼─────────────────────────────────────┤
  │ 触发重绘 (较贵)  │ color, background, visibility,      │
  │                 │ border-color, outline, box-shadow    │
  ├─────────────────┼─────────────────────────────────────┤
  │ 只触发合成 (便宜)│ transform, opacity, filter,         │
  │                 │ will-change                          │
  └─────────────────┴─────────────────────────────────────┘
`);

// ========== 2. 避免强制同步布局 ==========
console.log("2. 避免强制同步布局 (Force Layout)");

console.log(`
  // ❌ 强制同步布局 (Layout Thrashing)
  // 读 → 写 → 读 → 写 交替进行，每次读取都触发重排
  for (let i = 0; i < elements.length; i++) {
    const width = elements[i].offsetWidth;    // 读 → 触发布局
    elements[i].style.width = width + 10 + 'px'; // 写 → 使布局失效
  }

  // ✅ 批量读取，再批量写入
  const widths = elements.map(el => el.offsetWidth);  // 批量读
  elements.forEach((el, i) => {                        // 批量写
    el.style.width = widths[i] + 10 + 'px';
  });
`);

// 模拟演示: 对比性能
function simulateLayoutThrashing(count) {
  // 模拟交替读写
  const start = performance.now();
  const data = [];

  for (let i = 0; i < count; i++) {
    // 模拟读 → 写 → 读 → 写
    data.push(Math.random());
    const temp = data.reduce((a, b) => a + b, 0); // 模拟布局计算
    data[i] = temp / count;
  }

  return performance.now() - start;
}

function simulateBatchedLayout(count) {
  const start = performance.now();
  const data = Array.from({ length: count }, () => Math.random());

  // 批量读
  const sum = data.reduce((a, b) => a + b, 0);

  // 批量写
  for (let i = 0; i < count; i++) {
    data[i] = sum / count;
  }

  return performance.now() - start;
}

const count = 10000;
console.log(`  交替读写 (${count}次):`, simulateLayoutThrashing(count).toFixed(2), "ms");
console.log(`  批量读写 (${count}次):`, simulateBatchedLayout(count).toFixed(2), "ms");

// ========== 3. 使用 requestAnimationFrame ==========
console.log("\n3. requestAnimationFrame (rAF)");

console.log(`
  // ❌ 使用 setInterval 做动画 (不与屏幕刷新同步)
  setInterval(() => {
    element.style.left = x++ + 'px';
  }, 16); // 约 60fps，但不精确

  // ✅ 使用 requestAnimationFrame (与屏幕刷新同步)
  function animate() {
    element.style.transform = \`translateX(\${x++}px)\`;
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  rAF 优势:
  1. 自动与屏幕刷新率同步 (通常 60fps)
  2. 页面不可见时自动暂停，节省资源
  3. 浏览器可以批量优化多个 rAF 回调
`);

// 模拟 rAF 调度器
class AnimationScheduler {
  constructor() {
    this.tasks = [];
    this.running = false;
    this.frameId = null;
  }

  add(task) {
    this.tasks.push(task);
    if (!this.running) this.start();
  }

  start() {
    this.running = true;
    const loop = (timestamp) => {
      // 执行所有任务
      this.tasks.forEach((task) => task(timestamp));

      // 继续下一帧
      if (this.running) {
        this.frameId = typeof requestAnimationFrame !== "undefined"
          ? requestAnimationFrame(loop)
          : setTimeout(() => loop(performance.now()), 16);
      }
    };
    this.frameId = typeof requestAnimationFrame !== "undefined"
      ? requestAnimationFrame(loop)
      : setTimeout(() => loop(performance.now()), 16);
  }

  stop() {
    this.running = false;
    if (typeof cancelAnimationFrame !== "undefined") {
      cancelAnimationFrame(this.frameId);
    } else {
      clearTimeout(this.frameId);
    }
  }
}

console.log("  AnimationScheduler 类已定义 (浏览器环境使用)");

// ========== 4. 防抖与节流 ==========
console.log("\n4. 防抖 (Debounce) 与节流 (Throttle)");

// 防抖: 延迟执行，重复触发会重置计时器
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 节流: 限制执行频率，在指定时间内最多执行一次
function throttle(fn, interval) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

// rAF 节流: 每帧最多执行一次
function rafThrottle(fn) {
  let scheduled = false;
  return function (...args) {
    if (!scheduled) {
      scheduled = true;
      if (typeof requestAnimationFrame !== "undefined") {
        requestAnimationFrame(() => {
          fn.apply(this, args);
          scheduled = false;
        });
      } else {
        setTimeout(() => {
          fn.apply(this, args);
          scheduled = false;
        }, 16);
      }
    }
  };
}

// 演示
console.log("  模拟快速触发事件 20 次:");

let debounceCount = 0;
let throttleCount = 0;

const debouncedFn = debounce(() => debounceCount++, 50);
const throttledFn = throttle(() => throttleCount++, 50);

// 模拟 20 次快速调用
for (let i = 0; i < 20; i++) {
  debouncedFn();
  throttledFn();
}

// 等待看结果
setTimeout(() => {
  console.log(`  防抖执行次数: ${debounceCount} (应该是 1)`);
  console.log(`  节流执行次数: ${throttleCount} (应该是 1，因为同步调用)`);
}, 100);

console.log(`
  使用场景:
  ┌──────────┬──────────────────────────────────────┐
  │ 防抖     │ 搜索输入、窗口 resize、表单验证         │
  │ 节流     │ 滚动事件、鼠标移动、按钮防重复点击      │
  │ rAF 节流 │ 动画相关的事件处理                      │
  └──────────┴──────────────────────────────────────┘
`);

// ========== 5. 虚拟滚动原理 ==========
console.log("5. 虚拟滚动原理");

console.log(`
  问题: 渲染 10000 个列表项 → 10000 个 DOM 节点 → 卡顿
  解法: 只渲染可视区域内的元素 (通常 20-30 个)

  ┌──────────────────────────────────┐
  │         不可见区域 (上方)         │ ← 不渲染，用 padding-top 撑开
  ├──────────────────────────────────┤
  │  ┌────────────────────────────┐  │
  │  │  Item 51                  │  │
  │  │  Item 52                  │  │
  │  │  Item 53                  │  │ ← 只渲染这些 (可视区域)
  │  │  Item 54                  │  │
  │  │  Item 55                  │  │
  │  └────────────────────────────┘  │
  ├──────────────────────────────────┤
  │         不可见区域 (下方)         │ ← 不渲染，用 padding-bottom 撑开
  └──────────────────────────────────┘
`);

// 简化版虚拟滚动计算
class VirtualScroller {
  constructor(totalItems, itemHeight, containerHeight) {
    this.totalItems = totalItems;
    this.itemHeight = itemHeight;
    this.containerHeight = containerHeight;
    this.visibleCount = Math.ceil(containerHeight / itemHeight) + 2; // 缓冲
  }

  // 根据滚动位置计算应该渲染的元素
  getVisibleRange(scrollTop) {
    const startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - 1);
    const endIndex = Math.min(this.totalItems - 1, startIndex + this.visibleCount);

    return {
      startIndex,
      endIndex,
      renderCount: endIndex - startIndex + 1,
      paddingTop: startIndex * this.itemHeight,
      paddingBottom: (this.totalItems - endIndex - 1) * this.itemHeight,
      totalHeight: this.totalItems * this.itemHeight,
    };
  }
}

const scroller = new VirtualScroller(10000, 40, 400);

console.log("  滚动到顶部:", scroller.getVisibleRange(0));
console.log("  滚动到中间:", scroller.getVisibleRange(5000 * 40));
console.log("  滚动到底部:", scroller.getVisibleRange(9990 * 40));
console.log(`  总共 10000 项，每次只渲染 ~${scroller.visibleCount} 项`);

// ========== 6. 图片懒加载 ==========
console.log("\n6. 图片懒加载");

console.log(`
  // 方式1: Intersection Observer API (推荐)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src; // 替换真实图片
        observer.unobserve(img);   // 加载后停止观察
      }
    });
  }, {
    rootMargin: '200px', // 提前 200px 开始加载
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    observer.observe(img);
  });

  // 方式2: 原生 loading="lazy" (最简单)
  <img src="image.jpg" loading="lazy" alt="...">

  // 方式3: CSS content-visibility (自动)
  .card {
    content-visibility: auto;
    contain-intrinsic-size: 200px; // 预估高度
  }
`);

// ========== 7. Web Worker 避免主线程阻塞 ==========
console.log("7. Web Worker 避免主线程阻塞");

console.log(`
  问题: JavaScript 在主线程执行，耗时计算会阻塞渲染

  // main.js
  const worker = new Worker('worker.js');

  worker.postMessage({ type: 'HEAVY_TASK', data: bigArray });

  worker.onmessage = (e) => {
    console.log('计算完成:', e.data.result);
  };

  // worker.js
  self.onmessage = (e) => {
    if (e.data.type === 'HEAVY_TASK') {
      // 耗时计算在 Worker 线程执行，不阻塞 UI
      const result = heavyComputation(e.data.data);
      self.postMessage({ result });
    }
  };

  适用场景:
  • 大数据排序/过滤
  • 图片处理 (Canvas 像素操作)
  • 复杂数学计算
  • 数据解析 (JSON/CSV)
`);

// 演示主线程阻塞 vs 非阻塞
function heavySync(iterations) {
  const start = performance.now();
  let result = 0;
  for (let i = 0; i < iterations; i++) {
    result += Math.sqrt(i) * Math.sin(i);
  }
  return { result, time: performance.now() - start };
}

// 分片执行 (不阻塞主线程的替代方案)
function heavyChunked(iterations, chunkSize = 10000) {
  return new Promise((resolve) => {
    let i = 0;
    let result = 0;
    const start = performance.now();

    function processChunk() {
      const end = Math.min(i + chunkSize, iterations);
      for (; i < end; i++) {
        result += Math.sqrt(i) * Math.sin(i);
      }

      if (i < iterations) {
        // 让出主线程，下一帧继续
        setTimeout(processChunk, 0);
      } else {
        resolve({ result, time: performance.now() - start });
      }
    }

    processChunk();
  });
}

const syncResult = heavySync(1000000);
console.log(`  同步阻塞: ${syncResult.time.toFixed(2)} ms`);

heavyChunked(1000000).then((chunkedResult) => {
  console.log(`  分片执行: ${chunkedResult.time.toFixed(2)} ms (不阻塞主线程)`);
});

// ========== 8. CSS 优化策略 ==========
console.log("\n8. CSS 优化策略");

console.log(`
  1. 使用 transform/opacity 做动画 (只触发合成)
     ✅ transform: translateX(100px);
     ❌ left: 100px;

  2. 使用 will-change 提前告知浏览器
     .animated { will-change: transform; }  // 创建新的合成层
     ⚠️ 不要滥用，占用 GPU 内存

  3. 使用 contain 限制重排范围
     .widget { contain: layout style; }      // 内部变化不影响外部

  4. 使用 content-visibility 跳过屏外渲染
     .card { content-visibility: auto; }     // 自动跳过不可见元素

  5. 减少选择器复杂度
     ✅ .card-title { }
     ❌ div.container > ul > li > .card > .title { }

  6. 避免大量 @import
     ✅ 合并 CSS 文件或使用 <link> 并行加载

  渲染优化总结:
  ┌──────────────────────────────────────────────────────┐
  │ 1. 批量 DOM 操作，避免强制同步布局                      │
  │ 2. 使用 rAF 做动画，不用 setInterval                   │
  │ 3. 用防抖/节流控制高频事件                              │
  │ 4. 虚拟滚动处理长列表                                   │
  │ 5. 图片懒加载 + 预加载                                  │
  │ 6. 耗时任务用 Web Worker 或分片执行                     │
  │ 7. CSS: transform > position, contain, will-change    │
  └──────────────────────────────────────────────────────┘
`);

// 等待异步操作完成
setTimeout(() => {
  console.log("\n=== 渲染优化实践完成 ===");
}, 200);
