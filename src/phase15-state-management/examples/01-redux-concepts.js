// Redux 核心原理详解
// 运行: node 01-redux-concepts.js

console.log("=== Redux 核心原理 ===\n");

// ========== 1. 三大原则 ==========
console.log("1. Redux 三大原则");
console.log(`
  ┌──────────────────────────────────────────────────────────────┐
  │                    Redux 三大原则                              │
  ├──────────────────────────────────────────────────────────────┤
  │                                                              │
  │  1. 单一数据源 (Single Source of Truth)                      │
  │     整个应用状态存储在单一 store 对象中                       │
  │                                                              │
  │  2. 状态只读 (State is Read-Only)                            │
  │     只能通过 dispatch(action) 来触发状态变化                  │
  │                                                              │
  │  3. 纯函数修改 (Changes with Pure Functions)                 │
  │     Reducer 是纯函数: (prevState, action) => newState        │
  │                                                              │
  └──────────────────────────────────────────────────────────────┘
`);

// ========== 2. 手写 createStore ==========
console.log("2. 手写 createStore\n");

function createStore(reducer, initialState, enhancer) {
  // 支持中间件增强
  if (typeof enhancer === "function") {
    return enhancer(createStore)(reducer, initialState);
  }

  let state = initialState;
  let listeners = [];
  let isDispatching = false;

  function getState() {
    if (isDispatching) {
      throw new Error("不能在 reducer 执行期间调用 getState");
    }
    return state;
  }

  function dispatch(action) {
    // action 必须是普通对象
    if (typeof action !== "object" || action === null) {
      throw new Error("Action 必须是普通对象");
    }
    if (typeof action.type === "undefined") {
      throw new Error("Action 必须有 type 属性");
    }

    if (isDispatching) {
      throw new Error("Reducer 不能 dispatch");
    }

    try {
      isDispatching = true;
      state = reducer(state, action);
    } finally {
      isDispatching = false;
    }

    // 通知所有监听者
    listeners.forEach((listener) => listener());

    return action;
  }

  function subscribe(listener) {
    if (typeof listener !== "function") {
      throw new Error("listener 必须是函数");
    }

    let isSubscribed = true;
    listeners.push(listener);

    // 返回取消订阅函数
    return function unsubscribe() {
      if (!isSubscribed) return;
      isSubscribed = false;
      listeners = listeners.filter((l) => l !== listener);
    };
  }

  // 初始化状态
  dispatch({ type: "@@INIT" });

  return { getState, dispatch, subscribe };
}

// 测试 createStore
const counterReducer = (state = { count: 0 }, action) => {
  switch (action.type) {
    case "INCREMENT":
      return { ...state, count: state.count + 1 };
    case "DECREMENT":
      return { ...state, count: state.count - 1 };
    case "ADD":
      return { ...state, count: state.count + action.payload };
    default:
      return state;
  }
};

const store = createStore(counterReducer);

// 订阅变化
const unsubscribe = store.subscribe(() => {
  console.log("  状态变化:", store.getState());
});

store.dispatch({ type: "INCREMENT" });
store.dispatch({ type: "INCREMENT" });
store.dispatch({ type: "ADD", payload: 10 });
store.dispatch({ type: "DECREMENT" });

unsubscribe(); // 取消订阅
store.dispatch({ type: "INCREMENT" }); // 不会输出
console.log("  取消订阅后:", store.getState());

// ========== 3. combineReducers ==========
console.log("\n3. 手写 combineReducers\n");

function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers);

  return function combination(state = {}, action) {
    let hasChanged = false;
    const nextState = {};

    for (const key of reducerKeys) {
      const reducer = reducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);

      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }

    return hasChanged ? nextState : state;
  };
}

// 使用 combineReducers
const todosReducer = (state = [], action) => {
  switch (action.type) {
    case "ADD_TODO":
      return [...state, { id: Date.now(), text: action.payload, done: false }];
    case "TOGGLE_TODO":
      return state.map((todo) =>
        todo.id === action.payload ? { ...todo, done: !todo.done } : todo
      );
    default:
      return state;
  }
};

