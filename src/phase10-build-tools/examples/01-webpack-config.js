// Webpack 配置详解
// 本文件展示完整的 Webpack 配置（开发 + 生产环境）
// 不需要运行，作为配置参考

console.log("=== Webpack 配置详解 ===\n");

// ========== 1. 开发环境配置 ==========
console.log("1. 开发环境配置 (webpack.dev.js)");

const devConfig = `
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // === 模式 ===
  mode: 'development',

  // === 入口 ===
  entry: './src/index.js',

  // === 输出 ===
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',       // 开发环境不需要 hash
    clean: true,
  },

  // === Source Map ===
  devtool: 'eval-cheap-module-source-map', // 快速重构建 + 源码映射

  // === 开发服务器 ===
  devServer: {
    static: './dist',
    hot: true,                    // HMR 热模块替换
    port: 3000,
    open: true,                   // 自动打开浏览器
    historyApiFallback: true,     // SPA 路由回退
    compress: true,               // gzip 压缩
    proxy: {                      // API 代理
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
      },
    },
  },

  // === 模块规则 ===
  module: {
    rules: [
      // JavaScript / JSX
      {
        test: /\\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,  // 启用缓存加速
          },
        },
      },
      // TypeScript
      {
        test: /\\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      // CSS
      {
        test: /\\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      // SCSS
      {
        test: /\\.scss$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
      },
      // CSS Modules
      {
        test: /\\.module\\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]__[hash:base64:5]',
              },
            },
          },
        ],
      },
      // 图片资源
      {
        test: /\\.(png|jpe?g|gif|svg|webp)$/,
        type: 'asset',            // Webpack 5 内置
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024,    // 8KB 以下转 base64
          },
        },
        generator: {
          filename: 'images/[name].[hash:8][ext]',
        },
      },
      // 字体文件
      {
        test: /\\.(woff2?|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash:8][ext]',
        },
      },
    ],
  },

  // === 解析 ===
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
  },

  // === 插件 ===
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: 'My App',
    }),
  ],

  // === 缓存 (Webpack 5) ===
  cache: {
    type: 'filesystem',
  },
};`;

console.log(devConfig);

// ========== 2. 生产环境配置 ==========
console.log("\n\n2. 生产环境配置 (webpack.prod.js)");

const prodConfig = `
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash:8].js',     // 内容哈希
    chunkFilename: 'js/[name].[contenthash:8].chunk.js',
    assetModuleFilename: 'assets/[name].[hash:8][ext]',
    clean: true,
  },

  devtool: 'source-map', // 完整 source map (生产调试)

  module: {
    rules: [
      {
        test: /\\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      // 生产环境提取 CSS 文件
      {
        test: /\\.css$/,
        use: [
          MiniCssExtractPlugin.loader,  // 提取为独立文件
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
    ],
  },

  // === 优化 ===
  optimization: {
    minimize: true,
    minimizer: [
      // JS 压缩
      new TerserPlugin({
        parallel: true,             // 多线程
        terserOptions: {
          compress: {
            drop_console: true,     // 移除 console
            drop_debugger: true,    // 移除 debugger
          },
        },
      }),
      // CSS 压缩
      new CssMinimizerPlugin(),
    ],

    // 代码分割
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 5,
      cacheGroups: {
        // 第三方库
        vendors: {
          test: /[\\\\/]node_modules[\\\\/]/,
          name: 'vendors',
          priority: 10,
          chunks: 'initial',
        },
        // React 相关
        react: {
          test: /[\\\\/]node_modules[\\\\/](react|react-dom)/,
          name: 'react-vendor',
          priority: 20,
        },
        // 公共模块
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },

    // 运行时代码单独提取
    runtimeChunk: 'single',

    // 模块 ID 确定性哈希
    moduleIds: 'deterministic',
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      minify: {
        collapseWhitespace: true,
        removeComments: true,
      },
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
    }),
    // Gzip 压缩
    new CompressionPlugin({
      algorithm: 'gzip',
      threshold: 10240,   // 10KB 以上
    }),
    // 可选: 分析包大小
    // new BundleAnalyzerPlugin(),
  ],
};`;

console.log(prodConfig);

// ========== 3. 配置合并方案 ==========
console.log("\n\n3. 配置合并 (webpack-merge)");

console.log(`
  // webpack.common.js — 公共配置
  // webpack.dev.js   — 开发配置
  // webpack.prod.js  — 生产配置

  // webpack.dev.js
  const { merge } = require('webpack-merge');
  const common = require('./webpack.common.js');

  module.exports = merge(common, {
    mode: 'development',
    devtool: 'eval-cheap-module-source-map',
    devServer: { hot: true, port: 3000 },
  });

  // package.json
  {
    "scripts": {
      "dev": "webpack serve --config webpack.dev.js",
      "build": "webpack --config webpack.prod.js",
      "analyze": "ANALYZE=true webpack --config webpack.prod.js"
    }
  }
`);

// ========== 4. DevTool 速查 ==========
console.log("4. devtool Source Map 速查");

console.log(`
  ┌────────────────────────────────┬────────┬────────┬──────────────┐
  │ devtool                        │ 构建速度│ 重构建 │ 质量          │
  ├────────────────────────────────┼────────┼────────┼──────────────┤
  │ (none)                         │ 最快   │ 最快   │ 无 source map │
  │ eval                           │ 快     │ 最快   │ 转换后代码    │
  │ eval-cheap-source-map          │ 较快   │ 快     │ 行映射        │
  │ eval-cheap-module-source-map   │ 慢     │ 快     │ 原始源码 ✅   │
  │ source-map                     │ 最慢   │ 最慢   │ 原始源码 ✅   │
  └────────────────────────────────┴────────┴────────┴──────────────┘

  推荐:
  开发环境 → eval-cheap-module-source-map (速度与质量平衡)
  生产环境 → source-map 或 hidden-source-map
`);

console.log("\n=== Webpack 配置完成 ===");
