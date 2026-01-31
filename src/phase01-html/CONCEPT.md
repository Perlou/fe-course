# HTML 深入解析 - 从零开始

## 📌 一、HTML 是什么？

```
HTML = HyperText Markup Language（超文本标记语言）
```

```
┌─────────────────────────────────────────────────────────┐
│                      网页三剑客                          │
├─────────────────┬─────────────────┬─────────────────────┤
│      HTML       │      CSS        │     JavaScript      │
│     (结构)      │     (样式)       │       (行为)        │
│     骨架        │     皮肤         │       肌肉          │
└─────────────────┴─────────────────┴─────────────────────┘
```

---

## 📌 二、HTML 发展历史

```
1991 ─── HTML 1.0（Tim Berners-Lee 发明）
  │
1995 ─── HTML 2.0
  │
1997 ─── HTML 3.2 / HTML 4.0
  │
1999 ─── HTML 4.01
  │
2000 ─── XHTML 1.0（更严格的XML语法）
  │
2014 ─── HTML5（革命性更新）⭐
  │
至今 ─── HTML Living Standard（持续更新）
```

---

## 📌 三、HTML 基本结构

### 1. 最简单的 HTML 文档

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>页面标题</title>
  </head>
  <body>
    <h1>Hello, World!</h1>
    <p>这是我的第一个网页</p>
  </body>
</html>
```

### 2. 结构解析图

```
<!DOCTYPE html>          ← 文档类型声明（告诉浏览器这是HTML5）
│
<html>                   ← 根元素
│
├── <head>               ← 头部（不可见的元数据）
│   ├── <meta>           ← 元信息（编码、视口等）
│   ├── <title>          ← 页面标题（显示在标签页）
│   ├── <link>           ← 外部资源链接（CSS等）
│   ├── <script>         ← 脚本文件
│   └── <style>          ← 内部样式
│
└── <body>               ← 主体（用户可见内容）
    ├── 文本内容
    ├── 图片
    ├── 链接
    └── ...
```

---

## 📌 四、HTML 元素与标签

### 1. 基本语法

```html
<!-- 双标签（有开始和结束） -->
<标签名 属性="值">内容</标签名>

<!-- 示例 -->
<p class="intro">这是一段文字</p>
<a href="https://example.com">点击链接</a>

<!-- 自闭合标签（无结束标签） -->
<br>        <!-- 换行 -->
<hr>        <!-- 水平线 -->
<img>       <!-- 图片 -->
<input>     <!-- 输入框 -->
```

### 2. 元素结构图解

```
       开始标签           结束标签
          ↓                  ↓
        ┌─┴─┐              ┌─┴─┐
        <p class="text">Hello World</p>
           └──┬──┘         └────┬────┘
           属性              元素内容

        └─────────────────────────────┘
                    完整元素
```

### 3. 元素的嵌套关系

```html
<!-- 正确的嵌套 -->
<div>
    <p>这是<strong>重要</strong>内容</p>
</div>

<!-- 错误的嵌套 ❌ -->
<p>这是<strong>重要</p></strong>
```

---

## 📌 五、常用 HTML 标签分类

### 1. 文本类标签

```html
<!-- 标题 h1-h6（h1最大，h6最小） -->
<h1>一级标题</h1>
<h2>二级标题</h2>
<h3>三级标题</h3>

<!-- 段落 -->
<p>这是一个段落</p>

<!-- 文本格式化 -->
<strong>加粗（语义化，表示重要）</strong>
<b>加粗（纯视觉）</b>
<em>斜体（语义化，表示强调）</em>
<i>斜体（纯视觉）</i>
<u>下划线</u>
<s>删除线</s>
<mark>高亮标记</mark>
<sub>下标</sub>
<sup>上标</sup>

<!-- 换行与水平线 -->
<br />
<!-- 换行 -->
<hr />
<!-- 水平分割线 -->

<!-- 预格式化文本 -->
<pre>
    保持    原有的
    空格和换行
</pre>

