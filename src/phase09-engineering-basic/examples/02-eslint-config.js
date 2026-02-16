// ESLint 配置详解
// 本文件展示不同场景的 ESLint 配置方案
// 可直接作为 .eslintrc.js 使用或参考

console.log("=== ESLint 配置详解 ===\n");

// ========== 1. 基础 JavaScript 项目配置 ==========
const basicConfig = {
  root: true, // 停止向上查找配置
  env: {
    browser: true, // 浏览器全局变量 (window, document)
    node: true, // Node.js 全局变量 (process, __dirname)
    es2022: true, // ES2022 全局变量 (Promise, Map 等)
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module", // 使用 ES Modules
  },
  extends: [
    "eslint:recommended", // ESLint 推荐规则
  ],
  rules: {
    "no-console": "warn", // console.log 警告
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }], // 未使用变量
    "no-debugger": "error", // 禁止 debugger
    eqeqeq: ["error", "always"], // 强制 ===
    "no-var": "error", // 禁止 var
    "prefer-const": "warn", // 优先 const
  },
};

console.log("1. 基础配置:");
console.log(JSON.stringify(basicConfig, null, 2).substring(0, 200) + "...\n");

// ========== 2. TypeScript + React 项目配置 ==========
const tsReactConfig = {
  root: true,
  env: { browser: true, es2022: true },

  // TypeScript 解析器
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
    project: "./tsconfig.json", // 启用 type-aware 规则
  },

  // 插件
  plugins: ["@typescript-eslint", "react", "react-hooks", "import"],

  // 预设配置
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier", // ⚠️ 必须放最后！关闭和 Prettier 冲突的规则
  ],

  // 自定义规则
  rules: {
    // TypeScript 规则
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/prefer-optional-chain": "warn",
    "@typescript-eslint/no-non-null-assertion": "warn",

    // React 规则
    "react/react-in-jsx-scope": "off", // React 17+ 不需要导入 React
    "react/prop-types": "off", // TypeScript 已有类型检查
    "react/self-closing-comp": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // Import 规则
    "import/order": [
      "warn",
      {
        groups: [
          "builtin", // Node.js 内置模块
          "external", // 第三方模块
          "internal", // 内部模块 (路径别名)
          "parent", // 父级目录
          "sibling", // 同级目录
          "index", // 当前目录的 index
        ],
        "newlines-between": "always", // 组之间空行
        alphabetize: { order: "asc" }, // 字母排序
      },
    ],
    "import/no-duplicates": "warn",
  },

  // 设置
  settings: {
    react: { version: "detect" },
    "import/resolver": {
      typescript: { project: "./tsconfig.json" },
    },
  },
};

console.log("2. TypeScript + React 配置: (完整配置见源代码)\n");

// ========== 3. Vue 项目配置 ==========
const vueConfig = {
  root: true,
  env: { browser: true, es2022: true },
  parser: "vue-eslint-parser", // Vue SFC 解析器
  parserOptions: {
    parser: "@typescript-eslint/parser", // <script> 中用 TS 解析器
    ecmaVersion: "latest",
    sourceType: "module",
  },
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-recommended", // Vue 3 推荐
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  rules: {
    "vue/multi-word-component-names": "off",
    "vue/no-v-html": "warn", // XSS 警告
  },
};

console.log("3. Vue 项目配置: (完整配置见源代码)\n");

// ========== 4. ESLint Flat Config (新格式，v9+) ==========
console.log("4. ESLint Flat Config (eslint.config.js)");

console.log(`
  // eslint.config.js (ESLint 9+ 新格式)
  import js from '@eslint/js';
  import tsPlugin from '@typescript-eslint/eslint-plugin';
  import tsParser from '@typescript-eslint/parser';
  import reactPlugin from 'eslint-plugin-react';
  import prettierConfig from 'eslint-config-prettier';

  export default [
    // 全局忽略
    { ignores: ['dist/', 'node_modules/', '*.min.js'] },

    // 基础配置
    js.configs.recommended,

    // TypeScript 文件
    {
      files: ['**/*.{ts,tsx}'],
      languageOptions: {
        parser: tsParser,
        parserOptions: {
          project: './tsconfig.json',
        },
      },
      plugins: {
        '@typescript-eslint': tsPlugin,
      },
      rules: {
        ...tsPlugin.configs.recommended.rules,
        '@typescript-eslint/no-unused-vars': 'warn',
      },
    },

    // React JSX 文件
    {
      files: ['**/*.{jsx,tsx}'],
      plugins: { react: reactPlugin },
      rules: {
        'react/react-in-jsx-scope': 'off',
      },
      settings: { react: { version: 'detect' } },
    },

    // Prettier 放最后
    prettierConfig,
  ];
`);

// ========== 5. 常用规则速查 ==========
console.log("5. 常用规则速查");

console.log(`
  ┌─────────────────────────────┬──────────┬─────────────────────────────┐
  │ 规则                         │ 推荐值    │ 说明                        │
  ├─────────────────────────────┼──────────┼─────────────────────────────┤
  │ no-console                  │ warn     │ 生产代码不应有 console       │
  │ no-debugger                 │ error    │ 禁止 debugger               │
  │ no-unused-vars              │ warn     │ 未使用变量                   │
  │ eqeqeq                     │ error    │ 强制 === 和 !==              │
  │ no-var                      │ error    │ 禁止 var                    │
  │ prefer-const                │ warn     │ 优先 const                  │
  │ no-multiple-empty-lines     │ warn     │ 最多 1 个空行                │
  │ curly                       │ error    │ if/else 必须加花括号         │
  │ no-eval                     │ error    │ 禁止 eval                   │
  │ no-implied-eval             │ error    │ 禁止隐式 eval               │
  └─────────────────────────────┴──────────┴─────────────────────────────┘

  // 行内禁用
  // eslint-disable-next-line no-console
  console.log('允许这一行');

  /* eslint-disable no-console */
  console.log('这个区块都允许');
  /* eslint-enable no-console */
`);

// ========== 6. 安装命令汇总 ==========
console.log("6. 安装命令汇总");

console.log(`
  # 基础 JavaScript 项目
  pnpm add -D eslint

  # TypeScript 项目
  pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

  # React 项目
  pnpm add -D eslint-plugin-react eslint-plugin-react-hooks

  # Vue 项目
  pnpm add -D eslint-plugin-vue vue-eslint-parser

  # Import 排序
  pnpm add -D eslint-plugin-import eslint-import-resolver-typescript

  # 和 Prettier 集成
  pnpm add -D eslint-config-prettier eslint-plugin-prettier

  # 初始化 (交互式)
  npx eslint --init
`);

console.log("=== ESLint 配置完成 ===");
