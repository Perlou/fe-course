# 微前端深入解析

## 📌 一、微前端概念

### 适用场景

```
✅ 适合:
• 大型应用需要拆分
• 多团队独立开发
• 渐进式技术迁移
• 不同技术栈共存

❌ 不适合:
• 小型项目
• 单一团队
• 技术栈统一且无迁移需求
```

---

## 📌 二、qiankun

### 1. 主应用配置

```javascript
import { registerMicroApps, start } from "qiankun";

registerMicroApps([
  {
    name: "react-app",
    entry: "//localhost:3001",
    container: "#subapp-container",
    activeRule: "/react",
    props: { shared: sharedData },
  },
  {
    name: "vue-app",
    entry: "//localhost:3002",
    container: "#subapp-container",
    activeRule: "/vue",
  },
]);

start({ sandbox: { strictStyleIsolation: true } });
```

### 2. 子应用配置

```javascript
// React 子应用
export async function bootstrap() {
  console.log('react app bootstraped');
}

export async function mount(props) {
  ReactDOM.render(
    <App />,
    props.container.querySelector('#root')
  );
}

export async function unmount(props) {
  ReactDOM.unmountComponentAtNode(
    props.container.querySelector('#root')
  );
}

// Webpack 配置
output: {
  library: 'reactApp',
  libraryTarget: 'umd',
  publicPath: 'http://localhost:3001/'
}
```

---

## 📌 三、Module Federation

```javascript
// 主应用 webpack.config.js
new ModuleFederationPlugin({
  name: "host",
  remotes: {
    app1: "app1@http://localhost:3001/remoteEntry.js",
    app2: "app2@http://localhost:3002/remoteEntry.js",
  },
  shared: ["react", "react-dom"],
});

// 子应用 webpack.config.js
new ModuleFederationPlugin({
  name: "app1",
  filename: "remoteEntry.js",
  exposes: {
    "./Button": "./src/components/Button",
  },
  shared: ["react", "react-dom"],
});

// 使用远程组件
const RemoteButton = React.lazy(() => import("app1/Button"));
```

---

## 📌 四、样式隔离

```
方案:
1. Shadow DOM
2. CSS Modules
3. CSS-in-JS
4. 命名空间前缀
5. qiankun 的 strictStyleIsolation
```

## 📌 五、JS 沙箱

```javascript
// 快照沙箱
class SnapshotSandbox {
  constructor() {
    this.windowSnapshot = {};
    this.modifyPropsMap = {};
  }

  active() {
    for (const prop in window) {
      this.windowSnapshot[prop] = window[prop];
    }
    Object.keys(this.modifyPropsMap).forEach((prop) => {
      window[prop] = this.modifyPropsMap[prop];
    });
  }

  inactive() {
    for (const prop in window) {
      if (window[prop] !== this.windowSnapshot[prop]) {
        this.modifyPropsMap[prop] = window[prop];
        window[prop] = this.windowSnapshot[prop];
      }
    }
  }
}

// Proxy 沙箱
class ProxySandbox {
  constructor() {
    this.fakeWindow = {};
    this.proxy = new Proxy(this.fakeWindow, {
      get: (target, key) => {
        return key in target ? target[key] : window[key];
      },
      set: (target, key, value) => {
        target[key] = value;
        return true;
      },
    });
  }
}
```

---

## 📚 推荐学习资源

| 资源              | 链接                                      |
| ----------------- | ----------------------------------------- |
| qiankun           | qiankun.umijs.org                         |
| Module Federation | webpack.js.org/concepts/module-federation |

---
