// 版本管理与发布详解
// 运行: node 05-versioning.js

console.log("=== 版本管理与发布 ===\n");

// ========== 1. 语义化版本 ==========
console.log("1. 语义化版本 (SemVer)\n");

class SemVer {
  constructor(version) {
    const [main, pre] = version.split("-");
    const [major, minor, patch] = main.split(".").map(Number);
    this.major = major;
    this.minor = minor;
    this.patch = patch;
    this.prerelease = pre || null;
  }

  bump(type) {
    switch (type) {
      case "major":
        return new SemVer(`${this.major + 1}.0.0`);
      case "minor":
        return new SemVer(`${this.major}.${this.minor + 1}.0`);
      case "patch":
        return new SemVer(`${this.major}.${this.minor}.${this.patch + 1}`);
      case "alpha":
        return new SemVer(`${this.major}.${this.minor}.${this.patch + 1}-alpha.1`);
      case "beta":
        return new SemVer(`${this.major}.${this.minor}.${this.patch + 1}-beta.1`);
      default:
        throw new Error(`Unknown bump type: ${type}`);
    }
  }

  satisfies(range) {
    // 简单实现 ^ 和 ~ 范围
    if (range.startsWith("^")) {
      const [maj] = range.slice(1).split(".");
      return this.major === Number(maj);
    }
    if (range.startsWith("~")) {
      const [maj, min] = range.slice(1).split(".");
      return this.major === Number(maj) && this.minor === Number(min);
    }
    return this.toString() === range;
  }

  toString() {
    const base = `${this.major}.${this.minor}.${this.patch}`;
    return this.prerelease ? `${base}-${this.prerelease}` : base;
  }
}

const current = new SemVer("1.2.3");
console.log(`  当前版本: ${current}`);
console.log(`  patch:  ${current.bump("patch")}`);
console.log(`  minor:  ${current.bump("minor")}`);
console.log(`  major:  ${current.bump("major")}`);
console.log(`  alpha:  ${current.bump("alpha")}`);
console.log(`  beta:   ${current.bump("beta")}`);

console.log(`\n  范围匹配:`);
console.log(`    1.2.3 satisfies ^1.0.0: ${current.satisfies("^1.0.0")}`);
console.log(`    1.2.3 satisfies ~1.2.0: ${current.satisfies("~1.2.0")}`);
console.log(`    1.2.3 satisfies ~1.3.0: ${current.satisfies("~1.3.0")}`);

// ========== 2. 模拟 Changesets ==========
console.log("\n2. 模拟 Changesets 工作流\n");

class ChangesetManager {
  constructor() {
    this.packages = new Map();
    this.changesets = [];
  }

  addPackage(name, version) {
    this.packages.set(name, { name, version: new SemVer(version), changelog: [] });
    return this;
  }

  // 添加变更记录
  addChangeset(id, changes) {
    this.changesets.push({ id, ...changes });
    console.log(`  📝 Changeset "${id}":`);
    changes.packages.forEach((pkg) => {
      console.log(`     ${pkg.name}: ${pkg.type} — ${pkg.summary}`);
    });
    return this;
  }

  // 应用版本更新
  version() {
    console.log("\n  📦 版本更新:");

    for (const cs of this.changesets) {
      for (const change of cs.packages) {
        const pkg = this.packages.get(change.name);
        if (!pkg) continue;

        const oldVersion = pkg.version.toString();
        pkg.version = pkg.version.bump(change.type);
        pkg.changelog.push({
          version: pkg.version.toString(),
          changes: [change.summary],
          date: new Date().toISOString().split("T")[0],
        });

        console.log(`     ${change.name}: ${oldVersion} → ${pkg.version}`);
      }
    }

    this.changesets = [];
    console.log();
  }

  // 生成 CHANGELOG
  generateChangelog(name) {
    const pkg = this.packages.get(name);
    if (!pkg) return "";

    let changelog = `# ${name} Changelog\n\n`;
    for (const entry of pkg.changelog.reverse()) {
      changelog += `## ${entry.version} (${entry.date})\n\n`;
      entry.changes.forEach((c) => {
        changelog += `- ${c}\n`;
      });
      changelog += "\n";
    }
    return changelog;
  }

  // 模拟发布
  publish() {
    console.log("  🚀 发布:");
    for (const [name, pkg] of this.packages) {
      if (pkg.changelog.length > 0) {
        console.log(`     npm publish ${name}@${pkg.version}`);
      }
    }
    console.log();
  }
}

const cm = new ChangesetManager();

cm.addPackage("@mylib/utils", "1.0.0")
  .addPackage("@mylib/hooks", "1.0.0")
  .addPackage("@mylib/ui", "1.0.0");

cm.addChangeset("brave-cats-fly", {
  packages: [
    { name: "@mylib/utils", type: "patch", summary: "修复 formatDate 时区问题" },
    { name: "@mylib/ui", type: "minor", summary: "新增 DatePicker 组件" },
  ],
});

cm.addChangeset("cool-dogs-run", {
  packages: [
    { name: "@mylib/hooks", type: "minor", summary: "新增 useDebounce hook" },
  ],
});

cm.version();
cm.publish();

// 生成 CHANGELOG
const changelog = cm.generateChangelog("@mylib/ui");
console.log("  📄 CHANGELOG (@mylib/ui):");
console.log(changelog.split("\n").map((l) => "  " + l).join("\n"));

// ========== 3. 发布检查清单 ==========
console.log("3. 发布检查清单\n");
console.log(`
  ┌──────────────────────────────────────────────────────┐
  │              发布检查清单                              │
  ├──────────────────────────────────────────────────────┤
  │                                                      │
  │  发布前:                                              │
  │  ✅ 所有测试通过                                      │
  │  ✅ Lint 检查通过                                     │
  │  ✅ TypeScript 类型检查通过                           │
  │  ✅ 构建成功                                          │
  │  ✅ CHANGELOG 更新                                    │
  │  ✅ 版本号正确 (SemVer)                               │
  │                                                      │
  │  发布:                                                │
  │  ✅ npm publish (公共包)                               │
  │  ✅ Git tag                                           │
  │  ✅ GitHub Release                                    │
  │                                                      │
  │  发布后:                                              │
  │  ✅ 验证 npm 安装                                     │
  │  ✅ 通知相关团队                                      │
  │  ✅ 监控错误报告                                      │
  │                                                      │
  └──────────────────────────────────────────────────────┘
`);

// ========== 4. CI 自动发布 ==========
console.log("4. CI 自动发布\n");
console.log(`
  # .github/workflows/release.yml
  name: Release

  on:
    push:
      branches: [main]

  jobs:
    release:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4

        - uses: pnpm/action-setup@v2

        - uses: actions/setup-node@v4
          with:
            node-version: '20'
            registry-url: 'https://registry.npmjs.org'

        - run: pnpm install
        - run: pnpm build
        - run: pnpm test

        - name: Create Release PR or Publish
          uses: changesets/action@v1
          with:
            publish: pnpm changeset publish
          env:
            GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
            NPM_TOKEN: \${{ secrets.NPM_TOKEN }}
`);

console.log("=== 版本管理完成 ===");
