# DOM/BOM 深入解析

## 📌 一、DOM 是什么？

```
DOM = Document Object Model（文档对象模型）

HTML 文档被解析成一棵树形结构，每个节点都是一个对象
```

```
                    document
                        │
                      <html>
                    ┌───┴───┐
                 <head>   <body>
                    │        │
              ┌────┴────┐   ├── <header>
           <meta> <title>   │
                            ├── <main>
                            │    ├── <article>
                            │    └── <aside>
                            │
                            └── <footer>
```

---

## 📌 二、DOM 查询

### 1. 获取单个元素

```javascript
// 通过 ID（最快）
const element = document.getElementById("myId");

// 通过选择器（返回第一个匹配）
const element = document.querySelector(".myClass");
const element = document.querySelector("#id .class > div");

// 其他方法
const element = document.querySelector('[data-id="123"]');
```

### 2. 获取多个元素

```javascript
// 返回 NodeList（静态）
const elements = document.querySelectorAll(".item");

// 返回 HTMLCollection（动态）
const elements = document.getElementsByClassName("item");
const elements = document.getElementsByTagName("div");

// 遍历
elements.forEach((el) => console.log(el));
// 或
Array.from(elements).map((el) => el.textContent);
```

### 3. 遍历 DOM

```javascript
// 父节点
element.parentNode; // 父节点（可能是非元素节点）
element.parentElement; // 父元素节点

// 子节点
element.childNodes; // 所有子节点（包含文本节点）
element.children; // 子元素节点
element.firstChild; // 第一个子节点
element.firstElementChild; // 第一个子元素
element.lastChild;
element.lastElementChild;

// 兄弟节点
element.previousSibling; // 上一个节点
element.previousElementSibling; // 上一个元素
element.nextSibling;
element.nextElementSibling;

// 最近祖先
element.closest(".container"); // 向上查找匹配的祖先
```

### 4. DOM 遍历图解

```
                parentElement
                     ↑
previousElementSibling ← [element] → nextElementSibling
                     ↓
   firstElementChild ... children ... lastElementChild
```

---

## 📌 三、DOM 操作

### 1. 创建节点

```javascript
// 创建元素
const div = document.createElement("div");
const span = document.createElement("span");

// 创建文本节点
const text = document.createTextNode("Hello");

// 创建文档片段（批量操作性能优化）
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
  const li = document.createElement("li");
  li.textContent = `Item ${i}`;
  fragment.appendChild(li);
}
ul.appendChild(fragment); // 一次性插入
```

### 2. 插入节点

```javascript
// appendChild: 追加到末尾
parent.appendChild(child);

// insertBefore: 插入到参考节点之前
parent.insertBefore(newNode, referenceNode);

// append/prepend: 可插入多个节点或文本
parent.append(node1, node2, "text");
parent.prepend(node);

// before/after: 在元素前后插入
element.before(newNode);
element.after(newNode);

// insertAdjacentHTML: 插入 HTML 字符串
element.insertAdjacentHTML("beforebegin", "<div>Before</div>");
element.insertAdjacentHTML("afterbegin", "<div>First child</div>");
element.insertAdjacentHTML("beforeend", "<div>Last child</div>");
element.insertAdjacentHTML("afterend", "<div>After</div>");

/*
insertAdjacentHTML 位置:
    <!-- beforebegin -->
    <element>
        <!-- afterbegin -->
        内容
        <!-- beforeend -->
    </element>
    <!-- afterend -->
*/
```

### 3. 删除/替换节点

```javascript
// 删除节点
parent.removeChild(child); // 旧方法
element.remove(); // 新方法

// 替换节点
parent.replaceChild(newChild, oldChild); // 旧方法
oldElement.replaceWith(newElement); // 新方法

// 克隆节点
const clone = element.cloneNode(true); // true: 深克隆
const clone = element.cloneNode(false); // false: 浅克隆
```

### 4. 修改内容与属性

