# Vue 核心原理深入解析

## 📌 一、响应式原理

### 1. Vue 3 响应式基于 Proxy

```javascript
// reactive 实现原理
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      track(target, key); // 收集依赖
      const result = Reflect.get(target, key, receiver);
      // 深层响应式
      if (typeof result === "object" && result !== null) {
        return reactive(result);
      }
      return result;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        trigger(target, key); // 触发更新
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
  });
}
```

### 2. ref 实现

```javascript
function ref(value) {
  return new RefImpl(value);
}

class RefImpl {
  constructor(value) {
    this._value = isObject(value) ? reactive(value) : value;
  }

  get value() {
    track(this, "value");
    return this._value;
  }

  set value(newValue) {
    if (newValue !== this._value) {
      this._value = isObject(newValue) ? reactive(newValue) : newValue;
      trigger(this, "value");
    }
  }
}

// ref vs reactive
// ref: 用于原始值，通过 .value 访问
// reactive: 用于对象，直接访问属性
```

---

## 📌 二、依赖收集与触发

### 1. 核心数据结构

```
targetMap = WeakMap {
  target1: Map {
    key1: Set [effect1, effect2],
    key2: Set [effect3]
  },
  target2: Map {
    key1: Set [effect4]
  }
}

WeakMap → 存储所有响应式对象
  └→ Map → 存储对象的每个属性
       └→ Set → 存储依赖该属性的 effect
```

### 2. 依赖收集 (track)

```javascript
let activeEffect = null;
const targetMap = new WeakMap();

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

  dep.add(activeEffect);
  activeEffect.deps.push(dep); // 双向记录，用于清理
}
```

### 3. 触发更新 (trigger)

```javascript
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const dep = depsMap.get(key);
  if (dep) {
    const effectsToRun = new Set();
    dep.forEach((effect) => {
      // 避免无限循环
      if (effect !== activeEffect) {
        effectsToRun.add(effect);
      }
    });
    effectsToRun.forEach((effect) => {
      if (effect.scheduler) {
        effect.scheduler();
      } else {
        effect.run();
      }
    });
  }
}
```

### 4. effect 实现

```javascript
class ReactiveEffect {
  constructor(fn, scheduler = null) {
    this.fn = fn;
    this.scheduler = scheduler;
    this.deps = [];
  }

  run() {
    activeEffect = this;
    const result = this.fn();
    activeEffect = null;
    return result;
  }

  stop() {
    // 清理依赖
    this.deps.forEach((dep) => dep.delete(this));
    this.deps.length = 0;
  }
}

function effect(fn, options = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler);
  _effect.run();

  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

// 使用
const state = reactive({ count: 0 });
effect(() => {
  console.log(state.count); // 自动收集依赖
});
state.count++; // 自动触发 effect
```

---

## 📌 三、computed 与 watch

### 1. computed 实现

```javascript
function computed(getter) {
  let value;
  let dirty = true;

  const effect = new ReactiveEffect(getter, () => {
    if (!dirty) {
      dirty = true;
      trigger(obj, "value");
    }
  });

  const obj = {
    get value() {
      if (dirty) {
        value = effect.run();
        dirty = false;
      }
      track(obj, "value");
      return value;
    },
  };

  return obj;
}

// 特点：
// 1. 惰性计算（只在访问时计算）
// 2. 缓存结果（依赖不变不重新计算）
```

### 2. watch 实现

```javascript
function watch(source, callback, options = {}) {
  let getter;
  if (typeof source === "function") {
    getter = source;
  } else {
    getter = () => traverse(source);
  }

  let oldValue, newValue;

  const job = () => {
    newValue = effect.run();
    callback(newValue, oldValue);
    oldValue = newValue;
  };

  const effect = new ReactiveEffect(getter, job);

  if (options.immediate) {
    job();
  } else {
    oldValue = effect.run();
  }
}

// 递归遍历对象，触发所有属性的 getter
function traverse(value, seen = new Set()) {
  if (typeof value !== "object" || value === null || seen.has(value)) {
    return value;
  }
  seen.add(value);
  for (const key in value) {
    traverse(value[key], seen);
  }
  return value;
}
```

---

## 📌 四、编译器原理

### 1. 编译流程

```
Template → Parse → AST → Transform → AST → Generate → Render Function

模板:
<div>{{ message }}</div>

AST:
{
  type: 'Element',
  tag: 'div',
  children: [{
    type: 'Interpolation',
    content: {
      type: 'SimpleExpression',
      content: 'message'
    }
  }]
}

渲染函数:
function render(_ctx) {
  return h('div', null, _ctx.message)
}
```

### 2. Parse 阶段

```javascript
function parse(template) {
  const context = {
    source: template,
    advance(num) {
      this.source = this.source.slice(num);
    },
  };

  return parseChildren(context);
}

function parseChildren(context) {
  const nodes = [];

  while (!isEnd(context)) {
    let node;
    const s = context.source;

    if (s.startsWith("{{")) {
      node = parseInterpolation(context);
    } else if (s[0] === "<") {
      node = parseElement(context);
    } else {
      node = parseText(context);
    }

    nodes.push(node);
  }

  return nodes;
}
```

### 3. Transform 阶段

```javascript
function transform(ast) {
  const context = {
    nodeTransforms: [transformElement, transformText, transformExpression],
  };

  traverseNode(ast, context);
}

function traverseNode(node, context) {
  // 执行转换插件
  context.nodeTransforms.forEach((transform) => {
    transform(node, context);
  });

  // 递归处理子节点
  if (node.children) {
    node.children.forEach((child) => {
      traverseNode(child, context);
    });
  }
}
```

---

