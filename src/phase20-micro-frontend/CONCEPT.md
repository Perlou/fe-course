# 微前端深入解析

## 📌 一、微前端概念

### 1. 什么是微前端

```
┌──────────────────────────────────────────────────────────┐
│                 微前端 (Micro Frontends)                   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  定义: 将单体前端应用拆分为多个独立子应用                │
│  每个子应用可独立开发、测试、部署                         │
│                                                          │
│  核心价值:                                                │
│  • 技术栈无关 — React/Vue/Angular 共存                   │
│  • 独立部署 — 子应用独立发布                              │
│  • 团队自治 — 各团队独立维护自己的子应用                  │
│  • 渐进迁移 — 旧系统可逐步替换                           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 2. 适用场景

```
✅ 适合:
• 大型企业应用需要拆分
• 多团队独立开发不同模块
• 渐进式技术栈迁移 (jQuery → React)
• 不同技术栈需要共存
• 中后台管理系统整合

❌ 不适合:
• 小型项目 (过度设计)
• 单一团队 (增加复杂度无收益)
• 技术栈统一且无迁移需求
• 对性能要求极高的 C 端应用
```

---

## 📌 二、qiankun 框架

### 1. 主应用配置

```javascript
import { registerMicroApps, start, initGlobalState } from 'qiankun';

// 注册子应用
registerMicroApps([
  {
    name: 'react-app',
    entry: '//localhost:3001',
    container: '#subapp-container',
    activeRule: '/react',
    props: { shared: sharedData },
  },
  {
    name: 'vue-app',
    entry: '//localhost:3002',
    container: '#subapp-container',
    activeRule: '/vue',
  },
]);

// 全局状态
const { onGlobalStateChange, setGlobalState } = initGlobalState({
  user: null,
  theme: 'light',
});

onGlobalStateChange((state, prev) => {
  console.log('主应用感知状态变化:', state, prev);
});

// 启动
start({
  sandbox: { strictStyleIsolation: true },
  prefetch: 'all',
});
```

### 2. 子应用配置 (React)

```javascript
let root = null;

export async function bootstrap() {
  console.log('react app bootstrapped');
}

export async function mount(props) {
  const { container, onGlobalStateChange, setGlobalState } = props;

  onGlobalStateChange?.((state) => {
    console.log('子应用感知全局状态:', state);
  });

  root = ReactDOM.createRoot(container.querySelector('#root'));
  root.render(<App />);
}

export async function unmount(props) {
  root.unmount();
  root = null;
}

