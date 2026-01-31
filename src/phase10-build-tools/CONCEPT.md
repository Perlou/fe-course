# 构建工具深入解析

## 📌 一、Webpack 核心概念

### 1. 核心架构

```
┌─────────────────────────────────────────────────────────────┐
│                     Webpack 构建流程                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  配置读取                                                    │
│     ↓                                                       │
│  Entry (入口)                                               │
│     ↓                                                       │
│  依赖图分析 (Module Graph)                                   │
│     ↓                                                       │
│  Loader 转换                                                │
│     ↓                                                       │
│  Plugin 处理                                                │
│     ↓                                                       │
│  Output (输出)                                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. 基本配置

```javascript
// webpack.config.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  // 模式
  mode: "development", // development | production

  // 入口
  entry: "./src/index.js",
  // 多入口
  entry: {
    main: "./src/index.js",
    admin: "./src/admin.js",
  },

  // 输出
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].js",
    clean: true,
  },

  // 模块规则
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },

  // 插件
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
  ],

  // 开发服务器
  devServer: {
    static: "./dist",
    hot: true,
    port: 3000,
  },

  // 解析配置
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
};
```

---

## 📌 二、Loader 机制

### 1. Loader 执行顺序

```
rule.use: ['style-loader', 'css-loader', 'sass-loader']

执行顺序: 从右到左，从下到上

sass-loader: .scss → CSS
     ↓
css-loader: CSS → JS 模块
     ↓
style-loader: 注入 DOM
```

### 2. 自定义 Loader

```javascript
// my-loader.js
module.exports = function (source) {
  // source: 文件内容字符串

  // 同步 Loader
  return source.replace(/console\.log\(.*?\);?/g, "");

  // 或使用 this.callback
  this.callback(null, transformedSource, sourcemap);
};

// 异步 Loader
module.exports = function (source) {
  const callback = this.async();

  someAsyncOperation(source)
    .then((result) => {
      callback(null, result);
    })
    .catch((err) => {
      callback(err);
    });
};

// Loader 上下文
module.exports = function (source) {
  const options = this.getOptions(); // 获取配置
  const resourcePath = this.resourcePath; // 文件路径

  // 添加文件监听
  this.addDependency(filePath);

  return source;
};
```

### 3. 常用 Loader

```
┌─────────────────┬────────────────────────────────────────────┐
│     Loader      │                    用途                    │
├─────────────────┼────────────────────────────────────────────┤
│ babel-loader    │ ES6+ → ES5                                │
│ ts-loader       │ TypeScript → JavaScript                   │
│ css-loader      │ 解析 CSS 中的 @import 和 url()            │
│ style-loader    │ 将 CSS 注入 DOM                           │
│ sass-loader     │ Sass → CSS                                │
│ postcss-loader  │ CSS 后处理（autoprefixer 等）             │
│ file-loader     │ 处理文件资源                               │
│ url-loader      │ 小文件转 base64                           │
│ raw-loader      │ 将文件作为字符串导入                       │
│ vue-loader      │ 处理 .vue 文件                            │
└─────────────────┴────────────────────────────────────────────┘
```

---

## 📌 三、Plugin 机制

### 1. Webpack 生命周期

```
┌─────────────────────────────────────────────────────────────┐
│                    Webpack 编译流程                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  初始化阶段:                                                 │
│    entryOption → afterPlugins → afterResolvers              │
│                                                             │
│  编译阶段:                                                   │
│    beforeRun → run → beforeCompile → compile                │
│    → thisCompilation → compilation                          │
│                                                             │
│  构建阶段:                                                   │
│    make → buildModule → seal → afterCompile                 │
│                                                             │
│  输出阶段:                                                   │
│    emit → afterEmit → done                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. 自定义 Plugin

```javascript
// my-plugin.js
class MyPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    // 同步钩子
    compiler.hooks.compile.tap("MyPlugin", (params) => {
      console.log("Compiling...");
    });

    // 异步钩子
    compiler.hooks.emit.tapAsync("MyPlugin", (compilation, callback) => {
      // compilation: 当前编译对象
      // compilation.assets: 输出的资源

      const content = "// Build info";
      compilation.assets["build-info.txt"] = {
        source: () => content,
        size: () => content.length,
      };

      callback();
    });

    // Promise 钩子
    compiler.hooks.done.tapPromise("MyPlugin", async (stats) => {
      await doSomethingAsync();
    });
  }
}

module.exports = MyPlugin;
```

### 3. 常用钩子

```javascript
compiler.hooks.entryOption; // 入口配置
compiler.hooks.compile; // 开始编译
compiler.hooks.compilation; // 创建 compilation
compiler.hooks.make; // 分析依赖
compiler.hooks.emit; // 输出文件前
compiler.hooks.afterEmit; // 输出文件后
compiler.hooks.done; // 编译完成

compilation.hooks.buildModule; // 构建模块
compilation.hooks.seal; // 封装资源
compilation.hooks.optimize; // 优化
```

---

## 📌 四、构建优化

### 1. 构建速度优化

```javascript
// 1. 缩小文件搜索范围
resolve: {
  extensions: ['.js', '.jsx'],  // 减少扩展名尝试
  alias: { '@': path.resolve('src') },
  modules: ['node_modules']
},
module: {
  rules: [
    {
      test: /\.js$/,
      include: path.resolve('src'),  // 只处理 src
      exclude: /node_modules/
    }
  ]
}

// 2. 多线程/缓存
{
  loader: 'babel-loader',
  options: {
    cacheDirectory: true  // 启用缓存
  }
}

// 3. DLL 预编译
// 将不常变化的库单独打包

// 4. 持久化缓存 (Webpack 5)
cache: {
  type: 'filesystem'
}
```

