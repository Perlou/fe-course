# 前端工程化基础

## 📌 一、模块化发展史

### 1. 发展历程

```
全局变量时代 → IIFE → CommonJS → AMD → UMD → ES Modules
      │           │        │        │      │        │
    问题:       解决:     Node    浏览器  兼容    现代标准
    污染       闭包隔离    标准    异步   方案
```

### 2. 各规范对比

```javascript
// 1. 全局变量（问题：命名冲突）
var myLib = { ... };

// 2. IIFE（立即执行函数）
var myLib = (function() {
  var private = 'hidden';
  return {
    public: function() { return private; }
  };
})();

// 3. CommonJS（Node.js）
// 同步加载，服务端
// module.js
module.exports = { name: 'module' };
exports.fn = function() {};

// main.js
const module = require('./module');

// 4. AMD（异步模块定义）
// 浏览器端，异步加载
define(['dep1', 'dep2'], function(dep1, dep2) {
  return { ... };
});

// 5. UMD（通用模块定义）
// 兼容 CommonJS 和 AMD
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['dep'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('dep'));
  } else {
    root.myLib = factory(root.dep);
  }
})(this, function(dep) {
  return { ... };
});

// 6. ES Modules（现代标准）
// 静态分析，Tree Shaking
export const PI = 3.14;
export default function() {}

import { PI } from './math.js';
import fn from './module.js';
```

### 3. CommonJS vs ES Modules

```
┌─────────────────┬──────────────────┬──────────────────┐
│                 │    CommonJS      │    ES Modules    │
├─────────────────┼──────────────────┼──────────────────┤
│ 加载时机        │ 运行时           │ 编译时           │
│ 导出值          │ 值的拷贝         │ 值的引用         │
│ 顶层 this       │ 当前模块         │ undefined        │
│ Tree Shaking   │ ❌               │ ✅               │
│ 循环引用        │ 返回已执行部分   │ 正常（引用）     │
│ 使用场景        │ Node.js          │ 浏览器/Node.js   │
└─────────────────┴──────────────────┴──────────────────┘
```

---

## 📌 二、包管理器

### 1. npm / yarn / pnpm 对比

```
┌─────────────────┬──────────┬──────────┬──────────────┐
│                 │   npm    │   yarn   │    pnpm      │
├─────────────────┼──────────┼──────────┼──────────────┤
│ 安装速度        │ 慢       │ 较快     │ 最快         │
│ 磁盘空间        │ 大       │ 大       │ 小（硬链接） │
│ 依赖结构        │ 扁平     │ 扁平     │ 非扁平       │
│ 幽灵依赖        │ ✅ 存在  │ ✅ 存在  │ ❌ 不存在    │
│ Monorepo       │ workspace│ workspace│ workspace    │
│ Lock 文件      │ package-lock.json │ yarn.lock │ pnpm-lock.yaml │
└─────────────────┴──────────┴──────────┴──────────────┘
```

### 2. 常用命令

```bash
# 初始化项目
npm init -y
yarn init -y
pnpm init

# 安装依赖
npm install lodash
yarn add lodash
pnpm add lodash

# 安装开发依赖
npm install -D eslint
yarn add -D eslint
pnpm add -D eslint

# 全局安装
npm install -g typescript
yarn global add typescript
pnpm add -g typescript

# 运行脚本
npm run dev
yarn dev
pnpm dev

# 更新依赖
npm update
yarn upgrade
pnpm update

# 查看过时依赖
npm outdated
yarn outdated
pnpm outdated
```

