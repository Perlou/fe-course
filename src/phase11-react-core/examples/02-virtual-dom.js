// 虚拟 DOM 与 Diff 算法详解
// 运行: node 02-virtual-dom.js

console.log("=== 虚拟 DOM 与 Diff 算法 ===\n");

// ========== 1. 虚拟 DOM 创建 ==========
console.log("1. 虚拟 DOM 结构");

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children
        .flat()
        .map((child) =>
          typeof child === "object" && child !== null
            ? child
            : { type: "TEXT", props: { nodeValue: String(child), children: [] } }
        ),
    },
  };
}

// 创建虚拟 DOM 树
const vdom = createElement(
  "div",
  { id: "app", className: "container" },
  createElement("h1", { style: "color:blue" }, "Hello VDOM"),
  createElement(
    "ul",
    null,
    createElement("li", { key: "a" }, "Apple"),
    createElement("li", { key: "b" }, "Banana"),
    createElement("li", { key: "c" }, "Cherry")
  ),
  createElement("p", null, "Count: ", 42)
);

console.log("  虚拟 DOM 树:");
console.log(JSON.stringify(vdom, null, 2).substring(0, 500) + "...\n");

// ========== 2. 渲染虚拟 DOM 为真实 DOM (模拟) ==========
console.log("2. 虚拟 DOM → 真实 DOM");

// 模拟 DOM 节点
class MockDOM {
  constructor(tagName) {
    this.tagName = tagName;
    this.attributes = {};
    this.children = [];
    this.textContent = "";
    this.parentNode = null;
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  removeAttribute(name) {
    delete this.attributes[name];
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx >= 0) this.children.splice(idx, 1);
  }

  insertBefore(newChild, refChild) {
    const idx = this.children.indexOf(refChild);
    if (idx >= 0) {
      newChild.parentNode = this;
      this.children.splice(idx, 0, newChild);
    }
  }

  toString(indent = 0) {
    const pad = " ".repeat(indent);
    if (this.tagName === "#text") {
      return `${pad}"${this.textContent}"`;
    }
    const attrs = Object.entries(this.attributes)
      .map(([k, v]) => ` ${k}="${v}"`)
      .join("");
    const childStr = this.children.map((c) => c.toString(indent + 2)).join("\n");
    if (childStr) {
      return `${pad}<${this.tagName}${attrs}>\n${childStr}\n${pad}</${this.tagName}>`;
    }
    return `${pad}<${this.tagName}${attrs} />`;
  }
}

function createTextNode(text) {
  const node = new MockDOM("#text");
  node.textContent = text;
  return node;
}

function createDOMElement(tagName) {
  return new MockDOM(tagName);
}

// 渲染函数
function render(vnode, container) {
  let dom;

  if (vnode.type === "TEXT") {
    dom = createTextNode(vnode.props.nodeValue);
  } else {
    dom = createDOMElement(vnode.type);

    // 设置属性
    Object.entries(vnode.props)
      .filter(([key]) => key !== "children" && key !== "key")
      .forEach(([name, value]) => {
        if (name.startsWith("on")) {
          // 事件处理 (模拟)
          dom.attributes[name.toLowerCase()] = "[Function]";
        } else {
          dom.setAttribute(name, value);
        }
      });

    // 递归渲染子节点
    vnode.props.children.forEach((child) => {
      render(child, dom);
    });
  }

  container.appendChild(dom);
  return dom;
}

const root = createDOMElement("body");
render(vdom, root);
console.log("  渲染结果:");
console.log(root.toString(4));

// ========== 3. Diff 算法 ==========
console.log("\n\n3. Diff 算法");

console.log(`
  React Diff 三大策略:
  ┌─────────────────────────────────────────────────────────────┐
  │                                                             │
  │  策略一: Tree Diff (树级别)                                  │
  │    只比较同层节点，不跨层比较                                 │
  │    复杂度从 O(n³) 降到 O(n)                                  │
  │                                                             │
  │  策略二: Component Diff (组件级别)                            │
  │    相同类型组件 → 继续比较子树                                │
  │    不同类型组件 → 直接替换整个子树                            │
  │                                                             │
  │  策略三: Element Diff (元素级别)                              │
  │    通过 key 标识可复用的节点                                  │
  │    支持: 插入、移动、删除 三种操作                            │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘
`);

// ========== 4. 简化版 Diff 实现 ==========
console.log("4. 简化版 Diff 实现");

function diff(oldVNode, newVNode) {
  const patches = [];

  diffNode(oldVNode, newVNode, patches, []);

  return patches;
}

function diffNode(oldNode, newNode, patches, path) {
  // Case 1: 新节点不存在 → 删除
  if (!newNode) {
    patches.push({
      type: "REMOVE",
      path: [...path],
    });
    return;
  }

  // Case 2: 旧节点不存在 → 新增
  if (!oldNode) {
    patches.push({
      type: "ADD",
      path: [...path],
      node: newNode,
    });
    return;
  }

  // Case 3: 类型不同 → 替换
  if (oldNode.type !== newNode.type) {
    patches.push({
      type: "REPLACE",
      path: [...path],
      node: newNode,
    });
    return;
  }

  // Case 4: 文本节点
  if (oldNode.type === "TEXT") {
    if (oldNode.props.nodeValue !== newNode.props.nodeValue) {
      patches.push({
        type: "TEXT",
        path: [...path],
        value: newNode.props.nodeValue,
      });
    }
    return;
  }

  // Case 5: 同类型元素 → 比较属性
  const propPatches = diffProps(oldNode.props, newNode.props);
  if (propPatches.length > 0) {
    patches.push({
      type: "PROPS",
      path: [...path],
      props: propPatches,
    });
  }

  // Case 6: 比较子节点
  diffChildren(
    oldNode.props.children,
    newNode.props.children,
    patches,
    path
  );
}

