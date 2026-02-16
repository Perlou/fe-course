// Vue 3 编译器原理详解
// 运行: node 02-compiler.js

console.log("=== Vue 3 编译器原理 ===\n");

// ========== 1. 编译流程 ==========
console.log("1. 编译流程概览");
console.log(`
  Template  ──→  Parse  ──→  AST  ──→  Transform  ──→  AST'  ──→  Generate  ──→  Render Fn

  <div id="app">        {type:'Element',      优化标记 PatchFlag    function render(ctx){
    <p>{{ msg }}</p>  →   tag:'div',         ──────────────→         return h('div',
  </div>                  children:[...]}                               {id:'app'},
                                                                       h('p', null,
                                                                         toDisplayString(
                                                                           ctx.msg)))
                                                                    }
`);

// ========== 2. Parse: 模板解析 ==========
console.log("2. Parse: 模板 → AST");

// AST 节点类型
const NodeTypes = {
  ROOT: "Root",
  ELEMENT: "Element",
  TEXT: "Text",
  INTERPOLATION: "Interpolation", // {{ }}
  EXPRESSION: "Expression",
  ATTRIBUTE: "Attribute",
  DIRECTIVE: "Directive", // v-if, v-for, @click 等
};

function parse(template) {
  const context = {
    source: template.trim(),
    advance(num) {
      this.source = this.source.slice(num);
    },
    advanceSpaces() {
      const match = /^[\s\r\n]+/.exec(this.source);
      if (match) this.advance(match[0].length);
    },
  };

  const children = parseChildren(context);
  return { type: NodeTypes.ROOT, children };
}

function parseChildren(context) {
  const nodes = [];

  while (context.source.length > 0) {
    let node;
    const s = context.source;

    if (s.startsWith("{{")) {
      node = parseInterpolation(context);
    } else if (s[0] === "<") {
      if (s[1] === "/") break; // 闭合标签，退出
      node = parseElement(context);
    } else {
      node = parseText(context);
    }

    if (node) nodes.push(node);
  }

  return nodes;
}

function parseInterpolation(context) {
  context.advance(2); // 跳过 {{
  const closeIndex = context.source.indexOf("}}");
  const content = context.source.slice(0, closeIndex).trim();
  context.advance(closeIndex + 2); // 跳过内容和 }}

  return {
    type: NodeTypes.INTERPOLATION,
    content: { type: NodeTypes.EXPRESSION, content },
  };
}

function parseElement(context) {
  // 解析开始标签
  const match = /^<([a-z][a-z0-9]*)/i.exec(context.source);
  const tag = match[1];
  context.advance(match[0].length);

  // 解析属性
  const props = parseAttributes(context);

  // 跳过 > 或 />
  const isSelfClosing = context.source.startsWith("/>");
  context.advance(isSelfClosing ? 2 : 1);

  if (isSelfClosing) {
    return { type: NodeTypes.ELEMENT, tag, props, children: [] };
  }

  // 解析子节点
  const children = parseChildren(context);

  // 跳过闭合标签
  const endMatch = new RegExp(`^</${tag}\\s*>`).exec(context.source);
  if (endMatch) context.advance(endMatch[0].length);

  return { type: NodeTypes.ELEMENT, tag, props, children };
}

function parseAttributes(context) {
  const props = [];
  context.advanceSpaces();

  while (context.source.length > 0 && !context.source.startsWith(">") && !context.source.startsWith("/>")) {
    // 指令: v-xxx, @xxx, :xxx
    const dirMatch = /^(v-[a-z]+|@[a-z]+|:[a-z]+)="([^"]*)"/.exec(context.source);
    if (dirMatch) {
      props.push({
        type: NodeTypes.DIRECTIVE,
        name: dirMatch[1],
        value: dirMatch[2],
      });
      context.advance(dirMatch[0].length);
    } else {
      // 普通属性
      const attrMatch = /^([a-z-]+)(?:="([^"]*)")?/.exec(context.source);
      if (attrMatch) {
        props.push({
          type: NodeTypes.ATTRIBUTE,
          name: attrMatch[1],
          value: attrMatch[2] || true,
        });
        context.advance(attrMatch[0].length);
      }
    }
    context.advanceSpaces();
  }

  return props;
}

function parseText(context) {
  const endTokens = ["<", "{{"];
  let endIndex = context.source.length;

  for (const token of endTokens) {
    const idx = context.source.indexOf(token);
    if (idx !== -1 && idx < endIndex) endIndex = idx;
  }

  const content = context.source.slice(0, endIndex);
  context.advance(endIndex);

  return { type: NodeTypes.TEXT, content };
}

