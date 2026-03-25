/**
 * Mini React - Hooks
 *
 * 职责: 实现 useState 和 useEffect
 * 原理:
 *   Hooks 的状态存储在 Fiber 节点的 hooks 数组中
 *   每次渲染时，hookIndex 递增，依次读取/更新状态
 *
 *   这就是为什么 Hooks 不能在条件语句中调用！
 *   — 因为顺序必须保持一致
 */

const scheduler = require("./scheduler");

let wipFiber = null;  // 当前正在处理的 Fiber
let hookIndex = 0;    // 当前 Hook 索引

/**
 * 设置当前 Fiber (reconciler 调用)
 */
function setCurrentFiber(fiber) {
  wipFiber = fiber;
}

/**
 * 重置 Hook 索引 (每次渲染组件前调用)
 */
function resetHookIndex() {
  hookIndex = 0;
}

/**
 * useState - 状态管理 Hook
 *
 * @param {any} initial - 初始值
 * @returns {[any, Function]} [状态值, 更新函数]
 *
 * 原理:
 *   1. 首次渲染: 创建 hook 对象，存入 Fiber.hooks[index]
 *   2. 更新渲染: 从 alternate Fiber 中读取旧 hook 的 state
 *   3. setState: 将 action 入队，触发重新渲染
 */
function useState(initial) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [], // 待执行的更新队列
  };

  // 执行上一轮积累的更新
  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action) => {
    hook.state = typeof action === "function" ? action(hook.state) : action;
  });

  // 记录当前 Fiber 引用 (闭包捕获)
  const currentFiber = wipFiber;

  const setState = (action) => {
    hook.queue.push(action);

    // 触发重新渲染 (类似 React 的调度更新)
    const newRoot = {
      dom: scheduler.getCurrentRoot().dom,
      props: scheduler.getCurrentRoot().props,
      alternate: scheduler.getCurrentRoot(),
    };
    scheduler.setWipRoot(newRoot);
    scheduler.resetDeletions();
    scheduler.setNextUnitOfWork(newRoot);
  };

  wipFiber.hooks.push(hook);
  hookIndex++;

  return [hook.state, setState];
}

/**
 * useEffect - 副作用 Hook
 *
 * @param {Function} callback - 副作用函数
 * @param {Array} deps - 依赖数组
 *
 * 原理:
 *   1. 比较 deps 是否变化
 *   2. 变化了 → 在 Commit 后执行 callback
 *   3. callback 返回的函数 → 清理函数 (下次执行前调用)
 */
function useEffect(callback, deps) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  const hook = {
    deps,
    callback,
    cleanup: oldHook ? oldHook.cleanup : null,
  };

  // 检查依赖是否变化
  const hasChanged = oldHook
    ? !deps || deps.some((dep, i) => dep !== oldHook.deps[i])
    : true;

  if (hasChanged) {
    // 清理上一次的副作用
    if (hook.cleanup && typeof hook.cleanup === "function") {
      hook.cleanup();
    }
    // 执行新的副作用 (异步，在 Commit 后)
    const result = callback();
    hook.cleanup = typeof result === "function" ? result : null;
  }

  wipFiber.hooks.push(hook);
  hookIndex++;
}

/**
 * useMemo - 缓存计算结果
 */
function useMemo(factory, deps) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  const hook = { deps, value: null };

  const hasChanged = oldHook
    ? !deps || deps.some((dep, i) => dep !== oldHook.deps[i])
    : true;

  hook.value = hasChanged ? factory() : oldHook.value;

  wipFiber.hooks.push(hook);
  hookIndex++;

  return hook.value;
}

module.exports = {
  useState,
  useEffect,
  useMemo,
  setCurrentFiber,
  resetHookIndex,
};
