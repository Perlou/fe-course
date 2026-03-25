/**
 * 全栈博客 - JWT 认证
 *
 * 职责: 用户注册/登录/Token 验证
 * 原理: 手写 JWT (Header.Payload.Signature)
 *
 * JWT 结构:
 *   Header:    { alg: 'HS256', typ: 'JWT' }
 *   Payload:   { userId, username, exp }
 *   Signature: HMAC-SHA256(header.payload, secret)
 */

const crypto = require("crypto");

const SECRET = "mini-blog-secret-key-2024";
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24小时

/**
 * Base64URL 编码 (JWT 标准)
 */
function base64url(data) {
  return Buffer.from(data)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Base64URL 解码
 */
function base64urlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return Buffer.from(str, "base64").toString("utf-8");
}

/**
 * 生成 JWT Token
 */
function generateToken(payload) {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64url(
    JSON.stringify({
      ...payload,
      exp: Date.now() + TOKEN_EXPIRY,
    })
  );

  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(`${header}.${body}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${header}.${body}.${signature}`;
}

/**
 * 验证并解析 JWT Token
 */
function verifyToken(token) {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;

  // 验证签名
  const expectedSig = crypto
    .createHmac("sha256", SECRET)
    .update(`${header}.${body}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  if (signature !== expectedSig) return null;

  // 解析 payload
  try {
    const payload = JSON.parse(base64urlDecode(body));
    if (payload.exp && payload.exp < Date.now()) return null; // 过期
    return payload;
  } catch {
    return null;
  }
}

/**
 * 密码哈希 (SHA256 + 盐)
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .createHash("sha256")
    .update(password + salt)
    .digest("hex");
  return `${salt}:${hash}`;
}

/**
 * 验证密码
 */
function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  const testHash = crypto
    .createHash("sha256")
    .update(password + salt)
    .digest("hex");
  return testHash === hash;
}

/**
 * 认证中间件 — 从 Authorization 头提取用户信息
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    req.user = verifyToken(token);
  }
  return next();
}

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  verifyPassword,
  authMiddleware,
};
