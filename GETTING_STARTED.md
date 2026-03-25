# 🚀 新手入门指南

> 本文档帮助你了解如何运行课程中的每一段代码。

---

## 📋 前置准备

在开始之前，请确保你的电脑已安装以下工具：

```bash
# 1. Node.js (建议 v18+)
node -v      # 检查版本

# 2. npm (随 Node.js 自动安装)
npm -v

# 3. Git
git -v

# 4. 代码编辑器 (推荐 VS Code)
code --version
```

**安装方式：**

- **Node.js**: 官网 https://nodejs.org 下载 LTS 版本
- **Git**: 官网 https://git-scm.com 下载
- **VS Code**: 官网 https://code.visualstudio.com 下载

---

## 📂 课件代码运行方式 (src/)

课件代码按文件类型分为三种运行方式：

### 🟢 方式一：浏览器直接打开 (HTML 文件)

适用于 **Phase 1-2** (HTML/CSS) 和 **Phase 4** (DOM/BOM) 的 `.html` 文件。

```bash
# 直接用浏览器打开
open src/phase01-html/examples/01-document-structure.html   # macOS
# 或者用 VS Code 的 Live Server 插件 (推荐)
```

> **💡 推荐安装 VS Code 插件 [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)**
> 安装后，右键 HTML 文件 → "Open with Live Server"，代码修改后浏览器自动刷新。

**涉及阶段：**

| 阶段 | 文件 | 打开方式 |
|------|------|---------|
| Phase 1 HTML | `01-document-structure.html` 等 7 个 | 浏览器打开 |
| Phase 2 CSS | `01-selectors.html` 等 5 个 | 浏览器打开 |
| Phase 4 DOM/BOM | `01-dom-query.html` 等 5 个 | 浏览器打开 |

---

### 🟡 方式二：Node.js 直接运行 (JS 文件)

适用于 **Phase 3, 5, 7-24** 的 `.js` 文件。

```bash
# 进入对应目录，用 node 运行
node src/phase03-javascript/examples/01-variables.js

# 示例输出：
# === JavaScript 变量与类型 ===
# 1. 基础类型:
#   string: hello (typeof: string)
#   number: 42 (typeof: number)
#   ...
```

**常用命令速查：**

```bash
# Phase 3: JavaScript 核心
node src/phase03-javascript/examples/01-variables.js
node src/phase03-javascript/examples/02-scope.js
node src/phase03-javascript/examples/03-closure.js
node src/phase03-javascript/examples/04-prototype.js
node src/phase03-javascript/examples/05-this.js
node src/phase03-javascript/examples/06-event-loop.js
node src/phase03-javascript/examples/07-promise.js

# Phase 5: ES6+
node src/phase05-es6plus/examples/01-let-const.js
node src/phase05-es6plus/examples/07-proxy.js

# Phase 7: 浏览器原理
node src/phase07-browser/examples/01-performance-api.js

# Phase 8: 网络
node src/phase08-network/examples/01-fetch-api.js

# Phase 10: 构建工具
node src/phase10-build-tools/examples/01-webpack-config.js

# Phase 11-15: 框架
node src/phase11-react-core/examples/02-virtual-dom.js
node src/phase13-vue-core/examples/01-reactivity.js
node src/phase15-state-management/examples/01-redux-concepts.js

# Phase 16-18: 全栈
node src/phase16-nodejs/examples/01-event-loop.js
node src/phase17-database/examples/01-sql-basics.js

# Phase 19-24: 架构与图形
node src/phase20-micro-frontend/examples/01-js-sandbox.js
node src/phase22-canvas-svg/examples/01-canvas-bindbs.js
node src/phase24-webgpu-wasm/examples/01-webgpu-bindbs.js
```

---

### 🔵 方式三：TypeScript 运行 (TS 文件)

适用于 **Phase 6** (TypeScript) 的 `.ts` 文件。

```bash
# 使用 npx tsx (无需全局安装 TypeScript)
npx tsx src/phase06-typescript/examples/01-basic-types.ts
npx tsx src/phase06-typescript/examples/02-interfaces.ts
npx tsx src/phase06-typescript/examples/03-generics.ts
npx tsx src/phase06-typescript/examples/04-advanced-types.ts
npx tsx src/phase06-typescript/examples/05-utility-types.ts

# 也可以用 ts-node
npx ts-node src/phase06-typescript/examples/01-basic-types.ts
```

---

