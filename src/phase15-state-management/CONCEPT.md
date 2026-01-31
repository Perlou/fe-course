# 状态管理深入解析

## 📌 一、状态管理设计原则

### 1. 什么时候需要状态管理

```
不需要:
• 单个组件内的局部状态
• 简单的父子组件通信 (props/events)
• 轻量级跨组件状态 (Context/provide)

需要:
• 多个不相关组件共享状态
• 状态逻辑复杂需要集中管理
• 需要可预测的状态变化 (调试、时间旅行)
• 服务端状态缓存与同步
```

### 2. 状态分类

```
┌─────────────────────────────────────────────────────────────┐
│                       状态分类                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Local State (局部状态)                                      │
│  • 组件内部状态                                              │
│  • useState, ref()                                          │
│                                                             │
│  Shared State (共享状态)                                     │
│  • 跨组件共享状态                                            │
│  • Redux, Zustand, Pinia                                    │
│                                                             │
│  Server State (服务端状态)                                   │
│  • API 数据缓存                                              │
│  • React Query, SWR                                         │
│                                                             │
│  URL State (URL 状态)                                        │
│  • 路由参数、查询参数                                        │
│  • React Router, Vue Router                                 │
│                                                             │
│  Form State (表单状态)                                       │
│  • 表单值、验证状态                                          │
│  • React Hook Form, Formik                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📌 二、Flux 架构

```
┌──────────────────────────────────────────────────────────┐
│                      Flux 架构                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│   View ──── Action ──→ Dispatcher ──→ Store ──→ View    │
│    ↑                                            │        │
│    └────────────────────────────────────────────┘        │
│                                                          │
│   1. View 触发 Action                                    │
│   2. Action 通过 Dispatcher 分发                         │
│   3. Store 接收 Action 并更新状态                        │
│   4. Store 通知 View 更新                                │
│                                                          │
│   特点: 单向数据流，状态可预测                            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 📌 三、Redux 原理

### 1. 三大原则

```
1. 单一数据源 (Single Source of Truth)
   整个应用状态存储在单一 Store 中

2. 状态只读 (State is Read-Only)
   只能通过 dispatch(action) 改变状态

3. 纯函数修改 (Changes Made with Pure Functions)
   Reducer 是纯函数: (state, action) => newState
```

### 2. 简化实现

```javascript
function createStore(reducer, initialState) {
  let state = initialState;
  let listeners = [];

  function getState() {
    return state;
  }

  function dispatch(action) {
    state = reducer(state, action);
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }

  return { getState, dispatch, subscribe };
}

// 使用
const reducer = (state = { count: 0 }, action) => {
  switch (action.type) {
    case "INCREMENT":
      return { ...state, count: state.count + 1 };
    default:
      return state;
  }
};

const store = createStore(reducer);
store.subscribe(() => console.log(store.getState()));
store.dispatch({ type: "INCREMENT" });
```

---

## 📌 四、原子化状态管理

### 1. Jotai (React)

```javascript
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";

// 定义原子
const countAtom = atom(0);

// 派生原子
const doubleCountAtom = atom((get) => get(countAtom) * 2);

// 可写派生原子
const incrementAtom = atom(null, (get, set) =>
  set(countAtom, get(countAtom) + 1)
);

// 使用
function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const doubleCount = useAtomValue(doubleCountAtom);
  const increment = useSetAtom(incrementAtom);

  return (
    <div>
      <p>Count: {count}</p>
      <p>Double: {doubleCount}</p>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

### 2. 原子化 vs 中心化

```
┌─────────────────┬─────────────────┬─────────────────┐
│                 │    原子化        │    中心化        │
├─────────────────┼─────────────────┼─────────────────┤
│ 代表            │ Jotai, Recoil   │ Redux, Zustand  │
│ 状态结构        │ 分散的原子      │ 单一 Store      │
│ 组件重渲染      │ 精确订阅        │ 全局订阅        │
│ 学习曲线        │ 简单            │ 中等            │
│ 适合场景        │ 细粒度状态      │ 复杂业务逻辑    │
└─────────────────┴─────────────────┴─────────────────┘
```

---

## 📌 五、服务端状态管理

### 1. TanStack Query (React Query)

```javascript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// 查询
function UserList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetch("/api/users").then((res) => res.json()),
    staleTime: 5 * 60 * 1000, // 5分钟内不会重新请求
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// 变更
function AddUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newUser) => {
      return fetch("/api/users", {
        method: "POST",
        body: JSON.stringify(newUser),
      });
    },
    onSuccess: () => {
      // 使缓存失效，重新获取
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return (
    <button
      onClick={() => mutation.mutate({ name: "New User" })}
      disabled={mutation.isPending}
    >
      Add User
    </button>
  );
}
```

### 2. SWR

```javascript
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

function Profile() {
  const { data, error, isLoading, mutate } = useSWR("/api/user", fetcher);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error</div>;

  return (
    <div>
      <p>Hello, {data.name}</p>
      <button onClick={() => mutate()}>Refresh</button>
    </div>
  );
}
```

---

## 📌 六、状态管理对比

```
┌─────────────────┬─────────────┬─────────────┬─────────────┐
│                 │   Redux     │   Zustand   │   Pinia     │
├─────────────────┼─────────────┼─────────────┼─────────────┤
│ 框架            │ React       │ React       │ Vue         │
│ 体积            │ 较大        │ 小          │ 小          │
│ 样板代码        │ 多          │ 少          │ 少          │
│ DevTools        │ ✅          │ ✅          │ ✅          │
│ 中间件          │ 丰富        │ 内置        │ 插件        │
│ TypeScript      │ 需配置      │ 原生        │ 原生        │
│ 学习曲线        │ 陡峭        │ 平缓        │ 平缓        │
└─────────────────┴─────────────┴─────────────┴─────────────┘
```

---

## 📚 推荐学习资源

| 资源           | 链接                      |
| -------------- | ------------------------- |
| Redux          | redux.js.org              |
| Zustand        | github.com/pmndrs/zustand |
| Jotai          | jotai.org                 |
| TanStack Query | tanstack.com/query        |

---
