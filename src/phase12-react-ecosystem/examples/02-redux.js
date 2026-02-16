// Redux Toolkit 详解
// 运行: node 02-redux.js (模拟 Redux 核心原理)

console.log("=== Redux / Redux Toolkit 详解 ===\n");

// ========== 1. Redux 三大原则 ==========
console.log("1. Redux 核心概念");
console.log(`
  三大原则:
  1. 单一数据源 (Single source of truth) → 一个 Store
  2. State 只读 (State is read-only) → 只能通过 dispatch(action) 修改
  3. 纯函数修改 (Changes with pure functions) → Reducer 是纯函数

  数据流: View → dispatch(action) → Reducer → newState → View 更新
`);

// ========== 2. 手写简化版 Redux ==========
console.log("2. 手写 Redux 核心");

function createStore(reducer, preloadedState) {
  let state = preloadedState;
  let listeners = [];

  function getState() { return state; }

  function dispatch(action) {
    state = reducer(state, action);
    listeners.forEach(fn => fn());
    return action;
  }

  function subscribe(listener) {
    listeners.push(listener);
    return () => { listeners = listeners.filter(l => l !== listener); };
  }

  dispatch({ type: '@@INIT' }); // 初始化
  return { getState, dispatch, subscribe };
}

// combineReducers
function combineReducers(reducers) {
  return (state = {}, action) => {
    const next = {};
    let hasChanged = false;
    for (const key in reducers) {
      next[key] = reducers[key](state[key], action);
      hasChanged = hasChanged || next[key] !== state[key];
    }
    return hasChanged ? next : state;
  };
}

// 测试
function counterReducer(state = { value: 0 }, action) {
  switch (action.type) {
    case 'counter/increment': return { ...state, value: state.value + 1 };
    case 'counter/decrement': return { ...state, value: state.value - 1 };
    case 'counter/addBy': return { ...state, value: state.value + action.payload };
    default: return state;
  }
}

function todosReducer(state = [], action) {
  switch (action.type) {
    case 'todos/add': return [...state, { id: Date.now(), text: action.payload, done: false }];
    case 'todos/toggle': return state.map(t => t.id === action.payload ? { ...t, done: !t.done } : t);
    default: return state;
  }
}

const rootReducer = combineReducers({ counter: counterReducer, todos: todosReducer });
const store = createStore(rootReducer);

const unsub = store.subscribe(() => {
  const s = store.getState();
  console.log(`  State: counter=${s.counter.value}, todos=${s.todos.length}`);
});

store.dispatch({ type: 'counter/increment' });
store.dispatch({ type: 'counter/addBy', payload: 5 });
store.dispatch({ type: 'todos/add', payload: '学习 Redux' });
store.dispatch({ type: 'todos/add', payload: '学习 Zustand' });
unsub();

// ========== 3. Redux Toolkit (RTK) ==========
console.log("\n3. Redux Toolkit 用法");

console.log(`
  // store.js
  import { configureStore } from '@reduxjs/toolkit';
  import counterReducer from './counterSlice';
  import todosReducer from './todosSlice';

  export const store = configureStore({
    reducer: {
      counter: counterReducer,
      todos: todosReducer,
    },
    middleware: (getDefault) => getDefault().concat(logger),
    devTools: process.env.NODE_ENV !== 'production',
  });

  // counterSlice.js
  import { createSlice } from '@reduxjs/toolkit';

  const counterSlice = createSlice({
    name: 'counter',
    initialState: { value: 0 },
    reducers: {
      increment: (state) => { state.value += 1; },     // Immer 允许"直接修改"
      decrement: (state) => { state.value -= 1; },
      addBy: (state, action) => { state.value += action.payload; },
      reset: () => ({ value: 0 }),                       // 返回新对象也可以
    },
  });

  export const { increment, decrement, addBy, reset } = counterSlice.actions;
  export default counterSlice.reducer;

  // 组件中使用
  import { useSelector, useDispatch } from 'react-redux';
  import { increment, decrement } from './counterSlice';

  function Counter() {
    const count = useSelector(state => state.counter.value);
    const dispatch = useDispatch();
    return (
      <div>
        <span>{count}</span>
        <button onClick={() => dispatch(increment())}>+</button>
        <button onClick={() => dispatch(decrement())}>-</button>
      </div>
    );
  }
`);

