/**
 * 全栈博客 - 应用入口
 *
 * 组装: Server + Router + DB + Auth + API + SSR
 * 运行: node src/app.js
 */

const Server = require("./server");
const Database = require("./db");
const { authMiddleware } = require("./auth");
const createApiRouter = require("./api/routes");
const createPageRouter = require("./api/pages");
const path = require("path");

// 初始化数据库
const db = new Database(path.join(__dirname, "../data"));

// 创建服务器
const app = new Server();

// 中间件
app.use(authMiddleware);

// API 路由
const apiRouter = createApiRouter(db);
app.use(apiRouter.middleware());

// SSR 页面路由
const pageRouter = createPageRouter(db);
app.use(pageRouter.middleware());

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
  console.log(`   SSR:  http://localhost:${PORT}/posts\n`);
});

module.exports = { app, db };
