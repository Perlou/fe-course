// 自定义 Webpack Loader 详解
// 本文件展示如何编写和使用自定义 Loader
// 运行: node 02-custom-loader.js

console.log("=== 自定义 Webpack Loader ===\n");

// ========== 1. Loader 基础 ==========
console.log("1. Loader 本质");

console.log(`
  Loader 本质: 一个函数，接收源代码，返回转换后的代码

  module.exports = function(source) {
    // source: 文件内容 (字符串)
    // return: 转换后的内容
    return transformedSource;
  };

  执行顺序: 从右到左 / 从下到上
  use: ['a-loader', 'b-loader', 'c-loader']
  执行: c → b → a
`);

// ========== 2. 同步 Loader ==========
console.log("2. 同步 Loader 示例");

// Loader 1: 去除 console.log
function removeConsoleLoader(source) {
  return source.replace(/console\.log\(.*?\);?\n?/g, "");
}

// Loader 2: 添加文件头部注释
function bannerLoader(source) {
  const banner = `/**\n * @author MyTeam\n * @date ${new Date().toISOString().split("T")[0]}\n */\n`;
  return banner + source;
}

// Loader 3: 替换环境变量
function envReplaceLoader(source) {
  return source.replace(
    /process\.env\.(\w+)/g,
    (match, key) => JSON.stringify(process.env[key] || "")
  );
}

// 模拟 Loader 链
const testCode = `
const name = 'world';
console.log('hello', name);
const env = process.env.NODE_ENV;
function greet() {
  console.log('greeting...');
  return 'Hello ' + name;
}
`;

console.log("  原始代码:");
console.log("  " + testCode.trim().split("\n").join("\n  "));

// 模拟 Loader 链执行 (从右到左)
let result = testCode;
result = envReplaceLoader(result);     // 3. 最先执行
result = removeConsoleLoader(result);   // 2.
result = bannerLoader(result);         // 1. 最后执行

console.log("\n  经过 Loader 链处理后:");
console.log("  " + result.trim().split("\n").join("\n  "));

// ========== 3. 异步 Loader ==========
console.log("\n3. 异步 Loader 示例");

console.log(`
  // 异步 Loader 使用 this.async()
  module.exports = function(source) {
    const callback = this.async(); // 获取异步回调

    fetchRemoteConfig()
      .then(config => {
        const result = applyConfig(source, config);
        callback(null, result);      // callback(error, result, sourceMap?)
      })
      .catch(err => {
        callback(err);               // 传递错误
      });
  };
`);

// 模拟异步 Loader
async function markdownLoader(source) {
  // 模拟异步操作 (如读取外部文件)
  await new Promise((r) => setTimeout(r, 10));

  // 简单的 Markdown → HTML 转换
  return source
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>\n");
}

const mdSource = `# Hello
## Subtitle
This is **bold** and *italic* text with \`code\`.
### Section`;

const htmlResult = await markdownLoader(mdSource);
console.log("  Markdown 源码:");
console.log("  " + mdSource.split("\n").join("\n  "));
console.log("\n  转换为 HTML:");
console.log("  " + htmlResult.trim().split("\n").join("\n  "));

// ========== 4. Loader 带配置选项 ==========
console.log("\n4. Loader 配置选项 (options)");

console.log(`
  // webpack.config.js
  {
    test: /\\.js$/,
    use: {
      loader: './loaders/my-loader.js',
      options: {
        prefix: '[DEBUG]',
        removeComments: true,
        languages: ['zh', 'en'],
      },
    },
  }

  // my-loader.js
  const { getOptions } = require('loader-utils');
  const { validate } = require('schema-utils');

  // 配置 Schema (JSON Schema)
  const schema = {
    type: 'object',
    properties: {
      prefix: { type: 'string' },
      removeComments: { type: 'boolean' },
    },
    additionalProperties: false,
  };

  module.exports = function(source) {
    // Webpack 5 直接用 this.getOptions()
    const options = this.getOptions();

    // 验证配置
    validate(schema, options, { name: 'My Loader' });

    // 使用配置
    if (options.removeComments) {
      source = source.replace(/\\/\\/.*$/gm, '');
      source = source.replace(/\\/\\*[\\s\\S]*?\\*\\//g, '');
    }

    if (options.prefix) {
      source = options.prefix + '\\n' + source;
    }

    return source;
  };
`);

