# 全栈实战深入解析

## 📌 一、项目架构

### 1. 全栈项目结构

```
fullstack-app/
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/        # API 调用
│   │   ├── store/           # 状态管理
│   │   └── utils/
│   └── package.json
│
├── backend/                  # 后端应用
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── utils/
│   ├── prisma/
│   └── package.json
│
├── shared/                   # 共享代码
│   ├── types/               # 共享类型
│   └── utils/               # 共享工具
│
├── docker-compose.yml
├── .github/workflows/        # CI/CD
└── README.md
```

### 2. Monorepo vs 多仓库

```
┌──────────────────────────────────────────────────────────┐
│              Monorepo vs 多仓库                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Monorepo (单仓库):                                      │
│  ├── 工具: pnpm workspaces / Turborepo / Nx              │
│  ├── 优点: 共享代码、统一版本、原子提交                   │
│  ├── 缺点: 仓库体积大、权限管理复杂                      │
│  └── 适合: 中小团队、强关联项目                           │
│                                                          │
│  多仓库 (Polyrepo):                                      │
│  ├── 优点: 独立部署、灵活技术栈                           │
│  ├── 缺点: 共享代码困难、版本同步麻烦                     │
│  └── 适合: 大团队、微服务架构                             │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 3. pnpm Monorepo 配置

```yaml
# pnpm-workspace.yaml
packages:
  - 'frontend'
  - 'backend'
  - 'shared/*'
```

```json
// package.json (根目录)
{
  "scripts": {
    "dev": "concurrently \"pnpm --filter frontend dev\" \"pnpm --filter backend dev\"",
    "build": "pnpm --filter frontend build && pnpm --filter backend build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint"
  }
}
```

---

## 📌 二、前后端联调

### 1. API 客户端封装

```typescript
// frontend/src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
});

// 请求拦截器
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Token 过期自动刷新
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post('/api/auth/refresh', {
          refreshToken: localStorage.getItem('refreshToken'),
        });
        localStorage.setItem('token', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const userApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.patch('/users/me', data),
};

export const postApi = {
  getAll: (params) => api.get('/posts', { params }),
  getById: (id) => api.get(`/posts/${id}`),
  create: (data) => api.post('/posts', data),
  update: (id, data) => api.patch(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`),
};
```

### 2. 统一错误处理

```typescript
function handleApiError(error: any) {
  if (error.response) {
    const { status, data } = error.response;
    switch (status) {
      case 400: return { error: data.message || '请求参数错误' };
      case 401: return { error: '请先登录' };
      case 403: return { error: '没有权限' };
      case 404: return { error: '资源不存在' };
      case 422: return { error: '数据验证失败', details: data.errors };
      case 429: return { error: '请求过于频繁，请稍后再试' };
      case 500: return { error: '服务器错误' };
      default:  return { error: '未知错误' };
    }
  } else if (error.request) {
    return { error: '网络错误，请检查网络连接' };
  }
  return { error: error.message };
}
```

### 3. CORS 配置

```javascript
// backend/src/app.js
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### 4. 开发代理

```javascript
// frontend/vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
```

---

## 📌 三、文件上传

### 1. 前端上传

```typescript
// 单文件上传
async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      const percent = Math.round((e.loaded * 100) / e.total);
      console.log(`上传进度: ${percent}%`);
    },
  });

  return response.url;
}

// 图片压缩
async function compressImage(file, maxWidth = 1920) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, 'image/jpeg', 0.8);
    };
    img.src = URL.createObjectURL(file);
  });
}
```

### 2. 后端处理 (Multer + S3)

```javascript
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  const { file } = req;
  const key = `uploads/${Date.now()}-${file.originalname}`;
  // 上传到 S3 / OSS / 本地存储
  res.json({ url: `/uploads/${key}` });
});
```

---

## 📌 四、Docker 部署

### 1. Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
COPY --from=builder /app/prisma ./prisma
EXPOSE 4000
CMD ["node", "dist/app.js"]
```

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### 2. docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - '3000:80'
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - '4000:4000'
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/mydb
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=mydb

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 3. Nginx 配置

