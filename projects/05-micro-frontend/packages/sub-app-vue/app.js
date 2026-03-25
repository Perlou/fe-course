/**
 * 子应用 B: Vue 风格设置中心
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
let _cleanups = [];

/**
 * 初始化 (仅执行一次)
 */
function bootstrap() {
  console.log('[Vue-Settings] 🔧 bootstrap — 初始化');
  return Promise.resolve();
}

/**
 * 挂载
 */
function mount(params) {
  const { container, props } = params || {};
  _container = container;
  _props = props || {};

  console.log('[Vue-Settings] 🎯 mount — 挂载到容器');

  // 初始化侧边栏导航切换
  _initSidebarNav();

  // 初始化交互控件
  _initControls();

  // 订阅全局状态
  if (_props.globalState) {
    _unsubscribeState = _props.globalState.onStateChange(
      'vue-settings',
      (state, prev) => {
        // 更新主题按钮状态
        if (state.theme !== prev.theme) {
          _updateThemeButtons(state.theme);
        }
        // 更新用户信息
        if (state.user && state.user !== prev.user) {
          const aboutUser = document.getElementById('about-user');
          if (aboutUser) aboutUser.textContent = `${state.user.name} (${state.user.role})`;
        }
      }
    );
  }

  // 通过 EventBus 发送消息
  if (_props.eventBus) {
    _props.eventBus.emit('app:mounted', {
      name: 'vue-settings',
      timestamp: Date.now(),
    });
  }

  return Promise.resolve();
}

/**
 * 卸载
 */
function unmount() {
  console.log('[Vue-Settings] 🗑️  unmount — 清理');

  // 执行所有清理函数
  _cleanups.forEach(fn => fn());
  _cleanups = [];

  // 取消全局状态订阅
  if (_unsubscribeState) {
    _unsubscribeState();
    _unsubscribeState = null;
  }

  _container = null;
  _props = {};

  return Promise.resolve();
}

// ========== 内部方法 ==========

function _initSidebarNav() {
  const sidebar = document.querySelector('.sidebar-nav');
  if (!sidebar) return;

  const handler = (e) => {
    const item = e.target.closest('.sidebar-item');
    if (!item) return;

    const section = item.getAttribute('data-section');

    // 更新侧边栏高亮
    sidebar.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    // 切换内容区
    document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`section-${section}`);
    if (target) target.classList.add('active');
  };

  sidebar.addEventListener('click', handler);
  _cleanups.push(() => sidebar.removeEventListener('click', handler));
}

function _initControls() {
  // 主题切换
  const themeBtns = document.querySelectorAll('.toggle-btn[data-theme]');
  themeBtns.forEach(btn => {
    const handler = () => {
      const theme = btn.getAttribute('data-theme');
      if (_props.globalState) {
        _props.globalState.setState({ theme });
      }
      themeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    };
    btn.addEventListener('click', handler);
    _cleanups.push(() => btn.removeEventListener('click', handler));
  });

  // 字体大小滑块
  const slider = document.getElementById('font-size-slider');
  const sliderValue = document.getElementById('font-size-value');
  if (slider && sliderValue) {
    const handler = () => {
      sliderValue.textContent = `${slider.value}px`;
    };
    slider.addEventListener('input', handler);
    _cleanups.push(() => slider.removeEventListener('input', handler));
  }

  // 颜色选择
  const swatches = document.querySelectorAll('.color-swatch');
  swatches.forEach(swatch => {
    const handler = () => {
      swatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
    };
    swatch.addEventListener('click', handler);
    _cleanups.push(() => swatch.removeEventListener('click', handler));
  });

  // 保存按钮
  const saveBtn = document.getElementById('save-profile');
  if (saveBtn) {
    const handler = () => {
      const username = document.getElementById('input-username');
      if (username && _props.globalState) {
        _props.globalState.setState({
          user: { name: username.value, role: 'admin' },
        });
      }
      saveBtn.textContent = '✅ 已保存';
      setTimeout(() => { saveBtn.textContent = '保存修改'; }, 2000);
    };
    saveBtn.addEventListener('click', handler);
    _cleanups.push(() => saveBtn.removeEventListener('click', handler));
  }
}

function _updateThemeButtons(theme) {
  document.querySelectorAll('.toggle-btn[data-theme]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
  });
}
