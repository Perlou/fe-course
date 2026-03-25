/**
 * 主应用逻辑
 *
 * 职责:
 *   1. 注册子应用
 *   2. 初始化全局状态
 *   3. 管理导航高亮
 *   4. 主题切换
 *   5. 性能报告展示
 */

(function () {
  'use strict';

  // ========== 1. 初始化全局状态 ==========
  const { onGlobalStateChange, setGlobalState, getGlobalState } =
    window.MicroApp.initGlobalState({
      user: { name: '访客', role: 'guest' },
      theme: 'dark',
      locale: 'zh-CN',
    });

  // ========== 2. 注册子应用 ==========
  window.MicroApp.registerMicroApps([
    {
      name: 'react-dashboard',
      entry: '/sub-apps/react/',                  // 子应用 HTML 入口
      container: '#sub-app-container',
      activeRule: '/dashboard',
      props: { title: '仪表盘' },
    },
    {
      name: 'vue-settings',
      entry: '/sub-apps/vue/',
      container: '#sub-app-container',
      activeRule: '/settings',
      props: { title: '设置中心' },
    },
  ]);

  // ========== 3. 启动框架 ==========
  window.MicroApp.start({
    prefetch: true,  // 空闲时预加载所有子应用
  });

  // ========== 4. 导航管理 ==========
  const nav = document.getElementById('main-nav');
  const homeContent = document.getElementById('home-content');

  // 拦截导航链接点击
  nav.addEventListener('click', (e) => {
    const link = e.target.closest('.nav-link');
    if (!link) return;

    e.preventDefault();
    const path = link.getAttribute('data-path');
    window.history.pushState(null, '', path);
  });

  // 更新导航高亮
  function updateNavActive() {
    const path = window.location.pathname;
    nav.querySelectorAll('.nav-link').forEach(link => {
      const linkPath = link.getAttribute('data-path');
      const isActive = linkPath === '/'
        ? path === '/'
        : path.startsWith(linkPath);
      link.classList.toggle('active', isActive);
    });

    // 首页内容显隐
    const isHome = path === '/';
    homeContent.style.display = isHome ? 'block' : 'none';
  }

  // 监听路由变化
  const originalPushState = history.pushState;
  // 这里不再劫持，而是监听框架的路由事件
  // 使用 MutationObserver 或定期检查
  let lastPath = location.pathname;
  setInterval(() => {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      updateNavActive();
    }
  }, 100);

  // 初始化
  updateNavActive();

  // ========== 5. 主题切换 ==========
  const themeToggle = document.getElementById('theme-toggle');
  const userBadge = document.getElementById('global-user');

  themeToggle.addEventListener('click', () => {
    const current = getGlobalState().theme;
    const next = current === 'dark' ? 'light' : 'dark';
    setGlobalState({ theme: next });
  });

  // 监听全局状态变化
  onGlobalStateChange('main-app', (state, prev) => {
    // 主题变化
    if (state.theme !== prev.theme) {
      document.documentElement.setAttribute('data-theme', state.theme);
      themeToggle.textContent = state.theme === 'dark' ? '🌙' : '☀️';
    }

    // 用户变化
    if (state.user !== prev.user) {
      userBadge.textContent = `👤 ${state.user.name}`;
    }
  });

  // ========== 6. 性能报告 ==========
  const reportBtn = document.getElementById('show-report');
  const reportPanel = document.getElementById('report-panel');
  const reportContent = document.getElementById('report-content');
  const closeReport = document.getElementById('close-report');

  reportBtn.addEventListener('click', () => {
    const report = window.MicroApp.getReport();
    reportContent.textContent = JSON.stringify(report, null, 2);
    reportPanel.classList.toggle('hidden');
  });

  closeReport.addEventListener('click', () => {
    reportPanel.classList.add('hidden');
  });

  // ========== 7. 模拟登录 (演示全局状态) ==========
  setTimeout(() => {
    setGlobalState({
      user: { name: 'Alice', role: 'admin' },
    });
  }, 2000);

  console.log('[MainApp] ✅ 主应用初始化完成');
})();
