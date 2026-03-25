/**
 * 全栈博客 - SSR 页面路由
 *
 * 职责: 服务端渲染 HTML 页面 (SEO 友好)
 */

const Router = require("../router");
const { markdown } = require("../markdown");
const {
  renderTemplate,
  layoutTemplate,
  postListTemplate,
  postDetailTemplate,
} = require("../template");

function createPageRouter(db) {
  const router = new Router();

  // 首页 → 文章列表
  router.get("/", (req, res) => {
    return renderPostList(req, res, db);
  });

  router.get("/posts", (req, res) => {
    return renderPostList(req, res, db);
  });

  // 文章详情
  router.get("/posts/:id", (req, res) => {
    const post = db.collection("posts").findById(req.params.id);
    if (!post) {
      return res.html(renderPage("404", "<h1>文章不存在</h1>", req), 404);
    }

    const comments = db.collection("comments").findAll({ postId: post.id });

    const content = renderTemplate(postDetailTemplate, {
      ...post,
      htmlContent: markdown(post.content),
      commentCount: comments.length,
      comments,
    });

    res.html(renderPage(post.title, content, req));
  });

  return router;
}

function renderPostList(req, res, db) {
  const query = {};
  if (req.query.search) query.$search = req.query.search;
  if (req.query.tag) query.$tag = req.query.tag;
  query.$sort = "createdAt:desc";

  const posts = db.collection("posts").findAll(query).map((p) => ({
    ...p,
    summary: (p.content || "").slice(0, 150) + "...",
  }));

  const content = renderTemplate(postListTemplate, { posts });
  res.html(renderPage("文章列表", content, req));
}

function renderPage(title, content, req) {
  return renderTemplate(layoutTemplate, {
    title,
    description: `Mini Blog - ${title}`,
    content,
    user: req.user,
  });
}

module.exports = createPageRouter;
