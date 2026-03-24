// Module Federation 详解
// 运行: node 05-module-federation.js

console.log("=== Module Federation ===\n");

// ========== 1. 模拟 Module Federation ==========
console.log("1. 模拟 Module Federation 加载器\n");

// 模拟远程模块注册中心
class ModuleRegistry {
  constructor() {
    this.remotes = new Map();
    this.shared = new Map();
    this.loadedModules = new Map();
  }

  // 注册远程应用
  registerRemote(name, config) {
    this.remotes.set(name, {
      name,
      url: config.url,
      modules: config.modules,
      loaded: false,
    });
    console.log(`  注册 Remote: ${name} (${config.url})`);
  }

  // 注册共享模块
  registerShared(name, module, version) {
    this.shared.set(name, { module, version, loaded: true });
    console.log(`  注册 Shared: ${name}@${version}`);
  }

  // 加载远程模块
  async loadModule(remoteName, modulePath) {
    const remote = this.remotes.get(remoteName);
    if (!remote) throw new Error(`Remote "${remoteName}" not found`);

    const key = `${remoteName}/${modulePath}`;

    if (this.loadedModules.has(key)) {
      console.log(`  [cache] ${key} — 命中缓存`);
      return this.loadedModules.get(key);
    }

    // 模拟网络加载
    console.log(`  [load] ${key} — 从 ${remote.url} 加载`);
    await new Promise((r) => setTimeout(r, 15));

    const mod = remote.modules[modulePath];
    if (!mod) throw new Error(`Module "${modulePath}" not exposed by "${remoteName}"`);

    // 检查共享依赖
    if (mod.dependencies) {
      for (const dep of mod.dependencies) {
        if (this.shared.has(dep)) {
          console.log(`  [shared] ${dep} — 使用共享版本`);
        }
      }
    }

    this.loadedModules.set(key, mod);
    remote.loaded = true;
    return mod;
  }

  // 查看已加载模块
  getLoadedModules() {
    return [...this.loadedModules.keys()];
  }
}

// ========== 2. 设置应用 ==========

const registry = new ModuleRegistry();

// 注册共享模块
registry.registerShared("react", { createElement: () => {} }, "18.2.0");
registry.registerShared("react-dom", { render: () => {} }, "18.2.0");

console.log();

// 注册远程应用
registry.registerRemote("app1", {
  url: "http://localhost:3001/remoteEntry.js",
  modules: {
    "./Button": {
      name: "Button",
      render: () => "<button>Remote Button</button>",
      dependencies: ["react"],
    },
    "./UserList": {
      name: "UserList",
      render: () => "<ul><li>Alice</li><li>Bob</li></ul>",
      dependencies: ["react"],
    },
  },
});

registry.registerRemote("app2", {
  url: "http://localhost:3002/remoteEntry.js",
  modules: {
    "./Chart": {
      name: "Chart",
      render: () => "<div>📊 Chart Component</div>",
      dependencies: ["react"],
    },
  },
});

async function demo() {
  // 加载远程模块
  console.log("\n2. 加载远程模块\n");

  const Button = await registry.loadModule("app1", "./Button");
  console.log(`  渲染: ${Button.render()}`);

  const UserList = await registry.loadModule("app1", "./UserList");
  console.log(`  渲染: ${UserList.render()}`);

  const Chart = await registry.loadModule("app2", "./Chart");
  console.log(`  渲染: ${Chart.render()}`);

  // 缓存生效
  console.log();
  await registry.loadModule("app1", "./Button"); // 命中缓存

  console.log(`\n  已加载模块: [${registry.getLoadedModules().join(", ")}]`);

  // ========== 3. Webpack 配置详解 ==========
  console.log("\n3. Webpack Module Federation 配置\n");
  console.log(`
  // Host (主应用)
  new ModuleFederationPlugin({
    name: 'host',
    remotes: {
      app1: 'app1@http://localhost:3001/remoteEntry.js',
      app2: 'app2@http://localhost:3002/remoteEntry.js',
    },
    shared: {
      react: { singleton: true, requiredVersion: '^18.0.0' },
      'react-dom': { singleton: true },
      'react-router-dom': { singleton: true },
    },
  });

  // Remote (子应用)
  new ModuleFederationPlugin({
    name: 'app1',
    filename: 'remoteEntry.js',
    exposes: {
      './Button': './src/components/Button',
      './UserList': './src/components/UserList',
    },
    shared: {
      react: { singleton: true, eager: false },
      'react-dom': { singleton: true },
    },
  });
`);

  // ========== 4. Vite 方案 ==========
  console.log("4. Vite Module Federation\n");
  console.log(`
  // vite.config.ts (使用 @originjs/vite-plugin-federation)
  import federation from '@originjs/vite-plugin-federation';

  export default defineConfig({
    plugins: [
      federation({
        name: 'host',
        remotes: {
          app1: 'http://localhost:3001/assets/remoteEntry.js',
        },
        shared: ['react', 'react-dom'],
      }),
    ],
  });

  // 使用
  const RemoteButton = React.lazy(() => import('app1/Button'));
`);

  // ========== 5. 方案对比 ==========
  console.log("5. 微前端方案对比\n");
  console.log(`
  ┌──────────────────┬──────────────┬──────────────┬──────────────┐
  │                  │ qiankun      │ Module Fed.  │ iframe       │
  ├──────────────────┼──────────────┼──────────────┼──────────────┤
  │ 技术栈无关       │ ✅           │ ⚠️ (Webpack) │ ✅           │
  │ JS 沙箱          │ ✅           │ ❌           │ ✅ (天然)    │
  │ CSS 隔离         │ ✅           │ ❌           │ ✅ (天然)    │
  │ 通信             │ 全局状态     │ 共享模块     │ postMessage  │
  │ 性能             │ 好           │ 最好         │ 差           │
  │ 开发体验         │ 好           │ 好           │ 一般         │
  │ 共享依赖         │ ❌           │ ✅           │ ❌           │
  │ 适用场景         │ 异构大系统   │ 同构系统     │ 快速集成     │
  └──────────────────┴──────────────┴──────────────┴──────────────┘

  选型建议:
  • 异构多技术栈 → qiankun
  • 同构共享模块 → Module Federation
  • 快速集成第三方 → iframe
  • 新项目组件共享 → Module Federation
`);

  console.log("=== Module Federation 完成 ===");
}

demo();
