// Docker 部署配置详解
// 运行: node 03-docker-deploy.js

console.log("=== Docker 部署配置 ===\n");

// ========== 1. Docker 基础概念 ==========
console.log("1. Docker 基础概念\n");
console.log(`
  ┌──────────────────────────────────────────────────────┐
  │              Docker 核心概念                          │
  ├──────────────────────────────────────────────────────┤
  │                                                      │
  │  镜像 (Image)                                        │
  │  ├── 只读模板，包含运行环境和代码                    │
  │  ├── 由 Dockerfile 构建                               │
  │  └── 存储在 Docker Hub / 私有仓库                    │
  │                                                      │
  │  容器 (Container)                                    │
  │  ├── 镜像的运行实例                                  │
  │  ├── 隔离的进程 + 文件系统                           │
  │  └── 启停不影响其他容器                               │
  │                                                      │
  │  仓库 (Registry)                                     │
  │  ├── Docker Hub (公共)                               │
  │  ├── GitHub Container Registry                       │
  │  └── 私有 Harbor                                     │
  │                                                      │
  │  数据卷 (Volume)                                     │
  │  ├── 持久化数据 (不随容器删除)                       │
  │  └── 数据库、日志等需要持久化                        │
  │                                                      │
  └──────────────────────────────────────────────────────┘
`);

// ========== 2. Dockerfile 详解 ==========
console.log("2. Dockerfile 详解\n");

const backendDockerfile = `
  # === Backend Dockerfile (多阶段构建) ===

  # 阶段 1: 构建
  FROM node:20-alpine AS builder
  WORKDIR /app

  # 先复制依赖文件 (利用缓存层)
  COPY package*.json ./
  RUN npm ci --only=production

  # 复制源码并构建
  COPY . .
  RUN npx prisma generate
  RUN npm run build

  # 阶段 2: 运行 (更小的镜像)
  FROM node:20-alpine
  WORKDIR /app

  COPY --from=builder /app/dist ./dist
  COPY --from=builder /app/node_modules ./node_modules
  COPY --from=builder /app/package.json .
  COPY --from=builder /app/prisma ./prisma

  # 非 root 用户 (安全)
  RUN addgroup -g 1001 -S nodejs
  RUN adduser -S appuser -u 1001
  USER appuser

  EXPOSE 4000
  CMD ["node", "dist/app.js"]
`;

console.log("  Backend Dockerfile:");
console.log(backendDockerfile);

const frontendDockerfile = `
  # === Frontend Dockerfile ===

  FROM node:20-alpine AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npm run build

  # 使用 Nginx 托管静态文件
  FROM nginx:alpine
  COPY --from=builder /app/dist /usr/share/nginx/html
  COPY nginx.conf /etc/nginx/conf.d/default.conf
  EXPOSE 80
  CMD ["nginx", "-g", "daemon off;"]
`;

console.log("  Frontend Dockerfile:");
console.log(frontendDockerfile);

// ========== 3. docker-compose ==========
console.log("3. docker-compose.yml\n");

const dockerCompose = `
  version: '3.8'

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
        - JWT_SECRET=\${JWT_SECRET}
      depends_on:
        db:
          condition: service_healthy
        redis:
          condition: service_started

    db:
      image: postgres:15
      volumes:
        - postgres_data:/var/lib/postgresql/data
      environment:
        - POSTGRES_USER=user
        - POSTGRES_PASSWORD=pass
        - POSTGRES_DB=mydb
      healthcheck:
        test: ["CMD-SHELL", "pg_isready -U user -d mydb"]
        interval: 5s
        timeout: 5s
        retries: 5

    redis:
      image: redis:7-alpine
      volumes:
        - redis_data:/data

  volumes:
    postgres_data:
    redis_data:
`;

console.log(dockerCompose);

// ========== 4. Nginx 配置 ==========
console.log("4. Nginx 配置\n");

const nginxConf = `
  server {
      listen 80;
      server_name example.com;

      # SPA 路由
      location / {
          root /usr/share/nginx/html;
          try_files $uri $uri/ /index.html;
      }

      # API 反向代理
      location /api {
          proxy_pass http://backend:4000;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;

          # WebSocket 支持
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection "upgrade";
      }

      # 静态资源长缓存
      location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
          expires 1y;
          add_header Cache-Control "public, immutable";
      }

      # Gzip 压缩
      gzip on;
      gzip_types text/plain application/json application/javascript text/css;
      gzip_min_length 1000;
  }
`;

console.log(nginxConf);

// ========== 5. Docker 常用命令 ==========
console.log("5. Docker 常用命令\n");
console.log(`
  # 构建并启动
  docker-compose up -d --build

  # 查看日志
  docker-compose logs -f backend

  # 停止所有服务
  docker-compose down

  # 停止并删除数据
  docker-compose down -v

  # 进入容器
  docker exec -it <container_id> sh

  # 查看容器状态
  docker-compose ps

  # 重新构建单个服务
  docker-compose build backend
  docker-compose up -d backend
`);

// ========== 6. .dockerignore ==========
console.log("6. .dockerignore\n");
console.log(`
  node_modules
  dist
  .git
  .env
  .env.local
  *.md
  .DS_Store
  coverage
  .vscode
`);

console.log("=== Docker 部署完成 ===");
