/**
 * 生命周期管理
 *
 * 状态机:
 *   NOT_LOADED → LOADING → LOADED → BOOTSTRAPPING → BOOTSTRAPPED
 *                                                      ↓
 *                                              MOUNTING → MOUNTED
 *                                                          ↓
 *                                              UNMOUNTING → UNMOUNTED
 *                                                            ↓
 *                                              (再次) MOUNTING → MOUNTED
 *
 * 对标: single-spa 生命周期模型
 */

// 应用状态枚举
const AppStatus = {
  NOT_LOADED:     'NOT_LOADED',
  LOADING:        'LOADING',
  LOADED:         'LOADED',
  BOOTSTRAPPING:  'BOOTSTRAPPING',
  BOOTSTRAPPED:   'BOOTSTRAPPED',
  MOUNTING:       'MOUNTING',
  MOUNTED:        'MOUNTED',
  UNMOUNTING:     'UNMOUNTING',
  UNMOUNTED:      'UNMOUNTED',
  LOAD_ERROR:     'LOAD_ERROR',
};

// 合法的状态转换
const validTransitions = {
  [AppStatus.NOT_LOADED]:    [AppStatus.LOADING, AppStatus.LOAD_ERROR],
  [AppStatus.LOADING]:       [AppStatus.LOADED, AppStatus.LOAD_ERROR],
  [AppStatus.LOADED]:        [AppStatus.BOOTSTRAPPING],
  [AppStatus.BOOTSTRAPPING]: [AppStatus.BOOTSTRAPPED, AppStatus.LOAD_ERROR],
  [AppStatus.BOOTSTRAPPED]:  [AppStatus.MOUNTING],
  [AppStatus.MOUNTING]:      [AppStatus.MOUNTED, AppStatus.LOAD_ERROR],
  [AppStatus.MOUNTED]:       [AppStatus.UNMOUNTING],
  [AppStatus.UNMOUNTING]:    [AppStatus.UNMOUNTED, AppStatus.LOAD_ERROR],
  [AppStatus.UNMOUNTED]:     [AppStatus.MOUNTING],
  [AppStatus.LOAD_ERROR]:    [AppStatus.NOT_LOADED],
};

class LifecycleManager {
  constructor() {
    this.apps = new Map();
    this.hooks = {
      beforeLoad: [],
      afterLoad: [],
      beforeMount: [],
      afterMount: [],
      beforeUnmount: [],
      afterUnmount: [],
    };
  }

  /**
   * 注册应用
   */
  register(appConfig) {
    const app = {
      name: appConfig.name,
      status: AppStatus.NOT_LOADED,
      config: appConfig,
      lifecycle: null,        // bootstrap/mount/unmount 函数
      bootstrapped: false,
    };
    this.apps.set(appConfig.name, app);
    return app;
  }

  /**
   * 注册全局钩子
   */
  addHook(hookName, fn) {
    if (this.hooks[hookName]) {
      this.hooks[hookName].push(fn);
    }
  }

  /**
   * 状态转换 (带校验)
   */
  _transition(app, newStatus) {
    const allowed = validTransitions[app.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(
        `[Lifecycle] 非法状态转换: ${app.name} ${app.status} → ${newStatus}`
      );
    }
    const oldStatus = app.status;
    app.status = newStatus;
    console.log(`[Lifecycle] ${app.name}: ${oldStatus} → ${newStatus}`);
  }

  /**
   * 触发钩子
   */
  async _runHooks(hookName, app) {
    for (const fn of this.hooks[hookName]) {
      await fn(app);
    }
  }

  /**
   * 加载应用
   */
  async load(appName, loadFn) {
    const app = this.apps.get(appName);
    if (!app) throw new Error(`应用 ${appName} 未注册`);

    if (app.status !== AppStatus.NOT_LOADED) return app;

    try {
      this._transition(app, AppStatus.LOADING);
      await this._runHooks('beforeLoad', app);

      // 执行加载 (获取生命周期函数)
      app.lifecycle = await loadFn(app.config);

      this._transition(app, AppStatus.LOADED);
      await this._runHooks('afterLoad', app);
    } catch (err) {
      app.status = AppStatus.LOAD_ERROR;
      console.error(`[Lifecycle] ${appName} 加载失败:`, err.message);
      throw err;
    }

    return app;
  }

  /**
   * 初始化 (仅一次)
   */
  async bootstrap(appName) {
    const app = this.apps.get(appName);
    if (!app) throw new Error(`应用 ${appName} 未注册`);

    if (app.bootstrapped) {
      // 已初始化过，直接跳到 BOOTSTRAPPED
      if (app.status === AppStatus.UNMOUNTED) {
        // 从 UNMOUNTED 直接到 MOUNTING（跳过 bootstrap）
        return app;
      }
      return app;
    }

    this._transition(app, AppStatus.BOOTSTRAPPING);

    if (app.lifecycle && app.lifecycle.bootstrap) {
      await app.lifecycle.bootstrap();
    }

    app.bootstrapped = true;
    this._transition(app, AppStatus.BOOTSTRAPPED);
    return app;
  }

  /**
   * 挂载
   */
  async mount(appName, props = {}) {
    const app = this.apps.get(appName);
    if (!app) throw new Error(`应用 ${appName} 未注册`);

    // 从 BOOTSTRAPPED 或 UNMOUNTED 进入 MOUNTING
    this._transition(app, AppStatus.MOUNTING);
    await this._runHooks('beforeMount', app);

    if (app.lifecycle && app.lifecycle.mount) {
      await app.lifecycle.mount({
        container: app.config.container,
        props: { ...app.config.props, ...props },
      });
    }

    this._transition(app, AppStatus.MOUNTED);
    await this._runHooks('afterMount', app);
    return app;
  }

  /**
   * 卸载
   */
  async unmount(appName) {
    const app = this.apps.get(appName);
    if (!app) throw new Error(`应用 ${appName} 未注册`);

    if (app.status !== AppStatus.MOUNTED) return app;

    this._transition(app, AppStatus.UNMOUNTING);
    await this._runHooks('beforeUnmount', app);

    if (app.lifecycle && app.lifecycle.unmount) {
      await app.lifecycle.unmount();
    }

    this._transition(app, AppStatus.UNMOUNTED);
    await this._runHooks('afterUnmount', app);
    return app;
  }

  /**
   * 获取应用状态
   */
  getStatus(appName) {
    const app = this.apps.get(appName);
    return app ? app.status : null;
  }

  /**
   * 获取所有应用信息
   */
  getApps() {
    const result = [];
    for (const [, app] of this.apps) {
      result.push({
        name: app.name,
        status: app.status,
        bootstrapped: app.bootstrapped,
      });
    }
    return result;
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LifecycleManager, AppStatus };
}