// 测试解析
const template1 = `<div id="app" class="container"><h1>Hello</h1><p>{{ message }}</p></div>`;
const ast1 = parse(template1);

console.log("  模板:", template1);
console.log("  AST:");
console.log(JSON.stringify(ast1, null, 2).substring(0, 600) + "...\n");

// ========== 3. 模板指令解析 ==========
console.log("3. 指令解析");

const template2 = `<button @click="handleClick" :class="btnClass" v-if="show">{{ text }}</button>`;
const ast2 = parse(template2);

console.log("  模板:", template2);
console.log("  Props:");
ast2.children[0].props.forEach((p) => {
  console.log(`    ${p.type}: ${p.name} = "${p.value}"`);
});

// ========== 4. Generate: 代码生成 ==========
console.log("\n4. Generate: AST → 渲染函数");

function generate(ast) {
  const code = genNode(ast);
  return `function render(_ctx) {\n  return ${code}\n}`;
}

function genNode(node) {
  switch (node.type) {
    case NodeTypes.ROOT:
      return node.children.map(genNode).join("");

    case NodeTypes.ELEMENT: {
      const tag = `"${node.tag}"`;
      const props = genProps(node.props);
      const children = node.children.length === 1
        ? genNode(node.children[0])
        : `[${node.children.map(genNode).join(", ")}]`;
      return `h(${tag}, ${props}, ${children})`;
    }

    case NodeTypes.TEXT:
      return `"${node.content}"`;

    case NodeTypes.INTERPOLATION:
      return `toDisplayString(_ctx.${node.content.content})`;

    default:
      return '""';
  }
}

function genProps(props) {
  if (!props || props.length === 0) return "null";

  const items = props.map((p) => {
    if (p.type === NodeTypes.DIRECTIVE) {
      if (p.name.startsWith("@")) {
        return `on${p.name[1].toUpperCase() + p.name.slice(2)}: _ctx.${p.value}`;
      }
      if (p.name.startsWith(":")) {
        return `${p.name.slice(1)}: _ctx.${p.value}`;
      }
    }
    return `${p.name}: "${p.value}"`;
  });

  return `{ ${items.join(", ")} }`;
}

const renderFn1 = generate(ast1);
console.log("  生成的渲染函数:");
console.log("  " + renderFn1.split("\n").join("\n  "));

// ========== 5. PatchFlag 优化 ==========
console.log("\n5. PatchFlag 编译优化");
console.log(`
  Vue 3 编译器为动态节点添加 PatchFlag:

  <div>                        → 静态节点，不需要 Diff
    <p>静态文本</p>             → 静态节点
    <p>{{ dynamic }}</p>        → PatchFlag: TEXT (1)
    <p :class="cls">text</p>   → PatchFlag: CLASS (2)
    <p :style="stl">text</p>   → PatchFlag: STYLE (4)
    <p :id="id">{{ msg }}</p>  → PatchFlag: PROPS | TEXT (9)
  </div>

  PatchFlag 枚举:
  ┌─────────────┬───────┬──────────────────────────┐
  │ Flag        │ 值    │ 含义                      │
  ├─────────────┼───────┼──────────────────────────┤
  │ TEXT        │ 1     │ 动态文本                  │
  │ CLASS       │ 2     │ 动态 class               │
  │ STYLE       │ 4     │ 动态 style               │
  │ PROPS       │ 8     │ 动态非 class/style 属性   │
  │ FULL_PROPS  │ 16    │ 有动态 key 的属性         │
  │ NEED_PATCH  │ 32    │ 有 ref/指令              │
  │ KEYED       │ 128   │ 有 key 的 Fragment       │
  └─────────────┴───────┴──────────────────────────┘

  Block Tree: 只追踪动态节点，跳过静态子树 Diff
`);

// ========== 6. 静态提升 ==========
console.log("6. 静态提升 (Static Hoisting)");
console.log(`
  编译前 (每次 render 都创建):
  function render() {
    return h('div', null, [
      h('p', null, '静态内容'),        // 每次重新创建
      h('p', null, ctx.dynamic),       // 动态
    ]);
  }

  编译后 (静态节点提升到外部):
  const _hoisted_1 = h('p', null, '静态内容');  // 只创建一次!

  function render() {
    return h('div', null, [
      _hoisted_1,                       // 复用
      h('p', null, ctx.dynamic),        // 只 Diff 动态部分
    ]);
  }

  优化效果:
  • 减少 VNode 创建开销
  • 减少 Diff 比较范围
  • 减少内存分配
`);

console.log("=== 编译器原理完成 ===");
