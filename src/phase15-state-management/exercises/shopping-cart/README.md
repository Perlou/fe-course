# 🛒 购物车状态管理实战

## 项目概述

通过实现一个完整的购物车功能，掌握状态管理的核心概念和最佳实践。

提供两个版本供选择：
- **React + Zustand** — React 生态现代状态管理
- **Vue + Pinia** — Vue 官方状态管理方案

## 功能需求

### 核心功能

1. **商品列表** — 展示商品，支持加入购物车
2. **购物车** — 显示已添加商品、修改数量、删除商品
3. **价格计算** — 实时计算总价、折扣、运费
4. **持久化** — 购物车数据保存到 localStorage
5. **用户认证** — 简单的登录/退出功能

### 状态设计

```
┌─────────────────────────────────────────────┐
│               应用状态结构                    │
├─────────────────────────────────────────────┤
│                                             │
│  Auth Store:                                │
│  ├── user: { id, name, email } | null       │
│  ├── token: string                          │
│  ├── isLoggedIn: boolean (computed)         │
│  ├── login(credentials)                     │
│  └── logout()                               │
│                                             │
│  Product Store:                             │
│  ├── products: Product[]                    │
│  ├── loading: boolean                       │
│  ├── searchQuery: string                    │
│  ├── filteredProducts: Product[] (computed)  │
│  └── fetchProducts()                        │
│                                             │
│  Cart Store:                                │
│  ├── items: CartItem[]                      │
│  ├── totalPrice: number (computed)          │
│  ├── totalItems: number (computed)          │
│  ├── addItem(product)                       │
│  ├── removeItem(productId)                  │
│  ├── updateQuantity(productId, qty)         │
│  └── clearCart()                            │
│                                             │
└─────────────────────────────────────────────┘
```

### 数据模型

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}
```

## 学习要点

- [ ] 状态拆分：按业务领域划分 Store
- [ ] 派生状态：使用 getter/selector 计算总价等
- [ ] Store 间通信：购物车检查用户登录状态
- [ ] 持久化：购物车数据存入 localStorage
- [ ] 性能优化：精确订阅避免不必要重渲染

## 进阶挑战

- [ ] 添加**乐观更新**：先更新 UI，再同步服务端
- [ ] 实现**撤销/重做**：使用 Zustand 中间件或 Pinia 插件
- [ ] 添加**离线支持**：离线时可操作，联网后同步
- [ ] 使用 TanStack Query 管理商品数据（服务端状态）
