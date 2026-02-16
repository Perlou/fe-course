// Prettier 配置详解
// 本文件展示 Prettier 的完整配置和 ESLint 集成方案

console.log("=== Prettier 配置详解 ===\n");

// ========== 1. 完整配置选项 ==========
console.log("1. 完整 .prettierrc.js 配置");

const prettierConfig = {
  // --- 基础格式 ---
  printWidth: 80, // 每行最大字符数 (默认 80)
  tabWidth: 2, // 缩进空格数 (默认 2)
  useTabs: false, // 使用空格缩进 (默认 false)
  semi: true, // 句末分号 (默认 true)
  singleQuote: true, // 使用单引号 (默认 false)
  quoteProps: "as-needed", // 对象属性引号: as-needed | consistent | preserve

  // --- JSX ---
  jsxSingleQuote: false, // JSX 使用双引号 (默认 false)
  bracketSameLine: false, // JSX 标签 > 是否在最后一行 (默认 false)

  // --- 尾逗号 ---
  trailingComma: "es5", // es5 | none | all

  // --- 括号与空格 ---
  bracketSpacing: true, // 对象字面量空格: { a: 1 } vs {a: 1}
  arrowParens: "always", // 箭头函数参数括号: always | avoid

  // --- 其他 ---
  endOfLine: "lf", // 换行符: lf | crlf | cr | auto
  singleAttributePerLine: false, // HTML/JSX 每个属性独占一行
  htmlWhitespaceSensitivity: "css", // css | strict | ignore
  proseWrap: "preserve", // Markdown 换行: preserve | always | never
  embeddedLanguageFormatting: "auto", // 格式化嵌入代码 (如 JS in HTML)
};

console.log(JSON.stringify(prettierConfig, null, 2));

// ========== 2. 格式化效果对比 ==========
console.log("\n2. 格式化效果对比");

console.log(`
  ┌──────────────────┬───────────────────────────────────────────┐
  │ 配置项            │ 格式化效果                                  │
  ├──────────────────┼───────────────────────────────────────────┤
  │                  │                                           │
  │ semi: true       │ const a = 1;                              │
  │ semi: false      │ const a = 1                               │
  │                  │                                           │
  │ singleQuote:true │ const s = 'hello';                        │
  │ singleQuote:false│ const s = "hello";                        │
  │                  │                                           │
  │ trailingComma:   │                                           │
  │   "es5"          │ { a: 1, b: 2, }                           │
  │   "none"         │ { a: 1, b: 2 }                            │
  │   "all"          │ function(a, b,) { }                       │
  │                  │                                           │
  │ arrowParens:     │                                           │
  │   "always"       │ (x) => x                                  │
  │   "avoid"        │ x => x                                    │
  │                  │                                           │
  │ bracketSpacing:  │                                           │
  │   true           │ { a: 1 }                                  │
  │   false          │ {a: 1}                                    │
  │                  │                                           │
  └──────────────────┴───────────────────────────────────────────┘
`);

// ========== 3. .prettierignore ==========
console.log("3. .prettierignore 示例");

console.log(`
  # .prettierignore

  # 构建产物
  dist/
  build/
  .next/
  .nuxt/

  # 依赖
  node_modules/

  # Lock 文件
  pnpm-lock.yaml
  package-lock.json
  yarn.lock

  # 自动生成
  *.min.js
  *.min.css
  coverage/

  # 其他
  .env*
  *.svg
`);

// ========== 4. ESLint + Prettier 集成 ==========
console.log("4. ESLint + Prettier 集成");

console.log(`
  方案一: eslint-config-prettier (推荐)
  ──────────────────────────────────────
  只关闭冲突规则，Prettier 独立运行

  pnpm add -D eslint-config-prettier

  // .eslintrc.js
  {
    extends: [
      'eslint:recommended',
      'prettier'  // ⚠️ 必须放最后！
    ]
  }

  // 运行
  npx eslint . --fix     // 先 lint
  npx prettier --write . // 再格式化

  方案二: eslint-plugin-prettier
  ──────────────────────────────────────
  Prettier 作为 ESLint 规则运行，一次搞定

  pnpm add -D eslint-config-prettier eslint-plugin-prettier

  // .eslintrc.js
  {
    extends: ['plugin:prettier/recommended']
    // 等同于:
    // extends: ['prettier'],
    // plugins: ['prettier'],
    // rules: { 'prettier/prettier': 'error' }
  }

  // 运行
  npx eslint . --fix  // lint + 格式化一步到位
`);

// ========== 5. 编辑器集成 ==========
console.log("5. VS Code 集成");

console.log(`
  // .vscode/settings.json
  {
    // 保存时自动格式化
    "editor.formatOnSave": true,

    // 默认格式化工具
    "editor.defaultFormatter": "esbenp.prettier-vscode",

    // 针对特定语言
    "[javascript]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[typescript]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[typescriptreact]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[json]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[css]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[markdown]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },

    // ESLint 保存时自动修复
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit"
    },

    // ESLint 验证的语言
    "eslint.validate": [
      "javascript",
      "javascriptreact",
      "typescript",
      "typescriptreact",
      "vue"
    ]
  }

  // .vscode/extensions.json (推荐插件)
  {
    "recommendations": [
      "esbenp.prettier-vscode",
      "dbaeumer.vscode-eslint"
    ]
  }
`);

// ========== 6. 团队配置方案 ==========
console.log("6. 团队统一配置方案");

console.log(`
  推荐: 使用 EditorConfig + Prettier + ESLint 三层配置

  # .editorconfig (编辑器基础配置)
  root = true

  [*]
  charset = utf-8
  indent_style = space
  indent_size = 2
  end_of_line = lf
  insert_final_newline = true
  trim_trailing_whitespace = true

  [*.md]
  trim_trailing_whitespace = false

  ┌───────────────────────────────────────────────────────┐
  │  职责分工:                                              │
  │                                                        │
  │  EditorConfig → 编辑器基础设置 (编码、缩进、换行)         │
  │  Prettier     → 代码格式化 (引号、分号、对齐)            │
  │  ESLint       → 代码质量检查 (变量、类型、逻辑)          │
  │                                                        │
  │  三者互不冲突，各司其职                                  │
  └───────────────────────────────────────────────────────┘
`);

// ========== 7. 常用命令 ==========
console.log("7. 常用命令");

console.log(`
  # 格式化所有文件
  npx prettier --write .

  # 检查格式 (不修改)
  npx prettier --check .

  # 格式化特定文件
  npx prettier --write src/index.ts

  # 格式化特定类型
  npx prettier --write "**/*.{ts,tsx}"

  # 查看某个文件会如何格式化 (dry run)
  npx prettier --write --debug-check src/index.ts
`);

console.log("=== Prettier 配置完成 ===");
