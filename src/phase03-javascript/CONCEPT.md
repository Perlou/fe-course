# JavaScript 深入解析 - 从零开始

## 📌 一、JavaScript 是什么？

```
JavaScript = 一种动态类型、弱类型的解释型编程语言
```

```
┌─────────────────────────────────────────────────────────┐
│                  JavaScript 特点                        │
├─────────────────┬─────────────────┬─────────────────────┤
│     动态类型     │     弱类型      │      解释执行       │
│  运行时确定类型  │  隐式类型转换   │    逐行翻译执行     │
└─────────────────┴─────────────────┴─────────────────────┘
```

---

## 📌 二、变量与数据类型

### 1. 变量声明

```javascript
// var: 函数作用域，会提升
var a = 1;

// let: 块级作用域，不会提升
let b = 2;

// const: 块级作用域，不能重新赋值
const c = 3;

// 区别对比
┌─────────────┬─────────┬─────────┬───────────┐
│             │   var   │   let   │   const   │
├─────────────┼─────────┼─────────┼───────────┤
│ 作用域       │ 函数    │  块级   │   块级    │
│ 重复声明     │   ✅    │   ❌   │    ❌     │
│ 重新赋值     │   ✅    │   ✅   │    ❌     │
│ 变量提升     │   ✅    │   ❌   │    ❌     │
│ 暂时性死区   │   ❌    │   ✅   │    ✅     │
└─────────────┴─────────┴─────────┴───────────┘
```

### 2. 数据类型

```javascript
// 原始类型 (Primitive Types) - 7种
string; // "hello"
number; // 42, 3.14, NaN, Infinity
boolean; // true, false
null; // 空值
undefined; // 未定义
symbol; // Symbol('id')
bigint; // 123n

// 引用类型 (Reference Types)
Object; // { name: "Alice" }
Array; // [1, 2, 3]
Function; // function() {}
Date; // new Date()
RegExp; // /pattern/
Map; // new Map()
Set; // new Set()
```

### 3. 类型判断

```javascript
// typeof - 判断原始类型
typeof "hello"; // "string"
typeof 42; // "number"
typeof true; // "boolean"
typeof undefined; // "undefined"
typeof Symbol(); // "symbol"
typeof 123n; // "bigint"

// ⚠️ typeof 的坑
typeof null; // "object" (历史遗留bug)
typeof []; // "object"
typeof {}; // "object"
typeof function () {}; // "function"

// instanceof - 判断引用类型
[] instanceof Array; // true
{} instanceof Object; // true

// Object.prototype.toString - 最准确
Object.prototype.toString.call([]); // "[object Array]"
Object.prototype.toString.call(null); // "[object Null]"
Object.prototype.toString.call(undefined); // "[object Undefined]"
```

---

## 📌 三、作用域

### 1. 作用域类型

```
┌─────────────────────────────────────────────────────────┐
│                      全局作用域                          │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │                  函数作用域                      │   │
│   │                                                 │   │
│   │   ┌─────────────────────────────────────────┐   │   │
│   │   │              块级作用域                  │   │   │
│   │   │          (let, const 声明)               │   │   │
│   │   │   ┌─────────────────────────────────┐   │   │   │
│   │   │   │         嵌套块级作用域           │   │   │   │
│   │   │   └─────────────────────────────────┘   │   │   │
│   │   └─────────────────────────────────────────┘   │   │
│   └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 2. 作用域链

```javascript
var global = "global";

function outer() {
  var outerVar = "outer";

  function inner() {
    var innerVar = "inner";

    // 作用域链查找顺序：
    // inner 作用域 → outer 作用域 → 全局作用域
    console.log(innerVar); // ✅ 找到
    console.log(outerVar); // ✅ 向上查找
    console.log(global); // ✅ 全局作用域
  }

  inner();
}
```

```
作用域链查找过程：

inner 作用域        outer 作用域        全局作用域
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ innerVar ─────│───│───────────────│───│───────────────│
│               │   │ outerVar ─────│───│───────────────│
│               │   │               │   │ global ───────│
└───────────────┘   └───────────────┘   └───────────────┘
        ↑                   ↑                   ↑
        └───────────────────┴───────────────────┘
                    查找方向 →
