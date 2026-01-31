# 📝 待办事项应用 (Todo App)

> **阶段**：第一部分 - 前端基础 (Phase 1-5)  
> **技术栈**：HTML5 + CSS3 + JavaScript (ES6+)  
> **预计时长**：3-5 天

---

## 🎯 项目目标

通过开发一个功能完整的待办事项应用，综合运用前端基础知识，包括：

- HTML5 语义化标签
- CSS Flexbox/Grid 布局
- CSS 变量与主题切换
- DOM 操作与事件处理
- 事件委托模式
- localStorage 数据持久化
- ES6+ 模块化开发

---

## ✨ 功能特性

- ✅ 添加新任务
- ✅ 编辑任务内容
- ✅ 删除任务
- ✅ 标记任务完成/未完成
- ✅ 筛选任务（全部/进行中/已完成）
- ✅ 清除所有已完成任务
- ✅ 任务计数统计
- ✅ 本地存储持久化
- ✅ 深色/浅色主题切换
- ✅ 响应式布局

---

## 🚀 快速开始

### 运行项目

```bash
# 方式1: 使用 live-server
npx live-server projects/01-todo-app

# 方式2: 直接打开 index.html
open projects/01-todo-app/index.html
```

---

## 📂 目录结构

```
01-todo-app/
├── README.md           # 项目说明（本文件）
├── index.html          # 主页面
├── css/
│   └── style.css       # 样式文件
├── js/
│   ├── app.js          # 应用入口
│   ├── TodoList.js     # 核心逻辑类
│   ├── storage.js      # 本地存储模块
│   └── theme.js        # 主题切换模块
└── assets/
    └── icons/          # 图标资源
```

---

## 🔧 技术要点

### 1. HTML 结构

```html
<!-- 语义化标签 -->
<header>应用头部</header>
<main>主要内容区</main>
<footer>底部操作区</footer>

<!-- 表单处理 -->
<form id="todo-form">
  <input type="text" required />
  <button type="submit">添加</button>
</form>
```

### 2. CSS 变量主题

```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #333333;
}

[data-theme="dark"] {
  --bg-primary: #1a1a2e;
  --text-primary: #eaeaea;
}
```

### 3. 事件委托

```javascript
// 使用事件委托处理列表操作
todoList.addEventListener("click", (e) => {
  const item = e.target.closest(".todo-item");
  if (e.target.matches(".btn-delete")) {
    // 删除逻辑
  }
});
```

### 4. 本地存储

```javascript
// 存储数据
localStorage.setItem("todos", JSON.stringify(todos));

// 读取数据
const todos = JSON.parse(localStorage.getItem("todos")) || [];
```

---

## 📋 开发步骤

### Step 1: 搭建 HTML 结构

- 创建基本页面框架
- 添加表单、列表、筛选区域

### Step 2: 编写 CSS 样式

- 定义 CSS 变量
- 实现响应式布局
- 添加过渡动画

### Step 3: 实现核心功能

- 任务的增删改查
- 状态切换逻辑

### Step 4: 添加筛选功能

- 全部/进行中/已完成

### Step 5: 数据持久化

- localStorage 存储
- 页面加载恢复数据

### Step 6: 主题切换

- 深色/浅色模式
- 保存用户偏好

---

## 🎨 界面预览

```
┌─────────────────────────────────────┐
│  📝 Todo App              [🌙/☀️]  │
├─────────────────────────────────────┤
│  [ 输入新任务...          ] [添加]  │
├─────────────────────────────────────┤
│  ○ 学习 JavaScript          [✏️][🗑️]│
│  ● 完成 CSS 布局 ──────      [✏️][🗑️]│
│  ○ 实现本地存储              [✏️][🗑️]│
├─────────────────────────────────────┤
│  [全部] [进行中] [已完成]           │
│  剩余 2 项任务    [清除已完成]       │
└─────────────────────────────────────┘
```

---

## 📚 学习收获

完成本项目后，你将掌握：

1. **HTML5** - 语义化标签、表单处理
2. **CSS3** - Flexbox 布局、CSS 变量、过渡动画
3. **JavaScript** - DOM 操作、事件处理、ES6+ 语法
4. **设计模式** - 事件委托、模块化
5. **数据持久化** - localStorage API

---

> 💡 提示：在开始编码前，先理解每个功能的实现思路！
