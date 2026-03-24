// API 客户端封装详解
// 运行: node 01-api-client.js

console.log("=== API 客户端封装 ===\n");

// ========== 1. 手写 HTTP 客户端 ==========
console.log("1. 手写简化版 Axios\n");

class HttpClient {
  constructor(config = {}) {
    this.baseURL = config.baseURL || "";
    this.timeout = config.timeout || 10000;
    this.headers = config.headers || {};
    this.interceptors = {
      request: [],
      response: [],
    };
  }

  // 添加拦截器
  useRequestInterceptor(onFulfilled, onRejected) {
    this.interceptors.request.push({ onFulfilled, onRejected });
  }

  useResponseInterceptor(onFulfilled, onRejected) {
    this.interceptors.response.push({ onFulfilled, onRejected });
  }

  // 核心请求方法
  async request(config) {
    const mergedConfig = {
      ...config,
      url: this.baseURL + config.url,
      headers: { ...this.headers, ...config.headers },
    };

    // 执行请求拦截器
    let currentConfig = mergedConfig;
    for (const interceptor of this.interceptors.request) {
      try {
        currentConfig = await interceptor.onFulfilled(currentConfig);
      } catch (err) {
        if (interceptor.onRejected) interceptor.onRejected(err);
        throw err;
      }
    }

    // 模拟 HTTP 请求
    console.log(`  [HTTP] ${currentConfig.method} ${currentConfig.url}`);

    let response;
    try {
      response = await this._simulateRequest(currentConfig);
    } catch (err) {
      // 执行响应错误拦截器
      for (const interceptor of this.interceptors.response) {
        if (interceptor.onRejected) {
          try {
            response = await interceptor.onRejected(err);
            break;
          } catch (e) {
            err = e;
          }
        }
      }
      if (!response) throw err;
    }

    // 执行响应拦截器
    for (const interceptor of this.interceptors.response) {
      response = await interceptor.onFulfilled(response);
    }

    return response;
  }

  // 模拟 HTTP 请求
  async _simulateRequest(config) {
    await new Promise((r) => setTimeout(r, 10));

    // 模拟路由
    const routes = {
      "GET /api/users": { data: [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }] },
      "GET /api/users/1": { data: { id: 1, name: "Alice", email: "alice@test.com" } },
      "POST /api/auth/login": { data: { token: "jwt-token-xxx", user: { id: 1, name: "Alice" } } },
      "POST /api/posts": { data: { id: 1, title: config.data?.title || "New Post" } },
    };

    const key = `${config.method} ${config.url}`;
    const match = routes[key];

    if (match) {
      return { status: 200, data: match.data, config };
    }

    const error = new Error("Not Found");
    error.response = { status: 404, data: { error: "Not Found" } };
    throw error;
  }

  // 便捷方法
  get(url, config = {}) {
    return this.request({ ...config, method: "GET", url });
  }

  post(url, data, config = {}) {
    return this.request({ ...config, method: "POST", url, data });
  }

  put(url, data, config = {}) {
    return this.request({ ...config, method: "PUT", url, data });
  }

  patch(url, data, config = {}) {
    return this.request({ ...config, method: "PATCH", url, data });
  }

  delete(url, config = {}) {
    return this.request({ ...config, method: "DELETE", url });
  }
}

// ========== 2. 使用拦截器 ==========

const api = new HttpClient({ baseURL: "/api" });

// 请求拦截器: 自动添加 Token
api.useRequestInterceptor((config) => {
  const token = "fake-jwt-token"; // 模拟从 localStorage 获取
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`  [拦截] 添加 Token: ${token.slice(0, 15)}...`);
  return config;
});

// 请求拦截器: 日志
api.useRequestInterceptor((config) => {
  config._startTime = Date.now();
  return config;
});

// 响应拦截器: 提取 data
api.useResponseInterceptor(
  (response) => {
    const ms = Date.now() - (response.config._startTime || Date.now());
    console.log(`  [拦截] 响应成功 ${response.status} (${ms}ms)`);
    return response.data; // 直接返回 data
  },
  (error) => {
    console.log(`  [拦截] 响应错误 ${error.response?.status}: ${error.message}`);
    throw error;
  }
);

// ========== 3. 测试请求 ==========
async function demo() {
  console.log("2. 发起请求\n");

  // GET
  const users = await api.get("/users");
  console.log(`  用户列表: ${users.map((u) => u.name).join(", ")}\n`);

  // POST
  const loginResult = await api.post("/auth/login", {
    email: "alice@test.com",
    password: "123456",
  });
  console.log(`  登录结果: token=${loginResult.token.slice(0, 10)}...\n`);

  // 错误处理
  try {
    await api.get("/not-found");
  } catch (err) {
    console.log(`  错误捕获: ${err.response?.status} ${err.message}\n`);
  }

  // ========== 4. API 模块化 ==========
  console.log("3. API 模块化封装\n");

  // 实际项目中的 API 组织
  const userApi = {
    getAll: (params) => api.get("/users", { params }),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post("/users", data),
    update: (id, data) => api.patch(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
  };

  const user = await userApi.getById(1);
  console.log(`  getById(1): ${user.name} (${user.email})`);

  // ========== 5. 错误处理工具 ==========
  console.log("\n4. 统一错误处理");
  console.log(`
  function handleApiError(error) {
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 400: return { error: data.message || '请求参数错误' };
        case 401: return { error: '请先登录' };
        case 403: return { error: '没有权限' };
        case 404: return { error: '资源不存在' };
        case 429: return { error: '请求过于频繁' };
        case 500: return { error: '服务器错误' };
      }
    } else if (error.request) {
      return { error: '网络错误' };
    }
    return { error: error.message };
  }
`);

  console.log("=== API 客户端完成 ===");
}

demo();
