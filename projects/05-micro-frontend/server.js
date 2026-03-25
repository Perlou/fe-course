/**
 * 微前端开发服务器
 *
 * 零依赖 HTTP 服务器，同时托管:
 *   - 主应用    → /
 *   - 框架模块  → /framework/
 *   - 子应用 A  → /sub-apps/react/
 *   - 子应用 B  → /sub-apps/vue/
 *
 * 运行: node server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

// MIME 类型映射
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

// URL → 文件路径映射
const routeMap = [
  // 框架模块
  { prefix: '/framework/', dir: path.join(ROOT, 'packages/framework') },
  // 主应用静态资源
  { prefix: '/main-app/',  dir: path.join(ROOT, 'packages/main-app') },
  // 子应用 A (React 风格)
  { prefix: '/sub-apps/react/', dir: path.join(ROOT, 'packages/sub-app-react') },
  // 子应用 B (Vue 风格)
  { prefix: '/sub-apps/vue/',   dir: path.join(ROOT, 'packages/sub-app-vue') },
];

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = url.pathname;

  // CORS 头 (微前端需要跨域加载)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 子应用 HTML 入口 (路径以 / 结尾时返回 index.html)
  for (const route of routeMap) {
    if (pathname === route.prefix || pathname === route.prefix.slice(0, -1)) {
      const indexFile = path.join(route.dir, 'index.html');
      if (fs.existsSync(indexFile)) {
        serveFile(res, indexFile);
        return;
      }
    }
  }

  // 静态文件匹配
  for (const route of routeMap) {
    if (pathname.startsWith(route.prefix)) {
      const relPath = pathname.slice(route.prefix.length);
      const filePath = path.join(route.dir, relPath);

      // 安全检查
      if (!filePath.startsWith(route.dir)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        serveFile(res, filePath);
        return;
      }
    }
  }

  // 主应用入口 (所有非静态资源路径都返回 index.html → SPA 回退)
  const mainIndex = path.join(ROOT, 'packages/main-app/index.html');
  if (fs.existsSync(mainIndex)) {
    serveFile(res, mainIndex);
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Not Found');
});

function serveFile(res, filePath) {
  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';

  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': content.length,
      'Cache-Control': 'no-cache',
    });
    res.end(content);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Server Error: ${err.message}`);
  }
}

server.listen(PORT, () => {
  console.log(`\n🏗️  微前端开发服务器已启动\n`);
  console.log(`   主应用:    http://localhost:${PORT}/`);
  console.log(`   仪表盘:    http://localhost:${PORT}/dashboard`);
  console.log(`   设置中心:  http://localhost:${PORT}/settings`);
  console.log(`\n   子应用入口:`);
  console.log(`   React:     http://localhost:${PORT}/sub-apps/react/`);
  console.log(`   Vue:       http://localhost:${PORT}/sub-apps/vue/`);
  console.log();
});
