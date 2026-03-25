/**
 * 全栈博客 - RESTful API 路由
 *
 * 职责: 定义所有 API 端点
 *
 * API:
 *   POST   /api/auth/register   注册
 *   POST   /api/auth/login      登录
 *   GET    /api/posts            文章列表
 *   POST   /api/posts            创建文章 (需登录)
 *   GET    /api/posts/:id        文章详情
 *   PUT    /api/posts/:id        更新文章 (需登录)
 *   DELETE /api/posts/:id        删除文章 (需登录)
 *   POST   /api/posts/:id/comments  添加评论
 *   GET    /api/tags             标签列表
 */

const Router = require("../router");
const { generateToken, hashPassword, verifyPassword } = require("../auth");

function createApiRouter(db) {
  const router = new Router();

  // ---- 认证 ----

  router.post("/api/auth/register", (req, res) => {
    const { username, password, email } = req.body || {};
    if (!username || !password) {
      return res.json({ error: "用户名和密码必填" }, 400);
    }

    const existing = db.collection("users").findOne({ username });
    if (existing) {
      return res.json({ error: "用户名已存在" }, 409);
    }

    const user = db.collection("users").insert({
      username,
      email: email || "",
      password: hashPassword(password),
      role: "user",
    });

    const token = generateToken({ userId: user.id, username: user.username });
    res.json({ user: { id: user.id, username: user.username }, token });
  });

  router.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body || {};
    const user = db.collection("users").findOne({ username });

    if (!user || !verifyPassword(password, user.password)) {
      return res.json({ error: "用户名或密码错误" }, 401);
    }

    const token = generateToken({ userId: user.id, username: user.username });
    res.json({ user: { id: user.id, username: user.username }, token });
  });

  // ---- 文章 ----

  router.get("/api/posts", (req, res) => {
    const query = {};
    if (req.query.search) query.$search = req.query.search;
    if (req.query.tag) query.$tag = req.query.tag;
    query.$sort = "createdAt:desc";

    const posts = db.collection("posts").findAll(query).map((p) => ({
      ...p,
      content: undefined,
      summary: (p.content || "").slice(0, 100) + "...",
    }));

    res.json({ posts, total: posts.length });
  });

  router.post("/api/posts", (req, res) => {
    if (!req.user) return res.json({ error: "请先登录" }, 401);

    const { title, content, tags } = req.body || {};
    if (!title || !content) {
      return res.json({ error: "标题和内容必填" }, 400);
    }

    const post = db.collection("posts").insert({
      title,
      content,
      tags: tags || [],
      author: req.user.username,
      authorId: req.user.userId,
    });

    res.json({ post }, 201);
  });

  router.get("/api/posts/:id", (req, res) => {
    const post = db.collection("posts").findById(req.params.id);
    if (!post) return res.json({ error: "文章不存在" }, 404);

    const comments = db.collection("comments").findAll({ postId: post.id });
    res.json({ post, comments });
  });

  router.put("/api/posts/:id", (req, res) => {
    if (!req.user) return res.json({ error: "请先登录" }, 401);

    const post = db.collection("posts").findById(req.params.id);
    if (!post) return res.json({ error: "文章不存在" }, 404);
    if (post.authorId !== req.user.userId) {
      return res.json({ error: "无权修改" }, 403);
    }

    const updated = db.collection("posts").update(req.params.id, req.body);
    res.json({ post: updated });
  });

  router.delete("/api/posts/:id", (req, res) => {
    if (!req.user) return res.json({ error: "请先登录" }, 401);

    const post = db.collection("posts").findById(req.params.id);
    if (!post) return res.json({ error: "文章不存在" }, 404);
    if (post.authorId !== req.user.userId) {
      return res.json({ error: "无权删除" }, 403);
    }

    db.collection("posts").remove(req.params.id);
    res.json({ message: "已删除" });
  });

  // ---- 评论 ----

  router.post("/api/posts/:id/comments", (req, res) => {
    const post = db.collection("posts").findById(req.params.id);
    if (!post) return res.json({ error: "文章不存在" }, 404);

    const { content, author } = req.body || {};
    if (!content) return res.json({ error: "评论内容必填" }, 400);

    const comment = db.collection("comments").insert({
      postId: req.params.id,
      content,
      author: req.user ? req.user.username : author || "匿名",
    });

    res.json({ comment }, 201);
  });

  // ---- 标签 ----

  router.get("/api/tags", (req, res) => {
    const posts = db.collection("posts").findAll();
    const tagMap = {};
    posts.forEach((p) => {
      (p.tags || []).forEach((t) => {
        tagMap[t] = (tagMap[t] || 0) + 1;
      });
    });
    const tags = Object.entries(tagMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    res.json({ tags });
  });

  return router;
}

module.exports = createApiRouter;
