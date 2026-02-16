// Vue 3 Composables 详解
// 运行: node 03-composables.js

console.log("=== Vue 3 Composables ===\n");

// ========== 1. 什么是 Composable ==========
console.log("1. Composable 模式");
console.log(`
  Composable = 使用 Composition API 封装可复用逻辑的函数
  命名约定: use + 功能名 (如 useCounter, useFetch)

  优势 (对比 Mixins):
  ┌──────────────────┬──────────────┬──────────────────┐
  │                  │ Mixins       │ Composables      │
  ├──────────────────┼──────────────┼──────────────────┤
  │ 命名冲突         │ ❌ 容易冲突   │ ✅ 无冲突        │
  │ 来源追踪         │ ❌ 不透明    │ ✅ 显式导入      │
  │ TypeScript       │ ❌ 差        │ ✅ 完美          │
  │ 逻辑复用粒度     │ 整个对象     │ 任意粒度         │
  │ 参数传递         │ ❌ 无        │ ✅ 灵活          │
  └──────────────────┴──────────────┴──────────────────┘
`);

// ========== 2. 常用 Composables 实现 ==========
console.log("2. 实用 Composables");

// --- useCounter ---
console.log("  2.1 useCounter");
console.log(`
  export function useCounter(initial = 0, { min = -Infinity, max = Infinity } = {}) {
    const count = ref(initial);
    const increment = (delta = 1) => {
      count.value = Math.min(count.value + delta, max);
    };
    const decrement = (delta = 1) => {
      count.value = Math.max(count.value - delta, min);
    };
    const reset = () => { count.value = initial; };
    return { count: readonly(count), increment, decrement, reset };
  }
`);

// --- useFetch ---
console.log("  2.2 useFetch");
console.log(`
  export function useFetch(url, options = {}) {
    const data = ref(null);
    const error = ref(null);
    const loading = ref(false);
    const abortController = ref(null);

    async function execute() {
      abortController.value?.abort();
      abortController.value = new AbortController();

      loading.value = true;
      error.value = null;

      try {
        const res = await fetch(unref(url), {
          ...options,
          signal: abortController.value.signal,
        });
        if (!res.ok) throw new Error(res.statusText);
        data.value = await res.json();
      } catch (e) {
        if (e.name !== 'AbortError') error.value = e;
      } finally {
        loading.value = false;
      }
    }

    // 如果 url 是 ref，自动 watch
    if (isRef(url)) {
      watch(url, execute, { immediate: true });
    } else {
      execute();
    }

    onUnmounted(() => abortController.value?.abort());

    return { data, error, loading, execute };
  }

  // 使用
  const { data: users, loading, error } = useFetch('/api/users');
  const url = ref('/api/posts');
  const { data: posts } = useFetch(url);  // url 变化自动重新请求
`);

// --- useLocalStorage ---
console.log("  2.3 useLocalStorage");
console.log(`
  export function useLocalStorage(key, defaultValue) {
    const stored = localStorage.getItem(key);
    const data = ref(stored ? JSON.parse(stored) : defaultValue);

    watch(data, (newVal) => {
      if (newVal === null || newVal === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(newVal));
      }
    }, { deep: true });

    // 监听其他 tab 的修改
    window.addEventListener('storage', (e) => {
      if (e.key === key) {
        data.value = e.newValue ? JSON.parse(e.newValue) : defaultValue;
      }
    });

    return data;
  }

  // 使用
  const theme = useLocalStorage('theme', 'dark');
  theme.value = 'light'; // 自动持久化
`);

// --- useDebounce ---
console.log("  2.4 useDebounce / useThrottle");
console.log(`
  export function useDebounce(value, delay = 300) {
    const debounced = ref(value.value);
    let timer;

    watch(value, (newVal) => {
      clearTimeout(timer);
      timer = setTimeout(() => { debounced.value = newVal; }, delay);
    });

    onUnmounted(() => clearTimeout(timer));
    return readonly(debounced);
  }

  export function useDebounceFn(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  // 使用
  const searchQuery = ref('');
  const debouncedQuery = useDebounce(searchQuery, 500);
  watch(debouncedQuery, (q) => fetchResults(q));
`);

// --- useMouse ---
console.log("  2.5 useMouse");
console.log(`
  export function useMouse() {
    const x = ref(0);
    const y = ref(0);

    function handler(e) { x.value = e.clientX; y.value = e.clientY; }

    onMounted(() => window.addEventListener('mousemove', handler));
    onUnmounted(() => window.removeEventListener('mousemove', handler));

    return { x: readonly(x), y: readonly(y) };
  }

  // 使用
  const { x, y } = useMouse();
`);

// --- useIntersectionObserver ---
console.log("  2.6 useIntersectionObserver (懒加载)");
console.log(`
  export function useIntersectionObserver(target, callback, options = {}) {
    const isIntersecting = ref(false);
    let observer;

    onMounted(() => {
      observer = new IntersectionObserver(([entry]) => {
        isIntersecting.value = entry.isIntersecting;
        callback?.(entry);
      }, { threshold: 0.1, ...options });

      if (target.value) observer.observe(target.value);
    });

    onUnmounted(() => observer?.disconnect());

    return { isIntersecting };
  }

  // 使用 (图片懒加载)
  const imgRef = ref(null);
  const { isIntersecting } = useIntersectionObserver(imgRef, (entry) => {
    if (entry.isIntersecting) loadImage();
  });
`);

// ========== 3. 组件通信全景 ==========
console.log("\n3. Vue 组件通信方式汇总");
console.log(`
  ┌──────────────────────────┬──────────────────────────────┐
  │ 方式                      │ 适用场景                      │
  ├──────────────────────────┼──────────────────────────────┤
  │ Props / Emits            │ 父子组件 (最常用)              │
  │ v-model                  │ 双向绑定 (表单组件)            │
  │ Provide / Inject         │ 跨层级 (主题/配置)             │
  │ Pinia                    │ 全局状态 (用户/设置)           │
  │ mitt 事件总线            │ 任意组件 (解耦通信)            │
  │ Template Refs            │ 父调用子方法 (命令式)          │
  │ $attrs                   │ 透传属性 (高阶组件)            │
  │ Composables              │ 逻辑复用 (非 UI 状态)         │
  └──────────────────────────┴──────────────────────────────┘
`);

// ========== 4. VueUse ==========
console.log("4. VueUse 推荐 Composables");
console.log(`
  npm install @vueuse/core

  常用功能:
  ┌──────────────────────────┬──────────────────────────────┐
  │ Composable               │ 功能                          │
  ├──────────────────────────┼──────────────────────────────┤
  │ useStorage               │ 响应式 localStorage           │
  │ useFetch                 │ 数据获取                       │
  │ useVirtualList           │ 虚拟滚动                       │
  │ useInfiniteScroll        │ 无限滚动                       │
  │ useDark                  │ 暗色模式                       │
  │ useClipboard             │ 剪贴板操作                     │
  │ useEventListener         │ 自动清理事件监听               │
  │ useDebounceFn            │ 防抖函数                       │
  │ useThrottleFn            │ 节流函数                       │
  │ onClickOutside           │ 点击外部检测                   │
  │ useMediaQuery            │ 响应式媒体查询                 │
  │ useColorMode             │ 颜色模式切换                   │
  └──────────────────────────┴──────────────────────────────┘
`);

console.log("=== Composables 完成 ===");
