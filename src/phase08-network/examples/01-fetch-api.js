// Fetch API 与 HTTP 请求详解
// 运行: node 01-fetch-api.js (Node 18+ 原生支持 fetch)

console.log("=== Fetch API 与 HTTP 请求 ===\n");

// ========== 1. 基本 GET 请求 ==========
console.log("1. 基本 GET 请求");

async function basicGet() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts/1");

    // 响应元数据
    console.log("  状态码:", response.status);
    console.log("  状态文本:", response.statusText);
    console.log("  OK:", response.ok); // status 在 200-299 范围内
    console.log("  Headers:");
    console.log("    Content-Type:", response.headers.get("content-type"));

    // 解析响应体
    const data = await response.json();
    console.log("  数据:", { id: data.id, title: data.title.substring(0, 30) + "..." });
  } catch (error) {
    console.log("  请求失败:", error.message);
  }
}

await basicGet();

// ========== 2. POST 请求 ==========
console.log("\n2. POST 请求");

async function postData() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Hello World",
        body: "这是一篇测试文章",
        userId: 1,
      }),
    });

    const data = await response.json();
    console.log("  创建成功:", data);
  } catch (error) {
    console.log("  请求失败:", error.message);
  }
}

await postData();

// ========== 3. 请求配置详解 ==========
console.log("\n3. 请求配置详解");

console.log(`
  fetch(url, {
    method: 'POST',              // 请求方法
    headers: {                   // 请求头
      'Content-Type': 'application/json',
      'Authorization': 'Bearer token',
      'X-Custom-Header': 'value',
    },
    body: JSON.stringify(data),  // 请求体
    mode: 'cors',                // cors | no-cors | same-origin
    credentials: 'include',      // include | same-origin | omit
    cache: 'no-cache',           // default | no-store | reload | no-cache
    redirect: 'follow',         // follow | manual | error
    signal: controller.signal,   // AbortController 信号
  });

  ┌─────────────────┬──────────────────────────────────────┐
  │ credentials     │ 说明                                  │
  ├─────────────────┼──────────────────────────────────────┤
  │ omit            │ 不发送 Cookie                         │
  │ same-origin     │ 同源时发送 Cookie (默认)               │
  │ include         │ 跨域也发送 Cookie                     │
  └─────────────────┴──────────────────────────────────────┘
`);

// ========== 4. 响应体解析 ==========
console.log("4. 响应体解析方式");

console.log(`
  response.json()        // 解析 JSON → Object
  response.text()        // 解析为文本 → String
  response.blob()        // 解析为二进制 → Blob (浏览器)
  response.arrayBuffer() // 解析为 ArrayBuffer
  response.formData()    // 解析为 FormData (浏览器)

  ⚠️ 注意: 响应体只能读取一次!
  const data = await response.json();   // ✅ 第一次
  const text = await response.text();   // ❌ 已消费，报错

  // 需要多次读取时，先 clone
  const clone = response.clone();
  const data = await response.json();
  const text = await clone.text();
`);

// ========== 5. 错误处理 ==========
console.log("5. 错误处理");

async function fetchWithErrorHandling(url) {
  try {
    const response = await fetch(url);

    // fetch 只在网络错误时 reject
    // HTTP 4xx/5xx 不会 reject，需要手动检查
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("  请求被取消");
    } else if (error.name === "TypeError") {
      console.log("  网络错误:", error.message);
    } else {
      console.log("  请求错误:", error.message);
    }
    return null;
  }
}

// 测试 404
await fetchWithErrorHandling("https://jsonplaceholder.typicode.com/posts/999999");

console.log(`
  fetch 错误处理要点:
  ┌──────────────────┬──────────────────────────────────────┐
  │ 网络错误         │ TypeError → catch 捕获               │
  │ HTTP 4xx/5xx     │ 不会 reject → 需检查 response.ok     │
  │ 请求取消         │ AbortError → catch 捕获              │
  │ 超时             │ 需手动实现 (AbortController)          │
  └──────────────────┴──────────────────────────────────────┘
`);

// ========== 6. 请求取消 (AbortController) ==========
console.log("6. 请求取消 (AbortController)");

async function fetchWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController();

  // 超时自动取消
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      console.log("  请求超时或被取消");
    }
    throw error;
  }
}

