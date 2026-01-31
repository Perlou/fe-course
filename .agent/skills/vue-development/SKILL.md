---
name: Vue 开发技能
description: Vue 应用开发的最佳实践和常用模式
---

# Vue 开发技能

## 项目初始化

### 使用 Vite 创建项目

```bash
npx -y create-vite@latest project-name --template vue
cd project-name
npm install
npm run dev
```

### 使用 Nuxt 创建项目

```bash
npx -y nuxi init project-name
cd project-name
npm install
npm run dev
```

## 组件开发规范（Composition API）

### 单文件组件模板

```vue
<script setup>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from "vue";

// Props 定义
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
});

// Emit 定义
const emit = defineEmits(["update", "delete"]);

// 响应式状态
const state = reactive({
  loading: false,
  data: null,
});

const localCount = ref(props.count);

// 计算属性
const doubleCount = computed(() => localCount.value * 2);

// 监听器
watch(
  () => props.count,
  (newVal) => {
    localCount.value = newVal;
  },
);

// 生命周期
onMounted(() => {
  console.log("Component mounted");
});

onUnmounted(() => {
  console.log("Component unmounted");
});

// 方法
const handleClick = () => {
  localCount.value++;
  emit("update", localCount.value);
};
</script>

<template>
  <div class="component-name">
    <h1>{{ title }}</h1>
    <p>Count: {{ localCount }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="handleClick">Increment</button>
  </div>
</template>

<style scoped>
.component-name {
  padding: 1rem;
}
</style>
```

## 常用组合式函数

### useLocalStorage

```javascript
import { ref, watch } from "vue";

export function useLocalStorage(key, defaultValue) {
  const storedValue = localStorage.getItem(key);
  const data = ref(storedValue ? JSON.parse(storedValue) : defaultValue);

  watch(
    data,
    (newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue));
    },
    { deep: true },
  );

  return data;
}
```

### useFetch

```javascript
import { ref, watchEffect } from "vue";

export function useFetch(url) {
  const data = ref(null);
  const error = ref(null);
  const loading = ref(true);

  watchEffect(async () => {
    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(url.value || url);
      if (!response.ok) throw new Error("Network error");
      data.value = await response.json();
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  });

  return { data, error, loading };
}
```

### useEventListener

```javascript
import { onMounted, onUnmounted } from "vue";

export function useEventListener(target, event, callback) {
  onMounted(() => {
    target.addEventListener(event, callback);
  });

  onUnmounted(() => {
    target.removeEventListener(event, callback);
  });
}
```

## 状态管理 - Pinia

### Store 定义

```javascript
import { defineStore } from "pinia";

export const useCounterStore = defineStore("counter", {
  state: () => ({
    count: 0,
    name: "Counter",
  }),

  getters: {
    doubleCount: (state) => state.count * 2,
  },

  actions: {
    increment() {
      this.count++;
    },
    async fetchData() {
      const response = await fetch("/api/data");
      this.data = await response.json();
    },
  },
});
```

### Setup Store（推荐）

```javascript
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useCounterStore = defineStore("counter", () => {
  const count = ref(0);
  const doubleCount = computed(() => count.value * 2);

  function increment() {
    count.value++;
  }

  return { count, doubleCount, increment };
});
```

## 性能优化清单

- [ ] 使用 v-once 渲染静态内容
- [ ] 使用 v-memo 缓存条件渲染
- [ ] 使用 shallowRef/shallowReactive 减少响应式开销
- [ ] 使用 defineAsyncComponent 异步组件
- [ ] 使用 keep-alive 缓存组件状态
- [ ] 合理使用 computed 避免重复计算
