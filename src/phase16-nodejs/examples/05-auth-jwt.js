// JWT 认证完整流程
// 运行: node 05-auth-jwt.js

const crypto = require("crypto");

console.log("=== JWT 认证完整流程 ===\n");

// ========== 1. 手写 JWT ==========
console.log("1. 手写 JWT 核心\n");

// Base64URL 编码
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return Buffer.from(str, "base64").toString();
}

// HMAC-SHA256 签名
function sign(payload, secret) {
  const header = { alg: "HS256", typ: "JWT" };

  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));

  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${headerEncoded}.${payloadEncoded}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return `${headerEncoded}.${payloadEncoded}.${signature}`;
}

// 验证 JWT
function verify(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("无效的 JWT 格式");

  const [headerEncoded, payloadEncoded, signature] = parts;

  // 重新计算签名
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${headerEncoded}.${payloadEncoded}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  if (signature !== expectedSignature) {
    throw new Error("JWT 签名无效");
  }

  // 解析 payload
  const payload = JSON.parse(base64UrlDecode(payloadEncoded));

  // 检查过期
  if (payload.exp && Date.now() / 1000 > payload.exp) {
    throw new Error("JWT 已过期");
  }

  return payload;
}

// 测试
const SECRET = "my-super-secret-key";
const payload = {
  userId: 1,
  email: "alice@example.com",
  role: "admin",
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600, // 1小时后过期
};

const token = sign(payload, SECRET);
console.log(`  JWT Token: ${token.slice(0, 50)}...`);
console.log(`  Token 长度: ${token.length} 字符`);

// 解析各部分
const [h, p, s] = token.split(".");
console.log(`  Header:  ${base64UrlDecode(h)}`);
console.log(`  Payload: ${base64UrlDecode(p).slice(0, 60)}...`);
console.log(`  Signature: ${s.slice(0, 20)}...`);

// 验证
const decoded = verify(token, SECRET);
console.log(`  验证成功: userId=${decoded.userId}, email=${decoded.email}`);

// 篡改测试
try {
  verify(token + "x", SECRET);
} catch (e) {
  console.log(`  篡改检测: ✅ ${e.message}`);
}

// ========== 2. bcrypt 密码加密 ==========
console.log("\n2. 密码加密 (模拟 bcrypt)\n");

// 简化版密码哈希 (实际使用 bcrypt 库)
function hashPassword(password, saltRounds = 10) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, Math.pow(2, saltRounds), 32, "sha256")
    .toString("hex");
  return `${salt}:${hash}`;
}

function comparePassword(password, stored) {
  const [salt, hash] = stored.split(":");
  const computed = crypto
    .pbkdf2Sync(password, salt, Math.pow(2, 10), 32, "sha256")
    .toString("hex");
  return hash === computed;
}

const password = "my-secure-password";
const hashed = hashPassword(password);
console.log(`  原始密码: ${password}`);
console.log(`  哈希结果: ${hashed.slice(0, 50)}...`);
console.log(`  验证正确密码: ${comparePassword(password, hashed)}`);
console.log(`  验证错误密码: ${comparePassword("wrong-password", hashed)}`);

// ========== 3. 完整认证流程 ==========
console.log("\n3. 完整认证流程\n");

// 模拟数据库
const users = [];

// 注册
function register(email, password) {
  // 检查重复
  if (users.find((u) => u.email === email)) {
    throw new Error("邮箱已注册");
  }

  const user = {
    id: users.length + 1,
    email,
    password: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  console.log(`  ✅ 注册成功: ${email} (id: ${user.id})`);
  return { id: user.id, email: user.email };
}

// 登录
function login(email, password) {
  const user = users.find((u) => u.email === email);
  if (!user) throw new Error("用户不存在");
  if (!comparePassword(password, user.password)) throw new Error("密码错误");

  // 签发 access token + refresh token
  const accessToken = sign(
    {
      userId: user.id,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15分钟
    },
    SECRET
  );

  const refreshToken = sign(
    {
      userId: user.id,
      type: "refresh",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600, // 7天
    },
    SECRET + "-refresh"
  );

  console.log(`  ✅ 登录成功: ${email}`);
  console.log(`  Access Token:  ${accessToken.slice(0, 30)}...`);
  console.log(`  Refresh Token: ${refreshToken.slice(0, 30)}...`);
  return { accessToken, refreshToken };
}

// 认证中间件
function authMiddleware(req) {
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("未提供认证令牌");
  }

  const token = authHeader.replace("Bearer ", "");
  const payload = verify(token, SECRET);
  return payload;
}

// 测试完整流程
register("alice@example.com", "password123");
register("bob@example.com", "secure456");

const tokens = login("alice@example.com", "password123");

// 模拟认证请求
console.log("\n  模拟需要认证的请求:");
try {
  const user = authMiddleware({
    headers: { authorization: `Bearer ${tokens.accessToken}` },
  });
  console.log(`  ✅ 认证成功: userId=${user.userId}, email=${user.email}`);
} catch (e) {
  console.log(`  ❌ 认证失败: ${e.message}`);
}

// 无 token
try {
  authMiddleware({ headers: {} });
} catch (e) {
  console.log(`  ❌ 无 Token: ${e.message}`);
}

// ========== 4. JWT 认证流程图 ==========
console.log("\n4. JWT 认证流程\n");
console.log(`
  ┌──────────────────────────────────────────────────────┐
  │                 JWT 认证流程                          │
  ├──────────────────────────────────────────────────────┤
  │                                                      │
  │  注册:                                               │
  │  Client ──POST /register──→ Server                   │
  │         ←── { id, email }                            │
  │         (密码经 bcrypt 加密后存储)                     │
  │                                                      │
  │  登录:                                               │
  │  Client ──POST /login──→ Server                      │
  │         ←── { accessToken, refreshToken }             │
  │         (验证密码, 签发双 Token)                      │
  │                                                      │
  │  请求:                                               │
  │  Client ──GET /api/data──→ Server                    │
  │  Header: Authorization: Bearer <accessToken>         │
  │         ←── { data: ... }                            │
  │                                                      │
  │  刷新:                                               │
  │  Client ──POST /refresh──→ Server                    │
  │  Body: { refreshToken }                              │
  │         ←── { accessToken (新) }                     │
  │                                                      │
  └──────────────────────────────────────────────────────┘

  Token 存储策略:
  ┌──────────────────┬─────────────────────────────────┐
  │ localStorage     │ 简单，但有 XSS 风险             │
  │ httpOnly Cookie  │ 推荐，防 XSS，但需防 CSRF       │
  │ 内存 (变量)      │ 最安全，但刷新后丢失             │
  └──────────────────┴─────────────────────────────────┘
`);

console.log("=== JWT 认证完成 ===");
