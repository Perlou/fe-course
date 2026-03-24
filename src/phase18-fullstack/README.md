# Phase 18: 全栈实战

> **目标**：完成全栈项目开发  
> **预计时长**：3 周

---

## 📚 本阶段内容

### 学习目标

1. 掌握全栈项目架构（Monorepo / 前后端分离）
2. 实现前后端联调（API 封装、拦截器、错误处理）
3. 掌握文件上传与存储方案
4. 了解 Docker 容器化部署
5. 配置 CI/CD 自动化流程
6. 掌握环境变量与配置管理
7. 了解日志、监控与调试技巧

### 知识要点

- 全栈项目结构设计（Monorepo vs 多仓库）
- API 客户端封装（Axios 拦截器、统一错误处理）
- 文件上传（Multer、S3、图片压缩）
- Docker 与 Docker Compose
- Nginx 反向代理与 SPA 配置
- CI/CD（GitHub Actions）
- 部署平台（Vercel、Railway、Fly.io）
- 环境变量管理与 CORS 配置

### 实战项目

**全栈博客系统**：React/Vue + Express + Prisma + PostgreSQL

---

## 📂 目录结构

```
phase18-fullstack/
├── CONCEPT.md
├── README.md
├── examples/
│   ├── 01-api-client.js         # API 封装与拦截器
│   ├── 02-file-upload.js        # 文件上传方案
│   ├── 03-docker-deploy.js      # Docker 部署配置
│   ├── 04-cicd-config.js        # CI/CD 工作流
│   └── 05-fullstack-patterns.js # 全栈开发模式
└── exercises/
    └── fullstack-blog/          # 全栈博客实战
        └── README.md
```

---

## 🎯 核心概念速览

### 全栈架构

```
┌──────────────┐     HTTP     ┌──────────────┐     SQL     ┌────────┐
│   Frontend   │ ←──────────→ │   Backend    │ ←─────────→ │   DB   │
│  React/Vue   │    /api/*    │  Express/Koa │             │ PG/Mongo│
└──────────────┘              └──────┬───────┘             └────────┘
                                     │
                                  ┌──┴──┐
                                  │Redis│
                                  └─────┘
```

### 部署流程

```
代码推送 → CI 检测 → 构建 → 测试 → 部署 → 监控
  Git       Lint     Build   Test   Deploy  Alert
```

---

> 完成本阶段后，你应该能够独立开发和部署全栈应用。
