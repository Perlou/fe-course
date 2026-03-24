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

### 3. 选型决策树

```
你需要管理什么状态?
│
├─ 组件内部状态 → useState / ref()
│
├─ 父子组件通信 → props / emit
│
├─ 跨层级组件共享 → 
│   ├─ 少量简单状态 → Context (React) / provide-inject (Vue)
│   ├─ React 项目 → 
│   │   ├─ 极简需求 → Zustand
│   │   ├─ 细粒度订阅 → Jotai / Recoil
│   │   └─ 大型团队 → Redux Toolkit
│   └─ Vue 项目 → Pinia
│
├─ 服务端数据缓存 →
│   ├─ React → TanStack Query
│   └─ Vue → TanStack Query / VueQuery
│
└─ 表单状态 →
    ├─ React → React Hook Form / Formik
    └─ Vue → VeeValidate / FormKit
```

---

## 📌 二、Flux 架构

### 1. 核心概念

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

### 2. 从 Flux 到 Redux

```
Flux 的问题:
• 多个 Store 之间依赖关系复杂
• Dispatcher 是全局单例，难以测试

Redux 的改进:
• 单一 Store (Single Source of Truth)
• 纯函数 Reducer 替代 Store 回调
• 去掉 Dispatcher，直接 dispatch(action)
```

---

## 📌 三、Redux 核心原理

### 1. 三大原则

```
1. 单一数据源 (Single Source of Truth)
   整个应用状态存储在单一 Store 中

2. 状态只读 (State is Read-Only)
   只能通过 dispatch(action) 改变状态

3. 纯函数修改 (Changes Made with Pure Functions)
   Reducer 是纯函数: (state, action) => newState
```

### 2. 手写 Redux 核心

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

  // 初始化：触发一次 dispatch 获取初始状态
  dispatch({ type: '@@INIT' });

  return { getState, dispatch, subscribe };
}
```

### 3. 中间件机制

```javascript
// 中间件签名: store => next => action => { ... }
function loggerMiddleware(store) {
  return function (next) {
    return function (action) {
      console.log('dispatching:', action.type);
      console.log('prev state:', store.getState());
      const result = next(action);
      console.log('next state:', store.getState());
      return result;
    };
  };
}

// thunk 中间件：支持 dispatch 函数
function thunkMiddleware(store) {
  return (next) => (action) => {
    if (typeof action === 'function') {
      return action(store.dispatch, store.getState);
    }
    return next(action);
  };
}

// applyMiddleware
function applyMiddleware(...middlewares) {
  return (createStore) => (reducer, initialState) => {
    const store = createStore(reducer, initialState);
    let dispatch = store.dispatch;

    const api = {
      getState: store.getState,
      dispatch: (action) => dispatch(action),
    };

    const chain = middlewares.map((mw) => mw(api));
    dispatch = compose(...chain)(store.dispatch);

    return { ...store, dispatch };
  };
}
```

### 4. Redux Toolkit 现代用法

```javascript
import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// createSlice = reducer + action creators
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0, status: 'idle' },
  reducers: {
    increment: (state) => { state.value += 1; },      // 可 "mutate"（Immer）
    decrement: (state) => { state.value -= 1; },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCount.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCount.fulfilled, (state, action) => {
        state.status = 'idle';
        state.value = action.payload;
      });
  },
});

// 异步 thunk
const fetchCount = createAsyncThunk('counter/fetchCount', async (amount) => {
  const response = await fetch(`/api/count?amount=${amount}`);
  return response.json();
});

// 配置 Store
const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
```

---

## 📌 四、Zustand（React 现代方案）

### 1. 基本使用

```javascript
import { create } from 'zustand';

// 创建 Store
const useCounterStore = create((set, get) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
  getDoubleCount: () => get().count * 2,
}));

// 组件中使用
function Counter() {
  const count = useCounterStore((state) => state.count);       // 精确订阅
  const increment = useCounterStore((state) => state.increment);
  return <button onClick={increment}>{count}</button>;
}

// ⚠️ 避免订阅整个 store
// const store = useCounterStore();  // ❌ 任意属性变化都会重渲染
```

### 2. Selector 精确订阅

```javascript
import { useShallow } from 'zustand/react/shallow';

