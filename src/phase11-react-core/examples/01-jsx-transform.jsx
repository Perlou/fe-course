// JSX 编译原理详解
// 运行: node 01-jsx-transform.jsx
// 本文件展示 JSX 如何被编译为 JavaScript 函数调用

console.log("=== JSX 编译原理 ===\n");

// ========== 1. JSX → createElement ==========
console.log("1. JSX 编译过程");

console.log(`
  JSX 本质: 语法糖，编译为函数调用

  ┌─────────────────────────────────────────────────────────────┐
  │  JSX 语法              →   编译后的 JavaScript              │
  ├─────────────────────────────────────────────────────────────┤
  │                                                             │
  │  <div>Hello</div>      →   createElement('div', null,       │
  │                             'Hello')                        │
  │                                                             │
  │  <App name="test" />   →   createElement(App,               │
  │                             { name: 'test' })               │
  │                                                             │
  │  <div className="a">   →   createElement('div',             │
  │    <span>1</span>           { className: 'a' },             │
  │    <span>2</span>           createElement('span', null, '1'),│
  │  </div>                     createElement('span', null, '2'))│
  │                                                             │
  └─────────────────────────────────────────────────────────────┘

  React 17+ 新转换 (自动导入 jsx-runtime):
  import { jsx as _jsx } from 'react/jsx-runtime';
  _jsx('div', { children: 'Hello' });
`);

// ========== 2. 实现 createElement ==========
console.log("2. 实现 createElement");

function createElement(type, props, ...children) {
  return {
    $$typeof: Symbol.for("react.element"), // React 元素标识
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" && child !== null
          ? child
          : createTextElement(child)
      ),
    },
    key: props?.key || null,
    ref: props?.ref || null,
  };
}

function createTextElement(text) {
  return {
    $$typeof: Symbol.for("react.element"),
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
    key: null,
    ref: null,
  };
}

// 模拟 JSX 编译结果
const element = createElement(
  "div",
  { className: "container", id: "app" },
  createElement("h1", null, "Hello React!"),
  createElement(
    "p",
    { style: { color: "blue" } },
    "This is ",
    createElement("strong", null, "JSX")
  ),
  createElement("ul", null,
    createElement("li", { key: "1" }, "Item 1"),
    createElement("li", { key: "2" }, "Item 2"),
    createElement("li", { key: "3" }, "Item 3")
  )
);

console.log("  createElement 输出的虚拟 DOM:");
console.log(JSON.stringify(element, (key, value) => {
  if (typeof value === "symbol") return value.toString();
  return value;
}, 2).substring(0, 600) + "...\n");

// ========== 3. 函数组件 ==========
console.log("3. 函数组件的 JSX");

console.log(`
  // 函数组件
  function Button({ text, onClick }) {
    return <button onClick={onClick}>{text}</button>;
  }

  // 编译结果
  function Button({ text, onClick }) {
    return createElement('button', { onClick }, text);
  }

  // 使用组件
  <Button text="Click me" onClick={handleClick} />
  // 编译为:
  createElement(Button, { text: 'Click me', onClick: handleClick });

  // 注意: 原生标签 type 是字符串 'div'
  //       组件标签 type 是函数引用 Button
`);

// 模拟函数组件
function Greeting({ name }) {
  return createElement("div", { className: "greeting" },
    createElement("h2", null, `Hello, ${name}!`),
    createElement("p", null, "Welcome to React")
  );
}

// 函数组件的 createElement
const componentElement = createElement(Greeting, { name: "World" });

console.log("  函数组件元素:");
console.log("  type:", componentElement.type.name); // Greeting
console.log("  props:", componentElement.props);

// 调用函数组件得到虚拟 DOM
const renderedElement = componentElement.type(componentElement.props);
console.log("  渲染结果:", JSON.stringify(renderedElement, (k, v) =>
  typeof v === "symbol" ? v.toString() : v
).substring(0, 200) + "...\n");

// ========== 4. JSX 表达式 ==========
console.log("4. JSX 中的表达式");

console.log(`
  // 条件渲染
  <div>
    {isLoggedIn && <UserPanel />}
    {isLoggedIn ? <Logout /> : <Login />}
  </div>

  // 编译为:
  createElement('div', null,
    isLoggedIn && createElement(UserPanel, null),
    isLoggedIn
      ? createElement(Logout, null)
      : createElement(Login, null)
  );

  // 列表渲染
  <ul>
    {items.map(item => <li key={item.id}>{item.name}</li>)}
  </ul>

  // 编译为:
  createElement('ul', null,
    items.map(item =>
      createElement('li', { key: item.id }, item.name)
    )
  );
`);

// ========== 5. Fragment ==========
console.log("5. Fragment");

console.log(`
  // Fragment 语法
  <>
    <p>Line 1</p>
    <p>Line 2</p>
  </>

  // 编译为:
  createElement(Fragment, null,
    createElement('p', null, 'Line 1'),
    createElement('p', null, 'Line 2')
  );

  // Fragment 实现: 只渲染 children，不创建 DOM 节点
  const Fragment = Symbol.for('react.fragment');
`);

// ========== 6. JSX 类型检查 ==========
console.log("6. JSX 属性映射");

console.log(`
  JSX 属性 → DOM 属性映射:
  ┌───────────────────┬───────────────────┬──────────────────────┐
  │ JSX 属性           │ DOM 属性           │ 说明                 │
  ├───────────────────┼───────────────────┼──────────────────────┤
  │ className         │ class             │ class 是保留字         │
  │ htmlFor           │ for               │ for 是保留字           │
  │ onClick           │ addEventListener  │ 事件委托到 root        │
  │ onChange          │ oninput + change  │ React 重新实现         │
  │ style={{ ... }}   │ element.style     │ 对象而非字符串         │
  │ dangerouslySet... │ innerHTML         │ 需显式标记不安全       │
  │ key               │ 不映射             │ React 内部使用        │
  │ ref               │ 不映射             │ 获取 DOM 引用         │
  └───────────────────┴───────────────────┴──────────────────────┘
`);

// ========== 7. 编译配置 ==========
console.log("7. JSX 编译配置");

console.log(`
  // babel.config.js (经典模式)
  {
    presets: [
      ['@babel/preset-react', {
        runtime: 'classic',    // 需要 import React
        pragma: 'createElement' // 自定义函数名
      }]
    ]
  }

  // babel.config.js (自动导入模式，React 17+)
  {
    presets: [
      ['@babel/preset-react', {
        runtime: 'automatic'   // 自动从 react/jsx-runtime 导入
      }]
    ]
  }

  // tsconfig.json (TypeScript)
  {
    "compilerOptions": {
      "jsx": "react-jsx",        // 新转换 (React 17+)
      // "jsx": "react",          // 经典转换
      // "jsxFactory": "h",       // Preact 等自定义
    }
  }
`);

console.log("=== JSX 编译原理完成 ===");
