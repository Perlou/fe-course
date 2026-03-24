// 数据库设计模式详解
// 运行: node 05-db-design.js

console.log("=== 数据库设计模式 ===\n");

// ========== 1. 三大范式 ==========
console.log("1. 三大范式演示\n");

console.log("  1NF — 属性不可再分:");
console.log(`
  ❌ 未满足 1NF:
  ┌────┬──────┬─────────────────────────┐
  │ id │ name │ contact                 │
  ├────┼──────┼─────────────────────────┤
  │ 1  │ Alice│ 手机:123, 邮箱:a@t.com  │  ← 一个字段存多值
  └────┴──────┴─────────────────────────┘

  ✅ 满足 1NF:
  ┌────┬──────┬───────┬─────────┐
  │ id │ name │ phone │ email   │
  ├────┼──────┼───────┼─────────┤
  │ 1  │ Alice│ 123   │ a@t.com │  ← 每个字段原子值
  └────┴──────┴───────┴─────────┘
`);

console.log("  2NF — 完全依赖主键:");
console.log(`
  ❌ 未满足 2NF (主键: 订单ID + 商品ID):
  ┌──────┬──────┬──────────┬──────┐
  │ 订单 │ 商品 │ 商品名称  │ 数量 │
  │ ID   │ ID   │          │      │  ← 商品名称只依赖商品ID
  └──────┴──────┴──────────┴──────┘

  ✅ 满足 2NF (拆分):
  订单项表(订单ID, 商品ID, 数量)
  商品表(商品ID, 商品名称)
`);

console.log("  3NF — 无传递依赖:");
console.log(`
  ❌ 未满足 3NF:
  ┌──────┬──────┬────────┬──────────┐
  │ 用户 │ 部门 │ 部门   │ 部门     │
  │ ID   │ ID   │ 名称   │ 负责人   │  ← 部门名/负责人传递依赖
  └──────┴──────┴────────┴──────────┘

  ✅ 满足 3NF:
  用户表(用户ID, 部门ID)
  部门表(部门ID, 名称, 负责人)
`);

// ========== 2. 电商数据库设计 ==========
console.log("2. 电商系统数据库设计\n");

// 用 JavaScript 模拟表结构
const schema = {
  users: {
    id: "INT PK AUTO_INCREMENT",
    username: "VARCHAR(50) UNIQUE NOT NULL",
    email: "VARCHAR(100) UNIQUE NOT NULL",
    password_hash: "VARCHAR(255) NOT NULL",
    phone: "VARCHAR(20)",
    avatar: "VARCHAR(255)",
    role: "ENUM('user','admin') DEFAULT 'user'",
    status: "ENUM('active','inactive','banned') DEFAULT 'active'",
    created_at: "TIMESTAMP DEFAULT NOW()",
    updated_at: "TIMESTAMP ON UPDATE NOW()",
  },
  addresses: {
    id: "INT PK",
    user_id: "INT FK → users.id",
    name: "VARCHAR(50) NOT NULL",
    phone: "VARCHAR(20) NOT NULL",
    province: "VARCHAR(50)",
    city: "VARCHAR(50)",
    district: "VARCHAR(50)",
    detail: "VARCHAR(255) NOT NULL",
    is_default: "BOOLEAN DEFAULT false",
  },
  categories: {
    id: "INT PK",
    name: "VARCHAR(50) NOT NULL",
    parent_id: "INT FK → categories.id (自引用)",
    level: "INT DEFAULT 1",
    sort_order: "INT DEFAULT 0",
  },
  products: {
    id: "INT PK",
    name: "VARCHAR(200) NOT NULL",
    description: "TEXT",
    price: "DECIMAL(10,2) NOT NULL",
    original_price: "DECIMAL(10,2)",
    stock: "INT DEFAULT 0",
    category_id: "INT FK → categories.id",
    status: "ENUM('draft','active','sold_out') DEFAULT 'draft'",
    images: "JSON",
    sales_count: "INT DEFAULT 0 (反范式: 冗余计数)",
  },
  orders: {
    id: "INT PK",
    order_no: "VARCHAR(32) UNIQUE NOT NULL",
    user_id: "INT FK → users.id",
    status: "ENUM('pending','paid','shipped','completed','cancelled')",
    total_amount: "DECIMAL(10,2) NOT NULL",
    discount_amount: "DECIMAL(10,2) DEFAULT 0",
    shipping_fee: "DECIMAL(10,2) DEFAULT 0",
    address_snapshot: "JSON (下单时的地址快照)",
    paid_at: "TIMESTAMP",
    shipped_at: "TIMESTAMP",
    created_at: "TIMESTAMP DEFAULT NOW()",
  },
  order_items: {
    id: "INT PK",
    order_id: "INT FK → orders.id",
    product_id: "INT FK → products.id",
    product_snapshot: "JSON (下单时的商品快照)",
    quantity: "INT NOT NULL",
    unit_price: "DECIMAL(10,2) NOT NULL",
  },
};

console.log("  电商核心表结构:\n");
for (const [table, columns] of Object.entries(schema)) {
  console.log(`  📋 ${table}`);
  for (const [col, type] of Object.entries(columns)) {
    console.log(`     ├── ${col.padEnd(20)} ${type}`);
  }
  console.log();
}

