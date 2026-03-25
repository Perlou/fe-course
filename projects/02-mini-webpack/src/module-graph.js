/**
 * Mini Webpack - 模块依赖图
 *
 * 职责: 从入口出发，递归分析所有依赖，构建完整的模块图 (DAG)
 * 原理: BFS/DFS 遍历，每个模块记录其 ID、代码、依赖映射
 */

const fs = require("fs");
const path = require("path");
const Parser = require("./parser");

let moduleId = 0;

class ModuleGraph {
  /**
   * @param {Object} options
   * @param {string} options.entry - 入口文件路径
   * @param {Object[]} [options.loaders] - Loader 配置
   */
  constructor(options) {
    this.entry = path.resolve(options.entry);
    this.loaders = options.loaders || [];
    this.parser = new Parser();
    this.modules = new Map(); // filePath → module
  }

  /**
   * 构建依赖图
   * @returns {Object[]} 模块数组
   */
  build() {
    moduleId = 0;
    this.modules.clear();
    this._addModule(this.entry);
    return Array.from(this.modules.values());
  }

  /**
   * 递归添加模块
   */
  _addModule(filePath) {
    // 避免循环依赖
    if (this.modules.has(filePath)) {
      return this.modules.get(filePath);
    }

    // 解析文件路径 (补全扩展名)
    const resolvedPath = this._resolve(filePath);
    if (!resolvedPath) {
      throw new Error(`[mini-webpack] 模块未找到: ${filePath}`);
    }

    // 读取源文件
    let source = fs.readFileSync(resolvedPath, "utf-8");
    const originalSource = source; // 保留原始源码 (Source Map 需要)

    // 应用 Loader 转换 (Loader 先于 Parser 执行)
    const isLoaderTransformed = this._hasMatchingLoader(resolvedPath);
    if (isLoaderTransformed) {
      source = this._applyLoaders(resolvedPath, source);
    }

    // 解析依赖并转换代码
    const { code, dependencies } = this.parser.parse(source);

    // 创建模块对象
    const mod = {
      id: moduleId++,
      filePath: resolvedPath,
      originalSource,  // 原始源码 (供 Source Map 使用)
      code,
      dependencies: [],
      depMapping: {},
    };

    this.modules.set(resolvedPath, mod);

    // 递归处理依赖
    const dir = path.dirname(resolvedPath);
    dependencies.forEach((dep) => {
      const depPath = this._resolve(path.resolve(dir, dep));
      if (depPath) {
        const depMod = this._addModule(depPath);
        mod.dependencies.push({ source: dep, resolvedPath: depPath });
        mod.depMapping[dep] = depMod.id;
      }
    });

    return mod;
  }

  /**
   * 检查是否有匹配的 Loader
   */
  _hasMatchingLoader(filePath) {
    return this.loaders.some((loader) => loader.test.test(filePath));
  }

  /**
   * 解析文件路径，支持省略扩展名
   */
  _resolve(filePath) {
    if (fs.existsSync(filePath)) return filePath;

    const extensions = [".js", ".json", ".css"];
    for (const ext of extensions) {
      const withExt = filePath + ext;
      if (fs.existsSync(withExt)) return withExt;
    }

    const indexPath = path.join(filePath, "index.js");
    if (fs.existsSync(indexPath)) return indexPath;

    return null;
  }

  /**
   * 应用 Loader 链式转换 (从右到左)
   */
  _applyLoaders(filePath, source) {
    const matchingLoaders = this.loaders.filter((loader) =>
      loader.test.test(filePath)
    );

    let result = source;
    for (const loader of matchingLoaders.reverse()) {
      const loaderFn =
        typeof loader.use === "function" ? loader.use : require(loader.use);
      result = loaderFn(result, filePath);
    }

    return result;
  }

  /**
   * 打印依赖图
   */
  print() {
    console.log("\n📦 模块依赖图:");
    console.log("─".repeat(50));
    for (const [, mod] of this.modules) {
      const deps = mod.dependencies.map((d) => path.basename(d.resolvedPath));
      const depsStr = deps.length > 0 ? ` → [${deps.join(", ")}]` : "";
      console.log(`  [${mod.id}] ${path.basename(mod.filePath)}${depsStr}`);
    }
    console.log("─".repeat(50));
  }
}

module.exports = ModuleGraph;
