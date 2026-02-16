# Next.js 博客项目练习

## 📋 目标

使用 Next.js App Router 构建一个 SSR/SSG 博客，涵盖服务端组件、数据获取、路由、SEO。

---

## 🏗️ 核心功能

1. **首页** — 博客列表 (SSG)
2. **文章详情** — 动态路由 + SSG (generateStaticParams)
3. **分类筛选** — 搜索参数 + 服务端组件
4. **暗色模式** — 客户端组件 + Zustand 状态管理
5. **SEO** — metadata API 优化

---

## 📂 项目结构

```
nextjs-blog/
├── app/
│   ├── layout.jsx           # 根布局
│   ├── page.jsx             # 首页 (/)
│   ├── globals.css
│   ├── blog/
│   │   ├── page.jsx         # 文章列表 (/blog)
│   │   └── [slug]/
│   │       └── page.jsx     # 文章详情 (/blog/:slug)
│   └── about/
│       └── page.jsx         # 关于页 (/about)
├── components/
│   ├── Header.jsx
│   ├── PostCard.jsx
│   ├── ThemeToggle.jsx      # 客户端组件
│   └── SearchBar.jsx        # 客户端组件
├── lib/
│   ├── posts.js             # 数据获取
│   └── store.js             # Zustand store
├── content/                  # Markdown 文章
│   ├── hello-world.md
│   └── react-hooks.md
└── package.json
```

---

## 🔧 实现步骤

### Step 1: 创建项目

```bash
npx create-next-app@latest nextjs-blog --app --src-dir=false
cd nextjs-blog
npm install gray-matter remark remark-html zustand
```

### Step 2: 文章数据层 (`lib/posts.js`)

```javascript
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDir = path.join(process.cwd(), "content");

export function getAllPosts() {
  const files = fs.readdirSync(postsDir);
  return files
    .filter((f) => f.endsWith(".md"))
    .map((filename) => {
      const slug = filename.replace(".md", "");
      const { data } = matter(
        fs.readFileSync(path.join(postsDir, filename), "utf8"),
      );
      return { slug, ...data };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function getPostBySlug(slug) {
  const { data, content } = matter(
    fs.readFileSync(path.join(postsDir, slug + ".md"), "utf8"),
  );
  const { remark } = await import("remark");
  const { default: html } = await import("remark-html");
  const result = await remark().use(html).process(content);
  return { slug, content: result.toString(), ...data };
}
```

### Step 3: 首页 (服务端组件)

```jsx
// app/page.jsx (服务端组件，默认)
import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export const metadata = { title: "我的博客", description: "Next.js SSG 博客" };

export default function Home() {
  const posts = getAllPosts();
  return (
    <main>
      <h1>最新文章</h1>
      <div className="grid">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </main>
  );
}
```

### Step 4: 文章详情 (SSG + generateStaticParams)

```jsx
// app/blog/[slug]/page.jsx
import { getPostBySlug, getAllPosts } from "@/lib/posts";

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug);
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPost({ params }) {
  const post = await getPostBySlug(params.slug);
  return (
    <article>
      <h1>{post.title}</h1>
      <time>{post.date}</time>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
```

### Step 5: 暗色模式 (客户端组件 + Zustand)

```javascript
// lib/store.js
"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: "light",
      toggle: () =>
        set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
    }),
    { name: "theme" },
  ),
);
```

---

## ✅ 验收标准

1. [ ] `npm run build` 成功构建
2. [ ] 首页展示文章列表 (SSG)
3. [ ] 文章详情页正确渲染 Markdown
4. [ ] generateStaticParams 预生成所有文章页
5. [ ] 暗色模式切换正常
6. [ ] HTML head 包含正确的 SEO 元数据

---

## 🌟 进阶挑战

- [ ] 添加 RSS 订阅 (route handler)
- [ ] 实现文章搜索 (客户端组件)
- [ ] 添加评论系统 (API route + 数据库)
- [ ] 部署到 Vercel
- [ ] 添加 ISR (revalidate) 支持