const visibilityReducer = (state = "ALL", action) => {
  switch (action.type) {
    case "SET_VISIBILITY":
      return action.payload;
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  todos: todosReducer,
  visibility: visibilityReducer,
  counter: counterReducer,
});

const appStore = createStore(rootReducer);
appStore.subscribe(() => {
  const state = appStore.getState();
  console.log("  App 状态:", JSON.stringify(state));
});

appStore.dispatch({ type: "ADD_TODO", payload: "学习 Redux" });
appStore.dispatch({ type: "INCREMENT" });
appStore.dispatch({ type: "SET_VISIBILITY", payload: "ACTIVE" });

// ========== 4. 中间件机制 ==========
console.log("\n4. 中间件机制\n");

// Logger 中间件
function loggerMiddleware(store) {
  return function (next) {
    return function (action) {
      console.log("  [Logger] dispatching:", action.type);
      const result = next(action);
      console.log("  [Logger] next state:", JSON.stringify(store.getState()));
      return result;
    };
  };
}

// Thunk 中间件: 支持 dispatch 异步函数
function thunkMiddleware(store) {
  return function (next) {
    return function (action) {
      if (typeof action === "function") {
        return action(store.dispatch, store.getState);
      }
      return next(action);
    };
  };
}

// compose 工具函数
function compose(...fns) {
  if (fns.length === 0) return (arg) => arg;
  if (fns.length === 1) return fns[0];
  return fns.reduce(
    (a, b) =>
      (...args) =>
        a(b(...args))
  );
}

// applyMiddleware
function applyMiddleware(...middlewares) {
  return function (createStore) {
    return function (reducer, initialState) {
      const store = createStore(reducer, initialState);
      let dispatch = () => {
        throw new Error("中间件构建期间不能 dispatch");
      };

      const middlewareAPI = {
        getState: store.getState,
        dispatch: (action) => dispatch(action),
      };

      const chain = middlewares.map((middleware) => middleware(middlewareAPI));
      dispatch = compose(...chain)(store.dispatch);

      return { ...store, dispatch };
    };
  };
}

// 使用中间件
const enhancedStore = createStore(
  counterReducer,
  undefined,
  applyMiddleware(loggerMiddleware, thunkMiddleware)
);

console.log("  同步 dispatch:");
enhancedStore.dispatch({ type: "INCREMENT" });

console.log("\n  异步 dispatch (thunk):");
// 异步 action creator
const asyncIncrement = (dispatch, getState) => {
  console.log("  [Thunk] 执行异步操作...");
  setTimeout(() => {
    dispatch({ type: "ADD", payload: 5 });
    console.log("  [Thunk] 异步完成, 最终状态:", getState());
  }, 100);
};
enhancedStore.dispatch(asyncIncrement);

// ========== 5. Redux 数据流 ==========
console.log("\n5. Redux 数据流");
console.log(`
  ┌─────────────────────────────────────────────────────┐
  │                 Redux 数据流                          │
  ├─────────────────────────────────────────────────────┤
  │                                                     │
  │   UI ─── dispatch(action) ──→ Middleware             │
  │    ↑                              │                  │
  │    │                              ↓                  │
  │    │                         Reducer                 │
  │    │                              │                  │
  │    │                              ↓                  │
  │    └──── re-render ←──── Store (new state)           │
  │                                                     │
  │   完整流程:                                          │
  │   1. 用户触发 action (如点击按钮)                      │
  │   2. dispatch(action) 发送 action                    │
  │   3. 中间件拦截处理 (logging, thunk 等)                │
  │   4. Reducer 计算新状态                               │
  │   5. Store 保存新状态                                 │
  │   6. UI 通过 subscribe 得到通知并重新渲染              │
  │                                                     │
  └─────────────────────────────────────────────────────┘
`);

// 等待异步操作完成
setTimeout(() => {
  console.log("\n=== Redux 核心原理完成 ===");
}, 200);
