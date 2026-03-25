/**
 * JS 沙箱 — Proxy 实现
 *
 * 核心原理:
 *   每个子应用拥有独立的 fakeWindow (Proxy 代理)
 *   写操作 → 拦截到 fakeWindow
 *   读操作 → 优先 fakeWindow, 兜底 rawWindow
 *   支持多实例并行运行
 *
 * 对标: qiankun ProxySandbox
 */

class ProxySandbox {
  constructor(name) {
    this.name = name;
    this.running = false;
    this.fakeWindow = Object.create(null);

    // 白名单: 允许子应用访问的全局 API
    this.whitelist = new Set([
      'console', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
      'requestAnimationFrame', 'cancelAnimationFrame',
      'Promise', 'Symbol', 'Array', 'Object', 'String', 'Number', 'Boolean',
      'Map', 'Set', 'WeakMap', 'WeakSet',
      'JSON', 'Math', 'Date', 'RegExp', 'Error', 'TypeError', 'RangeError',
      'parseInt', 'parseFloat', 'isNaN', 'isFinite',
      'encodeURIComponent', 'decodeURIComponent', 'encodeURI', 'decodeURI',
      'fetch', 'XMLHttpRequest', 'URL', 'URLSearchParams',
      'document', 'navigator', 'location', 'history',
      'CustomEvent', 'Event', 'EventTarget',
      'MutationObserver', 'IntersectionObserver', 'ResizeObserver',
      'HTMLElement', 'Node', 'NodeList',
      'atob', 'btoa', 'crypto',
    ]);

    // 不允许子应用覆盖的属性
    this.protectedKeys = new Set([
      'window', 'self', 'globalThis', 'document', 'location', 'history',
    ]);

    // 记录副作用 (定时器等)，用于卸载时自动清理
    this.sideEffects = {
      timers: [],
      intervals: [],
      listeners: [],
    };

    this.proxy = this._createProxy();
  }

  _createProxy() {
    const { fakeWindow, whitelist, protectedKeys, sideEffects } = this;
    const rawWindow = typeof window !== 'undefined' ? window : globalThis;
    const sandbox = this;

    return new Proxy(fakeWindow, {
      get(target, key) {
        // 特殊属性: 返回 proxy 自身
        if (key === 'window' || key === 'self' || key === 'globalThis') {
          return sandbox.proxy;
        }

        // 优先从 fakeWindow 取
        if (key in target) {
          return target[key];
        }

        // 白名单内的全局 API
        if (whitelist.has(key)) {
          const val = rawWindow[key];
          // 方法需要绑定原始 window 上下文
          if (typeof val === 'function' && !val.prototype) {
            return val.bind(rawWindow);
          }
          return val;
        }

        return undefined;
      },

      set(target, key, value) {
        if (!sandbox.running) {
          console.warn(`[Sandbox:${sandbox.name}] 沙箱未激活，忽略写入: ${String(key)}`);
          return true;
        }

        if (protectedKeys.has(key)) {
          console.warn(`[Sandbox:${sandbox.name}] 禁止覆盖: ${String(key)}`);
          return true;
        }

        target[key] = value;
        return true;
      },

      has(target, key) {
        return key in target || whitelist.has(key);
      },

      deleteProperty(target, key) {
        if (key in target) {
          delete target[key];
        }
        return true;
      },
    });
  }

  /**
   * 激活沙箱
   */
  active() {
    this.running = true;
    console.log(`[Sandbox:${this.name}] ✅ 激活`);
  }

  /**
   * 关闭沙箱，清理副作用
   */
  inactive() {
    this.running = false;

    // 清理定时器
    this.sideEffects.timers.forEach(id => clearTimeout(id));
    this.sideEffects.intervals.forEach(id => clearInterval(id));
    this.sideEffects.timers = [];
    this.sideEffects.intervals = [];

    console.log(`[Sandbox:${this.name}] 🔒 关闭`);
  }

  /**
   * 在沙箱内执行代码
   */
  exec(code) {
    const fn = new Function('window', `with(window) { ${code} }`);
    try {
      fn(this.proxy);
    } catch (err) {
      console.error(`[Sandbox:${this.name}] 执行错误:`, err.message);
    }
  }

  /**
   * 获取沙箱内的变量
   */
  getVariable(key) {
    return this.fakeWindow[key];
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ProxySandbox };
}
