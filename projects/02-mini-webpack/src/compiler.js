/**
 * Mini Webpack - 编译器
 *
 * 职责: 编排整个构建流程，集成 Plugin 钩子系统
 * 原理: 类似 Webpack 的 Compiler，在关键节点触发钩子
 *
 * 构建流程:
 *   beforeRun → run → compile → afterCompile → emit → done
 */

const fs = require("fs");
const path = require("path");
const ModuleGraph = require("./module-graph");
const Bundler = require("./bundler");
const SourceMapGenerator = require("./source-map");

class Compiler {
  /**
   * @param {Object} config - 配置对象 (类似 webpack.config.js)
   */
  constructor(config) {
    this.config = config;
    this.entry = config.entry;
    this.output = config.output || { path: "./dist", filename: "bundle.js" };
    this.loaders = config.module?.rules || [];
    this.plugins = config.plugins || [];

    // 钩子系统 (简易版 Tapable)
    this.hooks = {
      beforeRun: [],
      run: [],
      compile: [],
      afterCompile: [],
      emit: [],
      done: [],
    };

    // 注册插件
    this.plugins.forEach((plugin) => {
      if (typeof plugin.apply === "function") {
        plugin.apply(this);
      }
    });
  }

  /**
   * 注册钩子
   * @param {string} hookName
   * @param {Function} fn
   */
  tap(hookName, fn) {
    if (this.hooks[hookName]) {
      this.hooks[hookName].push(fn);
    }
  }

  /**
   * 触发钩子
   * @param {string} hookName
   * @param  {...any} args
   */
  _callHook(hookName, ...args) {
    if (this.hooks[hookName]) {
      this.hooks[hookName].forEach((fn) => fn(...args));
    }
  }

  /**
   * 执行编译
   */
  run() {
    const startTime = Date.now();

    console.log("\n🔨 Mini Webpack 开始构建...\n");

    // 1. beforeRun
    this._callHook("beforeRun", this);

    // 2. run
    this._callHook("run", this);

    // 3. compile - 构建模块依赖图
    this._callHook("compile", this);

    const graph = new ModuleGraph({
      entry: this.entry,
      loaders: this.loaders,
    });

    const modules = graph.build();
    graph.print();

    // 4. afterCompile
    this._callHook("afterCompile", {
      modules,
      moduleCount: modules.length,
    });

    // 5. 生成 bundle
    const bundler = new Bundler();
    let bundleCode = bundler.generate(modules, 0);

    // 5.5 生成 Source Map
    const devtool = this.config.devtool;
    if (devtool) {
      const smGen = new SourceMapGenerator();
      const { sourceMap, bundleWithComment } = smGen.generate(
        modules, bundleCode, this.output.filename
      );
      bundleCode = bundleWithComment;
      // 将 .map 文件加入输出资产
      this._sourceMap = sourceMap;
    }

    // 6. emit - 写入文件前
    const outputPath = path.resolve(this.output.path);
    const outputFile = path.join(outputPath, this.output.filename);

    const assets = {
      [this.output.filename]: bundleCode,
    };

    // 添加 Source Map 到输出
    if (this._sourceMap) {
      assets[this.output.filename + '.map'] = JSON.stringify(this._sourceMap, null, 2);
    }

    this._callHook("emit", {
      assets,
      outputPath,
    });

    // 确保输出目录存在
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    // 写入文件
    bundleCode = assets[this.output.filename]; // 插件可能修改了内容
    fs.writeFileSync(outputFile, bundleCode, "utf-8");

    // 写入 Source Map 文件
    if (assets[this.output.filename + '.map']) {
      const mapFile = path.join(outputPath, this.output.filename + '.map');
      fs.writeFileSync(mapFile, assets[this.output.filename + '.map'], 'utf-8');
      console.log(`   Source Map: ${mapFile}`);
    }

    const duration = Date.now() - startTime;
    const size = Buffer.byteLength(bundleCode, "utf-8");

    console.log(`\n✅ 构建完成!`);
    console.log(`   输出: ${outputFile}`);
    console.log(`   大小: ${(size / 1024).toFixed(2)} KB`);
    console.log(`   耗时: ${duration}ms`);
    console.log(`   模块: ${modules.length} 个\n`);

    // 7. done
    this._callHook("done", {
      outputFile,
      size,
      duration,
      moduleCount: modules.length,
    });

    return { outputFile, bundleCode };
  }
}

module.exports = Compiler;
