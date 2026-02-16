// Vite 配置详解与原理
// 本文件展示 Vite 的完整配置和核心原理
// 运行: node 04-vite-config.js

console.log("=== Vite 配置与原理 ===\n");

// ========== 1. Vite vs Webpack 对比 ==========
console.log("1. Vite vs Webpack 核心区别");

console.log(`
  ┌─────────────────┬──────────────────────┬──────────────────────┐
  │                 │      Webpack          │       Vite           │
  ├─────────────────┼──────────────────────┼──────────────────────┤
  │ 开发启动        │ 慢（全量打包）        │ 快（无需打包）        │
  │ HMR 速度        │ 较慢（重新编译）      │ 极快（精确更新）      │
  │ 开发模式        │ Bundle（打包）        │ 原生 ESM              │
  │ 生产构建        │ Webpack               │ Rollup                │
  │ 依赖预构建      │ 不需要                │ esbuild（Go 编写）    │
  │ 配置复杂度      │ 高                   │ 低                    │
  │ 生态           │ 最成熟                │ 快速增长              │
  └─────────────────┴──────────────────────┴──────────────────────┘

  Vite 开发模式原理:
  ┌──────────────────────────────────────────────────────────────┐
  │                                                              │
  │  浏览器                    Vite Dev Server                    │
  │                                                              │
  │  index.html                                                  │
  │    └→ <script type="module" src="/src/main.js">              │
  │         └→ import App from './App.vue'                       │
  │              └→ 按需编译 App.vue → 返回 JS 模块              │
  │                   └→ import Button from './Button.vue'       │
  │                        └→ 按需编译 Button.vue                │
  │                                                              │
  │  特点: 只编译浏览器实际请求的模块 (按需 + 缓存)                │
  │                                                              │
  └──────────────────────────────────────────────────────────────┘
`);

// ========== 2. 完整 Vite 配置 ==========
console.log("2. 完整 vite.config.ts");

const viteConfig = `
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // === 基础配置 ===
    base: '/',                          // 公共基础路径
    publicDir: 'public',                // 静态资源目录

    // === 插件 ===
    plugins: [
      react(),
      // 传统浏览器兼容
      legacy({
        targets: ['defaults', 'not IE 11'],
      }),
      // 包分析 (仅构建时)
      mode === 'analyze' && visualizer({
        open: true,
        gzipSize: true,
      }),
    ].filter(Boolean),

    // === 路径解析 ===
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@styles': path.resolve(__dirname, 'src/styles'),
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },

    // === 开发服务器 ===
    server: {
      host: '0.0.0.0',                 // 允许外网访问
      port: 3000,
      strictPort: true,                // 端口被占用时直接退出
      open: true,                       // 自动打开浏览器
      cors: true,
      // API 代理
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\\/api/, ''),
          // 自定义代理配置
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              console.log('[Proxy]', req.method, req.url);
            });
          },
        },
        // WebSocket 代理
        '/ws': {
          target: 'ws://localhost:8080',
          ws: true,
        },
      },
    },

    // === 预览服务器 (build 后) ===
    preview: {
      port: 4173,
      open: true,
    },

    // === CSS 配置 ===
    css: {
      // CSS Modules
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: '[name]__[local]__[hash:base64:5]',
      },
      // 预处理器
      preprocessorOptions: {
        scss: {
          additionalData: \`@import "@/styles/variables.scss";\`,
        },
        less: {
          javascriptEnabled: true,
          modifyVars: {
            'primary-color': '#1890ff',
          },
        },
      },
      // PostCSS
      postcss: {
        plugins: [
          require('autoprefixer'),
          require('postcss-pxtorem')({
            rootValue: 16,
            propList: ['*'],
          }),
        ],
      },
    },

    // === 构建配置 ===
    build: {
      target: 'es2015',                // 浏览器兼容目标
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode === 'staging',   // staging 才开 sourcemap
      minify: 'terser',                // terser | esbuild
      terserOptions: {
        compress: {
          drop_console: true,           // 移除 console
          drop_debugger: true,
        },
      },

      // Rollup 配置
      rollupOptions: {
        output: {
          // 代码分割
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'router': ['react-router-dom'],
            'ui': ['antd'],
          },
          // 自定义文件名
          entryFileNames: 'js/[name].[hash].js',
          chunkFileNames: 'js/[name].[hash].js',
          assetFileNames: (assetInfo) => {
            if (/\\.css$/.test(assetInfo.name)) return 'css/[name].[hash][extname]';
            if (/\\.(png|jpe?g|gif|svg|webp)$/.test(assetInfo.name))
              return 'images/[name].[hash][extname]';
            if (/\\.(woff2?|eot|ttf)$/.test(assetInfo.name))
              return 'fonts/[name].[hash][extname]';
            return 'assets/[name].[hash][extname]';
          },
        },
      },

      // 压缩大小报告
      reportCompressedSize: true,

      // chunk 大小警告阈值
      chunkSizeWarningLimit: 500,       // KB
    },

    // === 环境变量 ===
    // .env 文件中 VITE_ 开头的变量会暴露给客户端
    // import.meta.env.VITE_API_URL
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },

    // === 依赖预构建 (esbuild) ===
    optimizeDeps: {
      include: ['react', 'react-dom', 'lodash-es'],
      exclude: ['your-local-package'],
    },
  };
});`;

