// CORS 跨域与安全防护示例
// 运行: node 03-cors-example.js
// 创建两个服务器模拟跨域场景

const http = require("http");

console.log("=== CORS 跨域与安全防护 ===\n");

// ========== 1. 同源策略 ==========
console.log("1. 同源策略");

console.log(`
  同源 = 协议 + 域名 + 端口 完全相同

  http://example.com/page1
  http://example.com/page2       ✅ 同源
  https://example.com/page1      ❌ 协议不同 (http vs https)
  http://api.example.com/page1   ❌ 域名不同
  http://example.com:8080/page1  ❌ 端口不同

  同源策略限制:
  • DOM 访问: 不同源的 iframe 无法操作 DOM
  • Cookie: 不同源不共享 Cookie
  • AJAX: 不同源的请求被拦截
  • 不限制: <script> <img> <link> <video> 标签
`);

// ========== 2. CORS 详解 ==========
console.log("2. CORS 详解");

console.log(`
  简单请求 (不触发预检):
  ┌────────────────────────────────────────────┐
  │ 条件:                                       │
  │ 1. 方法: GET / HEAD / POST                  │
  │ 2. 头部: 仅允许安全头部                       │
  │    Accept, Accept-Language, Content-Language  │
  │    Content-Type (仅 3 种值)                   │
  │ 3. Content-Type: text/plain                  │
  │    application/x-www-form-urlencoded         │
  │    multipart/form-data                       │
  └────────────────────────────────────────────┘

  预检请求 (Preflight):
  ┌────────────────────────────────────────────┐
  │ 触发条件 (任一即触发):                       │
  │ 1. 方法: PUT / DELETE / PATCH               │
  │ 2. 自定义请求头 (如 Authorization)           │
  │ 3. Content-Type: application/json           │
  └────────────────────────────────────────────┘

  预检流程:
  Browser                           Server
    │── OPTIONS /api/data ──────────→│
    │   Origin: http://localhost:3000│
    │   Access-Control-Request-Method: POST
    │   Access-Control-Request-Headers: Content-Type
    │                                  │
    │←── 204 ──────────────────────── │
    │   Access-Control-Allow-Origin: *│
    │   Access-Control-Allow-Methods:│
    │     GET, POST, PUT, DELETE      │
    │   Access-Control-Max-Age: 86400│
    │                                  │
    │── POST /api/data ──────────────→│  (实际请求)
    │                                  │
    │←── 200 ──────────────────────── │
`);

// ========== 3. 创建 API 服务器 (端口 4001) ==========

// CORS 中间件
function corsMiddleware(req, res, allowedOrigins = ["*"]) {
  const origin = req.headers.origin;

  // 检查是否允许该 origin
  if (allowedOrigins.includes("*")) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin"); // 根据 Origin 变化缓存
  } else {
    return false; // 不允许
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400"); // 预检缓存 24 小时
  res.setHeader("Access-Control-Expose-Headers", "X-Total-Count, X-Request-Id");

  return true;
}

const apiServer = http.createServer((req, res) => {
  // 处理 CORS
  const allowed = corsMiddleware(req, res, [
    "http://localhost:4000",
    "http://localhost:3000",
  ]);

  if (!allowed) {
    res.writeHead(403, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Origin not allowed" }));
    return;
  }

  // 处理预检请求
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // API 路由
  if (req.url === "/api/data" && req.method === "GET") {
    res.writeHead(200, {
      "Content-Type": "application/json",
      "X-Total-Count": "100",
      "X-Request-Id": "req-" + Date.now(),
    });
    res.end(
      JSON.stringify({
        message: "CORS 请求成功!",
        timestamp: new Date().toISOString(),
        items: [
          { id: 1, name: "Item 1" },
          { id: 2, name: "Item 2" },
        ],
      }),
    );
    return;
  }

  if (req.url === "/api/data" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "创建成功",
          data: JSON.parse(body || "{}"),
        }),
      );
    });
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

// ========== 4. 创建前端服务器 (端口 4000) ==========

