# ES6+ 深入解析

## 📌 一、变量声明

### 1. let vs const vs var

```
┌─────────────────┬─────────┬─────────┬───────────┐
│                 │   var   │   let   │   const   │
├─────────────────┼─────────┼─────────┼───────────┤
│ 作用域          │ 函数    │  块级   │   块级    │
│ 重复声明        │   ✅    │   ❌   │    ❌     │
│ 重新赋值        │   ✅    │   ✅   │    ❌     │
│ 变量提升        │   ✅    │   ❌   │    ❌     │
│ 暂时性死区      │   ❌    │   ✅   │    ✅     │
│ 全局对象属性    │   ✅    │   ❌   │    ❌     │
└─────────────────┴─────────┴─────────┴───────────┘
```

### 2. 暂时性死区 (TDZ)

```javascript
// 暂时性死区：声明前不可访问
console.log(a); // ❌ ReferenceError
let a = 1;

// var 没有 TDZ
console.log(b); // undefined (变量提升)
var b = 2;

// 块级作用域
{
  let x = 1;
  const y = 2;
}
console.log(x); // ❌ ReferenceError
```

### 3. const 的本质

```javascript
// const 保证的是引用不变，不是值不变
const obj = { a: 1 };
obj.a = 2; // ✅ 可以修改属性
obj = {}; // ❌ 不能重新赋值

const arr = [1, 2, 3];
arr.push(4); // ✅ 可以修改数组
arr = []; // ❌ 不能重新赋值

// 如需完全不可变
const frozen = Object.freeze({ a: 1 });
frozen.a = 2; // 静默失败（严格模式报错）
```

---

## 📌 二、解构赋值

### 1. 数组解构

```javascript
// 基本用法
const [a, b, c] = [1, 2, 3];

// 跳过元素
const [first, , third] = [1, 2, 3];

// 默认值
const [x = 0, y = 0] = [1]; // x=1, y=0

// 剩余元素
const [head, ...tail] = [1, 2, 3, 4]; // head=1, tail=[2,3,4]

// 交换变量
let m = 1,
  n = 2;
[m, n] = [n, m]; // m=2, n=1

// 嵌套解构
const [a, [b, c]] = [1, [2, 3]];
```

### 2. 对象解构

```javascript
// 基本用法
const { name, age } = { name: "Alice", age: 20 };

// 重命名
const { name: userName } = { name: "Alice" }; // userName = 'Alice'

// 默认值
const { name, age = 18 } = { name: "Alice" };

// 剩余属性
const { a, ...rest } = { a: 1, b: 2, c: 3 }; // rest = { b: 2, c: 3 }

// 嵌套解构
const {
  user: { name },
} = { user: { name: "Alice" } };

// 函数参数解构
function fn({ name, age = 18 } = {}) {
  console.log(name, age);
}
```

### 3. 解构应用场景

```javascript
// 1. 函数返回多个值
function getMinMax(arr) {
  return [Math.min(...arr), Math.max(...arr)];
}
const [min, max] = getMinMax([1, 2, 3, 4, 5]);

// 2. 导入模块
import { useState, useEffect } from "react";

// 3. 配置对象
function createUser({ name, age = 18, role = "user" } = {}) {
  return { name, age, role };
}

// 4. 遍历 Map
const map = new Map([
  ["a", 1],
  ["b", 2],
]);
for (const [key, value] of map) {
  console.log(key, value);
}
```

---

## 📌 三、展开运算符

### 1. 数组展开

```javascript
// 合并数组
const arr1 = [1, 2];
const arr2 = [3, 4];
const merged = [...arr1, ...arr2]; // [1, 2, 3, 4]

// 复制数组（浅拷贝）
const copy = [...arr1];

// 转换类数组
const args = [...arguments];
const chars = [..."hello"]; // ['h', 'e', 'l', 'l', 'o']

// 函数调用
Math.max(...[1, 2, 3]); // 3
```

### 2. 对象展开

```javascript
// 合并对象
const obj1 = { a: 1, b: 2 };
const obj2 = { c: 3 };
const merged = { ...obj1, ...obj2 }; // { a: 1, b: 2, c: 3 }

// 复制对象（浅拷贝）
const copy = { ...obj1 };

// 覆盖属性
const updated = { ...obj1, b: 10 }; // { a: 1, b: 10 }

// 添加属性
const withNew = { ...obj1, d: 4 };
```

### 3. 剩余参数

```javascript
// 剩余参数（函数参数）
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3, 4); // 10

// 与解构结合
function fn(first, second, ...rest) {
  console.log(first, second, rest);
}
fn(1, 2, 3, 4, 5); // 1, 2, [3, 4, 5]
```

