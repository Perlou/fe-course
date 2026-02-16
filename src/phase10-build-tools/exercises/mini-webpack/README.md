# 手写 Mini Webpack 练习

## 📋 项目目标

实现一个简化版的 Webpack 打包器，理解模块打包的核心原理。

---

## 🏗️ 功能需求

### 核心功能

1. **解析模块**: 读取入口文件，解析 AST，提取 `import` 依赖
2. **构建依赖图**: 递归分析所有模块，构建完整依赖关系图
3. **代码转换**: 使用 Babel 将 ES6+ 转换为 ES5
4. **打包输出**: 生成自执行函数，包含所有模块的 bundle

### 打包流程

```
入口文件 (src/index.js)
    ↓
解析 AST → 提取 import 语句 → 收集依赖
    ↓
递归分析每个依赖文件
    ↓
构建完整的依赖图 (Module Graph)
    ↓
使用 Babel 转换每个模块的代码 (ESM → CJS)
    ↓
拼接生成 bundle.js (IIFE 自执行函数)
    ↓
输出到 dist/bundle.js
```

---

## 📂 项目结构

```
mini-webpack/
├── package.json
├── bundler.js           # 核心打包器
├── src/
│   ├── index.js         # 入口文件
│   ├── greeting.js      # 模块 A
│   └── utils.js         # 模块 B (被 A 依赖)
└── dist/
    └── bundle.js        # 打包输出
```

---

## 🔧 实现步骤

### Step 1: 创建测试模块

```javascript
// src/utils.js
export function add(a, b) {
  return a + b;
}

export const PI = 3.14159;
```

```javascript
// src/greeting.js
import { add } from "./utils.js";

export function greet(name) {
  const result = add(1, 2);
  return `Hello ${name}, 1 + 2 = ${result}`;
}
```

```javascript
// src/index.js
import { greet } from "./greeting.js";
import { PI } from "./utils.js";

console.log(greet("World"));
console.log("PI =", PI);
```

### Step 2: 安装依赖

```bash
npm init -y
npm install @babel/parser @babel/traverse @babel/core @babel/preset-env
```

### Step 3: 实现模块分析

```javascript
// bundler.js
const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const babel = require("@babel/core");

let moduleId = 0;

// 分析单个模块
function analyzeModule(filename) {
  const content = fs.readFileSync(filename, "utf-8");

  // 1. 解析为 AST
  const ast = parser.parse(content, {
    sourceType: "module",
  });

  // 2. 收集依赖
  const dependencies = [];
  traverse(ast, {
    ImportDeclaration({ node }) {
      dependencies.push(node.source.value);
    },
  });

  // 3. 转换代码 (ESM → CJS)
  const { code } = babel.transformFromAstSync(ast, null, {
    presets: ["@babel/preset-env"],
  });

  return {
    id: moduleId++,
    filename,
    dependencies,
    code,
  };
}
```

### Step 4: 构建依赖图

```javascript
function buildGraph(entry) {
  const entryModule = analyzeModule(entry);
  const graph = [entryModule];

  // BFS 遍历所有依赖
  for (const module of graph) {
    const dirname = path.dirname(module.filename);
    module.mapping = {}; // 依赖路径 → 模块 ID

    module.dependencies.forEach((relativePath) => {
      const absolutePath = path.resolve(dirname, relativePath);
      const depModule = analyzeModule(absolutePath);
      module.mapping[relativePath] = depModule.id;
      graph.push(depModule);
    });
  }

  return graph;
}
```

### Step 5: 生成 Bundle

```javascript
function bundle(graph) {
  let modules = "";

  graph.forEach((mod) => {
    modules += `
      ${mod.id}: [
        function(require, module, exports) {
          ${mod.code}
        },
        ${JSON.stringify(mod.mapping)}
      ],`;
  });

  const result = `
    (function(modules) {
      function require(id) {
        const [fn, mapping] = modules[id];

        // 创建局部 require 函数
        function localRequire(relativePath) {
          return require(mapping[relativePath]);
        }

        const module = { exports: {} };
        fn(localRequire, module, module.exports);
        return module.exports;
      }

      // 从入口模块开始执行
      require(0);
    })({${modules}})
  `;

  return result;
}

// 执行打包
const graph = buildGraph("./src/index.js");
const output = bundle(graph);

// 写入文件
fs.mkdirSync("./dist", { recursive: true });
fs.writeFileSync("./dist/bundle.js", output);

console.log("✅ 打包完成! 输出: dist/bundle.js");
```

### Step 6: 运行验证

```bash
# 打包
node bundler.js

# 运行产物
node dist/bundle.js

# 期望输出:
# Hello World, 1 + 2 = 3
# PI = 3.14159
```

---

## ✅ 验收标准

1. [ ] `node bundler.js` 能正确打包
2. [ ] `node dist/bundle.js` 能正确输出结果
3. [ ] 理解 AST 解析的作用
4. [ ] 理解依赖图的构建过程
5. [ ] 理解运行时 `require` 函数的实现原理
6. [ ] 能画出模块间的依赖关系图

---

## 🌟 进阶挑战

- [ ] 支持循环依赖检测
- [ ] 添加简单的 Loader 机制 (如 CSS Loader)
- [ ] 添加简单的 Plugin 机制 (如 emit 钩子)
- [ ] 支持 `export default` 语法
- [ ] 实现 watch 模式 (文件变化自动重新打包)
- [ ] 生成 source map
