/**
 * Mini Webpack - Source Map 生成器
 *
 * 原理:
 *   Source Map 建立「打包后代码」→「原始源码」的映射关系
 *   标准格式参考: https://tc39.es/source-map-spec/
 *
 *   核心字段:
 *   - version: 固定为 3
 *   - sources: 原始文件路径数组
 *   - sourcesContent: 原始文件内容数组
 *   - names: 标识符名称数组
 *   - mappings: VLQ 编码的位置映射
 *
 * Base64 VLQ (Variable-Length Quantity):
 *   将行列位置编码为紧凑的字符串
 *   每个 segment 包含: [生成列, 源文件索引, 源行, 源列]
 *
 * Webpack 真实实现使用 `source-map` npm 包,
 * 这里从零实现 VLQ 编码，理解底层原理
 */

const path = require('path');

class SourceMapGenerator {
  /**
   * 生成 Source Map 对象
   *
   * @param {Object[]} modules - 模块数组 (来自 ModuleGraph)
   * @param {string} bundleCode - 打包后的代码
   * @param {string} outputFilename - 输出文件名
   * @returns {{ sourceMap: Object, bundleWithComment: string }}
   */
  generate(modules, bundleCode, outputFilename) {
    const sources = [];
    const sourcesContent = [];
    const mappings = [];

    // 收集所有原始源文件
    modules.forEach((mod) => {
      const relativePath = path.relative(process.cwd(), mod.filePath);
      sources.push(relativePath);
      // originalSource 由 module-graph 注入
      sourcesContent.push(mod.originalSource || mod.code);
    });

    // 为每个模块生成 mapping
    // 简化版: 只映射每个模块的起始位置
    const bundleLines = bundleCode.split('\n');
    const lineSegments = new Array(bundleLines.length).fill(null).map(() => []);

    let prevSourceIdx = 0;
    let prevSourceLine = 0;
    let prevSourceCol = 0;
    let prevGenCol = 0;

    // 找到每个模块在 bundle 中的位置
    modules.forEach((mod, sourceIdx) => {
      const marker = `// ${path.basename(mod.filePath)} (模块 ${mod.id})`;
      for (let lineIdx = 0; lineIdx < bundleLines.length; lineIdx++) {
        if (bundleLines[lineIdx].includes(marker)) {
          // 模块代码从标记行的下两行开始 (跳过 function 包裹行)
          const codeStartLine = lineIdx + 2;
          const modLines = mod.code.split('\n');

          for (let srcLine = 0; srcLine < modLines.length; srcLine++) {
            const genLine = codeStartLine + srcLine;
            if (genLine >= bundleLines.length) break;

            // segment: [genCol, sourceIdx, srcLine, srcCol]
            // VLQ 使用相对偏移
            const genCol = 0;
            const segment = [
              genCol - prevGenCol,        // 生成列 delta
              sourceIdx - prevSourceIdx,  // 源文件索引 delta
              srcLine - prevSourceLine,   // 源行 delta
              0 - prevSourceCol,          // 源列 delta
            ];

            lineSegments[genLine].push(segment);
            prevGenCol = genCol;
            prevSourceIdx = sourceIdx;
            prevSourceLine = srcLine;
            prevSourceCol = 0;
          }
          break;
        }
      }
    });

    // 编码 mappings
    const encodedMappings = lineSegments.map((segments) => {
      if (segments.length === 0) return '';
      return segments.map((seg) =>
        seg.map((val) => this._encodeVLQ(val)).join('')
      ).join(',');
    }).join(';');

    const sourceMap = {
      version: 3,
      file: outputFilename,
      sources,
      sourcesContent,
      names: [],
      mappings: encodedMappings,
    };

    // 添加 sourceMappingURL 注释
    const mapFilename = outputFilename + '.map';
    const bundleWithComment = bundleCode +
      `\n//# sourceMappingURL=${mapFilename}\n`;

    return { sourceMap, bundleWithComment };
  }

  /**
   * Base64 VLQ 编码
   *
   * 算法:
   *   1. 将数值转为有符号表示 (最低位为符号位)
   *   2. 每 5 bit 一组编码
   *   3. 如果还有后续组，设置续位 (第 6 bit)
   *   4. 每组映射为 Base64 字符
   */
  _encodeVLQ(value) {
    const VLQ_BASE = 32;      // 2^5, 每组 5 bit
    const VLQ_CONTINUATION = VLQ_BASE; // 第 6 bit 表示"还有后续"
    const BASE64_CHARS =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    let encoded = '';

    // 转为 VLQ 有符号表示: 最低位是符号位
    let vlq = value < 0 ? ((-value) << 1) + 1 : value << 1;

    do {
      let digit = vlq & 0x1f;   // 取低 5 bit
      vlq >>>= 5;               // 右移 5 位

      if (vlq > 0) {
        digit |= VLQ_CONTINUATION; // 设置"还有后续"续位
      }

      encoded += BASE64_CHARS[digit];
    } while (vlq > 0);

    return encoded;
  }
}

module.exports = SourceMapGenerator;