```javascript
// 文本内容（安全，推荐）
element.textContent = "Hello";

// HTML 内容（注意 XSS）
element.innerHTML = "<b>Bold</b>";

// 属性操作
element.getAttribute("data-id");
element.setAttribute("data-id", "123");
element.removeAttribute("data-id");
element.hasAttribute("data-id");

// data-* 属性
element.dataset.id; // 获取 data-id
element.dataset.userName; // 获取 data-user-name（驼峰）

// 类名操作
element.className = "class1 class2";
element.classList.add("active");
element.classList.remove("active");
element.classList.toggle("active");
element.classList.contains("active");
element.classList.replace("old", "new");

// 样式操作
element.style.color = "red";
element.style.backgroundColor = "blue"; // 驼峰
element.style.cssText = "color: red; font-size: 16px;";

// 获取计算样式
const styles = getComputedStyle(element);
styles.width; // "100px"
```

---

## 📌 四、事件机制

### 1. 事件流

```
事件流三个阶段:

         ┌─────────────────────────────────────┐
         │              window                 │
         │  ┌─────────────────────────────┐    │
         │  │           document          │    │
         │  │  ┌─────────────────────┐    │    │
         │  │  │        html         │    │    │
         │  │  │  ┌───────────────┐  │    │    │
         │  │  │  │     body      │  │    │    │
         │  │  │  │  ┌─────────┐  │  │    │    │
         │  │  │  │  │  div    │  │  │    │    │
         │  │  │  │  │ [目标]  │  │  │    │    │
    捕获 │  │  │  │  └────┬────┘  │  │    │    │ 冒泡
    阶段 ↓  ↓  ↓  ↓       │       ↑  ↑    ↑    ↑ 阶段
         │  │  │  │       ↓       │  │    │    │
         │  │  │  │    目标阶段   │  │    │    │
         │  │  │  └───────────────┘  │    │    │
         │  │  └─────────────────────┘    │    │
         │  └─────────────────────────────┘    │
         └─────────────────────────────────────┘

1. 捕获阶段: window → document → html → body → div
2. 目标阶段: 事件到达目标元素
3. 冒泡阶段: div → body → html → document → window
```

### 2. 事件绑定

```javascript
// addEventListener（推荐）
element.addEventListener('click', handler, options);

// options 参数
{
  capture: false,   // 是否在捕获阶段触发
  once: true,       // 只触发一次，然后自动移除
  passive: true     // 不会调用 preventDefault()
}

// 移除事件
element.removeEventListener('click', handler);

// 旧方法（不推荐）
element.onclick = function() {};
```

### 3. 事件对象

```javascript
element.addEventListener("click", function (event) {
  // 事件类型
  event.type; // "click"

  // 目标元素
  event.target; // 触发事件的元素
  event.currentTarget; // 绑定事件的元素（= this）

  // 阻止行为
  event.preventDefault(); // 阻止默认行为
  event.stopPropagation(); // 阻止传播
  event.stopImmediatePropagation(); // 阻止传播 + 同元素其他监听器

  // 鼠标位置
  event.clientX, event.clientY; // 相对视口
  event.pageX, event.pageY; // 相对文档
  event.offsetX, event.offsetY; // 相对目标元素

  // 键盘事件
  event.key; // "Enter", "a", "Escape"
  event.keyCode; // 废弃
  event.ctrlKey, event.shiftKey, event.altKey, event.metaKey;

  // 事件阶段
  event.eventPhase; // 1: 捕获, 2: 目标, 3: 冒泡
});
```

### 4. 事件委托

```javascript
// ❌ 不好：给每个元素绑定事件
document.querySelectorAll(".item").forEach((item) => {
  item.addEventListener("click", handleClick);
});

// ✅ 好：事件委托
document.querySelector(".list").addEventListener("click", (e) => {
  // 检查是否点击了目标元素
  if (e.target.matches(".item")) {
    console.log("Item clicked:", e.target.textContent);
  }

  // 或使用 closest 查找祖先
  const item = e.target.closest(".item");
  if (item) {
    console.log("Item clicked:", item.textContent);
  }
});

/*
事件委托的优点:
1. 减少内存占用（只绑定一个监听器）
2. 动态元素自动生效（新增元素无需重新绑定）
3. 更好的性能
*/
```