// 选择多个属性
function UserInfo() {
  const { name, age } = useCounterStore(
    useShallow((state) => ({ name: state.name, age: state.age }))
  );
  // 只有 name 或 age 变化时重渲染
}
```

### 3. 中间件

```javascript
import { create } from 'zustand';
import { persist, devtools, immer } from 'zustand/middleware';

const useStore = create(
  devtools(
    persist(
      immer((set) => ({
        todos: [],
        addTodo: (text) =>
          set((state) => {
            state.todos.push({ id: Date.now(), text, done: false }); // Immer 直接修改
          }),
        toggleTodo: (id) =>
          set((state) => {
            const todo = state.todos.find((t) => t.id === id);
            if (todo) todo.done = !todo.done;
          }),
      })),
      { name: 'todo-storage' }   // persist 配置
    ),
    { name: 'TodoStore' }        // devtools 配置
  )
);
```

### 4. 切片模式（大型应用）

```javascript
// 将大 Store 拆分为切片
const createAuthSlice = (set) => ({
  user: null,
  token: null,
  login: async (credentials) => {
    const res = await api.login(credentials);
    set({ user: res.user, token: res.token });
  },
  logout: () => set({ user: null, token: null }),
});

const createCartSlice = (set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  clearCart: () => set({ items: [] }),
});

// 合并切片
const useBoundStore = create((...args) => ({
  ...createAuthSlice(...args),
  ...createCartSlice(...args),
}));
```

### 5. 手写 Zustand 核心

```javascript
function createStore(createState) {
  let state;
  const listeners = new Set();

  const setState = (partial) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial;
    if (!Object.is(nextState, state)) {
      state = Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state));
    }
  };

  const getState = () => state;

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  state = createState(setState, getState);

  return { setState, getState, subscribe };
}
```

---

## 📌 五、Pinia（Vue 官方方案）

### 1. Option Store

```javascript
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: 'Pinia',
  }),

  getters: {
    doubleCount: (state) => state.count * 2,          // 有缓存
    greeting: (state) => `Hello ${state.name}!`,
    // getter 中使用其他 getter
    doubleCountPlusOne() {
      return this.doubleCount + 1;                     // 需要用 this
    },
  },

  actions: {
    increment() { this.count++; },
    async fetchData() {
      const res = await fetch('/api/data');
      this.count = await res.json();
    },
  },
});
```

### 2. Setup Store（推荐）

```javascript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCounterStore = defineStore('counter', () => {
  // ref() → state
  const count = ref(0);
  const name = ref('Pinia');

  // computed() → getters
  const doubleCount = computed(() => count.value * 2);

  // function → actions
  function increment() { count.value++; }
  async function fetchData() {
    const res = await fetch('/api/data');
    count.value = await res.json();
  }

  return { count, name, doubleCount, increment, fetchData };
});

// 优势：
// 1. 完美 TypeScript 类型推断
// 2. 可使用 watch, watchEffect 等 Composition API
// 3. 更灵活的逻辑组织
```

### 3. 组件中使用

```vue
<script setup>
import { useCounterStore } from '@/stores/counter';
import { storeToRefs } from 'pinia';

const store = useCounterStore();

// ⚠️ 直接解构会丢失响应性!
// const { count } = store;  // ❌ 不是响应式

// ✅ storeToRefs 保持响应性
const { count, doubleCount } = storeToRefs(store);

// ✅ actions 可以直接解构
const { increment } = store;

// $patch: 批量修改
store.$patch({ count: 10, name: 'Vue' });
store.$patch((state) => {
  state.count += 10;
  state.name = 'Vue';
});

// $subscribe: 监听状态变化
store.$subscribe((mutation, state) => {
  localStorage.setItem('counter', JSON.stringify(state));
});

// $onAction: 监听 action 调用
store.$onAction(({ name, args, after, onError }) => {
  console.log('Action:', name, args);
  after((result) => console.log('完成'));
  onError((error) => console.error('失败'));
});
</script>
```

### 4. 持久化

```javascript
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    theme: 'light',
    locale: 'zh-CN',
  }),
  persist: {
    key: 'app-settings',
    storage: localStorage,
    paths: ['theme', 'locale'],    // 只持久化部分字段
  },
});
```

### 5. Store 间通信

```javascript
// stores/auth.js
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  return { user };
});

