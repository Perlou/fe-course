// Zustand 状态管理详解
// 运行: node 02-zustand.js (模拟 Zustand 核心原理)

console.log("=== Zustand 状态管理 ===\n");

// ========== 1. 为什么选择 Zustand ==========
console.log("1. 为什么选择 Zustand");
console.log(`
  ┌──────────────────┬──────────────────┬──────────────────┐
  │                  │ Redux Toolkit    │ Zustand          │
  ├──────────────────┼──────────────────┼──────────────────┤
  │ 包大小           │ ~11KB            │ ~1.1KB           │
  │ 样板代码         │ 中等             │ 极少             │
  │ Provider         │ 需要             │ 不需要           │
  │ Selector         │ 手动 (reselect)  │ 内置             │
  │ Immer            │ 内置             │ 可选中间件       │
  │ DevTools         │ 内置             │ 可选中间件       │
  │ 中间件系统       │ 内置             │ 组合式           │
  │ 学习曲线         │ 中等             │ 平缓             │
  │ 适合项目         │ 大型             │ 中小型           │
  └──────────────────┴──────────────────┴──────────────────┘
`);

// ========== 2. 手写 Zustand 核心 ==========
console.log("2. 手写 Zustand 核心\n");

function createStore(createState) {
  let state;
  const listeners = new Set();

  const setState = (partial, replace) => {
    const nextState =
      typeof partial === "function" ? partial(state) : partial;

    // 浅合并（除非 replace 为 true）
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = replace ? nextState : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, previousState));
    }
  };

  const getState = () => state;

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const destroy = () => listeners.clear();

  // 初始化状态
  const api = { setState, getState, subscribe, destroy };
  state = createState(setState, getState, api);

  return api;
}

// 模拟 React Hook: 带 Selector
function useStore(api, selector) {
  const state = api.getState();
  return selector ? selector(state) : state;
}

// ========== 3. 基本使用 ==========
console.log("3. 基本使用\n");

const counterStore = createStore((set, get) => ({
  count: 0,
  name: "Zustand",

  // actions 直接定义在 store 内
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  incrementBy: (n) => set((state) => ({ count: state.count + n })),
  reset: () => set({ count: 0 }),

  // 使用 get() 读取最新状态
  getDoubleCount: () => get().count * 2,
}));

// 订阅变化
const unsub = counterStore.subscribe((state, prev) => {
  if (state.count !== prev.count) {
    console.log(`  count: ${prev.count} → ${state.count}`);
  }
});

counterStore.getState().increment();
counterStore.getState().increment();
counterStore.getState().incrementBy(10);
console.log(`  doubleCount: ${counterStore.getState().getDoubleCount()}`);
counterStore.getState().reset();
unsub();

// ========== 4. Selector 精确订阅 ==========
console.log("\n4. Selector 精确订阅\n");

console.log(`
  // 在 React 中的使用方式:
  
  // ❌ 订阅整个 store → 任意属性变化都会重渲染
  const store = useCounterStore();
  
  // ✅ 精确订阅 → 只有 count 变化时重渲染
  const count = useCounterStore((state) => state.count);
  
  // ✅ 选择多个属性 (需要 useShallow)
  import { useShallow } from 'zustand/react/shallow';
  
  const { name, count } = useCounterStore(
    useShallow((state) => ({ name: state.name, count: state.count }))
  );
  
  // ✅ actions 不会导致重渲染 (引用不变)
  const increment = useCounterStore((state) => state.increment);
`);

// 演示 selector 机制
const selectCount = (state) => state.count;
const selectName = (state) => state.name;

console.log(
  "  selectCount:",
  useStore(counterStore, selectCount)
);
console.log(
  "  selectName:",
  useStore(counterStore, selectName)
);

// ========== 5. 中间件 ==========
console.log("\n5. 中间件模式\n");

// 手写 persist 中间件
function persist(config, options) {
  return (set, get, api) => {
    const { name: storeName, getStorage = () => null } = options || {};

    // 模拟从 storage 恢复
    console.log(`  [persist] 已配置: key="${storeName}"`);

    const initialState = config(
      (...args) => {
        set(...args);
        // 状态变化时保存
        const state = get();
        console.log(`  [persist] 已保存到 storage: ${storeName}`);
      },
      get,
      api
    );

    return initialState;
  };
}

