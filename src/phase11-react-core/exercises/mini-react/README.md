# 手写 Mini React 练习

## 📋 目标

实现一个简化版 React，包含 createElement、Fiber 架构、Diff、Hooks。

---

## 🏗️ 核心功能

1. **createElement** — 创建虚拟 DOM
2. **render** — 渲染到真实 DOM
3. **Fiber 工作循环** — 可中断的渲染
4. **Reconciliation** — Diff 比较新旧 Fiber 树
5. **函数组件** — 支持函数组件渲染
6. **useState** — 状态管理 Hook

---

## 📂 项目结构

```
mini-react/
├── index.html           # 测试页面
├── mini-react.js         # 核心实现
└── app.js                # 使用示例
```

---

## 🔧 实现步骤

### Step 1: createElement

```javascript
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object"
          ? child
          : { type: "TEXT_ELEMENT", props: { nodeValue: child, children: [] } },
      ),
    },
  };
}
```

### Step 2: createDom

```javascript
function createDom(fiber) {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);
  return dom;
}

function updateDom(dom, prevProps, nextProps) {
  // 移除旧事件
  Object.keys(prevProps)
    .filter((k) => k.startsWith("on"))
    .filter((k) => !(k in nextProps) || prevProps[k] !== nextProps[k])
    .forEach((k) =>
      dom.removeEventListener(k.slice(2).toLowerCase(), prevProps[k]),
    );

  // 移除旧属性
  Object.keys(prevProps)
    .filter((k) => k !== "children" && !k.startsWith("on"))
    .filter((k) => !(k in nextProps))
    .forEach((k) => (dom[k] = ""));

  // 设置新属性
  Object.keys(nextProps)
    .filter((k) => k !== "children" && !k.startsWith("on"))
    .filter((k) => prevProps[k] !== nextProps[k])
    .forEach((k) => (dom[k] = nextProps[k]));

  // 添加新事件
  Object.keys(nextProps)
    .filter((k) => k.startsWith("on"))
    .filter((k) => prevProps[k] !== nextProps[k])
    .forEach((k) =>
      dom.addEventListener(k.slice(2).toLowerCase(), nextProps[k]),
    );
}
```

### Step 3: Fiber 工作循环

```javascript
let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;
let deletions = null;

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  if (!nextUnitOfWork && wipRoot) commitRoot();
  requestIdleCallback(workLoop);
}
requestIdleCallback(workLoop);
```

### Step 4: render + reconcileChildren + commit

参考 CONCEPT.md 中的完整代码。

### Step 5: 函数组件支持

```javascript
function performUnitOfWork(fiber) {
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }
  // 返回下一个工作单元 (child → sibling → uncle)
  if (fiber.child) return fiber.child;
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }
}
```

### Step 6: useState

```javascript
let wipFiber = null;
let hookIndex = null;

function useState(initial) {
  const oldHook = wipFiber.alternate?.hooks?.[hookIndex];
  const hook = { state: oldHook ? oldHook.state : initial, queue: [] };

  // 执行排队的更新
  oldHook?.queue?.forEach((action) => {
    hook.state = typeof action === "function" ? action(hook.state) : action;
  });

  const setState = (action) => {
    hook.queue.push(action);
    // 触发重新渲染
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}
```

---

## 🧪 测试用例

```html
<!-- index.html -->
<div id="root"></div>
<script type="module" src="./app.js"></script>
```

```javascript
// app.js
import { createElement, render, useState } from "./mini-react.js";

function Counter() {
  const [count, setCount] = useState(0);
  return createElement(
    "div",
    null,
    createElement("h1", null, "Count: ", count),
    createElement("button", { onClick: () => setCount((c) => c + 1) }, "+1"),
    createElement("button", { onClick: () => setCount((c) => c - 1) }, "-1"),
  );
}

render(createElement(Counter, null), document.getElementById("root"));
```

---

## ✅ 验收标准

1. [ ] createElement 正确创建虚拟 DOM
2. [ ] render 能将虚拟 DOM 渲染到页面
3. [ ] Fiber 工作循环可中断执行
4. [ ] Diff 算法能正确区分新增/更新/删除
5. [ ] 支持函数组件
6. [ ] useState 能正确管理状态和触发更新

---

## 🌟 进阶挑战

- [ ] 实现 useEffect
- [ ] 支持 Fragment
- [ ] 支持 className → class 属性转换
- [ ] 实现简单的事件委托
- [ ] 添加 key 支持优化列表 Diff
