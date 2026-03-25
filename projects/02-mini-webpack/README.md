# ⚡ Mini Webpack

> 从零实现一个简易版 Webpack，理解模块打包的核心原理

## 📖 项目简介

Mini Webpack 是一个零外部依赖的模块打包器，用纯 Node.js 实现了 Webpack 的核心功能：

- ✅ **依赖分析** — 正则解析 import/require，构建模块依赖图
- ✅ **ESM→CJS 转换** — 将 import/export 转换为 require/module.exports
- ✅ **代码打包** — 生成 IIFE bundle，内置 require 运行时
- ✅ **Loader 机制** — 链式源码转换 (CSS/JSON 示例)
- ✅ **Plugin 机制** — 钩子系统 (Banner/BundleSize 示例)

## 🚀 快速开始

```bash
# 打包示例项目
node src/index.js

# 运行打包结果
node examples/dist/bundle.js

# 输出:
# 👋 你好, Mini Webpack!
# 加法: 2 + 3 = 5
# 乘法: 4 * 5 = 20
# 配置: mini-webpack-demo v1.0.0
# 🎉 打包成功！所有模块正常工作！
```

## 📂 目录结构

```
02-mini-webpack/
├── README.md                       # 说明文档
├── package.json
├── mini-webpack.config.js           # 配置文件
├── src/
│   ├── index.js                     # CLI 入口
│   ├── compiler.js                  # 编译器 (Plugin 钩子生命周期)
│   ├── parser.js                    # 解析器 (依赖提取 + ESM→CJS)
│   ├── module-graph.js              # 模块依赖图 (DAG)
│   ├── bundler.js                   # 打包器 (IIFE 生成)
│   ├── loaders/
│   │   ├── css-loader.js            # CSS → JS 模块
│   │   └── json-loader.js           # JSON → module.exports
│   └── plugins/
│       ├── banner-plugin.js         # 注释横幅插件
│       └── bundle-size-plugin.js    # 模块大小统计插件
└── examples/
    ├── mini-webpack.config.js → ../mini-webpack.config.js
    └── src/
        ├── index.js                 # 入口 (ESM imports)
        ├── greeting.js              # default export
        ├── utils/math.js            # named exports
        ├── data.json                # JSON 数据
        └── style.css                # CSS 样式
```

## 🔍 核心原理

### 构建流程

```
                    ┌────────────────────────────┐
                    │       mini-webpack.config   │
                    └──────────┬─────────────────┘
                               │
                    ┌──────────▼─────────────────┐
                    │     Compiler (编译器)        │
                    │     ├── beforeRun Hook      │
                    │     ├── run Hook            │
                    │     ├── compile Hook        │
                    │     │                       │
               ┌────┤     │  ModuleGraph          │
               │    │     │  (依赖图构建)          │
               │    │     │                       │
               │    │     ├── afterCompile Hook   │
          Loaders   │     │                       │
          (源码     │     │  Bundler              │
           转换)    │     │  (生成 IIFE)           │
               │    │     │                       │
               └────┤     ├── emit Hook           │
                    │     └── done Hook           │
                    └──────────┬─────────────────┘
                               │
                    ┌──────────▼─────────────────┐
                    │     dist/bundle.js          │
                    └────────────────────────────┘
```

### 打包产物结构

```javascript
(function(modules) {
  var cache = {};

  function require(id) {
    if (cache[id]) return cache[id].exports;
    var module = cache[id] = { exports: {} };
    var [factory, depMapping] = modules[id];

    function localRequire(path) {
      return require(depMapping[path]);
    }

    factory(module, module.exports, localRequire);
    return module.exports;
  }

  require(0); // 从入口开始
})({
  0: [function(module, exports, require) { /* 入口模块 */ }, {"./foo": 1}],
  1: [function(module, exports, require) { /* foo 模块 */ }, {}],
});
```

## 🧩 Loader 机制

Loader 是源码转换函数，接收源码字符串，返回转换后的字符串：

```javascript
// 自定义 Loader
function myLoader(source, filePath) {
  return source.replace(/console\.log/g, '// removed');
}

// 配置
module: {
  rules: [
    { test: /\.js$/, use: myLoader },
  ]
}
```

## 🔌 Plugin 机制

Plugin 通过 `apply` 方法注册钩子：

```javascript
class MyPlugin {
  apply(compiler) {
    compiler.tap('emit', ({ assets }) => {
      // 在输出前修改 bundle
      Object.keys(assets).forEach(name => {
        assets[name] = '/* processed */\n' + assets[name];
      });
    });
  }
}
```

**可用钩子**: `beforeRun` → `run` → `compile` → `afterCompile` → `emit` → `done`

## 📚 对照学习

| Mini Webpack | Webpack 真实实现 |
|---|---|
| `parser.js` 正则提取 | `acorn` AST 解析 |
| `module-graph.js` DFS | `ModuleGraph` + `NormalModule` |
| `bundler.js` 字符串拼接 | `Template` + `RuntimeTemplate` |
| `compiler.tap()` | `Tapable` 库 |
| CSS/JSON Loader | `css-loader`, `json-loader` |
| Banner Plugin | `BannerPlugin` |

---

> 💡 这个项目覆盖了 Phase 9 (工程化基础) 和 Phase 10 (构建工具) 的核心知识点