## 📌 五、Diff 算法

### 1. Vue 3 Diff 优化

```
Vue 3 使用最长递增子序列 (LIS) 优化

旧: [a, b, c, d, e, f, g]
新: [a, b, d, c, e, h, f, g]

步骤:
1. 头部比较: a, b 相同，跳过
2. 尾部比较: f, g 相同，跳过
3. 中间部分: [c, d, e] → [d, c, e, h]
4. 计算 LIS，最小化移动
```

### 2. 最长递增子序列算法

```javascript
// 返回最长递增子序列的索引
function getSequence(arr) {
  const p = arr.slice(); // 前驱索引
  const result = [0]; // 结果索引
  let i, j, u, v, c;
  const len = arr.length;

  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      // 二分查找
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }

  // 回溯
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }

  return result;
}

// 示例
getSequence([2, 3, 1, 5, 6, 8, 7, 9, 4]);
// LIS: [2, 3, 5, 6, 8, 9] 或 [2, 3, 5, 6, 7, 9]
// 返回索引: [0, 1, 3, 4, 5, 7]
```

### 3. patchKeyedChildren

```javascript
function patchKeyedChildren(c1, c2, container) {
  let i = 0;
  const l2 = c2.length;
  let e1 = c1.length - 1;
  let e2 = l2 - 1;

  // 1. 从头部开始比较
  while (i <= e1 && i <= e2) {
    if (isSameVNode(c1[i], c2[i])) {
      patch(c1[i], c2[i], container);
    } else {
      break;
    }
    i++;
  }

  // 2. 从尾部开始比较
  while (i <= e1 && i <= e2) {
    if (isSameVNode(c1[e1], c2[e2])) {
      patch(c1[e1], c2[e2], container);
    } else {
      break;
    }
    e1--;
    e2--;
  }

  // 3. 新增节点
  if (i > e1 && i <= e2) {
    while (i <= e2) {
      mount(c2[i], container);
      i++;
    }
  }
  // 4. 删除节点
  else if (i > e2 && i <= e1) {
    while (i <= e1) {
      unmount(c1[i]);
      i++;
    }
  }
  // 5. 乱序部分
  else {
    const s1 = i;
    const s2 = i;

    // 建立新节点 key -> index 映射
    const keyToNewIndexMap = new Map();
    for (i = s2; i <= e2; i++) {
      keyToNewIndexMap.set(c2[i].key, i);
    }

    // 遍历旧节点，查找可复用节点
    const toBePatched = e2 - s2 + 1;
    const newIndexToOldIndexMap = new Array(toBePatched).fill(0);

    for (i = s1; i <= e1; i++) {
      const oldVNode = c1[i];
      const newIndex = keyToNewIndexMap.get(oldVNode.key);

      if (newIndex === undefined) {
        unmount(oldVNode);
      } else {
        newIndexToOldIndexMap[newIndex - s2] = i + 1;
        patch(oldVNode, c2[newIndex], container);
      }
    }

    // 使用 LIS 最小化移动
    const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap);
    let j = increasingNewIndexSequence.length - 1;

    for (i = toBePatched - 1; i >= 0; i--) {
      const nextIndex = s2 + i;
      const nextChild = c2[nextIndex];

      if (newIndexToOldIndexMap[i] === 0) {
        mount(nextChild, container);
      } else if (j < 0 || i !== increasingNewIndexSequence[j]) {
        move(nextChild, container);
      } else {
        j--;
      }
    }
  }
}
```

---

## 📌 六、手写 Mini Vue

```javascript
// ============ 响应式系统 ============
let activeEffect = null;
const targetMap = new WeakMap();

function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      track(target, key);
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key);
      return result;
    },
  });
}

function track(target, key) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) targetMap.set(target, (depsMap = new Map()));
  let dep = depsMap.get(key);
  if (!dep) depsMap.set(key, (dep = new Set()));
  dep.add(activeEffect);
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  if (dep) dep.forEach((effect) => effect());
}

function effect(fn) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}

// ============ 渲染器 ============
function h(type, props, children) {
  return { type, props, children };
}

function mount(vnode, container) {
  const el = (vnode.el = document.createElement(vnode.type));

  // 处理 props
  if (vnode.props) {
    for (const key in vnode.props) {
      if (key.startsWith("on")) {
        el.addEventListener(key.slice(2).toLowerCase(), vnode.props[key]);
      } else {
        el.setAttribute(key, vnode.props[key]);
      }
    }
  }

  // 处理 children
  if (typeof vnode.children === "string") {
    el.textContent = vnode.children;
  } else if (Array.isArray(vnode.children)) {
    vnode.children.forEach((child) => mount(child, el));
  }

  container.appendChild(el);
}

function patch(n1, n2) {
  if (n1.type !== n2.type) {
    const parent = n1.el.parentNode;
    parent.removeChild(n1.el);
    mount(n2, parent);
  } else {
    const el = (n2.el = n1.el);
    // 更新 props...
    // 更新 children...
  }
}

// ============ 应用 ============
function createApp(rootComponent) {
  return {
    mount(container) {
      const state = reactive(rootComponent.setup());

      effect(() => {
        const vnode = rootComponent.render(state);
        if (!container._vnode) {
          mount(vnode, container);
        } else {
          patch(container._vnode, vnode);
        }
        container._vnode = vnode;
      });
    },
  };
}
```

---

## 📚 推荐学习资源

| 资源           | 链接                           |
| -------------- | ------------------------------ |
| Vue 官方文档   | vuejs.org                      |
| Vue 3 源码解析 | vue3js.cn                      |
| Mini Vue       | github.com/cuixiaorui/mini-vue |

---