// 模拟带选项的 Loader
function i18nLoader(source, options = {}) {
  const { defaultLang = "zh", translations = {} } = options;

  return source.replace(/__\((.*?)\)/g, (match, key) => {
    const trans = translations[defaultLang];
    return trans && trans[key] ? `"${trans[key]}"` : `"${key}"`;
  });
}

const i18nSource = `const greeting = __('hello');
const bye = __('goodbye');`;

const i18nResult = i18nLoader(i18nSource, {
  defaultLang: "zh",
  translations: {
    zh: { hello: "你好", goodbye: "再见" },
    en: { hello: "Hello", goodbye: "Goodbye" },
  },
});

console.log("  i18n Loader 演示:");
console.log("  输入:", i18nSource);
console.log("  输出:", i18nResult);

// ========== 5. Pitch Loader ==========
console.log("\n5. Pitch Loader (熔断机制)");

console.log(`
  Loader 有两个阶段: pitch (从左到右) 和 normal (从右到左)

  use: ['a-loader', 'b-loader', 'c-loader']

  正常流程:
    pitch a → pitch b → pitch c → c → b → a

  如果 pitch b 返回了内容:
    pitch a → pitch b (返回) → a
    c 和 b 的 normal 阶段被跳过

  // 实际应用: style-loader 使用 pitch 跳过后续处理
  module.exports.pitch = function(remainingRequest) {
    // remainingRequest: 后续 loader 的路径
    return \`
      var content = require(${JSON.stringify('-!' + remainingRequest)});
      // 直接注入 DOM
      var style = document.createElement('style');
      style.textContent = content;
      document.head.appendChild(style);
    \`;
  };
`);

// ========== 6. Loader 上下文 API ==========
console.log("6. Loader 上下文 (this) API");

console.log(`
  ┌─────────────────────┬───────────────────────────────────────┐
  │ API                  │ 说明                                   │
  ├─────────────────────┼───────────────────────────────────────┤
  │ this.getOptions()   │ 获取 Loader 配置选项                    │
  │ this.callback()     │ 返回多个结果 (err, content, sourceMap) │
  │ this.async()        │ 标记为异步 Loader，返回 callback        │
  │ this.resourcePath   │ 当前处理的文件路径                      │
  │ this.rootContext    │ 项目根目录                              │
  │ this.addDependency()│ 添加文件依赖 (监听变化)                  │
  │ this.emitFile()     │ 输出文件到 output 目录                  │
  │ this.emitWarning()  │ 发出警告                               │
  │ this.emitError()    │ 发出错误                               │
  │ this.sourceMap      │ 是否需要生成 source map                 │
  │ this.cacheable()    │ 设置是否可缓存 (默认 true)              │
  └─────────────────────┴───────────────────────────────────────┘
`);

// ========== 7. 实用 Loader 实现集合 ==========
console.log("7. 实用 Loader 实现");

// SVG → React 组件 Loader 原理
function svgToReactLoader(source) {
  const componentName = "SvgIcon";
  return `
import React from 'react';
export default function ${componentName}(props) {
  return (
    ${source.replace("<svg", "<svg {...props}")}
  );
}`.trim();
}

// YAML → JSON Loader
function yamlLoader(source) {
  // 简化版 YAML → JSON
  const lines = source.split("\n").filter((l) => l.trim() && !l.trim().startsWith("#"));
  const obj = {};
  lines.forEach((line) => {
    const [key, ...values] = line.split(":");
    if (key && values.length) {
      obj[key.trim()] = values.join(":").trim();
    }
  });
  return `module.exports = ${JSON.stringify(obj, null, 2)};`;
}

const yamlSource = `name: my-project
version: 1.0.0
# comment
author: test`;

console.log("  YAML Loader:");
console.log("  输入:", yamlSource);
console.log("  输出:", yamlLoader(yamlSource));

console.log("\n=== 自定义 Loader 完成 ===");
