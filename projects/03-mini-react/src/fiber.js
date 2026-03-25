/**
 * Mini React - Fiber 架构
 *
 * 职责: 将 VNode 树转为 Fiber 链表，支持可中断渲染
 * 原理:
 *   VNode 是树结构 → 递归遍历不可中断
 *   Fiber 是链表结构 → 每个节点可单独处理，随时暂停/恢复
 *
 * Fiber 节点关系:
 *   child    → 第一个子节点
 *   sibling  → 下一个兄弟节点
 *   return   → 父节点
 *
 *      A
 *     /
 *    B → C → D
 *   /       /
 *  E → F   G
 *
 *  遍历顺序: A → B → E → F → C → D → G (深度优先)
 */

/**
 * 创建 Fiber 节点
 * @param {Object} vnode - 虚拟 DOM 节点
 * @param {Object} parent - 父 Fiber
 * @returns {Object} Fiber 节点
 */
function createFiber(vnode, parent) {
  return {
    type: vnode.type,
    props: vnode.props,
    dom: null,        // 对应的真实 DOM
    parent: parent,   // 父 Fiber (return)
    child: null,      // 第一个子 Fiber
    sibling: null,    // 下一个兄弟 Fiber
    alternate: null,  // 上一次渲染的 Fiber (用于 Diff)
    effectTag: null,  // 操作标记: PLACEMENT | UPDATE | DELETION
    hooks: [],        // Hooks 状态
  };
}

/**
 * Fiber 标记常量
 */
const PLACEMENT = "PLACEMENT"; // 新增
const UPDATE = "UPDATE";       // 更新
const DELETION = "DELETION";   // 删除

module.exports = { createFiber, PLACEMENT, UPDATE, DELETION };
