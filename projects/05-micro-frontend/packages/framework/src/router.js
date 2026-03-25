/**
 * 路由劫持
 *
 * 核心原理:
 *   1. 劫持 history.pushState / replaceState
 *   2. 监听 popstate 事件
 *   3. 路由变化 → 匹配子应用 → 触发加载/切换
 *
 * 对标: single-spa 路由系统
 */

class MicroRouter {
  constructor() {
    this.apps = [];
    this.currentApp = null;
    this.listeners = [];
    this._hijacked = false;

    // 保存原始方法
    this._rawPushState = null;
    this._rawReplaceState = null;
    this._popstateHandler = null;
  }

  /**
   * 注册子应用路由规则
   */
  register(app) {
    this.apps.push({
      name: app.name,
      activeRule: app.activeRule,
      onEnter: app.onEnter,     // 进入时回调
      onLeave: app.onLeave,     // 离开时回调
    });
    console.log(`[Router] 注册路由: ${app.name} → ${app.activeRule}`);
  }

  /**
   * 劫持 History API
   */
  hijack() {
    if (this._hijacked) return;
    this._hijacked = true;

    const self = this;

    // 劫持 pushState
    this._rawPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      self._rawPushState.apply(window.history, args);
      self._handleRouteChange('pushState');
    };

    // 劫持 replaceState
    this._rawReplaceState = window.history.replaceState;
    window.history.replaceState = function (...args) {
      self._rawReplaceState.apply(window.history, args);
      self._handleRouteChange('replaceState');
    };

    // 监听前进/后退
    this._popstateHandler = () => this._handleRouteChange('popstate');
    window.addEventListener('popstate', this._popstateHandler);

    console.log('[Router] ✅ 路由劫持已启动');

    // 处理当前路由
    this._handleRouteChange('init');
  }

  /**
   * 恢复原始 History API
   */
  unhijack() {
    if (!this._hijacked) return;

    if (this._rawPushState) {
      window.history.pushState = this._rawPushState;
    }
    if (this._rawReplaceState) {
      window.history.replaceState = this._rawReplaceState;
    }
    if (this._popstateHandler) {
      window.removeEventListener('popstate', this._popstateHandler);
    }

    this._hijacked = false;
    console.log('[Router] 路由劫持已恢复');
  }

  /**
   * 路由变化处理
   */
  async _handleRouteChange(trigger) {
    const path = window.location.pathname;
    const matchedApp = this._matchApp(path);

    console.log(`[Router] 路由变化 (${trigger}): ${path} → ${matchedApp ? matchedApp.name : '无匹配'}`);

    // 相同应用不做处理
    if (matchedApp && this.currentApp && matchedApp.name === this.currentApp.name) {
      return;
    }

    // 卸载旧应用
    if (this.currentApp) {
      try {
        await this.currentApp.onLeave();
      } catch (err) {
        console.error(`[Router] 卸载 ${this.currentApp.name} 失败:`, err);
      }
    }

    // 加载新应用
    if (matchedApp) {
      try {
        await matchedApp.onEnter();
      } catch (err) {
        console.error(`[Router] 加载 ${matchedApp.name} 失败:`, err);
      }
    }

    this.currentApp = matchedApp;

    // 通知监听者
    this.listeners.forEach(fn => fn({
      path,
      app: matchedApp ? matchedApp.name : null,
      trigger,
    }));
  }

  /**
   * 路由匹配 (前缀匹配)
   */
  _matchApp(path) {
    // 按规则长度倒序，优先匹配更精确的路由
    const sorted = [...this.apps].sort(
      (a, b) => b.activeRule.length - a.activeRule.length
    );
    return sorted.find(app => path.startsWith(app.activeRule)) || null;
  }

  /**
   * 编程式导航
   */
  push(path) {
    window.history.pushState(null, '', path);
  }

  /**
   * 替换当前路由
   */
  replace(path) {
    window.history.replaceState(null, '', path);
  }

  /**
   * 监听路由变化
   */
  onChange(callback) {
    this.listeners.push(callback);
    return () => {
      const idx = this.listeners.indexOf(callback);
      if (idx > -1) this.listeners.splice(idx, 1);
    };
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MicroRouter };
}
