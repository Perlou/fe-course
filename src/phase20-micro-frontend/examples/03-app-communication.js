// 应用间通信详解
// 运行: node 03-app-communication.js

console.log("=== 应用间通信 ===\n");

// ========== 1. 发布订阅 (EventBus) ==========
console.log("1. EventBus 发布订阅\n");

class EventBus {
  constructor() {
    this.events = new Map();
  }

  on(event, callback) {
    if (!this.events.has(event)) this.events.set(event, []);
    this.events.get(event).push(callback);
    console.log(`  [on] 订阅事件: ${event}`);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    const cbs = this.events.get(event);
    if (cbs) {
      const idx = cbs.indexOf(callback);
      if (idx > -1) cbs.splice(idx, 1);
    }
  }

  emit(event, data) {
    const cbs = this.events.get(event);
    if (cbs) {
      console.log(`  [emit] 触发事件: ${event}, 监听者: ${cbs.length}`);
      cbs.forEach((cb) => cb(data));
    }
  }

  once(event, callback) {
    const unsubscribe = this.on(event, (data) => {
      callback(data);
      unsubscribe();
    });
  }
}

const bus = new EventBus();

// 模拟子应用 A 订阅
bus.on("user:login", (user) => {
  console.log(`    [React-App] 收到登录通知: ${user.name}`);
});

// 模拟子应用 B 订阅
bus.on("user:login", (user) => {
  console.log(`    [Vue-App] 收到登录通知: ${user.name}`);
});

// 主应用触发
bus.emit("user:login", { name: "Alice", role: "admin" });

// ========== 2. 全局状态管理 ==========
console.log("\n2. 全局状态管理 (类似 qiankun initGlobalState)\n");

class GlobalState {
  constructor(initialState = {}) {
    this.state = { ...initialState };
    this.observers = new Map();
    this.nextId = 0;
  }

  // 订阅状态变化
  onStateChange(appName, callback) {
    const id = this.nextId++;
    this.observers.set(id, { appName, callback });
    console.log(`  [subscribe] ${appName} 订阅全局状态`);
    // 立即通知当前状态
    callback(this.state, {});
    return () => this.observers.delete(id);
  }

  // 修改状态
  setState(partial) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...partial };

    console.log(`  [setState] ${JSON.stringify(partial)}`);

    // 通知所有订阅者
    for (const [, observer] of this.observers) {
      observer.callback(this.state, prevState);
    }
  }

  getState() {
    return { ...this.state };
  }
}

const globalState = new GlobalState({ user: null, theme: "light", locale: "zh-CN" });

// 子应用 A 订阅
globalState.onStateChange("React-App", (state, prev) => {
  if (state.theme !== prev.theme) {
    console.log(`    [React-App] 主题变更: ${prev.theme} → ${state.theme}`);
  }
});

// 子应用 B 订阅
globalState.onStateChange("Vue-App", (state, prev) => {
  if (state.user !== prev.user) {
    console.log(`    [Vue-App] 用户变更: ${JSON.stringify(state.user)}`);
  }
});

// 修改状态
console.log();
globalState.setState({ user: { name: "Alice", id: 1 } });
globalState.setState({ theme: "dark" });

// ========== 3. CustomEvent ==========
console.log("\n3. CustomEvent 浏览器原生事件\n");

// 模拟 CustomEvent (Node.js 环境)
class MockEventTarget {
  constructor() {
    this.listeners = new Map();
  }

  addEventListener(type, callback) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(callback);
  }

  dispatchEvent(event) {
    const cbs = this.listeners.get(event.type);
    if (cbs) cbs.forEach((cb) => cb(event));
  }
}

const mockWindow = new MockEventTarget();

// 子应用 A 监听
mockWindow.addEventListener("micro:message", (e) => {
  console.log(`  [React-App] 收到消息: ${JSON.stringify(e.detail)}`);
});

// 子应用 B 监听
mockWindow.addEventListener("micro:message", (e) => {
  console.log(`  [Vue-App] 收到消息: ${JSON.stringify(e.detail)}`);
});

// 发送消息
const event = {
  type: "micro:message",
  detail: { from: "main", action: "navigate", payload: "/dashboard" },
};
console.log(`  [Main] 发送全局消息`);
mockWindow.dispatchEvent(event);

// ========== 4. Props 传递 ==========
console.log("\n4. Props 直接传递\n");

class MicroApp {
  constructor(name) {
    this.name = name;
    this.props = {};
  }

  mount(props) {
    this.props = props;
    console.log(`  [${this.name}] 挂载，收到 Props:`);
    Object.entries(props).forEach(([key, val]) => {
      const display = typeof val === "function" ? "function" : JSON.stringify(val);
      console.log(`    ${key}: ${display}`);
    });
  }
}

const reactApp = new MicroApp("React-App");
reactApp.mount({
  user: { name: "Alice", role: "admin" },
  theme: "dark",
  navigate: (path) => console.log(`导航到 ${path}`),
  onLogout: () => console.log("退出登录"),
});

// ========== 5. 通信方案对比 ==========
console.log("\n5. 通信方案对比\n");
console.log(`
  ┌──────────────────┬────────────────────┬──────────────────┐
  │ 方案              │ 优点                │ 缺点             │
  ├──────────────────┼────────────────────┼──────────────────┤
  │ Props 传递       │ 简单直接           │ 仅主→子，单向    │
  │ EventBus         │ 松耦合，多对多     │ 难以追踪数据流   │
  │ 全局状态         │ 统一管理，可追踪   │ 耦合度较高       │
  │ CustomEvent      │ 浏览器原生         │ 仅限字符串化数据 │
  │ URL 参数         │ 最简单             │ 数据量有限       │
  │ localStorage     │ 持久化，跨标签页   │ 需同步监听       │
  └──────────────────┴────────────────────┴──────────────────┘
`);

console.log("=== 应用间通信完成 ===");