// ========== 3. E-R 关系图 ==========
console.log("3. E-R 关系\n");
console.log(`
  ┌────────┐ 1:N ┌──────────┐       ┌────────────┐
  │ users  │────→│ addresses│       │ categories │
  └───┬────┘     └──────────┘       └─────┬──────┘
      │ 1:N                               │ 1:N
  ┌───┴────┐ 1:N ┌─────────────┐ N:1 ┌───┴──────┐
  │ orders │────→│ order_items │←────│ products │
  └────────┘     └─────────────┘     └──────────┘

  关键设计点:
  • orders ↔ products 是多对多，通过 order_items 关联
  • categories 自引用实现多级分类
  • order 存储地址和商品快照 (防止修改后影响历史订单)
  • products.sales_count 是反范式冗余 (避免 COUNT 查询)
`);

// ========== 4. 索引设计 ==========
console.log("4. 索引设计\n");

const indexes = [
  { table: "users", index: "idx_email", columns: "(email)", type: "UNIQUE", reason: "登录查询" },
  { table: "users", index: "idx_phone", columns: "(phone)", type: "UNIQUE", reason: "手机登录" },
  { table: "products", index: "idx_category", columns: "(category_id, status)", type: "COMPOSITE", reason: "分类列表页" },
  { table: "products", index: "idx_name", columns: "(name)", type: "FULLTEXT", reason: "搜索功能" },
  { table: "orders", index: "idx_user_status", columns: "(user_id, status)", type: "COMPOSITE", reason: "用户订单列表" },
  { table: "orders", index: "idx_order_no", columns: "(order_no)", type: "UNIQUE", reason: "订单号查询" },
  { table: "order_items", index: "idx_order", columns: "(order_id)", type: "NORMAL", reason: "订单详情查询" },
];

console.log("  ┌──────────────┬─────────────────┬──────────────┬──────────────┐");
console.log("  │ 表            │ 索引             │ 类型         │ 用途         │");
console.log("  ├──────────────┼─────────────────┼──────────────┼──────────────┤");
for (const idx of indexes) {
  console.log(`  │ ${idx.table.padEnd(12)} │ ${idx.index.padEnd(15)} │ ${idx.type.padEnd(12)} │ ${idx.reason.padEnd(12)} │`);
}
console.log("  └──────────────┴─────────────────┴──────────────┴──────────────┘");

// ========== 5. 常见设计模式 ==========
console.log("\n5. 常见设计模式\n");

console.log(`
  5.1 软删除
  ┌─────────────────────────────────────────────┐
  │ ALTER TABLE users ADD deleted_at TIMESTAMP;  │
  │ -- 删除: UPDATE SET deleted_at = NOW()       │
  │ -- 查询: WHERE deleted_at IS NULL            │
  │ 优点: 可恢复，审计追踪                        │
  │ 缺点: 索引包含已删除数据                      │
  └─────────────────────────────────────────────┘

  5.2 乐观锁 (版本号)
  ┌─────────────────────────────────────────────┐
  │ ALTER TABLE products ADD version INT DEFAULT 1│
  │ -- 更新: UPDATE SET stock=stock-1,            │
  │ --   version=version+1 WHERE id=1             │
  │ --   AND version=current_version              │
  │ -- 如果 affected_rows = 0, 说明有并发冲突     │
  └─────────────────────────────────────────────┘

  5.3 快照模式
  ┌─────────────────────────────────────────────┐
  │ order_items.product_snapshot = JSON          │
  │ orders.address_snapshot = JSON               │
  │ -- 下单时保存当时的商品价格和地址             │
  │ -- 后续商品改价或地址修改不影响历史订单       │
  └─────────────────────────────────────────────┘

  5.4 多态关联
  ┌─────────────────────────────────────────────┐
  │ -- 评论可以关联文章、商品、用户等             │
  │ comments {                                   │
  │   id, content,                               │
  │   commentable_type: 'Post' | 'Product',     │
  │   commentable_id: INT                        │
  │ }                                            │
  └─────────────────────────────────────────────┘
`);

// ========== 6. SQL 建表示例 ==========
console.log("6. 建表 SQL 示例\n");

const createSQL = `
  CREATE TABLE users (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    username    VARCHAR(50) UNIQUE NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    role        ENUM('user', 'admin') DEFAULT 'user',
    status      ENUM('active', 'inactive') DEFAULT 'active',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at  TIMESTAMP NULL,

    INDEX idx_email (email),
    INDEX idx_status_created (status, created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  CREATE TABLE products (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    name          VARCHAR(200) NOT NULL,
    price         DECIMAL(10, 2) NOT NULL,
    stock         INT UNSIGNED DEFAULT 0,
    category_id   INT NOT NULL,
    version       INT DEFAULT 1,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES categories(id),
    INDEX idx_category (category_id),
    FULLTEXT INDEX idx_name (name)
  ) ENGINE=InnoDB;
`;

console.log(createSQL);

console.log("=== 数据库设计完成 ===");