<!-- 代码 -->
<code>console.log("Hello")</code>
```

### 2. 链接与图片

```html
<!-- 超链接 -->
<a href="https://www.google.com">访问Google</a>
<a href="page.html">内部链接</a>
<a href="#section1">页内锚点</a>
<a href="mailto:test@example.com">发送邮件</a>
<a href="tel:+8612345678901">拨打电话</a>
<a href="file.pdf" download>下载文件</a>
<a href="https://example.com" target="_blank">新窗口打开</a>

<!-- 图片 -->
<img src="photo.jpg" alt="图片描述" width="300" height="200" />

<!-- 带链接的图片 -->
<a href="https://example.com">
  <img src="logo.png" alt="Logo" />
</a>

<!-- 响应式图片 -->
<picture>
  <source media="(min-width: 800px)" srcset="large.jpg" />
  <source media="(min-width: 400px)" srcset="medium.jpg" />
  <img src="small.jpg" alt="响应式图片" />
</picture>
```

### 3. 列表

```html
<!-- 无序列表 -->
<ul>
  <li>项目一</li>
  <li>项目二</li>
  <li>项目三</li>
</ul>

<!-- 有序列表 -->
<ol>
  <li>第一步</li>
  <li>第二步</li>
  <li>第三步</li>
</ol>

<!-- 定义列表 -->
<dl>
  <dt>HTML</dt>
  <dd>超文本标记语言</dd>
  <dt>CSS</dt>
  <dd>层叠样式表</dd>
</dl>

<!-- 嵌套列表 -->
<ul>
  <li>
    水果
    <ul>
      <li>苹果</li>
      <li>香蕉</li>
    </ul>
  </li>
  <li>蔬菜</li>
</ul>
```

### 4. 表格

```html
<table border="1">
  <caption>
    学生成绩表
  </caption>
  <thead>
    <tr>
      <th>姓名</th>
      <th>语文</th>
      <th>数学</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>张三</td>
      <td>90</td>
      <td>85</td>
    </tr>
    <tr>
      <td>李四</td>
      <td>88</td>
      <td>92</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td>平均分</td>
      <td>89</td>
      <td>88.5</td>
    </tr>
  </tfoot>
</table>

<!-- 合并单元格 -->
<table>
  <tr>
    <td colspan="2">横跨两列</td>
  </tr>
  <tr>
    <td rowspan="2">纵跨两行</td>
    <td>数据1</td>
  </tr>
  <tr>
    <td>数据2</td>
  </tr>
</table>
```

**表格结构图：**

```
┌─────────────────────────────────┐
│         <caption>标题           │
├─────────────────────────────────┤
│ <thead>                         │
│   ┌───────┬───────┬───────┐    │
│   │  th   │  th   │  th   │    │
│   └───────┴───────┴───────┘    │
├─────────────────────────────────┤
│ <tbody>                         │
│   ┌───────┬───────┬───────┐    │
│   │  td   │  td   │  td   │    │
│   ├───────┼───────┼───────┤    │
│   │  td   │  td   │  td   │    │
│   └───────┴───────┴───────┘    │
├─────────────────────────────────┤
│ <tfoot>                         │
│   ┌───────┬───────┬───────┐    │
│   │  td   │  td   │  td   │    │
│   └───────┴───────┴───────┘    │
└─────────────────────────────────┘
```

### 5. 表单（重要！）

```html
<form action="/submit" method="POST">
  <!-- 文本输入 -->
  <label for="username">用户名：</label>
  <input
    type="text"
    id="username"
    name="username"
    placeholder="请输入用户名"
    required
  />

  <!-- 密码输入 -->
  <label for="password">密码：</label>
  <input type="password" id="password" name="password" />

  <!-- 邮箱（自动验证格式） -->
  <input type="email" name="email" placeholder="email@example.com" />

  <!-- 数字输入 -->
  <input type="number" name="age" min="0" max="150" />

  <!-- 日期选择器 -->
  <input type="date" name="birthday" />

  <!-- 颜色选择器 -->
  <input type="color" name="favcolor" />

  <!-- 范围滑块 -->
  <input type="range" name="volume" min="0" max="100" />

  <!-- 文件上传 -->
  <input type="file" name="avatar" accept="image/*" />

  <!-- 单选按钮 -->
  <input type="radio" name="gender" value="male" id="male" />
  <label for="male">男</label>
  <input type="radio" name="gender" value="female" id="female" />
  <label for="female">女</label>

  <!-- 复选框 -->
  <input type="checkbox" name="hobby" value="reading" id="reading" />
  <label for="reading">阅读</label>
  <input type="checkbox" name="hobby" value="music" id="music" />
  <label for="music">音乐</label>

  <!-- 下拉选择 -->
  <select name="city">
    <optgroup label="直辖市">
      <option value="beijing">北京</option>
      <option value="shanghai">上海</option>
    </optgroup>
    <optgroup label="省会">
      <option value="hangzhou">杭州</option>
    </optgroup>
  </select>

  <!-- 多行文本 -->
  <textarea name="message" rows="4" cols="50">默认内容</textarea>

  <!-- 数据列表（自动补全） -->
  <input list="browsers" name="browser" />
  <datalist id="browsers">
    <option value="Chrome"></option>
    <option value="Firefox"></option>
    <option value="Safari"></option>
  </datalist>

  <!-- 按钮 -->
  <button type="submit">提交</button>
  <button type="reset">重置</button>
  <button type="button">普通按钮</button>
