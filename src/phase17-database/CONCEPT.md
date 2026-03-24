# 数据库深入解析

## 📌 一、SQL 基础

### 1. 常用查询

```sql
-- 基本查询
SELECT id, name, email FROM users;
SELECT * FROM users WHERE age > 18;
SELECT * FROM users WHERE name LIKE 'A%';
SELECT * FROM users WHERE age BETWEEN 18 AND 30;
SELECT * FROM users WHERE status IN ('active', 'pending');
SELECT * FROM users WHERE email IS NOT NULL;
SELECT DISTINCT status FROM users;

-- 排序与限制
SELECT * FROM users ORDER BY created_at DESC;
SELECT * FROM users ORDER BY name ASC, age DESC;
SELECT * FROM users LIMIT 10 OFFSET 20;

-- 聚合函数
SELECT COUNT(*) FROM users;
SELECT AVG(age) FROM users;
SELECT SUM(amount) FROM orders;
SELECT MIN(price), MAX(price) FROM products;

-- 分组
SELECT status, COUNT(*) as total FROM users GROUP BY status;
SELECT status, COUNT(*) as total FROM users
  GROUP BY status HAVING COUNT(*) > 10;
```

### 2. JOIN 连接

```sql
-- INNER JOIN: 两边都匹配
SELECT u.name, p.title
FROM users u
INNER JOIN posts p ON u.id = p.user_id;

-- LEFT JOIN: 左表全保留
SELECT u.name, COALESCE(COUNT(p.id), 0) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
GROUP BY u.id, u.name;

-- RIGHT JOIN: 右表全保留
SELECT u.name, o.total
FROM users u
RIGHT JOIN orders o ON u.id = o.user_id;

-- 多表连接
SELECT u.name, p.title, c.name as category
FROM users u
JOIN posts p ON u.id = p.user_id
JOIN categories c ON p.category_id = c.id
WHERE p.published = true;
```

```
┌────────────────────────────────────────────────────┐
│                   JOIN 可视化                       │
├────────────────────────────────────────────────────┤
│                                                    │
│  INNER JOIN      LEFT JOIN       FULL OUTER JOIN   │
│   ┌───┬───┐      ┌───┬───┐      ┌───┬───┐        │
│   │   │███│      │███│███│      │███│███│        │
│   │   │███│      │███│███│      │███│███│        │
│   └───┴───┘      └───┴───┘      └───┴───┘        │
│    A   B          A   B          A   B            │
│   仅交集         A全部+交集    A全部+B全部        │
│                                                    │
└────────────────────────────────────────────────────┘
```

### 3. 子查询与窗口函数

```sql
-- 子查询
SELECT * FROM users WHERE id IN (
  SELECT user_id FROM orders WHERE amount > 100
);

-- EXISTS
SELECT * FROM users u WHERE EXISTS (
  SELECT 1 FROM posts p WHERE p.user_id = u.id AND p.published = true
);

-- 窗口函数 (高级)
-- ROW_NUMBER: 行号
SELECT name, department, salary,
  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as rank
FROM employees;

-- RANK: 排名 (允许并列)
SELECT name, score,
  RANK() OVER (ORDER BY score DESC) as ranking
FROM students;

-- 移动平均
SELECT date, revenue,
  AVG(revenue) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as weekly_avg
FROM daily_sales;
```

### 4. 增删改与事务

```sql
-- 插入
INSERT INTO users (name, email, age) VALUES ('Alice', 'a@test.com', 25);
INSERT INTO users (name, email) VALUES
  ('Bob', 'b@test.com'),
  ('Charlie', 'c@test.com');

-- 更新
UPDATE users SET age = 26 WHERE id = 1;
UPDATE users SET status = 'inactive' WHERE last_login < '2024-01-01';

-- 删除
DELETE FROM users WHERE id = 1;

-- UPSERT (冲突时更新)
INSERT INTO users (email, name) VALUES ('a@test.com', 'Alice')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name;

-- 事务
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;    -- 或 ROLLBACK;
```

---

## 📌 二、数据库设计

### 1. 三大范式

```
第一范式 (1NF): 属性不可再分
  ❌ 联系方式: "手机:123, 邮箱:a@test.com"
  ✅ 手机: "123", 邮箱: "a@test.com"

第二范式 (2NF): 非主键列完全依赖主键
  ❌ 订单表(订单ID, 商品ID, 商品名称, 数量)
  ✅ 订单表(订单ID, 商品ID, 数量) + 商品表(商品ID, 商品名称)

第三范式 (3NF): 非主键列不传递依赖
  ❌ 用户表(用户ID, 部门ID, 部门名称)
  ✅ 用户表(用户ID, 部门ID) + 部门表(部门ID, 部门名称)
```

