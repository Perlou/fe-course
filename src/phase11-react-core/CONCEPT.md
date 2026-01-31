# React 核心原理深入解析

## 📌 一、JSX 原理

### 1. JSX 编译

```jsx
// JSX 语法
<div className="app">
  <h1>Hello</h1>
  <p>World</p>
</div>;

// React 17+ (新 JSX 转换)
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";

_jsxs("div", {
  className: "app",
  children: [
    _jsx("h1", { children: "Hello" }),
    _jsx("p", { children: "World" }),
  ],
});

// React 16 (旧转换)
React.createElement(
  "div",
  { className: "app" },
  React.createElement("h1", null, "Hello"),
  React.createElement("p", null, "World")
);
```

### 2. createElement 实现

```javascript
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}
```

---

## 📌 二、虚拟 DOM

### 1. VNode 结构

```javascript
// 虚拟 DOM 节点
const vnode = {
  type: "div",
  props: {
    className: "container",
    children: [
      {
        type: "h1",
        props: { children: ["Title"] },
      },
      {
        type: "p",
        props: { children: ["Content"] },
      },
    ],
  },
};
```

### 2. 渲染为真实 DOM

```javascript
function render(vnode, container) {
  const dom =
    vnode.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(vnode.type);

  // 设置属性
  Object.keys(vnode.props)
    .filter((key) => key !== "children")
    .forEach((name) => {
      dom[name] = vnode.props[name];
    });

  // 递归渲染子节点
  vnode.props.children.forEach((child) => {
    render(child, dom);
  });

  container.appendChild(dom);
}
```

---

## 📌 三、Fiber 架构

### 1. 为什么需要 Fiber？

```
React 15 (Stack Reconciler):
┌─────────────────────────────────────────────────────────────┐
│  递归遍历，不可中断                                          │
│  大组件树更新时会阻塞主线程，导致卡顿                         │
└─────────────────────────────────────────────────────────────┘

React 16+ (Fiber Reconciler):
┌─────────────────────────────────────────────────────────────┐
│  链表结构，可中断可恢复                                       │
│  将工作分成多个小单元，利用浏览器空闲时间执行                  │
│  支持任务优先级，高优先级任务可以打断低优先级任务              │
└─────────────────────────────────────────────────────────────┘
```

### 2. Fiber 节点结构

```javascript
const fiber = {
  // 静态结构
  type,              // 组件类型 (div, MyComponent, ...)
  key,               // key
  stateNode,         // 对应 DOM 节点 / 组件实例

  // Fiber 树结构 (链表)
  return,            // 父节点
  child,             // 第一个子节点
  sibling,           // 兄弟节点
  index,             // 在兄弟中的索引

  // 工作相关
  pendingProps,      // 新 props
  memoizedProps,     // 旧 props
  memoizedState,     // 状态 / Hooks 链表

  // Effect
  flags,             // 副作用标记 (Placement, Update, Deletion)
  subtreeFlags,      // 子树副作用
  updateQueue,       // 更新队列

  // 双缓存
  alternate          // 对应的 current/workInProgress 节点
};
```

### 3. Fiber 树遍历

```
深度优先遍历:

        App
       / | \
      A  B  C
     /|
    D E

遍历顺序: App → A → D → E → B → C

1. 有子节点 → 进入子节点
2. 无子节点有兄弟 → 进入兄弟节点
3. 无子无兄弟 → 返回父节点，继续查找叔叔节点
```

### 4. 双缓存机制

```
Current Fiber Tree                WorkInProgress Fiber Tree
(当前显示的)                        (正在构建的)
     ┌────┐                              ┌────┐
     │Root│                              │Root│
     └──┬─┘                              └──┬─┘
        │                                   │
     ┌──┴──┐                            ┌──┴──┐
     │ App │ ←──── alternate ────────→  │ App │
     └─────┘                            └─────┘
        │                                   │
     ┌──┴──┐                            ┌──┴──┐
     │Child│ ←──── alternate ────────→  │Child│
     └─────┘                            └─────┘

构建完成后，Root.current 指针切换到 WorkInProgress Tree
```

---

## 📌 四、Reconciliation（协调）

### 1. 渲染阶段

```
渲染阶段 (Render Phase) - 可中断
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  beginWork:                                                 │
│    • 创建 Fiber 节点                                         │
│    • 进入子节点                                              │
│    • 标记副作用 (flags)                                      │
│                                                             │
│  completeWork:                                              │
│    • 创建 DOM 节点                                           │
│    • 收集副作用到父节点                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. 提交阶段

```
提交阶段 (Commit Phase) - 不可中断
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Before Mutation (DOM 操作前):                               │
│    • getSnapshotBeforeUpdate                                │
│                                                             │
│  Mutation (DOM 操作):                                        │
│    • 执行 DOM 增删改                                         │
│    • 切换 current 指针                                       │
│                                                             │
│  Layout (DOM 操作后):                                        │
│    • componentDidMount / componentDidUpdate                 │
│    • useLayoutEffect                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. Diff 算法

