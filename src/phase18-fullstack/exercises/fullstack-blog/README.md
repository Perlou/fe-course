# 📝 全栈博客系统实战

## 项目概述

使用 React + Express + Prisma + PostgreSQL 构建完整的博客系统，贯穿全栈开发全流程。

## 功能需求

### 核心功能

1. **用户认证** — 注册、登录、JWT 双 Token
2. **文章管理** — Markdown 编辑、发布、草稿
3. **评论系统** — 嵌套评论、点赞
4. **标签分类** — 多标签、分类筛选
5. **个人中心** — 头像上传、信息修改

### 技术栈

```
前端: React + Zustand + React Router + TailwindCSS
后端: Express + Prisma + JWT + Multer
数据库: PostgreSQL + Redis
部署: Docker + Nginx + GitHub Actions
```

## 项目结构

```
fullstack-blog/
├── frontend/
│   ├── src/
│   │   ├── components/     # 公共组件
│   │   ├── pages/          # 页面
│   │   ├── services/       # API 调用
│   │   ├── store/          # 状态管理
│   │   └── utils/          # 工具函数
│   ├── vite.config.js
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── middlewares/     # 中间件
│   │   ├── routes/         # 路由
│   │   ├── services/       # 业务逻辑
│   │   └── app.js          # 入口
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── docker-compose.yml
├── .github/workflows/
│   └── deploy.yml
└── README.md
```

## 实现步骤

### Step 1: 后端搭建

1. Express 项目初始化
2. Prisma Schema 设计 (User, Post, Comment, Tag)
3. JWT 认证中间件
4. CRUD API (users, posts, comments)
5. 文件上传 (Multer)

### Step 2: 前端搭建

1. Vite + React 项目初始化
2. API 客户端封装 (Axios 拦截器)
3. 路由配置 (React Router)
4. 页面开发 (首页、文章详情、编辑器、登录)
5. 状态管理 (Zustand — auth, posts)

### Step 3: 联调与部署

1. Vite 开发代理配置
2. Docker 容器化
3. Nginx 反向代理
4. GitHub Actions CI/CD
5. 部署到 Railway / Vercel

## 学习要点

- [ ] 全栈项目架构设计
- [ ] 前后端 API 联调
- [ ] JWT 认证流程
- [ ] 文件上传方案
- [ ] Docker 部署
- [ ] CI/CD 自动化

## 进阶挑战

- [ ] 添加 Markdown 实时预览
- [ ] 实现文章搜索 (全文检索)
- [ ] 添加 WebSocket 实时通知
- [ ] 实现 SSR (Next.js 重构)
- [ ] 添加单元测试与 E2E 测试
