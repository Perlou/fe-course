// Pinia 状态管理详解
// 运行: node 02-pinia.js (模拟 Pinia 核心原理)

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
  └──────────────────┴──────────────────┴──────────────────┘
`);

// ========== 2. 手写 Pinia 核心 ==========
console.log("2. 手写 Pinia 核心原理");

// 模拟 Vue 响应式
function ref(value) {
  return { value, __isRef: true };
}
function computed(fn) {
  return { get value() { return fn(); }, __isRef: true };
}

// 简化版 defineStore
const storeRegistry = new Map();

function defineStore(id, setup) {
  return function useStore() {
    if (storeRegistry.has(id)) return storeRegistry.get(id);

    let store;

    if (typeof setup === 'function') {
      // Setup Store 风格
      store = setup();
    } else {
      // Options Store 风格
      const { state, getters, actions } = setup;
      const stateData = state ? state() : {};
      store = { ...stateData };

      // Getters → computed
      if (getters) {
        for (const key in getters) {
          Object.defineProperty(store, key, {
            get: () => getters[key](store),
          });
        }
      }

      // Actions 绑定 this
      if (actions) {
        for (const key in actions) {
          store[key] = actions[key].bind(store);
        }
      }
    }

    // $patch: 批量修改
    store.$patch = (partial) => {
      if (typeof partial === 'function') {
        partial(store);
      } else {
        Object.assign(store, partial);
      }
    };

    // $reset: 重置状态
    if (typeof setup !== 'function') {
      const initialState = setup.state ? setup.state() : {};  
      store.$reset = () => Object.assign(store, initialState);
    }

    storeRegistry.set(id, store);
    return store;
  };
}

// ========== 3. Option Store ==========
console.log("3. Option Store 风格");

const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: 'Pinia',
  }),
  getters: {
    doubleCount: (state) => state.count * 2,
    greeting: (state) => `Hello ${state.name}! Count: ${state.count}`,
  },
  actions: {
    increment() { this.count++; },
    decrement() { this.count--; },
    async fetchData() {
      // 模拟异步
      await new Promise(r => setTimeout(r, 10));
      this.count = 100;
    },
  },
});

const counter = useCounterStore();
console.log(`  初始: count=${counter.count}, double=${counter.doubleCount}`);
counter.increment();
counter.increment();
console.log(`  +2后: count=${counter.count}, greeting="${counter.greeting}"`);
counter.$patch({ count: 10, name: 'Vue' });
console.log(`  patch: count=${counter.count}, greeting="${counter.greeting}"`);

// ========== 4. Setup Store ==========
console.log("\n4. Setup Store 风格 (推荐)");

console.log(`
  // stores/user.js
  import { defineStore } from 'pinia';
  import { ref, computed } from 'vue';

  export const useUserStore = defineStore('user', () => {
    // ref() → state
    const user = ref(null);
    const token = ref('');

    // computed() → getters
    const isLoggedIn = computed(() => !!user.value);
    const displayName = computed(() => user.value?.name || '游客');

    // function → actions
    async function login(credentials) {
      const res = await api.login(credentials);
      user.value = res.user;
      token.value = res.token;
    }

    function logout() {
      user.value = null;
      token.value = '';
    }

    return { user, token, isLoggedIn, displayName, login, logout };
  });

  // 为什么推荐 Setup Store:
  // 1. 天然支持 TypeScript 类型推断
  // 2. 可使用任何 Composition API (watch, watchEffect 等)
  // 3. 与组件 setup() 写法一致
  // 4. 更灵活的逻辑组织
`);

// ========== 5. 组件中使用 ==========
console.log("5. 组件中使用");
console.log(`
  <script setup>
  import { useCounterStore } from '@/stores/counter';
  import { storeToRefs } from 'pinia';

  const store = useCounterStore();

  // ⚠️ 直接解构会丢失响应性!
  // const { count } = store;  // ❌ count 不是响应式的

  // ✅ 使用 storeToRefs 保持响应性
  const { count, doubleCount } = storeToRefs(store);

  // ✅ actions 可以直接解构
  const { increment, fetchData } = store;

  // $subscribe: 监听状态变化
  store.$subscribe((mutation, state) => {
    console.log('变化:', mutation.type, mutation.storeId);
    localStorage.setItem('counter', JSON.stringify(state));
  });

  // $onAction: 监听 action 调用
  store.$onAction(({ name, args, after, onError }) => {
    console.log('Action:', name, args);
    after((result) => console.log('完成:', result));
    onError((error) => console.log('出错:', error));
  });
  </script>

  <template>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">+1</button>
    <button @click="store.$patch({ count: 0 })">重置</button>
  </template>
`);

// ========== 6. 持久化插件 ==========
console.log("6. Pinia 持久化");
console.log(`
  // npm install pinia-plugin-persistedstate

  // main.js
  import { createPinia } from 'pinia';
  import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);

  // store 中启用
  export const useSettingsStore = defineStore('settings', {
    state: () => ({
      theme: 'light',
      locale: 'zh-CN',
      fontSize: 14,
    }),
    persist: {
      key: 'app-settings',                          // localStorage key
      storage: localStorage,                          // 或 sessionStorage
      paths: ['theme', 'locale'],                     // 只持久化部分字段
      serializer: { serialize: JSON.stringify, deserialize: JSON.parse },
    },
  });
`);

// ========== 7. Store 间通信与组织 ==========
console.log("7. Store 间通信");
console.log(`
  // stores/auth.js
  export const useAuthStore = defineStore('auth', () => {
    const user = ref(null);
    return { user };
  });

  // stores/cart.js
  export const useCartStore = defineStore('cart', () => {
    const authStore = useAuthStore();  // 直接调用其他 store!

    const items = ref([]);

    async function checkout() {
      if (!authStore.user) throw new Error('请先登录');
      await api.checkout(items.value);
      items.value = [];
    }

    return { items, checkout };
  });

  // Store 组织建议:
  // stores/
  //   ├── auth.js       // 认证
  //   ├── cart.js        // 购物车
  //   ├── settings.js    // 设置
  //   └── index.js       // 统一导出
`);

console.log("=== Pinia 完成 ===");
