# 🖥️ 全栈博客系统

> 从零实现全栈博客系统，理解全栈开发核心原理

## 📖 项目简介

全栈博客是一个**零外部依赖**的 Node.js 全栈应用，手写实现了全栈开发的 8 大核心模块：

- ✅ **HTTP 服务器** — 中间件链式调用 (Express 原理)
- ✅ **路由系统** — URL 匹配 + 路径参数提取
- ✅ **文件数据库** — JSON 文件存储 + MongoDB 风格查询
- ✅ **JWT 认证** — 手写 JWT (Header.Payload.Signature) + 密码哈希
- ✅ **RESTful API** — CRUD + 权限校验 + 搜索
- ✅ **Markdown 解析** — 正则实现标题/代码块/粗体/链接等
- ✅ **SSR 模板引擎** — 变量/循环/条件渲染 + SEO
- ✅ **评论/标签** — 关联查询 + 聚合统计

## 🚀 快速开始

```bash
# 启动服务器
node src/app.js
# → http://localhost:3000

# 运行功能演示
node examples/demo.js
```

## 📂 目录结构

```
04-blog-system/
├── README.md
├── package.json
├── src/
│   ├── app.js              # 应用入口 (组装所有模块)
│   ├── server.js            # HTTP 服务器 + 中间件
│   ├── router.js            # URL 路由 (路径参数)
│   ├── db.js                # 文件数据库 (CRUD + 查询)
│   ├── auth.js              # JWT 认证 + 密码哈希
│   ├── markdown.js          # Markdown → HTML
│   ├── template.js          # SSR 模板引擎
│   └── api/
│       ├── routes.js        # RESTful API
│       └── pages.js         # SSR 页面路由
├── examples/
│   └── demo.js              # 完整功能演示
└── data/                    # JSON 数据文件 (运行时生成)
```

## 🔍 核心原理

### 全栈架构

```
客户端请求 → HTTP Server → 中间件链
                              │
                   ┌──────────┼──────────┐
                   │          │          │
              Auth 中间件  API Router  Page Router
                   │          │          │
                   └──────────┼──────────┘
                              │
                    ┌─────────┼─────────┐
                    │         │         │
                 Database  Markdown  Template
                 (JSON 文件) (→HTML)   (SSR)
```

### API 列表

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/register` | 用户注册 | - |
| POST | `/api/auth/login` | 用户登录 | - |
| GET | `/api/posts` | 文章列表 | - |
| POST | `/api/posts` | 创建文章 | ✅ |
| GET | `/api/posts/:id` | 文章详情 | - |
| PUT | `/api/posts/:id` | 更新文章 | ✅ |
| DELETE | `/api/posts/:id` | 删除文章 | ✅ |
| POST | `/api/posts/:id/comments` | 添加评论 | - |
| GET | `/api/tags` | 标签列表 | - |

### JWT 结构

```
Header:    { alg: "HS256", typ: "JWT" }     → Base64URL
Payload:   { userId, username, exp }        → Base64URL
Signature: HMAC-SHA256(header.payload, key) → Base64URL
Token:     header.payload.signature
```

## 📚 对照学习

| Mini Blog | 生产级实现 |
|---|---|
| `server.js` 中间件 | Express / Koa |
| `router.js` 手动匹配 | express.Router |
| `db.js` JSON 文件 | PostgreSQL + Prisma |
| `auth.js` 手写 JWT | jsonwebtoken + bcrypt |
| `markdown.js` 正则 | marked / remark |
| `template.js` 字符串替换 | EJS / Nunjucks / React SSR |

---

> 💡 这个项目覆盖了 Phase 16 (Node.js)、Phase 17 (数据库) 和 Phase 18 (全栈开发) 的核心知识点
