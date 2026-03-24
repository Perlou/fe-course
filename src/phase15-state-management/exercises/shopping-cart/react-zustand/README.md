# React + Zustand 购物车实现指南

## 技术栈

- React 18+
- Zustand
- zustand/middleware (persist, devtools)

## 项目结构

```
react-zustand/
├── src/
│   ├── stores/
│   │   ├── authStore.js       # 用户认证
│   │   ├── productStore.js    # 商品数据
│   │   └── cartStore.js       # 购物车
│   ├── components/
│   │   ├── ProductList.jsx
│   │   ├── ProductCard.jsx
│   │   ├── Cart.jsx
│   │   ├── CartItem.jsx
│   │   └── Header.jsx
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

## 实现步骤

### Step 1: 创建 Auth Store

```javascript
// stores/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      login: async (username, password) => {
        // 模拟 API
        const user = { id: 1, name: username, email: `${username}@example.com` };
        set({ user, token: 'fake-jwt-token' });
      },

      logout: () => set({ user: null, token: null }),
    }),
    { name: 'auth-storage', partialize: (state) => ({ token: state.token }) }
  )
);
```

### Step 2: 创建 Cart Store

```javascript
// stores/cartStore.js
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { useAuthStore } from './authStore';

export const useCartStore = create(
  devtools(
    persist(
      (set, get) => ({
        items: [],

        // 计算属性通过函数实现
        getTotalPrice: () =>
          get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),

        getTotalItems: () =>
          get().items.reduce((sum, item) => sum + item.quantity, 0),

        addItem: (product) => {
          // 跨 Store: 检查登录状态
          const { user } = useAuthStore.getState();
          if (!user) { alert('请先登录'); return; }

          set((state) => {
            const existing = state.items.find((i) => i.product.id === product.id);
            if (existing) {
              return {
                items: state.items.map((i) =>
                  i.product.id === product.id
                    ? { ...i, quantity: i.quantity + 1 }
                    : i
                ),
              };
            }
            return { items: [...state.items, { product, quantity: 1 }] };
          });
        },

        removeItem: (productId) =>
          set((state) => ({
            items: state.items.filter((i) => i.product.id !== productId),
          })),

        updateQuantity: (productId, quantity) =>
          set((state) => ({
            items: quantity <= 0
              ? state.items.filter((i) => i.product.id !== productId)
              : state.items.map((i) =>
                  i.product.id === productId ? { ...i, quantity } : i
                ),
          })),

        clearCart: () => set({ items: [] }),
      }),
      { name: 'cart-storage' }
    ),
    { name: 'CartStore' }
  )
);
```

### Step 3: 组件中使用 Selector

```jsx
// components/Cart.jsx
function Cart() {
  // ✅ 精确订阅
  const items = useCartStore((s) => s.items);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);
  const clearCart = useCartStore((s) => s.clearCart);

  return (
    <div>
      <h2>购物车 ({items.length})</h2>
      {items.map((item) => (
        <CartItem key={item.product.id} item={item} />
      ))}
      <p>总价: ¥{getTotalPrice()}</p>
      <button onClick={clearCart}>清空购物车</button>
    </div>
  );
}
```

## 关键知识点

1. **Selector 精确订阅** — 只订阅需要的状态片段
2. **中间件组合** — devtools + persist 配合使用
3. **跨 Store 通信** — 通过 `getState()` 读取其他 Store
4. **持久化** — 使用 `partialize` 只持久化必要数据
