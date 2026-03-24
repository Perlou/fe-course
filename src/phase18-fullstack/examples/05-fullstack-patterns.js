// 全栈开发模式详解
// 运行: node 05-fullstack-patterns.js

console.log("=== 全栈开发模式 ===\n");

// ========== 1. 环境配置管理 ==========
console.log("1. 环境配置管理\n");

class ConfigManager {
  constructor() {
    this.configs = {};
  }

  // 模拟 .env 加载
  load(env = "development") {
    const envFiles = {
      development: {
        PORT: "4000",
        DATABASE_URL: "postgresql://localhost:5432/dev_db",
        REDIS_URL: "redis://localhost:6379",
        JWT_SECRET: "dev-secret-key",
        FRONTEND_URL: "http://localhost:5173",
        NODE_ENV: "development",
        LOG_LEVEL: "debug",
      },
      production: {
        PORT: "4000",
        DATABASE_URL: "postgresql://user:pass@prod-db:5432/prod_db",
        REDIS_URL: "redis://prod-redis:6379",
        JWT_SECRET: "super-secret-production-key-xxxxx",
        FRONTEND_URL: "https://myapp.com",
        NODE_ENV: "production",
        LOG_LEVEL: "error",
      },
      test: {
        PORT: "4001",
        DATABASE_URL: "postgresql://localhost:5432/test_db",
        REDIS_URL: "redis://localhost:6379",
        JWT_SECRET: "test-secret-key",
        FRONTEND_URL: "http://localhost:5173",
        NODE_ENV: "test",
        LOG_LEVEL: "silent",
      },
    };

    this.configs = envFiles[env] || envFiles.development;
    console.log(`  环境: ${env}`);
    Object.entries(this.configs).forEach(([key, val]) => {
      const display = key.includes("SECRET") || key.includes("PASSWORD")
        ? val.slice(0, 5) + "***"
        : val;
      console.log(`    ${key}=${display}`);
    });
    return this;
  }

  // 验证必需变量
  validate(required) {
    const missing = required.filter((key) => !this.configs[key]);
    if (missing.length > 0) {
      throw new Error(`缺少环境变量: ${missing.join(", ")}`);
    }
    console.log(`  ✅ 验证通过 (${required.length} 个必需变量)\n`);
    return this;
  }

  get(key) {
    return this.configs[key];
  }
}

const config = new ConfigManager();
config.load("development");
config.validate(["PORT", "DATABASE_URL", "JWT_SECRET", "FRONTEND_URL"]);

// ========== 2. 日志系统 ==========
console.log("2. 日志系统\n");

class Logger {
  constructor(options = {}) {
    this.level = options.level || "info";
    this.levels = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 };
    this.colors = { debug: "\x1b[36m", info: "\x1b[32m", warn: "\x1b[33m", error: "\x1b[31m" };
  }

  _log(level, message, meta = {}) {
    if (this.levels[level] < this.levels[this.level]) return;

    const timestamp = new Date().toISOString();
    const color = this.colors[level] || "";
    const reset = "\x1b[0m";
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";

    console.log(`  ${color}[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}${reset}`);
  }

  debug(msg, meta) { this._log("debug", msg, meta); }
  info(msg, meta) { this._log("info", msg, meta); }
  warn(msg, meta) { this._log("warn", msg, meta); }
  error(msg, meta) { this._log("error", msg, meta); }
}

const logger = new Logger({ level: "debug" });
logger.debug("数据库连接成功");
logger.info("服务器启动", { port: 4000 });
logger.warn("Token 即将过期", { userId: 1, expiresIn: "5m" });
logger.error("请求失败", { status: 500, message: "Internal Server Error" });

// ========== 3. 请求日志中间件 ==========
console.log("\n3. 请求日志中间件\n");

function requestLogger() {
  return function (req, res, next) {
    const start = Date.now();
    const { method, url, ip } = req;

    // 响应完成时记录
    res.on("finish", () => {
      const ms = Date.now() - start;
      const statusColor = res.statusCode < 400 ? "\x1b[32m" : "\x1b[31m";
      console.log(
        `  ${statusColor}${method} ${url} ${res.statusCode} ${ms}ms\x1b[0m` +
        ` - ${ip || "127.0.0.1"}`
      );
    });

    next();
  };
}

// 模拟请求
const mockReq = { method: "GET", url: "/api/users", ip: "192.168.1.1" };
const mockRes = {
  statusCode: 200,
  _listeners: {},
  on(event, fn) { this._listeners[event] = fn; },
};

requestLogger()(mockReq, mockRes, () => {});
mockRes._listeners.finish?.();

// ========== 4. 健康检查 ==========
console.log("\n4. 健康检查端点\n");

async function healthCheck() {
  const checks = {
    server: { status: "ok" },
    database: { status: "ok" },
    redis: { status: "ok" },
    uptime: process.uptime().toFixed(0) + "s",
    memory: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1) + " MB",
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
  };

  // 模拟数据库检查
  try {
    // await prisma.$queryRaw`SELECT 1`
    checks.database.status = "ok";
    checks.database.responseTime = "2ms";
  } catch (err) {
    checks.database.status = "error";
    checks.database.error = err.message;
  }

  console.log("  GET /api/health");
  console.log(`  ${JSON.stringify(checks, null, 2).split("\n").map(l => "  " + l).join("\n")}`);
}
healthCheck();

// ========== 5. 安全配置 ==========
console.log("\n5. 安全配置\n");
console.log(`
  const helmet = require('helmet');
  const rateLimit = require('express-rate-limit');
  const cors = require('cors');

  // Helmet — 设置安全 HTTP 头
  app.use(helmet());

  // CORS — 限制允许的域名
  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }));

  // Rate Limiting — 限制请求频率
  app.use('/api', rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 分钟
    max: 100,                   // 最多 100 次请求
    message: { error: '请求过于频繁' },
  }));

  // 登录接口更严格的限制
  app.use('/api/auth/login', rateLimit({
    windowMs: 60 * 1000,       // 1 分钟
    max: 5,                     // 最多 5 次
  }));
`);

// ========== 6. 安全检查清单 ==========
console.log("6. 全栈安全检查清单\n");
console.log(`
  ┌──────────────────────────────────────────────────────┐
  │            全栈安全检查清单                            │
  ├──────────────────────────────────────────────────────┤
  │                                                      │
  │  认证与授权:                                          │
  │  ✅ JWT 使用 httpOnly Cookie 存储                     │
  │  ✅ 密码使用 bcrypt (saltRounds >= 10)                │
  │  ✅ 实现 Token 刷新机制                               │
  │  ✅ 敏感操作需二次验证                                │
  │                                                      │
  │  传输安全:                                            │
  │  ✅ 使用 HTTPS                                        │
  │  ✅ 设置安全 HTTP 头 (Helmet)                         │
  │  ✅ CORS 白名单限制                                   │
  │                                                      │
  │  数据安全:                                            │
  │  ✅ 参数验证 (zod / express-validator)                │
  │  ✅ 使用 ORM 防 SQL 注入                              │
  │  ✅ 输出转义防 XSS                                    │
  │  ✅ 环境变量不提交 Git                                │
  │                                                      │
  │  可用性:                                              │
  │  ✅ Rate Limiting                                     │
  │  ✅ 健康检查端点                                      │
  │  ✅ 错误不暴露堆栈信息 (生产环境)                     │
  │  ✅ 日志与监控                                        │
  │                                                      │
  └──────────────────────────────────────────────────────┘
`);

console.log("=== 全栈开发模式完成 ===");
