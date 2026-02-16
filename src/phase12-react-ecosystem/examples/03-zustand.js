// Zustand 状态管理详解
// 运行: node 03-zustand.js (模拟 Zustand 核心原理)

console.log("=== Zustand 状态管理 ===\n");

// ========== 1. Zustand 核心原理 ==========
console.log("1. 手写 Zustand 核心 (约 20 行)");

function create(createState) {
  let state;
  const listeners = new Set();

  const setState = (partial) => {
    const next = typeof partial === 'function' ? partial(state) : partial;
    if (!Object.is(next, state)) {
      state = Object.assign({}, state, next);
      listeners.forEach(fn => fn(state));
    }
  };

  const getState = () => state;

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  // 模拟 useStore hook (简化版，真实版本用 useSyncExternalStore)
  const useStore = (selector = s => s) => {
    return selector(state);
  };

  // 初始化 state
  state = createState(setState, getState);

  useStore.getState = getState;
  useStore.setState = setState;
  useStore.subscribe = subscribe;

  return useStore;
}

// ========== 2. 基础用法 ==========
console.log("2. 基础用法");

const useCounterStore = create((set, get) => ({
  count: 0,
  name: 'Zustand',

  // 同步 action
  increment: () => set(state => ({ count: state.count + 1 })),
  decrement: () => set(state => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
  setName: (name) => set({ name }),

  // 使用 get() 获取最新状态
  getDouble: () => get().count * 2,
}));

// 订阅变化
const unsub = useCounterStore.subscribe(state => {
  console.log(`  State: count=${state.count}, name=${state.name}`);
});

useCounterStore.getState().increment();
useCounterStore.getState().increment();
useCounterStore.getState().setName('Store');
console.log('  Double:', useCounterStore.getState().getDouble());
unsub();

// ========== 3. React 中使用 ==========
console.log("\n3. React 组件中使用");

console.log(`
  import { create } from 'zustand';

  const useStore = create((set) => ({
    bears: 0,
    addBear: () => set(state => ({ bears: state.bears + 1 })),
    removeAll: () => set({ bears: 0 }),
  }));

  // 方式一: 选择单个状态 (推荐, 精确重渲染)
  function BearCount() {
    const bears = useStore(state => state.bears);
    return <h1>{bears} bears</h1>;
  }

  // 方式二: 选择多个状态 (需 shallow 比较)
  import { shallow } from 'zustand/shallow';

  function BearInfo() {
    const { bears, addBear } = useStore(
      state => ({ bears: state.bears, addBear: state.addBear }),
      shallow  // 浅比较，避免每次重渲染
    );
    return <button onClick={addBear}>{bears}</button>;
  }

  // 方式三: 在组件外使用
  const bears = useStore.getState().bears;
  useStore.setState({ bears: 10 });
`);

// ========== 4. 异步操作 ==========
console.log("4. 异步操作");

const useAsyncStore = create((set) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      // 模拟 API 调用
      await new Promise(r => setTimeout(r, 100));
      const users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
      set({ users, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
}));

console.log('  开始获取用户...');
await useAsyncStore.getState().fetchUsers();
console.log('  用户:', useAsyncStore.getState().users);

// ========== 5. 中间件 ==========
console.log("\n5. 中间件");

console.log(`
  import { create } from 'zustand';
  import { devtools, persist, immer } from 'zustand/middleware';

  // 1. devtools — Redux DevTools 支持
  const useStore = create(
    devtools(
      (set) => ({
        count: 0,
        increment: () => set(
          state => ({ count: state.count + 1 }),
          false,           // replace? false = merge
          'increment'      // action 名称 (在 devtools 中显示)
        ),
      }),
      { name: 'MyStore' }  // DevTools 中的名称
    )
  );

  // 2. persist — 持久化到 localStorage
  const useStore = create(
    persist(
      (set) => ({
        theme: 'light',
        setTheme: (t) => set({ theme: t }),
      }),
      {
        name: 'app-storage',              // localStorage key
        partialize: (state) => ({ theme: state.theme }), // 只持久化部分状态
        storage: createJSONStorage(() => sessionStorage), // 自定义存储
      }
    )
  );

  // 3. immer — Immer 风格的不可变更新
  const useStore = create(
    immer((set) => ({
      todos: [],
      addTodo: (text) => set(state => {
        state.todos.push({ text, done: false }); // 直接修改!
      }),
      toggleTodo: (index) => set(state => {
        state.todos[index].done = !state.todos[index].done;
      }),
    }))
  );

  // 4. 组合中间件
  const useStore = create(
    devtools(
      persist(
        immer((set) => ({ ... })),
        { name: 'store' }
      ),
      { name: 'MyApp' }
    )
  );
`);

// ========== 6. Slice 模式 ==========
console.log("6. Slice 模式 (大型应用)");

console.log(`
  // slices/authSlice.js
  export const createAuthSlice = (set) => ({
    user: null,
    token: null,
    login: async (creds) => {
      const { user, token } = await api.login(creds);
      set({ user, token });
    },
    logout: () => set({ user: null, token: null }),
  });

  // slices/cartSlice.js
  export const createCartSlice = (set, get) => ({
    items: [],
    addItem: (item) => set(state => ({
      items: [...state.items, item]
    })),
    total: () => get().items.reduce((sum, i) => sum + i.price, 0),
  });

  // store.js — 合并所有 Slices
  import { create } from 'zustand';

  const useStore = create((...a) => ({
    ...createAuthSlice(...a),
    ...createCartSlice(...a),
  }));

  // 使用
  const user = useStore(s => s.user);
  const addItem = useStore(s => s.addItem);
`);

// ========== 7. 最佳实践 ==========
console.log("7. Zustand 最佳实践");

console.log(`
  ┌──────────────────────────────────────────────────────────┐
  │ ✅ 推荐                                                  │
  ├──────────────────────────────────────────────────────────┤
  │ 1. 使用 selector 精确选择状态，避免不必要重渲染           │
  │    const count = useStore(s => s.count);  ✅             │
  │    const store = useStore();              ❌              │
  │                                                          │
  │ 2. action 放在 store 内部                                │
  │    create((set) => ({ increment: () => set(...) }))  ✅  │
  │                                                          │
  │ 3. 大型应用用 Slice 模式拆分                              │
  │                                                          │
  │ 4. 组合多个中间件: devtools + persist + immer             │
  │                                                          │
  │ 5. 选择多个值时用 shallow 比较                            │
  │    useStore(s => ({ a: s.a, b: s.b }), shallow)          │
  └──────────────────────────────────────────────────────────┘
`);

console.log("=== Zustand 完成 ===");
