// Vue 3 响应式原理详解
// 运行: node 01-reactivity.js

console.log("=== Vue 3 响应式原理 ===\n");

// ========== 1. 核心数据结构 ==========
console.log("1. 依赖收集的数据结构");
console.log(`
  targetMap = WeakMap {
    target → Map {
      key → Set [effect1, effect2, ...]
    }
  }

  WeakMap: 响应式对象 → 属性依赖映射
    Map:   属性名 → 依赖集合
      Set: 依赖该属性的 effect 函数
`);

// ========== 2. 完整响应式系统实现 ==========
console.log("2. 实现响应式系统\n");

let activeEffect = null;
const effectStack = []; // 支持嵌套 effect
const targetMap = new WeakMap();

// --- track: 依赖收集 ---
function track(target, key) {
  if (!activeEffect) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }

  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep); // 双向引用，用于清理
  }
}

// --- trigger: 触发更新 ---
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const dep = depsMap.get(key);
  if (!dep) return;

  // 避免无限循环: 复制一份再遍历
  const effectsToRun = new Set();
  dep.forEach((effect) => {
    if (effect !== activeEffect) {
      effectsToRun.add(effect);
    }
  });

  effectsToRun.forEach((effect) => {
    if (effect.scheduler) {
      effect.scheduler(); // 有调度器走调度器 (computed / watch)
    } else {
      effect.run();
    }
  });
}

// --- ReactiveEffect 类 ---
class ReactiveEffect {
  constructor(fn, scheduler = null) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.deps = [];
    this.active = true;
  }

  run() {
    if (!this.active) return this.fn();

    // 清理旧依赖 (处理条件分支)
    cleanup(this);

    activeEffect = this;
    effectStack.push(this);

    const result = this.fn();

    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1] || null;

    return result;
  }

  stop() {
    if (this.active) {
      cleanup(this);
      this.active = false;
    }
  }
}

function cleanup(effect) {
  effect.deps.forEach((dep) => dep.delete(effect));
  effect.deps.length = 0;
}

// --- effect 函数 ---
function effect(fn, options = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);

  if (!options.lazy) {
    _effect.run(); // 立即执行一次
  }

  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

// --- reactive ---
const reactiveMap = new WeakMap();

function reactive(target) {
  if (typeof target !== "object" || target === null) return target;
  if (reactiveMap.has(target)) return reactiveMap.get(target);

  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      if (key === "__isReactive") return true;

      track(target, key);
      const result = Reflect.get(target, key, receiver);

      // 深层响应式 (惰性转换)
      if (typeof result === "object" && result !== null) {
        return reactive(result);
      }
      return result;
    },

    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);

      if (!Object.is(oldValue, value)) {
        trigger(target, key);
      }
      return result;
    },

    deleteProperty(target, key) {
      const hadKey = Object.prototype.hasOwnProperty.call(target, key);
      const result = Reflect.deleteProperty(target, key);
      if (hadKey && result) {
        trigger(target, key);
      }
      return result;
    },

    has(target, key) {
      track(target, key);
      return Reflect.has(target, key);
    },
  });

  reactiveMap.set(target, proxy);
  return proxy;
}

// --- ref ---
function ref(value) {
  return new RefImpl(value);
}

class RefImpl {
  constructor(value) {
    this.__isRef = true;
    this._value = isObject(value) ? reactive(value) : value;
    this._rawValue = value;
    this.dep = new Set();
  }

  get value() {
    trackRef(this);
    return this._value;
  }

  set value(newValue) {
    if (!Object.is(newValue, this._rawValue)) {
      this._rawValue = newValue;
      this._value = isObject(newValue) ? reactive(newValue) : newValue;
      triggerRef(this);
    }
  }
}

function trackRef(ref) {
  if (activeEffect) {
    ref.dep.add(activeEffect);
    activeEffect.deps.push(ref.dep);
  }
}

function triggerRef(ref) {
  const effects = new Set(ref.dep);
  effects.forEach((e) => (e.scheduler ? e.scheduler() : e.run()));
}

function isObject(val) {
  return typeof val === "object" && val !== null;
}

// ========== 3. 测试 reactive ==========
console.log("3. 测试 reactive");

const state = reactive({ count: 0, name: "Vue" });

effect(() => {
  console.log(`  [effect] count = ${state.count}, name = ${state.name}`);
});

state.count++;
state.count++;
state.name = "Vue 3";

// ========== 4. 测试 ref ==========
console.log("\n4. 测试 ref");

const countRef = ref(0);

effect(() => {
  console.log(`  [effect] ref.value = ${countRef.value}`);
});

countRef.value = 10;
countRef.value = 20;

// ========== 5. computed ==========
console.log("\n5. computed 实现");

function computed(getter) {
  let value;
  let dirty = true;

  const _effect = new ReactiveEffect(getter, () => {
    if (!dirty) {
      dirty = true;
      triggerRef(obj); // 通知依赖 computed 的 effect
    }
  });

  const obj = {
    __isRef: true,
    dep: new Set(),
    get value() {
      trackRef(obj);
      if (dirty) {
        value = _effect.run();
        dirty = false;
      }
      return value;
    },
  };

  return obj;
}

const data = reactive({ price: 10, quantity: 3 });
const total = computed(() => data.price * data.quantity);

effect(() => {
  console.log(`  [effect] total = ${total.value}`);
});

data.price = 20;    // total 重新计算
data.quantity = 5;   // total 重新计算

// ========== 6. watch ==========
console.log("\n6. watch 实现");

function watch(source, callback, options = {}) {
  let getter;
  if (typeof source === "function") {
    getter = source;
  } else if (source.__isRef) {
    getter = () => source.value;
  } else {
    getter = () => traverse(source);
  }

  let oldValue;

  const job = () => {
    const newValue = _effect.run();
    callback(newValue, oldValue);
    oldValue = newValue;
  };

  const _effect = new ReactiveEffect(getter, job);

  if (options.immediate) {
    job();
  } else {
    oldValue = _effect.run();
  }
}

function traverse(value, seen = new Set()) {
  if (typeof value !== "object" || value === null || seen.has(value)) return value;
  seen.add(value);
  for (const key in value) traverse(value[key], seen);
  return value;
}

const watchState = reactive({ msg: "hello" });

watch(
  () => watchState.msg,
  (newVal, oldVal) => {
    console.log(`  [watch] msg: "${oldVal}" → "${newVal}"`);
  }
);

watchState.msg = "world";
watchState.msg = "vue 3";

// ========== 7. Vue 2 vs Vue 3 对比 ==========
console.log("\n7. 响应式对比");
console.log(`
  ┌───────────────────┬──────────────────┬──────────────────┐
  │                   │ Vue 2            │ Vue 3            │
  ├───────────────────┼──────────────────┼──────────────────┤
  │ 核心 API          │ Object.define..  │ Proxy            │
  │ 新增属性检测      │ ❌ 需 Vue.set    │ ✅ 自动检测      │
  │ 数组索引检测      │ ❌ 需 splice     │ ✅ 自动检测      │
  │ 删除属性检测      │ ❌ 需 Vue.delete │ ✅ 自动检测      │
  │ Map/Set 支持      │ ❌               │ ✅               │
  │ 性能             │ 初始化遍历全部    │ 惰性代理 (按需)  │
  └───────────────────┴──────────────────┴──────────────────┘
`);

console.log("=== 响应式原理完成 ===");
