// Pinia 状态管理详解
// 运行: node 03-pinia.js (模拟 Pinia 核心原理)

console.log("=== Pinia 状态管理 ===\n");

// ========== 1. Pinia vs Vuex ==========
console.log("1. 为什么选择 Pinia");
console.log(`
  ┌──────────────────┬──────────────────┬──────────────────┐
  │                  │ Vuex 4           │ Pinia            │
  ├──────────────────┼──────────────────┼──────────────────┤
  │ TypeScript 支持  │ 一般              │ 完美             │
  │ Mutation         │ 必须              │ 无 (直接修改)    │
  │ 嵌套模块         │ 复杂 (modules)    │ 扁平 store       │
  │ Composition API  │ 适配              │ 原生支持         │
  │ DevTools         │ ✅                │ ✅               │
  │ SSR 支持         │ ✅                │ ✅               │
  │ 代码分割         │ 手动              │ 自动             │
  │ 包大小           │ ~5KB              │ ~1.5KB           │
  │ 热更新           │ 需插件            │ 内置             │
  └──────────────────┴──────────────────┴──────────────────┘
`);

// ========== 2. 手写 Pinia 核心 ==========
console.log("2. 手写 Pinia 核心原理\n");

// 模拟 Vue 响应式系统
function ref(value) {
  return {
    _value: value,
    get value() {
      return this._value;
    },
    set value(newVal) {
      this._value = newVal;
    },
    __isRef: true,
  };
}

function computed(fn) {
  return {
    get value() {
      return fn();
    },
    __isRef: true,
  };
}

// Pinia 核心: createPinia + defineStore
const storeRegistry = new Map();
const piniaPlugins = [];

function createPinia() {
  const pinia = {
    _stores: storeRegistry,
    use(plugin) {
      piniaPlugins.push(plugin);
      return pinia;
    },
  };
  return pinia;
}

function defineStore(id, setup) {
  return function useStore() {
    if (storeRegistry.has(id)) return storeRegistry.get(id);

    let store;

    if (typeof setup === "function") {
      // ======= Setup Store 风格 =======
      store = setup();
    } else {
      // ======= Option Store 风格 =======
      const { state, getters, actions } = setup;
      const stateData = state ? state() : {};
      store = { ...stateData };

      // Getters → computed (有缓存)
      if (getters) {
        for (const key in getters) {
          Object.defineProperty(store, key, {
            get: () => getters[key](store),
            enumerable: true,
          });
        }
      }

      // Actions: 绑定 this 到 store
      if (actions) {
        for (const key in actions) {
          store[key] = actions[key].bind(store);
        }
      }
    }

    // ======= 通用 API =======

    // $patch: 批量修改状态
    store.$patch = (partialOrFn) => {
      if (typeof partialOrFn === "function") {
        partialOrFn(store);
      } else {
        Object.assign(store, partialOrFn);
      }
      // 通知订阅者
      if (store._subscribers) {
        store._subscribers.forEach((fn) =>
          fn({ type: "patch", storeId: id }, store)
        );
      }
    };

    // $reset: 重置状态 (仅 Option Store)
    if (typeof setup !== "function" && setup.state) {
      const initialState = setup.state();
      store.$reset = () => {
        Object.assign(store, initialState);
        console.log(`  [$reset] ${id} 已重置`);
      };
    }

    // $subscribe: 监听状态变化
    store._subscribers = [];
    store.$subscribe = (callback) => {
      store._subscribers.push(callback);
      return () => {
        store._subscribers = store._subscribers.filter((fn) => fn !== callback);
      };
    };

    // $onAction: 监听 action 调用
    store._actionListeners = [];
    store.$onAction = (callback) => {
      store._actionListeners.push(callback);
    };

    // $id
    store.$id = id;

    storeRegistry.set(id, store);
    return store;
  };
}

// ========== 3. Option Store ==========
console.log("3. Option Store 风格\n");