// stores/cart.js — 直接调用其他 Store
export const useCartStore = defineStore('cart', () => {
  const authStore = useAuthStore();
  const items = ref([]);

  async function checkout() {
    if (!authStore.user) throw new Error('请先登录');
    await api.checkout(items.value);
    items.value = [];
  }

  return { items, checkout };
});
```

---

## 📌 六、原子化状态管理

### 1. Jotai（React）

```javascript
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';

// 基础原子
const countAtom = atom(0);

// 派生原子（只读）
const doubleCountAtom = atom((get) => get(countAtom) * 2);

// 可写派生原子
const incrementAtom = atom(
  null,
  (get, set) => set(countAtom, get(countAtom) + 1)
);

// 异步原子
const userAtom = atom(async () => {
  const res = await fetch('/api/user');
  return res.json();
});

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
┌─────────────────┬──────────────────┬──────────────────┐
│                 │    原子化         │    中心化         │
├─────────────────┼──────────────────┼──────────────────┤
│ 代表            │ Jotai, Recoil    │ Redux, Zustand   │
│ 状态结构        │ 分散的原子        │ 单一 Store       │
│ 组件重渲染      │ 精确订阅          │ 选择器订阅       │
│ 状态依赖        │ 原子间派生        │ 手动选择         │
│ 学习曲线        │ 简单             │ 中等             │
│ DevTools        │ 有限             │ 完善             │
│ 适合场景        │ 细粒度状态        │ 复杂业务逻辑     │
│ 代码组织        │ 自下而上          │ 自上而下         │
└─────────────────┴──────────────────┴──────────────────┘
```

### 3. 核心原理

```javascript
// 手写原子化状态管理核心
function atom(initialValue) {
  let value = typeof initialValue === 'function' ? undefined : initialValue;
  const subscribers = new Set();
  const deriveFn = typeof initialValue === 'function' ? initialValue : null;

  return {
    get: () => {
      if (deriveFn) return deriveFn(atomGetter);
      return value;
    },
    set: (newValue) => {
      value = typeof newValue === 'function' ? newValue(value) : newValue;
      subscribers.forEach((fn) => fn(value));
    },
    subscribe: (fn) => {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
  };
}
```

---

## 📌 七、服务端状态管理

### 1. TanStack Query（React Query）

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// 查询
function UserList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then((res) => res.json()),
    staleTime: 5 * 60 * 1000,   // 5 分钟内视为新鲜
    gcTime: 30 * 60 * 1000,     // 30 分钟后垃圾回收
    retry: 3,                    // 失败重试 3 次
    refetchOnWindowFocus: true,  // 窗口聚焦时重新获取
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <ul>{data.map((u) => <li key={u.id}>{u.name}</li>)}</ul>;
}

// 变更
function AddUser() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newUser) =>
      fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(newUser),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return (
    <button
      onClick={() => mutation.mutate({ name: 'New User' })}
      disabled={mutation.isPending}
    >
      Add User
    </button>
  );
}
```

### 2. 乐观更新

```javascript
const mutation = useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    // 取消正在进行的查询
    await queryClient.cancelQueries({ queryKey: ['todos'] });

    // 保存快照
    const previousTodos = queryClient.getQueryData(['todos']);

    // 乐观更新
    queryClient.setQueryData(['todos'], (old) =>
      old.map((t) => (t.id === newTodo.id ? newTodo : t))
    );

    return { previousTodos };
  },
  onError: (err, newTodo, context) => {
    // 回滚
    queryClient.setQueryData(['todos'], context.previousTodos);
  },
  onSettled: () => {
    // 最终同步服务端数据
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});
```

### 3. SWR

```javascript
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

function Profile() {
  const { data, error, isLoading, mutate } = useSWR('/api/user', fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 2000,
  });

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

### 4. 客户端状态 vs 服务端状态

```
┌──────────────────┬───────────────────┬───────────────────┐
│                  │   客户端状态       │   服务端状态       │
├──────────────────┼───────────────────┼───────────────────┤
│ 所有权           │ 客户端完全控制     │ 仅是快照/缓存     │
│ 数据来源         │ 用户交互          │ API / 数据库       │
│ 同步             │ 无需              │ 需要同步策略       │
│ 过期             │ 不会过期          │ 会变得陈旧         │
│ 工具             │ Zustand / Redux   │ TanStack Query     │
│ 典型例子         │ UI 状态、表单     │ 用户列表、文章     │
└──────────────────┴───────────────────┴───────────────────┘
```

---

## 📌 八、状态管理方案对比

```
┌─────────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│                 │   Redux TK  │   Zustand   │   Pinia     │   Jotai     │
├─────────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│ 框架            │ React       │ React       │ Vue         │ React       │
│ 体积            │ ~11KB       │ ~1.1KB      │ ~1.5KB      │ ~2.4KB      │
│ 样板代码        │ 中等        │ 极少        │ 少          │ 极少        │
│ 状态模型        │ 中心化      │ 中心化      │ 中心化      │ 原子化      │
│ DevTools        │ 完善        │ ✅          │ ✅          │ 有限        │
│ 中间件          │ 丰富        │ 内置        │ 插件        │ 无          │
│ TypeScript      │ 需配置      │ 原生        │ 原生        │ 原生        │
│ SSR 支持        │ 需配置      │ ✅          │ ✅          │ ✅          │
│ 学习曲线        │ 中等        │ 平缓        │ 平缓        │ 平缓        │
│ 适用场景        │ 大型项目    │ 中小型项目  │ Vue 项目    │ 细粒度状态  │
└─────────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

---

## 📌 九、最佳实践

### 1. 状态分层策略

```
┌───────────────────────────────────────┐
│         应用状态分层                    │
├───────────────────────────────────────┤
│                                       │
│  Layer 1: 组件局部状态                │
│  └─ useState / ref                    │
│     适合: 表单输入、UI 开关            │
│                                       │
│  Layer 2: 跨组件共享状态              │
│  └─ Zustand / Pinia / Context         │
│     适合: 用户信息、主题、权限         │
│                                       │
│  Layer 3: 服务端状态                  │
│  └─ TanStack Query / SWR             │
│     适合: API 数据、列表、详情         │
│                                       │
│  Layer 4: URL 状态                    │
│  └─ Router params / search params     │
│     适合: 分页、筛选、排序             │
│                                       │
└───────────────────────────────────────┘
```

### 2. 常见反模式

```
❌ 反模式                              ✅ 正确做法
─────────────────────────────────────────────────────
把所有状态都放全局 Store          →  区分局部/共享/服务端状态
在 Store 中存储可派生的数据      →  使用 getter/selector 计算
直接在组件中修改 Store 状态      →  通过 action 修改
一个巨大的 Store                 →  按功能模块拆分
Store 中处理 UI 状态 (loading)   →  使用 TanStack Query 管理
把 API 数据手动存到 Store        →  使用 TanStack Query/SWR
```

### 3. 性能优化

```javascript
// React: 使用 Selector 避免不必要重渲染
const count = useStore((state) => state.count);    // ✅ 精确订阅
const store = useStore();                           // ❌ 订阅全部

// Vue: 使用 storeToRefs 保持响应性
const { count } = storeToRefs(store);               // ✅ 响应式解构
const { count } = store;                            // ❌ 丢失响应性

// 状态范式化（Normalization）
// ❌ 嵌套结构
{ posts: [{ id: 1, author: { id: 1, name: 'Alice' } }] }

// ✅ 范式化结构
{
  posts: { byId: { 1: { id: 1, authorId: 1 } }, allIds: [1] },
  authors: { byId: { 1: { id: 1, name: 'Alice' } }, allIds: [1] }
}
```

---

## 📚 推荐学习资源

| 资源             | 链接                                |
| ---------------- | ----------------------------------- |
| Redux Toolkit    | redux-toolkit.js.org                |
| Zustand          | github.com/pmndrs/zustand           |
| Pinia            | pinia.vuejs.org                     |
| Jotai            | jotai.org                           |
| TanStack Query   | tanstack.com/query                  |
| SWR              | swr.vercel.app                      |
| 状态管理选型指南  | github.com/pmndrs/zustand/wiki      |

---
