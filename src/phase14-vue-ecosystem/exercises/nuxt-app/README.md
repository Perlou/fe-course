# Nuxt 3 全栈应用练习

## 📋 目标

使用 Nuxt 3 构建一个全栈待办事项应用，涵盖文件路由、SSR、Server API、Pinia、中间件。

---

## 🏗️ 核心功能

1. **用户认证** — 登录/注册/登出
2. **待办列表** — CRUD 操作
3. **数据持久化** — Server API + 数据库
4. **状态管理** — Pinia
5. **路由保护** — 中间件认证

---

## 📂 项目结构

```
nuxt-app/
├── nuxt.config.ts
├── app.vue
├── pages/
│   ├── index.vue            # 首页
│   ├── login.vue            # 登录页
│   └── dashboard/
│       ├── index.vue        # 待办列表
│       └── [id].vue         # 待办详情
├── components/
│   ├── TodoItem.vue
│   ├── TodoForm.vue
│   ├── AppHeader.vue
│   └── AppFooter.vue
├── composables/
│   ├── useAuth.ts           # 认证逻辑
│   └── useTodos.ts          # 待办逻辑
├── stores/
│   ├── auth.ts              # 用户状态
│   └── todos.ts             # 待办状态
├── layouts/
│   ├── default.vue
│   └── auth.vue
├── middleware/
│   └── auth.ts              # 路由守卫
├── server/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.post.ts
│   │   │   └── logout.post.ts
│   │   └── todos/
│   │       ├── index.get.ts
│   │       ├── index.post.ts
│   │       ├── [id].put.ts
│   │       └── [id].delete.ts
│   └── utils/
│       └── db.ts             # 数据库连接
└── package.json
```

---

## 🔧 实现步骤

### Step 1: 创建项目

```bash
npx nuxi init nuxt-app
cd nuxt-app
npm install pinia @pinia/nuxt
```

### Step 2: Server API

```typescript
// server/api/todos/index.get.ts
export default defineEventHandler(async () => {
  return await db.todo.findMany({ orderBy: { createdAt: "desc" } });
});

// server/api/todos/index.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return await db.todo.create({
    data: { title: body.title, completed: false },
  });
});
```

### Step 3: Pinia Store

```typescript
// stores/todos.ts
export const useTodoStore = defineStore("todos", () => {
  const todos = ref([]);
  const loading = ref(false);

  async function fetchTodos() {
    loading.value = true;
    todos.value = await $fetch("/api/todos");
    loading.value = false;
  }

  async function addTodo(title) {
    const todo = await $fetch("/api/todos", {
      method: "POST",
      body: { title },
    });
    todos.value.unshift(todo);
  }

  return { todos, loading, fetchTodos, addTodo };
});
```

### Step 4: 页面 (SSR)

```vue
<!-- pages/dashboard/index.vue -->
<script setup>
definePageMeta({ middleware: "auth", layout: "default" });

const store = useTodoStore();
await store.fetchTodos();
</script>

<template>
  <div>
    <TodoForm @submit="store.addTodo" />
    <TodoItem v-for="todo in store.todos" :key="todo.id" :todo="todo" />
  </div>
</template>
```

---

## ✅ 验收标准

1. [ ] 文件路由正常工作
2. [ ] Server API 实现 CRUD
3. [ ] Pinia 管理全局状态
4. [ ] 中间件保护 dashboard 路由
5. [ ] SSR 渲染正常 (查看源代码有内容)
6. [ ] `npm run build` 构建成功

---

## 🌟 进阶挑战

- [ ] 添加 ISR 渲染模式
- [ ] 使用 useSeoMeta 优化 SEO
- [ ] 添加暗色模式 (useColorMode)
- [ ] 集成真实数据库 (Prisma / Drizzle)
- [ ] 部署到 Vercel / Cloudflare
