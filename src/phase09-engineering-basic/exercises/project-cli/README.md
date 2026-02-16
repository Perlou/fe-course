# 项目脚手架 CLI 练习

## 📋 项目目标

创建一个简易的项目脚手架 CLI 工具，类似 `create-vite`、`create-next-app`，能够通过命令行交互式创建标准化的前端项目。

---

## 🏗️ 功能需求

### 核心功能

1. **交互式命令行**: 通过提问收集项目配置
2. **模板生成**: 根据选择生成项目文件
3. **工程化配置**: 自动配置 ESLint + Prettier + Husky

### 交互流程

```
$ create-my-app

? 项目名称: my-project
? 选择框架: (React / Vue / Vanilla)
? 使用 TypeScript? (Y/n)
? 包管理器: (pnpm / npm / yarn)
? 初始化 Git? (Y/n)

✅ 项目创建成功！

  cd my-project
  pnpm install
  pnpm dev
```

---

## 📂 参考目录结构

```
project-cli/
├── package.json
├── bin/
│   └── cli.js              # CLI 入口 (#!/usr/bin/env node)
├── src/
│   ├── index.js             # 主逻辑
│   ├── prompts.js           # 交互式提问
│   ├── generator.js         # 文件生成器
│   └── utils.js             # 工具函数
└── templates/
    ├── base/                # 基础模板 (共用)
    │   ├── .eslintrc.js
    │   ├── .prettierrc.js
    │   ├── .gitignore
    │   └── README.md
    ├── react/               # React 模板
    │   ├── src/
    │   │   ├── App.jsx
    │   │   └── main.jsx
    │   ├── index.html
    │   └── vite.config.js
    ├── vue/                 # Vue 模板
    │   ├── src/
    │   │   ├── App.vue
    │   │   └── main.js
    │   ├── index.html
    │   └── vite.config.js
    └── vanilla/             # 原生模板
        ├── src/
        │   └── main.js
        └── index.html
```

---

## 🔧 技术提示

### 1. 推荐依赖

```json
{
  "bin": {
    "create-my-app": "./bin/cli.js"
  },
  "dependencies": {
    "inquirer": "^9.0.0",
    "chalk": "^5.0.0",
    "ora": "^7.0.0",
    "fs-extra": "^11.0.0",
    "ejs": "^3.1.0"
  }
}
```

| 库       | 用途             |
| -------- | ---------------- |
| inquirer | 交互式命令行提示 |
| chalk    | 终端文字着色     |
| ora      | 加载动画         |
| fs-extra | 增强的文件操作   |
| ejs      | 模板引擎         |

### 2. CLI 入口

```javascript
#!/usr/bin/env node
// bin/cli.js

import { createApp } from "../src/index.js";

createApp().catch(console.error);
```

### 3. 交互式提问 (inquirer 示例)

```javascript
// src/prompts.js
import inquirer from "inquirer";

export async function getProjectConfig() {
  return inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "项目名称:",
      default: "my-project",
      validate: (input) => {
        if (/^[a-z0-9-]+$/.test(input)) return true;
        return "项目名只能包含小写字母、数字和连字符";
      },
    },
    {
      type: "list",
      name: "framework",
      message: "选择框架:",
      choices: ["react", "vue", "vanilla"],
    },
    {
      type: "confirm",
      name: "typescript",
      message: "使用 TypeScript?",
      default: true,
    },
    {
      type: "list",
      name: "packageManager",
      message: "包管理器:",
      choices: ["pnpm", "npm", "yarn"],
    },
    {
      type: "confirm",
      name: "gitInit",
      message: "初始化 Git?",
      default: true,
    },
  ]);
}
```

### 4. 文件生成器

```javascript
// src/generator.js
import fs from "fs-extra";
import path from "path";
import ejs from "ejs";

export async function generateProject(config) {
  const { projectName, framework, typescript } = config;
  const targetDir = path.resolve(process.cwd(), projectName);

  // 1. 创建目录
  await fs.ensureDir(targetDir);

  // 2. 复制基础模板
  const baseDir = path.resolve(__dirname, "../templates/base");
  await fs.copy(baseDir, targetDir);

  // 3. 复制框架模板
  const frameworkDir = path.resolve(__dirname, `../templates/${framework}`);
  await fs.copy(frameworkDir, targetDir);

  // 4. 生成 package.json
  const packageJson = {
    name: projectName,
    version: "0.1.0",
    private: true,
    type: "module",
    scripts: {
      dev: "vite --open",
      build: typescript ? "tsc && vite build" : "vite build",
      preview: "vite preview",
      lint: "eslint . --fix",
      format: "prettier --write .",
      prepare: "husky",
    },
  };

  await fs.writeJSON(path.join(targetDir, "package.json"), packageJson, {
    spaces: 2,
  });
}
```

---

## ✅ 验收标准

1. [ ] 运行 `node bin/cli.js` 可以交互式创建项目
2. [ ] 生成的项目包含完整的工程化配置 (ESLint + Prettier)
3. [ ] 生成的项目可以通过 `pnpm install && pnpm dev` 正常运行
4. [ ] 支持至少 2 种框架模板
5. [ ] 代码结构清晰，函数职责单一

---

## 🌟 进阶挑战

- [ ] 添加 `--template` 参数支持非交互式创建
- [ ] 支持从远程仓库下载模板 (如 GitHub)
- [ ] 添加 husky + commitlint 自动配置
- [ ] 发布到 npm (通过 `npx create-my-app` 使用)
- [ ] 添加彩色 ASCII Logo 和进度条
