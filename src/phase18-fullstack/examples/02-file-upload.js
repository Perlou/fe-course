// 文件上传方案详解
// 运行: node 02-file-upload.js

const crypto = require("crypto");
const path = require("path");

console.log("=== 文件上传方案 ===\n");

// ========== 1. 模拟 Multer 文件处理 ==========
console.log("1. 文件处理中间件\n");

class FileProcessor {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 5 * 1024 * 1024; // 5MB
    this.allowedTypes = options.allowedTypes || ["image/jpeg", "image/png", "image/webp"];
    this.storage = options.storage || "memory";
  }

  // 验证文件
  validate(file) {
    const errors = [];

    if (file.size > this.maxSize) {
      errors.push(`文件大小超出限制: ${(file.size / 1024 / 1024).toFixed(1)}MB > ${(this.maxSize / 1024 / 1024).toFixed(1)}MB`);
    }

    if (!this.allowedTypes.includes(file.mimetype)) {
      errors.push(`不支持的文件类型: ${file.mimetype}`);
    }

    return errors;
  }

  // 生成安全文件名
  generateFilename(originalName) {
    const ext = path.extname(originalName);
    const hash = crypto.randomBytes(16).toString("hex");
    const timestamp = Date.now();
    return `${timestamp}-${hash}${ext}`;
  }

  // 处理上传
  async process(file) {
    console.log(`  原始文件: ${file.name} (${file.mimetype}, ${(file.size / 1024).toFixed(1)}KB)`);

    // 验证
    const errors = this.validate(file);
    if (errors.length > 0) {
      console.log(`  ❌ 验证失败: ${errors.join(", ")}`);
      return { success: false, errors };
    }

    // 生成安全文件名
    const filename = this.generateFilename(file.name);
    console.log(`  安全文件名: ${filename}`);

    // 模拟存储
    const url = `/uploads/${filename}`;
    console.log(`  ✅ 上传成功: ${url}`);

    return { success: true, url, filename };
  }
}

// 测试
const processor = new FileProcessor({
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ["image/jpeg", "image/png", "image/webp"],
});

async function testUpload() {
  // 正常上传
  await processor.process({
    name: "photo.jpg",
    mimetype: "image/jpeg",
    size: 1024 * 500, // 500KB
  });

  console.log();

  // 文件过大
  await processor.process({
    name: "big-video.mp4",
    mimetype: "video/mp4",
    size: 50 * 1024 * 1024,
  });
}

testUpload().then(() => {
  // ========== 2. 分片上传 ==========
  console.log("\n2. 大文件分片上传\n");

  class ChunkUploader {
    constructor(chunkSize = 1024 * 1024) {
      this.chunkSize = chunkSize; // 1MB per chunk
      this.uploads = new Map();
    }

    // 初始化上传
    initUpload(fileId, totalSize, filename) {
      const totalChunks = Math.ceil(totalSize / this.chunkSize);
      this.uploads.set(fileId, {
        filename,
        totalSize,
        totalChunks,
        uploadedChunks: new Set(),
        startTime: Date.now(),
      });
      console.log(`  初始化: ${filename} (${totalChunks} 片, 每片 ${(this.chunkSize / 1024).toFixed(0)}KB)`);
      return { fileId, totalChunks };
    }

    // 上传块
    uploadChunk(fileId, chunkIndex, data) {
      const upload = this.uploads.get(fileId);
      if (!upload) throw new Error("上传不存在");

      upload.uploadedChunks.add(chunkIndex);
      const progress = (upload.uploadedChunks.size / upload.totalChunks * 100).toFixed(0);
      console.log(`  块 ${chunkIndex + 1}/${upload.totalChunks} 上传完成 (${progress}%)`);

      return {
        uploaded: upload.uploadedChunks.size,
        total: upload.totalChunks,
        progress: Number(progress),
      };
    }

    // 合并块
    mergeChunks(fileId) {
      const upload = this.uploads.get(fileId);
      if (!upload) throw new Error("上传不存在");

      if (upload.uploadedChunks.size !== upload.totalChunks) {
        const missing = [];
        for (let i = 0; i < upload.totalChunks; i++) {
          if (!upload.uploadedChunks.has(i)) missing.push(i);
        }
        throw new Error(`缺少块: ${missing.join(", ")}`);
      }

      const ms = Date.now() - upload.startTime;
      console.log(`  ✅ 合并完成: ${upload.filename} (${ms}ms)`);
      this.uploads.delete(fileId);
      return { url: `/uploads/${upload.filename}` };
    }

    // 获取已上传的块 (断点续传)
    getUploadedChunks(fileId) {
      const upload = this.uploads.get(fileId);
      if (!upload) return [];
      return [...upload.uploadedChunks];
    }
  }

  // 测试分片上传
  const uploader = new ChunkUploader(1024 * 1024);
  const fileId = "file-abc-123";

  uploader.initUpload(fileId, 3.5 * 1024 * 1024, "large-image.png");

  // 模拟分片上传
  for (let i = 0; i < 4; i++) {
    uploader.uploadChunk(fileId, i, Buffer.alloc(100));
  }

  uploader.mergeChunks(fileId);

  // ========== 3. 存储方案对比 ==========
  console.log("\n3. 存储方案对比\n");
  console.log(`
  ┌──────────────────┬────────────────────┬──────────────────┐
  │ 方案              │ 优点                │ 缺点             │
  ├──────────────────┼────────────────────┼──────────────────┤
  │ 本地文件系统     │ 简单、免费           │ 不支持分布式     │
  │ AWS S3 / OSS     │ 可靠、CDN、无限容量  │ 付费             │
  │ Cloudflare R2    │ 无出口费用           │ 生态较新         │
  │ MinIO (自建)     │ S3 兼容、可控        │ 需运维           │
  └──────────────────┴────────────────────┴──────────────────┘

  推荐:
  • 小项目/原型 → 本地文件系统
  • 生产环境    → S3 / R2 + CDN
  • 敏感数据    → MinIO 自建
`);

  // ========== 4. 实际使用参考 ==========
  console.log("4. Express + Multer 后端示例");
  console.log(`
  const multer = require('multer');

  // 内存存储 (适合小文件 + 直传 S3)
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      cb(null, allowed.includes(file.mimetype));
    },
  });

  // 单文件上传
  app.post('/api/upload', auth, upload.single('file'), async (req, res) => {
    const { file } = req;
    const key = 'uploads/' + Date.now() + '-' + file.originalname;

    // 上传到 S3
    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

    res.json({ url: CDN_URL + '/' + key });
  });

  // 多文件上传
  app.post('/api/uploads', upload.array('files', 10), ...);
`);

  console.log("=== 文件上传完成 ===");
});
