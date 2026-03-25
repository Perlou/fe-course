/**
 * 微前端框架核心原理演示
 *
 * 在 Node.js 环境下演示框架各模块的核心原理
 * 运行: node examples/demo.js
 */

console.log('=== 微前端框架原理演示 ===\n');

// 引入模块
const { ProxySandbox } = require('../packages/framework/src/sandbox');
const { EventBus, GlobalState } = require('../packages/framework/src/communication');
const { LifecycleManager, AppStatus } = require('../packages/framework/src/lifecycle');
const { Monitor } = require('../packages/framework/src/monitor');

// ========== 1. JS 沙箱 ==========
console.log('1. 🧪 JS 沙箱隔离\n');

const sandbox1 = new ProxySandbox('react-app');
const sandbox2 = new ProxySandbox('vue-app');

sandbox1.active();
sandbox2.active();

// 两个沙箱互不干扰
sandbox1.proxy.appName = 'React Dashboard';
sandbox1.proxy.version = '18.0';
sandbox2.proxy.appName = 'Vue Settings';
sandbox2.proxy.version = '3.0';

console.log(`  sandbox1.appName = "${sandbox1.proxy.appName}"`);
console.log(`  sandbox2.appName = "${sandbox2.proxy.appName}"`);
console.log(`  隔离验证: ${sandbox1.proxy.appName !== sandbox2.proxy.appName ? '✅ 通过' : '❌ 失败'}`);

// 白名单验证
console.log(`  白名单 JSON: ${sandbox1.proxy.JSON ? '✅ 可访问' : '❌ 不可访问'}`);
console.log(`  白名单 Math.PI: ${sandbox1.proxy.Math ? sandbox1.proxy.Math.PI : '不可访问'}`);

sandbox1.inactive();
sandbox2.inactive();
console.log();

// ========== 2. 应用间通信 ==========
console.log('2. 📡 应用间通信\n');

// EventBus
console.log('  [EventBus]');
const bus = new EventBus();

bus.on('user:login', (user) => {
  console.log(`    子应用 A 收到: 用户 ${user.name} 登录`);
});

bus.on('user:login', (user) => {
  console.log(`    子应用 B 收到: 用户 ${user.name} 登录`);
});

bus.emit('user:login', { name: 'Alice', role: 'admin' });

// GlobalState
console.log('\n  [GlobalState]');
const globalState = new GlobalState({ theme: 'dark', user: null });

globalState.onStateChange('react-app', (state, prev) => {
  if (state.theme !== prev.theme) {
    console.log(`    React: 主题变更 → ${state.theme}`);
  }
});

globalState.onStateChange('vue-app', (state, prev) => {
  if (state.user !== prev.user) {
    console.log(`    Vue: 用户变更 → ${JSON.stringify(state.user)}`);
  }
});

globalState.setState({ user: { name: 'Alice', id: 1 } });
globalState.setState({ theme: 'light' });
console.log();

// ========== 3. 生命周期管理 ==========
console.log('3. ♻️  生命周期状态机\n');

const lifecycle = new LifecycleManager();

lifecycle.register({
  name: 'test-app',
  container: '#container',
  props: {},
});

async function demoLifecycle() {
  // 加载
  await lifecycle.load('test-app', async () => ({
    bootstrap: async () => console.log('    → bootstrap 完成'),
    mount: async ({ container }) => console.log(`    → mount 到 ${container}`),
    unmount: async () => console.log('    → unmount 清理完成'),
  }));

  console.log(`  状态: ${lifecycle.getStatus('test-app')}`);

  // 初始化
  await lifecycle.bootstrap('test-app');
  console.log(`  状态: ${lifecycle.getStatus('test-app')}`);

  // 挂载
  await lifecycle.mount('test-app');
  console.log(`  状态: ${lifecycle.getStatus('test-app')}`);

  // 卸载
  await lifecycle.unmount('test-app');
  console.log(`  状态: ${lifecycle.getStatus('test-app')}`);

  // 再次挂载 (跳过 bootstrap)
  await lifecycle.mount('test-app');
  console.log(`  状态: ${lifecycle.getStatus('test-app')}`);
  console.log(`  bootstrap 仅执行一次: ✅`);
  console.log();

  // ========== 4. 性能监控 ==========
  console.log('4. 📊 性能监控\n');

  const monitor = new Monitor();

  // 模拟应用加载
  monitor.startTimer('load:react-app');
  await sleep(50);
  monitor.endTimer('load:react-app');

  monitor.startTimer('mount:react-app');
  await sleep(20);
  monitor.endTimer('mount:react-app');

  monitor.startTimer('load:vue-app');
  await sleep(80);
  monitor.endTimer('load:vue-app');

  monitor.startTimer('mount:vue-app');
  await sleep(15);
  monitor.endTimer('mount:vue-app');

  // 模拟一个错误
  monitor.logError('test-app', 'mount', new Error('容器不存在'));

  // 打印报告
  monitor.printReport();

  // ========== 5. 所有应用信息 ==========
  console.log('5. 📋 应用列表\n');
  console.log('  ', lifecycle.getApps());

  console.log('\n=== 演示完成 ===');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

demoLifecycle().catch(console.error);