---

## 📌 四、箭头函数

### 1. 语法

```javascript
// 完整语法
const add = (a, b) => {
  return a + b;
};

// 单表达式（隐式返回）
const add = (a, b) => a + b;

// 单参数（省略括号）
const double = (n) => n * 2;

// 无参数
const random = () => Math.random();

// 返回对象（需要括号）
const createUser = (name) => ({ name, age: 0 });
```

### 2. 箭头函数的特点

```javascript
// 1. 没有自己的 this（继承外层）
const obj = {
  name: "obj",
  regular() {
    setTimeout(function () {
      console.log(this.name); // undefined (this 指向 window)
    }, 100);
  },
  arrow() {
    setTimeout(() => {
      console.log(this.name); // 'obj' (继承 arrow 的 this)
    }, 100);
  },
};

// 2. 没有 arguments
const fn = () => {
  console.log(arguments); // ❌ ReferenceError
};
const fn2 = (...args) => {
  console.log(args); // ✅ 使用剩余参数
};

// 3. 不能作为构造函数
const Foo = () => {};
new Foo(); // ❌ TypeError

// 4. 没有 prototype
const arrow = () => {};
arrow.prototype; // undefined
```

### 3. 何时使用箭头函数

```javascript
// ✅ 适合使用
arr.map((x) => x * 2);
arr.filter((x) => x > 0);
setTimeout(() => this.save(), 1000);

// ❌ 不适合使用
const obj = {
  name: "obj",
  // 对象方法不要用箭头函数
  getName: () => this.name, // this 不是 obj
};

// DOM 事件处理器（如需 this 指向元素）
button.addEventListener("click", () => {
  this.classList.add("active"); // this 不是 button
});
```

---

## 📌 五、模板字符串

```javascript
// 基本用法
const name = "Alice";
const greeting = `Hello, ${name}!`;

// 多行字符串
const html = `
  <div class="container">
    <h1>${title}</h1>
    <p>${content}</p>
  </div>
`;

// 表达式
const result = `1 + 1 = ${1 + 1}`;
const upper = `Name: ${name.toUpperCase()}`;

// 嵌套
const list = `
  <ul>
    ${items.map((item) => `<li>${item}</li>`).join("")}
  </ul>
`;

// 标签模板
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const value = values[i] ? `<mark>${values[i]}</mark>` : "";
    return result + str + value;
  }, "");
}
const highlighted = highlight`Hello, ${name}!`;
```

---

## 📌 六、ES Modules

### 1. 导出

```javascript
// 命名导出
export const PI = 3.14;
export function add(a, b) { return a + b; }
export class Calculator {}

// 统一导出
const PI = 3.14;
function add(a, b) { return a + b; }
export { PI, add };

// 重命名导出
export { add as sum };

// 默认导出（每个模块只能一个）
export default function() {}
export default class MyClass {}

// 混合导出
export const version = '1.0';
export default function main() {}
```

### 2. 导入

```javascript
// 导入命名导出
import { PI, add } from "./math.js";

// 重命名导入
import { add as sum } from "./math.js";

// 导入全部
import * as Math from "./math.js";
Math.PI;
Math.add(1, 2);

// 导入默认导出
import MyClass from "./MyClass.js";

// 混合导入
import main, { version } from "./module.js";

// 副作用导入（只执行，不导入）
import "./polyfills.js";
```

### 3. 动态导入

```javascript
// 动态导入（返回 Promise）
const module = await import("./module.js");
module.default; // 默认导出
module.fn; // 命名导出

// 按需加载
button.addEventListener("click", async () => {
  const { Chart } = await import("./chart.js");
  new Chart();
});
```

---

## 📌 七、迭代器与生成器

### 1. 迭代器协议

```javascript
// 可迭代对象需要实现 [Symbol.iterator] 方法
const iterable = {
  data: [1, 2, 3],
  [Symbol.iterator]() {
    let index = 0;
    return {
      next: () => {
        if (index < this.data.length) {
          return { value: this.data[index++], done: false };
        }
        return { done: true };
      },
    };
  },
};

for (const item of iterable) {
  console.log(item); // 1, 2, 3
}
```

### 2. 生成器

```javascript
// 生成器函数
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}

const iterator = gen();
iterator.next(); // { value: 1, done: false }
iterator.next(); // { value: 2, done: false }
iterator.next(); // { value: 3, done: false }
iterator.next(); // { done: true }

// 使用 for...of
for (const value of gen()) {
  console.log(value); // 1, 2, 3
}

// 展开
[...gen()]; // [1, 2, 3]
```