console.log(viteConfig);

// ========== 3. 自定义 Vite 插件 ==========
console.log("\n\n3. 自定义 Vite 插件");

console.log(`
  // Vite 插件 = Rollup 插件 + Vite 专属钩子
  function myVitePlugin() {
    return {
      name: 'vite-plugin-my-plugin', // 必须

      // === Vite 专属钩子 ===

      // 在解析配置前调用
      config(config, { command, mode }) {
        return { /* 合并配置 */ };
      },

      // 配置解析完毕
      configResolved(config) {
        console.log('最终配置:', config.base);
      },

      // 配置开发服务器
      configureServer(server) {
        // 添加自定义中间件
        server.middlewares.use('/api/health', (req, res) => {
          res.end(JSON.stringify({ status: 'ok' }));
        });
      },

      // HTML 转换
      transformIndexHtml(html) {
        return html.replace(
          '</head>',
          '<script>window.__BUILD_TIME__ = "' + new Date().toISOString() + '"</script>\\n</head>'
        );
      },

      // HMR 热更新处理
      handleHotUpdate({ file, server }) {
        if (file.endsWith('.json')) {
          console.log('JSON 文件变化:', file);
          server.ws.send({ type: 'full-reload' });
          return []; // 阻止默认 HMR
        }
      },

      // === Rollup 通用钩子 ===

      // 解析模块路径
      resolveId(source) {
        if (source === 'virtual:my-module') {
          return '\\0' + source; // \\0 前缀标记虚拟模块
        }
      },

      // 加载模块内容
      load(id) {
        if (id === '\\0virtual:my-module') {
          return 'export const msg = "Hello from virtual module!"';
        }
      },

      // 转换模块代码
      transform(code, id) {
        if (id.endsWith('.custom')) {
          return { code: transformCustomFile(code), map: null };
        }
      },
    };
  }
`);

// ========== 4. 环境变量配置 ==========
console.log("4. 环境变量配置");

console.log(`
  # .env (所有环境)
  VITE_APP_TITLE=My App

  # .env.development (开发环境)
  VITE_API_URL=http://localhost:8080
  VITE_DEBUG=true

  # .env.production (生产环境)
  VITE_API_URL=https://api.example.com
  VITE_DEBUG=false

  # .env.staging (自定义模式)
  VITE_API_URL=https://staging-api.example.com

  使用:
  // 客户端代码中
  console.log(import.meta.env.VITE_API_URL);
  console.log(import.meta.env.MODE);       // development | production
  console.log(import.meta.env.DEV);        // true 开发模式
  console.log(import.meta.env.PROD);       // true 生产模式

  // 启动命令
  {
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "build:staging": "vite build --mode staging",
      "preview": "vite preview"
    }
  }
`);

// ========== 5. 常用 Vite 插件 ==========
console.log("5. 常用 Vite 插件");

console.log(`
  ┌──────────────────────────────┬──────────────────────────────┐
  │ 插件                          │ 说明                          │
  ├──────────────────────────────┼──────────────────────────────┤
  │ @vitejs/plugin-react         │ React 支持 (Fast Refresh)     │
  │ @vitejs/plugin-vue           │ Vue 3 SFC 支持                │
  │ @vitejs/plugin-legacy        │ 传统浏览器兼容                │
  │ vite-plugin-compression      │ Gzip/Brotli 压缩              │
  │ vite-plugin-imagemin         │ 图片压缩                      │
  │ vite-plugin-svg-icons        │ SVG 雪碧图                    │
  │ vite-plugin-pwa              │ PWA 支持                      │
  │ vite-plugin-mock             │ Mock 数据                     │
  │ rollup-plugin-visualizer     │ 包体积分析                    │
  │ unplugin-auto-import         │ API 自动导入                  │
  │ unplugin-vue-components      │ 组件自动注册                  │
  └──────────────────────────────┴──────────────────────────────┘
`);

console.log("=== Vite 配置完成 ===");
