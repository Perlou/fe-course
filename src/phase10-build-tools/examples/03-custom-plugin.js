// 自定义 Webpack Plugin 详解
// 本文件展示如何编写自定义 Plugin
// 运行: node 03-custom-plugin.js

console.log("=== 自定义 Webpack Plugin ===\n");

// ========== 1. Plugin 基础 ==========
console.log("1. Plugin 本质");

console.log(`
  Plugin 本质: 一个带有 apply 方法的 class
  通过 Webpack 的 Tapable 钩子系统参与构建流程

  class MyPlugin {
    constructor(options) {
      this.options = options;
    }
    apply(compiler) {
      // compiler: Webpack 编译器实例
      // compiler.hooks: 可用的生命周期钩子
      compiler.hooks.done.tap('MyPlugin', (stats) => {
        console.log('构建完成!');
      });
    }
  }
`);

// ========== 2. 模拟 Tapable 钩子系统 ==========
console.log("2. Tapable 钩子系统模拟");

// 简化版 Tapable
class SyncHook {
  constructor() {
    this.taps = [];
  }
  tap(name, fn) {
    this.taps.push({ name, fn });
  }
  call(...args) {
    this.taps.forEach(({ fn }) => fn(...args));
  }
}

class AsyncSeriesHook {
  constructor() {
    this.taps = [];
  }
  tapAsync(name, fn) {
    this.taps.push({ name, fn, type: "async" });
  }
  tapPromise(name, fn) {
    this.taps.push({ name, fn, type: "promise" });
  }
  async callAsync(...args) {
    const callback = args.pop();
    for (const { fn, type } of this.taps) {
      if (type === "async") {
        await new Promise((resolve) => fn(...args, resolve));
      } else {
        await fn(...args);
      }
    }
    callback();
  }
}

console.log(`
  Tapable 钩子类型:
  ┌──────────────────┬────────────────────────────────────────┐
  │ SyncHook          │ 同步串行，无返回值                      │
  │ SyncBailHook      │ 同步串行，返回非 undefined 时中断       │
  │ SyncWaterfallHook │ 同步串行，上一个返回值传给下一个         │
  │ AsyncSeriesHook   │ 异步串行                               │
  │ AsyncParallelHook │ 异步并行                               │
  └──────────────────┴────────────────────────────────────────┘
`);

// ========== 3. 模拟 Compiler ==========
class MockCompiler {
  constructor() {
    this.hooks = {
      entryOption: new SyncHook(),
      compile: new SyncHook(),
      compilation: new SyncHook(),
      make: new AsyncSeriesHook(),
      emit: new AsyncSeriesHook(),
      afterEmit: new AsyncSeriesHook(),
      done: new SyncHook(),
    };
    this.options = {};
    this.outputPath = "./dist";
  }
}

class MockCompilation {
  constructor() {
    this.assets = {};
    this.chunks = [];
    this.modules = [];
  }

  getAssets() {
    return Object.entries(this.assets).map(([name, info]) => ({
      name,
      source: info.source(),
      size: info.size(),
    }));
  }
}

// ========== 4. 实战 Plugin 1: 构建信息生成 ==========
console.log("3. Plugin 示例: 构建信息生成");

class BuildInfoPlugin {
  constructor(options = {}) {
    this.filename = options.filename || "build-info.json";
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync("BuildInfoPlugin", (compilation, callback) => {
      const info = {
        buildTime: new Date().toISOString(),
        assets: compilation.getAssets().map((a) => ({
          name: a.name,
          size: a.size,
        })),
        nodeVersion: process.version,
      };

      const content = JSON.stringify(info, null, 2);

      compilation.assets[this.filename] = {
        source: () => content,
        size: () => content.length,
      };

      console.log(`  [BuildInfoPlugin] 生成 ${this.filename}`);
      callback();
    });
  }
}

// 测试
const compiler1 = new MockCompiler();
const buildInfoPlugin = new BuildInfoPlugin({ filename: "build-info.json" });
buildInfoPlugin.apply(compiler1);

const compilation1 = new MockCompilation();
compilation1.assets["main.js"] = {
  source: () => 'console.log("hello")',
  size: () => 22,
};

compiler1.hooks.emit.callAsync(compilation1, () => {
  console.log("  生成的信息:", JSON.parse(compilation1.assets["build-info.json"].source()));
});

// ========== 5. Plugin 2: 文件大小报告 ==========
console.log("\n4. Plugin 示例: 文件大小报告");

