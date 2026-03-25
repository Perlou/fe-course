/**
 * Mini Webpack - 打包器
 *
 * 职责: 将模块图生成为单个可执行的 bundle 文件
 * 原理:
 *   1. 生成 IIFE (立即执行函数)
 *   2. 内置 require 运行时
 *   3. 将每个模块包裹在函数中，注入 module/exports/require
 *   4. 从入口模块开始执行
 *
 * 这就是 Webpack 打包后代码的简化版本！
 */

const path = require("path");

class Bundler {
  /**
   * 生成 bundle 代码
   * @param {Object[]} modules - 模块数组 (来自 ModuleGraph)
   * @param {number} entryId - 入口模块 ID
   * @returns {string} bundle 代码
   */
  generate(modules, entryId = 0) {
    // 构建模块注册表
    const moduleEntries = modules
      .map((mod) => {
        // 将模块代码包裹在函数中
        // 函数签名: function(module, exports, require)
        const depMapping = JSON.stringify(mod.depMapping);
        return `
    // ${path.basename(mod.filePath)} (模块 ${mod.id})
    ${mod.id}: [
      function(module, exports, require) {
${this._indentCode(mod.code, 8)}
      },
      ${depMapping}
    ]`;
      })
      .join(",\n");

    // 生成 IIFE + require 运行时
    const bundle = `
// ============================================
// 由 Mini Webpack 打包生成
// 生成时间: ${new Date().toISOString()}
// ============================================
(function(modules) {
  // 模块缓存 (已加载的模块)
  var installedModules = {};

  // require 运行时
  // 这就是 Webpack 的 __webpack_require__!
  function require(moduleId) {
    // 检查缓存
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }

    // 创建模块对象
    var module = installedModules[moduleId] = {
      id: moduleId,
      loaded: false,
      exports: {}
    };

    // 获取模块工厂函数和依赖映射
    var [factory, depMapping] = modules[moduleId];

    // 创建本地 require 函数 (解析相对路径 → 模块ID)
    function localRequire(relativePath) {
      var depId = depMapping[relativePath];
      if (depId === undefined) {
        throw new Error('模块未找到: ' + relativePath);
      }
      return require(depId);
    }

    // 执行模块代码
    factory(module, module.exports, localRequire);
    module.loaded = true;

    return module.exports;
  }

  // 从入口模块开始执行
  return require(${entryId});
})({
${moduleEntries}
});
`.trim();

    return bundle;
  }

  /**
   * 缩进代码
   */
  _indentCode(code, spaces) {
    const indent = " ".repeat(spaces);
    return code
      .split("\n")
      .map((line) => indent + line)
      .join("\n");
  }
}

module.exports = Bundler;
