# Node.js 深入解析

## 📌 一、Node.js 事件循环

### 1. 事件循环阶段

```
┌─────────────────────────────────────────────────────────────┐
│                    Node.js 事件循环                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌───────────────────────┐                                 │
│   │      timers           │  ← setTimeout, setInterval      │
│   └───────────┬───────────┘                                 │
│               ↓                                             │
│   ┌───────────────────────┐                                 │
│   │   pending callbacks   │  ← 系统操作回调                  │
│   └───────────┬───────────┘                                 │
│               ↓                                             │
│   ┌───────────────────────┐                                 │
│   │     idle, prepare     │  ← 内部使用                     │
│   └───────────┬───────────┘                                 │
│               ↓                                             │
│   ┌───────────────────────┐                                 │
│   │        poll           │  ← I/O 回调                     │
│   └───────────┬───────────┘                                 │
│               ↓                                             │
│   ┌───────────────────────┐                                 │
│   │        check          │  ← setImmediate                 │
│   └───────────┬───────────┘                                 │
│               ↓                                             │
│   ┌───────────────────────┐                                 │
│   │    close callbacks    │  ← socket.on('close')           │
│   └───────────┬───────────┘                                 │
│               │                                             │
│               └─────────────→ 下一轮循环                     │
│                                                             │
│   微任务队列 (每个阶段之间执行):                             │
│   process.nextTick() → Promise.then()                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. 微任务与宏任务

```javascript
// 执行顺序演示
console.log('1. 同步代码');

setTimeout(() => console.log('5. setTimeout (timers)'), 0);
setImmediate(() => console.log('6. setImmediate (check)'));

Promise.resolve().then(() => console.log('3. Promise.then (microtask)'));
process.nextTick(() => console.log('2. nextTick (microtask - 优先)'));

queueMicrotask(() => console.log('4. queueMicrotask'));

// 输出: 1 → 2 → 3 → 4 → 5 → 6
// nextTick 优先于 Promise，微任务优先于宏任务
```

### 3. 常见误区

```
┌──────────────────────────────────────────────────────────┐
│                   常见误区                                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ❌ Node.js 是单线程的                                   │
│  ✅ JS 执行是单线程，但底层 libuv 使用线程池              │
│     (crypto, fs, dns 等操作在线程池中执行)                │
│                                                          │
│  ❌ setTimeout(fn, 0) 会立即执行                         │
│  ✅ 会在 timers 阶段执行，至少延迟 1ms                    │
│                                                          │
│  ❌ async/await 不会阻塞事件循环                         │
│  ✅ await 之后的代码是微任务，但 CPU 密集的               │
│     同步操作仍会阻塞事件循环                              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 📌 二、核心模块

### 1. fs 文件系统

```javascript
const fs = require('fs');
const fsPromises = require('fs/promises');

// 同步读取
const data = fs.readFileSync('file.txt', 'utf8');

// 异步回调
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});

// Promise (推荐)
const data = await fsPromises.readFile('file.txt', 'utf8');

// 写入文件
await fsPromises.writeFile('file.txt', 'Hello');
await fsPromises.appendFile('file.txt', '\nWorld');

// 文件操作
await fsPromises.mkdir('dir', { recursive: true });
await fsPromises.rename('old.txt', 'new.txt');
await fsPromises.unlink('file.txt');
const files = await fsPromises.readdir('dir');
const stats = await fsPromises.stat('file.txt');

// 监听文件变化
fs.watch('dir', (eventType, filename) => {
  console.log(`${eventType}: ${filename}`);
});
```

### 2. path 路径

```javascript
const path = require('path');

path.join('/users', 'alice', 'docs');      // /users/alice/docs
path.resolve('docs', 'file.txt');          // /absolute/path/docs/file.txt
path.basename('/users/file.txt');          // file.txt
path.dirname('/users/file.txt');           // /users
path.extname('file.txt');                  // .txt
path.parse('/users/file.txt');             // { root, dir, base, ext, name }

// 跨平台注意
path.sep;     // / (POSIX) 或 \ (Windows)
path.delimiter; // : (POSIX) 或 ; (Windows)
```

### 3. http 模块

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  const { method, url, headers } = req;

  if (url === '/api/data' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Hello' }));
  } else if (url === '/api/data' && method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(body);
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
```

### 4. Stream 流

```javascript
const fs = require('fs');
const { pipeline } = require('stream/promises');
const zlib = require('zlib');
const { Transform } = require('stream');

// 读取流 → 写入流
const readable = fs.createReadStream('input.txt');
const writable = fs.createWriteStream('output.txt');
readable.pipe(writable);

// pipeline (推荐，自动处理错误和清理)
await pipeline(
  fs.createReadStream('input.txt'),
  zlib.createGzip(),
  fs.createWriteStream('output.txt.gz')
);

// 自定义 Transform 流
const upperCase = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  },
});

// 流的类型
// Readable:  可读 (fs.createReadStream, http request)
// Writable:  可写 (fs.createWriteStream, http response)
// Duplex:    双工 (TCP socket)
// Transform: 转换 (zlib, crypto)
```

### 5. events 模块

```javascript
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}
const emitter = new MyEmitter();

