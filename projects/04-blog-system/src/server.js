/**
 * 全栈博客 - HTTP 服务器
 *
 * 职责: 纯 Node.js HTTP 服务器，处理请求/响应
 * 原理: 基于 http.createServer，解析 URL/Body/Cookie
 *
 * 这就是 Express/Koa 的底层实现原理！
 */

const http = require("http");
const url = require("url");

class Server {
  constructor() {
    this.middlewares = [];
  }

  /**
   * 注册中间件 (类似 Express 的 app.use)
   */
  use(fn) {
    this.middlewares.push(fn);
    return this;
  }

  /**
   * 处理请求 — 依次执行中间件
   */
  async _handleRequest(req, res) {
    // 解析 URL
    const parsed = url.parse(req.url, true);
    req.pathname = parsed.pathname;
    req.query = parsed.query;

    // 解析 Cookie
    req.cookies = this._parseCookies(req.headers.cookie);

    // 解析 Body (POST/PUT)
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      req.body = await this._parseBody(req);
    }

    // 增强 res
    res.json = (data, statusCode = 200) => {
      res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(data));
    };

    res.html = (content, statusCode = 200) => {
      res.writeHead(statusCode, { "Content-Type": "text/html; charset=utf-8" });
      res.end(content);
    };

    res.redirect = (location) => {
      res.writeHead(302, { Location: location });
      res.end();
    };

    // 执行中间件链
    let index = 0;
    const next = async () => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        await middleware(req, res, next);
      }
    };

    try {
      await next();
    } catch (err) {
      console.error("[Server Error]", err.message);
      res.json({ error: err.message }, 500);
    }
  }

  /**
   * 解析请求体
   */
  _parseBody(req) {
    return new Promise((resolve) => {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve(body);
        }
      });
    });
  }

  /**
   * 解析 Cookie
   */
  _parseCookies(cookieHeader) {
    const cookies = {};
    if (cookieHeader) {
      cookieHeader.split(";").forEach((pair) => {
        const [key, val] = pair.trim().split("=");
        if (key) cookies[key] = decodeURIComponent(val || "");
      });
    }
    return cookies;
  }

  /**
   * 启动服务器
   */
  listen(port, callback) {
    const server = http.createServer((req, res) =>
      this._handleRequest(req, res)
    );
    server.listen(port, callback);
    return server;
  }
}

module.exports = Server;
