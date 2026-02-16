// React Hooks 原理详解
// 运行: node 04-hooks.js

console.log("=== React Hooks 原理 ===\n");

// ========== 1. Hooks 存储机制 ==========
console.log("1. Hooks 链表存储");
console.log(`
  Fiber.memoizedState → Hook1 → Hook2 → Hook3 → null

  每个 Hook: {
    memoizedState,   // 当前值
    queue: { pending }, // 更新队列 (环形链表)
    next             // 下一个 Hook
  }
`);

// ========== 2. 模拟 Hooks 系统 ==========
let currentFiber = null;
let wipHook = null;
let isMount = true;
let pendingEffects = [];

function mountHook() {
  const hook = { memoizedState: null, queue: { pending: null }, next: null };
  if (!wipHook) { currentFiber.memoizedState = hook; }
  else { wipHook.next = hook; }
  wipHook = hook;
  return hook;
}

function updateHook() {
  const hook = wipHook;
  wipHook = wipHook.next;
  return hook;
}

function areEqual(a, b) {
  if (!a || !b) return false;
  return a.every((v, i) => Object.is(v, b[i]));
}

// ========== 3. useState ==========
console.log("2. useState 实现");

function mountState(init) {
  const hook = mountHook();
  hook.memoizedState = typeof init === "function" ? init() : init;
  return [hook.memoizedState, dispatchAction.bind(null, hook)];
}

function updateState() {
  const hook = updateHook();
  let state = hook.memoizedState;
  if (hook.queue.pending) {
    let update = hook.queue.pending.next;
    const first = update;
    do {
      state = typeof update.action === "function" ? update.action(state) : update.action;
      update = update.next;
    } while (update !== first);
    hook.queue.pending = null;
  }
  hook.memoizedState = state;
  return [state, dispatchAction.bind(null, hook)];
}

function dispatchAction(hook, action) {
  const update = { action, next: null };
  if (!hook.queue.pending) { update.next = update; }
  else { update.next = hook.queue.pending.next; hook.queue.pending.next = update; }
  hook.queue.pending = update;
}

// ========== 4. useEffect ==========
console.log("3. useEffect 实现");

function mountEffect(cb, deps) {
  const hook = mountHook();
  hook.memoizedState = { cb, deps, destroy: undefined };
  pendingEffects.push(hook.memoizedState);
}

function updateEffect(cb, deps) {
  const hook = updateHook();
  const prev = hook.memoizedState;
  if (deps && areEqual(deps, prev.deps)) {
    hook.memoizedState = { ...prev, cb, deps };
    return;
  }
  hook.memoizedState = { cb, deps, destroy: prev.destroy };
  pendingEffects.push(hook.memoizedState);
}

// ========== 5. useRef / useMemo / useCallback ==========
function mountRef(init) { const h = mountHook(); h.memoizedState = { current: init }; return h.memoizedState; }
function updateRef() { return updateHook().memoizedState; }

function mountMemo(fn, deps) { const h = mountHook(); const v = fn(); h.memoizedState = [v, deps]; return v; }
function updateMemo(fn, deps) {
  const h = updateHook();
  const [prev, prevDeps] = h.memoizedState;
  if (areEqual(deps, prevDeps)) return prev;
  const v = fn(); h.memoizedState = [v, deps]; return v;
}

function mountCallback(cb, deps) { const h = mountHook(); h.memoizedState = [cb, deps]; return cb; }
function updateCallback(cb, deps) {
  const h = updateHook();
  const [prev, prevDeps] = h.memoizedState;
  if (areEqual(deps, prevDeps)) return prev;
  h.memoizedState = [cb, deps]; return cb;
}

// ========== 6. 模拟渲染 ==========
console.log("\n4. 模拟组件渲染");

function Counter() {
  const useState_fn = isMount ? mountState : updateState;
  const useEffect_fn = isMount ? mountEffect : updateEffect;
  const useMemo_fn = isMount ? mountMemo : updateMemo;

  const [count, setCount] = useState_fn(0);
  const [name, setName] = useState_fn("React");
  const double = useMemo_fn(() => { console.log("    📐 计算 double"); return count * 2; }, [count]);

  useEffect_fn(() => {
    console.log(`    ✨ Effect: count=${count}`);
    return () => console.log(`    🧹 Cleanup: count=${count}`);
  }, [count]);

  return { count, name, double, setCount, setName };
}

function renderComponent(Comp) {
  currentFiber = { memoizedState: isMount ? null : currentFiber.memoizedState };
  wipHook = isMount ? null : currentFiber.memoizedState;
  pendingEffects = [];

  console.log(`\n  --- ${isMount ? "Mount" : "Update"} ---`);
  const result = Comp();
  console.log(`  结果: count=${result.count}, name="${result.name}", double=${result.double}`);

  // flush effects
  pendingEffects.forEach(e => { if (e.destroy) e.destroy(); });
  pendingEffects.forEach(e => { e.destroy = typeof (e.destroy = e.cb()) === "function" ? e.destroy : undefined; });
  pendingEffects = [];

  isMount = false;
  return result;
}

const r1 = renderComponent(Counter);
console.log("\n  >>> setCount(c => c + 1)");
r1.setCount(c => c + 1);
const r2 = renderComponent(Counter);
console.log("\n  >>> setName('Hooks')");
r2.setName("Hooks");
renderComponent(Counter);

// ========== 7. Hooks 规则 ==========
console.log("\n\n5. Hooks 规则");
console.log(`
  规则一: 只在顶层调用 (不能在 if/for 中)
  原因: Hooks 通过链表顺序匹配，条件跳过会错位

  mount:  Hook1(count) → Hook2(name) → Hook3(effect)
  update: Hook1(???)   → Hook2(???)  → Hook3(???)

  规则二: 只在 React 函数组件/自定义 Hook 中调用
  原因: 依赖 Fiber 和调度器上下文
`);

// ========== 8. Hooks 对比 ==========
console.log("6. Hooks 存储对比");
console.log(`
  ┌────────────────┬──────────────────────────────────┐
  │ Hook           │ memoizedState 存储内容             │
  ├────────────────┼──────────────────────────────────┤
  │ useState       │ state 值                         │
  │ useEffect      │ { callback, deps, destroy }      │
  │ useRef         │ { current: value }               │
  │ useMemo        │ [computedValue, deps]            │
  │ useCallback    │ [callback, deps]                 │
  └────────────────┴──────────────────────────────────┘

  useEffect vs useLayoutEffect:
  useEffect       → 异步 (DOM 绘制后), 不阻塞渲染
  useLayoutEffect → 同步 (DOM 变更后、绘制前), 适合测量 DOM
`);

console.log("\n=== Hooks 原理完成 ===");