### 2. 反范式化

```
何时反范式化:
• 读多写少的场景
• 频繁 JOIN 影响性能
• 数据量巨大的报表查询

常见手段:
• 冗余字段 (避免 JOIN)
• 预计算字段 (如 order_count)
• 宽表 (合并多个表)

权衡:
  范式化 → 数据一致性好，写操作简单，存储空间小
  反范式 → 查询性能好，但写操作需维护冗余，存储空间大
```

### 3. E-R 图设计

```
┌─────────┐     1:N     ┌─────────┐     N:M     ┌─────────┐
│  用户    │────────────│  订单    │────────────│  商品    │
│  User    │            │  Order   │            │ Product  │
└────┬────┘            └─────────┘            └────┬────┘
     │ 1:1                                         │ N:1
┌────┴────┐                                   ┌────┴────┐
│ 用户详情 │                                   │  分类    │
│ Profile  │                                   │ Category │
└─────────┘                                   └─────────┘

关系类型:
  一对一: users ↔ profiles (userId UNIQUE)
  一对多: users → posts (userId FK)
  多对多: orders ↔ products (通过 order_items 中间表)
```

---

## 📌 三、索引优化

### 1. B+ 树索引原理

```
┌──────────────────────────────────────────────────┐
│              B+ 树索引结构                        │
├──────────────────────────────────────────────────┤
│                                                  │
│           [10, 20, 30]         ← 根节点           │
│          /     |      \                          │
│   [1,5,8] [12,15,18] [22,25,28]  ← 叶子节点      │
│      ↓        ↓         ↓                        │
│   数据行    数据行     数据行      ← 实际数据      │
│                                                  │
│   叶子节点通过链表相连，支持范围查询              │
│                                                  │
│   查找 id=15:                                    │
│   根节点 → 10<15<20 → 中间分支 → 找到 15          │
│   时间复杂度: O(log N)                           │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 2. 索引类型

```sql
-- 主键索引 (聚簇索引)
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT
);

-- 唯一索引
CREATE UNIQUE INDEX idx_email ON users(email);

-- 普通索引
CREATE INDEX idx_name ON users(name);

-- 复合索引
CREATE INDEX idx_name_age ON users(name, age);

-- 全文索引
CREATE FULLTEXT INDEX idx_content ON posts(title, content);
```

### 3. 最左前缀原则

```
复合索引: (a, b, c)

✅ WHERE a = 1                       → 使用索引
✅ WHERE a = 1 AND b = 2             → 使用索引
✅ WHERE a = 1 AND b = 2 AND c = 3   → 使用索引
✅ WHERE a = 1 ORDER BY b            → 使用索引
❌ WHERE b = 2                       → 无法使用
❌ WHERE b = 2 AND c = 3             → 无法使用
❌ WHERE a = 1 AND c = 3             → a 可使用，c 无法
```

### 4. 查询优化

```sql
-- 使用 EXPLAIN 分析
EXPLAIN SELECT * FROM users WHERE name = 'Alice';

-- 避免 SELECT *
SELECT id, name FROM users;

-- 避免在索引列上使用函数
❌ WHERE YEAR(created_at) = 2024
✅ WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'

-- 避免 OR，使用 IN
❌ WHERE status = 'a' OR status = 'b'
✅ WHERE status IN ('a', 'b')

-- 分页优化 (游标分页)
❌ SELECT * FROM posts ORDER BY id LIMIT 100000, 10;
✅ SELECT * FROM posts WHERE id > 100000 ORDER BY id LIMIT 10;

-- 覆盖索引 (无需回表)
CREATE INDEX idx_name_email ON users(name, email);
SELECT name, email FROM users WHERE name = 'Alice';  -- 仅从索引获取
```

---

## 📌 四、Prisma ORM

### 1. Schema 定义

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  posts     Post[]
  profile   Profile?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
  @@map("users")
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  tags      Tag[]
  createdAt DateTime @default(now())

  @@index([authorId])
  @@map("posts")
}

model Profile {
  id     Int    @id @default(autoincrement())
  bio    String?
  user   User   @relation(fields: [userId], references: [id])
  userId Int    @unique
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[]
}

enum Role {
  USER
  ADMIN
}
```

### 2. 增删改查

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 创建 (含关联)
const user = await prisma.user.create({
  data: {
    email: 'alice@test.com',
    name: 'Alice',
    posts: {
      create: [
        { title: 'First Post' },
        { title: 'Second Post' },
      ],
    },
  },
  include: { posts: true },
});

// 查询
const users = await prisma.user.findMany({
  where: { email: { contains: 'test' } },
  include: { posts: true, profile: true },
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: 0,
});

const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: { posts: { where: { published: true } } },
});

