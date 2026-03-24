// Koa 框架详解
// 运行: node 04-koa-app.js (模拟 Koa 核心原理，无需安装依赖)

console.log("=== Koa 框架核心 ===\n");

// ========== 1. 手写 Koa 洋葱模型 ==========
console.log("1. 手写 Koa 洋葱模型\n");

// compose: 将中间件数组组合为一个执行链
function compose(middlewares) {
  return function (context) {
    let index = -1;

    function dispatch(i) {
      if (i <= index) return Promise.reject(new Error("next() 被多次调用"));
      index = i;

      const fn = middlewares[i];
      if (!fn) return Promise.resolve();

      try {
        // fn(ctx, next) — next 就是 dispatch(i + 1)
        return Promise.resolve(fn(context, () => dispatch(i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return dispatch(0);
  };
}

// 简化版 Koa
class MiniKoa {
  constructor() {
    this.middlewares = [];
  }

  use(fn) {
    this.middlewares.push(fn);
    return this;
  }

  // 创建上下文
  createContext(req) {
    return {
      request: req,
      response: { status: 200, body: null, headers: {} },
      // 代理属性
      get method() { return this.request.method; },
      get url() { return this.request.url; },
      get body() { return this.response.body; },
      set body(val) { this.response.body = val; },
      get status() { return this.response.status; },
      set status(val) { this.response.status = val; },
      set(key, val) { this.response.headers[key] = val; },
      state: {},
      params: {},
    };
  }

  async handleRequest(req) {
    const ctx = this.createContext(req);
    const fn = compose(this.middlewares);

    try {
      await fn(ctx);
      return ctx.response;
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = { error: err.message };
      return ctx.response;
    }
  }
}

// ========== 2. 洋葱模型演示 ==========
console.log("2. 洋葱模型执行顺序\n");

const app = new MiniKoa();

// 中间件 1: 计时
app.use(async (ctx, next) => {
  console.log("  → 中间件1: 开始计时");
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set("X-Response-Time", `${ms}ms`);
  console.log(`  ← 中间件1: 请求耗时 ${ms}ms`);
});

// 中间件 2: 日志
app.use(async (ctx, next) => {
  console.log(`  → 中间件2: ${ctx.method} ${ctx.url}`);
  await next();
  console.log(`  ← 中间件2: 状态码 ${ctx.status}`);
});

// 中间件 3: 业务逻辑
app.use(async (ctx, next) => {
  console.log("  → 中间件3: 处理业务逻辑");
  await new Promise((r) => setTimeout(r, 10)); // 模拟异步
  ctx.body = { message: "Hello Koa!" };
  console.log("  ← 中间件3: 设置响应");
});

// 模拟请求
app.handleRequest({ method: "GET", url: "/api/hello" }).then((res) => {
  console.log(`  最终响应: ${JSON.stringify(res.body)}`);
  console.log(`  响应头: ${JSON.stringify(res.headers)}`);
});

// ========== 3. 错误处理 ==========
setTimeout(() => {
  console.log("\n3. 错误处理 (try/catch 自然方式)\n");

  const app2 = new MiniKoa();

  // 错误处理中间件（最外层）
  app2.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = { error: err.message };
      console.log(`  [Error] ${ctx.status}: ${err.message}`);
    }
  });

  // 模拟出错
  app2.use(async (ctx, next) => {
    if (ctx.url === "/error") {
      const err = new Error("Something went wrong");
      err.status = 400;
      throw err;
    }
    ctx.body = { ok: true };
  });

  app2.handleRequest({ method: "GET", url: "/error" }).then((res) => {
    console.log(`  响应: ${JSON.stringify(res.body)}`);
  });

  app2.handleRequest({ method: "GET", url: "/ok" }).then((res) => {
    console.log(`  响应: ${JSON.stringify(res.body)}`);
  });

  // ========== 4. Express vs Koa ==========
  setTimeout(() => {
    console.log("\n4. Express vs Koa 对比\n");
    console.log(`
  ┌──────────────────┬──────────────────────┬──────────────────────┐
  │                  │ Express              │ Koa                  │
  ├──────────────────┼──────────────────────┼──────────────────────┤
  │ 中间件模型       │ 线性: next()         │ 洋葱: await next()   │
  │ 异步处理         │ 回调/手动 catch      │ 原生 async/await     │
  │ 上下文           │ req + res            │ ctx (代理两者)       │
  │ 错误处理         │ 特殊错误中间件       │ try/catch            │
  │ 内置功能         │ 路由、静态文件       │ 仅核心               │
  │ 响应处理         │ res.json(data)       │ ctx.body = data      │
  │ 包大小           │ ~200KB               │ ~50KB                │
  │ Stars            │ ~64K                 │ ~35K                 │
  └──────────────────┴──────────────────────┴──────────────────────┘
`);

    // ========== 5. Koa 实际使用 ==========
    console.log("5. Koa 实际使用");
    console.log(`
  const Koa = require('koa');
  const Router = require('@koa/router');
  const bodyParser = require('koa-bodyparser');
  const cors = require('@koa/cors');

  const app = new Koa();
  const router = new Router({ prefix: '/api' });

  // 全局中间件
  app.use(cors());
  app.use(bodyParser());

  // 错误处理
  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = { error: err.message };
    }
  });

  // 计时
  app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    ctx.set('X-Response-Time', Date.now() - start + 'ms');
  });

  // 路由
  router.get('/users', async (ctx) => {
    ctx.body = await User.findAll();
  });

  router.post('/users', async (ctx) => {
    ctx.status = 201;
    ctx.body = await User.create(ctx.request.body);
  });

  router.get('/users/:id', async (ctx) => {
    const user = await User.findById(ctx.params.id);
    if (!user) ctx.throw(404, 'User not found');
    ctx.body = user;
  });

  app.use(router.routes());
  app.use(router.allowedMethods());

  app.listen(3000);
`);

    console.log("=== Koa 完成 ===");
  }, 50);
}, 100);
