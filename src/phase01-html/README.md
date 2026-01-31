# Phase 1: HTML 基础

> **目标**：掌握 HTML 语义化与最佳实践  
> **预计时长**：1 周

---

## 📚 本阶段内容

### 学习目标

1. 理解 HTML 语义化的重要性
2. 掌握常用 HTML5 标签
3. 学会构建可访问的网页结构
4. 了解 SEO 基础

### 知识要点

- HTML 文档结构
- 语义化标签 (header, nav, main, article, section, aside, footer)
- 表单元素与验证
- 多媒体标签 (audio, video, picture)
- 无障碍访问 (ARIA)

### 实战项目

**个人主页**：创建一个语义化的个人介绍页面

---

## 📂 目录结构

```
phase01-html/
├── CONCEPT.md          # 核心概念（本文件）
├── README.md           # 阶段概述
├── examples/           # 示例代码
│   ├── 01-document-structure.html
│   ├── 02-semantic-elements.html
│   ├── 03-text-formatting.html
│   ├── 04-links-images.html
│   ├── 05-forms.html
│   ├── 06-multimedia.html
│   └── 07-accessibility.html
└── exercises/          # 练习题
    └── personal-homepage/
```

---

## 🎯 核心概念

### 1. HTML 文档结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="页面描述" />
    <title>页面标题</title>
  </head>
  <body>
    <!-- 页面内容 -->
  </body>
</html>
```

### 2. 语义化标签

语义化标签让页面结构更清晰，有助于 SEO 和无障碍访问。

```html
<header>
  <nav>
    <ul>
      <li><a href="#home">首页</a></li>
      <li><a href="#about">关于</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>文章标题</h1>
    <section>
      <h2>章节标题</h2>
      <p>段落内容...</p>
    </section>
  </article>

  <aside>
    <h3>侧边栏</h3>
  </aside>
</main>

<footer>
  <p>&copy; 2024 版权信息</p>
</footer>
```

### 3. 常用语义化标签对照

| 标签      | 用途      | 替代方案                |
| :-------- | :-------- | :---------------------- |
| `header`  | 页头/节头 | `<div class="header">`  |
| `nav`     | 导航区域  | `<div class="nav">`     |
| `main`    | 主要内容  | `<div class="main">`    |
| `article` | 独立文章  | `<div class="article">` |
| `section` | 章节      | `<div class="section">` |
| `aside`   | 侧边栏    | `<div class="sidebar">` |
| `footer`  | 页脚/节脚 | `<div class="footer">`  |
| `figure`  | 图表容器  | `<div class="figure">`  |
| `time`    | 日期时间  | `<span class="time">`   |
| `mark`    | 高亮文本  | `<span class="mark">`   |

### 4. 表单元素

```html
<form action="/submit" method="POST">
  <!-- 文本输入 -->
  <label for="username">用户名</label>
  <input type="text" id="username" name="username" required minlength="3" />

  <!-- 邮箱验证 -->
  <input type="email" placeholder="请输入邮箱" />

  <!-- 数字输入 -->
  <input type="number" min="0" max="100" step="1" />

  <!-- 日期选择 -->
  <input type="date" />

  <!-- 下拉选择 -->
  <select name="city">
    <option value="">请选择</option>
    <option value="beijing">北京</option>
    <option value="shanghai">上海</option>
  </select>

  <!-- 数据列表 -->
  <input list="browsers" />
  <datalist id="browsers">
    <option value="Chrome" />
    <option value="Firefox" />
    <option value="Safari" />
  </datalist>

  <button type="submit">提交</button>
</form>
```

### 5. 多媒体标签

```html
<!-- 响应式图片 -->
<picture>
  <source media="(min-width: 1200px)" srcset="large.jpg" />
  <source media="(min-width: 768px)" srcset="medium.jpg" />
  <img src="small.jpg" alt="图片描述" loading="lazy" />
</picture>

<!-- 视频 -->
<video controls width="640" poster="cover.jpg">
  <source src="video.mp4" type="video/mp4" />
  <source src="video.webm" type="video/webm" />
  您的浏览器不支持视频播放
</video>

<!-- 音频 -->
<audio controls>
  <source src="audio.mp3" type="audio/mpeg" />
  <source src="audio.ogg" type="audio/ogg" />
</audio>
```

### 6. 无障碍访问 (Accessibility)

```html
<!-- ARIA 属性 -->
<button aria-label="关闭对话框" aria-expanded="false">×</button>

<nav aria-label="主导航">
  <ul role="menubar">
    <li role="menuitem"><a href="/">首页</a></li>
  </ul>
</nav>

<!-- 跳转链接 -->
<a href="#main-content" class="skip-link">跳转到主要内容</a>

<!-- 图片替代文本 -->
<img src="logo.png" alt="公司 Logo" />
<img src="decorative.png" alt="" role="presentation" />
```

---

## 📝 练习任务

1. **基础练习**：创建一个包含所有语义化标签的页面结构
2. **表单练习**：创建一个注册表单，包含各种输入类型和验证
3. **实战项目**：制作个人主页，要求：
   - 使用语义化标签
   - 包含导航、个人简介、技能展示、联系方式
   - 添加适当的 ARIA 属性
   - 通过 W3C 验证

---

## 📖 扩展阅读

- [MDN HTML 指南](https://developer.mozilla.org/zh-CN/docs/Web/HTML)
- [HTML Living Standard](https://html.spec.whatwg.org/)
- [WebAIM 无障碍指南](https://webaim.org/)

---

> 完成本阶段后，你应该能够创建结构清晰、语义化的 HTML 页面。
