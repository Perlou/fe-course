// CI/CD 配置详解
// 运行: node 04-cicd-config.js

console.log("=== CI/CD 配置 ===\n");

// ========== 1. CI/CD 流程 ==========
console.log("1. CI/CD 流程概述\n");
console.log(`
  ┌───────────────────────────────────────────────────────────┐
  │                    CI/CD 流程                              │
  ├───────────────────────────────────────────────────────────┤
  │                                                           │
  │  代码推送 → 触发 CI → 安装依赖 → Lint → 测试 → 构建      │
  │                                              ↓            │
  │                          ← 通知 ← 监控 ← 部署             │
  │                                                           │
  │  CI (持续集成):                                           │
  │  ├── 代码检查 (ESLint, Prettier)                          │
  │  ├── 类型检查 (TypeScript)                                │
  │  ├── 单元测试 (Jest/Vitest)                               │
  │  └── 构建验证                                             │
  │                                                           │
  │  CD (持续部署):                                           │
  │  ├── 预发布 → staging 环境                                │
  │  ├── 正式发布 → production 环境                           │
  │  └── 回滚机制                                             │
  │                                                           │
  └───────────────────────────────────────────────────────────┘
`);

// ========== 2. GitHub Actions ==========
console.log("2. GitHub Actions 工作流\n");

const ciWorkflow = `
  # .github/workflows/ci.yml
  name: CI

  on:
    push:
      branches: [main, develop]
    pull_request:
      branches: [main]

  jobs:
    lint-and-test:
      runs-on: ubuntu-latest

      strategy:
        matrix:
          node-version: [18, 20]

      steps:
        - uses: actions/checkout@v4

        - name: Setup pnpm
          uses: pnpm/action-setup@v2
          with:
            version: 8

        - name: Setup Node.js \${{ matrix.node-version }}
          uses: actions/setup-node@v4
          with:
            node-version: \${{ matrix.node-version }}
            cache: 'pnpm'

        - name: Install dependencies
          run: pnpm install --frozen-lockfile

        - name: Lint
          run: pnpm lint

        - name: Type check
          run: pnpm typecheck

        - name: Test
          run: pnpm test -- --coverage

        - name: Upload coverage
          if: matrix.node-version == 20
          uses: codecov/codecov-action@v3
`;

console.log(ciWorkflow);

const deployWorkflow = `
  # .github/workflows/deploy.yml
  name: Deploy

  on:
    push:
      branches: [main]

  jobs:
    deploy-frontend:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: pnpm/action-setup@v2
        - run: pnpm install && pnpm --filter frontend build
        - name: Deploy to Vercel
          uses: amondnet/vercel-action@v25
          with:
            vercel-token: \${{ secrets.VERCEL_TOKEN }}
            vercel-args: '--prod'

    deploy-backend:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - name: Deploy to Railway
          uses: bervProject/railway-deploy@v1.0.0
          with:
            railway_token: \${{ secrets.RAILWAY_TOKEN }}
            service: backend
`;

console.log(deployWorkflow);

// ========== 3. 模拟 CI 流程 ==========
console.log("3. 模拟 CI 流程\n");

class CIPipeline {
  constructor(name) {
    this.name = name;
    this.steps = [];
    this.results = [];
  }

  addStep(name, fn) {
    this.steps.push({ name, fn });
    return this;
  }

  async run() {
    console.log(`  🚀 Pipeline: ${this.name}`);
    console.log(`  ${"─".repeat(40)}`);

    const startTime = Date.now();

    for (const step of this.steps) {
      const stepStart = Date.now();
      try {
        await step.fn();
        const ms = Date.now() - stepStart;
        console.log(`  ✅ ${step.name} (${ms}ms)`);
        this.results.push({ name: step.name, success: true, ms });
      } catch (err) {
        const ms = Date.now() - stepStart;
        console.log(`  ❌ ${step.name} (${ms}ms): ${err.message}`);
        this.results.push({ name: step.name, success: false, ms, error: err.message });
        console.log(`\n  ❌ Pipeline 失败!`);
        return false;
      }
    }

    const totalMs = Date.now() - startTime;
    console.log(`  ${"─".repeat(40)}`);
    console.log(`  ✅ Pipeline 完成! (${totalMs}ms)\n`);
    return true;
  }
}

async function simulateCI() {
  const pipeline = new CIPipeline("frontend-ci");

  pipeline
    .addStep("安装依赖", async () => {
      await new Promise((r) => setTimeout(r, 20));
    })
    .addStep("ESLint 检查", async () => {
      await new Promise((r) => setTimeout(r, 15));
      // 模拟通过
    })
    .addStep("TypeScript 类型检查", async () => {
      await new Promise((r) => setTimeout(r, 10));
    })
    .addStep("单元测试 (32 passed)", async () => {
      await new Promise((r) => setTimeout(r, 25));
    })
    .addStep("构建", async () => {
      await new Promise((r) => setTimeout(r, 30));
    })
    .addStep("部署到 Vercel", async () => {
      await new Promise((r) => setTimeout(r, 20));
    });

  await pipeline.run();

  // 失败示例
  const failPipeline = new CIPipeline("backend-ci (失败示例)");
  failPipeline
    .addStep("安装依赖", async () => {
      await new Promise((r) => setTimeout(r, 10));
    })
    .addStep("ESLint 检查", async () => {
      throw new Error("3 errors found");
    })
    .addStep("测试", async () => {});

  await failPipeline.run();
}

simulateCI().then(() => {
  // ========== 4. 环境变量管理 ==========
  console.log("4. Secrets 管理\n");
  console.log(`
  GitHub Secrets 设置:
  Settings → Secrets and variables → Actions → New repository secret

  常用 Secrets:
  ┌──────────────────────┬────────────────────────────────┐
  │ Secret Name          │ 说明                            │
  ├──────────────────────┼────────────────────────────────┤
  │ VERCEL_TOKEN         │ Vercel 部署令牌                 │
  │ RAILWAY_TOKEN        │ Railway 部署令牌                │
  │ DATABASE_URL         │ 数据库连接字符串                │
  │ JWT_SECRET           │ JWT 签名密钥                    │
  │ AWS_ACCESS_KEY_ID    │ AWS 访问 Key                    │
  │ CODECOV_TOKEN        │ 代码覆盖率上传令牌              │
  └──────────────────────┴────────────────────────────────┘
`);

  // ========== 5. 实用配置 ==========
  console.log("5. 实用配置\n");
  console.log(`
  # Husky + lint-staged (提交前检查)
  npx husky init
  npx husky add .husky/pre-commit "npx lint-staged"

  // package.json
  {
    "lint-staged": {
      "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
      "*.{css,md,json}": ["prettier --write"]
    }
  }

  # Commitlint (规范提交信息)
  # 格式: type(scope): description
  # feat: 新功能    fix: 修复    docs: 文档
  # style: 样式     refactor: 重构  test: 测试
  # chore: 构建     perf: 性能    ci: CI配置
`);

  console.log("=== CI/CD 配置完成 ===");
});
