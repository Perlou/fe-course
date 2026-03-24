# Phase 17: 数据库

> **目标**：掌握数据库设计与操作  
> **预计时长**：1 周

---

## 📚 本阶段内容

### 学习目标

1. 理解关系型数据库基础与 SQL 查询
2. 掌握数据库设计原则（范式、E-R 图）
3. 掌握索引原理与查询优化
4. 熟练使用 Prisma ORM（关系型）
5. 了解 MongoDB 与 Mongoose（文档型）
6. 掌握 Redis 缓存策略
7. 了解数据库事务与并发控制

### 知识要点

- SQL 基础与高级查询（JOIN、子查询、窗口函数）
- 数据库设计三大范式与反范式
- 索引原理（B+树）与最左前缀原则
- Prisma ORM（Schema、Migrate、CRUD）
- MongoDB 与 Mongoose（Schema、查询、聚合）
- Redis 数据结构与缓存模式
- 事务隔离级别与并发控制

### 实战项目

**电商数据库设计**：设计并实现完整的电商系统数据库

---

## 📂 目录结构

```
phase17-database/
├── CONCEPT.md
├── README.md
├── examples/
│   ├── 01-sql-basics.js         # SQL 查询模拟
│   ├── 02-prisma-orm.js         # Prisma ORM 用法
│   ├── 03-mongoose.js           # Mongoose 用法
│   ├── 04-redis-cache.js        # Redis 缓存策略
│   └── 05-db-design.js          # 数据库设计模式
└── exercises/
    └── ecommerce-db/            # 电商数据库设计实战
        └── README.md
```

---

## 🎯 核心概念速览

### SQL vs NoSQL

```
┌──────────────────┬──────────────────┐
│   SQL (关系型)    │  NoSQL (非关系型) │
├──────────────────┼──────────────────┤
│ 结构化数据        │ 灵活 Schema      │
│ 强一致性          │ 最终一致性        │
│ 复杂查询 (JOIN)   │ 简单查询，高性能  │
│ MySQL/PostgreSQL  │ MongoDB/Redis    │
└──────────────────┴──────────────────┘
```

### 数据库选型

```
结构化数据 + 复杂关联 → PostgreSQL / MySQL
灵活文档 + 快速迭代   → MongoDB
高速缓存 + 会话管理   → Redis
全文搜索             → Elasticsearch
```

---

> 完成本阶段后，你应该能够设计和操作多种类型的数据库。
