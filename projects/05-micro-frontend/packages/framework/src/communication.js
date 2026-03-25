/**
 * 应用间通信
 *
 * 两种机制:
 *   1. EventBus — 发布订阅，松耦合
 *   2. GlobalState — 全局状态管理，可追踪
 *
 * 对标: qiankun initGlobalState + CustomEvent
 */

// ========== EventBus ==========

class EventBus {
  constructor() {
    this.events = new Map();
  }

  /**
   * 订阅事件
   * @returns {Function} 取消订阅函数
   */
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(callback);

    // 返回取消订阅函数
    return () => this.off(event, callback);
  }

  /**
   * 一次性订阅
   */
  once(event, callback) {
    const unsubscribe = this.on(event, (data) => {
      callback(data);
      unsubscribe();
    });
    return unsubscribe;
  }

  /**
   * 取消订阅
   */
  off(event, callback) {
    const callbacks = this.events.get(event);
    if (!callbacks) return;

    if (callback) {
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    } else {
      // 不传 callback 则清除该事件所有订阅
      this.events.delete(event);
    }
  }

  /**
   * 触发事件
   */
  emit(event, data) {
    const callbacks = this.events.get(event);
    if (!callbacks || callbacks.length === 0) return;

    console.log(`[EventBus] 📢 ${event} → ${callbacks.length} 个订阅者`);
    callbacks.forEach(cb => {
      try {
        cb(data);
      } catch (err) {
        console.error(`[EventBus] 事件处理错误:`, err);
      }
    });
  }

  /**
   * 清除所有事件
   */
  clear() {
    this.events.clear();
  }
}

// ========== GlobalState ==========

class GlobalState {
  constructor(initialState = {}) {
    this.state = { ...initialState };
    this.observers = new Map();
    this.nextId = 0;
  }

  /**
   * 订阅状态变化
   * @param {string} appName - 订阅者名称
   * @param {Function} callback - (newState, prevState) => void
   * @returns {Function} 取消订阅函数
   */
  onStateChange(appName, callback) {
    const id = this.nextId++;
    this.observers.set(id, { appName, callback });
    console.log(`[GlobalState] ${appName} 订阅全局状态`);

    // 立即通知当前状态
    callback({ ...this.state }, {});

    return () => {
      this.observers.delete(id);
      console.log(`[GlobalState] ${appName} 取消订阅`);
    };
  }

  /**
   * 修改全局状态
   */
  setState(partial) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...partial };

    console.log(`[GlobalState] 状态更新:`, Object.keys(partial).join(', '));

    // 通知所有订阅者
    for (const [, observer] of this.observers) {
      try {
        observer.callback({ ...this.state }, prevState);
      } catch (err) {
        console.error(`[GlobalState] 通知 ${observer.appName} 时出错:`, err);
      }
    }
  }

  /**
   * 获取当前状态快照
   */
  getState() {
    return { ...this.state };
  }

  /**
   * 清除所有订阅
   */
  clear() {
    this.observers.clear();
    this.state = {};
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EventBus, GlobalState };
}
