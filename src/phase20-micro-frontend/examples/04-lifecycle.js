// 微前端生命周期管理详解
// 运行: node 04-lifecycle.js

console.log("=== 微前端生命周期管理 ===\n");

// ========== 1. 生命周期定义 ==========
console.log("1. 子应用生命周期\n");
console.log(`
  ┌─────────────────────────────────────────────────┐
  │           子应用生命周期                          │
  ├─────────────────────────────────────────────────┤
  │                                                 │
  │  加载 (load)                                    │
  │    ↓  获取子应用入口 HTML/JS                    │
  │  初始化 (bootstrap)                             │
  │    ↓  仅执行一次                                │
  │  挂载 (mount)                                   │
  │    ↓  渲染到容器中                              │
  │  运行中...                                      │
  │    ↓  路由切换                                  │
  │  卸载 (unmount)                                 │
  │    ↓  清理事件/定时器/DOM                       │
  │  (再次挂载) → 跳过 bootstrap，直接 mount        │
  │                                                 │
  └─────────────────────────────────────────────────┘
`);

// ========== 2. 模拟微前端框架 ==========
console.log("2. 模拟微前端框架 (Mini qiankun)\n");

class MicroFrontend {
  constructor() {
    this.apps = new Map();
    this.currentApp = null;
  }

  registerApp(config) {
    this.apps.set(config.name, {
      ...config,
      status: "NOT_LOADED",
      bootstrapped: false,
    });
    console.log(`  注册子应用: ${config.name} (路由: ${config.activeRule})`);
  }

  // 路由匹配
  matchApp(path) {
    for (const [, app] of this.apps) {
      if (path.startsWith(app.activeRule)) return app;
    }
    return null;
  }

  // 加载子应用
  async loadApp(app) {
    if (app.status === "NOT_LOADED") {
      console.log(`  [load] ${app.name} — 加载入口文件`);
      app.status = "LOADING";
      // 模拟加载 HTML/JS
      await new Promise((r) => setTimeout(r, 10));
      app.status = "LOADED";
    }
  }

  // 启动
  async bootstrapApp(app) {
    if (!app.bootstrapped) {
      console.log(`  [bootstrap] ${app.name} — 初始化 (仅一次)`);
      if (app.lifecycle.bootstrap) await app.lifecycle.bootstrap();
      app.bootstrapped = true;
    }
  }

  // 挂载
  async mountApp(app) {
    console.log(`  [mount] ${app.name} — 渲染到 ${app.container}`);
    app.status = "MOUNTED";
    if (app.lifecycle.mount) {
      await app.lifecycle.mount({ container: app.container, props: app.props });
    }
  }

  // 卸载
  async unmountApp(app) {
    console.log(`  [unmount] ${app.name} — 清理`);
    app.status = "UNMOUNTED";
    if (app.lifecycle.unmount) await app.lifecycle.unmount();
  }

  // 路由切换
  async navigate(path) {
    console.log(`\n  📍 路由切换: ${path}`);

    const matchedApp = this.matchApp(path);

    // 卸载当前应用
    if (this.currentApp && this.currentApp !== matchedApp) {
      await this.unmountApp(this.currentApp);
    }

    // 加载并挂载新应用
    if (matchedApp && matchedApp !== this.currentApp) {
      await this.loadApp(matchedApp);
      await this.bootstrapApp(matchedApp);
      await this.mountApp(matchedApp);
    }

    this.currentApp = matchedApp;

    if (!matchedApp) {
      console.log(`  ⚠️  无匹配应用`);
    }
  }
}

// 创建框架实例
const micro = new MicroFrontend();

// 注册子应用
micro.registerApp({
  name: "react-dashboard",
  activeRule: "/dashboard",
  container: "#sub-container",
  props: { theme: "dark" },
  lifecycle: {
    bootstrap: async () => console.log(`    → React 初始化完成`),
    mount: async ({ container }) => console.log(`    → React 渲染到 ${container}`),
    unmount: async () => console.log(`    → React 已卸载`),
  },
});

micro.registerApp({
  name: "vue-settings",
  activeRule: "/settings",
  container: "#sub-container",
  props: { locale: "zh-CN" },
  lifecycle: {
    bootstrap: async () => console.log(`    → Vue 初始化完成`),
    mount: async ({ container }) => console.log(`    → Vue 渲染到 ${container}`),
    unmount: async () => console.log(`    → Vue 已卸载`),
  },
});

// 模拟路由切换
async function simulateNavigation() {
  await micro.navigate("/dashboard");          // 加载 + bootstrap + mount React
  await micro.navigate("/dashboard/users");    // 保持 React (路由前缀匹配)
  await micro.navigate("/settings");           // 卸载 React, 加载 Vue
  await micro.navigate("/settings/profile");   // 保持 Vue
  await micro.navigate("/dashboard");          // 卸载 Vue, mount React (跳过 bootstrap)
  await micro.navigate("/unknown");            // 无匹配

  // ========== 3. 路由劫持 ==========
  console.log("\n3. 路由劫持原理\n");
  console.log(`
  // 劫持 history API
  const rawPushState = window.history.pushState;
  const rawReplaceState = window.history.replaceState;

  window.history.pushState = (...args) => {
    rawPushState.apply(window.history, args);
    // 触发路由变化处理
    handleRouteChange();
  };

  window.history.replaceState = (...args) => {
    rawReplaceState.apply(window.history, args);
    handleRouteChange();
  };

  // 监听浏览器前进/后退
  window.addEventListener('popstate', handleRouteChange);

  function handleRouteChange() {
    const path = window.location.pathname;
    const matchedApp = findMatchedApp(path);
    // 卸载旧应用 → 挂载新应用
  }
`);

  // ========== 4. 资源清理 ==========
  console.log("4. 子应用卸载清理清单\n");
  console.log(`
  unmount 时必须清理:
  ✅ 移除 DOM 节点
  ✅ 清除事件监听 (window.removeEventListener)
  ✅ 清除定时器 (clearInterval, clearTimeout)
  ✅ 取消未完成的 HTTP 请求 (AbortController)
  ✅ 解除全局状态订阅
  ✅ 清除 MutationObserver
  ✅ 释放 WebSocket 连接

  ⚠️  常见内存泄漏:
  • 忘记清理定时器
  • 忘记移除事件监听
  • 闭包持有 DOM 引用
  • 未取消的网络请求
`);

  console.log("=== 生命周期管理完成 ===");
}

simulateNavigation();