function diffProps(oldProps, newProps) {
  const changes = [];

  // 查找修改和新增的属性
  Object.keys(newProps)
    .filter((k) => k !== "children" && k !== "key")
    .forEach((key) => {
      if (oldProps[key] !== newProps[key]) {
        changes.push({ key, value: newProps[key], action: "SET" });
      }
    });

  // 查找删除的属性
  Object.keys(oldProps)
    .filter((k) => k !== "children" && k !== "key")
    .forEach((key) => {
      if (!(key in newProps)) {
        changes.push({ key, action: "REMOVE" });
      }
    });

  return changes;
}

function diffChildren(oldChildren, newChildren, patches, path) {
  const maxLen = Math.max(oldChildren.length, newChildren.length);
  for (let i = 0; i < maxLen; i++) {
    diffNode(oldChildren[i], newChildren[i], patches, [...path, i]);
  }
}

// ========== 5. Diff 演示 ==========
console.log("5. Diff 演示");

const oldTree = createElement(
  "div",
  { className: "app" },
  createElement("h1", { style: "color:blue" }, "Hello"),
  createElement(
    "ul",
    null,
    createElement("li", null, "Apple"),
    createElement("li", null, "Banana")
  )
);

const newTree = createElement(
  "div",
  { className: "app", id: "root" }, // 新增 id
  createElement("h1", { style: "color:red" }, "Hello World"), // 修改 style 和文本
  createElement(
    "ul",
    null,
    createElement("li", null, "Apple"),
    createElement("li", null, "Cherry"), // Banana → Cherry
    createElement("li", null, "Date") // 新增
  )
);

const patches = diff(oldTree, newTree);

console.log("  旧树: <div class=app><h1 color:blue>Hello</h1><ul><li>Apple</li><li>Banana</li></ul></div>");
console.log("  新树: <div class=app id=root><h1 color:red>Hello World</h1><ul><li>Apple</li><li>Cherry</li><li>Date</li></ul></div>");
console.log("\n  Diff 结果 (补丁):");
patches.forEach((p, i) => {
  const pathStr = `[${p.path.join(" → ")}]`;
  switch (p.type) {
    case "PROPS":
      console.log(
        `  ${i + 1}. PROPS ${pathStr}: ${p.props.map((pp) => `${pp.action} ${pp.key}=${pp.value}`).join(", ")}`
      );
      break;
    case "TEXT":
      console.log(`  ${i + 1}. TEXT  ${pathStr}: → "${p.value}"`);
      break;
    case "ADD":
      console.log(`  ${i + 1}. ADD   ${pathStr}: <${p.node.type}>`);
      break;
    case "REMOVE":
      console.log(`  ${i + 1}. REMOVE ${pathStr}`);
      break;
    case "REPLACE":
      console.log(`  ${i + 1}. REPLACE ${pathStr}: → <${p.node.type}>`);
      break;
  }
});

// ========== 6. Key 的作用 ==========
console.log("\n6. Key 的重要性");

console.log(`
  没有 Key (低效):
  旧: [A, B, C]
  新: [D, A, B, C]

  Diff: A→D(替换), B→A(替换), C→B(替换), 新增C
  操作: 4 次 DOM 操作 😞

  有 Key (高效):
  旧: [A(key:a), B(key:b), C(key:c)]
  新: [D(key:d), A(key:a), B(key:b), C(key:c)]

  Diff: 通过 key 发现 A,B,C 可复用，只需在前面插入 D
  操作: 1 次 DOM 操作 🎉

  Key 选择原则:
  ✅ 使用唯一且稳定的 ID (如数据库 ID)
  ❌ 不要用数组 index (顺序变化时会出错)
  ❌ 不要用 Math.random() (每次都不一样)
`);

// ========== 7. 虚拟 DOM 的优缺点 ==========
console.log("7. 虚拟 DOM 优缺点");

console.log(`
  优势:
  ┌─────────────────────────────────────────────────────────────┐
  │  1. 减少不必要的 DOM 操作 (Diff + 批量更新)                  │
  │  2. 跨平台渲染 (React Native, SSR)                          │
  │  3. 声明式编程 (描述 UI 状态而非手动操作 DOM)                 │
  │  4. 方便实现时间旅行调试                                     │
  └─────────────────────────────────────────────────────────────┘

  劣势:
  ┌─────────────────────────────────────────────────────────────┐
  │  1. 首次渲染比直接操作 DOM 慢 (额外创建 VDOM 对象)           │
  │  2. 内存占用更大 (需要维护 VDOM 树)                          │
  │  3. 简单场景下可能是过度设计                                  │
  │  4. Diff 算法本身也有性能开销                                 │
  └─────────────────────────────────────────────────────────────┘

  结论: Virtual DOM 并非"更快"，而是在大型应用中提供了
        可预测的性能（性能下限有保障）和更好的开发体验
`);

console.log("=== 虚拟 DOM 完成 ===");
