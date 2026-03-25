/**
 * Mini React - 合成事件系统 (Synthetic Events)
 *
 * 职责: 在根节点统一代理事件，实现事件冒泡和跨浏览器兼容
 * 原理:
 *   React 不在每个元素上绑定事件，而是在根容器上代理
 *   事件触发时，从目标元素向上查找 Fiber 树中的处理函数
 *
 *   优点:
 *   1. 减少内存占用 (只绑定一个监听器)
 *   2. 动态添加/删除元素无需手动管理事件
 *   3. 统一事件对象 (SyntheticEvent)
 */

/**
 * 合成事件对象
 */
class SyntheticEvent {
  constructor(nativeEvent) {
    this.nativeEvent = nativeEvent;
    this.type = nativeEvent.type;
    this.target = nativeEvent.target;
    this.currentTarget = null;
    this.bubbles = true;
    this.defaultPrevented = false;
    this._propagationStopped = false;
    this.timeStamp = Date.now();
  }

  preventDefault() {
    this.defaultPrevented = true;
    if (this.nativeEvent.preventDefault) {
      this.nativeEvent.preventDefault();
    }
  }

  stopPropagation() {
    this._propagationStopped = true;
    if (this.nativeEvent.stopPropagation) {
      this.nativeEvent.stopPropagation();
    }
  }
}

/**
 * 事件代理管理器
 */
class EventDelegator {
  constructor(rootContainer) {
    this.rootContainer = rootContainer;
    this.handlers = new Map(); // eventType → Map<dom, handler>
  }

  /**
   * 注册事件处理函数
   */
  bindEvent(dom, eventType, handler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Map());
    }
    this.handlers.get(eventType).set(dom, handler);
  }

  /**
   * 移除事件处理函数
   */
  unbindEvent(dom, eventType) {
    const typeHandlers = this.handlers.get(eventType);
    if (typeHandlers) {
      typeHandlers.delete(dom);
    }
  }

  /**
   * 模拟事件触发 (从目标元素向上冒泡)
   */
  dispatch(targetDom, eventType, eventData = {}) {
    const nativeEvent = {
      type: eventType,
      target: targetDom,
      ...eventData,
    };

    const syntheticEvent = new SyntheticEvent(nativeEvent);
    const typeHandlers = this.handlers.get(eventType);

    if (!typeHandlers) return;

    // 从目标向上冒泡查找处理函数
    let currentDom = targetDom;
    while (currentDom && !syntheticEvent._propagationStopped) {
      const handler = typeHandlers.get(currentDom);
      if (handler) {
        syntheticEvent.currentTarget = currentDom;
        handler(syntheticEvent);
      }
      currentDom = currentDom._parent;
    }
  }
}

module.exports = { SyntheticEvent, EventDelegator };
