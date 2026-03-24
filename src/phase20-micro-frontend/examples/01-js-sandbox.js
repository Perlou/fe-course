// JS 沙箱原理详解
// 运行: node 01-js-sandbox.js

console.log("=== JS 沙箱原理 ===\n");

// ========== 1. 快照沙箱 ==========
console.log("1. 快照沙箱 (SnapshotSandbox)\n");

class SnapshotSandbox {
  constructor(name) {
    this.name = name;
    this.snapshot = {};
    this.modifyMap = {};
    this.fakeWindow = {};
  }

  // 使用 fakeWindow 模拟，避免真正污染 globalThis
  active() {
    // 保存快照
    this.snapshot = { ...this.fakeWindow };
    // 恢复上次的修改
    Object.keys(this.modifyMap).forEach((key) => {
      this.fakeWindow[key] = this.modifyMap[key];
    });
    console.log(`  [${this.name}] 激活 — 恢复 ${Object.keys(this.modifyMap).length} 个变量`);
  }

  inactive() {
    // 记录修改，恢复快照
    this.modifyMap = {};
    Object.keys(this.fakeWindow).forEach((key) => {
      if (this.fakeWindow[key] !== this.snapshot[key]) {
        this.modifyMap[key] = this.fakeWindow[key];
        if (this.snapshot[key] !== undefined) {
          this.fakeWindow[key] = this.snapshot[key];
        } else {
          delete this.fakeWindow[key];
        }
      }
    });
    console.log(`  [${this.name}] 卸载 — 记录 ${Object.keys(this.modifyMap).length} 个修改`);
  }
}

// 测试快照沙箱
const snapshotSandbox = new SnapshotSandbox("App-A");

snapshotSandbox.active();
snapshotSandbox.fakeWindow.appName = "React App";
snapshotSandbox.fakeWindow.count = 42;
console.log(`  设置 appName="${snapshotSandbox.fakeWindow.appName}", count=${snapshotSandbox.fakeWindow.count}`);
snapshotSandbox.inactive();

console.log(`  卸载后 appName="${snapshotSandbox.fakeWindow.appName || "undefined"}"`);

snapshotSandbox.active();
console.log(`  重新激活 appName="${snapshotSandbox.fakeWindow.appName}", count=${snapshotSandbox.fakeWindow.count}`);
snapshotSandbox.inactive();

// ========== 2. Proxy 沙箱 ==========
console.log("\n2. Proxy 沙箱 (ProxySandbox)\n");

class ProxySandbox {
  constructor(name) {
    this.name = name;
    this.running = false;
    const fakeWindow = Object.create(null);
    const rawWindow = { Date, Math, console, setTimeout, JSON }; // 模拟全局

    this.proxy = new Proxy(fakeWindow, {
      get(target, key) {
        // 优先从 fakeWindow 取，否则从真实 window
        return key in target ? target[key] : rawWindow[key];
      },
      set(target, key, value) {
        // 所有写入都在 fakeWindow 上
        target[key] = value;
        return true;
      },
      has(target, key) {
        return key in target || key in rawWindow;
      },
    });
  }

  active() {
    this.running = true;
    console.log(`  [${this.name}] 激活`);
  }

  inactive() {
    this.running = false;
    console.log(`  [${this.name}] 卸载`);
  }
}

// 测试 Proxy 沙箱 (支持多实例并行)
const sandbox1 = new ProxySandbox("React-App");
const sandbox2 = new ProxySandbox("Vue-App");

sandbox1.active();
sandbox2.active();

sandbox1.proxy.appName = "React";
sandbox1.proxy.version = "18.0";
sandbox2.proxy.appName = "Vue";
sandbox2.proxy.version = "3.0";

console.log(`  Sandbox1: appName="${sandbox1.proxy.appName}", version="${sandbox1.proxy.version}"`);
console.log(`  Sandbox2: appName="${sandbox2.proxy.appName}", version="${sandbox2.proxy.version}"`);
console.log(`  互不干扰: ${sandbox1.proxy.appName !== sandbox2.proxy.appName ? "✅" : "❌"}`);

// 可以访问全局方法
console.log(`  访问 Math.PI: ${sandbox1.proxy.Math.PI}`);

sandbox1.inactive();
sandbox2.inactive();

// ========== 3. with + Proxy 执行沙箱 ==========
console.log("\n3. with + Proxy 代码执行沙箱\n");

class CodeSandbox {
  constructor(name) {
    this.name = name;
    this.fakeWindow = Object.create(null);
    // 白名单: 允许访问的全局 API
    this.whitelist = ["console", "setTimeout", "JSON", "Math", "Date", "parseInt", "parseFloat"];
  }

  createProxy() {
    const { fakeWindow, whitelist } = this;
    return new Proxy(fakeWindow, {
      get(target, key) {
        if (key in target) return target[key];
        if (whitelist.includes(key)) return globalThis[key];
        return undefined;
      },
      set(target, key, value) {
        target[key] = value;
        return true;
      },
      has() { return true; }, // 拦截所有变量查找
    });
  }

  exec(code) {
    const proxy = this.createProxy();
    // 使用 Function 构造器创建沙箱执行环境
    const fn = new Function("sandbox", `with(sandbox) { ${code} }`);
    try {
      fn(proxy);
      console.log(`  [${this.name}] 执行成功`);
    } catch (err) {
      console.log(`  [${this.name}] 执行错误: ${err.message}`);
    }
    return this.fakeWindow;
  }
}

const codeSandbox = new CodeSandbox("UserCode");
const result = codeSandbox.exec(`
  var x = 10;
  var y = 20;
  var sum = x + y;
  console.log("    沙箱内 sum = " + sum);
`);
console.log(`  沙箱内变量: x=${result.x}, y=${result.y}, sum=${result.sum}`);
console.log(`  全局隔离: globalThis.x = ${globalThis.x || "undefined"}`);

// ========== 4. 沙箱对比 ==========
console.log("\n4. 沙箱方案对比\n");
console.log(`
  ┌──────────────────┬───────────────────┬───────────────────┐
  │ 方案              │ 优点               │ 缺点              │
  ├──────────────────┼───────────────────┼───────────────────┤
  │ 快照沙箱         │ 实现简单           │ 仅支持单实例，慢  │
  │ Proxy 沙箱       │ 多实例并行         │ 需要 Proxy 支持   │
  │ with + Proxy     │ 完整代码隔离       │ 严格模式不支持    │
  │ iframe           │ 浏览器原生隔离     │ 通信不便，性能差  │
  │ ShadowRealm(提案)│ 标准化沙箱         │ 浏览器支持待定    │
  └──────────────────┴───────────────────┴───────────────────┘

  qiankun 沙箱机制:
  • 单实例模式 → LegacySandbox (快照)
  • 多实例模式 → ProxySandbox (推荐)
`);

console.log("=== JS 沙箱完成 ===");
