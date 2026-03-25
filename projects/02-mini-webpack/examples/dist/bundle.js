/**
 * Mini Webpack Demo - 版权所有
 * 2026-03-25T01:35:42.601Z
 */
// ============================================
// 由 Mini Webpack 打包生成
// 生成时间: 2026-03-25T01:35:42.596Z
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
  return require(0);
})({

    // index.js (模块 0)
    0: [
      function(module, exports, require) {
        // 示例项目入口文件
        // 这个文件使用 ESM 语法，Mini Webpack 会将它转换为 CJS 并打包
        
        const greeting = require("./greeting").default || require("./greeting");
        const { add, multiply } = require("./utils/math");
        const config = require("./data.json").default || require("./data.json");
        require("./style.css");
        
        // 使用导入的模块
        console.log(greeting('Mini Webpack'));
        console.log(`加法: 2 + 3 = ${add(2, 3)}`);
        console.log(`乘法: 4 * 5 = ${multiply(4, 5)}`);
        console.log(`配置: ${config.name} v${config.version}`);
        console.log('🎉 打包成功！所有模块正常工作！');
        
      },
      {"./greeting":1,"./utils/math":2,"./data.json":3,"./style.css":4}
    ],

    // greeting.js (模块 1)
    1: [
      function(module, exports, require) {
        // 示例模块: 问候语
        
        function greeting(name) {
          return `👋 你好, ${name}!`;
        }
        
        module.exports.default = greeting;
        
      },
      {}
    ],

    // math.js (模块 2)
    2: [
      function(module, exports, require) {
        // 示例模块: 数学工具
        // 演示 named export
        
        function add(a, b) {
          return a + b;
        }
        
        function multiply(a, b) {
          return a * b;
        }
        
        const PI = 3.14159;
        
        module.exports.add = add;
        module.exports.multiply = multiply;
        module.exports.PI = PI;
      },
      {}
    ],

    // data.json (模块 3)
    3: [
      function(module, exports, require) {
        module.exports = {
          "name": "mini-webpack-demo",
          "version": "1.0.0",
          "description": "Mini Webpack 示例项目"
        };
      },
      {}
    ],

    // style.css (模块 4)
    4: [
      function(module, exports, require) {
        
        // CSS Module: style.css
        const css = `/* 示例 CSS 文件 */
        .app {
          font-family: sans-serif;
          color: #333;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
        }
        `;
        
        // 浏览器环境: 注入 <style> 标签
        if (typeof document !== 'undefined') {
          const style = document.createElement('style');
          style.textContent = css;
          document.head.appendChild(style);
        }
        
        module.exports = css;
        module.exports.default = css;
        
      },
      {}
    ]
});