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
SELECT status, COUNT(*) FROM users GROUP BY status;
SELECT status, COUNT(*) FROM users GROUP BY status HAVING COUNT(*) > 10;

-- 连接
SELECT u.name, p.title
FROM users u
INNER JOIN posts p ON u.id = p.user_id;

SELECT u.name, p.title
FROM users u
LEFT JOIN posts p ON u.id = p.user_id;

-- 子查询
SELECT * FROM users WHERE id IN (
  SELECT user_id FROM orders WHERE amount > 100
);
```

### 2. 增删改

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
DELETE FROM users WHERE status = 'deleted';

-- 事务
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
-- 或 ROLLBACK;
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

### 2. E-R 图设计

```
用户 ───< 订单 >─── 商品
 │                    │
 │                    │
 └───< 收货地址       └─── 分类

一对一: 用户 - 用户详情
一对多: 用户 - 订单
多对多: 订单 - 商品 (通过订单项关联)
```

---

## 📌 三、索引优化

### 1. 索引类型

```sql
-- 主键索引
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

### 2. 最左前缀原则

```
复合索引: (a, b, c)

✅ WHERE a = 1
✅ WHERE a = 1 AND b = 2
✅ WHERE a = 1 AND b = 2 AND c = 3
❌ WHERE b = 2
❌ WHERE b = 2 AND c = 3
❌ WHERE a = 1 AND c = 3  (c 无法使用索引)
```

### 3. 查询优化

```sql
-- 使用 EXPLAIN 分析
EXPLAIN SELECT * FROM users WHERE name = 'Alice';

-- 避免 SELECT *
SELECT id, name FROM users;

-- 避免在索引列上使用函数
❌ WHERE YEAR(created_at) = 2024
✅ WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'

-- 避免 OR，使用 UNION
❌ WHERE status = 'a' OR status = 'b'
✅ WHERE status IN ('a', 'b')

-- 分页优化
❌ SELECT * FROM posts ORDER BY id LIMIT 100000, 10;
✅ SELECT * FROM posts WHERE id > 100000 ORDER BY id LIMIT 10;
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
  posts     Post[]
  profile   Profile?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
}

model Profile {
  id     Int    @id @default(autoincrement())
  bio    String?
  user   User   @relation(fields: [userId], references: [id])
  userId Int    @unique
}
```

### 2. 增删改查

```javascript
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 创建
const user = await prisma.user.create({
  data: {
    email: "alice@test.com",
    name: "Alice",
    posts: {
      create: [{ title: "First Post" }, { title: "Second Post" }],
    },
  },
  include: { posts: true },
});

// 查询
const users = await prisma.user.findMany({
  where: { email: { contains: "test" } },
  include: { posts: true },
  orderBy: { createdAt: "desc" },
  take: 10,
  skip: 0,
});

const user = await prisma.user.findUnique({
  where: { id: 1 },
});

// 更新
const user = await prisma.user.update({
  where: { id: 1 },
  data: { name: "New Name" },
});

// 删除
await prisma.user.delete({
  where: { id: 1 },
});

// 事务
const [user, post] = await prisma.$transaction([
  prisma.user.create({ data: { email: "a@test.com" } }),
  prisma.post.create({ data: { title: "Post", authorId: 1 } }),
]);
```

---

## 📌 五、MongoDB

### 1. 基本操作

```javascript
const { MongoClient } = require("mongodb");

const client = new MongoClient("mongodb://localhost:27017");
await client.connect();
const db = client.db("mydb");
const users = db.collection("users");

// 插入
await users.insertOne({ name: "Alice", age: 25 });
await users.insertMany([{ name: "Bob" }, { name: "Charlie" }]);

// 查询
const user = await users.findOne({ name: "Alice" });
const allUsers = await users.find({ age: { $gt: 18 } }).toArray();

// 更新
await users.updateOne({ name: "Alice" }, { $set: { age: 26 } });

// 删除
await users.deleteOne({ name: "Alice" });
```

### 2. Mongoose

```javascript
const mongoose = require("mongoose");

// 定义 Schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true },
    age: Number,
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

// 使用
const user = await User.create({ name: "Alice", email: "a@test.com" });
const users = await User.find({ age: { $gt: 18 } }).populate("posts");
await User.findByIdAndUpdate(id, { name: "New Name" });
await User.findByIdAndDelete(id);
```

---

## 📌 六、Redis 缓存

```javascript
const Redis = require("ioredis");
const redis = new Redis();

// 字符串
await redis.set("key", "value");
await redis.set("key", "value", "EX", 3600); // 过期时间
const value = await redis.get("key");

// 哈希
await redis.hset("user:1", "name", "Alice", "age", "25");
const user = await redis.hgetall("user:1");

// 列表
await redis.lpush("queue", "item1", "item2");
const item = await redis.rpop("queue");

// 集合
await redis.sadd("tags", "js", "react", "vue");
const tags = await redis.smembers("tags");

// 有序集合
await redis.zadd("leaderboard", 100, "alice", 200, "bob");
const top = await redis.zrevrange("leaderboard", 0, 9, "WITHSCORES");

// 缓存模式
async function getUser(id) {
  const cached = await redis.get(`user:${id}`);
  if (cached) return JSON.parse(cached);

  const user = await prisma.user.findUnique({ where: { id } });
  await redis.set(`user:${id}`, JSON.stringify(user), "EX", 3600);
  return user;
}
```

---

## 📚 推荐学习资源

| 资源    | 链接        |
| ------- | ----------- |
| Prisma  | prisma.io   |
| MongoDB | mongodb.com |
| Redis   | redis.io    |

---
