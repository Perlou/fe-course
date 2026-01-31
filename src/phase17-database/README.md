# Phase 17: 数据库

> **目标**：掌握数据库设计与操作  
> **预计时长**：1 周

---

## 📚 本阶段内容

### 学习目标

1. 理解关系型数据库基础
2. 掌握 SQL 查询与优化
3. 了解 NoSQL 数据库
4. 熟悉 ORM 使用

### 知识要点

- SQL 基础与高级查询
- 数据库设计与范式
- 索引与性能优化
- Prisma/TypeORM/Mongoose
- Redis 缓存

### 实战项目

**数据库设计实践**：设计电商系统数据库

---

## 🎯 核心概念

### SQL 基础

```sql
SELECT * FROM users WHERE age > 18 ORDER BY name;
INSERT INTO users (name, email) VALUES ('Alice', 'a@test.com');
UPDATE users SET name = 'Bob' WHERE id = 1;
DELETE FROM users WHERE id = 1;
```

### Prisma

```javascript
const users = await prisma.user.findMany({
  where: { age: { gt: 18 } },
  include: { posts: true },
});
```

---

> 完成本阶段后，你应该能够设计和操作数据库。
