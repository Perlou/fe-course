# Vue 生态深入解析

## 📌 一、Vue Router 4

### 1. 基本配置

```javascript
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", component: Home },
  { path: "/about", component: About },
  { path: "/user/:id", component: User, props: true },
  { path: "/:pathMatch(.*)*", component: NotFound },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// main.js
app.use(router);
```

### 2. 嵌套路由

```javascript
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    children: [
      { path: '', component: DashboardHome },
      { path: 'stats', component: DashboardStats },
      { path: 'settings', component: DashboardSettings }
    ]
  }
];

// Dashboard.vue
<template>
  <nav>...</nav>
  <router-view />  <!-- 子路由出口 -->
</template>
```

### 3. 路由守卫

```javascript
// 全局守卫
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }
});

router.afterEach((to, from) => {
  document.title = to.meta.title || "My App";
});

// 路由独享守卫
const routes = [
  {
    path: "/admin",
    component: Admin,
    beforeEnter: (to, from) => {
      if (!isAdmin()) return "/";
    },
  },
];

// 组件内守卫
export default {
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      // 可以访问组件实例
    });
  },
  beforeRouteUpdate(to, from) {
    // 路由参数变化时调用
  },
  beforeRouteLeave(to, from) {
    if (hasUnsavedChanges) {
      return confirm("确定离开？");
    }
  },
};
```

### 4. Composition API

```javascript
import { useRouter, useRoute } from "vue-router";

export default {
  setup() {
    const router = useRouter();
    const route = useRoute();

    // 获取参数
    const userId = computed(() => route.params.id);
    const query = computed(() => route.query);

    // 编程式导航
    const goHome = () => router.push("/");
    const goBack = () => router.back();
    const replace = () => router.replace("/new");

    return { userId, goHome };
  },
};
```

---

## 📌 二、Pinia

### 1. 定义 Store

```javascript
// Option Store
import { defineStore } from "pinia";

export const useCounterStore = defineStore("counter", {
  state: () => ({
    count: 0,
    items: [],
  }),

  getters: {
    doubleCount: (state) => state.count * 2,
    itemCount: (state) => state.items.length,
  },

  actions: {
    increment() {
      this.count++;
    },
    async fetchItems() {
      this.items = await api.getItems();
    },
  },
});

// Setup Store (推荐)
export const useCounterStore = defineStore("counter", () => {
  const count = ref(0);
  const items = ref([]);

  const doubleCount = computed(() => count.value * 2);

  function increment() {
    count.value++;
  }

  async function fetchItems() {
    items.value = await api.getItems();
  }

  return { count, items, doubleCount, increment, fetchItems };
});
```

### 2. 使用 Store

```vue
<script setup>
import { useCounterStore } from "@/stores/counter";
import { storeToRefs } from "pinia";

const counterStore = useCounterStore();

// 解构需要 storeToRefs 保持响应性
const { count, doubleCount } = storeToRefs(counterStore);

// actions 可以直接解构
const { increment, fetchItems } = counterStore;
</script>

<template>
  <div>Count: {{ count }}</div>
  <div>Double: {{ doubleCount }}</div>
  <button @click="increment">+1</button>
</template>
```

### 3. 持久化

```javascript
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

// store 中启用
export const useUserStore = defineStore("user", {
  state: () => ({ token: null }),
  persist: true, // 默认 localStorage
  // persist: { storage: sessionStorage }
});
```

---

## 📌 三、组件通信

### 1. Props & Emits

```vue
<!-- Parent.vue -->
<template>
  <Child :message="msg" @update="handleUpdate" />
</template>

<!-- Child.vue -->
<script setup>
const props = defineProps({
  message: { type: String, required: true },
});

const emit = defineEmits(["update"]);

const handleClick = () => emit("update", "new value");
</script>
```

### 2. v-model

```vue
<!-- Parent.vue -->
<template>
  <Child v-model="value" v-model:title="title" />
</template>

<!-- Child.vue -->
<script setup>
const props = defineProps(["modelValue", "title"]);
const emit = defineEmits(["update:modelValue", "update:title"]);
</script>

<template>
  <input
    :value="modelValue"
    @input="emit('update:modelValue', $event.target.value)"
  />
</template>
```

### 3. Provide / Inject

```javascript
// 祖先组件
import { provide, ref } from "vue";

const theme = ref("dark");
provide("theme", theme);
provide("updateTheme", (value) => {
  theme.value = value;
});

// 后代组件
import { inject } from "vue";

const theme = inject("theme", "light"); // 默认值
const updateTheme = inject("updateTheme");
```

### 4. 事件总线 (mitt)

```javascript
// eventBus.js
import mitt from "mitt";
export const emitter = mitt();

// 发送事件
import { emitter } from "@/eventBus";
emitter.emit("user-login", user);

// 监听事件
emitter.on("user-login", (user) => {
  console.log(user);
});

// 清理
onUnmounted(() => {
  emitter.off("user-login");
});
```

---

## 📌 四、Composables

