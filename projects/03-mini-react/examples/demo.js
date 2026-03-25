/**
 * Mini React - 完整演示
 *
 * 运行: node examples/demo.js
 *
 * 演示所有核心功能:
 *   1. createElement (虚拟 DOM)
 *   2. Fiber 架构
 *   3. Reconciliation (Diff)
 *   4. Hooks (useState, useEffect)
 *   5. 函数组件
 *   6. 合成事件
 */

const MiniReact = require("../src/index");
const { createElement, render, useState, useEffect } = MiniReact;

console.log("=== Mini React 完整演示 ===\n");

// ========== 1. createElement (虚拟 DOM) ==========
console.log("1. createElement - 虚拟 DOM 创建\n");

const vnode = createElement(
  "div",
  { className: "app", id: "root" },
  createElement("h1", null, "Hello Mini React!"),
  createElement(
    "ul",
    { className: "list" },
    createElement("li", null, "Item 1"),
    createElement("li", null, "Item 2"),
    createElement("li", null, "Item 3")
  ),
  createElement("p", null, "欢迎使用 Mini React 🎉")
);

console.log("  VNode 树:");
function printVNode(node, indent = "  ") {
  if (!node) return;
  if (node.type === "TEXT_ELEMENT") {
    console.log(`${indent}📝 "${node.props.nodeValue}"`);
  } else {
    const attrs = Object.keys(node.props)
      .filter((k) => k !== "children")
      .map((k) => `${k}="${node.props[k]}"`)
      .join(" ");
    console.log(`${indent}<${node.type}${attrs ? " " + attrs : ""}>`);
    node.props.children.forEach((child) => printVNode(child, indent + "  "));
  }
}
printVNode(vnode);

// ========== 2. render (Fiber 构建 + Reconciliation) ==========
console.log("\n2. render - Fiber 构建 + DOM 渲染\n");

// 创建模拟容器
const container = {
  nodeType: 1,
  tagName: "DIV",
  _type: "div",
  attributes: { id: "root" },
  children: [],
  style: {},
  eventListeners: {},
};

render(vnode, container);

// 打印渲染结果
function printDom(dom, indent = "  ") {
  if (!dom) return;
  if (dom.nodeType === 3) {
    console.log(`${indent}📝 "${dom.nodeValue}"`);
  } else {
    const tag = dom._type || dom.tagName;
    const attrs = Object.entries(dom.attributes || {})
      .map(([k, v]) => `${k}="${v}"`)
      .join(" ");
    console.log(`${indent}<${tag}${attrs ? " " + attrs : ""}>`);
    (dom.children || []).forEach((child) => printDom(child, indent + "  "));
  }
}
console.log("  渲染结果 (模拟 DOM 树):");
printDom(container);

// ========== 3. 函数组件 + Hooks ==========
console.log("\n3. 函数组件 + Hooks\n");

// 计数器组件
function Counter(props) {
  const [count, setCount] = useState(props.initial || 0);

  useEffect(() => {
    console.log(`    [Effect] 计数器值: ${count}`);
    return () => console.log(`    [Cleanup] 清理旧值: ${count}`);
  }, [count]);

  return createElement(
    "div",
    { className: "counter" },
    createElement("span", null, `计数: ${count}`),
    createElement("button", { onClick: () => setCount(count + 1) }, "+1")
  );
}

// 渲染函数组件
const counterContainer = {
  nodeType: 1,
  _type: "div",
  attributes: {},
  children: [],
  style: {},
  eventListeners: {},
};

console.log("  首次渲染:");
render(createElement(Counter, { initial: 0 }), counterContainer);
console.log("  渲染结果:");
printDom(counterContainer);

// ========== 4. JSX 转换对照 ==========
console.log("\n4. JSX 转换对照\n");
console.log(`
  JSX:
    <div className="app">
      <h1>Hello</h1>
      <Counter initial={0} />
    </div>

  编译为:
    createElement('div', { className: 'app' },
      createElement('h1', null, 'Hello'),
      createElement(Counter, { initial: 0 })
    )

  VNode 输出:
    {
      type: 'div',
      props: {
        className: 'app',
        children: [
          { type: 'h1', props: { children: ['Hello'] } },
          { type: Counter, props: { initial: 0, children: [] } }
        ]
      }
    }
`);

// ========== 5. Diff 算法演示 ==========
console.log("5. Diff 算法演示\n");
console.log(`
  Reconciliation 策略 (O(n) 复杂度):
  ┌──────────────────────────────────────────────┐
  │ 1. 同层比较: 只比较同一层级的节点             │
  │ 2. 类型比较:                                  │
  │    • 类型相同 → UPDATE (复用 DOM, 更新属性)   │
  │    • 类型不同 → DELETION + PLACEMENT          │
  │ 3. key 优化: 通过 key 识别移动的节点          │
  └──────────────────────────────────────────────┘

  示例:
    旧: <ul> <li>A</li> <li>B</li> </ul>
    新: <ul> <li>A</li> <li>C</li> <li>B</li> </ul>

    Diff:
      li[0] A = A → UPDATE (不变)
      li[1] B ≠ C → UPDATE (B→C)
      li[2] _ ≠ B → PLACEMENT (新增 B)
`);

// ========== 6. 合成事件 ==========
console.log("6. 合成事件系统\n");

const { EventDelegator } = MiniReact;
const delegator = new EventDelegator(container);

// 模拟 DOM 层级
const buttonDom = {
  _type: "button",
  _parent: { _type: "div", _parent: container },
};

let clickCount = 0;
delegator.bindEvent(buttonDom, "click", (e) => {
  clickCount++;
  console.log(`  ✅ 按钮点击! (第 ${clickCount} 次, target: ${e.target._type})`);
});

delegator.bindEvent(buttonDom._parent, "click", (e) => {
  console.log(`  ✅ 事件冒泡到父元素 div`);
});

// 触发点击
delegator.dispatch(buttonDom, "click");
delegator.dispatch(buttonDom, "click");

console.log(`
  合成事件特点:
  • 根节点代理 (减少内存)
  • 冒泡机制 (从 target 向上)
  • stopPropagation() 阻止冒泡
  • SyntheticEvent 跨浏览器统一
`);

// ========== 7. Fiber 遍历顺序 ==========
console.log("7. Fiber 遍历顺序\n");
console.log(`
  Fiber 链表 (child / sibling / return):

       App
       │ child
       ▼
      div ──sibling──▸ null
       │ child
       ▼
      h1 ──sibling──▸ ul ──sibling──▸ p
       │ child           │ child
       ▼                 ▼
     "Hello"           li ──sibling──▸ li ──sibling──▸ li

  DFS 遍历: App → div → h1 → "Hello" → ul → li → li → li → p

  每个节点都是一个工作单元 (Unit of Work)
  可以在任意节点暂停，让出主线程！
`);

console.log("=== Mini React 演示完成 ===");
