# 🛠️ 实战项目指南

> **定位**：贯穿全课程的 6 大实战项目  
> **目标**：通过项目驱动学习，巩固知识点，积累实战经验

---

## 📊 项目总览

| 阶段                 | 项目名称       | 核心技术        | 难度       |
| :------------------- | :------------- | :-------------- | :--------- |
| 第一部分：前端基础   | 待办事项应用   | HTML/CSS/JS/DOM | ⭐⭐       |
| 第二部分：前端进阶   | Mini Webpack   | TS/AST/工程化   | ⭐⭐⭐     |
| 第三部分：主流框架   | Mini React/Vue | Fiber/响应式    | ⭐⭐⭐⭐   |
| 第四部分：全栈能力   | 全栈博客系统   | Node/DB/SSR     | ⭐⭐⭐⭐   |
| 第五部分：前端架构   | 微前端容器     | 沙箱/通信/调度  | ⭐⭐⭐⭐⭐ |
| 第六部分：图形可视化 | 3D 产品展示    | Three.js/WebGL  | ⭐⭐⭐⭐⭐ |

---

## 🎯 项目一：待办事项应用 (Todo App)

**阶段**：第一部分 - 前端基础 (Phase 1-5)

### 项目描述

使用原生 HTML/CSS/JavaScript 实现一个功能完整的待办事项应用，综合运用前端基础知识。

### 功能要求

- [ ] 添加/编辑/删除任务
- [ ] 任务状态切换（完成/未完成）
- [ ] 筛选任务（全部/进行中/已完成）
- [ ] 本地存储持久化
- [ ] 响应式布局
- [ ] 主题切换（深色/浅色）

### 技术要点

| 知识点           | 应用场景     |
| :--------------- | :----------- |
| HTML5 语义化     | 页面结构     |
| CSS Flexbox/Grid | 布局设计     |
| CSS 变量         | 主题切换     |
| DOM 操作         | 任务增删改   |
| 事件委托         | 列表点击处理 |
| localStorage     | 数据持久化   |
| ES6+ 模块        | 代码组织     |

### 目录结构

```
projects/01-todo-app/
├── README.md
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── storage.js
│   └── utils.js
└── assets/
```

---

## ⚡ 项目二：Mini Webpack

**阶段**：第二部分 - 前端进阶 (Phase 6-10)

### 项目描述

从零实现一个简易版 Webpack，理解模块打包的核心原理。

### 功能要求

- [ ] 依赖分析与模块图构建
- [ ] CommonJS/ESM 模块转换
- [ ] 代码打包生成
- [ ] 基础 Loader 机制
- [ ] 基础 Plugin 机制
- [ ] Source Map 支持

### 技术要点

| 知识点      | 应用场景       |
| :---------- | :------------- |
| TypeScript  | 项目开发       |
| AST (babel) | 代码解析       |
| 依赖图      | 模块关系分析   |
| 代码转换    | ESM → CommonJS |
| Tapable     | 插件系统       |
| Node.js fs  | 文件系统操作   |

### 目录结构

```
projects/02-mini-webpack/
├── README.md
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts         # 入口
│   ├── compiler.ts      # 编译器
│   ├── parser.ts        # 解析器
│   ├── bundler.ts       # 打包器
│   ├── loaders/
│   └── plugins/
├── examples/
└── tests/
```

---

## ⚛️ 项目三：Mini React / Mini Vue

**阶段**：第三部分 - 主流框架 (Phase 11-15)

### 项目描述

从零实现一个简易版 React 或 Vue，深入理解框架核心原理。

### Mini React 功能要求

- [ ] JSX 转换
- [ ] 虚拟 DOM
- [ ] Fiber 架构
- [ ] Reconciliation Diff
- [ ] 基础 Hooks（useState、useEffect）
- [ ] 合成事件系统

### Mini Vue 功能要求

- [ ] 响应式系统（Proxy）
- [ ] 虚拟 DOM
- [ ] 模板编译器
- [ ] Diff 算法
- [ ] 组合式 API（ref、reactive）
- [ ] 生命周期

### 技术要点

| 知识点    | React 应用    | Vue 应用          |
| :-------- | :------------ | :---------------- |
| 虚拟 DOM  | createElement | h 函数            |
| Diff 算法 | Fiber 链表    | 双端 Diff         |
| 状态管理  | Hooks         | 响应式            |
| 调度      | 时间切片      | 依赖收集          |
| 编译      | JSX → JS      | Template → Render |

### 目录结构

```
projects/03-mini-react/          # 或 03-mini-vue/
├── README.md
├── package.json
├── src/
│   ├── index.js
│   ├── createElement.js   # / h.js
│   ├── fiber.js           # / reactive.js
│   ├── reconciler.js      # / renderer.js
│   ├── hooks.js           # / composition.js
│   └── scheduler.js       # / compiler.js
├── examples/
└── tests/
```

---

## 🖥️ 项目四：全栈博客系统

