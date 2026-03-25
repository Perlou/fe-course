/**
 * Mini Micro-Frontend Framework — 统一入口
 *
 * 零外部依赖微前端框架
 * 核心功能:
 *   - registerMicroApps()  注册子应用
 *   - start()             启动框架
 *   - initGlobalState()   全局状态
 *
 * 对标: qiankun API
 */

// ========== 模块引用 (浏览器环境通过 <script> 标签加载) ==========
// 在浏览器中，各模块通过 <script> 标签加载后挂载到 window 上
// 在 Node.js 中，通过 require 引入

let ProxySandbox, AppLoader, MicroRouter, StyleManager;
let LifecycleManager, AppStatus, EventBus, GlobalState;
let Prefetch, Monitor;

if (typeof require !== 'undefined') {
  ({ ProxySandbox } = require('./sandbox'));
  ({ AppLoader } = require('./loader'));
  ({ MicroRouter } = require('./router'));
  ({ StyleManager } = require('./style'));
  ({ LifecycleManager, AppStatus } = require('./lifecycle'));
  ({ EventBus, GlobalState } = require('./communication'));
  ({ Prefetch } = require('./prefetch'));
  ({ Monitor } = require('./monitor'));
}

// ========== MicroApp 框架主类 ==========

class MicroApp {
  constructor() {
    this.started = false;
    this.apps = new Map();      // 注册的应用配置

    // 核心模块
    this.loader = new AppLoader();
    this.router = new MicroRouter();
    this.lifecycle = new LifecycleManager();
    this.styleManager = new StyleManager();
    this.monitor = new Monitor();
    this.eventBus = new EventBus();
    this.globalState = null;
    this.prefetch = new Prefetch(this.loader);

    // 沙箱实例
    this.sandboxes = new Map();
  }

  /**
   * 注册子应用
   *
   * @param {Array} apps - 子应用配置列表
   *   {
   *     name: string,         应用名
   *     entry: string,        HTML 入口 URL
   *     container: string,    挂载容器选择器
   *     activeRule: string,   路由匹配规则
   *     props?: object,       传递给子应用的 props
   *     sandbox?: boolean,    是否开启沙箱 (默认 true)
   *   }
   */
  registerMicroApps(apps) {
    apps.forEach(appConfig => {
      const config = {
        sandbox: true,
        props: {},
        ...appConfig,
      };

      this.apps.set(config.name, config);

      // 注册生命周期
      this.lifecycle.register(config);

      // 注册路由
      this.router.register({
        name: config.name,
        activeRule: config.activeRule,
        onEnter: () => this._mountApp(config.name),
        onLeave: () => this._unmountApp(config.name),
      });

      console.log(`[MicroApp] 注册: ${config.name} (${config.activeRule} → ${config.entry})`);
    });
  }

  /**
   * 启动框架
   * @param {Object} options
   *   prefetch: boolean | string[]  预加载配置
   */
  start(options = {}) {
    if (this.started) {
      console.warn('[MicroApp] 框架已启动');
      return;
    }

    this.started = true;
    console.log('[MicroApp] 🚀 微前端框架启动');

    // 注册生命周期钩子 → 性能监控
    this.lifecycle.addHook('beforeLoad', (app) => {
      this.monitor.startTimer(`load:${app.name}`);
    });
    this.lifecycle.addHook('afterLoad', (app) => {
      this.monitor.endTimer(`load:${app.name}`);
    });
    this.lifecycle.addHook('beforeMount', (app) => {
      this.monitor.startTimer(`mount:${app.name}`);
    });
    this.lifecycle.addHook('afterMount', (app) => {
      this.monitor.endTimer(`mount:${app.name}`);
    });

    // 预加载
    if (options.prefetch) {
      const appsToPreload = options.prefetch === true
        ? [...this.apps.values()]
        : [...this.apps.values()].filter(a => options.prefetch.includes(a.name));

      this.prefetch.add(appsToPreload.map(a => ({
        name: a.name,
        entry: a.entry,
      })));
      this.prefetch.start();
    }

    // 启动路由劫持
    this.router.hijack();
  }

