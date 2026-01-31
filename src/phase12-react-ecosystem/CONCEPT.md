# React 生态深入解析

## 📌 一、React Router

### 1. 基本配置

```jsx
import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <NavLink
          to="/about"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          About
        </NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/user/:id" element={<User />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 2. 嵌套路由

```jsx
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="about" element={<About />} />
    <Route path="dashboard" element={<Dashboard />}>
      <Route path="stats" element={<Stats />} />
      <Route path="settings" element={<Settings />} />
    </Route>
  </Route>
</Routes>;

// Layout.jsx
function Layout() {
  return (
    <div>
      <nav>...</nav>
      <main>
        <Outlet /> {/* 子路由渲染位置 */}
      </main>
    </div>
  );
}
```

### 3. 路由 Hooks

```jsx
import {
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";

function User() {
  // 获取路由参数
  const { id } = useParams();

  // 编程式导航
  const navigate = useNavigate();
  const goHome = () => navigate("/");
  const goBack = () => navigate(-1);
  const replaceUrl = () => navigate("/new", { replace: true });

  // 获取当前位置
  const location = useLocation();
  console.log(location.pathname, location.search, location.state);

  // 查询参数
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q");

  return <div>User: {id}</div>;
}
```

### 4. 路由守卫

```jsx
// 认证守卫
function RequireAuth({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// 使用
<Route
  path="/dashboard"
  element={
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  }
/>;
```

---

## 📌 二、状态管理

### 1. Context API

```jsx
// 创建 Context
const AuthContext = createContext(null);

// Provider
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (credentials) => {
    const user = await api.login(credentials);
    setUser(user);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 使用
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

function Profile() {
  const { user, logout } = useAuth();
  return <button onClick={logout}>Logout {user.name}</button>;
}
```

### 2. Redux Toolkit

```javascript
// store.js
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./counterSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

// counterSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchUser = createAsyncThunk("user/fetch", async (userId) => {
  const response = await api.fetchUser(userId);
  return response.data;
});

const counterSlice = createSlice({
  name: "counter",
  initialState: { value: 0, status: "idle" },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      });
  },
});

export const { increment, decrement } = counterSlice.actions;
export default counterSlice.reducer;

// 组件中使用
import { useSelector, useDispatch } from "react-redux";

function Counter() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return <button onClick={() => dispatch(increment())}>Count: {count}</button>;
}
```

### 3. Zustand（推荐）

```javascript
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

const useStore = create(
  devtools(
    persist(
      (set, get) => ({
        // 状态
        count: 0,
        user: null,

        // 同步 action
        increment: () => set((state) => ({ count: state.count + 1 })),
        decrement: () => set((state) => ({ count: state.count - 1 })),

        // 异步 action
        fetchUser: async (id) => {
          const user = await api.fetchUser(id);
          set({ user });
        },

        // 获取状态
        getDoubleCount: () => get().count * 2,
      }),
      { name: "my-store" } // localStorage key
    )
  )
);

// 使用
function Counter() {
  const count = useStore((state) => state.count);
  const increment = useStore((state) => state.increment);

  return <button onClick={increment}>{count}</button>;
}

// 选择多个状态（浅比较）
const { count, user } = useStore(
  (state) => ({ count: state.count, user: state.user }),
  shallow
);
```

---

## 📌 三、SSR 与 Next.js

### 1. 渲染模式对比

```
┌─────────────────┬────────────────────────────────────────────┐
│     模式         │                  说明                      │
├─────────────────┼────────────────────────────────────────────┤
│ CSR             │ 客户端渲染，JS 下载后在浏览器渲染           │
│ (Client-Side)   │ SEO 差，首屏慢，交互快                      │
├─────────────────┼────────────────────────────────────────────┤
│ SSR             │ 服务端渲染，每次请求在服务器生成 HTML       │
│ (Server-Side)   │ SEO 好，首屏快，服务器压力大                │
├─────────────────┼────────────────────────────────────────────┤
│ SSG             │ 静态生成，构建时生成 HTML                   │
│ (Static)        │ 性能最好，适合内容不常变化的页面            │
├─────────────────┼────────────────────────────────────────────┤
│ ISR             │ 增量静态再生，SSG + 定时更新                │
│ (Incremental)   │ 平衡性能和数据新鲜度                        │
└─────────────────┴────────────────────────────────────────────┘
```

### 2. Next.js App Router

```
app/
├── layout.jsx          // 根布局
├── page.jsx            // 首页 (/)
├── globals.css
├── about/
│   └── page.jsx        // /about
├── blog/
│   ├── page.jsx        // /blog
│   └── [slug]/
│       └── page.jsx    // /blog/:slug
└── api/
    └── users/
        └── route.js    // API 路由