### 2. 产物体积优化

```javascript
// 1. 代码分割
optimization: {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendors: {
        test: /[\\/]node_modules[\\/]/,
        priority: -10
      },
      default: {
        minChunks: 2,
        priority: -20,
        reuseExistingChunk: true
      }
    }
  }
}

// 2. Tree Shaking
optimization: {
  usedExports: true,  // 标记未使用的导出
  minimize: true      // 压缩时删除
}
// 配合 package.json: "sideEffects": false

// 3. 动态导入
import(/* webpackChunkName: "chart" */ './chart.js')

// 4. 压缩
optimization: {
  minimize: true,
  minimizer: [
    new TerserPlugin({
      parallel: true
    }),
    new CssMinimizerPlugin()
  ]
}
```

---

## 📌 五、Vite 原理

### 1. 开发模式

```
┌─────────────────────────────────────────────────────────────┐
│                     Vite 开发模式                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 启动开发服务器（毫秒级）                                  │
│     • 不需要打包，直接启动                                   │
│                                                             │
│  2. 预构建依赖（esbuild）                                    │
│     • 将 CommonJS/UMD 转为 ESM                              │
│     • 合并小模块，减少请求                                   │
│                                                             │
│  3. 按需编译                                                 │
│     • 浏览器请求时才编译                                     │
│     • 利用浏览器原生 ESM                                     │
│                                                             │
│  4. HMR 热更新                                              │
│     • 基于 ESM 的精确更新                                    │
│     • 只更新变化的模块                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

浏览器请求:
/src/main.js → Vite → 转换 → 返回 ES Module
```

### 2. 生产模式

```
生产构建使用 Rollup:
  • Tree Shaking
  • 代码分割
  • 压缩优化
  • 传统浏览器兼容 (@vitejs/plugin-legacy)
```

### 3. Vite 配置

```javascript
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": "/src",
    },
  },

  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
        },
      },
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/styles/variables.scss";',
      },
    },
  },
});
```

---

## 📌 六、手写 Mini Webpack

```javascript
const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const babel = require("@babel/core");

// 1. 分析单个模块
function analyzeModule(filename) {
  const content = fs.readFileSync(filename, "utf-8");

  // 解析 AST
  const ast = parser.parse(content, {
    sourceType: "module",
  });

  // 收集依赖
  const dependencies = [];
  traverse(ast, {
    ImportDeclaration({ node }) {
      dependencies.push(node.source.value);
    },
  });

  // 转换代码
  const { code } = babel.transformFromAstSync(ast, null, {
    presets: ["@babel/preset-env"],
  });

  return { filename, dependencies, code };
}

// 2. 构建依赖图
function buildGraph(entry) {
  const entryModule = analyzeModule(entry);
  const graph = [entryModule];

  for (const module of graph) {
    const dirname = path.dirname(module.filename);
    module.mapping = {};

    module.dependencies.forEach((dep) => {
      const absolutePath = path.resolve(dirname, dep);
      module.mapping[dep] = absolutePath;
      graph.push(analyzeModule(absolutePath));
    });
  }

  return graph;
}

// 3. 生成代码
function bundle(graph) {
  let modules = "";

  graph.forEach((mod) => {
    modules += `
      "${mod.filename}": [
        function(require, module, exports) {
          ${mod.code}
        },
        ${JSON.stringify(mod.mapping)}
      ],
    `;
  });

  return `
    (function(modules) {
      function require(id) {
        const [fn, mapping] = modules[id];
        
        function localRequire(name) {
          return require(mapping[name]);
        }
        
        const module = { exports: {} };
        fn(localRequire, module, module.exports);
        
        return module.exports;
      }
      
      require("${graph[0].filename}");
    })({${modules}})
  `;
}

// 使用
const graph = buildGraph("./src/index.js");
const output = bundle(graph);
fs.writeFileSync("./dist/bundle.js", output);
```

---

## 📌 七、Babel

### 1. Babel 工作原理

```
源代码 → Parse (解析) → AST → Transform (转换) → AST → Generate (生成) → 目标代码
```

### 2. 配置

```javascript
// babel.config.js
module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: "> 0.25%, not dead",
        useBuiltIns: "usage",
        corejs: 3,
      },
    ],
    "@babel/preset-typescript",
    "@babel/preset-react",
  ],
  plugins: ["@babel/plugin-transform-runtime"],
};
```

### 3. 自定义 Babel 插件

```javascript
module.exports = function (babel) {
  const { types: t } = babel;

  return {
    visitor: {
      // 移除 console.log
      CallExpression(path) {
        if (
          t.isMemberExpression(path.node.callee) &&
          t.isIdentifier(path.node.callee.object, { name: "console" }) &&
          t.isIdentifier(path.node.callee.property, { name: "log" })
        ) {
          path.remove();
        }
      },
    },
  };
};
```

---

## 📚 推荐学习资源

| 资源             | 链接              |
| ---------------- | ----------------- |
| Webpack 官方文档 | webpack.js.org    |
| Vite 官方文档    | vitejs.dev        |
| Babel 官方文档   | babeljs.io        |
| esbuild          | esbuild.github.io |

---
