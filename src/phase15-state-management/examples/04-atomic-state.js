// 原子化状态管理详解
// 运行: node 04-atomic-state.js

console.log("=== 原子化状态管理 ===\n");

// ========== 1. 原子化 vs 中心化 ==========
console.log("1. 原子化 vs 中心化");
console.log(`
  中心化 (Redux/Zustand): 所有状态在一个 Store 中
  原子化 (Jotai/Recoil):  状态分散为独立原子，按需组合

  ┌─────────────────┬──────────────────┬──────────────────┐
  │                 │    原子化         │    中心化         │
  ├─────────────────┼──────────────────┼──────────────────┤
  │ 代表            │ Jotai, Recoil    │ Redux, Zustand   │
  │ 状态结构        │ 分散的原子        │ 单一 Store       │
  │ 组件重渲染      │ 精确订阅          │ 选择器订阅       │
  │ 学习曲线        │ 简单             │ 中等             │
  │ DevTools        │ 有限             │ 完善             │
  │ 适合场景        │ 细粒度状态        │ 复杂业务逻辑     │
  └─────────────────┴──────────────────┴──────────────────┘
`);

// ========== 2. 手写原子化核心 ==========
console.log("2. 手写原子化状态管理核心\n");

const atomRegistry = new Map();
let atomId = 0;

function atom(initialValue) {
  const id = `atom_${++atomId}`;
  const isWritable = typeof initialValue !== "function";

  const a = {
    id,
    _value: isWritable ? initialValue : undefined,
    _deriveFn: isWritable ? null : initialValue,
    _writeFn: null,
    _subscribers: new Set(),
    _deps: new Set(),

    get() {
      if (this._deriveFn) {
        return this._deriveFn((dep) => {
          this._deps.add(dep);
          return dep.get();
        });
      }
      return this._value;
    },

    set(newValue) {
      if (this._writeFn) {
        this._writeFn(
          (dep) => dep.get(),
          (dep, val) => dep.set(val),
          newValue
        );
        return;
      }
      const resolved = typeof newValue === "function" ? newValue(this._value) : newValue;
      if (!Object.is(resolved, this._value)) {
        this._value = resolved;
        this._notify();
      }
    },

    subscribe(fn) {
      this._subscribers.add(fn);
      return () => this._subscribers.delete(fn);
    },

    _notify() {
      this._subscribers.forEach((fn) => fn(this._value));
      for (const [, reg] of atomRegistry) {
        if (reg._deps.has(this)) {
          reg._subscribers.forEach((fn) => fn(reg.get()));
        }
      }
    },
  };

  atomRegistry.set(id, a);
  return a;
}

function writableAtom(readFn, writeFn) {
  const a = atom(readFn);
  a._writeFn = writeFn;
  return a;
}

// ========== 3. 基本用法 ==========
console.log("3. 基本用法\n");

const countAtom = atom(0);
const nameAtom = atom("Jotai");

countAtom.subscribe((val) => console.log(`  count → ${val}`));

countAtom.set(1);
countAtom.set((prev) => prev + 1);
countAtom.set((prev) => prev + 1);
console.log(`  name: ${nameAtom.get()}`);

// ========== 4. 派生原子 ==========
console.log("\n4. 派生原子\n");

const doubleAtom = atom((get) => get(countAtom) * 2);
const greetingAtom = atom((get) => `Hello ${get(nameAtom)}! Count=${get(countAtom)}`);

console.log(`  double: ${doubleAtom.get()}`);
console.log(`  greeting: ${greetingAtom.get()}`);

countAtom.set(10);
console.log(`  更新后 double: ${doubleAtom.get()}`);
console.log(`  更新后 greeting: ${greetingAtom.get()}`);

// ========== 5. 可写派生原子 ==========
console.log("\n5. 可写派生原子\n");

const incrementAtom = writableAtom(
  (get) => get(countAtom),
  (get, set) => set(countAtom, get(countAtom) + 1)
);

const resetAtom = writableAtom(
  () => null,
  (get, set) => { set(countAtom, 0); set(nameAtom, "Jotai"); }
);

incrementAtom.set();
incrementAtom.set();
console.log(`  increment x2: count=${countAtom.get()}`);
resetAtom.set();
console.log(`  reset: count=${countAtom.get()}, name=${nameAtom.get()}`);

// ========== 6. Jotai React 用法 ==========
console.log("\n6. Jotai + React 实际用法");
console.log(`
  import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
  import { atomWithStorage } from 'jotai/utils';

  // 基础原子
  const countAtom = atom(0);
  const themeAtom = atomWithStorage('theme', 'light');  // 持久化

  // 派生原子
  const doubleAtom = atom((get) => get(countAtom) * 2);

  // 异步原子
  const postsAtom = atom(async () => {
    const res = await fetch('/api/posts');
    return res.json();
  });

  // 组件
  function Counter() {
    const [count, setCount] = useAtom(countAtom);
    const double = useAtomValue(doubleAtom);
    return (
      <div>
        <p>{count} (x2: {double})</p>
        <button onClick={() => setCount(c => c + 1)}>+1</button>
      </div>
    );
  }
`);

// ========== 7. 适用场景 ==========
console.log("\n7. 适用场景总结");
console.log(`
  ✅ 适合: 细粒度状态更新、复杂依赖关系、渐进式添加状态
  ❌ 不适合: 需要强 DevTools、复杂业务逻辑、大型团队
`);

console.log("\n=== 原子化状态管理完成 ===");
