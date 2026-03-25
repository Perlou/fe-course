/**
 * Mini Webpack 配置文件
 * 类似 webpack.config.js
 */

const path = require("path");
const BannerPlugin = require("./src/plugins/banner-plugin");
const BundleSizePlugin = require("./src/plugins/bundle-size-plugin");

module.exports = {
  // 入口文件
  entry: path.resolve(__dirname, "examples/src/index.js"),

  // 输出配置
  output: {
    path: path.resolve(__dirname, "examples/dist"),
    filename: "bundle.js",
  },

  // Source Map (设为 'source-map' 启用)
  devtool: 'source-map',

  // Loader 配置: 类似 webpack 的 module.rules
  module: {
    rules: [
      {
        test: /\.css$/,
        use: path.resolve(__dirname, "src/loaders/css-loader.js"),
      },
      {
        test: /\.json$/,
        use: path.resolve(__dirname, "src/loaders/json-loader.js"),
      },
    ],
  },

  // 插件
  plugins: [
    new BannerPlugin({ banner: "Mini Webpack Demo - 版权所有" }),
    new BundleSizePlugin(),
  ],
};
