// Prisma ORM 用法详解
// 运行: node 02-prisma-orm.js (模拟 Prisma 核心 API)

console.log("=== Prisma ORM ===\n");

// ========== 1. 模拟 Prisma Client ==========
console.log("1. 模拟 Prisma Client 核心 API\n");

class MockPrismaClient {
  constructor() {
    this.db = { users: [], posts: [], profiles: [] };
    this.autoIds = { users: 1, posts: 1, profiles: 1 };
  }

  _model(table) {
    const self = this;
    return {
      // 创建
      async create({ data, include }) {
        const record = { id: self.autoIds[table]++, ...data, createdAt: new Date() };

        // 处理嵌套创建
        if (data.posts?.create) {
          record.posts = [];
          const posts = Array.isArray(data.posts.create)
            ? data.posts.create
            : [data.posts.create];
          for (const postData of posts) {
            const post = { id: self.autoIds.posts++, ...postData, authorId: record.id };
            self.db.posts.push(post);
            record.posts.push(post);
          }
          delete record.posts;
        }

        self.db[table].push(record);
        const result = { ...record };

        if (include?.posts) {
          result.posts = self.db.posts.filter((p) => p.authorId === record.id);
        }

        return result;
      },

      // 查询多条
      async findMany({ where, orderBy, take, skip, include } = {}) {
        let rows = [...self.db[table]];

        if (where) {
          rows = rows.filter((row) => {
            return Object.entries(where).every(([key, val]) => {
              if (typeof val === "object" && val !== null) {
                if (val.contains) return String(row[key]).includes(val.contains);
                if (val.gt) return row[key] > val.gt;
                if (val.gte) return row[key] >= val.gte;
                if (val.lt) return row[key] < val.lt;
              }
              return row[key] === val;
            });
          });
        }

        if (orderBy) {
          const [field, dir] = Object.entries(orderBy)[0];
          rows.sort((a, b) =>
            dir === "desc" ? (a[field] > b[field] ? -1 : 1) : (a[field] > b[field] ? 1 : -1)
          );
        }

        if (skip) rows = rows.slice(skip);
        if (take) rows = rows.slice(0, take);

        if (include?.posts) {
          rows = rows.map((r) => ({
            ...r,
            posts: self.db.posts.filter((p) => p.authorId === r.id),
          }));
        }

        return rows;
      },

      // 查询单条
      async findUnique({ where, include }) {
        const row = self.db[table].find((r) =>
          Object.entries(where).every(([k, v]) => r[k] === v)
        );
        if (!row) return null;
        const result = { ...row };
        if (include?.posts) {
          result.posts = self.db.posts.filter((p) => p.authorId === row.id);
        }
        return result;
      },

      // 更新
      async update({ where, data }) {
        const idx = self.db[table].findIndex((r) =>
          Object.entries(where).every(([k, v]) => r[k] === v)
        );
        if (idx === -1) throw new Error("Record not found");
        self.db[table][idx] = { ...self.db[table][idx], ...data, updatedAt: new Date() };
        return self.db[table][idx];
      },

      // Upsert
      async upsert({ where, update: updateData, create: createData }) {
        const existing = self.db[table].find((r) =>
          Object.entries(where).every(([k, v]) => r[k] === v)
        );
        if (existing) {
          Object.assign(existing, updateData);
          return existing;
        }
        const record = { id: self.autoIds[table]++, ...createData, createdAt: new Date() };
        self.db[table].push(record);
        return record;
      },

      // 删除
      async delete({ where }) {
        const idx = self.db[table].findIndex((r) =>
          Object.entries(where).every(([k, v]) => r[k] === v)
        );
        if (idx === -1) throw new Error("Record not found");
        return self.db[table].splice(idx, 1)[0];
      },

      // 计数
      async count({ where } = {}) {
        if (!where) return self.db[table].length;
        return self.db[table].filter((r) =>
          Object.entries(where).every(([k, v]) => r[k] === v)
        ).length;
      },
    };
  }

  get user() { return this._model("users"); }
  get post() { return this._model("posts"); }