  /**
   * 初始化全局状态
   */
  initGlobalState(initialState = {}) {
    this.globalState = new GlobalState(initialState);

    return {
      onGlobalStateChange: (appName, callback) => {
        return this.globalState.onStateChange(appName, callback);
      },
      setGlobalState: (partial) => {
        this.globalState.setState(partial);
      },
      getGlobalState: () => {
        return this.globalState.getState();
      },
    };
  }

  /**
   * 内部: 挂载子应用
   */
  async _mountApp(appName) {
    const config = this.apps.get(appName);
    if (!config) return;

    try {
      // 1. 加载
      const app = await this.lifecycle.load(appName, async (appConfig) => {
        // fetch HTML 入口
        const resources = await this.loader.load(appConfig.entry, appConfig.name);

        // 创建沙箱
        let sandbox = null;
        if (appConfig.sandbox) {
          sandbox = new ProxySandbox(appConfig.name);
          this.sandboxes.set(appConfig.name, sandbox);
        }

        // 执行脚本，提取生命周期
        const lifecycle = this.loader.execScripts(resources.scriptContents, sandbox);

        // 返回包含样式信息的生命周期
        return {
          ...lifecycle,
          _resources: resources,
          _sandbox: sandbox,
        };
      });

      // 2. Bootstrap (仅首次)
      await this.lifecycle.bootstrap(appName);

      // 3. Mount
      const container = document.querySelector(config.container);
      if (!container) {
        throw new Error(`容器 ${config.container} 不存在`);
      }

      // 设置容器标记 (用于 CSS 隔离)
      container.setAttribute('data-micro-app', appName);

      // 注入模板 HTML
      const resources = app.lifecycle._resources;
      if (resources && resources.template) {
        container.innerHTML = resources.template;
      }

      // 加载样式
      if (resources && resources.styles) {
        await this.styleManager.mount(appName, resources.styles);
      }

      // 激活沙箱
      const sandbox = this.sandboxes.get(appName);
      if (sandbox) sandbox.active();

      // 挂载应用
      const mountProps = {
        ...config.props,
        container,
        globalState: this.globalState,
        eventBus: this.eventBus,
      };

      await this.lifecycle.mount(appName, mountProps);

    } catch (err) {
      this.monitor.logError(appName, 'mount', err);
      console.error(`[MicroApp] ${appName} 挂载失败:`, err);
    }
  }

  /**
   * 内部: 卸载子应用
   */
  async _unmountApp(appName) {
    try {
      await this.lifecycle.unmount(appName);

      // 卸载样式
      this.styleManager.unmount(appName);

      // 关闭沙箱
      const sandbox = this.sandboxes.get(appName);
      if (sandbox) sandbox.inactive();

      // 清空容器
      const config = this.apps.get(appName);
      if (config) {
        const container = document.querySelector(config.container);
        if (container) {
          container.innerHTML = '';
          container.removeAttribute('data-micro-app');
        }
      }

    } catch (err) {
      this.monitor.logError(appName, 'unmount', err);
      console.error(`[MicroApp] ${appName} 卸载失败:`, err);
    }
  }

  /**
   * 获取性能报告
   */
  getReport() {
    return this.monitor.getReport();
  }

  /**
   * 打印性能报告
   */
  printReport() {
    this.monitor.printReport();
  }
}

// ========== 创建全局单例 ==========
const microApp = new MicroApp();

// ========== 导出 API ==========

/**
 * 注册子应用
 */
function registerMicroApps(apps) {
  microApp.registerMicroApps(apps);
}

/**
 * 启动框架
 */
function start(options) {
  microApp.start(options);
}

/**
 * 初始化全局状态
 */
function initGlobalState(state) {
  return microApp.initGlobalState(state);
}

/**
 * 获取 EventBus 实例
 */
function getEventBus() {
  return microApp.eventBus;
}

/**
 * 获取性能报告
 */
function getReport() {
  return microApp.getReport();
}

// 挂载到全局 (浏览器环境)
if (typeof window !== 'undefined') {
  window.MicroApp = {
    registerMicroApps,
    start,
    initGlobalState,
    getEventBus,
    getReport,
    _instance: microApp,
  };
}

// Node.js 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MicroApp,
    registerMicroApps,
    start,
    initGlobalState,
    getEventBus,
    getReport,
  };
}
