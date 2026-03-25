/**
 * Mini Webpack - 解析器
 *
 * 职责: 提取 import/require 依赖，转换 ESM→CJS
 * 原理: 逐行处理，避免匹配注释中的关键字
 *
 * Webpack 真实实现使用 acorn 做 AST 解析,
 * 这里用正则简化，但核心思路相同: 找出所有依赖路径
 */

class Parser {
  /**
   * 解析源码，提取依赖并转换为 CJS
   * @param {string} source - 源码内容
   * @returns {{ code: string, dependencies: string[] }}
   */
  parse(source) {
    const dependencies = [];

    // 去除注释后的代码用于提取依赖 (避免误匹配)
    const stripped = this._stripComments(source);

    // 1. 提取 ESM import 依赖
    const importRegex =
      /import\s+(?:(?:[\w*{}\s,]+)\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(stripped)) !== null) {
      dependencies.push(match[1]);
    }

    // 2. 提取 CJS require 依赖
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((match = requireRegex.exec(stripped)) !== null) {
      if (!dependencies.includes(match[1])) {
        dependencies.push(match[1]);
      }
    }

    // 3. 逐行转换 ESM → CJS (保留注释不变)
    const code = this._transform(source);

    return { code, dependencies };
  }

  /**
   * 逐行转换 ESM 为 CJS
   */
  _transform(source) {
    const lines = source.split("\n");
    const exportedNames = []; // 收集 export const/function 的名称
    const result = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // 跳过注释行
      if (line.trimStart().startsWith("//") || line.trimStart().startsWith("*")) {
        result.push(line);
        continue;
      }

      // --- Import 转换 ---

      // import foo from './foo'
      line = line.replace(
        /^(\s*)import\s+([\w$]+)\s+from\s+['"]([^'"]+)['"]\s*;?\s*$/,
        '$1const $2 = require("$3").default || require("$3");'
      );

      // import { a, b } from './foo'
      line = line.replace(
        /^(\s*)import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]\s*;?\s*$/,
        (_, indent, names, src) => {
          const cleaned = names.split(",").map(n => {
            const parts = n.trim().split(/\s+as\s+/);
            return parts.length > 1 ? `${parts[0].trim()}: ${parts[1].trim()}` : parts[0].trim();
          }).filter(Boolean).join(", ");
          return `${indent}const { ${cleaned} } = require("${src}");`;
        }
      );

      // import * as foo from './foo'
      line = line.replace(
        /^(\s*)import\s+\*\s+as\s+([\w$]+)\s+from\s+['"]([^'"]+)['"]\s*;?\s*$/,
        '$1const $2 = require("$3");'
      );

      // import './foo' (副作用)
      line = line.replace(
        /^(\s*)import\s+['"]([^'"]+)['"]\s*;?\s*$/,
        '$1require("$2");'
      );

      // --- Export 转换 ---

      // export default function name(...)
      const defFuncMatch = line.match(
        /^(\s*)export\s+default\s+function\s+([\w$]+)/
      );
      if (defFuncMatch) {
        line = line.replace("export default ", "");
        exportedNames.push({ name: defFuncMatch[2], isDefault: true });
        result.push(line);
        continue;
      }

      // export default class name
      const defClassMatch = line.match(
        /^(\s*)export\s+default\s+class\s+([\w$]+)/
      );
      if (defClassMatch) {
        line = line.replace("export default ", "");
        exportedNames.push({ name: defClassMatch[2], isDefault: true });
        result.push(line);
        continue;
      }

      // export default <expression>
      const defExprMatch = line.match(
        /^(\s*)export\s+default\s+(.+)/
      );
      if (defExprMatch) {
        line = `${defExprMatch[1]}module.exports.default = ${defExprMatch[2]}`;
        result.push(line);
        continue;
      }

      // export const/let/var/function/class name
      const namedExportMatch = line.match(
        /^(\s*)export\s+(const|let|var|function|class)\s+([\w$]+)/
      );
      if (namedExportMatch) {
        line = line.replace(/^(\s*)export\s+/, "$1");
        exportedNames.push({ name: namedExportMatch[3], isDefault: false });
        result.push(line);
        continue;
      }

      // export { a, b, c }
      const namedListMatch = line.match(/^(\s*)export\s+\{([^}]+)\}\s*;?\s*$/);
      if (namedListMatch) {
        const exports = namedListMatch[2].split(",").map(n => {
          const parts = n.trim().split(/\s+as\s+/);
          const local = parts[0].trim();
          const exported = parts.length > 1 ? parts[1].trim() : local;
          return `module.exports.${exported} = ${local};`;
        });
        result.push(exports.join("\n"));
        continue;
      }

      result.push(line);
    }

    // 在末尾追加 module.exports 赋值
    const exportAppend = exportedNames
      .map(({ name, isDefault }) =>
        isDefault
          ? `module.exports.default = ${name};`
          : `module.exports.${name} = ${name};`
      )
      .join("\n");

    if (exportAppend) {
      result.push(exportAppend);
    }

    return result.join("\n");
  }

  /**
   * 去除注释 (用于依赖提取，不用于代码输出)
   */
  _stripComments(code) {
    // 去除单行注释
    let result = code.replace(/\/\/.*$/gm, "");
    // 去除多行注释
    result = result.replace(/\/\*[\s\S]*?\*\//g, "");
    return result;
  }
}

module.exports = Parser;