// Webpack 配置
module.exports = {
  output: {
    library: 'reactApp',
    libraryTarget: 'umd',
    publicPath: 'http://localhost:3001/',
  },
  devServer: {
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
};
```

---

## 📌 三、Module Federation

### 1. 概念

```
┌──────────────────────────────────────────────────────────┐
│           Module Federation (模块联邦)                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Webpack 5 原生功能                                      │
│  运行时动态加载远程模块                                   │
│  共享依赖，避免重复加载                                   │
│                                                          │
│  Host (主应用):                                          │
│  ├── 消费远程模块                                        │
│  └── 配置 remotes                                        │
│                                                          │
│  Remote (子应用):                                        │
│  ├── 暴露模块给其他应用                                  │
│  ├── 配置 exposes                                        │
│  └── 生成 remoteEntry.js                                │
│                                                          │
│  Shared:                                                 │
│  ├── 共享 react, react-dom 等                            │
│  └── 避免重复加载 (singleton: true)                      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 2. 配置

```javascript
// 主应用 webpack.config.js
const { ModuleFederationPlugin } = require('webpack').container;

new ModuleFederationPlugin({
  name: 'host',
  remotes: {
    app1: 'app1@http://localhost:3001/remoteEntry.js',
    app2: 'app2@http://localhost:3002/remoteEntry.js',
  },
  shared: {
    react: { singleton: true, requiredVersion: '^18.0.0' },
    'react-dom': { singleton: true },
  },
});

// 子应用 webpack.config.js
new ModuleFederationPlugin({
  name: 'app1',
  filename: 'remoteEntry.js',
  exposes: {
    './Button': './src/components/Button',
    './UserList': './src/components/UserList',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
});

// 使用远程组件
const RemoteButton = React.lazy(() => import('app1/Button'));

function App() {
  return (
    <Suspense fallback="Loading...">
      <RemoteButton />
    </Suspense>
  );
}
```

---

## 📌 四、JS 沙箱

### 1. 快照沙箱

```javascript
// 适用于单实例 (一次只运行一个子应用)
class SnapshotSandbox {
  constructor() {
    this.windowSnapshot = {};
    this.modifyPropsMap = {};
  }

  active() {
    // 激活: 保存快照 + 恢复修改
    for (const prop in window) {
      this.windowSnapshot[prop] = window[prop];
    }
    Object.keys(this.modifyPropsMap).forEach((prop) => {
      window[prop] = this.modifyPropsMap[prop];
    });
  }

  inactive() {
    // 卸载: 记录修改 + 恢复快照
    for (const prop in window) {
      if (window[prop] !== this.windowSnapshot[prop]) {
        this.modifyPropsMap[prop] = window[prop];
        window[prop] = this.windowSnapshot[prop];
      }
    }
  }
}
```

### 2. Proxy 沙箱

```javascript
// 适用于多实例 (多个子应用并行)
class ProxySandbox {
  constructor(name) {
    this.name = name;
    this.fakeWindow = {};
    this.running = false;

    this.proxy = new Proxy(this.fakeWindow, {
      get: (target, key) => {
        if (this.running) {
          return key in target ? target[key] : window[key];
        }
        return undefined;
      },
      set: (target, key, value) => {
        if (this.running) {
          target[key] = value;
        }
        return true;
      },
      has: (target, key) => key in target || key in window,
    });
  }

  active() { this.running = true; }
  inactive() { this.running = false; }
}
```

---

## 📌 五、样式隔离

### 方案对比

```
┌──────────────┬────────────────────┬──────────────────┐
│ 方案          │ 原理                │ 注意事项         │
├──────────────┼────────────────────┼──────────────────┤
│ Shadow DOM   │ 浏览器原生隔离      │ 第三方UI库兼容   │
│ CSS Modules  │ 编译时类名 hash     │ 需构建工具支持   │
│ CSS-in-JS    │ 运行时生成唯一类名  │ 性能开销         │
│ BEM 命名空间 │ 约定前缀 (app1__)  │ 依赖团队规范     │
│ Scoped CSS   │ 添加属性选择器      │ Vue 原生支持     │
└──────────────┴────────────────────┴──────────────────┘
```

---

## 📌 六、应用间通信

### 通信方式

```
┌──────────────────────────────────────────────────────┐
│              应用间通信方案                            │
├──────────────────────────────────────────────────────┤
│                                                      │
│  1. Props 传递 — 主应用向子应用传递                   │
│  2. 全局状态 — qiankun initGlobalState               │
│  3. CustomEvent — 浏览器原生事件                     │
│  4. 发布订阅 — EventBus                              │
│  5. URL 参数 — 简单数据通过 URL 传递                 │
│  6. localStorage — 持久化共享数据                    │
│                                                      │
│  推荐: 全局状态(跨框架) + CustomEvent(松耦合)        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 📌 七、路由管理

```javascript
// 主应用路由劫持
class MicroRouter {
  constructor() {
    this.apps = [];
    this.currentApp = null;

    // 劫持 history
    const rawPushState = window.history.pushState;
    window.history.pushState = (...args) => {
      rawPushState.apply(window.history, args);
      this.handleRouteChange();
    };

    window.addEventListener('popstate', () => this.handleRouteChange());
  }

  register(app) {
    this.apps.push(app);
  }

  handleRouteChange() {
    const path = window.location.pathname;
    const matchedApp = this.apps.find(app =>
      path.startsWith(app.activeRule)
    );

    if (matchedApp !== this.currentApp) {
      // 卸载旧应用
      if (this.currentApp) this.currentApp.unmount();
      // 加载新应用
      if (matchedApp) matchedApp.mount();
      this.currentApp = matchedApp;
    }
  }
}
```

---

## 📚 推荐学习资源

| 资源              | 链接                                        |
| ----------------- | ------------------------------------------- |
| qiankun           | qiankun.umijs.org                           |
| Module Federation | webpack.js.org/concepts/module-federation   |
| single-spa        | single-spa.js.org                           |
| Micro Frontends   | micro-frontends.org                         |

---
