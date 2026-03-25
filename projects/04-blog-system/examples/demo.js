/**
 * 全栈博客 - 完整功能演示
 *
 * 运行: node examples/demo.js
 *
 * 模拟完整的博客系统操作流程:
 *   1. 用户注册/登录 (JWT)
 *   2. 创建文章 (Markdown)
 *   3. 文章列表/详情查询
 *   4. 添加评论
 *   5. 搜索/标签过滤
 *   6. Markdown 渲染
 *   7. SSR 模板引擎
 */

const path = require("path");
const Database = require("../src/db");
const {
  generateToken,
  verifyToken,
  hashPassword,
  verifyPassword,
} = require("../src/auth");
const { markdown } = require("../src/markdown");
const { renderTemplate } = require("../src/template");

// 使用临时数据库
const db = new Database(path.join(__dirname, "../data-demo"));

console.log("=== 全栈博客系统完整演示 ===\n");

// ========== 1. 用户注册 ==========
console.log("1. 用户注册 (密码哈希 + JWT)\n");

const hashedPwd = hashPassword("password123");
console.log(`  密码哈希: ${hashedPwd.slice(0, 40)}...`);
console.log(`  验证正确密码: ${verifyPassword("password123", hashedPwd) ? "✅" : "❌"}`);
console.log(`  验证错误密码: ${verifyPassword("wrong", hashedPwd) ? "✅" : "❌"}`);

const user = db.collection("users").insert({
  username: "zhangsan",
  email: "zhangsan@example.com",
  password: hashedPwd,
  role: "admin",
});

console.log(`  用户创建: ${user.username} (${user.id.slice(0, 8)}...)`);

// ========== 2. JWT Token ==========
console.log("\n2. JWT Token 生成与验证\n");

const token = generateToken({ userId: user.id, username: user.username });
console.log(`  Token: ${token.slice(0, 50)}...`);

const decoded = verifyToken(token);
console.log(`  解码: userId=${decoded.userId.slice(0, 8)}..., username=${decoded.username}`);
console.log(`  过期: ${new Date(decoded.exp).toLocaleString()}`);

const invalidCheck = verifyToken("invalid.token.here");
console.log(`  无效 Token: ${invalidCheck === null ? "✅ 拒绝" : "❌ 通过"}`);

// ========== 3. 创建文章 ==========
console.log("\n3. 创建文章 (Markdown 内容)\n");

const posts = [
  {
    title: "理解 JavaScript 闭包",
    content: `# 闭包 (Closure)

闭包是指**函数能够记住并访问其词法作用域**，即使函数在其作用域之外执行。

## 示例

\`\`\`javascript
function createCounter() {
  let count = 0;
  return () => ++count;
}
const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
\`\`\`

> 闭包是 JavaScript 最强大的特性之一

闭包常见用途:
- 数据封装
- 函数工厂
- 回调函数`,
    tags: ["JavaScript", "前端基础"],
    author: user.username,
    authorId: user.id,
  },
  {
    title: "Node.js Stream 深入",
    content: `# Stream 流

Stream 是 Node.js 处理大数据的核心机制。

## 四种类型
- **Readable** — 可读流
- **Writable** — 可写流
- **Duplex** — 双工流
- **Transform** — 转换流`,
    tags: ["Node.js", "后端"],
    author: user.username,
    authorId: user.id,
  },
  {
    title: "CSS Grid 布局实战",
    content: `# CSS Grid

Grid 布局是最强大的 CSS 布局方案。

## 基本用法

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
\`\`\``,
    tags: ["CSS", "前端基础"],
    author: user.username,
    authorId: user.id,
  },
];

const createdPosts = posts.map((p) => db.collection("posts").insert(p));
createdPosts.forEach((p) => {
  console.log(`  📝 [${p.id.slice(0, 8)}] ${p.title} (${p.tags.join(", ")})`);
});

// ========== 4. 文章查询 ==========
console.log("\n4. 文章查询\n");

const allPosts = db.collection("posts").findAll({ $sort: "createdAt:desc" });
console.log(`  全部文章: ${allPosts.length} 篇`);

const jsPosts = db.collection("posts").findAll({ $tag: "JavaScript" });
console.log(`  JavaScript 标签: ${jsPosts.length} 篇`);

const searchResults = db.collection("posts").findAll({ $search: "闭包" });
console.log(`  搜索 "闭包": ${searchResults.length} 篇 → ${searchResults.map((p) => p.title).join(", ")}`);

// ========== 5. 评论 ==========
console.log("\n5. 评论系统\n");

const post1 = createdPosts[0];
const comments = [
  { postId: post1.id, content: "写得很好！终于理解闭包了", author: "lisi" },
  { postId: post1.id, content: "代码示例很清晰 👍", author: "wangwu" },
];

comments.forEach((c) => {
  const created = db.collection("comments").insert(c);
  console.log(`  💬 ${created.author}: ${created.content}`);
});

const postComments = db.collection("comments").findAll({ postId: post1.id });
console.log(`  文章 "${post1.title}" 的评论数: ${postComments.length}`);

// ========== 6. Markdown 渲染 ==========
console.log("\n6. Markdown → HTML 渲染\n");

const htmlOutput = markdown(post1.content);
console.log("  输入 (Markdown):");
console.log("  " + post1.content.split("\n").slice(0, 3).join("\n  ") + "...");
console.log("\n  输出 (HTML):");
console.log("  " + htmlOutput.split("\n").slice(0, 5).join("\n  ") + "...");

// ========== 7. SSR 模板引擎 ==========
console.log("\n7. SSR 模板引擎\n");

const template = `文章: {{ title }}\n作者: {{ author }}\n标签: {{# tags }}<span>{{ $item }}</span> {{/ }}`;

const rendered = renderTemplate(template, {
  title: post1.title,
  author: post1.author,
  tags: post1.tags,
});

console.log(`  模板: ${template.split("\n")[0]}`);
console.log(`  渲染: ${rendered.split("\n")[0]}`);

// ========== 8. 标签统计 ==========
console.log("\n8. 标签统计\n");

const tagMap = {};
allPosts.forEach((p) => {
  (p.tags || []).forEach((t) => {
    tagMap[t] = (tagMap[t] || 0) + 1;
  });
});
Object.entries(tagMap)
  .sort((a, b) => b[1] - a[1])
  .forEach(([tag, count]) => {
    console.log(`  🏷️  ${tag}: ${count} 篇`);
  });

// ========== 9. 数据库统计 ==========
console.log("\n9. 数据库统计\n");
console.log(`  用户: ${db.collection("users").count()} 个`);
console.log(`  文章: ${db.collection("posts").count()} 篇`);
console.log(`  评论: ${db.collection("comments").count()} 条`);
console.log(`  标签: ${Object.keys(tagMap).length} 个`);

// 清理演示数据
const fs = require("fs");
const demoDir = path.join(__dirname, "../data-demo");
if (fs.existsSync(demoDir)) {
  fs.readdirSync(demoDir).forEach((f) =>
    fs.unlinkSync(path.join(demoDir, f))
  );
  fs.rmdirSync(demoDir);
}

console.log("\n=== 全栈博客演示完成 ===");
console.log("\n💡 启动服务器: node src/app.js");
console.log("   然后访问: http://localhost:3000\n");