const useCounterStore = defineStore("counter", {
  state: () => ({
    count: 0,
    name: "Pinia",
    history: [],
  }),

  getters: {
    doubleCount: (state) => state.count * 2,
    greeting: (state) => `Hello ${state.name}! Count: ${state.count}`,
    // getter 中访问其他 getter (通过 state 对象)
    summary: (state) => `${state.name}: ${state.count} (x2=${state.count * 2})`,
  },

  actions: {
    increment() {
      this.history.push(this.count);
      this.count++;
    },
    decrement() {
      this.history.push(this.count);
      this.count--;
    },
    incrementBy(n) {
      this.history.push(this.count);
      this.count += n;
    },
    async fetchData() {
      // 模拟异步
      await new Promise((r) => setTimeout(r, 10));
      this.count = 100;
    },
  },
});

const counter = useCounterStore();

// 订阅状态变化
counter.$subscribe((mutation, state) => {
  console.log(`  [$subscribe] ${mutation.type}: count=${state.count}`);
});

console.log(`  初始: count=${counter.count}, double=${counter.doubleCount}`);
counter.increment();
counter.increment();
console.log(`  +2后: greeting="${counter.greeting}"`);

// $patch 批量修改
counter.$patch({ count: 10, name: "Vue" });
console.log(`  $patch: summary="${counter.summary}"`);

// $patch 函数式
counter.$patch((state) => {
  state.count += 5;
  state.name = "Pinia Store";
});
console.log(`  $patch fn: count=${counter.count}`);

// $reset 重置
counter.$reset();
console.log(`  $reset: count=${counter.count}`);

// ========== 4. Setup Store ==========
console.log("\n4. Setup Store 风格 (推荐)\n");

console.log(`
  // stores/user.js
  import { defineStore } from 'pinia';
  import { ref, computed, watch } from 'vue';

  export const useUserStore = defineStore('user', () => {
    // ref() → state
    const user = ref(null);
    const token = ref('');
    const loginHistory = ref([]);

    // computed() → getters
    const isLoggedIn = computed(() => !!user.value);
    const displayName = computed(() => user.value?.name || '游客');
    const loginCount = computed(() => loginHistory.value.length);

    // function → actions
    async function login(credentials) {
      const res = await api.login(credentials);
      user.value = res.user;
      token.value = res.token;
      loginHistory.value.push(new Date());
    }

    function logout() {
      user.value = null;
      token.value = '';
    }

    // 可以使用 watch 等 Composition API
    watch(user, (newUser) => {
      if (newUser) console.log('用户已登录:', newUser.name);
    });

    // 必须返回所有需要暴露的属性和方法
    return {
      user, token, loginHistory,
      isLoggedIn, displayName, loginCount,
      login, logout,
    };
  });

  // 为什么推荐 Setup Store:
  // 1. 完美 TypeScript 类型推断
  // 2. 可使用 watch, watchEffect, provide/inject
  // 3. 与组件 setup() 写法一致
  // 4. 更灵活的逻辑组织和复用
`);

// ========== 5. storeToRefs ==========
console.log("5. storeToRefs 正确使用\n");

console.log(`
  <script setup>
  import { useCounterStore } from '@/stores/counter';
  import { storeToRefs } from 'pinia';

  const store = useCounterStore();

  // ⚠️ 直接解构会丢失响应性!
  // const { count } = store;           // ❌ count 不是响应式的

  // ✅ 使用 storeToRefs 保持响应性（只提取 state + getters）
  const { count, doubleCount } = storeToRefs(store);

  // ✅ actions 可以直接解构（函数引用不会丢失）
  const { increment, fetchData } = store;

  // ✅ 也可以直接使用 store.xxx
  store.increment();
  store.$patch({ count: 5 });
  </script>

  <template>
    <p>Count: {{ count }}</p>              <!-- 响应式 -->
    <p>Double: {{ doubleCount }}</p>        <!-- 响应式 -->
    <button @click="increment">+1</button>
    <button @click="store.$reset()">重置</button>
  </template>
`);

// ========== 6. 持久化插件 ==========
console.log("6. 持久化插件\n");