### 3. package.json 配置

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "description": "项目描述",
  "main": "dist/index.js", // CommonJS 入口
  "module": "dist/index.esm.js", // ES Module 入口
  "types": "dist/index.d.ts", // TypeScript 类型
  "exports": {
    // 现代入口配置
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.cjs.js"
    }
  },
  "files": ["dist"], // 发布的文件
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --fix",
    "test": "vitest",
    "prepare": "husky install"
  },
  "dependencies": {
    "lodash": "^4.17.21" // ^ 兼容更新
  },
  "devDependencies": {
    "typescript": "~5.0.0" // ~ 补丁更新
  },
  "peerDependencies": {
    // 宿主环境依赖
    "react": "^18.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 4. 版本号规范

```
语义化版本: major.minor.patch

major: 不兼容的 API 变更
minor: 向后兼容的功能新增
patch: 向后兼容的问题修复

版本范围:
^1.2.3  →  >=1.2.3 <2.0.0  (兼容版本)
~1.2.3  →  >=1.2.3 <1.3.0  (补丁版本)
1.2.3   →  精确版本
*       →  任意版本
>=1.0.0 →  大于等于
```

---

## 📌 三、ESLint

### 1. 基本配置

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier", // 放最后，关闭冲突规则
  ],
  plugins: ["@typescript-eslint", "react", "react-hooks"],
  rules: {
    "no-console": "warn",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "react/react-in-jsx-scope": "off",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
```

### 2. 自定义规则

```javascript
// 规则配置值
'off' or 0    // 关闭规则
'warn' or 1   // 警告
'error' or 2  // 错误

// 带选项
'semi': ['error', 'always']
'quotes': ['error', 'single', { avoidEscape: true }]
```

### 3. 忽略文件

```
# .eslintignore
node_modules/
dist/
build/
*.min.js
```

---

## 📌 四、Prettier

### 1. 基本配置

```javascript
// .prettierrc.js
module.exports = {
  printWidth: 80, // 每行最大字符数
  tabWidth: 2, // 缩进空格数
  useTabs: false, // 使用空格缩进
  semi: true, // 句末分号
  singleQuote: true, // 单引号
  quoteProps: "as-needed", // 对象属性引号
  jsxSingleQuote: false, // JSX 使用双引号
  trailingComma: "es5", // 尾逗号 (es5/none/all)
  bracketSpacing: true, // 对象字面量空格 { a: 1 }
  bracketSameLine: false, // JSX 标签闭合在同一行
  arrowParens: "always", // 箭头函数参数括号 (always/avoid)
  endOfLine: "lf", // 换行符
};
```

### 2. 忽略文件

```
# .prettierignore
node_modules/
dist/
pnpm-lock.yaml
```

### 3. ESLint + Prettier 集成

```bash
# 安装
pnpm add -D eslint-config-prettier eslint-plugin-prettier

# .eslintrc.js
{
  extends: [
    // ... 其他配置
    'plugin:prettier/recommended'  // 必须放最后
  ]
}
```

---

## 📌 五、Git Hooks

### 1. Husky 配置

```bash
# 安装
pnpm add -D husky

# 初始化
pnpm exec husky install

# 添加 prepare 脚本
npm pkg set scripts.prepare="husky install"

# 添加 pre-commit hook
npx husky add .husky/pre-commit "pnpm lint-staged"

# 添加 commit-msg hook
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

### 2. lint-staged 配置

```javascript
// .lintstagedrc.js
module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write'
  ],
  '*.{css,scss,less}': [
    'prettier --write'
  ],
  '*.{json,md}': [
    'prettier --write'
  ]
};

// 或 package.json
{
  "lint-staged": {
    "*.{js,ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

### 3. Commitlint 配置

```javascript
// commitlint.config.js
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // 新功能
        "fix", // 修复
        "docs", // 文档
        "style", // 格式（不影响代码运行）
        "refactor", // 重构
        "perf", // 性能优化
        "test", // 测试
        "chore", // 构建/工具
        "revert", // 回滚
        "ci", // CI 配置
      ],
    ],
    "subject-case": [0],
  },
};
```

### 4. Commit 规范

```
<type>(<scope>): <subject>

<body>

<footer>

示例:
feat(auth): 添加用户登录功能

- 实现邮箱密码登录
- 添加记住密码功能
- 集成 JWT token

Closes #123
```

---

## 📌 六、完整项目配置示例

```
project/
├── .husky/
│   ├── pre-commit
│   └── commit-msg
├── .eslintrc.js
├── .eslintignore
├── .prettierrc.js
├── .prettierignore
├── .lintstagedrc.js
├── commitlint.config.js
├── package.json
└── tsconfig.json
```

```bash
# 一键配置脚本
pnpm add -D eslint prettier typescript \
  @typescript-eslint/eslint-plugin @typescript-eslint/parser \
  eslint-config-prettier eslint-plugin-prettier \
  husky lint-staged @commitlint/cli @commitlint/config-conventional
```

---

## 📚 推荐学习资源

| 资源                 | 链接                     |
| -------------------- | ------------------------ |
| ESLint               | eslint.org               |
| Prettier             | prettier.io              |
| Husky                | typicode.github.io/husky |
| Conventional Commits | conventionalcommits.org  |

---
