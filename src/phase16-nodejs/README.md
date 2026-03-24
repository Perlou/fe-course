# Phase 16: Node.js 开发

> **目标**：掌握 Node.js 后端开发  
> **预计时长**：2 周

---

## 📚 本阶段内容

### 学习目标

1. 理解 Node.js 事件循环与异步模型
2. 掌握核心模块（fs、path、stream、events、http）
3. 掌握 Express 框架（路由、中间件、错误处理）
4. 了解 Koa 洋葱模型
5. 入门 NestJS 企业级框架
6. 熟悉 RESTful API 设计与 JWT 认证
7. 了解进程管理与项目部署

### 知识要点

- Node.js 事件循环与微任务/宏任务
- 核心模块（fs、path、stream、events、http）
- Express 路由与中间件机制
- Koa 洋葱模型与 ctx
- NestJS 控制器、服务、模块
- RESTful API 设计规范
- JWT 认证与 bcrypt 密码加密
- 错误处理与日志体系
- PM2 进程管理与 Cluster 模式

### 实战项目

**REST API 服务**：使用 Express 构建完整的用户管理 API

---

## 📂 目录结构

```
phase16-nodejs/
├── CONCEPT.md
├── README.md
├── examples/
│   ├── 01-event-loop.js        # 事件循环与异步
│   ├── 02-core-modules.js      # 核心模块
│   ├── 03-express-app.js       # Express 框架
│   ├── 04-koa-app.js           # Koa 框架
│   └── 05-auth-jwt.js          # JWT 认证
└── exercises/
    └── rest-api/               # REST API 实战项目
        └── README.md
```

---

## 🎯 核心概念速览

### Node.js 事件循环

```
timers → pending → idle → poll → check → close
               ↑                              │
               └──── 微任务 (nextTick/Promise) ┘
```

### Express 中间件

```javascript
app.use((req, res, next) => {
  console.log("Request:", req.method, req.url);
  next();
});
```

### Koa 洋葱模型

```
请求 → MW1 → MW2 → MW3 → 响应
       ↑                    │
       └────────────────────┘
```

### JWT 认证流程

```
注册 → bcrypt 加密密码 → 存储
登录 → 验证密码 → 签发 JWT
请求 → 携带 JWT → 中间件验证 → 访问资源
```

---

> 完成本阶段后，你应该能够独立开发和部署后端 API 服务。
