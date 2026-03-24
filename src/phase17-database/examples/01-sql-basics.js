// SQL 查询基础详解
// 运行: node 01-sql-basics.js (使用内存数据库模拟 SQL 操作)

console.log("=== SQL 查询基础 ===\n");

// ========== 模拟内存数据库引擎 ==========

class MemoryDB {
  constructor() {
    this.tables = {};
  }

  createTable(name, columns) {
    this.tables[name] = { columns, rows: [], autoId: 1 };
    return this;
  }

  insert(table, ...records) {
    const t = this.tables[table];
    for (const record of records) {
      t.rows.push({ id: t.autoId++, ...record });
    }
    return this;
  }

  // SELECT ... FROM ... WHERE ... ORDER BY ... LIMIT
  select(table, options = {}) {
    const { columns, where, orderBy, limit, offset = 0, groupBy, having } = options;
    let rows = [...this.tables[table].rows];

    // WHERE
    if (where) rows = rows.filter(where);

    // GROUP BY
    if (groupBy) {
      const groups = {};
      for (const row of rows) {
        const key = row[groupBy];
        if (!groups[key]) groups[key] = [];
        groups[key].push(row);
      }
      rows = Object.entries(groups).map(([key, items]) => ({
        [groupBy]: key,
        count: items.length,
        sum: items.reduce((s, r) => s + (r.amount || r.age || 0), 0),
        avg: items.reduce((s, r) => s + (r.amount || r.age || 0), 0) / items.length,
        _items: items,
      }));
      if (having) rows = rows.filter(having);
    }

    // ORDER BY
    if (orderBy) {
      const [field, dir] = orderBy.split(" ");
      rows.sort((a, b) => {
        if (dir === "DESC") return a[field] > b[field] ? -1 : 1;
        return a[field] > b[field] ? 1 : -1;
      });
    }

    // OFFSET + LIMIT
    if (limit) rows = rows.slice(offset, offset + limit);

    // SELECT columns
    if (columns) {
      rows = rows.map((row) => {
        const result = {};
        columns.forEach((col) => (result[col] = row[col]));
        return result;
      });
    }

    return rows;
  }

  // UPDATE
  update(table, where, data) {
    let count = 0;
    this.tables[table].rows = this.tables[table].rows.map((row) => {
      if (where(row)) {
        count++;
        return { ...row, ...data };
      }
      return row;
    });
    return count;
  }

  // DELETE
  delete(table, where) {
    const before = this.tables[table].rows.length;
    this.tables[table].rows = this.tables[table].rows.filter((r) => !where(r));
    return before - this.tables[table].rows.length;
  }

  // JOIN
  join(table1, table2, on, type = "INNER") {
    const rows1 = this.tables[table1].rows;
    const rows2 = this.tables[table2].rows;
    const result = [];

    for (const r1 of rows1) {
      let matched = false;
      for (const r2 of rows2) {
        if (on(r1, r2)) {
          result.push({ ...r1, ...r2, [`${table2}_id`]: r2.id });
          matched = true;
        }
      }
      if (!matched && type === "LEFT") {
        result.push({ ...r1 });
      }
    }

    return result;
  }
}

// ========== 1. 创建表和数据 ==========
console.log("1. 创建表和插入数据\n");

const db = new MemoryDB();

db.createTable("users", ["id", "name", "email", "age", "department", "status"]);
db.insert(
  "users",
  { name: "Alice", email: "alice@test.com", age: 28, department: "engineering", status: "active" },
  { name: "Bob", email: "bob@test.com", age: 32, department: "marketing", status: "active" },
  { name: "Charlie", email: "charlie@test.com", age: 24, department: "engineering", status: "inactive" },
  { name: "Diana", email: "diana@test.com", age: 35, department: "marketing", status: "active" },
  { name: "Eve", email: "eve@test.com", age: 29, department: "engineering", status: "active" }
);

db.createTable("posts", ["id", "title", "user_id", "published", "views"]);
db.insert(
  "posts",
  { title: "学习 SQL", user_id: 1, published: true, views: 100 },
  { title: "React 入门", user_id: 1, published: true, views: 250 },
  { title: "Vue 进阶", user_id: 2, published: false, views: 50 },
  { title: "Node.js 实战", user_id: 3, published: true, views: 180 },
  { title: "数据库设计", user_id: 1, published: true, views: 320 }
);

