# Phase 15: 状态管理专题

> **目标**：深入理解状态管理原理与最佳实践  
> **预计时长**：1 周

---

## 📚 本阶段内容

### 学习目标

1. 理解 Flux 架构与状态管理设计模式
2. 掌握 Redux 核心原理与中间件机制
3. 掌握 Zustand（React 现代方案）与 Pinia（Vue 官方方案）
4. 理解原子化状态管理（Jotai / Recoil）
5. 掌握服务端状态管理（TanStack Query / SWR）
6. 学会根据项目需求选择合适的状态管理方案

### 知识要点

- Flux 单向数据流架构
- 状态分类（Local / Shared / Server / URL / Form）
- Redux 三大原则与手写实现
- Zustand：极简 Store、Selector、中间件
- Pinia：Option Store vs Setup Store
- Jotai / Recoil：原子化状态
- TanStack Query / SWR：服务端状态缓存
- 状态管理最佳实践与选型策略

### 实战项目

**购物车状态管理**：分别用 React + Zustand 和 Vue + Pinia 实现完整购物车

---

## 📂 目录结构

```
phase15-state-management/
├── CONCEPT.md
├── README.md
├── examples/
│   ├── 01-redux-concepts.js     # Redux 核心原理
│   ├── 02-zustand.js            # Zustand 状态管理
│   ├── 03-pinia.js              # Pinia 状态管理
│   ├── 04-atomic-state.js       # 原子化状态管理
│   └── 05-server-state.js       # 服务端状态管理
└── exercises/
    └── shopping-cart/            # 购物车实战项目
        ├── README.md
        ├── react-zustand/
        │   └── README.md
        └── vue-pinia/
            └── README.md
```

---

## 🎯 核心概念速览

### Flux 架构

```
View → Action → Dispatcher → Store → View
 ↑                                    ↓
 └────────────────────────────────────┘
```

### 状态分类

```
Local State     → 组件内部状态（useState / ref）
Shared State    → 跨组件共享（Redux / Zustand / Pinia）
Server State    → API 数据缓存（TanStack Query / SWR）
URL State       → 路由参数（React Router / Vue Router）
Form State      → 表单管理（React Hook Form / Formik）
```

### 方案选型速查

```
简单应用 → Context / provide-inject
中等复杂度 → Zustand (React) / Pinia (Vue)
大型应用 → Redux Toolkit + RTK Query
细粒度更新 → Jotai / Recoil
服务端数据 → TanStack Query / SWR
```

---

> 完成本阶段后，你应该能够根据项目需求设计和实现完整的状态管理方案。
