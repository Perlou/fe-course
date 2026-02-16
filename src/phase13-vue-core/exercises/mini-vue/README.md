# 手写 Mini Vue 练习

## 📋 目标

实现简化版 Vue 3，包含响应式系统、组件挂载、Diff 更新。

---

## 🏗️ 核心功能

1. **reactive / ref** — Proxy 响应式
2. **effect** — 依赖收集与触发
3. **computed / watch** — 计算属性与侦听器
4. **h()** — 创建 VNode
5. **mount / patch** — 挂载与更新 DOM
6. **createApp** — 应用入口

---

## 📂 项目结构

```
mini-vue/
├── index.html          # 测试页面
├── reactivity.js        # 响应式系统
├── renderer.js          # 渲染器
├── component.js         # 组件系统
└── index.js             # 入口
```

---

## 🔧 实现步骤

### Step 1: 响应式系统 (`reactivity.js`)

```javascript
let activeEffect = null;
const targetMap = new WeakMap();

export function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      track(target, key);
      const result = Reflect.get(target, key, receiver);
      return typeof result === "object" && result !== null
        ? reactive(result)
        : result;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      if (!Object.is(oldValue, value)) trigger(target, key);
      return result;
    },
  });
}

function track(target, key) {
  /* 收集 activeEffect 到 targetMap */
}
function trigger(target, key) {
  /* 遍历 dep 执行 effect */
}
export function effect(fn) {
  /* 设置 activeEffect 并执行 fn */
}
```

### Step 2: h() 与 mount (`renderer.js`)

```javascript
export function h(type, props, children) {
  return { type, props, children };
}

export function mount(vnode, container) {
  const el = (vnode.el = document.createElement(vnode.type));

  // 处理 props (属性 + 事件)
  if (vnode.props) {
    for (const key in vnode.props) {
      if (key.startsWith("on"))
        el.addEventListener(key.slice(2).toLowerCase(), vnode.props[key]);
      else el.setAttribute(key, vnode.props[key]);
    }
  }

  // 处理 children
  if (typeof vnode.children === "string") {
    el.textContent = vnode.children;
  } else if (Array.isArray(vnode.children)) {
    vnode.children.forEach((child) => mount(child, el));
  }

  container.appendChild(el);
}
```

### Step 3: patch (Diff 更新)

```javascript
export function patch(n1, n2) {
  if (n1.type !== n2.type) {
    // 类型不同: 替换
    const parent = n1.el.parentNode;
    parent.removeChild(n1.el);
    mount(n2, parent);
    return;
  }

  const el = (n2.el = n1.el);
  // 更新 props...
  // 更新 children (简化: 清空重建 / 进阶: 实现 Diff)
}
```

### Step 4: createApp

```javascript
import { reactive, effect } from "./reactivity.js";
import { h, mount, patch } from "./renderer.js";

export function createApp(rootComponent) {
  return {
    mount(selector) {
      const container = document.querySelector(selector);
      const state = reactive(rootComponent.setup());

      let prevTree;
      effect(() => {
        const tree = rootComponent.render(state);
        if (!prevTree) {
          mount(tree, container);
        } else {
          patch(prevTree, tree);
        }
        prevTree = tree;
      });
    },
  };
}
```

---

## 🧪 测试用例

```html
<div id="app"></div>
<script type="module">
  import { createApp, h } from "./index.js";

  const App = {
    setup() {
      return { count: 0 };
    },
    render(state) {
      return h("div", null, [
        h("h1", null, `Count: ${state.count}`),
        h("button", { onClick: () => state.count++ }, "+1"),
      ]);
    },
  };

  createApp(App).mount("#app");
</script>
```

---

## ✅ 验收标准

1. [ ] reactive 能拦截对象读写
2. [ ] effect 自动收集依赖并在变化时重执行
3. [ ] h() 创建 VNode，mount 渲染到 DOM
4. [ ] patch 能更新已有 DOM
5. [ ] createApp 串连响应式 + 渲染

---

## 🌟 进阶挑战

- [ ] 实现 ref 和 computed
- [ ] 实现 watch / watchEffect
- [ ] 支持组件 (函数组件 + setup)
- [ ] 实现 LIS Diff 算法优化列表更新
- [ ] 支持 Props 和 Emit