// 注册监听器
emitter.on('data', (payload) => console.log('收到:', payload));
emitter.once('connect', () => console.log('首次连接'));

// 触发事件
emitter.emit('data', { id: 1 });
emitter.emit('connect');
emitter.emit('connect'); // 不会执行

// 错误处理
emitter.on('error', (err) => console.error('错误:', err.message));

// 移除监听
const handler = () => {};
emitter.on('event', handler);
emitter.off('event', handler);
```

---

## 📌 三、Express 框架

### 1. 基本结构

```javascript
const express = require('express');
const app = express();

// 内置中间件
app.use(express.json());                        // 解析 JSON
app.use(express.urlencoded({ extended: true })); // 解析表单
app.use(express.static('public'));               // 静态文件

// 路由
app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.post('/api/users', (req, res) => {
  res.status(201).json(req.body);
});

app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { fields } = req.query;
  res.json({ id, fields });
});

// 错误处理中间件 (4 个参数)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(3000);
```

### 2. 路由模块化

```javascript
// routes/users.js
const router = require('express').Router();

router.get('/', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});

router.post('/', async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
});

router.put('/:id', async (req, res) => {
  const user = await User.update(req.params.id, req.body);
  res.json(user);
});

router.delete('/:id', async (req, res) => {
  await User.delete(req.params.id);
  res.status(204).end();
});

module.exports = router;

// app.js
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
```

### 3. 中间件详解

```javascript
// 中间件执行顺序
// 请求 → MW1 → MW2 → MW3 → 路由处理 → 响应

// 应用级中间件
app.use((req, res, next) => {
  req.requestTime = Date.now();
  next();
});

// 日志中间件
const logger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.url} ${res.statusCode} - ${ms}ms`);
  });
  next();
};

// 认证中间件
const auth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// 路由级中间件
app.get('/api/profile', auth, (req, res) => {
  res.json({ user: req.user });
});

// 第三方中间件
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
```

---

## 📌 四、Koa 框架

### 1. 洋葱模型

```
┌──────────────────────────────────────────────────────┐
│                 Koa 洋葱模型                          │
├──────────────────────────────────────────────────────┤
│                                                      │
│   请求 → ┌───────────────────────────────┐           │
│          │  中间件 1 (前半)               │           │
│          │  ┌─────────────────────────┐  │           │
│          │  │  中间件 2 (前半)         │  │           │
│          │  │  ┌───────────────────┐  │  │           │
│          │  │  │  中间件 3 (核心)   │  │  │           │
│          │  │  └───────────────────┘  │  │           │
│          │  │  中间件 2 (后半)         │  │           │
│          │  └─────────────────────────┘  │           │
│          │  中间件 1 (后半)               │           │
│          └───────────────────────────────┘ → 响应    │
│                                                      │
│   关键: await next() 前后分别执行                     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 2. 基本使用

```javascript
const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new Router();

// 洋葱模型演示
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();  // 执行下一个中间件
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// 错误处理
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = { error: err.message };
    ctx.app.emit('error', err, ctx);
  }
});

app.use(bodyParser());

// 路由
router.get('/api/users', async (ctx) => {
  ctx.body = { users: [] };
});

router.post('/api/users', async (ctx) => {
  const user = ctx.request.body;
  ctx.status = 201;
  ctx.body = user;
});

router.get('/api/users/:id', async (ctx) => {
  ctx.body = { id: ctx.params.id };
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);
```

### 3. Express vs Koa

```
┌──────────────────┬──────────────────┬──────────────────┐
│                  │ Express          │ Koa              │
├──────────────────┼──────────────────┼──────────────────┤
│ 中间件模型       │ 线性 (next)      │ 洋葱 (await next)│
│ 内置功能         │ 多 (路由、静态)  │ 极简 (仅核心)    │
│ 异步处理         │ 回调/手动 catch  │ 原生 async/await │
│ 上下文           │ req + res        │ ctx              │
│ 错误处理         │ 错误中间件       │ try/catch        │
│ 生态             │ 非常成熟         │ 成熟             │
│ 学习曲线         │ 简单             │ 简单             │
│ 适用场景         │ 通用             │ API 服务         │
└──────────────────┴──────────────────┴──────────────────┘
```

---

## 📌 五、JWT 认证

```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// 注册
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashedPassword });
  res.status(201).json({ id: user.id, email: user.email });
});

// 登录
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ accessToken, refreshToken });
});

// 刷新 Token
app.post('/api/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const accessToken = jwt.sign(
      { userId: payload.userId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});
