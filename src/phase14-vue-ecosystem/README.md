# Phase 14: Vue 生态

> **目标**：掌握 Vue 生态系统  
> **预计时长**：2 周

---

## 📚 本阶段内容

### 学习目标

1. 掌握 Vue Router
2. 理解 Pinia 状态管理
3. 学习 Nuxt.js SSR
4. 了解 Vue 性能优化

### 知识要点

- Vue Router 4
- Pinia
- Nuxt 3
- 组件通信方式
- 性能优化

### 实战项目

**Vue SSR 应用**：使用 Nuxt 构建全栈应用

---

## 📂 目录结构

```
phase14-vue-ecosystem/
├── CONCEPT.md
├── README.md
├── examples/
│   ├── 01-router.vue
│   ├── 02-pinia.js
│   ├── 03-composables.js
│   └── 04-nuxt.vue
└── exercises/
    └── nuxt-app/
```

---

## 🎯 核心概念速览

### Vue Router

```javascript
const routes = [
  { path: "/", component: Home },
  { path: "/user/:id", component: User },
];
```

### Pinia

```javascript
const useStore = defineStore("main", {
  state: () => ({ count: 0 }),
  actions: {
    increment() {
      this.count++;
    },
  },
});
```

---

> 完成本阶段后，你应该能够构建完整的 Vue 应用。
