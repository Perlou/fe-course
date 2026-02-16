// Nuxt 3 详解 // 本文件为参考代码，需在 Nuxt 项目中使用 // 运行: node
04-nuxt.vue (查看概念讲解) console.log("=== Nuxt 3 详解 ===\n"); // ==========
1. 项目创建与结构 ========== console.log("1. 项目创建与目录结构"); console.log(`
npx nuxi init my-nuxt-app cd my-nuxt-app && npm install 目录约定 (自动化的核心):
┌──────────────────┬──────────────────────────────────┐ │ 目录 │ 功能 │
├──────────────────┼──────────────────────────────────┤ │ pages/ │ 文件路由
(自动生成路由) │ │ components/ │ 自动导入组件 (无需 import) │ │ composables/ │
自动导入 composables │ │ layouts/ │ 页面布局模板 │ │ middleware/ │ 路由中间件 │
│ plugins/ │ 应用插件 │ │ server/ │ 服务端 API (Nitro) │ │ server/api/ │ API
路由 │ │ public/ │ 静态资源 │ │ assets/ │ 需构建的资源 (CSS/图片) │ │ utils/ │
工具函数 (自动导入) │ └──────────────────┴──────────────────────────────────┘
`); // ========== 2. 文件路由 ========== console.log("2. 文件路由系统");
console.log(` pages/ 目录自动生成路由: pages/ ├── index.vue → / ├── about.vue →
/about ├── blog/ │ ├── index.vue → /blog │ └── [slug].vue → /blog/:slug
(动态参数) ├── user/ │ └── [id]/ │ ├── index.vue → /user/:id │ └── posts.vue →
/user/:id/posts └── [...slug].vue → /* (通配符，404 页面) //
pages/blog/[slug].vue
<script setup>
const route = useRoute();
const slug = route.params.slug;
</script>

<template>
  <h1>文章: {{ slug }}</h1>
</template>
`); // ========== 3. 数据获取 ========== console.log("3. 数据获取 (四种方式)");
console.log(` // 1. useFetch — 推荐，自动缓存 + 去重 const { data, pending,
error, refresh } = await useFetch('/api/posts', { query: { page: 1 }, pick:
['id', 'title'], // 只返回部分字段 (减少传输) transform: (data) => data.items,
// 转换数据 watch: [page], // 监听变化自动刷新 }); // 2. useAsyncData —
自定义数据源 const { data } = await useAsyncData('posts', () => { return
$fetch('/api/posts'); }); // 3. useLazyFetch — 不阻塞页面渲染 const { data,
pending } = useLazyFetch('/api/posts'); // 页面立即显示，数据加载中显示 loading
// 4. $fetch — 直接请求 (不缓存) const data = await $fetch('/api/posts'); // SSR
注意: useFetch/useAsyncData 自动处理服务端到客户端的数据传递 //
避免客户端重复请求! `); // ========== 4. 服务端 API (Nitro) ==========
console.log("4. Server API (Nitro)"); console.log(` // server/api/posts.get.ts —
GET /api/posts export default defineEventHandler(async (event) => { const query
= getQuery(event); // 查询参数 const page = parseInt(query.page) || 1; const
posts = await db.post.findMany({ skip: (page - 1) * 10, take: 10, }); return {
posts, total: await db.post.count() }; }); // server/api/posts.post.ts — POST
/api/posts export default defineEventHandler(async (event) => { const body =
await readBody(event); const post = await db.post.create({ data: body }); return
post; }); // server/api/posts/[id].get.ts — GET /api/posts/:id export default
defineEventHandler(async (event) => { const id = getRouterParam(event, 'id');
return await db.post.findUnique({ where: { id } }); }); //
server/api/posts/[id].delete.ts — DELETE /api/posts/:id export default
defineEventHandler(async (event) => { const id = getRouterParam(event, 'id');
await db.post.delete({ where: { id } }); return { success: true }; }); // API
文件命名约定: // xxx.get.ts → GET // xxx.post.ts → POST // xxx.put.ts → PUT //
xxx.delete.ts → DELETE // xxx.ts → 所有方法 `); // ========== 5. 中间件
========== console.log("5. 路由中间件"); console.log(` // middleware/auth.ts
(命名中间件) export default defineNuxtRouteMiddleware((to, from) => { const {
loggedIn } = useUserSession(); if (!loggedIn.value && to.path !== '/login') {
return navigateTo('/login'); } }); // middleware/log.global.ts (全局中间件,
.global 后缀) export default defineNuxtRouteMiddleware((to) => {
console.log('访问:', to.path); }); // 页面中使用
<script setup>
definePageMeta({
  middleware: "auth", // 单个
  middleware: ["auth", "admin"], // 多个
});
</script>
`); // ========== 6. 布局系统 ========== console.log("6. 布局系统");
console.log(` // layouts/default.vue (默认布局)
<template>
  <div>
    <AppHeader />
    <main class="container">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

// layouts/admin.vue (管理后台布局)
<template>
  <div class="admin-layout">
    <AdminSidebar />
    <div class="admin-content">
      <AdminHeader />
      <slot />
    </div>
  </div>
</template>

// 页面中指定布局
<script setup>
definePageMeta({ layout: "admin" });
</script>

// 动态切换布局 const layout = ref('default'); setPageLayout(layout.value); `);
// ========== 7. SEO 与 Head ========== console.log("7. SEO 与 Head 管理");
console.log(` // nuxt.config.ts (全局默认) export default defineNuxtConfig({
app: { head: { title: 'My App', meta: [ { name: 'description', content: 'My
amazing app' }, { property: 'og:title', content: 'My App' }, ], link: [ { rel:
'icon', href: '/favicon.ico' }, ], }, }, }); // 页面级 SEO
<script setup>
useHead({
  title: "文章详情",
  meta: [{ name: "description", content: post.value?.excerpt }],
});

// 或使用 useSeoMeta (更简洁)
useSeoMeta({
  title: () => post.value?.title,
  description: () => post.value?.excerpt,
  ogImage: () => post.value?.cover,
  twitterCard: "summary_large_image",
});
</script>
`); // ========== 8. 渲染模式 ========== console.log("8. 渲染模式配置");
console.log(` // nuxt.config.ts export default defineNuxtConfig({ // 全局默认
ssr: true, // SSR 模式 (默认) // 按路由配置不同渲染模式 routeRules: { '/': {
prerender: true }, // SSG (构建时生成) '/blog/**': { isr: 3600 }, // ISR
(每小时重新生成) '/admin/**': { ssr: false }, // SPA (纯客户端渲染) '/api/**': {
cors: true, cache: { maxAge: 60 } }, }, }); 渲染模式对比:
┌──────┬────────────────────────────────────┐ │ SSR │ 每次请求在服务器渲染，SEO
好 │ │ SSG │ 构建时生成静态 HTML，性能最好 │ │ ISR │ SSG +
定时更新，平衡性能与新鲜度 │ │ SPA │ 纯客户端渲染，无需服务器 │
└──────┴────────────────────────────────────┘ `); console.log("=== Nuxt 3 完成
===");
