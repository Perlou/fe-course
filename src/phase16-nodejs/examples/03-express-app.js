// Express 框架详解
// 运行: node 03-express-app.js (模拟 Express 核心原理，无需安装依赖)

console.log("=== Express 框架核心 ===\n");

// ========== 1. 手写简化版 Express ==========
console.log("1. 手写简化版 Express\n");

function createApp() {
  const middlewares = [];
  const routes = { GET: [], POST: [], PUT: [], DELETE: [] };

  const app = function (req, res) {
    // 执行中间件链
    let idx = 0;
    const allHandlers = [...middlewares];

    // 匹配路由
    const routeList = routes[req.method] || [];
    for (const route of routeList) {
      const match = matchRoute(route.path, req.url);
      if (match) {
        req.params = match.params;
        allHandlers.push(route.handler);
      }
    }

    function next(err) {
      if (err) {
        // 找错误处理中间件 (4个参数)
        const errorHandler = middlewares.find((fn) => fn.length === 4);
        if (errorHandler) errorHandler(err, req, res, () => {});
        return;
      }
      const handler = allHandlers[idx++];
      if (handler) {
        try {
          handler(req, res, next);
        } catch (e) {
          next(e);
        }
      }
    }

    next();
  };

  // 路由匹配
  function matchRoute(pattern, url) {
    const urlPath = url.split("?")[0];
    const patternParts = pattern.split("/");
    const urlParts = urlPath.split("/");

    if (patternParts.length !== urlParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(":")) {
        params[patternParts[i].slice(1)] = urlParts[i];
      } else if (patternParts[i] !== urlParts[i]) {
        return null;
      }
    }
    return { params };
  }

  // 中间件
  app.use = (fn) => middlewares.push(fn);

  // 路由方法
  ["get", "post", "put", "delete"].forEach((method) => {
    app[method] = (path, handler) => {
      routes[method.toUpperCase()].push({ path, handler });
    };
  });

  return app;
}

// 测试手写 Express
const app = createApp();

// 中间件: 日志
app.use((req, res, next) => {
  console.log(`  [LOG] ${req.method} ${req.url}`);
  next();
});

// 中间件: 解析 JSON body
app.use((req, res, next) => {
  if (req.body && typeof req.body === "string") {
    try {
      req.body = JSON.parse(req.body);
    } catch (e) {}
  }
  next();
});

// 路由
app.get("/api/users", (req, res, next) => {
  res.json = (data) => console.log(`  [RES] ${JSON.stringify(data)}`);
  res.json({ users: [{ id: 1, name: "Alice" }] });
});

app.get("/api/users/:id", (req, res, next) => {
  res.json = (data) => console.log(`  [RES] ${JSON.stringify(data)}`);
  res.json({ id: req.params.id, name: "User " + req.params.id });
});

// 模拟请求
console.log("  模拟 GET /api/users:");
app({ method: "GET", url: "/api/users" }, {});

console.log("\n  模拟 GET /api/users/42:");
app({ method: "GET", url: "/api/users/42" }, {});

// ========== 2. 中间件执行顺序 ==========
console.log("\n2. 中间件执行顺序\n");

console.log(`
  请求 → [cors] → [bodyParser] → [logger] → [auth] → [路由] → 响应
                                                         ↓
                                                    [errorHandler]

  中间件类型:
  ┌──────────────────┬────────────────────────────────────┐
  │ 类型             │ 说明                                │
  ├──────────────────┼────────────────────────────────────┤
  │ 应用级           │ app.use(fn)                        │
  │ 路由级           │ router.use(fn)                     │
  │ 错误处理         │ app.use((err, req, res, next) => {})│
  │ 内置             │ express.json(), express.static()   │
  │ 第三方           │ cors, helmet, morgan               │
  └──────────────────┴────────────────────────────────────┘
`);

// ========== 3. 路由模块化 ==========
console.log("3. 路由模块化\n");

console.log(`
  // routes/users.js
  const router = require('express').Router();

  // 路由级中间件
  router.use((req, res, next) => {
    console.log('Users 路由中间件');
    next();
  });

  router.get('/', async (req, res) => {
    const { page = 1, limit = 10, sort = 'id' } = req.query;
    const users = await User.findAll({ page, limit, sort });
    res.json({ data: users, meta: { page, limit, total: 100 } });
  });

  router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json({ data: user });
  });

  router.post('/', validateBody(createUserSchema), async (req, res) => {
    const user = await User.create(req.body);
    res.status(201).json({ data: user });
  });

  router.put('/:id', async (req, res) => {
    const user = await User.update(req.params.id, req.body);
    res.json({ data: user });
  });

  router.delete('/:id', async (req, res) => {
    await User.delete(req.params.id);
    res.status(204).end();
  });

  module.exports = router;

  // app.js
  app.use('/api/users', require('./routes/users'));
  app.use('/api/posts', require('./routes/posts'));
  app.use('/api/auth', require('./routes/auth'));
`);

// ========== 4. 常用第三方中间件 ==========
console.log("4. 常用第三方中间件\n");

console.log(`
  ┌────────────────────┬──────────────────────────────────┐
  │ 中间件              │ 功能                             │
  ├────────────────────┼──────────────────────────────────┤
  │ cors               │ 跨域资源共享                     │
  │ helmet             │ 安全 HTTP 头                     │
  │ morgan             │ 请求日志                         │
  │ express-rate-limit │ 请求限流                         │
  │ compression        │ Gzip 压缩                        │
  │ cookie-parser      │ Cookie 解析                      │
  │ express-validator  │ 请求参数验证                     │
  │ multer             │ 文件上传                         │
  │ express-session    │ 会话管理                         │
  │ passport           │ 认证策略                         │
  └────────────────────┴──────────────────────────────────┘

  // 典型 app.js 配置
  const express = require('express');
  const cors = require('cors');
  const helmet = require('helmet');
  const morgan = require('morgan');
  const rateLimit = require('express-rate-limit');

  const app = express();

  // 安全
  app.use(helmet());
  app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

  // 解析
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // 日志
  app.use(morgan('combined'));

  // 限流
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

  // 路由
  app.use('/api', require('./routes'));

  // 错误处理
  app.use(errorHandler);
`);

// ========== 5. 错误处理最佳实践 ==========
console.log("5. 错误处理最佳实践\n");

// AppError 类
class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// asyncHandler 包装
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

console.log(`
  // 使用 AppError + asyncHandler
  app.get('/api/users/:id', asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError(404, 'User not found');
    res.json({ data: user });
  }));

  // 全局错误处理
  app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.isOperational ? err.message : 'Internal Server Error';

    if (!err.isOperational) console.error('未预期:', err);

    res.status(statusCode).json({
      error: message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  });
`);

console.log("=== Express 完成 ===");
