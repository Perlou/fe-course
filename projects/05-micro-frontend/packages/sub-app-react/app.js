/**
 * 子应用 A: React 风格仪表盘
 *
 * 导出标准微前端生命周期:
 *   - bootstrap()  初始化
 *   - mount(props)  挂载
 *   - unmount()     卸载
 */

// ========== 生命周期导出 ==========

let _container = null;
let _props = {};
let _unsubscribeState = null;
let _timer = null;

/**
 * 初始化 (仅执行一次)
 */
function bootstrap() {
  console.log('[React-Dashboard] 🔧 bootstrap — 初始化');
  return Promise.resolve();
}

/**
 * 挂载
 */
function mount(params) {
  const { container, props } = params || {};
  _container = container;
  _props = props || {};

  console.log('[React-Dashboard] 🎯 mount — 挂载到容器');
  console.log('[React-Dashboard] Props:', JSON.stringify(Object.keys(_props)));

  // 订阅全局状态
  if (_props.globalState) {
    _unsubscribeState = _props.globalState.onStateChange(
      'react-dashboard',
      (state, prev) => {
        // 更新用户显示
        if (state.user && state.user !== prev.user) {
          const userEl = document.getElementById('dashboard-user');
          if (userEl) userEl.textContent = `当前用户: ${state.user.name} (${state.user.role})`;
        }
      }
    );
  }

  // 模拟数据更新 (演示子应用活跃状态)
  _timer = setInterval(() => {
    const statUsers = document.getElementById('stat-users');
    if (statUsers) {
      const base = 1200;
      const random = Math.floor(Math.random() * 100);
      statUsers.textContent = (base + random).toLocaleString();
    }
  }, 3000);

  // 通过 EventBus 发送消息
  if (_props.eventBus) {
    _props.eventBus.emit('app:mounted', {
      name: 'react-dashboard',
      timestamp: Date.now(),
    });
  }

  return Promise.resolve();
}

/**
 * 卸载
 */
function unmount() {
  console.log('[React-Dashboard] 🗑️  unmount — 清理');

  // 清理定时器
  if (_timer) {
    clearInterval(_timer);
    _timer = null;
  }

  // 取消全局状态订阅
  if (_unsubscribeState) {
    _unsubscribeState();
    _unsubscribeState = null;
  }

  _container = null;
  _props = {};

  return Promise.resolve();
}