</form>
```

**Input 类型一览：**

```
┌────────────────┬──────────────────────────────┐
│     type       │           说明                │
├────────────────┼──────────────────────────────┤
│ text           │ 普通文本输入                  │
│ password       │ 密码（显示为圆点）            │
│ email          │ 邮箱（自动验证）              │
│ number         │ 数字                         │
│ tel            │ 电话号码                      │
│ url            │ 网址                         │
│ search         │ 搜索框                        │
│ date           │ 日期选择器                    │
│ time           │ 时间选择器                    │
│ datetime-local │ 日期时间选择器                │
│ month          │ 月份选择器                    │
│ week           │ 周选择器                      │
│ color          │ 颜色选择器                    │
│ range          │ 滑块                         │
│ file           │ 文件上传                      │
│ hidden         │ 隐藏字段                      │
│ checkbox       │ 复选框                        │
│ radio          │ 单选按钮                      │
│ submit         │ 提交按钮                      │
│ reset          │ 重置按钮                      │
│ button         │ 普通按钮                      │
└────────────────┴──────────────────────────────┘
```

---

## 📌 六、HTML5 语义化标签

### 1. 为什么需要语义化？

```
传统方式（无语义）：          语义化方式：
┌──────────────────┐        ┌──────────────────┐
│ <div id="header">│        │     <header>     │
├──────────────────┤        ├──────────────────┤
│ <div id="nav">   │        │      <nav>       │
├──────────────────┤        ├──────────────────┤
│ <div id="main">  │        │      <main>      │
│  <div id="article"│       │     <article>    │
│  <div id="aside">│        │      <aside>     │
├──────────────────┤        ├──────────────────┤
│ <div id="footer">│        │     <footer>     │
└──────────────────┘        └──────────────────┘
```

### 2. 语义化标签详解

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>语义化HTML5页面</title>
  </head>
  <body>
    <!-- 页面头部 -->
    <header>
      <h1>网站标题</h1>
      <nav>
        <ul>
          <li><a href="#home">首页</a></li>
          <li><a href="#about">关于</a></li>
          <li><a href="#contact">联系</a></li>
        </ul>
      </nav>
    </header>

    <!-- 主要内容区 -->
    <main>
      <!-- 独立的内容块 -->
      <article>
        <header>
          <h2>文章标题</h2>
          <time datetime="2024-01-15">2024年1月15日</time>
        </header>

        <section>
          <h3>第一章节</h3>
          <p>章节内容...</p>
          <figure>
            <img src="chart.png" alt="数据图表" />
            <figcaption>图1: 年度数据统计</figcaption>
          </figure>
        </section>

        <section>
          <h3>第二章节</h3>
          <p>章节内容...</p>
        </section>

        <footer>
          <p>作者：张三</p>
        </footer>
      </article>

      <!-- 侧边栏 -->
      <aside>
        <h3>相关文章</h3>
        <ul>
          <li><a href="#">推荐文章1</a></li>
          <li><a href="#">推荐文章2</a></li>
        </ul>
      </aside>
    </main>

    <!-- 页面底部 -->
    <footer>
      <p>&copy; 2024 版权所有</p>
      <address>
        联系方式：<a href="mailto:info@example.com">info@example.com</a>
      </address>
    </footer>
  </body>
</html>
```

