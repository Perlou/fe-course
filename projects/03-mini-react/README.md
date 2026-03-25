# ⚛️ Mini React

> 从零实现一个简易版 React，深入理解框架核心原理

## 📖 项目简介

Mini React 是一个零外部依赖的 React 实现，覆盖了 React 的 6 大核心机制：

- ✅ **JSX 转换** — createElement 将 JSX 编译结果转为 VNode 树
- ✅ **虚拟 DOM** — 纯对象描述 UI，与真实 DOM 解耦
- ✅ **Fiber 架构** — 树→链表，可中断渲染 (child/sibling/return)
- ✅ **Reconciliation** — O(n) Diff 算法 (UPDATE/PLACEMENT/DELETION)
- ✅ **Hooks** — useState (状态) + useEffect (副作用) + useMemo (缓存)
- ✅ **合成事件** — 根节点代理 + 冒泡 + SyntheticEvent

## 🚀 快速开始

```bash
# 运行完整演示
node examples/demo.js
```

## 📂 目录结构

```
03-mini-react/
├── README.md
├── package.json
├── src/
│   ├── index.js            # 统一入口
│   ├── createElement.js    # VNode 工厂 (JSX → 纯对象)
│   ├── fiber.js            # Fiber 数据结构
│   ├── scheduler.js        # 调度器 (工作循环 + 状态)
│   ├── reconciler.js       # 协调器 (Diff + Commit + render)
│   ├── hooks.js            # useState / useEffect / useMemo
│   └── events.js           # 合成事件系统
└── examples/
    └── demo.js             # 完整演示
```

## 🔍 核心原理

### 渲染流程

```
JSX → createElement() → VNode 树
                           │
                    ┌──────▼──────┐
                    │ Render 阶段  │  (可中断)
                    │   构建 Fiber │
                    │   Diff 算法  │
                    └──────┬──────┘
                           │ effectTag
                    ┌──────▼──────┐
                    │ Commit 阶段  │  (不可中断)
                    │  操作真实 DOM │
                    └─────────────┘
```

### Fiber 链表

```
     App (根)
      │ child
      ▼
    <div> ───sibling──▸ null
      │ child
      ▼
    <h1> ───sibling──▸ <ul> ───sibling──▸ <p>
      │                  │
      ▼                  ▼
    "Hello"            <li> ──▸ <li> ──▸ <li>
```

每个 Fiber 都是一个工作单元，DFS 遍历时可在任意节点暂停让出主线程。

### Hooks 原理

```javascript
// 状态存在 Fiber.hooks 数组中
fiber.hooks = [
  { state: 0, queue: [] },    // hooks[0] = useState(0)
  { deps: [0], callback, cleanup },  // hooks[1] = useEffect
  { deps: [], value: 42 },    // hooks[2] = useMemo
];

// 每次渲染 hookIndex 从 0 递增
// 这就是为什么 Hooks 不能在 if/for 中调用！
```

### Diff 算法

```
旧:  <A>  <B>  <C>
新:  <A>  <D>  <C>  <E>

[0] A=A → UPDATE  (复用 DOM)
[1] B≠D → DELETION(B) + PLACEMENT(D)
[2] C=C → UPDATE  (复用 DOM)
[3] _≠E → PLACEMENT(E)
```

## 📚 对照学习

| Mini React | React 真实实现 |
|---|---|
| `createElement.js` | `react/jsx-runtime` |
| `fiber.js` 链表 | `ReactFiber.js` |
| `scheduler.js` 同步 | `Scheduler` + MessageChannel 时间切片 |
| `reconciler.js` Diff | `ReactFiberReconciler` + `beginWork/completeWork` |
| `hooks.js` 数组存储 | `ReactFiberHooks` + 链表 |
| `events.js` 简单代理 | `react-dom` 合成事件 + 事件池 |

---

> 💡 这个项目覆盖了 Phase 11 (React 核心) 和 Phase 12 (React 生态) 的核心知识点
