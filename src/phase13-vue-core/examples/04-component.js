// Vue 3 组件系统详解
// 运行: node 04-component.js

console.log("=== Vue 3 组件系统 ===\n");

// ========== 1. 组件挂载流程 ==========
console.log("1. 组件挂载流程");
console.log(`
  createApp(App).mount('#app')
        ↓
  ┌──────────────────────────────────────────────────────────┐
  │  1. createVNode(App)         创建组件 VNode              │
  │  2. render(vnode, container) 调用渲染函数                 │
  │  3. patch(null, vnode)       首次挂载                     │
  │  4. processComponent()       处理组件                     │
  │  5. mountComponent()         挂载组件                     │
  │     5a. createComponentInstance()  创建组件实例            │
  │     5b. setupComponent()          执行 setup()           │
  │     5c. setupRenderEffect()       建立渲染 effect        │
  │  6. 渲染子树 → patch 子节点 → 递归                        │
  └──────────────────────────────────────────────────────────┘
`);

// ========== 2. 组件实例 ==========
console.log("2. 组件实例结构");

function createComponentInstance(vnode) {
  const instance = {
    vnode,
    type: vnode.type,           // 组件选项对象
    subTree: null,              // 渲染的子树 VNode
    
    // Props 系统
    props: {},
    attrs: {},
    
    // 插槽
    slots: {},
    
    // 生命周期
    isMounted: false,
    bc: null,  // beforeCreate
    c: null,   // created
    bm: null,  // beforeMount
    m: null,   // mounted
    bu: null,  // beforeUpdate
    u: null,   // updated
    bum: null, // beforeUnmount
    um: null,  // unmounted
    
    // setup 返回值
    setupState: {},
    
    // 渲染上下文代理
    proxy: null,
    
    // emit
    emit: null,
    
    // provide/inject
    provides: {},
    parent: null,
  };

  instance.emit = emit.bind(null, instance);
  return instance;
}

// ========== 3. Props 系统 ==========
console.log("3. Props 系统");

function initProps(instance, rawProps) {
  const props = {};
  const attrs = {};
  const propsOptions = instance.type.props || {};

  if (rawProps) {
    for (const key in rawProps) {
      const value = rawProps[key];
      if (key in propsOptions) {
        props[key] = value;
      } else {
        attrs[key] = value;
      }
    }
  }

  // Props 是浅层只读的响应式
  instance.props = shallowReadonly(props);
  instance.attrs = attrs;
}

function shallowReadonly(target) {
  return new Proxy(target, {
    get: (t, k) => Reflect.get(t, k),
    set: () => { console.warn("  ⚠️ Props 是只读的!"); return true; },
  });
}

// 测试
console.log("  Props 初始化:");
const inst = { type: { props: { title: String, count: Number } } };
initProps(inst, { title: "Hello", count: 42, extraAttr: "test" });
console.log("  props:", inst.props);
console.log("  attrs:", inst.attrs);
inst.props.title = "修改"; // 触发警告

// ========== 4. Emit 事件系统 ==========
console.log("\n4. Emit 事件系统");

function emit(instance, event, ...args) {
  const props = instance.vnode.props || {};
  
  // onClick → click, onUpdate:modelValue → update:modelValue
  const handlerName = `on${event[0].toUpperCase() + event.slice(1)}`;
  const handler = props[handlerName];

  if (handler) {
    handler(...args);
  }
}

const child = createComponentInstance({
  type: { props: {} },
  props: {
    onClick: (msg) => console.log(`  [Parent 收到] click: ${msg}`),
    onUpdate: (val) => console.log(`  [Parent 收到] update: ${val}`),
  },
});

child.emit("click", "Hello from child!");
child.emit("update", 42);

// ========== 5. Provide / Inject ==========
console.log("\n5. Provide / Inject");

// 模拟组件树
const grandParent = { provides: { theme: "dark", lang: "zh" }, parent: null };
const parent = { provides: Object.create(grandParent.provides), parent: grandParent };
parent.provides.lang = "en"; // 覆盖

const childComp = { provides: Object.create(parent.provides), parent };

function provide(instance, key, value) {
  instance.provides[key] = value;
}

function inject(instance, key, defaultValue) {
  const provides = instance.parent?.provides;
  if (provides && key in provides) return provides[key];
  return defaultValue;
}

provide(grandParent, "theme", "dark");
provide(grandParent, "lang", "zh");
provide(parent, "lang", "en"); // 覆盖

console.log("  child inject theme:", inject(childComp, "theme"));      // dark (来自 grandParent)
console.log("  child inject lang:", inject(childComp, "lang"));        // en (来自 parent 覆盖)
console.log("  child inject missing:", inject(childComp, "xxx", "默认值")); // 默认值

// ========== 6. 生命周期 ==========
console.log("\n6. 生命周期");
console.log(`
  setup() 中注册 (Composition API):

  ┌──────────────────────────────────────────────────────────┐
  │  创建阶段                                                │
  │  setup()                 ← 替代 beforeCreate + created   │
  ├──────────────────────────────────────────────────────────┤
  │  挂载阶段                                                │
  │  onBeforeMount()         ← DOM 创建前                    │
  │  onMounted()             ← DOM 创建后 (可访问 DOM)       │
  ├──────────────────────────────────────────────────────────┤
  │  更新阶段                                                │
  │  onBeforeUpdate()        ← DOM 更新前                    │
  │  onUpdated()             ← DOM 更新后                    │
  ├──────────────────────────────────────────────────────────┤
  │  卸载阶段                                                │
  │  onBeforeUnmount()       ← DOM 移除前                    │
  │  onUnmounted()           ← DOM 移除后 (清理副作用)       │
  ├──────────────────────────────────────────────────────────┤
  │  调试                                                    │
  │  onRenderTracked()       ← 依赖被收集时                  │
  │  onRenderTriggered()     ← 依赖触发重渲染时              │
  └──────────────────────────────────────────────────────────┘

  执行顺序 (父子):
  Parent setup → Parent onBeforeMount
    → Child setup → Child onBeforeMount → Child onMounted
  → Parent onMounted
`);

// ========== 7. 插槽系统 ==========
console.log("7. 插槽系统");
console.log(`
  // 父组件
  <Card>
    <template #header>标题</template>       // 具名插槽
    <template #default="{ item }">          // 作用域插槽
      {{ item.name }}
    </template>
  </Card>

  // 编译结果 (渲染函数):
  h(Card, null, {
    header: () => h('span', null, '标题'),
    default: ({ item }) => h('span', null, item.name),
  })

  // Card 组件内部渲染:
  function Card(props, { slots }) {
    return h('div', { class: 'card' }, [
      h('div', { class: 'header' }, slots.header?.()),
      h('div', { class: 'body' },
        slots.default?.({ item: { name: 'Vue 3' } })
      ),
    ]);
  }
`);

console.log("=== 组件系统完成 ===");