// 更新
await prisma.user.update({
  where: { id: 1 },
  data: { name: 'New Name' },
});

// upsert
await prisma.user.upsert({
  where: { email: 'alice@test.com' },
  update: { name: 'Alice Updated' },
  create: { email: 'alice@test.com', name: 'Alice' },
});

// 删除
await prisma.user.delete({ where: { id: 1 } });

// 事务
const [user, post] = await prisma.$transaction([
  prisma.user.create({ data: { email: 'a@test.com' } }),
  prisma.post.create({ data: { title: 'Post', authorId: 1 } }),
]);

// 交互式事务
await prisma.$transaction(async (tx) => {
  const sender = await tx.account.update({
    where: { id: 1 },
    data: { balance: { decrement: 100 } },
  });
  if (sender.balance < 0) throw new Error('余额不足');
  await tx.account.update({
    where: { id: 2 },
    data: { balance: { increment: 100 } },
  });
});
```

### 3. 迁移

```bash
# 创建迁移
npx prisma migrate dev --name init

# 应用迁移 (生产)
npx prisma migrate deploy

# 重置数据库
npx prisma migrate reset

# 生成客户端
npx prisma generate

# Prisma Studio (可视化管理)
npx prisma studio
```

---

## 📌 五、MongoDB 与 Mongoose

### 1. MongoDB 基本操作

```javascript
const { MongoClient } = require('mongodb');

const client = new MongoClient('mongodb://localhost:27017');
await client.connect();
const db = client.db('mydb');
const users = db.collection('users');

// 插入
await users.insertOne({ name: 'Alice', age: 25, tags: ['js', 'react'] });
await users.insertMany([{ name: 'Bob' }, { name: 'Charlie' }]);

// 查询
const user = await users.findOne({ name: 'Alice' });
const allUsers = await users.find({ age: { $gt: 18 } }).toArray();

// 查询操作符
await users.find({ age: { $gte: 18, $lte: 30 } });   // 范围
await users.find({ tags: { $in: ['js', 'vue'] } });    // 包含
await users.find({ $or: [{ age: 25 }, { name: 'Bob' }] }); // 或

// 更新
await users.updateOne({ name: 'Alice' }, { $set: { age: 26 } });
await users.updateOne({ name: 'Alice' }, { $push: { tags: 'vue' } });
await users.updateOne({ name: 'Alice' }, { $inc: { age: 1 } });

// 删除
await users.deleteOne({ name: 'Alice' });
```

### 2. Mongoose Schema

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true },
  email: { type: String, unique: true, lowercase: true },
  age:   { type: Number, min: 0, max: 150 },
  role:  { type: String, enum: ['user', 'admin'], default: 'user' },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
}, { timestamps: true });

// 虚拟属性
userSchema.virtual('displayName').get(function () {
  return `${this.name} (${this.role})`;
});

// 实例方法
userSchema.methods.isAdmin = function () {
  return this.role === 'admin';
};

// 静态方法
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email });
};

// 中间件 (钩子)
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model('User', userSchema);

// 使用
const user = await User.create({ name: 'Alice', email: 'a@test.com' });
const users = await User.find({ age: { $gt: 18 } }).populate('posts');
await User.findByIdAndUpdate(id, { name: 'New' }, { new: true });
```

### 3. 聚合管道

```javascript
// 统计每个分类的文章数
const stats = await Post.aggregate([
  { $match: { published: true } },
  { $group: { _id: '$category', count: { $sum: 1 }, avgViews: { $avg: '$views' } } },
  { $sort: { count: -1 } },
  { $limit: 10 },
]);
```

---

## 📌 六、Redis 缓存

### 1. 数据结构

```javascript
const Redis = require('ioredis');
const redis = new Redis();

// 字符串
await redis.set('key', 'value');
await redis.set('key', 'value', 'EX', 3600);  // 过期时间
const value = await redis.get('key');

// 哈希 (对象)
await redis.hset('user:1', 'name', 'Alice', 'age', '25');
const user = await redis.hgetall('user:1');

// 列表 (队列)
await redis.lpush('queue', 'item1', 'item2');
const item = await redis.rpop('queue');

// 集合 (去重)
await redis.sadd('tags', 'js', 'react', 'vue');
const tags = await redis.smembers('tags');

// 有序集合 (排行榜)
await redis.zadd('leaderboard', 100, 'alice', 200, 'bob');
const top = await redis.zrevrange('leaderboard', 0, 9, 'WITHSCORES');
```

### 2. 缓存策略