```

### 3. 服务端组件 vs 客户端组件

```jsx
// 服务端组件（默认）
// 可以直接访问数据库，不会发送 JS 到客户端
async function BlogList() {
  const posts = await db.posts.findMany();
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}

// 客户端组件
("use client"); // 必须声明

import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// 混合使用
// 服务端组件可以导入客户端组件
// 客户端组件不能导入服务端组件（可以通过 children 传递）
```

### 4. 数据获取

```jsx
// 服务端组件直接获取数据
async function Page() {
  const data = await fetch("https://api.example.com/data", {
    cache: "force-cache", // SSG：静态缓存
    // cache: 'no-store',     // SSR：不缓存
    // next: { revalidate: 60 } // ISR：60秒后重新验证
  });

  return <div>{data.title}</div>;
}

// generateStaticParams (SSG 动态路由)
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

// 动态路由页面
async function BlogPost({ params }) {
  const post = await getPost(params.slug);
  return <article>{post.content}</article>;
}
```

---

## 📌 四、性能优化

### 1. React.memo

```jsx
// 避免不必要的重渲染
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  return <div>{/* 复杂渲染 */}</div>;
});

// 自定义比较函数
const MyComponent = React.memo(
  function MyComponent({ data }) {
    return <div>{data.name}</div>;
  },
  (prevProps, nextProps) => {
    return prevProps.data.id === nextProps.data.id;
  }
);
```

### 2. useMemo & useCallback

```jsx
function App({ items, filter }) {
  // 缓存计算结果
  const filteredItems = useMemo(() => {
    return items.filter((item) => item.includes(filter));
  }, [items, filter]);

  // 缓存函数引用
  const handleClick = useCallback((id) => {
    console.log(id);
  }, []);

  return <List items={filteredItems} onClick={handleClick} />;
}
```

### 3. 代码分割

```jsx
import { lazy, Suspense } from "react";

// 懒加载组件
const HeavyComponent = lazy(() => import("./HeavyComponent"));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}

// 路由级别代码分割
const Dashboard = lazy(() => import("./pages/Dashboard"));

<Route
  path="/dashboard"
  element={
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  }
/>;
```

### 4. 虚拟列表

```jsx
import { FixedSizeList } from "react-window";

function VirtualList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>{items[index].name}</div>
  );

  return (
    <FixedSizeList
      height={400}
      width={300}
      itemCount={items.length}
      itemSize={35}
    >
      {Row}
    </FixedSizeList>
  );
}
```

### 5. 性能监控

```jsx
import { Profiler } from "react";

function onRenderCallback(
  id, // Profiler 的 id
  phase, // "mount" | "update"
  actualDuration, // 本次渲染耗时
  baseDuration, // 未优化的渲染耗时
  startTime, // 开始时间
  commitTime // 提交时间
) {
  console.log({ id, phase, actualDuration });
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <MyComponent />
    </Profiler>
  );
}
```

---

## 📚 推荐学习资源

| 资源          | 链接                      |
| ------------- | ------------------------- |
| React Router  | reactrouter.com           |
| Redux Toolkit | redux-toolkit.js.org      |
| Zustand       | github.com/pmndrs/zustand |
| Next.js       | nextjs.org                |

---
