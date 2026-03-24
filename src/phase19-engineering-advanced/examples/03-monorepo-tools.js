// Monorepo 工具链详解
// 运行: node 03-monorepo-tools.js

console.log("=== Monorepo 工具链 ===\n");

// ========== 1. 模拟包管理器 ==========
console.log("1. 模拟 Monorepo 包管理\n");

class MonorepoManager {
  constructor(name) {
    this.name = name;
    this.packages = new Map();
  }

  addPackage(name, config) {
    this.packages.set(name, {
      name,
      version: config.version || "1.0.0",
      dependencies: config.dependencies || {},
      devDependencies: config.devDependencies || {},
      scripts: config.scripts || {},
      built: false,
      tested: false,
    });
    return this;
  }

  // 拓扑排序 (依赖优先)
  topologicalSort() {
    const sorted = [];
    const visited = new Set();
    const visiting = new Set();

    const visit = (name) => {
      if (visited.has(name)) return;
      if (visiting.has(name)) throw new Error(`循环依赖: ${name}`);

      visiting.add(name);
      const pkg = this.packages.get(name);
      if (pkg) {
        Object.keys(pkg.dependencies).forEach((dep) => {
          if (this.packages.has(dep)) visit(dep);
        });
      }
      visiting.delete(name);
      visited.add(name);
      sorted.push(name);
    };

    for (const name of this.packages.keys()) {
      visit(name);
    }

    return sorted;
  }

  // 构建 (按拓扑顺序)
  async build() {
    const order = this.topologicalSort();
    console.log("  构建顺序 (拓扑排序):");
    order.forEach((name, i) => {
      console.log(`    ${i + 1}. ${name}`);
    });
    console.log();

    for (const name of order) {
      const pkg = this.packages.get(name);
      const start = Date.now();
      await new Promise((r) => setTimeout(r, 10)); // 模拟构建
      pkg.built = true;
      console.log(`  ✅ [build] ${name} (${Date.now() - start}ms)`);
    }
    console.log();
  }

  // 筛选 (--filter)
  filter(pattern) {
    const matches = [];
    for (const [name] of this.packages) {
      if (name.includes(pattern)) matches.push(name);
    }
    return matches;
  }

  // 查看依赖图
  showDependencyGraph() {
    console.log("  依赖关系图:");
    for (const [name, pkg] of this.packages) {
      const deps = Object.keys(pkg.dependencies)
        .filter((d) => this.packages.has(d));
      if (deps.length > 0) {
        console.log(`    ${name} → ${deps.join(", ")}`);
      } else {
        console.log(`    ${name} (无内部依赖)`);
      }
    }
    console.log();
  }
}

// 创建 Monorepo
const mono = new MonorepoManager("my-monorepo");

mono
  .addPackage("@mylib/utils", {
    version: "1.0.0",
    scripts: { build: "tsc", test: "vitest" },
  })
  .addPackage("@mylib/hooks", {
    version: "1.0.0",
    dependencies: { "@mylib/utils": "workspace:*" },
    scripts: { build: "tsc", test: "vitest" },
  })
  .addPackage("@mylib/ui", {
    version: "1.0.0",
    dependencies: { "@mylib/utils": "workspace:*", "@mylib/hooks": "workspace:*" },
    scripts: { build: "vite build", test: "vitest", storybook: "storybook dev" },
  })
  .addPackage("@mylib/eslint-config", {
    version: "1.0.0",
    scripts: {},
  })
  .addPackage("@myapp/web", {
    version: "0.1.0",
    dependencies: { "@mylib/ui": "workspace:*", "@mylib/hooks": "workspace:*" },
    scripts: { dev: "vite", build: "vite build" },
  });

mono.showDependencyGraph();

// 构建
mono.build().then(() => {
  // ========== 2. Turborepo 配置 ==========
  console.log("2. Turborepo 配置\n");

  const turboConfig = {
    $schema: "https://turbo.build/schema.json",
    pipeline: {
      build: {
        dependsOn: ["^build"],
        outputs: ["dist/**"],
        description: "先构建依赖包，再构建当前包",
      },
      test: {
        dependsOn: ["build"],
        outputs: [],
        description: "先构建，再测试",
      },
      lint: {
        outputs: [],
        description: "不依赖构建，可并行",
      },
      dev: {
        cache: false,
        persistent: true,
        description: "开发模式，不缓存",
      },
    },
  };

  console.log("  turbo.json:");
  Object.entries(turboConfig.pipeline).forEach(([task, config]) => {
    console.log(`    ${task}:`);
    console.log(`      dependsOn: ${JSON.stringify(config.dependsOn || [])}`);
    console.log(`      cache: ${config.cache !== false}`);
    console.log(`      说明: ${config.description}`);
  });

  // ========== 3. pnpm workspace ==========
  console.log("\n3. 常用命令\n");
  console.log(`
  # pnpm workspace 命令
  pnpm install                          # 安装所有依赖
  pnpm --filter @mylib/ui add react     # 给指定包添加依赖
  pnpm --filter @mylib/ui dev           # 运行指定包的 dev
  pnpm -r build                         # 递归构建所有包
  pnpm --filter "./packages/*" build    # 构建 packages 下所有包

  # Turborepo 命令
  turbo run build                       # 构建 (拓扑顺序 + 缓存)
  turbo run test --filter=@mylib/ui     # 只测试 ui 包
  turbo run lint test --parallel        # 并行运行 lint 和 test
  turbo run dev --filter=@myapp/web     # 开发指定应用

  # 查看依赖图
  turbo run build --graph               # 输出依赖图
`);

  // ========== 4. 共享配置 ==========
  console.log("4. 共享配置\n");
  console.log(`
  // packages/tsconfig/base.json
  {
    "compilerOptions": {
      "target": "ES2020",
      "module": "ESNext",
      "moduleResolution": "bundler",
      "strict": true,
      "jsx": "react-jsx",
      "declaration": true,
      "outDir": "./dist"
    }
  }

  // packages/eslint-config/index.js
  module.exports = {
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier'
    ],
    rules: {
      'no-console': 'warn',
    },
  };

  // 使用: packages/ui/.eslintrc.js
  module.exports = {
    extends: ['@mylib/eslint-config'],
  };
`);

  console.log("=== Monorepo 工具链完成 ===");
});