```
React Diff 策略:

1. 同层比较
   不跨层级比较，降低复杂度 O(n³) → O(n)

2. 类型不同直接替换
   <div> → <span>，直接删除 div，创建 span

3. Key 优化列表更新
   通过 key 识别可复用的节点

列表 Diff:

旧: [A, B, C, D]
新: [A, C, D, B]

1. 第一轮：顺序比较，找到 key 相同的复用
2. 第二轮：剩余节点用 Map 查找复用
3. 移动/新增/删除节点
```

---

## 📌 五、Hooks 原理

### 1. Hooks 存储结构

```
Fiber.memoizedState 是 Hooks 链表的头

Hook1 → Hook2 → Hook3 → null
  │       │       │
state   effect  state

每个 Hook:
{
  memoizedState,   // 当前值
  baseState,       // 基础状态
  baseQueue,       // 基础更新队列
  queue,           // 更新队列
  next             // 下一个 Hook
}
```

### 2. useState 简化实现

```javascript
let workInProgressHook = null;
let isMount = true;
let fiber = {
  memoizedState: null,
  stateNode: App,
};

function useState(initialState) {
  let hook;

  if (isMount) {
    // 首次渲染，创建 Hook
    hook = {
      memoizedState: initialState,
      queue: { pending: null },
      next: null,
    };
    if (!fiber.memoizedState) {
      fiber.memoizedState = hook;
    } else {
      workInProgressHook.next = hook;
    }
    workInProgressHook = hook;
  } else {
    // 更新，复用 Hook
    hook = workInProgressHook;
    workInProgressHook = workInProgressHook.next;
  }

  // 处理更新队列
  let baseState = hook.memoizedState;
  if (hook.queue.pending) {
    let firstUpdate = hook.queue.pending.next;
    do {
      baseState =
        typeof firstUpdate.action === "function"
          ? firstUpdate.action(baseState)
          : firstUpdate.action;
      firstUpdate = firstUpdate.next;
    } while (firstUpdate !== hook.queue.pending.next);
    hook.queue.pending = null;
  }
  hook.memoizedState = baseState;

  return [baseState, dispatchAction.bind(null, hook.queue)];
}

function dispatchAction(queue, action) {
  const update = { action, next: null };

  if (queue.pending === null) {
    update.next = update;
  } else {
    update.next = queue.pending.next;
    queue.pending.next = update;
  }
  queue.pending = update;

  schedule(); // 触发重新渲染
}
```

### 3. useEffect 简化实现

```javascript
function useEffect(callback, deps) {
  const hook = getWorkInProgressHook();

  if (isMount) {
    hook.memoizedState = {
      callback,
      deps,
      destroy: undefined,
    };
    pushEffect(hook.memoizedState);
  } else {
    const prevDeps = hook.memoizedState.deps;
    if (depsChanged(prevDeps, deps)) {
      hook.memoizedState = { callback, deps, destroy: undefined };
      pushEffect(hook.memoizedState);
    }
  }
}

function depsChanged(prevDeps, deps) {
  if (!prevDeps || !deps) return true;
  return deps.some((dep, i) => !Object.is(dep, prevDeps[i]));
}
```

### 4. 为什么 Hooks 不能在条件语句中使用？

```javascript
// ❌ 错误：条件语句中使用 Hooks
function App() {
  const [count, setCount] = useState(0);

  if (count > 0) {
    const [name, setName] = useState(""); // 问题！
  }

  const [age, setAge] = useState(0);
}

// Hooks 通过链表顺序访问
// 首次渲染: Hook1(count) → Hook2(age)
// 当 count > 0 后: Hook1(count) → Hook2(name) → Hook3(age)
// Hook 顺序错乱，导致状态混乱
```

---

## 📌 六、手写 Mini React

```javascript
// 1. 创建元素
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: { nodeValue: text, children: [] },
  };
}

// 2. 渲染
let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;
let deletions = null;

function render(element, container) {
  wipRoot = {
    dom: container,
    props: { children: [element] },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

// 3. 工作循环
function workLoop(deadline) {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

// 4. 执行工作单元
function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  reconcileChildren(fiber, fiber.props.children);

  // 返回下一个工作单元
  if (fiber.child) return fiber.child;

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }
}

// 5. 协调子节点
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate?.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber) {
    const element = elements[index];
    let newFiber = null;

    const sameType = oldFiber && element && oldFiber.type === element.type;

    if (sameType) {
      // 更新
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }
    if (element && !sameType) {
      // 新增
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      };
    }
    if (oldFiber && !sameType) {
      // 删除
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    oldFiber = oldFiber?.sibling;
    index++;
  }
}

// 6. 提交
function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) return;

  const domParent = fiber.parent.dom;

  if (fiber.effectTag === "PLACEMENT" && fiber.dom) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    domParent.removeChild(fiber.dom);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
```

---

## 📚 推荐学习资源

| 资源            | 链接                         |
| --------------- | ---------------------------- |
| React 官方文档  | react.dev                    |
| 手写 React 教程 | pomb.us/build-your-own-react |
| React 源码分析  | react.iamkasong.com          |

---
