// 样式隔离方案详解
// 运行: node 02-css-isolation.js

console.log("=== 样式隔离方案 ===\n");

// ========== 1. CSS 命名空间 ==========
console.log("1. CSS 命名空间隔离\n");

class CSSNamespace {
  constructor(appName) {
    this.prefix = appName;
  }

  // 自动添加前缀
  transform(css) {
    // 简单实现: 给每个选择器添加前缀
    return css.replace(/([.#])([\w-]+)/g, (match, symbol, name) => {
      return `${symbol}${this.prefix}__${name}`;
    });
  }
}

const ns = new CSSNamespace("react-app");
const originalCSS = `.button { color: red; } .header .title { font-size: 20px; }`;
const scopedCSS = ns.transform(originalCSS);

console.log(`  原始 CSS: ${originalCSS}`);
console.log(`  隔离 CSS: ${scopedCSS}\n`);

// ========== 2. CSS Modules 模拟 ==========
console.log("2. CSS Modules 模拟\n");

class CSSModules {
  constructor() {
    this.cache = new Map();
  }

  // 模拟编译时 hash 生成
  generateHash(content) {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      hash = ((hash << 5) - hash + content.charCodeAt(i)) | 0;
    }
    return Math.abs(hash).toString(36).slice(0, 5);
  }

  // 编译 CSS Module
  compile(filename, css) {
    const classMap = {};

    // 提取类名并生成 hash
    const transformed = css.replace(/\.([a-zA-Z][\w-]*)/g, (match, className) => {
      const hash = this.generateHash(filename + className);
      const scopedName = `${className}_${hash}`;
      classMap[className] = scopedName;
      return `.${scopedName}`;
    });

    this.cache.set(filename, { classMap, css: transformed });
    return classMap;
  }
}

const cssModules = new CSSModules();

// 两个不同组件的 .button 不会冲突
const styles1 = cssModules.compile("Button.module.css",
  `.button { background: blue; } .button:hover { background: darkblue; }`
);
const styles2 = cssModules.compile("Card.module.css",
  `.button { background: green; } .card { border: 1px solid; }`
);

console.log("  Button.module.css:");
console.log(`    .button → .${styles1.button}`);
console.log("  Card.module.css:");
console.log(`    .button → .${styles2.button}`);
console.log(`    .card   → .${styles2.card}`);
console.log(`  冲突检查: ${styles1.button !== styles2.button ? "✅ 不冲突" : "❌ 冲突!"}\n`);

// ========== 3. Shadow DOM ==========
console.log("3. Shadow DOM 隔离\n");

// 模拟 Shadow DOM 的样式隔离
class ShadowDOMSimulator {
  constructor(hostId) {
    this.hostId = hostId;
    this.shadowStyles = [];
    this.childNodes = [];
  }

  // 添加样式 (仅在 shadow 内生效)
  addStyle(css) {
    this.shadowStyles.push(css);
  }

  // 添加内容
  addChild(tag, content) {
    this.childNodes.push({ tag, content });
  }

  render() {
    console.log(`  <div id="${this.hostId}">`);
    console.log(`    #shadow-root (open)`);
    this.shadowStyles.forEach((css) => {
      console.log(`      <style>${css}</style>`);
    });
    this.childNodes.forEach((node) => {
      console.log(`      <${node.tag}>${node.content}</${node.tag}>`);
    });
    console.log(`  </div>`);
  }
}

const shadow1 = new ShadowDOMSimulator("react-app");
shadow1.addStyle("p { color: red; font-size: 20px; }");
shadow1.addChild("p", "React App Content");
shadow1.render();

console.log();

const shadow2 = new ShadowDOMSimulator("vue-app");
shadow2.addStyle("p { color: blue; font-size: 14px; }");
shadow2.addChild("p", "Vue App Content");
shadow2.render();

console.log("  两个 shadow 的 p 标签样式互不影响 ✅\n");

// ========== 4. 动态样式管理 ==========
console.log("4. 动态样式管理 (子应用加载/卸载)\n");

class StyleManager {
  constructor() {
    this.appStyles = new Map();
  }

  // 子应用挂载时加载样式
  mount(appName, styles) {
    this.appStyles.set(appName, {
      styles,
      active: true,
    });
    console.log(`  [mount] ${appName}: 加载 ${styles.length} 条样式规则`);
  }

  // 子应用卸载时移除样式
  unmount(appName) {
    const entry = this.appStyles.get(appName);
    if (entry) {
      entry.active = false;
      console.log(`  [unmount] ${appName}: 移除样式`);
    }
  }

  // 获取当前活跃样式
  getActiveStyles() {
    const active = [];
    for (const [name, entry] of this.appStyles) {
      if (entry.active) active.push(name);
    }
    return active;
  }
}

const styleManager = new StyleManager();
styleManager.mount("react-app", [".button { color: blue; }", ".header { height: 60px; }"]);
styleManager.mount("vue-app", [".button { color: green; }", ".sidebar { width: 200px; }"]);
console.log(`  活跃样式: [${styleManager.getActiveStyles().join(", ")}]`);

styleManager.unmount("react-app");
console.log(`  活跃样式: [${styleManager.getActiveStyles().join(", ")}]`);

// ========== 5. 方案对比 ==========
console.log("\n5. 样式隔离方案对比\n");
console.log(`
  ┌──────────────────┬────────────────────┬──────────────────┐
  │ 方案              │ 隔离程度            │ 适用场景         │
  ├──────────────────┼────────────────────┼──────────────────┤
  │ 命名空间前缀     │ ⭐⭐               │ 简单项目         │
  │ CSS Modules      │ ⭐⭐⭐             │ 组件级隔离       │
  │ CSS-in-JS        │ ⭐⭐⭐             │ 运行时动态       │
  │ Shadow DOM       │ ⭐⭐⭐⭐⭐         │ Web Components   │
  │ 动态加载/卸载    │ ⭐⭐⭐⭐           │ 微前端子应用     │
  └──────────────────┴────────────────────┴──────────────────┘

  qiankun 样式隔离:
  • strictStyleIsolation: true  → Shadow DOM
  • experimentalStyleIsolation: true → 动态前缀
`);

console.log("=== 样式隔离完成 ===");