```
┌──────────────────────────────────────────────────────────┐
│                   缓存策略                                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Cache Aside (旁路缓存) — 最常用                         │
│  读: 先查缓存 → 命中返回 / 未命中查DB → 写入缓存         │
│  写: 更新DB → 删除缓存                                   │
│                                                          │
│  Read Through (读穿透)                                   │
│  读: 查缓存 → 未命中由缓存层自动查DB                     │
│                                                          │
│  Write Through (写穿透)                                  │
│  写: 写缓存 → 缓存层同步写DB                             │
│                                                          │
│  Write Behind (异步写回)                                 │
│  写: 写缓存 → 缓存层异步批量写DB                         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 3. 缓存常见问题

```
┌──────────────┬────────────────────┬────────────────────┐
│ 问题          │ 描述                │ 解决方案           │
├──────────────┼────────────────────┼────────────────────┤
│ 缓存穿透     │ 查询不存在的数据    │ 布隆过滤器/空值缓存│
│ 缓存击穿     │ 热点 key 过期       │ 互斥锁/永不过期    │
│ 缓存雪崩     │ 大量 key 同时过期   │ 随机过期时间       │
└──────────────┴────────────────────┴────────────────────┘
```

```javascript
// Cache Aside 模式实现
async function getUser(id) {
  // 1. 查缓存
  const cached = await redis.get(`user:${id}`);
  if (cached) return JSON.parse(cached);

  // 2. 查数据库
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return null;

  // 3. 写缓存 (随机过期时间防雪崩)
  const ttl = 3600 + Math.random() * 600;
  await redis.set(`user:${id}`, JSON.stringify(user), 'EX', Math.floor(ttl));

  return user;
}

// 更新时删除缓存
async function updateUser(id, data) {
  await prisma.user.update({ where: { id }, data });
  await redis.del(`user:${id}`);   // 删除旧缓存
}
```

---

## 📌 七、事务与并发控制

### 1. ACID 特性

```
A — Atomicity   (原子性): 全部成功或全部回滚
C — Consistency (一致性): 数据始终满足约束
I — Isolation   (隔离性): 并发事务互不干扰
D — Durability  (持久性): 提交后数据永久保存
```

### 2. 隔离级别

```
┌──────────────────┬───────┬────────────┬──────────┐
│ 隔离级别          │ 脏读  │ 不可重复读  │ 幻读     │
├──────────────────┼───────┼────────────┼──────────┤
│ READ UNCOMMITTED │  ✅   │    ✅      │   ✅     │
│ READ COMMITTED   │  ❌   │    ✅      │   ✅     │
│ REPEATABLE READ  │  ❌   │    ❌      │   ✅     │
│ SERIALIZABLE     │  ❌   │    ❌      │   ❌     │
└──────────────────┴───────┴────────────┴──────────┘

PostgreSQL 默认: READ COMMITTED
MySQL InnoDB 默认: REPEATABLE READ
```

### 3. 乐观锁与悲观锁

```javascript
// 乐观锁: 使用版本号
await prisma.product.update({
  where: { id: 1, version: currentVersion },  // 版本匹配才更新
  data: { stock: newStock, version: { increment: 1 } },
});

// 悲观锁: SELECT ... FOR UPDATE
await prisma.$queryRaw`
  SELECT * FROM products WHERE id = 1 FOR UPDATE
`;
```

---

## 📌 八、SQL vs NoSQL 选型

```
┌──────────────────┬──────────────────┬──────────────────┐
│                  │ SQL (关系型)      │ NoSQL (非关系型)  │
├──────────────────┼──────────────────┼──────────────────┤
│ 数据模型         │ 表 + 行 + 列      │ 文档/键值/图      │
│ Schema           │ 强 Schema        │ 灵活/无 Schema    │
│ 查询语言         │ SQL              │ API / 查询对象    │
│ 关联查询         │ JOIN (强大)       │ 嵌套/引用 (有限)  │
│ 事务             │ 完整 ACID        │ 部分支持          │
│ 扩展方式         │ 垂直扩展为主      │ 水平扩展为主      │
│ 一致性           │ 强一致性          │ 最终一致性        │
│ 代表             │ PostgreSQL/MySQL │ MongoDB/Redis     │
│ 适合场景         │ 复杂关联、金融    │ 灵活数据、高并发  │
└──────────────────┴──────────────────┴──────────────────┘

选型建议:
• 用户系统、订单系统、金融 → PostgreSQL
• 内容管理、IoT、日志 → MongoDB
• 缓存、会话、排行榜 → Redis
• 全文搜索 → Elasticsearch
• 多种数据库组合使用是常见做法
```

---

## 📚 推荐学习资源

| 资源          | 链接                    |
| ------------- | ----------------------- |
| PostgreSQL    | postgresql.org          |
| Prisma        | prisma.io/docs          |
| MongoDB       | mongodb.com/docs        |
| Mongoose      | mongoosejs.com          |
| Redis         | redis.io                |
| SQL 练习      | sqlzoo.net              |

---
