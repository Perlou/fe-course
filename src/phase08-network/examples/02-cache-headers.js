// HTTP 缓存策略详解
// 运行: node 02-cache-headers.js
// 本文件通过 Node.js HTTP 服务器演示缓存头的工作原理

const http = require("http");
const crypto = require("crypto");
const path = require("path");

console.log("=== HTTP 缓存策略详解 ===\n");

// ========== 1. 缓存策略概览 ==========
console.log("1. 缓存策略概览");

console.log(`
  ┌─────────────────────────────────────────────────────────────┐
  │                        缓存判断流程                           │
  ├─────────────────────────────────────────────────────────────┤
  │                                                             │
  │  请求 → 有缓存?                                              │
  │           │                                                  │
  │          是 → 强缓存有效? (Cache-Control / Expires)           │
  │                 │                                            │
  │                是 → 直接使用缓存 (200 from cache)              │
  │                否 → 协商缓存 (发送 If-None-Match / If-Modified)│
  │                      │                                       │
  │                    资源变了? → 否 → 304 使用缓存               │
  │                                → 是 → 200 返回新资源          │
  │                                                              │
  └─────────────────────────────────────────────────────────────┘
`);

// ========== 2. 模拟资源 ==========
const resources = {
  "/": {
    contentType: "text/html",
    body: `<!DOCTYPE html>
<html><head><title>缓存测试</title></head>
<body>
  <h1>HTTP 缓存测试页面</h1>
  <p>打开 DevTools → Network 面板观察缓存效果</p>
  <link rel="stylesheet" href="/style.css">
  <script src="/app.js"></script>
  <img src="/logo.png" alt="logo">
</body></html>`,
  },

  "/style.css": {
    contentType: "text/css",
    body: "body { font-family: sans-serif; color: #333; }",
  },

  "/app.js": {
    contentType: "application/javascript",
    body: 'console.log("Hello from cached script!");',
  },

  "/api/data": {
    contentType: "application/json",
    body: JSON.stringify({ message: "动态数据", timestamp: Date.now() }),
  },
};

// ========== 3. 计算 ETag ==========
function generateETag(content) {
  return '"' + crypto.createHash("md5").update(content).digest("hex").substring(0, 16) + '"';
}

// ========== 4. 创建缓存演示服务器 ==========
console.log("2. 缓存策略示例\n");