### 3. 语义化标签对照表

```
┌──────────────┬────────────────────────────────────────┐
│     标签      │                  用途                   │
├──────────────┼────────────────────────────────────────┤
│ <header>     │ 页面或区块的头部                        │
│ <nav>        │ 导航链接区域                            │
│ <main>       │ 页面主要内容（每页只有一个）             │
│ <article>    │ 独立的、可复用的内容（如文章、帖子）     │
│ <section>    │ 文档中的章节                            │
│ <aside>      │ 侧边栏、附注内容                        │
│ <footer>     │ 页面或区块的底部                        │
│ <figure>     │ 独立的媒体内容（图片、图表等）           │
│ <figcaption> │ figure的标题/说明                       │
│ <time>       │ 日期/时间                               │
│ <mark>       │ 高亮/标记文本                           │
│ <details>    │ 可展开/折叠的内容                       │
│ <summary>    │ details的标题                           │
│ <dialog>     │ 对话框                                  │
└──────────────┴────────────────────────────────────────┘
```

---

## 📌 七、HTML5 多媒体

### 1. 音频

```html
<audio controls autoplay loop muted>
  <source src="audio.mp3" type="audio/mpeg" />
  <source src="audio.ogg" type="audio/ogg" />
  您的浏览器不支持音频播放
</audio>
```

### 2. 视频

```html
<video width="640" height="360" controls poster="preview.jpg">
  <source src="video.mp4" type="video/mp4" />
  <source src="video.webm" type="video/webm" />
  <track kind="subtitles" src="subs_cn.vtt" srclang="zh" label="中文" />
  <track kind="subtitles" src="subs_en.vtt" srclang="en" label="English" />
  您的浏览器不支持视频播放
</video>
```

### 3. 嵌入内容

```html
<!-- 嵌入网页 -->
<iframe
  src="https://example.com"
  width="800"
  height="600"
  frameborder="0"
  allowfullscreen
>
</iframe>

<!-- 嵌入YouTube视频 -->
<iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/VIDEO_ID"
  allow="accelerometer; autoplay; clipboard-write; 
               encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
>
</iframe>

<!-- Canvas 画布 -->
<canvas id="myCanvas" width="400" height="300"> 您的浏览器不支持Canvas </canvas>

<!-- SVG 矢量图 -->
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" stroke="black" fill="red" />
</svg>
```

---

## 📌 八、HTML 属性详解

### 1. 全局属性

```html
<!-- 所有HTML元素都可以使用的属性 -->
<div id="unique-id" <!-- 唯一标识符 -->
  class="class1 class2"
  <!-- CSS类名（可多个） -->
  style="color: red;"
  <!-- 内联样式 -->
  title="提示文本"
  <!-- 鼠标悬停提示 -->
  hidden
  <!-- 隐藏元素 -->
  tabindex="1"
  <!-- Tab键顺序 -->
  contenteditable="true"
  <!-- 可编辑 -->
  draggable="true"
  <!-- 可拖拽 -->
  spellcheck="true"
  <!-- 拼写检查 -->
  lang="zh-CN"
  <!-- 语言 -->
  dir="ltr"
  <!-- 文字方向 ltr/rtl -->
  data-info="custom"
  <!-- 自定义数据属性 -->
  > 内容
</div>
```