```

---

## 📌 四、闭包

### 1. 什么是闭包？

```
闭包 = 函数 + 其词法环境（定义时的作用域链）
```

```javascript
function outer() {
  let count = 0; // 自由变量

  function inner() {
    return ++count; // inner 引用了 outer 作用域的 count
  }

  return inner; // 返回函数
}

const counter = outer(); // outer 执行完毕，但 count 没有被销毁
counter(); // 1
counter(); // 2
counter(); // 3
// count 被 inner 函数"捕获"，形成闭包
```

### 2. 闭包的应用

```javascript
// 1. 数据私有化
function createPerson(name) {
  let _age = 0; // 私有变量

  return {
    getName: () => name,
    getAge: () => _age,
    setAge: (age) => {
      if (age > 0) _age = age;
    },
  };
}

// 2. 函数柯里化
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function (...moreArgs) {
      return curried.apply(this, args.concat(moreArgs));
    };
  };
}

// 3. 防抖
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 4. 节流
function throttle(fn, delay) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}
```

### 3. 闭包的内存问题

```javascript
// ⚠️ 闭包可能导致内存泄漏

function createLeak() {
  const largeData = new Array(1000000).fill("data");

  return function () {
    // 只要这个函数存在，largeData 就不会被回收
    console.log(largeData.length);
  };
}

const leak = createLeak(); // largeData 被闭包持有

// 解决方法：不再需要时手动解除引用
leak = null;
```

---

## 📌 五、原型与原型链

### 1. 原型关系图

```
                    null
                      ↑
                      │
            ┌─────────┴─────────┐
            │ Object.prototype  │
            │ toString()        │
            │ hasOwnProperty()  │
            └─────────┬─────────┘
                      ↑ __proto__
                      │
            ┌─────────┴─────────┐
            │ Person.prototype  │
            │ sayHello()        │
            │ constructor       │──────→ Person
            └─────────┬─────────┘
                      ↑ __proto__
                      │
            ┌─────────┴─────────┐
            │  person 实例       │
            │  name: "Alice"    │
            │  age: 20          │
            └───────────────────┘
```

### 2. 原型链代码

```javascript
function Person(name) {
  this.name = name;
}
Person.prototype.sayHello = function () {
  console.log(`Hello, I'm ${this.name}`);
};

const person = new Person("Alice");

// 原型链关系
person.__proto__ === Person.prototype; // true
Person.prototype.__proto__ === Object.prototype; // true
Object.prototype.__proto__ === null; // true

// constructor
Person.prototype.constructor === Person; // true
person.constructor === Person; // true

// 判断方法
person instanceof Person; // true
Person.prototype.isPrototypeOf(person); // true
person.hasOwnProperty("name"); // true
person.hasOwnProperty("sayHello"); // false (在原型上)
```

### 3. 手写 new

```javascript
function myNew(Constructor, ...args) {
  // 1. 创建空对象，原型指向构造函数的 prototype
  const obj = Object.create(Constructor.prototype);

  // 2. 执行构造函数，绑定 this
  const result = Constructor.apply(obj, args);

  // 3. 如果构造函数返回对象，则返回该对象；否则返回新创建的对象
  return result instanceof Object ? result : obj;
}
```

### 4. 继承方式

```javascript
// ES6 class 继承（推荐）
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    console.log(`${this.name} makes a sound`);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // 调用父类构造函数
    this.breed = breed;
  }
  speak() {
    console.log(`${this.name} barks`);
  }
}

// 寄生组合式继承（ES5）
function inherit(Child, Parent) {
  Child.prototype = Object.create(Parent.prototype);
  Child.prototype.constructor = Child;
}
```

---

## 📌 六、this 绑定

### 1. this 绑定规则

```
┌─────────────────────────────────────────────────────────┐
│                    this 绑定规则                         │
├─────────────────┬───────────────────────────────────────┤
│    优先级        │               说明                    │
├─────────────────┼───────────────────────────────────────┤
│ 1. new 绑定     │ this 指向新创建的对象                  │
│ 2. 显式绑定     │ call/apply/bind 指定的对象            │
│ 3. 隐式绑定     │ 调用对象（obj.fn() 中的 obj）          │
│ 4. 默认绑定     │ 全局对象 / undefined (严格模式)        │
└─────────────────┴───────────────────────────────────────┘