const server = http.createServer((req, res) => {
  const url = req.url.split("?")[0];

  console.log(`  → ${req.method} ${url}`);

  // ---- HTML: 协商缓存 (每次都验证) ----
  if (url === "/") {
    const resource = resources["/"];
    const etag = generateETag(resource.body);
    const lastModified = new Date("2024-01-01").toUTCString();

    // 检查协商缓存
    if (req.headers["if-none-match"] === etag) {
      console.log("    ← 304 Not Modified (ETag 匹配)");
      res.writeHead(304);
      res.end();
      return;
    }

    console.log("    ← 200 OK (协商缓存: no-cache)");
    res.writeHead(200, {
      "Content-Type": resource.contentType,
      "Cache-Control": "no-cache", // 每次都协商
      ETag: etag,
      "Last-Modified": lastModified,
    });
    res.end(resource.body);
    return;
  }

  // ---- CSS/JS: 强缓存 (1年，通过文件名hash更新) ----
  if (url === "/style.css" || url === "/app.js") {
    const resource = resources[url];

    console.log("    ← 200 OK (强缓存: max-age=31536000)");
    res.writeHead(200, {
      "Content-Type": resource.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: generateETag(resource.body),
    });
    res.end(resource.body);
    return;
  }

  // ---- API: 不缓存 ----
  if (url === "/api/data") {
    const data = JSON.stringify({
      message: "动态数据",
      timestamp: Date.now(),
    });

    console.log("    ← 200 OK (不缓存: no-store)");
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Cache-Control": "no-store", // 完全不缓存
      Pragma: "no-cache",
    });
    res.end(data);
    return;
  }

  // ---- 图片: 带协商缓存的强缓存 ----
  if (url === "/logo.png") {
    const body = "fake-image-data";
    const etag = generateETag(body);

    if (req.headers["if-none-match"] === etag) {
      console.log("    ← 304 Not Modified");
      res.writeHead(304);
      res.end();
      return;
    }

    console.log("    ← 200 OK (缓存: max-age=86400 + ETag)");
    res.writeHead(200, {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400", // 1天
      ETag: etag,
    });
    res.end(body);
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

// ========== 5. 缓存头对照表 ==========
console.log("3. Cache-Control 指令详解");

console.log(`
  ┌────────────────────┬──────────────────────────────────────────┐
  │ 指令               │ 说明                                      │
  ├────────────────────┼──────────────────────────────────────────┤
  │ max-age=N          │ 缓存有效期 (秒)                            │
  │ s-maxage=N         │ CDN 缓存有效期 (覆盖 max-age)              │
  │ no-cache           │ 可以缓存，但每次使用前必须协商验证            │
  │ no-store           │ 完全不缓存                                  │
  │ public             │ 可被 CDN 等中间代理缓存                     │
  │ private            │ 只能被浏览器缓存                            │
  │ immutable          │ 资源不会变化，不需要协商                     │
  │ must-revalidate    │ 缓存过期后必须向源站验证                     │
  │ stale-while-       │ 缓存过期后仍可使用，同时后台重新验证          │
  │   revalidate=N     │                                            │
  └────────────────────┴──────────────────────────────────────────┘
`);

// ========== 6. 实际缓存策略方案 ==========
console.log("4. 实际缓存策略方案");

console.log(`
  现代前端项目缓存方案:

  ┌──────────────────────────────────────────────────────────────┐
  │  index.html                                                  │
  │  Cache-Control: no-cache                                     │
  │  → 每次协商验证，确保入口文件最新                                │
  │                                                               │
  │  app.[hash].js / style.[hash].css                             │
  │  Cache-Control: public, max-age=31536000, immutable          │
  │  → 文件名带 hash，内容变化 → hash 变化 → 自动更新               │
  │                                                               │
  │  /api/*                                                       │
  │  Cache-Control: no-store                                      │
  │  → 动态数据不缓存                                              │
  │                                                               │
  │  /static/images/*                                             │
  │  Cache-Control: public, max-age=86400                         │
  │  ETag: "xxxx"                                                  │
  │  → 图片缓存 1 天 + 协商缓存兜底                                │
  └──────────────────────────────────────────────────────────────┘

  Nginx 配置示例:
  ┌──────────────────────────────────────────────────────────────┐
  │  # HTML 文件                                                  │
  │  location / {                                                 │
  │    add_header Cache-Control "no-cache";                       │
  │  }                                                            │
  │                                                               │
  │  # 静态资源 (带 hash)                                         │
  │  location ~* \\.(js|css|png|jpg|svg|woff2)$ {                 │
  │    add_header Cache-Control "public, max-age=31536000";       │
  │  }                                                            │
  │                                                               │
  │  # API 接口                                                   │
  │  location /api/ {                                             │
  │    add_header Cache-Control "no-store";                       │
  │  }                                                            │
  └──────────────────────────────────────────────────────────────┘
`);

// ========== 7. 启动服务器 ==========
const PORT = 3456;

server.listen(PORT, () => {
  console.log(`\n  🚀 缓存演示服务器运行在: http://localhost:${PORT}`);
  console.log("  在浏览器中访问并观察 Network 面板的缓存行为");
  console.log("  按 Ctrl+C 停止服务器\n");
});

// 5秒后自动关闭（演示用）
setTimeout(() => {
  server.close();
  console.log("  服务器已自动关闭（演示完毕）");
  console.log("\n=== 缓存策略完成 ===");
}, 5000);