// ========== 4. 异步操作 (createAsyncThunk) ==========
console.log("4. createAsyncThunk 异步操作");

console.log(`
  import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

  // 定义异步 thunk
  export const fetchPosts = createAsyncThunk(
    'posts/fetchPosts',
    async (_, { rejectWithValue }) => {
      try {
        const res = await fetch('/api/posts');
        if (!res.ok) throw new Error('Failed');
        return await res.json();
      } catch (err) {
        return rejectWithValue(err.message);
      }
    }
  );

  const postsSlice = createSlice({
    name: 'posts',
    initialState: { items: [], status: 'idle', error: null },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchPosts.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(fetchPosts.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.items = action.payload;
        })
        .addCase(fetchPosts.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
        });
    },
  });

  // 组件中
  function PostList() {
    const dispatch = useDispatch();
    const { items, status, error } = useSelector(s => s.posts);

    useEffect(() => { dispatch(fetchPosts()); }, [dispatch]);

    if (status === 'loading') return <Spinner />;
    if (status === 'failed') return <Error message={error} />;
    return <ul>{items.map(p => <li key={p.id}>{p.title}</li>)}</ul>;
  }
`);

// ========== 5. RTK Query ==========
console.log("5. RTK Query (数据获取)");

console.log(`
  import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

  export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
    tagTypes: ['Post'],
    endpoints: (builder) => ({
      // GET 请求
      getPosts: builder.query({
        query: () => '/posts',
        providesTags: ['Post'],
      }),
      getPost: builder.query({
        query: (id) => '/posts/' + id,
        providesTags: (result, error, id) => [{ type: 'Post', id }],
      }),
      // POST 请求
      addPost: builder.mutation({
        query: (body) => ({ url: '/posts', method: 'POST', body }),
        invalidatesTags: ['Post'], // 自动刷新列表
      }),
    }),
  });

  export const { useGetPostsQuery, useGetPostQuery, useAddPostMutation } = api;

  // 组件中
  function PostList() {
    const { data: posts, isLoading, error } = useGetPostsQuery();
    const [addPost] = useAddPostMutation();

    if (isLoading) return <Spinner />;
    return (
      <div>
        <button onClick={() => addPost({ title: 'New Post' })}>添加</button>
        <ul>{posts?.map(p => <li key={p.id}>{p.title}</li>)}</ul>
      </div>
    );
  }
`);

// ========== 6. 状态管理方案对比 ==========
console.log("6. 状态管理方案对比");
console.log(`
  ┌──────────────┬──────────┬──────────┬──────────┬──────────┐
  │              │ Context  │ Redux TK │ Zustand  │ Jotai    │
  ├──────────────┼──────────┼──────────┼──────────┼──────────┤
  │ 学习曲线     │ 低        │ 中       │ 低       │ 低       │
  │ 包大小       │ 0 (内置)  │ 较大     │ ~1KB     │ ~2KB     │
  │ 样板代码     │ 少        │ 中       │ 极少     │ 极少     │
  │ 异步支持     │ 手动      │ thunk    │ 原生     │ 原生     │
  │ DevTools     │ ❌        │ ✅       │ ✅       │ ✅       │
  │ 重渲染优化   │ 差        │ 好       │ 好       │ 好       │
  │ 适用场景     │ 小型/主题 │ 大型应用 │ 中大型   │ 原子状态 │
  └──────────────┴──────────┴──────────┴──────────┴──────────┘

  推荐: 小项目用 Context/Zustand，大项目用 Redux TK / Zustand
`);

console.log("=== Redux 详解完成 ===");