优先级: new > 显式 > 隐式 > 默认
```

### 2. 绑定示例

```javascript
const obj = {
  name: "obj",
  fn() {
    console.log(this.name);
  },
};

// 1. 默认绑定
const fn = obj.fn;
fn(); // undefined (严格模式) / window.name (非严格)

// 2. 隐式绑定
obj.fn(); // "obj"

// 3. 显式绑定
obj.fn.call({ name: "call" }); // "call"
obj.fn.apply({ name: "apply" }); // "apply"
const boundFn = obj.fn.bind({ name: "bind" });
boundFn(); // "bind"

// 4. new 绑定
function Person(name) {
  this.name = name;
}
const person = new Person("Alice"); // this -> 新对象
```

### 3. 箭头函数

```javascript
// 箭头函数没有自己的 this，继承外层作用域的 this

const obj = {
  name: "obj",
  regular() {
    console.log(this.name); // "obj" (隐式绑定)
  },
  arrow: () => {
    console.log(this.name); // undefined (继承全局)
  },
  nested() {
    // 箭头函数在方法内部很有用
    setTimeout(() => {
      console.log(this.name); // "obj" (继承 nested 的 this)
    }, 100);
  },
};
```

### 4. 手写 call/apply/bind

```javascript
// call
Function.prototype.myCall = function (context, ...args) {
  context = context ?? globalThis;
  const key = Symbol();
  context[key] = this;
  const result = context[key](...args);
  delete context[key];
  return result;
};

// apply
Function.prototype.myApply = function (context, args = []) {
  context = context ?? globalThis;
  const key = Symbol();
  context[key] = this;
  const result = context[key](...args);
  delete context[key];
  return result;
};

// bind
Function.prototype.myBind = function (context, ...args) {
  const fn = this;
  return function boundFn(...moreArgs) {
    if (this instanceof boundFn) {
      return new fn(...args, ...moreArgs);
    }
    return fn.apply(context, [...args, ...moreArgs]);
  };
};
```

---

## 📌 七、事件循环

### 1. 事件循环机制

```
┌─────────────────────────────────────────────────────────┐
│                     主线程执行流程                        │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │     调用栈 (Call Stack)     │
                │   执行同步代码              │
                └─────────────────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │     微任务队列               │
                │   Promise.then              │
                │   queueMicrotask            │
                │   MutationObserver          │
                │   清空所有微任务 ←───────────┤
                └─────────────────────┘       │
                           │                  │
                           ▼                  │
                ┌─────────────────────┐       │
                │     渲染 (可选)              │       │
                └─────────────────────┘       │
                           │                  │
                           ▼                  │
                ┌─────────────────────┐       │
                │     宏任务队列               │       │
                │   setTimeout               │       │
                │   setInterval              │───────┘
                │   I/O                      │
                │   每次只取一个              │
                └─────────────────────┘
```

### 2. 执行顺序示例

```javascript
console.log("1"); // 同步

setTimeout(() => {
  console.log("2"); // 宏任务
}, 0);

Promise.resolve().then(() => {
  console.log("3"); // 微任务
});

console.log("4"); // 同步

// 输出顺序: 1 → 4 → 3 → 2
```

### 3. 复杂示例

```javascript
console.log("script start");

setTimeout(() => {
  console.log("setTimeout 1");
  Promise.resolve().then(() => {
    console.log("promise inside setTimeout");
  });
}, 0);

Promise.resolve()
  .then(() => {
    console.log("promise 1");
  })
  .then(() => {
    console.log("promise 2");
  });

setTimeout(() => {
  console.log("setTimeout 2");
}, 0);

console.log("script end");

/*
输出顺序:
1. script start          (同步)
2. script end            (同步)
3. promise 1             (微任务)
4. promise 2             (微任务)
5. setTimeout 1          (宏任务)
6. promise inside setTimeout (微任务)
7. setTimeout 2          (宏任务)
*/
```

---

## 📌 八、异步编程

### 1. Promise

```javascript
// 创建 Promise
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("success");
    // 或 reject(new Error('failed'));
  }, 1000);
});

