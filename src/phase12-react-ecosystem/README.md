# Phase 12: React 生态

> **目标**：掌握 React 生态系统  
> **预计时长**：2 周

---

## 📚 本阶段内容

### 学习目标

1. 掌握 React Router
2. 理解状态管理方案
3. 学习 SSR 与 Next.js
4. 掌握性能优化技巧

### 知识要点

- React Router v6
- Context/Redux/Zustand
- SSR/SSG 原理
- Next.js App Router
- React 性能优化

### 实战项目

**React SSR 博客**：使用 Next.js 构建博客

---

## 📂 目录结构

```
phase12-react-ecosystem/
├── CONCEPT.md
├── README.md
├── examples/
│   ├── 01-router.jsx
│   ├── 02-redux.js
│   ├── 03-zustand.js
│   └── 04-performance.jsx
└── exercises/
    └── nextjs-blog/
```

---

## 🎯 核心概念速览

### React Router

```jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/user/:id" element={<User />} />
</Routes>
```

### Zustand

```javascript
const useStore = create((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}));
```

---

> 完成本阶段后，你应该能够构建完整的 React 应用。
