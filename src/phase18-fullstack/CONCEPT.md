# 全栈实战深入解析

## 📌 一、项目架构

### 全栈项目结构

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
├── docker-compose.yml
├── .github/workflows/        # CI/CD
└── README.md
```

---

## 📌 二、前后端联调

### 1. API 客户端封装

```typescript
// frontend/src/services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 10000,
});

// 请求拦截器
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const userApi = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  getProfile: () => api.get("/users/me"),
  updateProfile: (data) => api.patch("/users/me", data),
};

export const postApi = {
  getAll: (params) => api.get("/posts", { params }),
  getById: (id) => api.get(`/posts/${id}`),
  create: (data) => api.post("/posts", data),
  update: (id, data) => api.patch(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`),
};
```

### 2. 错误处理

```typescript
// 统一错误处理
function handleApiError(error: any) {
  if (error.response) {
    // 服务器返回错误
    const { status, data } = error.response;
    switch (status) {
      case 400:
        return { error: data.message || "请求参数错误" };
      case 401:
        return { error: "请先登录" };
      case 403:
        return { error: "没有权限" };
      case 404:
        return { error: "资源不存在" };
      case 500:
        return { error: "服务器错误" };
      default:
        return { error: "未知错误" };
    }
  } else if (error.request) {
    return { error: "网络错误，请检查网络连接" };
  }
  return { error: error.message };
}
```

---

## 📌 三、文件上传

### 1. 前端上传

```typescript
// 单文件上传
async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      const percent = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      console.log(`上传进度: ${percent}%`);
    },
  });

  return response.url;
}

// 图片压缩
async function compressImage(file: File, maxWidth = 1920) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, "image/jpeg", 0.8);
    };
    img.src = URL.createObjectURL(file);
  });
}
```

### 2. 后端处理

```javascript
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    cb(null, allowed.includes(file.mimetype));
  },
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  const { file } = req;
  const key = `uploads/${Date.now()}-${file.originalname}`;

  const s3 = new S3Client({ region: process.env.AWS_REGION });
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  res.json({ url: `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}` });
});
```

---

## 📌 四、Docker 部署

### docker-compose.yml

```yaml
version: "3.8"

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "4000:4000"
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

### Nginx 配置

```nginx
# frontend/nginx.conf
server {
    listen 80;

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 📌 五、CI/CD

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test

      - name: Build
        run: pnpm build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: "--prod"
```

---

## 📚 推荐学习资源

| 资源    | 链接        |
| ------- | ----------- |
| Docker  | docker.com  |
| Vercel  | vercel.com  |
| Railway | railway.app |

---
