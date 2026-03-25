/**
 * Mini React - createElement (虚拟 DOM)
 *
 * 职责: 创建虚拟 DOM 节点 (VNode)
 * 原理: JSX 编译后调用 createElement，生成描述 UI 的纯对象
 *
 *   JSX:  <div className="app">Hello</div>
 *   编译: createElement('div', { className: 'app' }, 'Hello')
 *   输出: { type: 'div', props: { className: 'app', children: ['Hello'] } }
 */

/**
 * 创建虚拟 DOM 元素
 * @param {string|Function} type - 标签名或组件函数
 * @param {Object} props - 属性
 * @param  {...any} children - 子元素
 * @returns {Object} VNode
 */
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children
        .flat()
        .map((child) =>
          typeof child === "object" ? child : createTextElement(child)
        ),
    },
  };
}

/**
 * 创建文本虚拟节点
 */
function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: String(text),
      children: [],
    },
  };
}

/**
 * JSX 工厂函数 (h 函数)
 * 等价于 createElement，更短的别名
 */
const h = createElement;

module.exports = { createElement, createTextElement, h };
