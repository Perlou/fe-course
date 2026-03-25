/**
 * 应用预加载与缓存
 *
 * 核心原理:
 *   1. requestIdleCallback — 浏览器空闲时预加载
 *   2. 资源缓存 — 避免重复请求
 *   3. 优先级控制 — 按需排序加载顺序
 *
 * 对标: qiankun prefetch: 'all' / prefetch: ['app1']
 */

class Prefetch {
  constructor(loader) {
    this.loader = loader;       // AppLoader 实例
    this.queue = [];            // 预加载队列
    this.loaded = new Set();    // 已加载
    this.loading = new Set();   // 加载中
  }

  /**
   * 添加预加载任务
   * @param {Array} apps - [{ name, entry, priority? }]
   */
  add(apps) {
    const newApps = apps
      .filter(app => !this.loaded.has(app.name) && !this.loading.has(app.name))
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    this.queue.push(...newApps);
    console.log(`[Prefetch] 添加 ${newApps.length} 个预加载任务`);
  }

  /**
   * 使用 requestIdleCallback 空闲加载
   */
  start() {
    if (this.queue.length === 0) return;

    const schedule = typeof requestIdleCallback !== 'undefined'
      ? requestIdleCallback
      : (cb) => setTimeout(cb, 0);

    const processNext = (deadline) => {
      // 空闲时间不足或队列空 → 停止
      const hasTime = deadline
        ? (typeof deadline.timeRemaining === 'function' ? deadline.timeRemaining() > 5 : true)
        : true;

      if (!hasTime || this.queue.length === 0) {
        if (this.queue.length > 0) {
          schedule(processNext);
        }
        return;
      }

      const app = this.queue.shift();
      if (!app || this.loaded.has(app.name)) {
        if (this.queue.length > 0) schedule(processNext);
        return;
      }

      this.loading.add(app.name);

      this.loader.load(app.entry, app.name)
        .then(() => {
          this.loaded.add(app.name);
          this.loading.delete(app.name);
          console.log(`[Prefetch] ✅ ${app.name} 预加载完成`);
        })
        .catch(err => {
          this.loading.delete(app.name);
          console.warn(`[Prefetch] ⚠️  ${app.name} 预加载失败:`, err.message);
        });

      // 继续下一个
      if (this.queue.length > 0) {
        schedule(processNext);
      }
    };

    schedule(processNext);
    console.log('[Prefetch] 🚀 开始空闲预加载');
  }

  /**
   * 立即预加载所有
   */
  async loadAll() {
    const promises = this.queue.map(app => {
      if (this.loaded.has(app.name)) return Promise.resolve();

      this.loading.add(app.name);
      return this.loader.load(app.entry, app.name)
        .then(() => {
          this.loaded.add(app.name);
          this.loading.delete(app.name);
          console.log(`[Prefetch] ✅ ${app.name} 预加载完成`);
        })
        .catch(err => {
          this.loading.delete(app.name);
          console.warn(`[Prefetch] ${app.name} 预加载失败:`, err.message);
        });
    });

    this.queue = [];
    await Promise.all(promises);
  }

  /**
   * 检查是否已预加载
   */
  isLoaded(name) {
    return this.loaded.has(name);
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Prefetch };
}