// 手写 devtools 中间件
function devtools(config, options) {
  return (set, get, api) => {
    const { name: storeName } = options || {};

    return config(
      (...args) => {
        const prev = get();
        set(...args);
        const next = get();
        console.log(`  [devtools] ${storeName}: state updated`);
      },
      get,
      api
    );
  };
}

// 组合中间件: devtools(persist(store))
const todoStore = createStore(
  devtools(
    persist(
      (set, get) => ({
        todos: [],
        addTodo: (text) =>
          set((state) => ({
            todos: [...state.todos, { id: Date.now(), text, done: false }],
          })),
        toggleTodo: (id) =>
          set((state) => ({
            todos: state.todos.map((t) =>
              t.id === id ? { ...t, done: !t.done } : t
            ),
          })),
        removeTodo: (id) =>
          set((state) => ({
            todos: state.todos.filter((t) => t.id !== id),
          })),
        get todoCount() {
          return get().todos.length;
        },
      }),
      { name: "todo-storage" }
    ),
    { name: "TodoStore" }
  )
);

todoStore.getState().addTodo("学习 Zustand");
todoStore.getState().addTodo("写示例代码");
console.log("  todos:", JSON.stringify(todoStore.getState().todos.map((t) => t.text)));

// ========== 6. 切片模式 (Slices Pattern) ==========
console.log("\n6. 切片模式 (大型应用)\n");

// 每个切片是一个独立的函数
const createAuthSlice = (set) => ({
  user: null,
  token: null,
  isLoggedIn: false,

  login: (username) => {
    set({
      user: { name: username, role: "admin" },
      token: "jwt-token-xxx",
      isLoggedIn: true,
    });
    console.log(`  [Auth] 登录成功: ${username}`);
  },

  logout: () => {
    set({ user: null, token: null, isLoggedIn: false });
    console.log("  [Auth] 已退出登录");
  },
});

const createCartSlice = (set, get) => ({
  items: [],
  totalPrice: 0,

  addItem: (item) => {
    // 可以读取其他切片的状态
    if (!get().isLoggedIn) {
      console.log("  [Cart] 请先登录!");
      return;
    }
    set((state) => {
      const newItems = [...state.items, item];
      return {
        items: newItems,
        totalPrice: newItems.reduce((sum, i) => sum + i.price, 0),
      };
    });
    console.log(`  [Cart] 添加: ${item.name} ¥${item.price}`);
  },

  clearCart: () => set({ items: [], totalPrice: 0 }),
});

// 合并切片
const boundStore = createStore((...args) => ({
  ...createAuthSlice(...args),
  ...createCartSlice(...args),
}));

// 测试切片间通信
boundStore.getState().addItem({ name: "React 书", price: 99 }); // 未登录
boundStore.getState().login("Alice");
boundStore.getState().addItem({ name: "React 书", price: 99 });
boundStore.getState().addItem({ name: "Vue 书", price: 79 });
console.log(`  总价: ¥${boundStore.getState().totalPrice}`);
console.log(`  购物车: ${boundStore.getState().items.map((i) => i.name).join(", ")}`);

// ========== 7. 实际使用示例 ==========
console.log("\n7. 实际使用示例 (React)");
console.log(`
  // stores/useStore.js
  import { create } from 'zustand';
  import { persist, devtools, immer } from 'zustand/middleware';
  
  export const useStore = create(
    devtools(
      persist(
        immer((set) => ({
          // State
          user: null,
          theme: 'light',
          notifications: [],
  
          // Actions
          setUser: (user) => set((state) => { state.user = user; }),
          setTheme: (theme) => set((state) => { state.theme = theme; }),
          addNotification: (msg) => set((state) => {
            state.notifications.push({ id: Date.now(), msg, read: false });
          }),
          markAsRead: (id) => set((state) => {
            const notif = state.notifications.find((n) => n.id === id);
            if (notif) notif.read = true;
          }),
        })),
        { name: 'app-store' }
      )
    )
  );
  
  // 组件中使用
  function Header() {
    const user = useStore((s) => s.user);
    const theme = useStore((s) => s.theme);
    const setTheme = useStore((s) => s.setTheme);
  
    return (
      <header className={theme}>
        <span>{user?.name || '访客'}</span>
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          切换主题
        </button>
      </header>
    );
  }
`);

console.log("\n=== Zustand 完成 ===");
