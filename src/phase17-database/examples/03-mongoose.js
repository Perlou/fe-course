// Mongoose 用法详解
// 运行: node 03-mongoose.js (模拟 Mongoose 核心 API)

console.log("=== Mongoose ODM ===\n");

// ========== 模拟 Mongoose 核心 ==========

class Schema {
  constructor(definition, options = {}) {
    this.definition = definition;
    this.options = options;
    this.virtuals = {};
    this.methods = {};
    this.statics = {};
    this.middleware = { pre: {}, post: {} };
  }

  virtual(name) {
    const v = { _getter: null };
    v.get = (fn) => { v._getter = fn; return v; };
    this.virtuals[name] = v;
    return v;
  }

  pre(hook, fn) {
    if (!this.middleware.pre[hook]) this.middleware.pre[hook] = [];
    this.middleware.pre[hook].push(fn);
  }

  post(hook, fn) {
    if (!this.middleware.post[hook]) this.middleware.post[hook] = [];
    this.middleware.post[hook].push(fn);
  }
}

class Model {
  constructor(name, schema, db) {
    this.modelName = name;
    this.schema = schema;
    this.db = db;
    this.collection = [];
    this.autoId = 1;

    // 绑定静态方法
    for (const [key, fn] of Object.entries(schema.statics)) {
      this[key] = fn.bind(this);
    }
  }

  _createDocument(data) {
    const doc = {
      _id: String(this.autoId++),
      ...data,
    };

    // 添加 timestamps
    if (this.schema.options.timestamps) {
      doc.createdAt = new Date();
      doc.updatedAt = new Date();
    }

    // 添加实例方法
    for (const [key, fn] of Object.entries(this.schema.methods)) {
      doc[key] = fn.bind(doc);
    }

    // 添加虚拟属性
    for (const [key, v] of Object.entries(this.schema.virtuals)) {
      if (v._getter) {
        Object.defineProperty(doc, key, { get: v._getter.bind(doc), enumerable: true });
      }
    }

    // 验证必填字段
    for (const [field, def] of Object.entries(this.schema.definition)) {
      if (def.required && !doc[field]) {
        throw new Error(`${field} 是必填字段`);
      }
      if (def.default !== undefined && doc[field] === undefined) {
        doc[field] = typeof def.default === "function" ? def.default() : def.default;
      }
      if (def.enum && doc[field] && !def.enum.includes(doc[field])) {
        throw new Error(`${field} 的值必须是 ${def.enum.join(", ")} 之一`);
      }
    }

    return doc;
  }

  async create(data) {
    // pre save 钩子
    if (this.schema.middleware.pre.save) {
      for (const fn of this.schema.middleware.pre.save) {
        await fn.call(data);
      }
    }

    const doc = this._createDocument(data);
    this.collection.push(doc);

    console.log(`  [Mongoose] 创建 ${this.modelName}: ${doc._id}`);
    return doc;
  }

  find(query = {}) {
    let results = this.collection.filter((doc) =>
      Object.entries(query).every(([key, val]) => {
        if (typeof val === "object" && val !== null) {
          if (val.$gt) return doc[key] > val.$gt;
          if (val.$gte) return doc[key] >= val.$gte;
          if (val.$lt) return doc[key] < val.$lt;
          if (val.$in) return val.$in.includes(doc[key]);
        }
        return doc[key] === val;
      })
    );

    // 模拟链式调用 (同步返回, 支持 await)
    const chain = {
      _results: results,
      sort(field) {
        const [key, dir] = Object.entries(field)[0];
        this._results.sort((a, b) =>
          dir === -1 ? (a[key] > b[key] ? -1 : 1) : (a[key] > b[key] ? 1 : -1)
        );
        return this;
      },
      limit(n) {
        this._results = this._results.slice(0, n);
        return this;
      },
      skip(n) {
        this._results = this._results.slice(n);
        return this;
      },
      select(fields) {
        const keys = fields.split(" ");
        this._results = this._results.map((r) => {
          const obj = {};
          keys.forEach((k) => { if (r[k] !== undefined) obj[k] = r[k]; });
          obj._id = r._id;
          return obj;
        });
        return this;
      },
      populate() { return this; },
      exec() { return Promise.resolve(this._results); },
      then(resolve, reject) { return Promise.resolve(this._results).then(resolve, reject); },
    };

    return chain;
  }

  async findOne(query) {
    return this.collection.find((doc) =>
      Object.entries(query).every(([k, v]) => doc[k] === v)
    ) || null;
  }

  async findById(id) {
    return this.collection.find((doc) => doc._id === String(id)) || null;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const doc = this.collection.find((d) => d._id === String(id));
    if (!doc) return null;
    Object.assign(doc, update, { updatedAt: new Date() });
    return options.new ? doc : { ...doc, ...update };
  }

  async findByIdAndDelete(id) {
    const idx = this.collection.findIndex((d) => d._id === String(id));
    if (idx === -1) return null;
    return this.collection.splice(idx, 1)[0];
  }

  async countDocuments(query = {}) {
    if (!Object.keys(query).length) return this.collection.length;
    return this.find(query)._results.length;
  }

