/**
 * JSON Loader
 *
 * 将 JSON 文件转换为 JS 模块
 */

function jsonLoader(source) {
  // 验证 JSON 合法性
  try {
    JSON.parse(source);
  } catch (e) {
    throw new Error(`[json-loader] JSON 解析失败: ${e.message}`);
  }

  return `module.exports = ${source.trim()};`;
}

module.exports = jsonLoader;
