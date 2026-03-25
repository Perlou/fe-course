/**
 * Mini Webpack - CLI 入口
 *
 * 用法: node src/index.js [配置文件路径]
 * 默认配置: ./mini-webpack.config.js
 */

const path = require("path");
const Compiler = require("./compiler");

// 读取配置文件
const configPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve("./mini-webpack.config.js");

let config;

try {
  config = require(configPath);
  console.log(`📋 配置文件: ${configPath}`);
} catch (e) {
  // 没有配置文件时使用默认配置
  console.log("⚠️  未找到配置文件，使用默认配置");
  config = {
    entry: "./examples/src/index.js",
    output: {
      path: "./examples/dist",
      filename: "bundle.js",
    },
  };
}

// 确保 entry 是绝对路径
if (!path.isAbsolute(config.entry)) {
  config.entry = path.resolve(config.entry);
}
if (config.output && !path.isAbsolute(config.output.path)) {
  config.output.path = path.resolve(config.output.path);
}

// 创建编译器并执行
const compiler = new Compiler(config);
const { outputFile } = compiler.run();

// 提示运行
console.log(`💡 运行打包结果: node ${path.relative(process.cwd(), outputFile)}\n`);
