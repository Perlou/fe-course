# 🏗️ 微前端管理平台实战

## 项目概述

搭建一个微前端管理平台，主应用作为 Shell 加载多个独立子应用，实现应用注册、路由管理、沙箱隔离和通信。

## 技术栈

```
主应用: React + React Router
子应用 A: React (Dashboard)
子应用 B: Vue (Settings)
框架: qiankun 或 手写微前端
通信: EventBus + GlobalState
```

## 项目结构

```
micro-app/
├── main-app/               # 主应用 (Shell)
│   ├── src/
│   │   ├── App.jsx         # 布局 + 子应用容器
│   │   ├── micro/          # 微前端配置
│   │   │   ├── apps.js     # 子应用注册
│   │   │   ├── sandbox.js  # JS 沙箱
│   │   │   └── store.js    # 全局状态
│   │   └── components/
│   └── package.json
├── sub-react/              # React 子应用
│   ├── src/
│   └── package.json
├── sub-vue/                # Vue 子应用
│   ├── src/
│   └── package.json
└── README.md
```

## 实现步骤

### Step 1: 搭建主应用

1. 创建 React 项目作为 Shell
2. 实现路由劫持 (history.pushState)
3. 实现子应用注册与匹配
4. 创建子应用容器组件

### Step 2: 实现子应用

1. React 子应用 — 导出 bootstrap/mount/unmount
2. Vue 子应用 — 同上
3. Webpack/Vite 配置 (UMD 输出 + CORS)

### Step 3: 沙箱与隔离

1. 实现 Proxy 沙箱
2. 实现样式隔离 (CSS 命名空间)
3. 实现 EventBus 通信

### Step 4: 整合测试

1. 路由切换测试
2. 应用加载/卸载测试
3. 通信测试

## 学习要点

- [ ] 微前端架构设计
- [ ] JS 沙箱实现原理
- [ ] 样式隔离方案
- [ ] 应用间通信
- [ ] 生命周期管理
- [ ] 路由劫持机制

## 进阶挑战

- [ ] 使用 Module Federation 替代 qiankun
- [ ] 实现预加载 (prefetch)
- [ ] 添加子应用错误边界
- [ ] 实现 Web Components 方案
- [ ] 添加子应用性能监控
