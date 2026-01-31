---
description: 启动开发服务器
---

# 启动开发服务器

// turbo-all

## 1. 启动 Vite 开发服务器（推荐）

进入项目目录后：

```bash
npm run dev
```

或者直接使用 npx：

```bash
npx -y vite --port 3000
```

## 2. 启动 Live Server（静态 HTML）

```bash
npx -y live-server . --port=3000 --no-browser
```

## 3. 启动简单 HTTP 服务器

使用 Python：

```bash
python3 -m http.server 3000
```

使用 Node.js：

```bash
npx -y serve . -l 3000
```

## 4. 启动 Next.js 开发服务器

```bash
npm run dev
```

## 5. 端口占用处理

查看端口占用：

```bash
lsof -i :3000
```

终止占用进程：

```bash
kill -9 $(lsof -t -i :3000)
```
