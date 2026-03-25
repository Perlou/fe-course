/**
 * CSS 样式隔离
 *
 * 两种策略:
 *   1. 动态加载/卸载 — 切换子应用时管理样式
 *   2. 命名空间隔离 — 自动添加 [data-micro-app="xxx"] 前缀
 *
 * 对标: qiankun experimentalStyleIsolation
 */

class StyleManager {
  constructor() {
    this.appStyles = new Map();   // appName → { elements, active }
  }

  /**
   * 为子应用加载样式
   * @param {string} appName - 应用名
   * @param {Array} styles - [{ type: 'inline', content } | { type: 'external', href }]
   */
  async mount(appName, styles) {
    // 如果已经加载过且是隐藏状态，直接恢复
    const existing = this.appStyles.get(appName);
    if (existing && !existing.active) {
      existing.elements.forEach(el => {
        el.disabled = false;
      });
      existing.active = true;
      console.log(`[Style] ${appName} — 恢复样式`);
      return;
    }

    const elements = [];

    for (const style of styles) {
      let el;

      if (style.type === 'inline') {
        el = document.createElement('style');
        el.setAttribute('data-micro-app', appName);
        // 对 CSS 添加命名空间隔离
        el.textContent = this._scopeCSS(style.content, appName);
        document.head.appendChild(el);
        elements.push(el);
      } else if (style.type === 'external') {
        try {
          const response = await fetch(style.href);
          const cssText = await response.text();
          el = document.createElement('style');
          el.setAttribute('data-micro-app', appName);
          el.textContent = this._scopeCSS(cssText, appName);
          document.head.appendChild(el);
          elements.push(el);
        } catch (err) {
          console.warn(`[Style] 样式加载失败: ${style.href}`, err.message);
        }
      }
    }

    this.appStyles.set(appName, { elements, active: true });
    console.log(`[Style] ${appName} — 加载 ${elements.length} 个样式`);
  }

  /**
   * 卸载子应用样式 (隐藏而非删除，便于再次挂载)
   */
  unmount(appName) {
    const entry = this.appStyles.get(appName);
    if (!entry) return;

    entry.elements.forEach(el => {
      el.disabled = true;
    });
    entry.active = false;
    console.log(`[Style] ${appName} — 隐藏样式`);
  }

  /**
   * 彻底清除子应用样式
   */
  remove(appName) {
    const entry = this.appStyles.get(appName);
    if (!entry) return;

    entry.elements.forEach(el => {
      el.parentNode && el.parentNode.removeChild(el);
    });
    this.appStyles.delete(appName);
    console.log(`[Style] ${appName} — 删除样式`);
  }

  /**
   * CSS 命名空间隔离
   *
   * 原理: 给每条 CSS 规则添加 [data-micro-app="xxx"] 属性选择器
   *
   * 输入: .button { color: red; }
   * 输出: [data-micro-app="react-app"] .button { color: red; }
   *
   * 注意: 简化实现，仅处理常见选择器，生产环境需用 CSS Parser
   */
  _scopeCSS(css, appName) {
    const prefix = `[data-micro-app="${appName}"]`;

    return css.replace(
      // 匹配 CSS 规则: 选择器 { ... }
      /([^{}@/]+)\{/g,
      (match, selectors) => {
        // 跳过 @规则 (如 @media, @keyframes)
        if (selectors.trim().startsWith('@')) {
          return match;
        }

        // 处理多选择器 (逗号分隔)
        const scoped = selectors
          .split(',')
          .map(s => {
            s = s.trim();
            if (!s) return s;

            // 跳过已经有前缀的 / :root / body / html
            if (s.startsWith(prefix) ||
                s === 'body' || s === 'html' || s === ':root' ||
                s.startsWith('body ') || s.startsWith('html ')) {
              return s;
            }

            return `${prefix} ${s}`;
          })
          .join(', ');

        return scoped + ' {';
      }
    );
  }

  /**
   * 清除所有样式
   */
  clear() {
    for (const [appName] of this.appStyles) {
      this.remove(appName);
    }
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StyleManager };
}