  // 聚合管道
  async aggregate(pipeline) {
    let data = [...this.collection];

    for (const stage of pipeline) {
      if (stage.$match) {
        data = data.filter((doc) =>
          Object.entries(stage.$match).every(([k, v]) => {
            if (typeof v === "object") {
              if (v.$gt) return doc[k] > v.$gt;
              return doc[k] === v;
            }
            return doc[k] === v;
          })
        );
      }
      if (stage.$group) {
        const groups = {};
        for (const doc of data) {
          const key = doc[stage.$group._id.replace("$", "")];
          if (!groups[key]) groups[key] = { _id: key, _docs: [] };
          groups[key]._docs.push(doc);
        }
        data = Object.values(groups).map((g) => {
          const result = { _id: g._id };
          for (const [field, op] of Object.entries(stage.$group)) {
            if (field === "_id") continue;
            if (op.$sum === 1) result[field] = g._docs.length;
            if (op.$avg) result[field] = g._docs.reduce((s, d) => s + d[op.$avg.replace("$", "")], 0) / g._docs.length;
          }
          return result;
        });
      }
      if (stage.$sort) {
        const [field, dir] = Object.entries(stage.$sort)[0];
        data.sort((a, b) => dir === -1 ? (a[field] > b[field] ? -1 : 1) : (a[field] > b[field] ? 1 : -1));
      }
      if (stage.$limit) data = data.slice(0, stage.$limit);
    }
    return data;
  }
}

// ========== 1. 定义 Schema ==========
console.log("1. 定义 Schema\n");

const userSchema = new Schema({
  name: { type: "String", required: true },
  email: { type: "String", required: true },
  age: { type: "Number" },
  role: { type: "String", enum: ["user", "admin"], default: "user" },
  score: { type: "Number", default: 0 },
}, { timestamps: true });

// 虚拟属性
userSchema.virtual("displayName").get(function () {
  return `${this.name} (${this.role})`;
});

// 实例方法
userSchema.methods.isAdmin = function () {
  return this.role === "admin";
};

// 静态方法
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email });
};

// 中间件
userSchema.pre("save", async function () {
  if (this.name) this.name = this.name.trim();
});

const User = new Model("User", userSchema, {});

// ========== 2. CRUD 操作 ==========
async function demo() {
  console.log("2. 创建文档\n");

  const alice = await User.create({ name: "Alice", email: "alice@test.com", age: 28 });
  console.log(`  displayName: ${alice.displayName}`);
  console.log(`  isAdmin: ${alice.isAdmin()}`);

  await User.create({ name: "Bob", email: "bob@test.com", age: 32, role: "admin", score: 90 });
  await User.create({ name: "Charlie", email: "charlie@test.com", age: 24, score: 75 });
  await User.create({ name: "Diana", email: "diana@test.com", age: 35, score: 85 });
  await User.create({ name: "Eve", email: "eve@test.com", age: 29, role: "admin", score: 95 });

  console.log(`  总文档数: ${await User.countDocuments()}`);

  // 查询
  console.log("\n3. 查询文档\n");

  let users = await User.find({ age: { $gt: 25 } });
  console.log("  age > 25:", users.map((u) => `${u.name}(${u.age})`).join(", "));

  users = await User.find({ role: "admin" });
  console.log("  admins:", users.map((u) => u.name).join(", "));

  // 链式查询
  users = await User.find({}).sort({ age: -1 }).limit(3);
  console.log("  top 3 by age:", users.map((u) => `${u.name}(${u.age})`).join(", "));

  // findOne / findById
  const bob = await User.findByEmail("bob@test.com");
  console.log(`  findByEmail: ${bob.name} (${bob.role})`);

  // 更新
  console.log("\n4. 更新与删除\n");

  await User.findByIdAndUpdate("1", { age: 29 }, { new: true });
  const updated = await User.findById("1");
  console.log(`  Alice 更新后年龄: ${updated.age}`);

  const deleted = await User.findByIdAndDelete("3");
  console.log(`  删除: ${deleted.name}`);
  console.log(`  剩余: ${await User.countDocuments()}`);

  // 聚合
  console.log("\n5. 聚合管道\n");

  const stats = await User.aggregate([
    { $match: { score: { $gt: 0 } } },
    { $group: { _id: "$role", count: { $sum: 1 }, avgScore: { $avg: "$score" } } },
    { $sort: { avgScore: -1 } },
  ]);

  console.log("  按角色统计:");
  stats.forEach((s) => {
    console.log(`    ${s._id}: ${s.count}人, 平均分=${s.avgScore.toFixed(1)}`);
  });
}

demo().then(() => {
  // ========== 6. 实际使用参考 ==========
  console.log("\n6. Mongoose 实际使用参考");
  console.log(`
  // 连接数据库
  await mongoose.connect('mongodb://localhost:27017/mydb');

  // Schema 定义
  const userSchema = new mongoose.Schema({
    name:  { type: String, required: true, trim: true },
    email: { type: String, unique: true, lowercase: true },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  }, { timestamps: true });

  // 查询 + populate
  const users = await User.find({ age: { $gt: 18 } })
    .populate('posts')
    .sort({ createdAt: -1 })
    .limit(10)
    .select('name email');
  
  // 聚合管道
  const stats = await Post.aggregate([
    { $match: { published: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
`);
  console.log("=== Mongoose 完成 ===");
});
