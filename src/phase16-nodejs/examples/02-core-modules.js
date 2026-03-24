// Node.js 核心模块详解
// 运行: node 02-core-modules.js

const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");
const os = require("os");
const { EventEmitter } = require("events");
const { Readable, Writable, Transform, pipeline } = require("stream");
const { promisify } = require("util");
const crypto = require("crypto");

console.log("=== Node.js 核心模块 ===\n");

// ========== 1. path 模块 ==========
console.log("1. path 模块\n");

const filePath = "/users/alice/documents/report.txt";

console.log(`  原始路径: ${filePath}`);
console.log(`  basename: ${path.basename(filePath)}`);
console.log(`  dirname:  ${path.dirname(filePath)}`);
console.log(`  extname:  ${path.extname(filePath)}`);
console.log(`  parse:    ${JSON.stringify(path.parse(filePath))}`);

console.log(`  join:     ${path.join("/users", "alice", "docs")}`);
console.log(`  resolve:  ${path.resolve("docs", "file.txt")}`);
console.log(`  relative: ${path.relative("/users/alice", "/users/bob")}`);
console.log(`  isAbsolute('/foo'): ${path.isAbsolute("/foo")}`);
console.log(`  sep: "${path.sep}", delimiter: "${path.delimiter}"`);

// ========== 2. fs 模块 ==========
console.log("\n2. fs 文件系统\n");

const tmpDir = path.join(os.tmpdir(), "node-demo-" + Date.now());
const testFile = path.join(tmpDir, "test.txt");

async function fsDemo() {
  // 创建目录
  await fsPromises.mkdir(tmpDir, { recursive: true });
  console.log(`  创建目录: ${tmpDir}`);

  // 写入文件
  await fsPromises.writeFile(testFile, "Hello Node.js!\n");
  console.log(`  写入文件: ${testFile}`);

  // 追加内容
  await fsPromises.appendFile(testFile, "第二行内容\n");

  // 读取文件
  const content = await fsPromises.readFile(testFile, "utf8");
  console.log(`  读取内容: "${content.trim()}"`);

  // 文件信息
  const stats = await fsPromises.stat(testFile);
  console.log(`  文件大小: ${stats.size} bytes`);
  console.log(`  是文件: ${stats.isFile()}, 是目录: ${stats.isDirectory()}`);
  console.log(`  修改时间: ${stats.mtime.toLocaleString()}`);

  // 复制文件
  const copyFile = path.join(tmpDir, "copy.txt");
  await fsPromises.copyFile(testFile, copyFile);
  console.log(`  复制到: ${copyFile}`);

  // 读取目录
  const files = await fsPromises.readdir(tmpDir);
  console.log(`  目录内容: [${files.join(", ")}]`);

  // 重命名
  const renamedFile = path.join(tmpDir, "renamed.txt");
  await fsPromises.rename(copyFile, renamedFile);
  console.log(`  重命名: copy.txt → renamed.txt`);

  // 删除文件
  await fsPromises.unlink(renamedFile);
  await fsPromises.unlink(testFile);
  console.log("  删除文件完成");

  // 删除目录
  await fsPromises.rmdir(tmpDir);
  console.log("  删除目录完成");
}

// ========== 3. events 模块 ==========
function eventsDemo() {
  console.log("\n3. EventEmitter 事件系统\n");

  // 自定义事件发射器
  class TaskRunner extends EventEmitter {
    constructor() {
      super();
      this.tasks = [];
    }

    addTask(name, fn) {
      this.tasks.push({ name, fn });
      this.emit("taskAdded", name);
    }

    async runAll() {
      this.emit("start", this.tasks.length);

      for (const task of this.tasks) {
        this.emit("taskStart", task.name);
        try {
          const result = await task.fn();
          this.emit("taskDone", task.name, result);
        } catch (err) {
          this.emit("taskError", task.name, err);
        }
      }

      this.emit("done");
    }
  }

  const runner = new TaskRunner();

  // 注册监听
  runner.on("taskAdded", (name) => console.log(`  📋 任务已添加: ${name}`));
  runner.on("start", (count) => console.log(`  🚀 开始执行 ${count} 个任务`));
  runner.on("taskStart", (name) => console.log(`  ⏳ 执行: ${name}`));
  runner.on("taskDone", (name, r) => console.log(`  ✅ 完成: ${name} → ${r}`));
  runner.on("taskError", (name, e) => console.log(`  ❌ 失败: ${name} → ${e.message}`));
  runner.on("done", () => console.log("  🎉 全部完成!"));

  // 错误处理 (必须监听 error 事件)
  runner.on("error", (err) => console.error("  错误:", err.message));

  // 添加任务
  runner.addTask("计算", () => 1 + 1);
  runner.addTask("异步", () => new Promise((r) => setTimeout(() => r("OK"), 10)));

  return runner.runAll();
}

