// Redis 缓存策略详解
// 运行: node 04-redis-cache.js (模拟 Redis 核心操作)

console.log("=== Redis 缓存策略 ===\n");

// ========== 模拟 Redis 客户端 ==========
class MockRedis {
  constructor() {
    this.store = new Map();
    this.expiry = new Map();
  }

  // 字符串
  async set(key, value, ...args) {
    this.store.set(key, value);
    // 处理 EX 过期
    if (args[0] === "EX") {
      const ttl = args[1] * 1000;
      this.expiry.set(key, Date.now() + ttl);
      setTimeout(() => {
        if (this.expiry.get(key) <= Date.now()) {
          this.store.delete(key);
          this.expiry.delete(key);
        }
      }, ttl);
    }
    return "OK";
  }

  async get(key) {
    if (this.expiry.has(key) && this.expiry.get(key) <= Date.now()) {
      this.store.delete(key);
      this.expiry.delete(key);
      return null;
    }
    return this.store.get(key) || null;
  }

  async del(key) {
    this.store.delete(key);
    this.expiry.delete(key);
  }

  async exists(key) {
    return this.store.has(key) ? 1 : 0;
  }

  async ttl(key) {
    if (!this.expiry.has(key)) return -1;
    return Math.max(0, Math.ceil((this.expiry.get(key) - Date.now()) / 1000));
  }

  // 哈希
  async hset(key, ...args) {
    if (!this.store.has(key)) this.store.set(key, {});
    const hash = this.store.get(key);
    for (let i = 0; i < args.length; i += 2) {
      hash[args[i]] = args[i + 1];
    }
  }

  async hget(key, field) {
    const hash = this.store.get(key);
    return hash ? hash[field] : null;
  }

  async hgetall(key) {
    return this.store.get(key) || {};
  }

  // 列表
  async lpush(key, ...values) {
    if (!this.store.has(key)) this.store.set(key, []);
    this.store.get(key).unshift(...values);
    return this.store.get(key).length;
  }

  async rpop(key) {
    const list = this.store.get(key);
    return list ? list.pop() : null;
  }

  async lrange(key, start, stop) {
    const list = this.store.get(key) || [];
    return list.slice(start, stop === -1 ? undefined : stop + 1);
  }

  // 集合
  async sadd(key, ...members) {
    if (!this.store.has(key)) this.store.set(key, new Set());
    members.forEach((m) => this.store.get(key).add(m));
  }

  async smembers(key) {
    const set = this.store.get(key);
    return set ? [...set] : [];
  }

  // 有序集合
  async zadd(key, ...args) {
    if (!this.store.has(key)) this.store.set(key, []);
    const zset = this.store.get(key);
    for (let i = 0; i < args.length; i += 2) {
      const idx = zset.findIndex((e) => e.member === args[i + 1]);
      if (idx >= 0) zset[idx].score = args[i];
      else zset.push({ score: Number(args[i]), member: args[i + 1] });
    }
    zset.sort((a, b) => a.score - b.score);
  }

  async zrevrange(key, start, stop, withScores) {
    const zset = this.store.get(key) || [];
    const reversed = [...zset].reverse().slice(start, stop + 1);
    if (withScores === "WITHSCORES") {
      return reversed.flatMap((e) => [e.member, String(e.score)]);
    }
    return reversed.map((e) => e.member);
  }

  // 自增
  async incr(key) {
    const val = Number(this.store.get(key) || 0) + 1;
    this.store.set(key, String(val));
    return val;
  }
}

const redis = new MockRedis();

// ========== 1. 基本数据结构 ==========
async function dataStructDemo() {
  console.log("1. Redis 数据结构\n");

  // 字符串
  await redis.set("name", "Alice");
  await redis.set("session:abc", "user_data", "EX", 3600);
  console.log(`  String: name = "${await redis.get("name")}"`);
  console.log(`  TTL: session:abc = ${await redis.ttl("session:abc")}s`);

  // 哈希
  await redis.hset("user:1", "name", "Alice", "age", "28", "email", "alice@test.com");
  const user = await redis.hgetall("user:1");
  console.log(`  Hash: user:1 = ${JSON.stringify(user)}`);

  // 列表 (消息队列)
  await redis.lpush("queue", "task1", "task2", "task3");
  const task = await redis.rpop("queue");
  console.log(`  List: rpop queue = "${task}"`);
  console.log(`  List: remaining = ${JSON.stringify(await redis.lrange("queue", 0, -1))}`);

  // 集合
  await redis.sadd("tags:1", "javascript", "react", "nodejs");
  await redis.sadd("tags:2", "javascript", "vue", "python");
  console.log(`  Set: tags:1 = ${JSON.stringify(await redis.smembers("tags:1"))}`);

  // 有序集合 (排行榜)
  await redis.zadd("leaderboard", 100, "alice", 250, "bob", 180, "charlie");
  const top = await redis.zrevrange("leaderboard", 0, 2, "WITHSCORES");
  console.log(`  Sorted Set: top 3 = ${JSON.stringify(top)}`);
}