```nginx
server {
    listen 80;

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;  # SPA 路由
    }

    location /api {
        proxy_pass http://backend:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        # WebSocket 支持
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 📌 五、CI/CD

### 1. GitHub Actions

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install && pnpm build
      - name: Deploy Frontend
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
      - name: Deploy Backend
        uses: akhileshns/heroku-deploy@v3.13.15
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: my-backend
```

### 2. 部署平台对比

```
┌──────────────────┬────────────────┬────────────────┬────────────────┐
│                  │ Vercel         │ Railway        │ Fly.io         │
├──────────────────┼────────────────┼────────────────┼────────────────┤
│ 最适合           │ 前端/SSR       │ 全栈           │ 全栈/后端      │
│ 免费额度         │ 较多           │ $5/月          │ 较多           │
│ 数据库           │ ❌             │ PostgreSQL     │ PostgreSQL     │
│ Docker           │ ❌             │ ✅             │ ✅             │
│ 自定义域名       │ ✅             │ ✅             │ ✅             │
│ 扩展性           │ 自动           │ 手动           │ 自动           │
│ 推荐             │ 前端部署       │ 全栈入门       │ 生产部署       │
└──────────────────┴────────────────┴────────────────┴────────────────┘
```

---

## 📌 六、环境变量管理

### 1. 配置分层

```
┌─────────────────────────────────────────────────────┐
│              环境变量管理策略                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  .env              ← 默认值 (开发)                   │
│  .env.local        ← 本地覆盖 (不提交)               │
│  .env.production   ← 生产环境                        │
│  .env.test         ← 测试环境                        │
│                                                     │
│  优先级: .env.local > .env.[mode] > .env             │
│                                                     │
│  前端变量前缀: VITE_  (Vite) / NEXT_PUBLIC_ (Next)  │
│  ⚠️ 前端变量会暴露给客户端，不要放敏感信息           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 2. 配置验证

```javascript
// backend/src/config/index.js
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'FRONTEND_URL'];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`缺少必要的环境变量: ${key}`);
  }
}

module.exports = {
  port: parseInt(process.env.PORT || '4000'),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  frontendUrl: process.env.FRONTEND_URL,
  isProduction: process.env.NODE_ENV === 'production',
};
```

---

## 📌 七、全栈开发最佳实践

### 1. 开发流程

```
┌──────────────────────────────────────────────────────┐
│              全栈开发工作流                            │
├──────────────────────────────────────────────────────┤
│                                                      │
│  1. 需求分析 → 确定 API 接口                         │
│  2. 数据库设计 → Prisma Schema                       │
│  3. 后端开发 → API + 测试                            │
│  4. 前端开发 → 页面 + API 联调                       │
│  5. 集成测试 → 前后端联调                            │
│  6. 部署 → Docker + CI/CD                            │
│  7. 监控 → 错误追踪 + 性能监控                       │
│                                                      │
│  关键原则:                                            │
│  • API-first: 先定义接口再开发                       │
│  • 类型共享: 前后端共用 TypeScript 类型              │
│  • 环境隔离: 开发/测试/生产环境分离                  │
│  • 自动化: CI/CD 避免手动部署                        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 2. 安全检查清单

```
✅ HTTPS 加密传输
✅ JWT 存储在 httpOnly Cookie
✅ 密码使用 bcrypt 加密 (saltRounds >= 10)
✅ CORS 限制允许的域名
✅ Helmet 设置安全 HTTP 头
✅ Rate Limiting 防止暴力破解
✅ 参数验证 (express-validator / zod)
✅ SQL 注入防护 (使用 ORM)
✅ XSS 防护 (输入过滤 + 输出转义)
✅ 环境变量不提交到 Git
```

---

## 📚 推荐学习资源

| 资源             | 链接                  |
| ---------------- | --------------------- |
| Docker 官方文档  | docs.docker.com       |
| Vercel           | vercel.com/docs       |
| Railway          | docs.railway.app      |
| GitHub Actions   | docs.github.com       |
| Turborepo        | turbo.build           |

---