### 2. 自定义数据属性（data-\*）

```html
<article
  data-id="123"
  data-category="tech"
  data-author-name="张三"
  data-publish-date="2024-01-15"
>
  <h2>文章标题</h2>
</article>

<script>
  const article = document.querySelector("article");

  // 通过dataset访问
  console.log(article.dataset.id); // "123"
  console.log(article.dataset.category); // "tech"
  console.log(article.dataset.authorName); // "张三" (驼峰命名)
</script>
```

### 3. ARIA 无障碍属性

```html
<!-- 提升可访问性的属性 -->
<button aria-label="关闭" aria-pressed="false">
  <span aria-hidden="true">&times;</span>
</button>

<div role="alert" aria-live="polite">操作成功！</div>

<nav aria-label="主导航">
  <ul role="menubar">
    <li role="menuitem"><a href="#">首页</a></li>
    <li role="menuitem"><a href="#">产品</a></li>
  </ul>
</nav>
```

---

## 📌 九、Meta 标签详解

```html
<head>
  <!-- 字符编码 -->
  <meta charset="UTF-8" />

  <!-- 视口设置（响应式必需） -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- 页面描述（SEO重要） -->
  <meta name="description" content="这是页面的描述，显示在搜索结果中" />

  <!-- 关键词 -->
  <meta name="keywords" content="HTML, CSS, JavaScript, 前端" />

  <!-- 作者 -->
  <meta name="author" content="张三" />

  <!-- 搜索引擎抓取指令 -->
  <meta name="robots" content="index, follow" />

  <!-- 主题颜色（移动端浏览器） -->
  <meta name="theme-color" content="#4285f4" />

  <!-- IE兼容模式 -->
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />

  <!-- 自动刷新/重定向 -->
  <meta http-equiv="refresh" content="5;url=https://example.com" />

  <!-- Open Graph（社交分享） -->
  <meta property="og:title" content="页面标题" />
  <meta property="og:description" content="页面描述" />
  <meta property="og:image" content="https://example.com/image.jpg" />
  <meta property="og:url" content="https://example.com/page" />

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="页面标题" />
</head>
```

---

## 📌 十、DOM 结构与渲染

### 1. DOM 树结构

```
                    document
                        │
                      <html>
                    ┌───┴───┐
                 <head>   <body>
                    │        │
              ┌──┬──┴──┐    ├── <header>
           <meta><title><link> │
                              ├── <main>
                              │    ├── <article>
                              │    └── <aside>
                              │
                              └── <footer>
```

### 2. 渲染过程

```
HTML文档
    │
    ▼
[解析HTML] ──────────────────────────┐
    │                                │
    ▼                                ▼
 DOM Tree                        CSSOM Tree
    │                                │
    └───────────┬────────────────────┘
                │
                ▼
           Render Tree
                │
                ▼
            Layout（布局计算）
                │
                ▼
            Paint（绘制）
                │
                ▼
           Composite（合成）
                │
                ▼
           屏幕显示
```

---

## 📌 十一、HTML 最佳实践

### ✅ 推荐做法

```html
<!-- 1. 使用正确的文档类型 -->
<!DOCTYPE html>

<!-- 2. 设置语言属性 -->
<html lang="zh-CN">
  <!-- 3. 必须设置字符编码 -->
  <meta charset="UTF-8" />

  <!-- 4. 图片必须有alt属性 -->
  <img src="photo.jpg" alt="风景照片" />

  <!-- 5. 使用语义化标签 -->
  <header>
    ,
    <nav>
      ,
      <main>
        ,
        <article>
          ,
          <footer>
            <!-- 6. 表单标签关联 -->
            <label for="email">邮箱：</label>
            <input type="email" id="email" name="email" />

            <!-- 7. 正确的标题层级 -->
            <h1>页面主标题</h1>
            <h2>二级标题</h2>
            <h3>三级标题</h3>

            <!-- 8. 外部链接安全 -->
            <a
              href="https://example.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              外部链接
            </a>
          </footer>
        </article>
      </main>
    </nav>
  </header>
</html>
```

