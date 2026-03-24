// 测试基础与框架详解
// 运行: node 01-testing-basics.js (手写测试框架)

console.log("=== 测试基础与框架 ===\n");

// ========== 1. 手写迷你测试框架 ==========
console.log("1. 手写迷你测试框架\n");

class TestRunner {
  constructor() {
    this.suites = [];
    this.currentSuite = null;
    this.results = { passed: 0, failed: 0, skipped: 0, total: 0 };
  }

  describe(name, fn) {
    this.currentSuite = { name, tests: [], beforeEach: null, afterEach: null };
    fn();
    this.suites.push(this.currentSuite);
    this.currentSuite = null;
  }

  it(name, fn) {
    this.currentSuite.tests.push({ name, fn, skip: false });
  }

  xit(name, fn) {
    this.currentSuite.tests.push({ name, fn, skip: true });
  }

  beforeEach(fn) {
    this.currentSuite.beforeEach = fn;
  }

  async run() {
    for (const suite of this.suites) {
      console.log(`  📦 ${suite.name}`);
      for (const test of suite.tests) {
        this.results.total++;
        if (test.skip) {
          this.results.skipped++;
          console.log(`    ⏭️  ${test.name} (skipped)`);
          continue;
        }
        try {
          if (suite.beforeEach) await suite.beforeEach();
          await test.fn();
          this.results.passed++;
          console.log(`    ✅ ${test.name}`);
        } catch (err) {
          this.results.failed++;
          console.log(`    ❌ ${test.name}: ${err.message}`);
        }
      }
      console.log();
    }

    const { passed, failed, skipped, total } = this.results;
    console.log(`  结果: ${passed} passed, ${failed} failed, ${skipped} skipped (共 ${total})`);
    console.log(`  ${failed === 0 ? "✅ All tests passed!" : "❌ Some tests failed!"}\n`);
  }
}

// ========== 2. 手写断言库 ==========
function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toEqual(expected) {
      const a = JSON.stringify(actual);
      const b = JSON.stringify(expected);
      if (a !== b) throw new Error(`Expected ${b}, got ${a}`);
    },
    toBeGreaterThan(expected) {
      if (!(actual > expected)) throw new Error(`Expected ${actual} > ${expected}`);
    },
    toBeLessThan(expected) {
      if (!(actual < expected)) throw new Error(`Expected ${actual} < ${expected}`);
    },
    toContain(item) {
      if (Array.isArray(actual)) {
        if (!actual.includes(item)) throw new Error(`Array does not contain ${item}`);
      } else if (typeof actual === "string") {
        if (!actual.includes(item)) throw new Error(`"${actual}" does not contain "${item}"`);
      }
    },
    toThrow(msg) {
      let threw = false;
      try { actual(); } catch (e) {
        threw = true;
        if (msg && !e.message.includes(msg)) {
          throw new Error(`Expected error "${msg}", got "${e.message}"`);
        }
      }
      if (!threw) throw new Error("Expected function to throw");
    },
    toBeNull() {
      if (actual !== null) throw new Error(`Expected null, got ${actual}`);
    },
    toBeTruthy() {
      if (!actual) throw new Error(`Expected truthy, got ${actual}`);
    },
    toBeFalsy() {
      if (actual) throw new Error(`Expected falsy, got ${actual}`);
    },
    toHaveLength(len) {
      if (actual.length !== len) throw new Error(`Expected length ${len}, got ${actual.length}`);
    },
    not: {
      toBe(expected) {
        if (actual === expected) throw new Error(`Expected not ${JSON.stringify(expected)}`);
      },
      toContain(item) {
        if (Array.isArray(actual) && actual.includes(item)) {
          throw new Error(`Array should not contain ${item}`);
        }
      },
    },
  };
}

// ========== 3. Mock 函数 ==========
function fn(impl) {
  const mock = (...args) => {
    mock.calls.push(args);
    mock.callCount++;
    if (mock._impl) return mock._impl(...args);
    return undefined;
  };
  mock.calls = [];
  mock.callCount = 0;
  mock._impl = impl || null;
  mock.mockReturnValue = (val) => { mock._impl = () => val; return mock; };
  mock.mockImplementation = (fn) => { mock._impl = fn; return mock; };
  mock.toHaveBeenCalled = () => {
    if (mock.callCount === 0) throw new Error("Expected function to have been called");
  };
  mock.toHaveBeenCalledWith = (...expected) => {
    const match = mock.calls.some((call) =>
      JSON.stringify(call) === JSON.stringify(expected)
    );
    if (!match) throw new Error(`Expected call with ${JSON.stringify(expected)}`);
  };
  mock.toHaveBeenCalledTimes = (n) => {
    if (mock.callCount !== n) {
      throw new Error(`Expected ${n} calls, got ${mock.callCount}`);
    }
  };
  return mock;
}

// ========== 4. 运行测试 ==========
const runner = new TestRunner();

// 测试: 数学工具
runner.describe("Math utils", () => {
  runner.it("adds two numbers", () => {
    expect(1 + 1).toBe(2);
    expect(0.1 + 0.2).not.toBe(0.3); // 浮点精度
  });

  runner.it("array operations", () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arr).toHaveLength(5);
    expect(arr).toContain(3);
    expect(arr.filter((x) => x > 2)).toEqual([3, 4, 5]);
  });

  runner.it("string operations", () => {
    const str = "Hello, World!";
    expect(str).toContain("World");
    expect(str.toLowerCase()).toBe("hello, world!");
  });

  runner.it("error handling", () => {
    expect(() => { throw new Error("oops"); }).toThrow("oops");
    expect(() => JSON.parse("{invalid}")).toThrow();
  });
});

// 测试: Mock
runner.describe("Mock functions", () => {
  runner.it("tracks calls", () => {
    const callback = fn();
    callback("hello");
    callback("world");
    callback.toHaveBeenCalledTimes(2);
    callback.toHaveBeenCalledWith("hello");
  });

  runner.it("returns mock values", () => {
    const getUser = fn().mockReturnValue({ name: "Alice" });
    const user = getUser(1);
    expect(user.name).toBe("Alice");
    getUser.toHaveBeenCalledWith(1);
  });

  runner.it("custom implementation", () => {
    const add = fn().mockImplementation((a, b) => a + b);
    expect(add(1, 2)).toBe(3);
    expect(add(3, 4)).toBe(7);
    add.toHaveBeenCalledTimes(2);
  });

  runner.xit("skipped test", () => {
    expect(1).toBe(2); // 不会执行
  });
});

// 测试: 实际函数
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

runner.describe("Utility functions", () => {
  runner.it("capitalize", () => {
    expect(capitalize("hello")).toBe("Hello");
    expect(capitalize("")).toBe("");
    expect(capitalize("a")).toBe("A");
  });

  runner.it("sum", () => {
    expect(sum([1, 2, 3])).toBe(6);
    expect(sum([])).toBe(0);
    expect(sum([10])).toBe(10);
  });
});

runner.run().then(() => {
  console.log("  测试金字塔:");
  console.log(`
          ╱╲
         ╱ E2E ╲         少量: 验证用户流程
        ╱────────╲
       ╱  集成测试 ╲       中等: 验证模块交互
      ╱──────────────╲
     ╱   单元测试      ╲    大量: 验证函数逻辑
    ╱────────────────────╲
`);

  console.log("=== 测试基础完成 ===");
});