const frontendServer = http.createServer((req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`<!DOCTYPE html>
<html><head><title>CORS 测试</title></head>
<body>
<h1>CORS 跨域测试</h1>
<pre id="output">点击按钮测试跨域请求...</pre>
<button onclick="testSimpleRequest()">简单请求 (GET)</button>
<button onclick="testPreflightRequest()">预检请求 (POST JSON)</button>
<button onclick="testCredentials()">携带凭证请求</button>

<script>
const API = 'http://localhost:4001';
const output = document.getElementById('output');

function log(msg) {
  output.textContent += '\\n' + msg;
}

// 1. 简单请求
async function testSimpleRequest() {
  output.textContent = '发送简单 GET 请求...';
  try {
    const res = await fetch(API + '/api/data');
    const data = await res.json();
    log('✅ 成功: ' + JSON.stringify(data, null, 2));
    log('X-Total-Count: ' + res.headers.get('X-Total-Count'));
  } catch (e) {
    log('❌ 失败: ' + e.message);
  }
}

// 2. 预检请求 (POST + JSON → 触发 OPTIONS)
async function testPreflightRequest() {
  output.textContent = '发送预检请求 (POST + JSON)...';
  try {
    const res = await fetch(API + '/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '测试数据' }),
    });
    const data = await res.json();
    log('✅ 成功: ' + JSON.stringify(data, null, 2));
  } catch (e) {
    log('❌ 失败: ' + e.message);
  }
}

// 3. 携带凭证
async function testCredentials() {
  output.textContent = '发送携带凭证请求...';
  try {
    const res = await fetch(API + '/api/data', {
      credentials: 'include',
    });
    const data = await res.json();
    log('✅ 成功: ' + JSON.stringify(data, null, 2));
  } catch (e) {
    log('❌ 失败: ' + e.message);
  }
}
</script>
</body></html>`);
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

// ========== 5. XSS 防护工具函数 ==========
console.log("3. XSS 防护");

// HTML 转义
function escapeHtml(str) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };
  return str.replace(/[&<>"'/]/g, (char) => map[char]);
}

console.log("  转义测试:");
console.log("  输入:", '<script>alert("xss")</script>');
console.log("  输出:", escapeHtml('<script>alert("xss")</script>'));

// CSP 策略生成
function generateCSP(config) {
  const directives = [];

  if (config.defaultSrc) directives.push(`default-src ${config.defaultSrc.join(" ")}`);
  if (config.scriptSrc) directives.push(`script-src ${config.scriptSrc.join(" ")}`);
  if (config.styleSrc) directives.push(`style-src ${config.styleSrc.join(" ")}`);
  if (config.imgSrc) directives.push(`img-src ${config.imgSrc.join(" ")}`);
  if (config.connectSrc) directives.push(`connect-src ${config.connectSrc.join(" ")}`);
  if (config.fontSrc) directives.push(`font-src ${config.fontSrc.join(" ")}`);
  if (config.frameSrc) directives.push(`frame-src ${config.frameSrc.join(" ")}`);

  return directives.join("; ");
}

const csp = generateCSP({
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "https://cdn.example.com"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "https:"],
  connectSrc: ["'self'", "https://api.example.com"],
});

console.log("\n  CSP 策略:", csp);

// ========== 6. CSRF Token 模拟 ==========
console.log("\n4. CSRF 防护");

function generateCSRFToken() {
  return require("crypto").randomBytes(32).toString("hex");
}

const token = generateCSRFToken();
console.log("  CSRF Token:", token.substring(0, 16) + "...");

console.log(`
  CSRF 防护方案:
  ┌──────────────────┬──────────────────────────────────────┐
  │ CSRF Token       │ 服务端生成，嵌入表单，请求时验证       │
  │ SameSite Cookie  │ Strict (最安全) / Lax (推荐默认)      │
  │ Origin 验证      │ 检查 Origin / Referer 头              │
  │ 二次确认          │ 敏感操作需输入密码/验证码              │
  └──────────────────┴──────────────────────────────────────┘

  Cookie 安全设置:
  Set-Cookie: session=abc123;
    HttpOnly;          // JS 无法读取 (防 XSS 窃取)
    Secure;            // 仅 HTTPS 传输
    SameSite=Lax;      // 限制跨站发送 (防 CSRF)
    Path=/;            // 作用路径
    Max-Age=86400;     // 过期时间
`);

// ========== 7. 安全头信息 ==========
console.log("5. 安全响应头");

console.log(`
  # 安全响应头配置 (Nginx 示例)

  # 防止 MIME 类型嗅探
  add_header X-Content-Type-Options "nosniff";

  # 防止点击劫持
  add_header X-Frame-Options "SAMEORIGIN";

  # XSS 过滤器 (旧浏览器)
  add_header X-XSS-Protection "1; mode=block";

  # 严格传输安全 (强制 HTTPS)
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

  # 引用策略 (防止信息泄漏)
  add_header Referrer-Policy "strict-origin-when-cross-origin";

  # 权限策略 (限制浏览器功能)
  add_header Permissions-Policy "camera=(), microphone=(), geolocation=()";

  # 内容安全策略
  add_header Content-Security-Policy "default-src 'self'; script-src 'self'";
`);

// ========== 8. 启动服务器 ==========
const API_PORT = 4001;
const FRONTEND_PORT = 4000;

apiServer.listen(API_PORT, () => {
  console.log(`  🔧 API 服务器: http://localhost:${API_PORT}`);
});

frontendServer.listen(FRONTEND_PORT, () => {
  console.log(`  🌐 前端服务器: http://localhost:${FRONTEND_PORT}`);
  console.log("\n  在浏览器访问 http://localhost:4000 测试 CORS");
  console.log("  打开 DevTools → Network 面板观察预检请求");
  console.log("  按 Ctrl+C 停止服务器\n");
});

// 5秒后自动关闭
setTimeout(() => {
  apiServer.close();
  frontendServer.close();
  console.log("  服务器已自动关闭（演示完毕）");
  console.log("\n=== CORS 与安全防护完成 ===");
}, 5000);