### ❌ 避免的做法

```html
<!-- 1. 避免使用废弃标签 -->
<center>
  ,
  <font
    >,
    <marquee
      >,
      <blink>
        <!-- 2. 避免表格布局 -->
        <table>
          用于布局
        </table>
        <!-- 只应用于表格数据 -->

        <!-- 3. 避免内联样式泛滥 -->
        <p style="color:red;font-size:20px;">...</p>

        <!-- 4. 避免空链接 -->
        <a href="#">点击</a>
        <!-- 应使用 href="javascript:void(0)" 或 button -->

        <!-- 5. 避免无意义的div嵌套 -->
        <div>
          <div>
            <div><p>内容</p></div>
          </div>
        </div></blink
      ></marquee
    ></font
  >
</center>
```

---

## 📌 十二、完整页面模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <!-- 元信息 -->
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="页面描述" />
    <meta name="keywords" content="关键词1, 关键词2" />
    <meta name="author" content="作者名" />

    <!-- 标题 -->
    <title>页面标题 - 网站名</title>

    <!-- 图标 -->
    <link rel="icon" href="/favicon.ico" type="image/x-icon" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

    <!-- 样式表 -->
    <link rel="stylesheet" href="css/normalize.css" />
    <link rel="stylesheet" href="css/style.css" />

    <!-- 预加载关键资源 -->
    <link rel="preload" href="fonts/main.woff2" as="font" crossorigin />
  </head>
  <body>
    <!-- 跳转到主内容（无障碍） -->
    <a href="#main-content" class="skip-link">跳转到主内容</a>

    <!-- 页面头部 -->
    <header class="site-header">
      <div class="logo">
        <a href="/"><img src="logo.png" alt="网站Logo" /></a>
      </div>
      <nav class="main-nav" aria-label="主导航">
        <ul>
          <li><a href="/" class="active">首页</a></li>
          <li><a href="/products">产品</a></li>
          <li><a href="/about">关于</a></li>
          <li><a href="/contact">联系</a></li>
        </ul>
      </nav>
    </header>

    <!-- 主要内容 -->
    <main id="main-content">
      <article>
        <header>
          <h1>文章标题</h1>
          <p class="meta">
            <time datetime="2024-01-15">2024年1月15日</time>
            · 作者：张三
          </p>
        </header>

        <section>
          <h2>第一节</h2>
          <p>内容...</p>
        </section>

        <section>
          <h2>第二节</h2>
          <p>内容...</p>
        </section>
      </article>

      <aside>
        <h2>侧边栏</h2>
        <!-- 侧边栏内容 -->
      </aside>
    </main>

    <!-- 页面底部 -->
    <footer class="site-footer">
      <div class="footer-links">
        <nav aria-label="底部导航">
          <a href="/privacy">隐私政策</a>
          <a href="/terms">使用条款</a>
        </nav>
      </div>
      <p class="copyright">&copy; 2024 公司名称. 保留所有权利.</p>
    </footer>

    <!-- JavaScript -->
    <script src="js/main.js" defer></script>
  </body>
</html>
```

---

## 📌 十三、学习路径

```
HTML基础
    │
    ├── 1. 基本标签和结构
    │
    ├── 2. 表单和输入
    │
    ├── 3. 语义化HTML5
    │
    ├── 4. 多媒体（音视频）
    │
    └── 5. 无障碍访问
           │
           ▼
    ┌──────┴──────┐
    │   CSS基础    │
    │   JavaScript │
    └──────┬──────┘
           │
           ▼
    响应式设计 / SEO优化 / 性能优化
```

---

## 📚 推荐学习资源

| 资源                 | 链接                  |
| -------------------- | --------------------- |
| MDN Web Docs         | developer.mozilla.org |
| W3Schools            | w3schools.com         |
| HTML Living Standard | html.spec.whatwg.org  |
| Can I Use            | caniuse.com           |
| HTML 验证器          | validator.w3.org      |

---
