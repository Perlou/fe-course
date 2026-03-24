# 🛍️ 电商数据库设计实战

## 项目概述

设计并实现一个完整的电商系统数据库，掌握关系型数据库设计的核心技能。

## 功能需求

### 核心模块

1. **用户系统** — 注册、登录、个人信息、收货地址
2. **商品系统** — 分类、商品信息、库存管理
3. **订单系统** — 下单、支付、发货、完成
4. **购物车** — 添加、修改、删除商品
5. **评价系统** — 商品评价与评分

### 数据模型

```
核心实体:
  users          → 用户
  addresses      → 收货地址 (N:1 users)
  categories     → 商品分类 (自引用树形结构)
  products       → 商品 (N:1 categories)
  cart_items     → 购物车 (N:1 users, N:1 products)
  orders         → 订单 (N:1 users)
  order_items    → 订单项 (N:1 orders, N:1 products)
  reviews        → 评价 (N:1 users, N:1 products)
```

## 实现步骤

### Step 1: 设计 E-R 图

绘制所有实体及其关系，标注 1:1、1:N、N:M。

### Step 2: 编写 Prisma Schema

```prisma
// 使用 Prisma Schema 定义所有模型
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  name      String
  addresses Address[]
  orders    Order[]
  cartItems CartItem[]
  reviews   Review[]
}
```

### Step 3: 设计索引

为高频查询场景设计合理的索引：
- 用户登录 (email)
- 商品列表 (category_id + status)
- 订单查询 (user_id + status)
- 商品搜索 (name 全文索引)

### Step 4: 实现核心查询

- 商品列表分页查询
- 订单创建事务（扣库存 + 创建订单 + 清空购物车）
- 订单取消事务（恢复库存 + 更新状态）
- 商品销量统计（聚合查询）

## 学习要点

- [ ] 实体关系分析与 E-R 图
- [ ] 三大范式与适当反范式
- [ ] 外键约束与级联操作
- [ ] 复合索引设计
- [ ] 事务处理（库存扣减）
- [ ] 乐观锁（并发库存控制）
- [ ] 数据快照（订单历史）

## 进阶挑战

- [ ] 使用 SQLite + Prisma 实现完整 CRUD API
- [ ] 添加 Redis 缓存层（商品列表缓存）
- [ ] 实现秒杀场景（并发库存控制）
- [ ] 添加全文搜索功能