**阶段**：第四部分 - 全栈能力 (Phase 16-18)

### 项目描述

开发一个完整的全栈博客系统，包含前后端和管理后台。

### 功能要求

- [ ] 用户注册/登录
- [ ] 文章发布（Markdown 编辑器）
- [ ] 文章列表/详情
- [ ] 评论系统
- [ ] 标签/分类管理
- [ ] 搜索功能
- [ ] 后台管理（文章/用户/评论）
- [ ] SEO 优化（SSR）

### 技术要点

| 层级     | 技术选型            |
| :------- | :------------------ |
| 前端框架 | Next.js 或 Nuxt.js  |
| UI 组件  | Tailwind CSS        |
| 后端     | Node.js API Routes  |
| 数据库   | PostgreSQL + Prisma |
| 认证     | NextAuth / JWT      |
| 部署     | Vercel / Railway    |

### 目录结构

```
projects/04-blog-system/
├── README.md
├── package.json
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/
│   ├── lib/
│   └── styles/
├── public/
└── tests/
```

---

## 🏗️ 项目五：微前端容器

**阶段**：第五部分 - 前端架构 (Phase 19-21)

### 项目描述

实现一个微前端容器框架，支持多应用集成与隔离运行。

### 功能要求

- [ ] 应用注册与加载
- [ ] 路由分发与劫持
- [ ] JS 沙箱（Proxy）
- [ ] CSS 隔离（Shadow DOM / Scoped）
- [ ] 应用间通信
- [ ] 应用预加载与缓存
- [ ] 性能监控集成

### 技术要点

| 知识点     | 应用场景               |
| :--------- | :--------------------- |
| 沙箱机制   | JS 隔离                |
| Shadow DOM | CSS 隔离               |
| 路由劫持   | History API            |
| 消息通信   | CustomEvent / 发布订阅 |
| 生命周期   | 应用加载/卸载          |
| Monorepo   | 多应用管理             |

### 目录结构

```
projects/05-micro-frontend/
├── README.md
├── pnpm-workspace.yaml
├── packages/
│   ├── framework/        # 微前端框架
│   │   ├── src/
│   │   │   ├── sandbox.ts
│   │   │   ├── loader.ts
│   │   │   ├── router.ts
│   │   │   └── communication.ts
│   │   └── package.json
│   ├── main-app/         # 主应用
│   ├── sub-app-react/    # 子应用 React
│   └── sub-app-vue/      # 子应用 Vue
└── examples/
```

---

## 🎨 项目六：3D 产品展示

**阶段**：第六部分 - 图形可视化 (Phase 22-24)

### 项目描述

使用 Three.js 创建一个交互式 3D 产品展示应用。

### 功能要求

- [ ] 3D 模型加载（GLTF/GLB）
- [ ] 相机控制（旋转/缩放/平移）
- [ ] 材质切换（颜色/纹理）
- [ ] 热点标注与信息弹窗
- [ ] 动画效果（旋转/爆炸图）
- [ ] 环境光照与阴影
- [ ] 移动端触摸适配
- [ ] 性能优化（LOD/懒加载）

### 技术要点

| 知识点        | 应用场景    |
| :------------ | :---------- |
| Three.js      | 3D 渲染引擎 |
| GLTF Loader   | 模型加载    |
| OrbitControls | 相机控制    |
| Raycaster     | 点击检测    |
| 着色器        | 材质效果    |
| 后处理        | 发光/景深   |
| GSAP          | 动画过渡    |

### 目录结构

```
projects/06-3d-showcase/
├── README.md
├── package.json
├── vite.config.js
├── src/
│   ├── main.js
│   ├── scene/
│   │   ├── Scene.js
│   │   ├── Camera.js
│   │   ├── Renderer.js
│   │   └── Controls.js
│   ├── loaders/
│   ├── materials/
│   ├── animations/
│   └── ui/
├── public/
│   └── models/
└── examples/
```

---

## 📋 项目开发规范

### 通用目录结构

```
projects/XX-project-name/
├── README.md           # 项目说明
├── GUIDE.md            # 分步开发指南
├── package.json
├── src/
├── tests/
├── docs/
└── examples/
```

### 开发流程

1. **需求分析** - 仔细阅读 README.md 理解需求
2. **架构设计** - 规划模块划分和数据流
3. **分步实现** - 按 GUIDE.md 逐步完成功能
4. **测试验证** - 编写测试用例验证功能
5. **文档完善** - 补充 API 文档和使用说明
6. **复盘优化** - 代码评审和性能优化

---

## 🎯 学习建议

1. **循序渐进** - 按阶段顺序完成，不要跳跃
2. **理解优先** - 重视原理理解，而非复制代码
3. **独立实现** - 先尝试自己实现，再参考答案
4. **举一反三** - 完成后尝试扩展新功能
5. **代码质量** - 注重可读性和可维护性

---

> 📝 每个项目都是一次成长的机会，祝你学有所成！