  // 事务
  async $transaction(operations) {
    const snapshot = JSON.parse(JSON.stringify(this.db));
    try {
      if (Array.isArray(operations)) {
        return await Promise.all(operations);
      }
      return await operations(this);
    } catch (err) {
      this.db = snapshot; // 回滚
      throw err;
    }
  }
}

// ========== 2. CRUD 操作 ==========
const prisma = new MockPrismaClient();

async function demo() {
  // 创建 (含嵌套)
  console.log("2. 创建记录\n");

  const alice = await prisma.user.create({
    data: {
      name: "Alice",
      email: "alice@test.com",
      age: 28,
      posts: {
        create: [
          { title: "学习 Prisma", published: true },
          { title: "数据库设计", published: false },
        ],
      },
    },
    include: { posts: true },
  });
  console.log(`  创建用户: ${alice.name} (${alice.posts.length} 篇文章)`);

  await prisma.user.create({
    data: { name: "Bob", email: "bob@test.com", age: 32 },
  });
  await prisma.user.create({
    data: { name: "Charlie", email: "charlie@test.com", age: 24 },
  });
  console.log(`  总用户数: ${await prisma.user.count()}`);

  // 查询
  console.log("\n3. 查询记录\n");

  const users = await prisma.user.findMany({
    where: { age: { gt: 25 } },
    orderBy: { age: "desc" },
    include: { posts: true },
  });
  console.log("  age > 25 的用户 (按年龄降序):");
  users.forEach((u) =>
    console.log(`    ${u.name} (${u.age}) - ${u.posts?.length || 0}篇文章`)
  );

  const user = await prisma.user.findUnique({
    where: { id: 1 },
    include: { posts: true },
  });
  console.log(`\n  findUnique(id=1): ${user.name}, 文章: ${user.posts.map((p) => p.title).join(", ")}`);

  // 更新
  console.log("\n4. 更新记录\n");

  const updated = await prisma.user.update({
    where: { id: 1 },
    data: { name: "Alice Chen" },
  });
  console.log(`  更新: id=1 → name="${updated.name}"`);

  // Upsert
  const upserted = await prisma.user.upsert({
    where: { email: "diana@test.com" },
    update: { name: "Diana Updated" },
    create: { name: "Diana", email: "diana@test.com", age: 30 },
  });
  console.log(`  Upsert: ${upserted.name} (${upserted.email})`);
  console.log(`  总用户数: ${await prisma.user.count()}`);

  // 删除
  console.log("\n5. 删除记录\n");

  const deleted = await prisma.user.delete({ where: { id: 3 } });
  console.log(`  删除: ${deleted.name}`);
  console.log(`  剩余用户数: ${await prisma.user.count()}`);

  // 事务
  console.log("\n6. 事务\n");

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: { name: "Eve", email: "eve@test.com", age: 27 },
      });
      console.log("  事务中创建 Eve 成功");
      // 模拟错误不触发
    });
    console.log("  事务提交成功");
  } catch (err) {
    console.log(`  事务回滚: ${err.message}`);
  }

  console.log(`  最终用户数: ${await prisma.user.count()}`);
}

demo().then(() => {
  // ========== 7. Prisma 实际用法参考 ==========
  console.log("\n7. Prisma 实际使用参考");
  console.log(`
  // Schema 定义 (prisma/schema.prisma)
  model User {
    id        Int      @id @default(autoincrement())
    email     String   @unique
    name      String?
    posts     Post[]
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
    @@map("users")
  }

  // 常用命令
  npx prisma init                    # 初始化
  npx prisma migrate dev --name init # 迁移
  npx prisma generate                # 生成客户端
  npx prisma studio                  # 可视化管理
  npx prisma db seed                 # 种子数据

  // 分页查询
  const { data, total } = await paginate(prisma.user, {
    where: { status: 'active' },
    page: 1,
    limit: 10,
  });

  // 交互式事务 (转账)
  await prisma.$transaction(async (tx) => {
    const sender = await tx.account.update({
      where: { id: senderId },
      data: { balance: { decrement: amount } },
    });
    if (sender.balance < 0) throw new Error('余额不足');
    await tx.account.update({
      where: { id: receiverId },
      data: { balance: { increment: amount } },
    });
  });
`);

  console.log("=== Prisma ORM 完成 ===");
});