class FileSizeReportPlugin {
  constructor(options = {}) {
    this.sizeLimit = options.sizeLimit || 250 * 1024; // 默认 250KB
  }

  apply(compiler) {
    compiler.hooks.done.tap("FileSizeReportPlugin", (stats) => {
      console.log("\n  📊 文件大小报告:");
      console.log("  " + "─".repeat(50));

      const assets = stats.assets || [];
      let totalSize = 0;

      assets.forEach(({ name, size }) => {
        totalSize += size;
        const sizeStr = this.formatSize(size);
        const warning = size > this.sizeLimit ? " ⚠️ 超过限制!" : "";
        console.log(`  ${name.padEnd(30)} ${sizeStr.padStart(10)}${warning}`);
      });

      console.log("  " + "─".repeat(50));
      console.log(`  总计: ${this.formatSize(totalSize)}`);
    });
  }

  formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  }
}

// 测试
const compiler2 = new MockCompiler();
const sizePlugin = new FileSizeReportPlugin({ sizeLimit: 100 * 1024 });
sizePlugin.apply(compiler2);

compiler2.hooks.done.call({
  assets: [
    { name: "main.a1b2c3.js", size: 85 * 1024 },
    { name: "vendor.d4e5f6.js", size: 220 * 1024 },
    { name: "style.g7h8.css", size: 15 * 1024 },
  ],
});

// ========== 6. Plugin 3: 清理旧文件 ==========
console.log("\n5. Plugin 示例: HTML 资源注入");

console.log(`
  class InjectAssetsPlugin {
    apply(compiler) {
      compiler.hooks.compilation.tap('InjectAssetsPlugin', (compilation) => {
        // 在 HTML 处理钩子中注入资源
        HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
          'InjectAssetsPlugin',
          (data, cb) => {
            // 注入自定义标签
            data.html = data.html.replace(
              '</head>',
              '<link rel="preconnect" href="https://cdn.example.com">\\n</head>'
            );
            cb(null, data);
          }
        );
      });
    }
  }
`);

// ========== 7. Plugin 4: 构建耗时分析 ==========
console.log("6. Plugin 示例: 构建耗时分析");

class BuildTimingPlugin {
  apply(compiler) {
    const timings = {};

    compiler.hooks.compile.tap("BuildTimingPlugin", () => {
      timings.compileStart = Date.now();
      console.log("  ⏱️ 编译开始...");
    });

    compiler.hooks.done.tap("BuildTimingPlugin", () => {
      timings.done = Date.now();
      const total = timings.done - timings.compileStart;
      console.log(`  ⏱️ 编译完成! 总耗时: ${total}ms`);
    });
  }
}

// 测试
const compiler3 = new MockCompiler();
new BuildTimingPlugin().apply(compiler3);

compiler3.hooks.compile.call();
// 模拟编译耗时
setTimeout(() => {
  compiler3.hooks.done.call({});
}, 50);

// ========== 8. Webpack 生命周期钩子一览 ==========
setTimeout(() => {
  console.log("\n7. Webpack 核心钩子一览");

  console.log(`
  Compiler 钩子 (全局，只编译一次):
  ┌──────────────────┬──────────────────────────────────────┐
  │ entryOption      │ 入口配置处理后                         │
  │ beforeRun        │ 开始运行前                             │
  │ run              │ 开始运行                               │
  │ beforeCompile    │ 编译参数准备好后                        │
  │ compile          │ 开始编译                               │
  │ thisCompilation  │ 创建 compilation (不可继承)             │
  │ compilation      │ 创建 compilation                      │
  │ make             │ 开始构建模块                            │
  │ afterCompile     │ 编译结束                               │
  │ emit             │ 输出文件到 output 前 ⭐                │
  │ afterEmit        │ 输出文件后                             │
  │ done             │ 全部完成 ⭐                            │
  └──────────────────┴──────────────────────────────────────┘

  Compilation 钩子 (每次编译，watch 会多次):
  ┌──────────────────┬──────────────────────────────────────┐
  │ buildModule      │ 构建模块前                             │
  │ succeedModule    │ 模块构建成功                            │
  │ seal             │ 封装资源                               │
  │ optimize         │ 优化阶段                               │
  │ optimizeChunks   │ 优化 chunks                            │
  │ afterSeal        │ 封装结束                               │
  └──────────────────┴──────────────────────────────────────┘
  `);

  console.log("=== 自定义 Plugin 完成 ===");
}, 100);
