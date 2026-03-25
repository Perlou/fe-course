/**
 * 全栈博客 - 路由系统
 *
 * 职责: URL 路由匹配与分发
 * 原理: 注册 method + path 模式，匹配请求并提取路径参数
 *
 * 支持:
 *   router.get('/posts', handler)
 *   router.get('/posts/:id', handler)   // 路径参数
 *   router.post('/posts', handler)
 */

class Router {
  constructor() {
    this.routes = [];
  }

  /**
   * 注册路由
   */
  _addRoute(method, path, handler) {
    // 将 /posts/:id 转为正则 /posts/([^/]+)
    const paramNames = [];
    const pattern = path.replace(/:(\w+)/g, (_, name) => {
      paramNames.push(name);
      return "([^/]+)";
    });
    const regex = new RegExp(`^${pattern}$`);

    this.routes.push({ method, path, regex, paramNames, handler });
    return this;
  }

  get(path, handler) { return this._addRoute("GET", path, handler); }
  post(path, handler) { return this._addRoute("POST", path, handler); }
  put(path, handler) { return this._addRoute("PUT", path, handler); }
  delete(path, handler) { return this._addRoute("DELETE", path, handler); }

  /**
   * 路由中间件 — 匹配请求并执行处理函数
   */
  middleware() {
    return async (req, res, next) => {
      for (const route of this.routes) {
        if (req.method !== route.method) continue;

        const match = req.pathname.match(route.regex);
        if (match) {
          // 提取路径参数
          req.params = {};
          route.paramNames.forEach((name, i) => {
            req.params[name] = match[i + 1];
          });

          await route.handler(req, res);
          return;
        }
      }

      // 没有匹配的路由
      await next();
    };
  }
}

module.exports = Router;