// ========== 2. 缓存策略实现 ==========
async function cacheStrategies() {
  console.log("\n2. Cache Aside 策略\n");

  // 模拟数据库
  const db = {
    users: {
      1: { id: 1, name: "Alice", age: 28 },
      2: { id: 2, name: "Bob", age: 32 },
    },
    queryCount: 0,
  };

  // Cache Aside: 查缓存 → 未命中查DB → 写缓存
  async function getUser(id) {
    const cacheKey = `cache:user:${id}`;

    // 1. 查缓存
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`    ✅ 缓存命中: ${cacheKey}`);
      return JSON.parse(cached);
    }

    // 2. 查数据库
    console.log(`    ❌ 缓存未命中, 查询DB: ${cacheKey}`);
    db.queryCount++;
    const user = db.users[id];
    if (!user) return null;

    // 3. 写缓存 (随机 TTL 防雪崩)
    const ttl = 3600 + Math.floor(Math.random() * 600);
    await redis.set(cacheKey, JSON.stringify(user), "EX", ttl);

    return user;
  }

  // 更新时删除缓存
  async function updateUser(id, data) {
    db.users[id] = { ...db.users[id], ...data };
    await redis.del(`cache:user:${id}`);
    console.log(`    🔄 更新DB并删除缓存: user:${id}`);
  }

  // 测试
  console.log("  第一次查询 (缓存未命中):");
  await getUser(1);

  console.log("  第二次查询 (缓存命中):");
  await getUser(1);

  console.log("  更新后查询:");
  await updateUser(1, { name: "Alice Updated" });
  await getUser(1);

  console.log(`  DB 查询总次数: ${db.queryCount}`);
}

// ========== 3. 缓存常见问题 ==========
async function cacheProblems() {
  console.log("\n3. 缓存常见问题与解决\n");

  // 3.1 缓存穿透: 查询不存在的数据
  console.log("  3.1 缓存穿透 (查询不存在的数据)");

  // 解决方案: 空值缓存
  async function getUserSafe(id) {
    const cacheKey = `cache:user:${id}`;
    const cached = await redis.get(cacheKey);

    if (cached === "NULL") {
      console.log(`    拦截空值: ${cacheKey}`);
      return null;
    }
    if (cached) return JSON.parse(cached);

    // 查 DB
    const user = null; // 模拟不存在
    if (!user) {
      await redis.set(cacheKey, "NULL", "EX", 60); // 短过期
      console.log(`    缓存空值: ${cacheKey} (60s)`);
      return null;
    }
    return user;
  }

  await getUserSafe(999);
  await getUserSafe(999); // 不会再查 DB

  // 3.2 缓存击穿: 热点 key 过期
  console.log("\n  3.2 缓存击穿 (热点 key 过期)");
  console.log(`    解决方案:
    a) 互斥锁: 只允许一个请求查 DB
    b) 永不过期: 异步后台更新
    c) 提前续期: 逻辑过期时间`);

  // 3.3 缓存雪崩: 大量 key 同时过期
  console.log("\n  3.3 缓存雪崩 (大量 key 同时过期)");
  console.log(`    解决方案:
    a) 随机 TTL: baseTime + random(0, 600)
    b) 分级缓存: L1(内存) + L2(Redis)
    c) 限流降级: 保护数据库`);

  console.log(`
  ┌──────────────┬────────────────────┬────────────────────┐
  │ 问题          │ 原因                │ 解决方案           │
  ├──────────────┼────────────────────┼────────────────────┤
  │ 缓存穿透     │ 查不存在的数据      │ 空值缓存/布隆过滤器│
  │ 缓存击穿     │ 热点 key 过期       │ 互斥锁/永不过期    │
  │ 缓存雪崩     │ 大量 key 同时过期   │ 随机 TTL/限流      │
  └──────────────┴────────────────────┴────────────────────┘
`);
}

// ========== 4. 实际使用场景 ==========
async function useCases() {
  console.log("4. Redis 实际使用场景\n");

  // 4.1 计数器 (页面访问量)
  console.log("  4.1 计数器");
  for (let i = 0; i < 5; i++) await redis.incr("page:home:views");
  console.log(`    首页访问量: ${await redis.get("page:home:views")}`);

  // 4.2 排行榜
  console.log("\n  4.2 排行榜");
  await redis.zadd("game:scores", 1500, "player1", 2200, "player2", 1800, "player3", 3000, "player4");
  const leaders = await redis.zrevrange("game:scores", 0, 2, "WITHSCORES");
  for (let i = 0; i < leaders.length; i += 2) {
    console.log(`    #${i / 2 + 1} ${leaders[i]}: ${leaders[i + 1]}分`);
  }

  // 4.3 会话存储
  console.log("\n  4.3 会话存储");
  const sessionId = "sess_" + Math.random().toString(36).slice(2, 8);
  await redis.set(sessionId, JSON.stringify({ userId: 1, role: "admin" }), "EX", 1800);
  const session = JSON.parse(await redis.get(sessionId));
  console.log(`    Session ${sessionId}: ${JSON.stringify(session)}`);

  console.log(`
  Redis 适用场景:
  • 缓存 — 减少 DB 压力
  • 会话 — 分布式 Session
  • 排行榜 — Sorted Set
  • 计数器 — INCR
  • 消息队列 — List (LPUSH/RPOP)
  • 分布式锁 — SET NX EX
  • 发布订阅 — PUB/SUB
`);
}

// 执行
(async () => {
  await dataStructDemo();
  await cacheStrategies();
  await cacheProblems();
  await useCases();
  console.log("=== Redis 缓存完成 ===");
})();