// ========== 4. stream 流 ==========
function streamDemo() {
  console.log("\n4. Stream 流\n");

  // 4.1 可读流
  console.log("  4.1 自定义可读流");
  const numbers = new Readable({
    objectMode: true,
    read() {
      // 推送 1-5
      for (let i = 1; i <= 5; i++) this.push(i);
      this.push(null); // 结束标记
    },
  });

  // 4.2 转换流
  console.log("  4.2 自定义转换流");
  const doubler = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      this.push(chunk * 2);
      callback();
    },
  });

  // 4.3 可写流
  const printer = new Writable({
    objectMode: true,
    write(chunk, encoding, callback) {
      process.stdout.write(`  ${chunk} `);
      callback();
    },
  });

  // 管道: 1,2,3,4,5 → x2 → 打印
  return new Promise((resolve) => {
    numbers
      .pipe(doubler)
      .pipe(printer)
      .on("finish", () => {
        console.log("\n  流处理完成: 1-5 各乘以2");
        resolve();
      });
  });
}

// ========== 5. os 模块 ==========
function osDemo() {
  console.log("\n5. os 系统信息\n");

  console.log(`  平台: ${os.platform()} (${os.arch()})`);
  console.log(`  主机名: ${os.hostname()}`);
  console.log(`  CPU 核心: ${os.cpus().length}`);
  console.log(`  总内存: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(1)} GB`);
  console.log(`  可用内存: ${(os.freemem() / 1024 / 1024 / 1024).toFixed(1)} GB`);
  console.log(`  运行时间: ${(os.uptime() / 3600).toFixed(1)} 小时`);
  console.log(`  临时目录: ${os.tmpdir()}`);
  console.log(`  Home: ${os.homedir()}`);
}

// ========== 6. crypto 模块 ==========
function cryptoDemo() {
  console.log("\n6. crypto 加密\n");

  // MD5 哈希
  const md5 = crypto.createHash("md5").update("hello").digest("hex");
  console.log(`  MD5('hello'):    ${md5}`);

  // SHA256 哈希
  const sha256 = crypto.createHash("sha256").update("hello").digest("hex");
  console.log(`  SHA256('hello'): ${sha256.slice(0, 32)}...`);

  // 随机字节
  const randomBytes = crypto.randomBytes(16).toString("hex");
  console.log(`  随机 16 字节:   ${randomBytes}`);

  // UUID
  const uuid = crypto.randomUUID();
  console.log(`  UUID:           ${uuid}`);

  // HMAC
  const hmac = crypto
    .createHmac("sha256", "secret-key")
    .update("message")
    .digest("hex");
  console.log(`  HMAC-SHA256:    ${hmac.slice(0, 32)}...`);
}

// ========== 7. process 模块 ==========
function processDemo() {
  console.log("\n7. process 进程信息\n");

  console.log(`  Node.js 版本: ${process.version}`);
  console.log(`  PID: ${process.pid}`);
  console.log(`  CWD: ${process.cwd()}`);
  console.log(`  运行时间: ${process.uptime().toFixed(2)}s`);
  console.log(
    `  内存使用: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`
  );
  console.log(`  argv: ${process.argv.slice(0, 2).join(" ")}`);
}

// 按顺序运行所有 demo
(async () => {
  await fsDemo();
  await eventsDemo();
  await streamDemo();
  osDemo();
  cryptoDemo();
  processDemo();
  console.log("\n=== 核心模块完成 ===");
})();
