# 🏗️ 微前端容器框架

> 从零实现微前端框架，理解微前端架构核心原理

## 📖 项目简介

微前端容器是一个**零外部依赖**的微前端框架，手写实现了微前端架构的 8 大核心模块：

- ✅ **JS 沙箱** — Proxy 隔离 · 多实例并行 · 白名单 · 副作用清理
- ✅ **HTML 加载器** — fetch 入口 · 解析 script/style · 提取生命周期
- ✅ **路由劫持** — pushState/replaceState 劫持 · 前缀匹配 · 编程式导航
- ✅ **CSS 隔离** — 命名空间前缀 `[data-micro-app]` · 动态加载/卸载
- ✅ **应用通信** — EventBus 发布订阅 + GlobalState 全局状态
- ✅ **生命周期** — 状态机 · 全局钩子 · bootstrap-once 语义
- ✅ **预加载** — requestIdleCallback 空闲加载 · 优先级队列
- ✅ **性能监控** — 加载耗时 · 挂载耗时 · 错误追踪 · 统计报告

## 🚀 快速开始

```bash
# 启动开发服务器
node server.js
# → http://localhost:3000

# 运行核心原理演示 (Node.js)
node examples/demo.js
```

## 📂 目录结构

```
05-micro-frontend/
├── README.md
├── package.json
├── server.js                    # 开发服务器
├── packages/
│   ├── framework/               # 🏗️ 核心框架
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.js         # 统一入口 (registerMicroApps/start)
│   │       ├── sandbox.js       # Proxy 沙箱
│   │       ├── loader.js        # HTML 入口加载器
│   │       ├── router.js        # 路由劫持
│   │       ├── communication.js # EventBus + GlobalState
│   │       ├── style.js         # CSS 隔离
│   │       ├── lifecycle.js     # 生命周期状态机
│   │       ├── prefetch.js      # 预加载
│   │       └── monitor.js       # 性能监控
│   ├── main-app/                # 🏠 主应用 (Shell)
│   │   ├── index.html
│   │   ├── app.js
│   │   └── style.css
│   ├── sub-app-react/           # ⚛️ 子应用 A (React 仪表盘)
│   │   ├── index.html
│   │   ├── app.js
│   │   └── style.css
│   └── sub-app-vue/             # 💚 子应用 B (Vue 设置中心)
│       ├── index.html
│       ├── app.js
│       └── style.css
└── examples/
    └── demo.js                  # 核心原理演示
```

## 🔍 核心原理

### 微前端架构

```
客户端请求 → Dev Server → 主应用 Shell
                              │
                ┌──────────── │ ────────────┐
                │             │             │
           路由劫持      全局状态       CSS 隔离
           (Router)    (GlobalState)  (StyleManager)
                │             │             │
                └──────────── │ ────────────┘
                              │
                   ┌──────────┼──────────┐
                   │          │          │
              HTML 加载    JS 沙箱    生命周期
              (Loader)    (Sandbox)  (Lifecycle)
                   │          │          │
                   └──────────┼──────────┘
                              │
                    ┌─────────┼─────────┐
                    │         │         │
               React 子应用  Vue 子应用  预加载
               (仪表盘)     (设置中心)  (Prefetch)
```

### 核心 API

```javascript
// 类 qiankun 使用方式
MicroApp.registerMicroApps([
  {
    name: 'react-dashboard',
    entry: '/sub-apps/react/',
    container: '#sub-app-container',
    activeRule: '/dashboard',
    props: { title: '仪表盘' },
  },
]);

// 全局状态
const { onGlobalStateChange, setGlobalState } =
  MicroApp.initGlobalState({ user: null, theme: 'dark' });

// 启动
MicroApp.start({ prefetch: true });
```

### 子应用生命周期

```
加载 (load)   → fetch HTML → 解析 script/style
                  ↓
初始化 (bootstrap) → 仅执行一次
                  ↓
挂载 (mount)   → 注入模板 → 加载样式 → 执行脚本
                  ↓
运行中...       → 响应用户交互
                  ↓
卸载 (unmount) → 清理事件 → 移除样式 → 关闭沙箱
                  ↓
(再次挂载) → 跳过 bootstrap，直接 mount
```

## 📚 对照学习

| Mini Framework | 生产级实现 |
|---|---|
| `sandbox.js` Proxy | qiankun ProxySandbox |
| `loader.js` HTML Entry | qiankun import-html-entry |
| `router.js` 路由劫持 | single-spa 路由系统 |
| `communication.js` EventBus | qiankun initGlobalState |
| `style.js` 命名空间 | qiankun experimentalStyleIsolation |
| `lifecycle.js` 状态机 | single-spa 生命周期 |
| `prefetch.js` 空闲加载 | qiankun prefetch |
| `monitor.js` 性能监控 | Sentry / 前端监控 SDK |

---

> 💡 这个项目覆盖了 Phase 19 (工程化进阶)、Phase 20 (微前端) 和 Phase 21 (性能优化) 的核心知识点