```javascript
// useCounter.js
import { ref, computed } from "vue";

export function useCounter(initialValue = 0) {
  const count = ref(initialValue);

  const doubleCount = computed(() => count.value * 2);

  function increment() {
    count.value++;
  }

  function decrement() {
    count.value--;
  }

  return { count, doubleCount, increment, decrement };
}

// useFetch.js
import { ref, watchEffect } from "vue";

export function useFetch(url) {
  const data = ref(null);
  const error = ref(null);
  const loading = ref(true);

  watchEffect(async () => {
    loading.value = true;
    try {
      const response = await fetch(url.value || url);
      data.value = await response.json();
    } catch (e) {
      error.value = e;
    } finally {
      loading.value = false;
    }
  });

  return { data, error, loading };
}

// useLocalStorage.js
import { ref, watch } from "vue";

export function useLocalStorage(key, defaultValue) {
  const stored = localStorage.getItem(key);
  const value = ref(stored ? JSON.parse(stored) : defaultValue);

  watch(
    value,
    (newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue));
    },
    { deep: true }
  );

  return value;
}

// 使用
const { count, increment } = useCounter(10);
const { data, loading } = useFetch("/api/users");
const theme = useLocalStorage("theme", "dark");
```

---

## 📌 五、Nuxt 3

### 1. 目录结构

```
nuxt-app/
├── app.vue           // 根组件
├── nuxt.config.ts    // 配置文件
├── pages/            // 自动路由
│   ├── index.vue     // /
│   ├── about.vue     // /about
│   └── user/
│       └── [id].vue  // /user/:id
├── components/       // 自动导入组件
├── composables/      // 自动导入 composables
├── layouts/          // 布局
├── middleware/       // 中间件
├── plugins/          // 插件
├── server/           // 服务端 API
│   └── api/
│       └── users.ts
└── public/           // 静态资源
```

### 2. 数据获取

```vue
<script setup>
// useFetch: 智能缓存 + 自动刷新
const { data, pending, error, refresh } = await useFetch("/api/users");

// useAsyncData: 自定义数据获取
const { data } = await useAsyncData("users", () => {
  return $fetch("/api/users");
});

// useLazyFetch: 不阻塞页面渲染
const { data, pending } = useLazyFetch("/api/users");

// 仅在服务端获取
const { data } = await useFetch("/api/secret", {
  server: true,
  client: false,
});
</script>

<template>
  <div v-if="pending">Loading...</div>
  <div v-else-if="error">{{ error.message }}</div>
  <ul v-else>
    <li v-for="user in data" :key="user.id">{{ user.name }}</li>
  </ul>
</template>
```

### 3. 服务端 API

```typescript
// server/api/users.ts
export default defineEventHandler(async (event) => {
  // 获取查询参数
  const query = getQuery(event);

  // 获取请求体
  const body = await readBody(event);

  // 获取路由参数
  const id = event.context.params?.id;

  // 返回数据
  return { users: [...] };
});

// server/api/users/[id].ts
export default defineEventHandler((event) => {
  const id = event.context.params.id;
  return { id, name: 'User ' + id };
});
```

### 4. 中间件

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useAuth();

  if (!user.value && to.path !== '/login') {
    return navigateTo('/login');
  }
});

// 页面中使用
<script setup>
definePageMeta({
  middleware: 'auth'
});
</script>
```

### 5. 布局

```vue
<!-- layouts/default.vue -->
<template>
  <div>
    <header>Header</header>
    <slot />
    <footer>Footer</footer>
  </div>
</template>

<!-- layouts/admin.vue -->
<template>
  <div class="admin-layout">
    <aside>Sidebar</aside>
    <main><slot /></main>
  </div>
</template>

<!-- 页面中指定布局 -->
<script setup>
definePageMeta({
  layout: "admin",
});
</script>
```

---

## 📌 六、性能优化

### 1. 组件优化

```vue
<!-- 异步组件 -->
<script setup>
const HeavyComponent = defineAsyncComponent(() =>
  import("./HeavyComponent.vue")
);
</script>

<!-- v-memo -->
<template>
  <div v-for="item in list" :key="item.id" v-memo="[item.id, item.selected]">
    {{ item.name }}
  </div>
</template>

<!-- v-once -->
<span v-once>{{ staticContent }}</span>
```

### 2. 虚拟列表

```vue
<script setup>
import { useVirtualList } from "@vueuse/core";

const { list, containerProps, wrapperProps } = useVirtualList(items, {
  itemHeight: 50,
});
</script>

<template>
  <div v-bind="containerProps" style="height: 400px">
    <div v-bind="wrapperProps">
      <div v-for="{ data, index } in list" :key="index">
        {{ data.name }}
      </div>
    </div>
  </div>
</template>
```

### 3. 防抖与节流

```javascript
import { useDebounceFn, useThrottleFn } from "@vueuse/core";

const debouncedSearch = useDebounceFn((query) => {
  search(query);
}, 500);

const throttledScroll = useThrottleFn(() => {
  handleScroll();
}, 100);
```

---

## 📚 推荐学习资源

| 资源       | 链接             |
| ---------- | ---------------- |
| Vue Router | router.vuejs.org |
| Pinia      | pinia.vuejs.org  |
| Nuxt       | nuxt.com         |
| VueUse     | vueuse.org       |

---