console.log("  users 表:", db.tables.users.rows.length, "条");
console.log("  posts 表:", db.tables.posts.rows.length, "条");

// ========== 2. SELECT 查询 ==========
console.log("\n2. SELECT 查询\n");

// SELECT id, name, email FROM users
let result = db.select("users", { columns: ["id", "name", "email"] });
console.log("  SELECT id, name, email FROM users:");
console.log(" ", result.map((r) => `${r.id}:${r.name}`).join(", "));

// WHERE age > 25
result = db.select("users", {
  columns: ["name", "age"],
  where: (r) => r.age > 25,
});
console.log("\n  WHERE age > 25:");
console.log(" ", result.map((r) => `${r.name}(${r.age})`).join(", "));

// ORDER BY age DESC LIMIT 3
result = db.select("users", {
  columns: ["name", "age"],
  orderBy: "age DESC",
  limit: 3,
});
console.log("\n  ORDER BY age DESC LIMIT 3:");
console.log(" ", result.map((r) => `${r.name}(${r.age})`).join(", "));

// ========== 3. GROUP BY ==========
console.log("\n3. GROUP BY 聚合\n");

result = db.select("users", {
  groupBy: "department",
});
console.log("  GROUP BY department:");
result.forEach((r) => {
  console.log(`    ${r.department}: ${r.count}人, 平均年龄=${r.avg.toFixed(1)}`);
});

result = db.select("users", {
  groupBy: "status",
  having: (r) => r.count > 1,
});
console.log("\n  GROUP BY status HAVING count > 1:");
result.forEach((r) => {
  console.log(`    ${r.status}: ${r.count}人`);
});

// ========== 4. JOIN ==========
console.log("\n4. JOIN 连接\n");

// INNER JOIN
result = db.join("users", "posts", (u, p) => u.id === p.user_id);
console.log("  INNER JOIN users ⟗ posts:");
result.forEach((r) => {
  console.log(`    ${r.name} → "${r.title}" (${r.views} views)`);
});

// LEFT JOIN
result = db.join("users", "posts", (u, p) => u.id === p.user_id, "LEFT");
console.log("\n  LEFT JOIN (包含无文章的用户):");
result.forEach((r) => {
  console.log(`    ${r.name} → ${r.title ? `"${r.title}"` : "(无文章)"}`);
});

// ========== 5. UPDATE & DELETE ==========
console.log("\n5. UPDATE & DELETE\n");

let affected = db.update("users", (r) => r.name === "Charlie", { status: "active" });
console.log(`  UPDATE SET status='active' WHERE name='Charlie': ${affected}行`);

affected = db.delete("posts", (r) => r.published === false);
console.log(`  DELETE FROM posts WHERE published=false: ${affected}行`);

console.log(`  posts 剩余: ${db.tables.posts.rows.length}条`);

// ========== 6. SQL 速查表 ==========
console.log("\n6. SQL 速查表");
console.log(`
  ┌──────────────┬──────────────────────────────────────────────┐
  │   操作        │   SQL 语法                                   │
  ├──────────────┼──────────────────────────────────────────────┤
  │ 查询          │ SELECT cols FROM table WHERE cond            │
  │ 排序          │ ORDER BY col ASC/DESC                        │
  │ 分页          │ LIMIT n OFFSET m                             │
  │ 聚合          │ COUNT, SUM, AVG, MIN, MAX                    │
  │ 分组          │ GROUP BY col HAVING cond                     │
  │ 连接          │ INNER/LEFT/RIGHT JOIN ON cond                │
  │ 子查询        │ WHERE col IN (SELECT ...)                    │
  │ 插入          │ INSERT INTO table (cols) VALUES (vals)       │
  │ 更新          │ UPDATE table SET col=val WHERE cond          │
  │ 删除          │ DELETE FROM table WHERE cond                 │
  │ 事务          │ BEGIN; ... COMMIT/ROLLBACK;                  │
  │ 索引          │ CREATE INDEX name ON table(cols)             │
  └──────────────┴──────────────────────────────────────────────┘
`);

console.log("=== SQL 查询基础完成 ===");