console.log(`
  // npm install pinia-plugin-persistedstate

  // main.js
  import { createPinia } from 'pinia';
  import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);

  // store 中启用持久化
  export const useSettingsStore = defineStore('settings', {
    state: () => ({
      theme: 'light',
      locale: 'zh-CN',
      fontSize: 14,
      sidebar: { collapsed: false, width: 240 },
    }),

    persist: {
      key: 'app-settings',                      // localStorage key
      storage: localStorage,                      // 或 sessionStorage
      paths: ['theme', 'locale'],                 // 只持久化部分字段
      beforeRestore: (ctx) => {                   // 恢复前钩子
        console.log('即将恢复 store:', ctx.store.$id);
      },
      afterRestore: (ctx) => {                    // 恢复后钩子
        console.log('已恢复 store:', ctx.store.$id);
      },
    },
  });

  // Setup Store 持久化
  export const useAuthStore = defineStore('auth', () => {
    const token = ref('');
    const user = ref(null);
    return { token, user };
  }, {
    persist: {
      paths: ['token'],   // 只持久化 token
    },
  });
`);

// ========== 7. Store 间通信 ==========
console.log("7. Store 间通信\n");

// 模拟多个 Store
const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    isAuthenticated: false,
  }),
  actions: {
    login(name) {
      this.user = { name, role: "user" };
      this.isAuthenticated = true;
      console.log(`  [Auth] ${name} 登录成功`);
    },
    logout() {
      this.user = null;
      this.isAuthenticated = false;
      console.log("  [Auth] 已退出");
    },
  },
});

const useCartStore = defineStore("cart", {
  state: () => ({
    items: [],
  }),
  getters: {
    totalPrice: (state) =>
      state.items.reduce((sum, item) => sum + item.price * item.qty, 0),
    itemCount: (state) =>
      state.items.reduce((sum, item) => sum + item.qty, 0),
  },
  actions: {
    addItem(product) {
      // 跨 Store 通信：直接调用其他 Store
      const auth = useAuthStore();
      if (!auth.isAuthenticated) {
        console.log("  [Cart] 请先登录!");
        return;
      }

      const existing = this.items.find((i) => i.id === product.id);
      if (existing) {
        existing.qty++;
      } else {
        this.items.push({ ...product, qty: 1 });
      }
      console.log(`  [Cart] 已添加: ${product.name}`);
    },
    checkout() {
      const auth = useAuthStore();
      console.log(
        `  [Cart] ${auth.user.name} 结算: ${this.items.length} 件商品, 总价 ¥${this.totalPrice}`
      );
      this.items = [];
    },
  },
});

// 测试 Store 间通信
const auth = useAuthStore();
const cart = useCartStore();

cart.addItem({ id: 1, name: "React 入门", price: 59 }); // 未登录
auth.login("小明");
cart.addItem({ id: 1, name: "React 入门", price: 59 });
cart.addItem({ id: 2, name: "Vue 进阶", price: 79 });
cart.addItem({ id: 1, name: "React 入门", price: 59 }); // 数量+1
console.log(`  购物车: ${cart.itemCount} 件, 总价 ¥${cart.totalPrice}`);
cart.checkout();

// ========== 8. Store 组织建议 ==========
console.log("\n8. 项目中的 Store 组织建议");
console.log(`
  src/
  └── stores/
      ├── index.js         // 统一导出 (可选)
      ├── auth.js           // 认证相关
      ├── user.js           // 用户信息
      ├── cart.js            // 购物车
      ├── settings.js        // 应用设置
      ├── notification.js    // 通知
      └── plugins/
          └── logger.js      // 自定义插件

  组织原则:
  • 一个 Store 对应一个业务领域
  • 扁平结构，不要嵌套
  • Store 间可以直接调用
  • 使用 Setup Store 获得更好的 TypeScript 支持
  • 通过 Pinia 插件实现横切关注点 (持久化、日志等)
`);

console.log("\n=== Pinia 完成 ===");