### 5. 常用事件类型

```
┌─────────────────┬────────────────────────────────────┐
│     类别         │              事件                  │
├─────────────────┼────────────────────────────────────┤
│ 鼠标事件         │ click, dblclick, mousedown,        │
│                 │ mouseup, mousemove, mouseenter,    │
│                 │ mouseleave, mouseover, mouseout    │
├─────────────────┼────────────────────────────────────┤
│ 键盘事件         │ keydown, keyup, keypress (废弃)    │
├─────────────────┼────────────────────────────────────┤
│ 表单事件         │ submit, reset, focus, blur,        │
│                 │ input, change, select              │
├─────────────────┼────────────────────────────────────┤
│ 文档事件         │ DOMContentLoaded, load, unload,    │
│                 │ beforeunload, resize, scroll       │
├─────────────────┼────────────────────────────────────┤
│ 触摸事件         │ touchstart, touchmove, touchend    │
├─────────────────┼────────────────────────────────────┤
│ 拖拽事件         │ dragstart, drag, dragend,          │
│                 │ dragenter, dragover, drop          │
└─────────────────┴────────────────────────────────────┘
```

---

## 📌 五、BOM

### 1. window 对象

```javascript
// 窗口尺寸
window.innerWidth; // 视口宽度
window.innerHeight; // 视口高度
window.outerWidth; // 窗口宽度（含工具栏）
window.outerHeight;

// 滚动
window.scrollX; // 水平滚动距离
window.scrollY; // 垂直滚动距离
window.scrollTo(0, 100); // 滚动到指定位置
window.scrollTo({ top: 100, behavior: "smooth" });
window.scrollBy(0, 100); // 相对滚动

// 定时器
const id = setTimeout(fn, 1000); // 延迟执行
const id = setInterval(fn, 1000); // 间隔执行
clearTimeout(id);
clearInterval(id);

// 动画帧
const id = requestAnimationFrame(fn); // 下一帧执行
cancelAnimationFrame(id);

// 对话框
alert("消息");
const result = confirm("确定？"); // true/false
const input = prompt("请输入：", "默认值");

// 打开/关闭窗口
const newWindow = window.open(url, "_blank");
newWindow.close();
```

### 2. location 对象

```javascript
// URL: https://example.com:8080/path/page.html?q=test#section

location.href; // 完整 URL
location.protocol; // "https:"
location.host; // "example.com:8080"
location.hostname; // "example.com"
location.port; // "8080"
location.pathname; // "/path/page.html"
location.search; // "?q=test"
location.hash; // "#section"
location.origin; // "https://example.com:8080"

// 跳转
location.href = "https://example.com";
location.assign("https://example.com"); // 添加历史记录
location.replace("https://example.com"); // 不添加历史记录
location.reload(); // 刷新页面
location.reload(true); // 强制刷新（跳过缓存）

// 解析 URL 参数
const params = new URLSearchParams(location.search);
params.get("q"); // "test"
params.has("q"); // true
params.set("page", "1");
params.toString(); // "q=test&page=1"
```

### 3. history 对象

```javascript
history.length; // 历史记录条数
history.back(); // 后退
history.forward(); // 前进
history.go(-1); // 后退 1 步
history.go(2); // 前进 2 步

// HTML5 History API
history.pushState(state, "", "/new-url"); // 添加历史记录
history.replaceState(state, "", "/new-url"); // 替换当前记录

// 监听历史变化
window.addEventListener("popstate", (event) => {
  console.log(event.state); // 之前保存的 state
});
```

### 4. navigator 对象

```javascript
navigator.userAgent; // 用户代理字符串
navigator.language; // 浏览器语言
navigator.onLine; // 是否在线
navigator.cookieEnabled; // Cookie 是否启用
navigator.platform; // 操作系统

// 剪贴板
await navigator.clipboard.writeText("复制的文本");
const text = await navigator.clipboard.readText();

// 地理位置
navigator.geolocation.getCurrentPosition(
  (position) => {
    console.log(position.coords.latitude);
    console.log(position.coords.longitude);
  },
  (error) => console.error(error)
);
```

