# 🔧 REST API 实战项目

## 项目概述

使用 Express 构建一个完整的用户管理 REST API，掌握后端开发核心技能。

## 功能需求

### 核心功能

1. **用户认证** — 注册、登录、JWT 令牌刷新
2. **用户 CRUD** — 创建、读取、更新、删除用户
3. **文章管理** — 用户可发布、编辑、删除文章
4. **请求验证** — 参数校验与错误处理
5. **分页排序** — 列表接口支持分页和排序

### API 设计

```
POST   /api/auth/register        注册
POST   /api/auth/login            登录
POST   /api/auth/refresh          刷新 Token

GET    /api/users                 用户列表 (分页)
GET    /api/users/:id             用户详情
PUT    /api/users/:id             更新用户 (需认证)
DELETE /api/users/:id             删除用户 (需认证)

GET    /api/users/:id/posts       用户文章列表
POST   /api/posts                 创建文章 (需认证)
GET    /api/posts/:id             文章详情
PUT    /api/posts/:id             更新文章 (需认证, 仅作者)
DELETE /api/posts/:id             删除文章 (需认证, 仅作者)
```

## 项目结构

```
rest-api/
├── src/
│   ├── config/
│   │   └── index.js          # 环境变量配置
│   ├── middlewares/
│   │   ├── auth.js           # JWT 认证中间件
│   │   ├── errorHandler.js   # 全局错误处理
│   │   ├── logger.js         # 请求日志
│   │   └── validate.js       # 请求参数验证
│   ├── routes/
│   │   ├── auth.js           # 认证路由
│   │   ├── users.js          # 用户路由
│   │   └── posts.js          # 文章路由
│   ├── models/
│   │   ├── User.js           # 用户模型 (内存存储)
│   │   └── Post.js           # 文章模型
│   ├── utils/
│   │   └── AppError.js       # 自定义错误类
│   └── app.js                # 应用入口
├── .env.example
├── package.json
└── README.md
```

## 实现步骤

### Step 1: 初始化项目

```bash
mkdir rest-api && cd rest-api
npm init -y
npm install express jsonwebtoken bcrypt cors helmet morgan dotenv
npm install -D nodemon
```

### Step 2: 核心模块

1. 创建 `AppError` 自定义错误类
2. 实现 `errorHandler` 中间件
3. 实现 `auth` JWT 认证中间件
4. 创建 `User` 和 `Post` 内存模型

### Step 3: 认证路由

1. `POST /register` — bcrypt 加密密码 → 创建用户
2. `POST /login` — 验证密码 → 签发双 Token
3. `POST /refresh` — 验证 refreshToken → 签发新 accessToken

### Step 4: CRUD 路由

1. 实现用户和文章的完整 CRUD
2. 添加分页 (`?page=1&limit=10`)
3. 添加排序 (`?sort=createdAt&order=desc`)
4. 添加权限检查（仅作者可修改/删除）

## 学习要点

- [ ] Express 路由模块化
- [ ] 中间件链设计
- [ ] JWT 双 Token 认证
- [ ] RESTful API 规范
- [ ] 统一错误处理
- [ ] 请求参数验证

## 进阶挑战

- [ ] 使用 SQLite 替代内存存储
- [ ] 添加单元测试 (Jest + Supertest)
- [ ] 实现文件上传 (Multer)
- [ ] 添加 Swagger 文档
- [ ] 部署到 Railway/Render
