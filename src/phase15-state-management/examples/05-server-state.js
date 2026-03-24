// 服务端状态管理详解
// 运行: node 05-server-state.js

console.log("=== 服务端状态管理 ===\n");

// ========== 1. 为什么需要服务端状态管理 ==========
console.log("1. 客户端状态 vs 服务端状态");
console.log(`
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

  传统方式的问题:
  • 手动管理 loading / error / data 状态
  • 缓存逻辑重复编写
  • 没有自动重新获取
  • 手动处理竞态条件
  • 无法去重重复请求
`);

// ========== 2. 手写简化版查询缓存 ==========
console.log("2. 手写查询缓存核心\n");

class QueryClient {
  constructor() {
    this.cache = new Map();
    this.subscribers = new Map();
  }

  // 获取或创建缓存条目
  getQueryData(key) {
    const entry = this.cache.get(key);
    return entry ? entry.data : undefined;
  }

  setQueryData(key, data) {
    const entry = this.cache.get(key) || {};
    this.cache.set(key, {
      ...entry,
      data,
      dataUpdatedAt: Date.now(),
    });
    this._notify(key);
  }

  // 使缓存失效
  invalidateQueries(key) {
    if (this.cache.has(key)) {
      const entry = this.cache.get(key);
      entry.isStale = true;
      console.log(`  [QueryClient] 缓存失效: ${key}`);
      // 如果有活跃订阅，自动重新获取
      if (this.subscribers.has(key)) {
        this._refetch(key);
      }
    }
  }

  // 执行查询
  async fetchQuery(key, queryFn, options = {}) {
    const { staleTime = 0, gcTime = 5 * 60 * 1000 } = options;
    const cached = this.cache.get(key);

    // 如果缓存有效且未过期
    if (cached && !cached.isStale) {
      const age = Date.now() - (cached.dataUpdatedAt || 0);
      if (age < staleTime) {
        console.log(`  [QueryClient] 缓存命中: ${key} (${age}ms old)`);
        return cached.data;
      }
    }

    // 执行查询
    console.log(`  [QueryClient] 正在获取: ${key}`);
    try {
      const data = await queryFn();
      this.cache.set(key, {
        data,
        error: null,
        isStale: false,
        dataUpdatedAt: Date.now(),
        queryFn,
        options,
      });
      this._notify(key);

      // 自动垃圾回收
      setTimeout(() => {
        if (!this.subscribers.has(key)) {
          this.cache.delete(key);
          console.log(`  [QueryClient] 垃圾回收: ${key}`);
        }
      }, gcTime);

      return data;
    } catch (error) {
      this.cache.set(key, {
        ...(cached || {}),
        error,
        isStale: true,
      });
      throw error;
    }
  }

  async _refetch(key) {
    const entry = this.cache.get(key);
    if (entry && entry.queryFn) {
      await this.fetchQuery(key, entry.queryFn, entry.options);
    }
  }

  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key).add(callback);
    return () => {
      const subs = this.subscribers.get(key);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) this.subscribers.delete(key);
      }
    };
  }

  _notify(key) {
    const subs = this.subscribers.get(key);
    if (subs) {
      const entry = this.cache.get(key);
      subs.forEach((fn) => fn(entry));
    }
  }
}

// 测试查询缓存
const queryClient = new QueryClient();

// 模拟 API
const fakeApi = {
  getUsers: async () => {
    await new Promise((r) => setTimeout(r, 50));
    return [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ];
  },
  getPosts: async () => {
    await new Promise((r) => setTimeout(r, 30));
    return [
      { id: 1, title: "学习 React Query" },
      { id: 2, title: "Zustand vs Redux" },
    ];
  },
};

