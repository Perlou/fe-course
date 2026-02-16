// Fiber 架构详解
// 运行: node 03-fiber.js

console.log("=== Fiber 架构详解 ===\n");

// ========== 1. 为什么需要 Fiber ==========
console.log("1. 从 Stack 到 Fiber");

console.log(`
  React 15 (Stack Reconciler):
  ┌──────────────────────────────────────────────────────┐
  │  递归遍历组件树，同步不可中断                          │
  │                                                      │
  │  App → Header → Nav → NavItem → ...                  │
  │  一条路走到底，大组件树会阻塞主线程                    │
  │                                                      │
  │  问题:                                               │
  │  • 动画卡顿 (JS 执行时无法渲染)                       │
  │  • 输入延迟 (用户交互无法及时响应)                     │
  │  • 无法区分任务优先级                                 │
  └──────────────────────────────────────────────────────┘

  React 16+ (Fiber Reconciler):
  ┌──────────────────────────────────────────────────────┐
  │  链表遍历，可中断可恢复                                │
  │                                                      │
  │  App ─→ Header ─→ [暂停,让出主线程] ─→ Nav ─→ ...    │
  │                                                      │
  │  优势:                                               │
  │  • 工作可以暂停，让浏览器先渲染/响应输入                │
  │  • 高优先级任务可以打断低优先级任务                     │
  │  • 并发模式 (Concurrent Mode) 的基础                  │
  └──────────────────────────────────────────────────────┘
`);

// ========== 2. Fiber 节点结构 ==========
console.log("2. Fiber 节点实现");

// Fiber 节点构造
function createFiber(type, props, key) {
  return {
    // === 类型信息 ===
    type, // 'div', 'span', FunctionComponent, ClassComponent
    key, // diff 时标识
    tag: typeof type === "function" ? "FunctionComponent" : "HostComponent",

    // === 树结构 (链表) ===
    return: null, // 父 Fiber
    child: null, // 第一个子 Fiber
    sibling: null, // 下一个兄弟 Fiber
    index: 0, // 在兄弟中的索引

    // === 实例 ===
    stateNode: null, // DOM 节点 / 组件实例

    // === 状态与 Props ===
    pendingProps: props, // 新的 props
    memoizedProps: null, // 当前 props
    memoizedState: null, // 当前 state / Hooks 链表

    // === 副作用 ===
    flags: "NoFlags", // 'Placement' | 'Update' | 'Deletion'
    subtreeFlags: "NoFlags",
    updateQueue: null,

    // === 双缓存 ===
    alternate: null, // 对应的 current / workInProgress
  };
}

// ========== 3. 构建 Fiber 树 ==========
console.log("3. 构建 Fiber 树");

// 模拟组件树结构
// <App>
//   <Header>
//     <Logo />
//     <Nav />
//   </Header>
//   <Main>
//     <Article />
//   </Main>
// </App>

function buildFiberTree() {
  const app = createFiber("App", {}, null);
  const header = createFiber("Header", {}, null);
  const logo = createFiber("Logo", {}, null);
  const nav = createFiber("Nav", {}, null);
  const main = createFiber("Main", {}, null);
  const article = createFiber("Article", {}, null);

  // 建立链表关系
  app.child = header;

  header.return = app;
  header.child = logo;
  header.sibling = main;

  logo.return = header;
  logo.sibling = nav;

  nav.return = header;

  main.return = app;
  main.child = article;

  article.return = main;

  return app;
}

const fiberTree = buildFiberTree();

// 遍历 Fiber 树 (深度优先)
function traverseFiber(fiber, depth = 0) {
  const pad = "  ".repeat(depth + 1);
  console.log(
    `${pad}${fiber.type} [child→${fiber.child?.type || "null"}, sibling→${fiber.sibling?.type || "null"}, return→${fiber.return?.type || "null"}]`
  );

  if (fiber.child) traverseFiber(fiber.child, depth + 1);
  if (fiber.sibling) traverseFiber(fiber.sibling, depth);
}

console.log("  Fiber 树遍历:");
traverseFiber(fiberTree);

// ========== 4. 工作循环 (Work Loop) ==========
console.log("\n4. 工作循环实现");

let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;

// 模拟 requestIdleCallback
function requestIdleCallback(callback) {
  // 真实环境中浏览器调用
  // 这里模拟同步执行
  callback({ timeRemaining: () => 10 });
}

function workLoop(deadline) {
  let shouldYield = false;
  let workCount = 0;

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    workCount++;

    // 检查剩余时间
    shouldYield = deadline.timeRemaining() < 1;
  }

  // 所有工作完成，提交
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  return workCount;
}

// ========== 5. 执行单个工作单元 ==========
function performUnitOfWork(fiber) {
  console.log(`    → 处理: ${fiber.type} (${fiber.tag})`);

  // beginWork: 处理当前 Fiber
  if (fiber.tag === "FunctionComponent") {
    // 调用函数组件 (模拟)
    console.log(`      调用函数组件 ${fiber.type}()`);
  } else {
    // 创建 DOM (模拟)
    if (!fiber.stateNode) {
      fiber.stateNode = `<${fiber.type}>`; // 模拟 DOM
      console.log(`      创建 DOM: <${fiber.type}>`);
    }
  }

  // 返回下一个工作单元 (深度优先遍历)
  // 1. 优先进入子节点
  if (fiber.child) {
    return fiber.child;
  }

  // 2. 没有子节点，找兄弟或返回父级
  let nextFiber = fiber;
  while (nextFiber) {
    // completeWork: 完成当前节点
    console.log(`    ✓ 完成: ${nextFiber.type}`);

    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.return;
  }

  return null; // 根节点完成
}