---

## 📌 六、本地存储

### 1. localStorage vs sessionStorage

```
┌─────────────────┬─────────────────┬─────────────────┐
│                 │  localStorage   │ sessionStorage  │
├─────────────────┼─────────────────┼─────────────────┤
│ 生命周期         │ 永久保存        │ 会话结束清除    │
│ 作用域          │ 同源所有标签页   │ 当前标签页      │
│ 容量            │ 约 5MB          │ 约 5MB          │
│ 同步/异步       │ 同步            │ 同步            │
└─────────────────┴─────────────────┴─────────────────┘
```

### 2. 使用方法

```javascript
// 存储
localStorage.setItem("key", "value");
localStorage.setItem("user", JSON.stringify({ name: "Alice" }));

// 获取
const value = localStorage.getItem("key");
const user = JSON.parse(localStorage.getItem("user"));

// 删除
localStorage.removeItem("key");

// 清空
localStorage.clear();

// 遍历
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
}

// 监听变化（跨标签页）
window.addEventListener("storage", (event) => {
  console.log(event.key); // 变化的 key
  console.log(event.oldValue); // 旧值
  console.log(event.newValue); // 新值
  console.log(event.url); // 触发变化的页面
});
```

### 3. Cookie vs Storage

```
┌─────────────┬──────────────┬───────────────────────────┐
│             │    Cookie    │    localStorage           │
├─────────────┼──────────────┼───────────────────────────┤
│ 容量        │ 约 4KB       │ 约 5MB                    │
│ 发送到服务器 │ 每次请求     │ 不会                      │
│ 有效期      │ 可设置       │ 永久                      │
│ 安全性      │ HttpOnly     │ 纯前端                    │
│ API         │ 原始字符串   │ 简单 API                  │
└─────────────┴──────────────┴───────────────────────────┘
```

---

## 📌 七、实战：待办事项应用

```javascript
class TodoApp {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem("todos")) || [];
    this.list = document.querySelector(".todo-list");
    this.input = document.querySelector(".todo-input");
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  bindEvents() {
    // 添加
    document.querySelector(".add-btn").addEventListener("click", () => {
      this.addTodo(this.input.value);
    });

    // 事件委托处理删除和完成
    this.list.addEventListener("click", (e) => {
      const item = e.target.closest(".todo-item");
      if (!item) return;

      const id = parseInt(item.dataset.id);

      if (e.target.matches(".delete-btn")) {
        this.deleteTodo(id);
      } else if (e.target.matches(".toggle-btn")) {
        this.toggleTodo(id);
      }
    });
  }

  addTodo(text) {
    if (!text.trim()) return;
    this.todos.push({
      id: Date.now(),
      text: text.trim(),
      completed: false,
    });
    this.input.value = "";
    this.save();
    this.render();
  }

  deleteTodo(id) {
    this.todos = this.todos.filter((todo) => todo.id !== id);
    this.save();
    this.render();
  }

  toggleTodo(id) {
    const todo = this.todos.find((t) => t.id === id);
    if (todo) todo.completed = !todo.completed;
    this.save();
    this.render();
  }

  save() {
    localStorage.setItem("todos", JSON.stringify(this.todos));
  }

  render() {
    this.list.innerHTML = this.todos
      .map(
        (todo) => `
      <li class="todo-item ${todo.completed ? "completed" : ""}" data-id="${
          todo.id
        }">
        <button class="toggle-btn">${todo.completed ? "✓" : "○"}</button>
        <span class="text">${todo.text}</span>
        <button class="delete-btn">×</button>
      </li>
    `
      )
      .join("");
  }
}

new TodoApp();
```

---

## 📚 推荐学习资源

| 资源            | 链接                  |
| --------------- | --------------------- |
| MDN DOM         | developer.mozilla.org |
| JavaScript.info | javascript.info       |

---
