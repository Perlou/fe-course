/**
 * Mini React - Reconciler (协调器)
 *
 * 职责:
 *   1. Render 阶段: 构建 Fiber 树，对比新旧 VNode (Diff)
 *   2. Commit 阶段: 将 Fiber effectTag 应用到真实 DOM
 *
 * 这是 React 最核心的部分！
 */

const { createFiber, PLACEMENT, UPDATE, DELETION } = require("./fiber");
const scheduler = require("./scheduler");
const { resetHookIndex } = require("./hooks");

// ============= DOM 操作 (抽象层) =============

/**
 * 创建真实 DOM 节点
 */
function createDom(fiber) {
  // Node.js 环境: 模拟 DOM
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? { nodeType: 3, nodeValue: fiber.props.nodeValue, _type: "#text" }
      : {
          nodeType: 1,
          tagName: fiber.type.toUpperCase(),
          _type: fiber.type,
          attributes: {},
          children: [],
          style: {},
          eventListeners: {},
        };

  updateDom(dom, {}, fiber.props);
  return dom;
}

/**
 * 更新 DOM 属性
 */
function updateDom(dom, prevProps, nextProps) {
  if (dom.nodeType === 3) {
    dom.nodeValue = nextProps.nodeValue;
    return;
  }

  // 删除旧属性
  Object.keys(prevProps || {})
    .filter((key) => key !== "children")
    .filter((key) => !(key in (nextProps || {})))
    .forEach((key) => {
      if (key.startsWith("on")) {
        const eventType = key.toLowerCase().substring(2);
        delete dom.eventListeners[eventType];
      } else if (key === "style") {
        dom.style = {};
      } else {
        delete dom.attributes[key];
      }
    });

  // 设置新属性
  Object.keys(nextProps || {})
    .filter((key) => key !== "children")
    .filter((key) => (prevProps || {})[key] !== nextProps[key])
    .forEach((key) => {
      if (key.startsWith("on")) {
        const eventType = key.toLowerCase().substring(2);
        dom.eventListeners[eventType] = nextProps[key];
      } else if (key === "style") {
        Object.assign(dom.style, nextProps[key]);
      } else if (key === "className") {
        dom.attributes.class = nextProps[key];
      } else {
        dom.attributes[key] = nextProps[key];
      }
    });
}

/**
 * 将子节点追加到父节点
 */
function appendChild(parent, child) {
  if (parent && parent.children) {
    parent.children.push(child);
  }
}

/**
 * 从父节点移除子节点
 */
function removeChild(parent, child) {
  if (parent && parent.children) {
    const idx = parent.children.indexOf(child);
    if (idx > -1) parent.children.splice(idx, 1);
  }
}

// ============= Render 阶段 =============

/**
 * 处理单个 Fiber 工作单元
 * 返回下一个要处理的 Fiber
 */
function performUnitOfWork(fiber) {
  const isFunctionComponent = fiber.type instanceof Function;

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  // 返回下一个工作单元 (深度优先遍历)
  // 1. 先找子节点
  if (fiber.child) {
    return fiber.child;
  }

  // 2. 没有子节点，找兄弟或向上回溯
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }

  return null;
}

/**
 * 处理函数组件
 */
function updateFunctionComponent(fiber) {
  // 设置当前 Fiber (Hooks 需要)
  const hooks = require("./hooks");
  hooks.setCurrentFiber(fiber);
  resetHookIndex();
  fiber.hooks = [];

  // 调用组件函数，获取子 VNode
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

/**
 * 处理原生 DOM 组件
 */
function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
}

/**
 * Reconciliation - Diff 算法核心
 * 对比新旧子节点，标记 effectTag
 */
function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;

    // 比较类型是否相同
    const sameType = oldFiber && element && element.type === oldFiber.type;

    if (sameType) {
      // 类型相同 → 更新 (复用 DOM)
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        child: null,
        sibling: null,
        alternate: oldFiber,
        effectTag: UPDATE,
        hooks: oldFiber.hooks || [],
      };
    }

    if (element && !sameType) {
      // 类型不同 + 有新元素 → 新增
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        child: null,
        sibling: null,
        alternate: null,
        effectTag: PLACEMENT,
        hooks: [],
      };
    }

    if (oldFiber && !sameType) {
      // 类型不同 + 有旧 Fiber → 删除
      oldFiber.effectTag = DELETION;
      scheduler.addDeletion(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    // 构建 Fiber 链表
    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element && prevSibling) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

// ============= Commit 阶段 =============

/**
 * 提交整棵 Fiber 树到 DOM
 */
function commitRoot() {
  // 先处理删除
  scheduler.getDeletions().forEach(commitWork);

  // 递归提交
  commitWork(scheduler.getWipRoot().child);

  // 保存当前 Fiber 树 (下次更新用于 Diff)
  scheduler.setCurrentRoot(scheduler.getWipRoot());
  scheduler.setWipRoot(null);
}

/**
 * 递归提交单个 Fiber
 */
function commitWork(fiber) {
  if (!fiber) return;

  // 找到最近的有 DOM 的父 Fiber (函数组件没有 DOM)
  let domParentFiber = fiber.parent;
  while (domParentFiber && !domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber ? domParentFiber.dom : null;

  if (fiber.effectTag === PLACEMENT && fiber.dom != null) {
    appendChild(domParent, fiber.dom);
  } else if (fiber.effectTag === UPDATE && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === DELETION) {
    commitDeletion(fiber, domParent);
    return; // 删除后不遍历子节点
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

/**
 * 删除 DOM 节点 (处理函数组件嵌套)
 */
function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    removeChild(domParent, fiber.dom);
  } else if (fiber.child) {
    commitDeletion(fiber.child, domParent);
  }
}

// ============= 渲染入口 =============

/**
 * render - 类似 ReactDOM.render
 * @param {Object} element - VNode
 * @param {Object} container - 容器 DOM
 */
function render(element, container) {
  scheduler.setWipRoot({
    dom: container,
    props: {
      children: [element],
    },
    alternate: scheduler.getCurrentRoot(),
  });

  scheduler.resetDeletions();
  scheduler.setNextUnitOfWork(scheduler.getWipRoot());

  // 执行工作循环
  scheduler.workLoop(performUnitOfWork, commitRoot);
}

module.exports = {
  render,
  performUnitOfWork,
  commitRoot,
  reconcileChildren,
  createDom,
  updateDom,
};