// ========== 6. 提交阶段 ==========
function commitRoot() {
  console.log("\n  提交阶段 (Commit Phase):");
  console.log("    → 将 DOM 变更应用到真实 DOM");
  console.log("    → 切换 current 指针");
  currentRoot = wipRoot;
  wipRoot = null;
}

// 模拟渲染
console.log("  渲染过程 (Render Phase):");

// 创建一个简单的 Fiber 树进行演示
const rootFiber = createFiber("div", {}, null);
const h1Fiber = createFiber("h1", {}, null);
const pFiber = createFiber("p", {}, null);
const spanFiber = createFiber("span", {}, null);

rootFiber.child = h1Fiber;
h1Fiber.return = rootFiber;
h1Fiber.sibling = pFiber;
pFiber.return = rootFiber;
pFiber.child = spanFiber;
spanFiber.return = pFiber;

wipRoot = rootFiber;
nextUnitOfWork = rootFiber;

workLoop({ timeRemaining: () => 10 });

// ========== 7. 双缓存机制 ==========
console.log("\n5. 双缓存 (Double Buffering)");

console.log(`
  Current Fiber Tree (当前显示)    WorkInProgress Tree (构建中)
  ┌────────────┐                   ┌────────────┐
  │   Root     │  ←── alternate →  │   Root     │
  └─────┬──────┘                   └─────┬──────┘
        │                                │
  ┌─────┴──────┐                   ┌─────┴──────┐
  │   App      │  ←── alternate →  │  App(new)  │
  └─────┬──────┘                   └─────┬──────┘
        │                                │
  ┌─────┴──────┐                   ┌─────┴──────┐
  │  Counter   │  ←── alternate →  │Counter(new)│
  │ state: 0   │                   │ state: 1   │
  └────────────┘                   └────────────┘

  更新流程:
  1. setState(1) 触发更新
  2. 基于 current tree 创建 workInProgress tree
  3. 在 workInProgress 上进行修改 (可中断)
  4. 完成后 commit: root.current = workInProgress
  5. workInProgress 变成 current, 旧 current 用于下次更新
`);

// ========== 8. 任务优先级 ==========
console.log("6. 任务优先级 (Lane 模型)");

console.log(`
  React 18 使用 Lane 模型管理优先级:

  ┌───────────────────────┬──────────┬──────────────────────────┐
  │ 优先级                 │ Lane 值   │ 场景                     │
  ├───────────────────────┼──────────┼──────────────────────────┤
  │ SyncLane (最高)        │ 1        │ 点击/输入等用户交互        │
  │ InputContinuousLane   │ 4        │ 滚动/拖拽等连续交互        │
  │ DefaultLane           │ 16       │ setTimeout / 网络请求      │
  │ TransitionLane        │ 64-128   │ useTransition 包裹的更新   │
  │ IdleLane (最低)        │ 536M     │ 空闲时才执行的任务         │
  └───────────────────────┴──────────┴──────────────────────────┘

  高优先级中断低优先级:
  1. 用户点击按钮 → SyncLane 更新
  2. 正在进行的 TransitionLane 更新被暂停
  3. SyncLane 更新完成并 commit
  4. 恢复 TransitionLane 更新 (可能需要重新开始)
`);

// ========== 9. Reconciliation 流程 ==========
console.log("7. 完整 Reconciliation 流程");

console.log(`
  ┌──────────────────────────────────────────────────────────────┐
  │                  setState / 状态变化触发                       │
  └────────────────────────┬─────────────────────────────────────┘
                           ↓
  ┌──────────────────────────────────────────────────────────────┐
  │  Schedule Phase (调度)                                        │
  │  • 确定更新优先级 (Lane)                                      │
  │  • 加入调度队列                                               │
  └────────────────────────┬─────────────────────────────────────┘
                           ↓
  ┌──────────────────────────────────────────────────────────────┐
  │  Render Phase (渲染) - ⚡ 可中断                              │
  │                                                              │
  │  beginWork (向下)                                             │
  │    • 对比新旧 Fiber (Diff)                                    │
  │    • 标记副作用 (Placement / Update / Deletion)               │
  │    • 处理 Hooks                                               │
  │                                                              │
  │  completeWork (向上)                                          │
  │    • 创建/更新 DOM 节点 (不挂载)                               │
  │    • 收集副作用链表                                            │
  └────────────────────────┬─────────────────────────────────────┘
                           ↓
  ┌──────────────────────────────────────────────────────────────┐
  │  Commit Phase (提交) - 🔒 不可中断                            │
  │                                                              │
  │  Before Mutation:                                             │
  │    • getSnapshotBeforeUpdate                                  │
  │                                                              │
  │  Mutation:                                                    │
  │    • 执行 DOM 操作 (增/删/改)                                  │
  │    • current ← workInProgress (双缓存切换)                    │
  │                                                              │
  │  Layout:                                                      │
  │    • useLayoutEffect                                          │
  │    • componentDidMount / componentDidUpdate                   │
  │                                                              │
  │  Schedule useEffect (异步执行)                                │
  └──────────────────────────────────────────────────────────────┘
`);

console.log("=== Fiber 架构完成 ===");
