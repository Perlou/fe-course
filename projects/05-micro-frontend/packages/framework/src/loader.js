/**
 * HTML 入口加载器
 *
 * 核心原理:
 *   1. fetch 子应用 HTML 入口
 *   2. 解析出 <script> / <link>/<style> / 模板内容
 *   3. 在沙箱中执行 JS，获取生命周期导出
 *   4. 管理加载缓存
 *
 * 对标: qiankun HTML Entry
 */

class AppLoader {
  constructor() {
    this.cache = new Map();   // 缓存已解析的应用资源
  }

  /**
   * 加载子应用入口
   * @param {string} entry - HTML 入口 URL
   * @param {string} name - 应用名
   * @returns {Object} { template, scripts, styles, lifecycle }
   */
  async load(entry, name) {
    // 命中缓存
    if (this.cache.has(name)) {
      console.log(`[Loader] ${name} — 命中缓存`);
      return this.cache.get(name);
    }

    console.log(`[Loader] ${name} — 加载 ${entry}`);

    // 1. 获取 HTML
    const html = await this._fetch(entry);

    // 2. 解析 HTML
    const parsed = this._parseHTML(html, entry);

    // 3. 加载外部脚本内容
    const scriptContents = await this._loadScripts(parsed.scripts, entry);

    const result = {
      template: parsed.template,
      styles: parsed.styles,
      scriptContents,
      entry,
    };

    // 缓存
    this.cache.set(name, result);
    return result;
  }

  /**
   * Fetch HTML 入口
   */
  async _fetch(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`加载失败: ${url} (${response.status})`);
    }
    return response.text();
  }

  /**
   * 解析 HTML
   * 提取 <script>, <style>/<link>, 以及剩余的模板内容
   */
  _parseHTML(html, baseUrl) {
    const scripts = [];
    const styles = [];

    // 提取 <script> 标签
    const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
    let match;

    while ((match = scriptRegex.exec(html)) !== null) {
      const attrs = match[1];
      const content = match[2].trim();

      // 检查 src 属性
      const srcMatch = attrs.match(/src=["']([^"']+)["']/);
      if (srcMatch) {
        scripts.push({ type: 'external', src: this._resolveUrl(srcMatch[1], baseUrl) });
      } else if (content) {
        scripts.push({ type: 'inline', content });
      }
    }

    // 提取 <style> 标签
    const styleRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
    while ((match = styleRegex.exec(html)) !== null) {
      styles.push({ type: 'inline', content: match[1].trim() });
    }

    // 提取 <link rel="stylesheet"> 标签
    const linkRegex = /<link\b([^>]*)\/?\s*>/gi;
    while ((match = linkRegex.exec(html)) !== null) {
      const attrs = match[1];
      if (attrs.includes('stylesheet')) {
        const hrefMatch = attrs.match(/href=["']([^"']+)["']/);
        if (hrefMatch) {
          styles.push({ type: 'external', href: this._resolveUrl(hrefMatch[1], baseUrl) });
        }
      }
    }

    // 清理后的模板 (移除 script/style 标签)
    let template = html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<link\b[^>]*stylesheet[^>]*\/?>/gi, '')
      .trim();

    // 提取 <body> 内容 (如果有的话)
    const bodyMatch = template.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch) {
      template = bodyMatch[1].trim();
    }

    return { scripts, styles, template };
  }

  /**
   * 加载外部脚本内容
   */
  async _loadScripts(scripts, baseUrl) {
    const contents = [];

    for (const script of scripts) {
      if (script.type === 'inline') {
        contents.push(script.content);
      } else if (script.type === 'external') {
        try {
          const code = await this._fetch(script.src);
          contents.push(code);
        } catch (err) {
          console.warn(`[Loader] 脚本加载失败: ${script.src}`, err.message);
        }
      }
    }

    return contents;
  }

  /**
   * URL 解析 (处理相对路径)
   */
  _resolveUrl(url, base) {
    // 已经是绝对路径
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
      return url;
    }

    // 相对路径 → 基于 base URL 解析
    try {
      return new URL(url, base).href;
    } catch {
      // 降级: 简单拼接
      const basePath = base.substring(0, base.lastIndexOf('/') + 1);
      return basePath + url;
    }
  }

  /**
   * 在容器中执行子应用脚本，提取生命周期
   */
  execScripts(scriptContents, sandbox) {
    let lifecycle = null;

    for (const code of scriptContents) {
      // 包装成模块，捕获导出
      const wrappedCode = `
        (function(window, self, globalThis) {
          ${code}
          ;
          if (typeof bootstrap === 'function' || typeof mount === 'function' || typeof unmount === 'function') {
            window.__MICRO_APP_LIFECYCLE__ = {
              bootstrap: typeof bootstrap === 'function' ? bootstrap : undefined,
              mount: typeof mount === 'function' ? mount : undefined,
              unmount: typeof unmount === 'function' ? unmount : undefined
            };
          }
        })(window, window, window);
      `;

      try {
        if (sandbox) {
          sandbox.exec(wrappedCode);
          const exported = sandbox.getVariable('__MICRO_APP_LIFECYCLE__');
          if (exported) lifecycle = exported;
        } else {
          // 无沙箱直接执行
          const fn = new Function(wrappedCode);
          fn();
        }
      } catch (err) {
        console.error('[Loader] 脚本执行错误:', err.message);
      }
    }

    return lifecycle;
  }

  /**
   * 清除缓存
   */
  clearCache(name) {
    if (name) {
      this.cache.delete(name);
    } else {
      this.cache.clear();
    }
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AppLoader };
}
