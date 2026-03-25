/**
 * CSS Loader
 *
 * 将 CSS 文件转换为 JS 模块
 * 在浏览器环境中会将 CSS 注入到 <style> 标签
 * 在 Node.js 环境中导出 CSS 字符串
 */

function cssLoader(source, filePath) {
  // 转义引号和换行
  const escaped = source
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$");

  return `
// CSS Module: ${require("path").basename(filePath)}
const css = \`${escaped}\`;

// 浏览器环境: 注入 <style> 标签
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

module.exports = css;
module.exports.default = css;
`;
}

module.exports = cssLoader;
