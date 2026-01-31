# Node.js 深入解析

## 📌 一、Node.js 事件循环

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

---

## 📌 二、核心模块

### 1. fs 文件系统

```javascript
const fs = require("fs");
const fsPromises = require("fs/promises");

// 同步读取
const data = fs.readFileSync("file.txt", "utf8");

// 异步回调
fs.readFile("file.txt", "utf8", (err, data) => {
  if (err) throw err;
  console.log(data);
});

// Promise (推荐)
const data = await fsPromises.readFile("file.txt", "utf8");

// 写入文件
await fsPromises.writeFile("file.txt", "Hello");
await fsPromises.appendFile("file.txt", "\nWorld");

// 文件操作
await fsPromises.mkdir("dir", { recursive: true });
await fsPromises.rename("old.txt", "new.txt");
await fsPromises.unlink("file.txt");
const files = await fsPromises.readdir("dir");
const stats = await fsPromises.stat("file.txt");
```

### 2. path 路径

```javascript
const path = require("path");

path.join("/users", "alice", "docs"); // /users/alice/docs
path.resolve("docs", "file.txt"); // /absolute/path/docs/file.txt
path.basename("/users/file.txt"); // file.txt
path.dirname("/users/file.txt"); // /users
path.extname("file.txt"); // .txt
path.parse("/users/file.txt"); // { root, dir, base, ext, name }
```

### 3. http 模块

```javascript
const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello World");
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
```

### 4. Stream 流

```javascript
const fs = require("fs");
const { pipeline } = require("stream/promises");
const zlib = require("zlib");

// 读取流
const readable = fs.createReadStream("input.txt");
const writable = fs.createWriteStream("output.txt");

// 管道
readable.pipe(writable);

// 使用 pipeline (推荐，自动处理错误)
await pipeline(
  fs.createReadStream("input.txt"),
  zlib.createGzip(),
  fs.createWriteStream("output.txt.gz")
);

// Transform 流
const { Transform } = require("stream");

const upperCase = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  },
});
```

---

## 📌 三、Express

### 1. 基本结构

```javascript
const express = require("express");
const app = express();

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.get("/api/users", (req, res) => {
  res.json({ users: [] });
});

app.post("/api/users", (req, res) => {
  const user = req.body;
  res.status(201).json(user);
});

app.get("/api/users/:id", (req, res) => {
  const { id } = req.params;
  res.json({ id });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(3000);
```

### 2. 路由模块化

```javascript
// routes/users.js
const router = require("express").Router();

router.get("/", async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
});

router.post("/", async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
});

module.exports = router;

// app.js
app.use("/api/users", require("./routes/users"));
```

### 3. 中间件

```javascript
// 日志中间件
const logger = (req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
};

// 认证中间件
const auth = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// 使用
app.use(logger);
app.get("/api/protected", auth, (req, res) => {
  res.json({ user: req.user });
});
```

---

## 📌 四、JWT 认证

```javascript
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// 注册
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashedPassword });
  res.status(201).json({ id: user.id, email: user.email });
});

// 登录
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
});

// 刷新 Token
app.post("/api/refresh", auth, async (req, res) => {
  const token = jwt.sign(
    { userId: req.user.userId, email: req.user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.json({ token });
});
```

---

## 📌 五、错误处理

```javascript
// 自定义错误类
class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// 异步错误包装
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 使用
app.get(
  "/api/users/:id",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError(404, "User not found");
    res.json(user);
  })
);

// 全局错误处理
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Internal Server Error";

  // 生产环境不暴露堆栈
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  res.status(statusCode).json({ error: message });
});
```

---

## 📌 六、RESTful API 设计

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

---

## 📚 推荐学习资源

| 资源             | 链接          |
| ---------------- | ------------- |
| Node.js 官方文档 | nodejs.org    |
| Express          | expressjs.com |
| NestJS           | nestjs.com    |

---