## 🛠️ 实战项目运行方式 (projects/)

### ① 待办事项应用 (`01-todo-app`)

**技术**: 纯 HTML/CSS/JS，无需安装依赖

```bash
# 方式1: 直接打开
open projects/01-todo-app/index.html

# 方式2: 使用 Live Server (推荐)
npx -y live-server projects/01-todo-app
# → 自动打开浏览器 http://127.0.0.1:8080
```

---

### ② Mini Webpack (`02-mini-webpack`)

**技术**: 纯 Node.js，零外部依赖

```bash
cd projects/02-mini-webpack

# 打包示例项目
node src/index.js
# → 输出 examples/dist/bundle.js 和 bundle.js.map

# 运行打包结果
node examples/dist/bundle.js
# → 👋 你好, Mini Webpack!
# → 加法: 2 + 3 = 5
# → 🎉 打包成功！
```

---

### ③ Mini React (`03-mini-react`)

**技术**: 纯 Node.js，零外部依赖

```bash
cd projects/03-mini-react

# 运行完整演示
node examples/demo.js
# → 演示 createElement、Fiber 构建、Diff 算法、Hooks 等
```

---

### ④ 全栈博客系统 (`04-blog-system`)

**技术**: Node.js HTTP 服务器 + React 前端

```bash
cd projects/04-blog-system

# 启动服务器
node src/app.js
# → http://localhost:3000 (包含前端 SPA)

# 也可以先运行功能演示 (不启动服务器)
node examples/demo.js
# → 演示注册、登录、发文、评论等 API 调用
```

打开浏览器访问 `http://localhost:3000`：
- 首页查看文章列表
- 点击「登录」注册账号
- 点击「写文章」发表 Markdown 文章
- 退出服务器：在终端按 `Ctrl + C`

---

### ⑤ 微前端容器 (`05-micro-frontend`)

**技术**: 零依赖微前端框架 + 自定义 HTTP 服务器

```bash
cd projects/05-micro-frontend

# 方式1: 运行演示 (核心原理验证)
node examples/demo.js
# → 演示沙箱隔离、状态同步、生命周期

# 方式2: 启动完整应用 (主应用 + 子应用)
node server.js
# → http://localhost:8080 (主应用)
# → http://localhost:8081 (子应用 React)
# → http://localhost:8082 (子应用 Vue)
```

---

### ⑥ 3D 产品展示 (`06-3d-showcase`)

**技术**: Three.js + GSAP + Vite

```bash
cd projects/06-3d-showcase

# 首次运行需安装依赖
npm install

# 启动开发服务器
npm run dev
# → http://localhost:3000
```

打开浏览器后你可以：
- 🖱️ 拖拽旋转 3D 耳机模型
- 🎨 切换 4 种颜色 (哑光黑/银色/玫瑰金/午夜蓝)
- 💥 点击「爆炸图」查看零部件分离动画
- 📌 查看热点标注的产品参数
- 退出：在终端按 `Ctrl + C`

---

## ❓ 常见问题

### Q: `node` 命令提示 "command not found"

你还没有安装 Node.js。请前往 https://nodejs.org 下载安装 LTS 版本。

### Q: 运行 HTML 文件时样式/JS 没生效

不要直接双击打开 HTML 文件（`file://` 协议有跨域限制）。请使用：

```bash
# 任选其一：
npx -y live-server .         # 在项目目录运行
npx -y http-server .         # 更简单的替代品
```

### Q: `npm install` 很慢

设置国内镜像源：

```bash
npm config set registry https://registry.npmmirror.com
```

### Q: TypeScript 文件报错 "Cannot find module"

TS 示例文件是独立的教学代码，不需要 `npm install`，直接用 `npx tsx` 运行即可。

### Q: 端口被占用 "EADDRINUSE"

```bash
# 查找占用端口的进程 (以 3000 端口为例)
lsof -i :3000

# 终止进程
kill -9 <PID>
```

---

## 📖 学习建议

1. **按阶段顺序学习**：先读 `CONCEPT.md` 理解概念，再看 `examples/` 代码
2. **亲手运行**：每个示例都要在本地运行一遍，观察输出
3. **修改实验**：在示例基础上做修改，看看会发生什么
4. **完成练习**：每个阶段的 `exercises/` 是实操作业，检验学习成果
5. **做实战项目**：`projects/` 下的项目是对所学知识的综合运用

---

> 📝 如有其它问题，可在 Issues 中提问。祝学习愉快！
