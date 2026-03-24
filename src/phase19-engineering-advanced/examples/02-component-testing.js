// 组件测试模式详解
// 运行: node 02-component-testing.js (模拟 Testing Library)

console.log("=== 组件测试模式 ===\n");

// ========== 1. 模拟 Testing Library ==========
console.log("1. 模拟 Testing Library\n");

class MockDOM {
  constructor() {
    this.elements = [];
  }

  createElement(type, props = {}, children = []) {
    const el = {
      type,
      props,
      children: Array.isArray(children) ? children : [children],
      textContent: "",
      disabled: props.disabled || false,
      value: props.value || "",
      _listeners: {},
    };

    // 收集文本
    el.textContent = el.children
      .filter((c) => typeof c === "string")
      .join("");

    el.addEventListener = (event, handler) => {
      el._listeners[event] = handler;
    };

    el.click = () => {
      if (!el.disabled && el._listeners.click) {
        el._listeners.click(new Event("click"));
      }
      if (!el.disabled && el.props.onClick) {
        el.props.onClick(new Event("click"));
      }
    };

    this.elements.push(el);
    return el;
  }

  // 模拟 render
  render(component) {
    const { type, props } = component;
    const el = this.createElement(type, props, props.children);
    return el;
  }

  // 查询 API
  getByRole(role) {
    const roleMap = { button: "button", textbox: "input", heading: "h1" };
    const type = roleMap[role] || role;
    const el = this.elements.find((e) => e.type === type);
    if (!el) throw new Error(`Unable to find element with role "${role}"`);
    return el;
  }

  getByText(text) {
    const el = this.elements.find((e) => e.textContent.includes(text));
    if (!el) throw new Error(`Unable to find element with text "${text}"`);
    return el;
  }

  queryByText(text) {
    return this.elements.find((e) => e.textContent.includes(text)) || null;
  }
}

// 模拟 screen
const screen = new MockDOM();

// 模拟 render
function render(component) {
  return screen.render(component);
}

// 模拟 expect
function expect(actual) {
  return {
    toHaveTextContent(text) {
      if (!actual.textContent.includes(text)) {
        throw new Error(`Expected text "${text}", got "${actual.textContent}"`);
      }
    },
    toBeDisabled() {
      if (!actual.disabled) throw new Error("Expected element to be disabled");
    },
    toBeEnabled() {
      if (actual.disabled) throw new Error("Expected element to be enabled");
    },
    toBeNull() {
      if (actual !== null) throw new Error("Expected null");
    },
    toHaveBeenCalledTimes(n) {
      if (actual.callCount !== n) {
        throw new Error(`Expected ${n} calls, got ${actual.callCount}`);
      }
    },
  };
}

// ========== 2. 组件测试示例 ==========
console.log("2. Button 组件测试\n");

// 模拟 Button 组件
function Button(props) {
  return {
    type: "button",
    props: {
      ...props,
      children: props.children || "Button",
    },
  };
}

// 测试用例
function runComponentTests() {
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      passed++;
      console.log(`  ✅ ${name}`);
    } catch (err) {
      failed++;
      console.log(`  ❌ ${name}: ${err.message}`);
    }
  }

  test("renders with text", () => {
    render(Button({ children: "Click me" }));
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Click me");
  });

  test("calls onClick when clicked", () => {
    const onClick = { callCount: 0 };
    const handler = () => onClick.callCount++;

    render(Button({ children: "Click", onClick: handler }));
    const button = screen.getByRole("button");
    button.click();

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("does not call onClick when disabled", () => {
    const onClick = { callCount: 0 };
    const handler = () => onClick.callCount++;

    render(Button({ children: "Disabled", disabled: true, onClick: handler }));
    const button = screen.getByRole("button");
    button.click();

    expect(onClick).toHaveBeenCalledTimes(0);
  });

  test("renders as disabled", () => {
    render(Button({ children: "Disabled", disabled: true }));
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  console.log(`\n  结果: ${passed} passed, ${failed} failed\n`);
}

runComponentTests();

// ========== 3. 测试模式总结 ==========
console.log("3. 测试模式总结\n");
console.log(`
  React Testing Library 核心 API:
  ┌──────────────────────────────────────────────────────┐
  │ 渲染     │ render(<Component />)                     │
  ├──────────┼──────────────────────────────────────────┤
  │ 查询     │ getByRole, getByText, getByTestId        │
  │ (必须存在)│ getByLabelText, getByPlaceholderText    │
  ├──────────┼──────────────────────────────────────────┤
  │ 查询     │ queryByRole, queryByText...               │
  │ (可不存在)│ 返回 null 而非抛错                       │
  ├──────────┼──────────────────────────────────────────┤
  │ 异步查询 │ findByRole, findByText...                 │
  │          │ 返回 Promise，自动等待                    │
  ├──────────┼──────────────────────────────────────────┤
  │ 交互     │ fireEvent.click, fireEvent.change         │
  │          │ userEvent.click (推荐，更真实)             │
  ├──────────┼──────────────────────────────────────────┤
  │ 断言     │ toBeInTheDocument, toHaveTextContent      │
  │          │ toBeDisabled, toHaveClass, toBeVisible    │
  └──────────┴──────────────────────────────────────────┘

  测试最佳实践:
  • 测试行为，而非实现细节
  • 优先使用 getByRole (语义查询)
  • 用 userEvent 替代 fireEvent
  • 避免测试 CSS 类名或 DOM 结构
  • 每个测试只验证一个行为
  • 使用 describe + it 组织测试
`);

// ========== 4. Hook 测试模式 ==========
console.log("4. Hook 测试模式\n");
console.log(`
  // useCounter.test.ts
  import { renderHook, act } from '@testing-library/react';
  import { useCounter } from './useCounter';

  describe('useCounter', () => {
    it('returns initial count', () => {
      const { result } = renderHook(() => useCounter(10));
      expect(result.current.count).toBe(10);
    });

    it('increments count', () => {
      const { result } = renderHook(() => useCounter());
      act(() => { result.current.increment(); });
      expect(result.current.count).toBe(1);
    });

    it('resets count', () => {
      const { result } = renderHook(() => useCounter(5));
      act(() => { result.current.increment(); });
      act(() => { result.current.reset(); });
      expect(result.current.count).toBe(5);
    });
  });
`);

console.log("=== 组件测试完成 ===");
