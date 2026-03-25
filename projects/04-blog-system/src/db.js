/**
 * 全栈博客 - 文件数据库
 *
 * 职责: 基于 JSON 文件的轻量数据库
 * 原理: 模拟 SQL/MongoDB 的增删改查 (CRUD)
 *
 * 这就是 lowdb / SQLite 的简化版！
 *
 * API:
 *   db.collection('posts').insert(data)
 *   db.collection('posts').findAll(query)
 *   db.collection('posts').findById(id)
 *   db.collection('posts').update(id, data)
 *   db.collection('posts').remove(id)
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

class Database {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.data = {};

    // 确保目录存在
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }
  }

  /**
   * 获取集合 (类似 MongoDB 的 collection / SQL 的 table)
   */
  collection(name) {
    return new Collection(this, name);
  }

  /**
   * 读取集合数据
   */
  _load(name) {
    const filePath = path.join(this.dbPath, `${name}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
    return [];
  }

  /**
   * 写入集合数据
   */
  _save(name, data) {
    const filePath = path.join(this.dbPath, `${name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  }
}

class Collection {
  constructor(db, name) {
    this.db = db;
    this.name = name;
  }

  /**
   * 插入文档
   */
  insert(doc) {
    const records = this.db._load(this.name);
    const newDoc = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2),
      ...doc,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    records.push(newDoc);
    this.db._save(this.name, records);
    return newDoc;
  }

  /**
   * 查询所有 (支持过滤)
   */
  findAll(query = {}) {
    let records = this.db._load(this.name);

    // 简单查询过滤
    Object.entries(query).forEach(([key, value]) => {
      if (key === "$search" && value) {
        // 全文搜索
        const keyword = value.toLowerCase();
        records = records.filter(
          (r) =>
            (r.title && r.title.toLowerCase().includes(keyword)) ||
            (r.content && r.content.toLowerCase().includes(keyword))
        );
      } else if (key === "$tag" && value) {
        records = records.filter(
          (r) => r.tags && r.tags.includes(value)
        );
      } else if (key === "$limit") {
        records = records.slice(0, value);
      } else if (key === "$sort") {
        const [field, order] = value.split(":");
        records.sort((a, b) => {
          if (order === "desc") return a[field] > b[field] ? -1 : 1;
          return a[field] > b[field] ? 1 : -1;
        });
      } else if (value !== undefined) {
        records = records.filter((r) => r[key] === value);
      }
    });

    return records;
  }

  /**
   * 按 ID 查询
   */
  findById(id) {
    const records = this.db._load(this.name);
    return records.find((r) => r.id === id) || null;
  }

  /**
   * 按条件查询单条
   */
  findOne(query) {
    const results = this.findAll(query);
    return results[0] || null;
  }

  /**
   * 更新文档
   */
  update(id, updates) {
    const records = this.db._load(this.name);
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) return null;

    records[index] = {
      ...records[index],
      ...updates,
      id: records[index].id,
      createdAt: records[index].createdAt,
      updatedAt: new Date().toISOString(),
    };
    this.db._save(this.name, records);
    return records[index];
  }

  /**
   * 删除文档
   */
  remove(id) {
    const records = this.db._load(this.name);
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) return false;

    records.splice(index, 1);
    this.db._save(this.name, records);
    return true;
  }

  /**
   * 统计数量
   */
  count(query = {}) {
    return this.findAll(query).length;
  }
}

module.exports = Database;