try {
  const data = await fetchWithTimeout(
    "https://jsonplaceholder.typicode.com/posts/1",
    5000,
  );
  console.log("  超时请求成功:", { id: data.id });
} catch (e) {
  // 已在函数内处理
}

// 竞态条件处理 (取消之前的请求)
console.log(`
  // 搜索输入场景: 取消之前未完成的请求
  let currentController = null;

  async function search(keyword) {
    // 取消上一次请求
    if (currentController) {
      currentController.abort();
    }

    currentController = new AbortController();

    try {
      const res = await fetch('/api/search?q=' + keyword, {
        signal: currentController.signal,
      });
      return await res.json();
    } catch (error) {
      if (error.name !== 'AbortError') throw error;
    }
  }
`);

// ========== 7. 封装 HTTP 客户端 ==========
console.log("7. 封装 HTTP 客户端");

class HttpClient {
  constructor(baseURL = "", defaultHeaders = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...defaultHeaders,
    };
    this.interceptors = {
      request: [],
      response: [],
    };
  }

  // 添加拦截器
  addRequestInterceptor(fn) {
    this.interceptors.request.push(fn);
  }

  addResponseInterceptor(fn) {
    this.interceptors.response.push(fn);
  }

  async request(url, options = {}) {
    let config = {
      url: this.baseURL + url,
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options,
    };

    // 执行请求拦截器
    for (const interceptor of this.interceptors.request) {
      config = await interceptor(config);
    }

    const response = await fetch(config.url, {
      method: config.method || "GET",
      headers: config.headers,
      body: config.body,
      signal: config.signal,
    });

    let result = {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      ok: response.ok,
      data: null,
    };

    // 解析响应体
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      result.data = await response.json();
    } else {
      result.data = await response.text();
    }

    // 执行响应拦截器
    for (const interceptor of this.interceptors.response) {
      result = await interceptor(result);
    }

    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.response = result;
      throw error;
    }

    return result;
  }

  // 便捷方法
  get(url, options) {
    return this.request(url, { ...options, method: "GET" });
  }

  post(url, data, options) {
    return this.request(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  put(url, data, options) {
    return this.request(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  delete(url, options) {
    return this.request(url, { ...options, method: "DELETE" });
  }
}

// 使用示例
const api = new HttpClient("https://jsonplaceholder.typicode.com");

// 添加请求拦截器 (如添加 token)
api.addRequestInterceptor((config) => {
  config.headers["X-Request-Time"] = new Date().toISOString();
  return config;
});

// 添加响应拦截器 (如日志)
api.addResponseInterceptor((response) => {
  console.log(`  [${response.status}] 响应数据:`, typeof response.data);
  return response;
});

try {
  const result = await api.get("/posts/1");
  console.log("  GET 成功:", { id: result.data.id, title: result.data.title.substring(0, 20) });

  const created = await api.post("/posts", {
    title: "新文章",
    body: "内容",
    userId: 1,
  });
  console.log("  POST 成功:", created.data);
} catch (error) {
  console.log("  请求失败:", error.message);
}

// ========== 8. 并发请求 ==========
console.log("\n8. 并发请求");

async function parallelRequests() {
  const urls = [
    "https://jsonplaceholder.typicode.com/posts/1",
    "https://jsonplaceholder.typicode.com/posts/2",
    "https://jsonplaceholder.typicode.com/posts/3",
  ];

  // Promise.all: 全部成功才返回
  const start = performance.now();
  const results = await Promise.all(urls.map((url) => fetch(url).then((r) => r.json())));
  console.log(`  Promise.all (${(performance.now() - start).toFixed(0)}ms):`);
  results.forEach((r) => console.log(`    Post ${r.id}: ${r.title.substring(0, 25)}...`));

  // Promise.allSettled: 无论成功失败都返回
  const settled = await Promise.allSettled([
    fetch(urls[0]).then((r) => r.json()),
    fetch("https://invalid.example.com").then((r) => r.json()),
    fetch(urls[2]).then((r) => r.json()),
  ]);

  console.log("\n  Promise.allSettled:");
  settled.forEach((r, i) => {
    if (r.status === "fulfilled") {
      console.log(`    #${i}: ✅ ${r.value.title?.substring(0, 25) || "成功"}`);
    } else {
      console.log(`    #${i}: ❌ ${r.reason.message}`);
    }
  });
}

await parallelRequests();

console.log("\n=== Fetch API 完成 ===");
