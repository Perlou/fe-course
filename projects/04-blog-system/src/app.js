/**
 * 全栈博客 - 应用入口
 *
 * 组装: Server + 静态文件 + Auth + API + React SPA
 * 运行: node src/app.js
 */

const Server = require("./server");
const Database = require("./db");
const { authMiddleware } = require("./auth");
const createApiRouter = require("./api/routes");
const path = require("path");
const fs = require("fs");

// 初始化数据库
const db = new Database(path.join(__dirname, "../data"));

// 创建服务器
const app = new Server();

// 中间件: 认证
app.use(authMiddleware);

// API 路由
const apiRouter = createApiRouter(db);
app.use(apiRouter.middleware());

// 静态文件服务中间件
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".jsx": "text/babel; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

app.use((req, res, next) => {
  // 只处理 GET
  if (req.method !== "GET") return next();

  const publicDir = path.join(__dirname, "../public");
  let filePath = path.join(publicDir, req.pathname);

  // 安全检查: 防止路径遍历
  if (!filePath.startsWith(publicDir)) return next();

  // 检查文件是否存在
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const content = fs.readFileSync(filePath);
    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": content.length,
      "Connection": "close",
    });
    res.end(content);
    return;
  }

  return next();
});

// SPA 回退: 所有未匹配的 GET 请求返回 index.html
app.use((req, res, next) => {
  if (req.method !== "GET") return next();

  // API 路径不回退
  if (req.pathname.startsWith("/api/")) return next();

  const indexPath = path.join(__dirname, "../public/index.html");
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, "utf-8");
    res.html(content);
    return;
  }

  return next();
});

// 404
app.use((req, res) => {
  res.json({ error: "Not Found", path: req.pathname }, 404);
});

// 启动
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Mini Blog 启动成功!`);
  console.log(`   地址: http://localhost:${PORT}`);
  console.log(`   API:  http://localhost:${PORT}/api/posts`);
  console.log(`   页面: http://localhost:${PORT}\n`);
});

module.exports = { app, db };
