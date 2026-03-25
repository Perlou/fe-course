/**
 * Mini React - 调度器 (Scheduler)
 *
 * 职责: 调度 Fiber 工作单元，实现可中断渲染
 * 原理:
 *   真实 React 使用 MessageChannel 实现时间切片
 *   这里用 setTimeout 模拟 (Node.js 环境)
 *
 * 工作循环:
 *   1. 取出下一个工作单元 (Fiber)
 *   2. 执行工作 (创建 DOM / Diff)
 *   3. 检查是否还有时间 → 有则继续，无则让出
 *   4. 所有工作完成 → 进入 Commit 阶段
 */

let nextUnitOfWork = null;  // 下一个要处理的 Fiber
let wipRoot = null;         // 正在构建的 Fiber 根
let currentRoot = null;     // 当前已渲染的 Fiber 根
let deletions = [];         // 待删除的 Fiber 列表

/**
 * 获取/设置调度状态
 */
function getNextUnitOfWork() {
  return nextUnitOfWork;
}

function setNextUnitOfWork(fiber) {
  nextUnitOfWork = fiber;
}

function getWipRoot() {
  return wipRoot;
}

function setWipRoot(root) {
  wipRoot = root;
}

function getCurrentRoot() {
  return currentRoot;
}

function setCurrentRoot(root) {
  currentRoot = root;
}

function getDeletions() {
  return deletions;
}

function resetDeletions() {
  deletions = [];
}

function addDeletion(fiber) {
  deletions.push(fiber);
}

/**
 * 启动工作循环
 * @param {Function} performUnitOfWork - 处理单个 Fiber 的函数
 * @param {Function} commitRoot - 提交渲染结果的函数
 */
function workLoop(performUnitOfWork, commitRoot) {
  // 处理所有工作单元
  while (nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }

  // 所有工作完成，进入 Commit 阶段
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
}

module.exports = {
  getNextUnitOfWork,
  setNextUnitOfWork,
  getWipRoot,
  setWipRoot,
  getCurrentRoot,
  setCurrentRoot,
  getDeletions,
  resetDeletions,
  addDeletion,
  workLoop,
};
