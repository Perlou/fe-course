# Vue + Pinia 购物车实现指南

## 技术栈

- Vue 3 (Composition API)
- Pinia
- pinia-plugin-persistedstate

## 项目结构

```
vue-pinia/
├── src/
│   ├── stores/
│   │   ├── auth.js            # 用户认证
│   │   ├── product.js         # 商品数据
│   │   └── cart.js            # 购物车
│   ├── components/
│   │   ├── ProductList.vue
│   │   ├── ProductCard.vue
│   │   ├── CartDrawer.vue
│   │   ├── CartItem.vue
│   │   └── AppHeader.vue
│   ├── App.vue
│   └── main.js
└── package.json
```

## 实现步骤

### Step 1: 创建 Auth Store (Setup Store)

```javascript
// stores/auth.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref('');

  const isLoggedIn = computed(() => !!user.value);
  const displayName = computed(() => user.value?.name || '游客');

  async function login(username, password) {
    // 模拟 API
    user.value = { id: 1, name: username, email: `${username}@example.com` };
    token.value = 'fake-jwt-token';
  }

  function logout() {
    user.value = null;
    token.value = '';
  }

  return { user, token, isLoggedIn, displayName, login, logout };
}, {
  persist: { paths: ['token'] },
});
```

### Step 2: 创建 Cart Store (Setup Store)

```javascript
// stores/cart.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from './auth';

export const useCartStore = defineStore('cart', () => {
  const items = ref([]);

  // Getters (computed)
  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );

  const totalItems = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  );

  // Actions
  function addItem(product) {
    const authStore = useAuthStore();
    if (!authStore.isLoggedIn) { alert('请先登录'); return; }

    const existing = items.value.find((i) => i.product.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      items.value.push({ product, quantity: 1 });
    }
  }

  function removeItem(productId) {
    items.value = items.value.filter((i) => i.product.id !== productId);
  }

  function updateQuantity(productId, quantity) {
    if (quantity <= 0) return removeItem(productId);
    const item = items.value.find((i) => i.product.id === productId);
    if (item) item.quantity = quantity;
  }

  function clearCart() { items.value = []; }

  return { items, totalPrice, totalItems, addItem, removeItem, updateQuantity, clearCart };
}, {
  persist: true,
});
```

### Step 3: 组件中使用 storeToRefs

```vue
<!-- components/CartDrawer.vue -->
<script setup>
import { useCartStore } from '@/stores/cart';
import { storeToRefs } from 'pinia';

const cartStore = useCartStore();

// ✅ storeToRefs 保持响应性
const { items, totalPrice, totalItems } = storeToRefs(cartStore);

// ✅ actions 直接解构
const { removeItem, updateQuantity, clearCart } = cartStore;
</script>

<template>
  <div class="cart-drawer">
    <h2>购物车 ({{ totalItems }})</h2>

    <div v-for="item in items" :key="item.product.id" class="cart-item">
      <span>{{ item.product.name }}</span>
      <div class="quantity">
        <button @click="updateQuantity(item.product.id, item.quantity - 1)">-</button>
        <span>{{ item.quantity }}</span>
        <button @click="updateQuantity(item.product.id, item.quantity + 1)">+</button>
      </div>
      <span>¥{{ item.product.price * item.quantity }}</span>
      <button @click="removeItem(item.product.id)">删除</button>
    </div>

    <div class="cart-footer">
      <p>总价: ¥{{ totalPrice }}</p>
      <button @click="clearCart">清空购物车</button>
    </div>
  </div>
</template>
```

## 关键知识点

1. **Setup Store** — 使用 Composition API 风格定义 Store
2. **storeToRefs** — 解构时保持响应性
3. **computed 作为 getter** — 自动缓存计算结果
4. **跨 Store 通信** — 在 action 中直接调用其他 Store
5. **Pinia 持久化** — 使用 `persist` 选项自动同步 localStorage