// 使用 Promise
promise
  .then((result) => {
    console.log(result); // "success"
    return "next";
  })
  .then((result) => {
    console.log(result); // "next"
  })
  .catch((error) => {
    console.error(error);
  })
  .finally(() => {
    console.log("done");
  });

// Promise 链式调用返回值
// 1. 返回普通值 → 下一个 then 接收该值
// 2. 返回 Promise → 下一个 then 等待该 Promise
// 3. 抛出错误 → 进入 catch
```

### 2. Promise 静态方法

```javascript
// Promise.all: 全部成功才成功
Promise.all([p1, p2, p3])
  .then((results) => console.log(results)) // [r1, r2, r3]
  .catch((error) => console.error(error)); // 任一失败

// Promise.race: 第一个完成的结果（成功或失败）
Promise.race([p1, p2, p3]).then((result) => console.log(result));

// Promise.allSettled: 等待所有完成（不管成功失败）
Promise.allSettled([p1, p2]).then((results) => {
  // [{status: 'fulfilled', value: ...}, {status: 'rejected', reason: ...}]
});

// Promise.any: 第一个成功的结果
Promise.any([p1, p2, p3]).then((result) => console.log(result));
```

### 3. async/await

```javascript
async function fetchData() {
  try {
    const response = await fetch("/api/data");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// 并发请求
async function fetchAll() {
  // 串行（慢）
  const user = await fetchUser();
  const posts = await fetchPosts();

  // 并发（快）
  const [user, posts] = await Promise.all([fetchUser(), fetchPosts()]);
}

// async 函数返回 Promise
fetchData().then((data) => console.log(data));
```

### 4. 手写 Promise

```javascript
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
  constructor(executor) {
    this.status = PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;
        this.onFulfilledCallbacks.forEach((fn) => fn());
      }
    };

    const reject = (reason) => {
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;
        this.onRejectedCallbacks.forEach((fn) => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : (v) => v;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (e) => {
            throw e;
          };

    const promise2 = new MyPromise((resolve, reject) => {
      const handleFulfilled = () => {
        queueMicrotask(() => {
          try {
            const x = onFulfilled(this.value);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      };

      const handleRejected = () => {
        queueMicrotask(() => {
          try {
            const x = onRejected(this.reason);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      };

      if (this.status === FULFILLED) {
        handleFulfilled();
      } else if (this.status === REJECTED) {
        handleRejected();
      } else {
        this.onFulfilledCallbacks.push(handleFulfilled);
        this.onRejectedCallbacks.push(handleRejected);
      }
    });

    return promise2;
  }

  resolvePromise(promise2, x, resolve, reject) {
    if (promise2 === x) {
      return reject(new TypeError("Chaining cycle detected"));
    }
    if (x instanceof MyPromise) {
      x.then(resolve, reject);
    } else {
      resolve(x);
    }
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(callback) {
    return this.then(
      (value) => MyPromise.resolve(callback()).then(() => value),
      (reason) =>
        MyPromise.resolve(callback()).then(() => {
          throw reason;
        })
    );
  }

  static resolve(value) {
    if (value instanceof MyPromise) return value;
    return new MyPromise((resolve) => resolve(value));
  }

  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason));
  }

  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const results = [];
      let count = 0;
      promises.forEach((p, i) => {
        MyPromise.resolve(p).then(
          (value) => {
            results[i] = value;
            if (++count === promises.length) {
              resolve(results);
            }
          },
          (reason) => reject(reason)
        );
      });
    });
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach((p) => {
        MyPromise.resolve(p).then(resolve, reject);
      });
    });
  }
}
```

---

## 📚 推荐学习资源

| 资源              | 链接                               |
| ----------------- | ---------------------------------- |
| MDN JavaScript    | developer.mozilla.org              |
| JavaScript.info   | javascript.info                    |
| You Don't Know JS | github.com/getify/You-Dont-Know-JS |
| Promise A+ 规范   | promisesaplus.com                  |

---