```

---

## 📌 六、错误处理

### 1. 自定义错误类

```javascript
class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(404, `${resource} not found`);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(400, message);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}
```

### 2. 异步错误包装

```javascript
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 使用
app.get('/api/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError('User');
  res.json(user);
}));
```

### 3. 全局错误处理

```javascript
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';

  // 日志（生产环境用日志框架）
  if (!err.isOperational) {
    console.error('未预期错误:', err);
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 未捕获异常
process.on('uncaughtException', (err) => {
  console.error('未捕获异常:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('未处理的 Promise 拒绝:', reason);
});
```

---

## 📌 七、RESTful API 设计

### 1. 路由规范

```
┌─────────────┬───────────────────┬────────────────────────┐
│   方法       │      URL          │        操作            │
├─────────────┼───────────────────┼────────────────────────┤
│ GET         │ /api/users        │ 获取用户列表           │
│ GET         │ /api/users/:id    │ 获取单个用户           │
│ POST        │ /api/users        │ 创建用户               │
│ PUT         │ /api/users/:id    │ 更新用户（完整）       │
│ PATCH       │ /api/users/:id    │ 更新用户（部分）       │
│ DELETE      │ /api/users/:id    │ 删除用户               │
└─────────────┴───────────────────┴────────────────────────┘

嵌套资源:
GET    /api/users/:userId/posts      用户的文章列表
POST   /api/users/:userId/posts      创建用户文章

查询参数:
GET /api/users?page=1&limit=10&sort=name&order=desc
GET /api/users?fields=id,name,email
GET /api/users?search=alice
```

### 2. 响应格式

```javascript
// 成功响应
{ "data": { ... } }
{ "data": [...], "meta": { "page": 1, "total": 100 } }

// 错误响应
{ "error": "Not found" }
{ "error": "Validation failed", "details": [...] }

// HTTP 状态码
// 200 OK              - 成功
// 201 Created          - 创建成功
// 204 No Content       - 删除成功
// 400 Bad Request      - 请求参数错误
// 401 Unauthorized     - 未认证
// 403 Forbidden        - 无权限
// 404 Not Found        - 资源不存在
// 409 Conflict         - 资源冲突
// 422 Unprocessable    - 验证失败
// 429 Too Many Requests - 请求过多
// 500 Internal Error   - 服务器错误
```

---

## 📌 八、NestJS 入门

### 1. 核心概念

```
┌──────────────────────────────────────────────────────────┐
│                 NestJS 架构                                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Module (模块)                                           │
│  ├── Controller (控制器) ← 处理请求路由                  │
│  ├── Service (服务)      ← 业务逻辑                      │
│  ├── Repository (仓库)   ← 数据访问                      │
│  ├── Guard (守卫)        ← 认证授权                      │
│  ├── Pipe (管道)         ← 数据转换验证                  │
│  ├── Interceptor (拦截器)← 请求/响应包装                 │
│  └── Filter (过滤器)     ← 异常处理                      │
│                                                          │
│  请求处理流程:                                            │
│  Guard → Interceptor → Pipe → Controller → Service       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 2. 基本示例

```typescript
// user.controller.ts
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() { return this.userService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.userService.findOne(id); }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
}

// user.service.ts
@Injectable()
export class UserService {
  findAll() { return []; }
  findOne(id: string) { return { id }; }
  create(dto: CreateUserDto) { return { ...dto, id: Date.now() }; }
}

// user.module.ts
@Module({
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
```

---

## 📌 九、项目结构与进程管理

### 1. Express 项目结构

```
project/
├── src/
│   ├── config/           # 配置
│   │   ├── database.js
│   │   └── index.js
│   ├── controllers/      # 控制器
│   ├── middlewares/       # 中间件
│   ├── models/            # 数据模型
│   ├── routes/            # 路由
│   ├── services/          # 业务逻辑
│   ├── utils/             # 工具函数
│   ├── validators/        # 请求验证
│   └── app.js             # 应用入口
├── tests/                 # 测试
├── .env                   # 环境变量
├── .env.example
└── package.json
```

### 2. PM2 进程管理

```bash
# 安装
npm install -g pm2

# 启动
pm2 start app.js --name "api"
pm2 start app.js -i max           # Cluster 模式 (利用所有 CPU)

# 管理
pm2 list
pm2 logs api
pm2 restart api
pm2 stop api
pm2 delete api

# 配置文件 ecosystem.config.js
module.exports = {
  apps: [{
    name: 'api',
    script: 'src/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: { NODE_ENV: 'development', PORT: 3000 },
    env_production: { NODE_ENV: 'production', PORT: 8080 },
  }],
};
```

### 3. Cluster 模式

```javascript
const cluster = require('cluster');
const os = require('os');

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`主进程 ${process.pid}, 启动 ${numCPUs} 个工作进程`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`工作进程 ${worker.process.pid} 退出，重新启动...`);
    cluster.fork();
  });
} else {
  const app = require('./app');
  app.listen(3000, () => {
    console.log(`工作进程 ${process.pid} 监听端口 3000`);
  });
}
```

---

## 📚 推荐学习资源

| 资源               | 链接                     |
| ------------------ | ------------------------ |
| Node.js 官方文档   | nodejs.org/docs          |
| Express            | expressjs.com            |
| Koa                | koajs.com                |
| NestJS             | nestjs.com               |
| PM2                | pm2.keymetrics.io        |

---
