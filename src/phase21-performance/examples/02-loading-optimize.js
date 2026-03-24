// 加载性能优化详解
// 运行: node 02-loading-optimize.js

console.log("=== 加载性能优化 ===\n");

// ========== 1. 资源加载模拟器 ==========
console.log("1. 资源加载优化对比\n");

class ResourceLoader {
  constructor() {
    this.loaded = [];
    this.totalTime = 0;
  }

  async load(name, size, cached = false) {
    const duration = cached ? 1 : Math.round(size / 10); // 模拟加载时间
    await new Promise((r) => setTimeout(r, Math.min(duration, 5)));
    this.loaded.push({ name, size, duration, cached });
    this.totalTime += duration;
    return duration;
  }

  report(title) {
    console.log(`  ${title}:`);
    this.loaded.forEach((r) => {
      const cacheTag = r.cached ? " [cache]" : "";
      const bar = "█".repeat(Math.min(Math.round(r.duration / 10), 20));
      console.log(`    ${r.name.padEnd(20)} ${r.duration.toString().padStart(4)}ms ${bar}${cacheTag}`);
    });
    const totalSize = this.loaded.reduce((s, r) => s + r.size, 0);
    console.log(`    总计: ${(totalSize / 1024).toFixed(0)}KB, ${this.totalTime}ms\n`);
  }

  reset() {
    this.loaded = [];
    this.totalTime = 0;
  }
}

async function compareLoading() {
  // 未优化
  const before = new ResourceLoader();
  await before.load("app.js", 500);
  await before.load("vendor.js", 800);
  await before.load("polyfills.js", 200);
  await before.load("styles.css", 120);
  await before.load("hero.png", 2000);
  await before.load("font.woff2", 150);
  before.report("❌ 未优化 (无压缩/分割)");

  // 优化后
  const after = new ResourceLoader();
  await after.load("app.min.js", 150);       // 压缩 + Tree Shaking
  await after.load("vendor.chunk.js", 200);   // 代码分割
  await after.load("styles.min.css", 30);     // CSS 压缩
  await after.load("hero.webp", 400);         // WebP 替代 PNG
  await after.load("font.woff2", 50, true);   // 缓存命中
  after.report("✅ 优化后 (压缩/分割/缓存)");

  // ========== 2. 代码分割模拟 ==========
  console.log("2. 代码分割策略\n");

  const chunks = {
    initial: { files: ["runtime.js", "vendor.js", "app.js"], size: 180 },
    routes: {
      "/dashboard": { file: "dashboard.chunk.js", size: 45 },
      "/settings": { file: "settings.chunk.js", size: 30 },
      "/analytics": { file: "analytics.chunk.js", size: 80 },
    },
    dynamic: {
      "rich-editor": { file: "editor.chunk.js", size: 120, trigger: "用户点击编辑" },
      "pdf-export": { file: "pdf.chunk.js", size: 200, trigger: "用户点击导出" },
    },
  };

  console.log("  初始加载:");
  console.log(`    ${chunks.initial.files.join(" + ")} = ${chunks.initial.size}KB\n`);

  console.log("  路由级分割 (按需加载):");
  Object.entries(chunks.routes).forEach(([route, chunk]) => {
    console.log(`    ${route} → ${chunk.file} (${chunk.size}KB)`);
  });

  console.log("\n  动态导入 (交互触发):");
  Object.entries(chunks.dynamic).forEach(([name, chunk]) => {
    console.log(`    ${name} → ${chunk.file} (${chunk.size}KB) — 触发: ${chunk.trigger}`);
  });

  const initialSize = chunks.initial.size;
  const totalSize = initialSize + Object.values(chunks.routes).reduce((s, c) => s + c.size, 0) +
    Object.values(chunks.dynamic).reduce((s, c) => s + c.size, 0);
  console.log(`\n  初始加载: ${initialSize}KB / 总计: ${totalSize}KB (减少 ${((1 - initialSize / totalSize) * 100).toFixed(0)}%)`);

  // ========== 3. 缓存策略 ==========
  console.log("\n3. HTTP 缓存策略\n");
  console.log(`
  ┌──────────────────┬─────────────────────────────┬────────────────┐
  │ 资源类型          │ Cache-Control               │ 说明           │
  ├──────────────────┼─────────────────────────────┼────────────────┤
  │ HTML             │ no-cache                    │ 每次验证       │
  │ JS/CSS (带hash)  │ max-age=31536000, immutable │ 强缓存 1 年    │
  │ 图片 (CDN)       │ max-age=31536000            │ CDN 缓存       │
  │ API 响应         │ no-store                    │ 不缓存         │
  │ 字体文件         │ max-age=31536000, immutable │ 强缓存         │
  └──────────────────┴─────────────────────────────┴────────────────┘
`);

  // ========== 4. 图片优化 ==========
  console.log("4. 图片格式对比\n");

  const imageFormats = [
    { format: "PNG", size: 2000, quality: "无损", browser: "全部" },
    { format: "JPEG", size: 500, quality: "有损", browser: "全部" },
    { format: "WebP", size: 350, quality: "有损/无损", browser: "95%+" },
    { format: "AVIF", size: 250, quality: "有损/无损", browser: "85%+" },
  ];

  imageFormats.forEach((img) => {
    const bar = "█".repeat(Math.round(img.size / 100));
    const saving = ((1 - img.size / 2000) * 100).toFixed(0);
    console.log(`  ${img.format.padEnd(6)} ${img.size.toString().padStart(5)}KB ${bar} (-${saving}%)`);
  });

  console.log(`
  推荐策略:
  <picture>
    <source srcset="image.avif" type="image/avif" />
    <source srcset="image.webp" type="image/webp" />
    <img src="image.jpg" loading="lazy" alt="" />
  </picture>
`);

  console.log("=== 加载性能优化完成 ===");
}

compareLoading();
