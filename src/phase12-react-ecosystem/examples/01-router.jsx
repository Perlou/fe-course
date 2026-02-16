// React Router v6 详解
// 本文件展示 React Router 的核心用法（伪代码，需在 React 项目中运行）
// 运行: 作为参考代码，需在 React 项目中使用

console.log("=== React Router v6 详解 ===\n");

// ========== 1. 基础路由配置 ==========
console.log("1. 基础路由配置");

const basicRouterExample = `
import { BrowserRouter, Routes, Route, Link, NavLink, Outlet } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">首页</Link>
        <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>
          关于
        </NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/user/:id" element={<UserDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
`;
console.log(basicRouterExample);

// ========== 2. 嵌套路由与 Layout ==========
console.log("2. 嵌套路由与 Layout");

const nestedRoutes = `
// 路由配置
<Routes>
  <Route path="/" element={<RootLayout />}>
    <Route index element={<Home />} />           {/* / */}
    <Route path="about" element={<About />} />    {/* /about */}
    <Route path="dashboard" element={<DashLayout />}>
      <Route index element={<DashHome />} />      {/* /dashboard */}
      <Route path="stats" element={<Stats />} />  {/* /dashboard/stats */}
      <Route path="settings" element={<Settings />} /> {/* /dashboard/settings */}
    </Route>
    <Route path="*" element={<NotFound />} />
  </Route>
</Routes>

// RootLayout.jsx
function RootLayout() {
  return (
    <div>
      <Header />
      <main>
        <Outlet />  {/* 子路由在这里渲染 */}
      </main>
      <Footer />
    </div>
  );
}

// DashLayout.jsx
function DashLayout() {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="content">
        <Outlet />  {/* dashboard 子路由在这里渲染 */}
      </div>
    </div>
  );
}
`;
console.log(nestedRoutes);

// ========== 3. 路由 Hooks ==========
console.log("3. 路由 Hooks");

const routerHooks = `
import {
  useParams, useNavigate, useLocation,
  useSearchParams, useOutletContext
} from 'react-router-dom';

function UserDetail() {
  // 1. 获取路由参数 /user/:id
  const { id } = useParams();

  // 2. 编程式导航
  const navigate = useNavigate();
  navigate('/');                         // 跳转
  navigate(-1);                          // 返回
  navigate('/login', { replace: true }); // 替换历史
  navigate('/user/1', { state: { from: 'list' } }); // 传递 state

  // 3. 当前位置信息
  const location = useLocation();
  // location.pathname → '/user/123'
  // location.search   → '?tab=posts'
  // location.state    → { from: 'list' }
  // location.hash     → '#section1'

  // 4. 查询参数
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab');         // 读取
  setSearchParams({ tab: 'comments' });         // 设置
  setSearchParams(prev => {                     // 更新
    prev.set('page', '2');
    return prev;
  });

  // 5. 父路由传递的 context
  const { theme } = useOutletContext();          // 需父路由传递

  return <div>User {id}, Tab: {tab}</div>;
}
`;
console.log(routerHooks);

// ========== 4. 路由守卫 ==========
console.log("4. 路由守卫（认证/权限）");

const routeGuard = `
// 认证守卫组件
function RequireAuth({ children, roles }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}

// 使用
<Routes>
  {/* 公开路由 */}
  <Route path="/login" element={<Login />} />

  {/* 需登录 */}
  <Route path="/profile" element={
    <RequireAuth><Profile /></RequireAuth>
  } />

  {/* 需管理员权限 */}
  <Route path="/admin" element={
    <RequireAuth roles={['admin']}>
      <AdminPanel />
    </RequireAuth>
  } />
</Routes>
`;
console.log(routeGuard);

// ========== 5. 数据路由 (v6.4+) ==========
console.log("5. 数据路由 (createBrowserRouter)");

const dataRouter = `
import {
  createBrowserRouter, RouterProvider,
  useLoaderData, Form, useActionData
} from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'posts/:id',
        element: <PostDetail />,
        // Loader: 路由渲染前加载数据
        loader: async ({ params }) => {
          const res = await fetch('/api/posts/' + params.id);
          if (!res.ok) throw new Response('Not Found', { status: 404 });
          return res.json();
        },
        // Action: 处理表单提交
        action: async ({ request }) => {
          const formData = await request.formData();
          return await updatePost(formData);
        },
      },
    ],
  },
]);

// 使用 RouterProvider
function App() {
  return <RouterProvider router={router} />;
}

// 在组件中获取数据
function PostDetail() {
  const post = useLoaderData();     // loader 返回的数据
  const actionData = useActionData(); // action 返回的数据

  return (
    <div>
      <h1>{post.title}</h1>
      <Form method="post">
        <input name="title" defaultValue={post.title} />
        <button type="submit">更新</button>
      </Form>
    </div>
  );
}
`;
console.log(dataRouter);

// ========== 6. 路由原理 ==========
console.log("6. 路由实现原理");

console.log(`
  History 模式 (BrowserRouter):
  ┌──────────────────────────────────────────────────────┐
  │  基于 History API:                                    │
  │  • history.pushState()   → 添加历史记录               │
  │  • history.replaceState() → 替换当前记录              │
  │  • window.onpopstate     → 监听前进/后退              │
  │                                                      │
  │  URL: example.com/about                              │
  │  需要服务器配置 fallback 到 index.html                │
  └──────────────────────────────────────────────────────┘

  Hash 模式 (HashRouter):
  ┌──────────────────────────────────────────────────────┐
  │  基于 URL hash:                                       │
  │  • window.location.hash  → 读写 hash                 │
  │  • window.onhashchange   → 监听变化                  │
  │                                                      │
  │  URL: example.com/#/about                            │
  │  不需要服务器配置                                     │
  └──────────────────────────────────────────────────────┘
`);

console.log("=== React Router 完成 ===");