### 3. 生成器应用

```javascript
// 1. 无限序列
function* infiniteSequence() {
  let i = 0;
  while (true) {
    yield i++;
  }
}

// 2. 异步流程控制
function* fetchData() {
  const user = yield fetch("/api/user");
  const posts = yield fetch(`/api/posts?userId=${user.id}`);
  return posts;
}

// 3. 遍历树结构
function* traverse(node) {
  yield node;
  for (const child of node.children) {
    yield* traverse(child);
  }
}
```

---

## 📌 八、Proxy 与 Reflect

### 1. Proxy 基础

```javascript
const target = { name: "Alice", age: 20 };

const proxy = new Proxy(target, {
  get(target, key, receiver) {
    console.log(`Getting ${key}`);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    console.log(`Setting ${key} = ${value}`);
    return Reflect.set(target, key, value, receiver);
  },
});

proxy.name; // Getting name → "Alice"
proxy.age = 21; // Setting age = 21
```

### 2. 常用拦截器

```javascript
const handler = {
  // 读取属性
  get(target, key, receiver) {},

  // 设置属性
  set(target, key, value, receiver) {},

  // in 操作符
  has(target, key) {},

  // delete 操作符
  deleteProperty(target, key) {},

  // Object.keys 等
  ownKeys(target) {},

  // 函数调用
  apply(target, thisArg, args) {},

  // new 操作符
  construct(target, args) {},
};
```

### 3. Proxy 应用

```javascript
// 1. 数据验证
const validator = new Proxy(
  {},
  {
    set(target, key, value) {
      if (key === "age" && (typeof value !== "number" || value < 0)) {
        throw new TypeError("Age must be a positive number");
      }
      target[key] = value;
      return true;
    },
  }
);

// 2. 响应式数据（Vue 3 原理）
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      track(target, key); // 收集依赖
      const result = Reflect.get(target, key, receiver);
      if (typeof result === "object") {
        return reactive(result);
      }
      return result;
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key); // 触发更新
      return result;
    },
  });
}

// 3. 负数索引数组
function createArray(...elements) {
  return new Proxy(elements, {
    get(target, key) {
      const index = Number(key);
      if (index < 0) {
        return target[target.length + index];
      }
      return target[key];
    },
  });
}
const arr = createArray(1, 2, 3);
arr[-1]; // 3
```

---

## 📌 九、其他 ES6+ 特性

### 1. 可选链与空值合并

```javascript
// 可选链 ?.
const name = user?.profile?.name;
const value = obj?.method?.();
const item = arr?.[0];

// 空值合并 ??
const value = input ?? "default"; // 只有 null/undefined 才用默认值
const value2 = input || "default"; // falsy 值都用默认值

// 区别
0 || "default"; // 'default'
0 ?? "default"; // 0

"" || "default"; // 'default'
"" ?? "default"; // ''
```

### 2. 逻辑赋值

```javascript
// 或赋值
a ||= b; // a = a || b

// 与赋值
a &&= b; // a = a && b

// 空值合并赋值
a ??= b; // a = a ?? b

// 应用
const obj = {};
obj.items ??= [];
obj.items.push(1);
```

### 3. Symbol

```javascript
// 创建唯一标识符
const s1 = Symbol("description");
const s2 = Symbol("description");
s1 === s2; // false

// 作为对象属性键
const KEY = Symbol("key");
const obj = {
  [KEY]: "hidden value",
  normal: "visible",
};
Object.keys(obj); // ['normal'] (Symbol 属性不会被枚举)

// 内置 Symbol
Symbol.iterator; // 迭代器
Symbol.toStringTag; // Object.prototype.toString
Symbol.toPrimitive; // 类型转换
```

### 4. Map 与 Set

```javascript
// Map: 键值对，键可以是任意类型
const map = new Map();
map.set("key", "value");
map.set(obj, "object as key");
map.get("key");
map.has("key");
map.delete("key");
map.size;

// Set: 唯一值集合
const set = new Set([1, 2, 2, 3]); // {1, 2, 3}
set.add(4);
set.has(2);
set.delete(2);

// 数组去重
const unique = [...new Set(array)];

// WeakMap / WeakSet: 弱引用，键必须是对象
const wm = new WeakMap();
wm.set(obj, "value"); // obj 被垃圾回收时，条目自动删除
```

---

## 📚 推荐学习资源

| 资源            | 链接                  |
| --------------- | --------------------- |
| MDN JavaScript  | developer.mozilla.org |
| ES6 入门教程    | es6.ruanyifeng.com    |
| JavaScript.info | javascript.info       |

---
