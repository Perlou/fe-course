/**
 * 全栈博客 - SSR 模板引擎
 *
 * 职责: 服务端渲染 HTML 页面
 * 原理: 字符串模板替换 + 循环/条件支持
 *
 * 语法:
 *   {{ variable }}           — 变量输出
 *   {{# items }}...{{/ }}    — 循环
 *   {{? condition }}...{{/ }} — 条件
 */

function renderTemplate(template, data) {
  let result = template;

  // 1. 循环: {{# items }} ... {{/ }}
  result = result.replace(
    /\{\{#\s*(\w+)\s*\}\}([\s\S]*?)\{\{\/\s*\}\}/g,
    (_, key, body) => {
      const arr = data[key];
      if (!Array.isArray(arr)) return "";
      return arr.map((item) => renderTemplate(body, { ...data, ...item, $item: item })).join("");
    }
  );

  // 2. 条件: {{? condition }} ... {{/ }}
  result = result.replace(
    /\{\{\?\s*(\w+)\s*\}\}([\s\S]*?)\{\{\/\s*\}\}/g,
    (_, key, body) => {
      return data[key] ? renderTemplate(body, data) : "";
    }
  );

  // 3. 变量: {{ variable }}
  result = result.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    const keys = key.split(".");
    let value = data;
    for (const k of keys) {
      value = value?.[k];
    }
    return value !== undefined ? String(value) : "";
  });

  return result;
}

// ============= 页面模板 =============

const layoutTemplate = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ title }} - Mini Blog</title>
  <meta name="description" content="{{ description }}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    nav { background: #2563eb; color: white; padding: 16px; }
    nav a { color: white; text-decoration: none; margin-right: 16px; }
    .card { background: white; border-radius: 8px; padding: 20px; margin: 16px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .tag { display: inline-block; background: #e5e7eb; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin: 2px; }
    h1 { margin-bottom: 16px; } h2 { margin-bottom: 12px; }
    .meta { color: #666; font-size: 14px; }
    pre { background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 6px; overflow-x: auto; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 3px; }
    pre code { background: none; }
    blockquote { border-left: 3px solid #2563eb; padding-left: 12px; color: #555; }
  </style>
</head>
<body>
  <nav>
    <a href="/">🏠 首页</a>
    <a href="/posts">📝 文章</a>
    {{? user }}<span style="float:right">👤 {{ user.username }}</span>{{/ }}
  </nav>
  <div class="container">
    {{ content }}
  </div>
</body>
</html>`;

const postListTemplate = `
<h1>📝 全部文章</h1>
{{# posts }}
<div class="card">
  <h2><a href="/posts/{{ id }}">{{ title }}</a></h2>
  <p class="meta">{{ author }} · {{ createdAt }}</p>
  <p>{{ summary }}</p>
  <div>{{# tags }}<span class="tag">{{ $item }}</span>{{/ }}</div>
</div>
{{/ }}
`;

const postDetailTemplate = `
<div class="card">
  <h1>{{ title }}</h1>
  <p class="meta">{{ author }} · {{ createdAt }}</p>
  <div>{{# tags }}<span class="tag">{{ $item }}</span>{{/ }}</div>
  <hr style="margin: 16px 0">
  <div>{{ htmlContent }}</div>
</div>
<h2>💬 评论 ({{ commentCount }})</h2>
{{# comments }}
<div class="card">
  <p><strong>{{ author }}</strong> · {{ createdAt }}</p>
  <p>{{ content }}</p>
</div>
{{/ }}
`;

module.exports = {
  renderTemplate,
  layoutTemplate,
  postListTemplate,
  postDetailTemplate,
};