async function testQueryClient() {
  // 首次查询
  const users = await queryClient.fetchQuery("users", fakeApi.getUsers, {
    staleTime: 60000,
  });
  console.log(`  users:`, users.map((u) => u.name).join(", "));

  // 第二次查询（命中缓存）
  const cachedUsers = await queryClient.fetchQuery("users", fakeApi.getUsers, {
    staleTime: 60000,
  });

  // 使缓存失效并重新获取
  queryClient.subscribe("users", (entry) => {
    console.log(`  [订阅] users 更新:`, entry.data?.length, "条");
  });
  queryClient.invalidateQueries("users");
}

testQueryClient();

// ========== 3. TanStack Query (React) ==========
setTimeout(() => {
  console.log("\n3. TanStack Query 核心用法");
  console.log(`
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

  // === 基本查询 ===
  function UserList() {
    const { data, isLoading, error, refetch } = useQuery({
      queryKey: ['users'],
      queryFn: () => fetch('/api/users').then(r => r.json()),
      staleTime: 5 * 60 * 1000,     // 5 分钟内视为新鲜
      gcTime: 30 * 60 * 1000,       // 30 分钟后垃圾回收
      retry: 3,                      // 失败重试
      refetchOnWindowFocus: true,    // 窗口聚焦时刷新
    });
    if (isLoading) return <div>Loading...</div>;
    return <ul>{data.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
  }

  // === 带参数查询 ===
  function UserDetail({ userId }) {
    const { data } = useQuery({
      queryKey: ['user', userId],     // 参数变化自动重新查询
      queryFn: () => fetch('/api/users/' + userId).then(r => r.json()),
      enabled: !!userId,              // 条件查询
    });
  }

  // === 变更 + 缓存失效 ===
  function AddUser() {
    const queryClient = useQueryClient();
    const mutation = useMutation({
      mutationFn: (newUser) =>
        fetch('/api/users', { method: 'POST', body: JSON.stringify(newUser) }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
      },
    });
    return <button onClick={() => mutation.mutate({ name: 'New' })}>添加</button>;
  }

  // === 乐观更新 ===
  const mutation = useMutation({
    mutationFn: updateTodo,
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previous = queryClient.getQueryData(['todos']);
      queryClient.setQueryData(['todos'], old =>
        old.map(t => t.id === newTodo.id ? newTodo : t)
      );
      return { previous };
    },
    onError: (err, newTodo, ctx) => {
      queryClient.setQueryData(['todos'], ctx.previous);  // 回滚
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
`);

  // ========== 4. SWR ==========
  console.log("4. SWR (stale-while-revalidate)");
  console.log(`
  import useSWR from 'swr';

  const fetcher = url => fetch(url).then(r => r.json());

  function Profile() {
    const { data, error, isLoading, mutate } = useSWR('/api/user', fetcher, {
      revalidateOnFocus: true,        // 窗口聚焦
      revalidateOnReconnect: true,    // 网络恢复
      dedupingInterval: 2000,         // 去重间隔
      refreshInterval: 30000,         // 定时刷新
    });

    return (
      <div>
        <p>Hello, {data?.name}</p>
        <button onClick={() => mutate()}>刷新</button>
      </div>
    );
  }
`);

  // ========== 5. 对比 ==========
  console.log("5. TanStack Query vs SWR");
  console.log(`
  ┌─────────────────┬──────────────────┬──────────────────┐
  │                 │ TanStack Query   │ SWR              │
  ├─────────────────┼──────────────────┼──────────────────┤
  │ 包大小          │ ~13KB            │ ~4KB             │
  │ Mutation        │ useMutation ✅   │ 手动 mutate      │
  │ 乐观更新        │ 内置             │ 手动             │
  │ 离线支持        │ ✅               │ 有限             │
  │ DevTools        │ ✅               │ ❌               │
  │ 分页/无限滚动   │ 内置             │ useSWRInfinite   │
  │ 缓存失效        │ 精细控制         │ 简单             │
  │ 学习曲线        │ 中等             │ 简单             │
  │ 推荐场景        │ 复杂应用         │ 简单数据获取     │
  └─────────────────┴──────────────────┴──────────────────┘
`);

  console.log("\n=== 服务端状态管理完成 ===");
}, 200);
