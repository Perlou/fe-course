// Vue Router 4 详解
// 本文件为参考代码，需在 Vue 3 项目中使用
// 运行: node 01-router.vue (查看概念讲解)

console.log("=== Vue Router 4 详解 ===\n");

// ========== 1. 路由配置 ==========
console.log("1. 基本路由配置");
console.log(`
  import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';

  const routes = [
    { path: '/', name: 'Home', component: () => import('./views/Home.vue') },
    { path: '/about', name: 'About', component: () => import('./views/About.vue') },
    { path: '/user/:id', name: 'User', component: () => import('./views/User.vue'), props: true },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
  ];

  const router = createRouter({
    history: createWebHistory(),     // HTML5 History 模式
    // history: createWebHashHistory(), // Hash 模式
    routes,
    scrollBehavior(to, from, savedPosition) {
      return savedPosition || { top: 0 };
    },
  });

  // main.js
  import { createApp } from 'vue';
  const app = createApp(App);
  app.use(router);
  app.mount('#app');
`);

// ========== 2. 嵌套路由 ==========
console.log("2. 嵌套路由");
console.log(`
  const routes = [
    {
      path: '/dashboard',
      component: DashboardLayout,
      redirect: '/dashboard/overview',   // 默认重定向
      children: [
        { path: 'overview', component: Overview },      // /dashboard/overview
        { path: 'stats', component: Stats },             // /dashboard/stats
        { path: 'settings', component: Settings },       // /dashboard/settings
        {
          path: 'user/:id',
          component: UserDetail,
          children: [
            { path: '', component: UserProfile },        // /dashboard/user/:id
            { path: 'posts', component: UserPosts },     // /dashboard/user/:id/posts
          ],
        },
      ],
    },
  ];

  // DashboardLayout.vue
  <template>
    <div class="dashboard">
      <aside><SideNav /></aside>
      <main>
        <router-view />  <!-- 子路由出口 -->
      </main>
    </div>
  </template>
`);

// ========== 3. 路由守卫 ==========
console.log("3. 路由守卫 (三个层级)");
console.log(`
  // 一. 全局守卫
  router.beforeEach(async (to, from) => {
    const auth = useAuthStore();

    // 设置页面标题
    document.title = to.meta.title || 'My App';

    // 需要认证的路由
    if (to.meta.requiresAuth && !auth.isLoggedIn) {
      return { name: 'Login', query: { redirect: to.fullPath } };
    }

    // 角色权限
    if (to.meta.roles && !to.meta.roles.includes(auth.user?.role)) {
      return { name: 'Forbidden' };
    }
  });

  router.afterEach((to, from, failure) => {
    if (!failure) sendAnalytics(to.fullPath);  // 页面访问统计
  });

  // 二. 路由独享守卫
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from) => {
      if (!isAdmin()) return '/';
    },
  }

  // 三. 组件内守卫 (Composition API)
  import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';

  onBeforeRouteLeave((to, from) => {
    if (hasUnsavedChanges.value) {
      return confirm('有未保存的修改，确定离开？');
    }
  });

  onBeforeRouteUpdate((to, from) => {
    // 路由参数变化 (如 /user/1 → /user/2)
    loadUser(to.params.id);
  });
`);

// ========== 4. Composition API ==========
console.log("4. Composition API");
console.log(`
  import { useRouter, useRoute } from 'vue-router';

  // setup() 或 <script setup> 中
  const router = useRouter();
  const route = useRoute();

  // 获取参数
  const userId = computed(() => route.params.id);
  const page = computed(() => route.query.page || 1);

  // 编程式导航
  router.push('/');
  router.push({ name: 'User', params: { id: 123 } });
  router.push({ path: '/search', query: { q: 'vue' } });
  router.replace('/new-url');
  router.go(-1);         // 后退
  router.back();          // 后退
  router.forward();       // 前进

  // 监听路由变化
  watch(() => route.params.id, (newId) => {
    fetchData(newId);
  });
`);

// ========== 5. 路由元信息与过渡 ==========
console.log("5. 路由元信息与过渡动画");
console.log(`
  // 路由元信息 meta
  const routes = [
    {
      path: '/admin',
      component: Admin,
      meta: {
        requiresAuth: true,
        roles: ['admin'],
        title: '管理后台',
        transition: 'slide-left',
      },
    },
  ];

  // 过渡动画
  <template>
    <router-view v-slot="{ Component, route }">
      <transition :name="route.meta.transition || 'fade'" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </template>

  <style>
  .fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
  .fade-enter-from, .fade-leave-to { opacity: 0; }

  .slide-left-enter-active, .slide-left-leave-active {
    transition: transform 0.3s;
  }
  .slide-left-enter-from { transform: translateX(100%); }
  .slide-left-leave-to { transform: translateX(-100%); }
  </style>
`);

// ========== 6. 动态路由 ==========
console.log("6. 动态添加/删除路由");
console.log(`
  // 动态添加路由 (权限系统)
  async function setupDynamicRoutes(userRole) {
    const modules = await fetchRoutesByRole(userRole);

    modules.forEach(module => {
      router.addRoute({
        path: module.path,
        name: module.name,
        component: () => import('./views/' + module.component + '.vue'),
        meta: module.meta,
      });
    });
  }

  // 删除路由
  const removeRoute = router.addRoute({ ... });
  removeRoute(); // 调用返回的函数删除

  // 检查路由是否存在
  router.hasRoute('RouteName');

  // 获取所有路由
  router.getRoutes();
`);

console.log("=== Vue Router 完成 ===");
