// JavaScript 闭包
// 运行: node 03-closure.js

console.log('=== JavaScript 闭包 ===\n');

// ========== 1. 什么是闭包 ==========
console.log('1. 什么是闭包');

// 闭包 = 函数 + 对其定义时词法作用域的引用
function createGreeter(greeting) {
    // greeting 被闭包"记住"
    return function(name) {
        return `${greeting}, ${name}!`;
    };
}

const sayHello = createGreeter('Hello');
const sayHi = createGreeter('Hi');

console.log(sayHello('张三')); // Hello, 张三!
console.log(sayHi('李四'));    // Hi, 李四!

console.log(`
闭包图解:
┌─────────────────────────────────┐
│ createGreeter('Hello')          │
│   ┌───────────────────────────┐ │
│   │ greeting = 'Hello'        │ │  ← 被闭包捕获
│   │                           │ │
│   │ return function(name) {   │ │
│   │   return greeting + name; │─┼──→ 引用外部的 greeting
│   │ }                         │ │
│   └───────────────────────────┘ │
└─────────────────────────────────┘
`);

// ========== 2. 经典闭包示例 ==========
console.log('2. 经典闭包示例');

// 计数器
function createCounter() {
    let count = 0; // 私有变量
    
    return {
        increment() { return ++count; },
        decrement() { return --count; },
        getCount() { return count; }
    };
}

const counter = createCounter();
console.log('increment:', counter.increment()); // 1
console.log('increment:', counter.increment()); // 2
console.log('decrement:', counter.decrement()); // 1
console.log('getCount:', counter.getCount());    // 1
// console.log(count); // ReferenceError - 外部无法直接访问

// 多个独立的计数器
const counter2 = createCounter();
console.log('counter2:', counter2.increment()); // 1 (独立的)

// ========== 3. 闭包的实际应用 ==========
console.log('\n3. 闭包的实际应用');

// 3.1 数据私有化 (模块模式)
const bankAccount = (function() {
    let balance = 0; // 私有
    
    return {
        deposit(amount) {
            if (amount > 0) balance += amount;
            return balance;
        },
        withdraw(amount) {
            if (amount > 0 && amount <= balance) balance -= amount;
            return balance;
        },
        getBalance() {
            return balance;
        }
    };
})();

console.log('存款 100:', bankAccount.deposit(100));
console.log('取款 30:', bankAccount.withdraw(30));
console.log('余额:', bankAccount.getBalance());

// 3.2 函数工厂
function createMultiplier(factor) {
    return function(number) {
        return number * factor;
    };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);
console.log('\n函数工厂:');
console.log('double(5):', double(5)); // 10
console.log('triple(5):', triple(5)); // 15

// 3.3 缓存/记忆化
function memoize(fn) {
    const cache = {};
    return function(...args) {
        const key = JSON.stringify(args);
        if (cache[key] === undefined) {
            console.log(`  计算中: ${key}`);
            cache[key] = fn.apply(this, args);
        } else {
            console.log(`  缓存命中: ${key}`);
        }
        return cache[key];
    };
}

const expensiveOperation = memoize((n) => {
    // 模拟耗时计算
    return n * n;
});

console.log('\n记忆化:');
console.log('结果:', expensiveOperation(5)); // 计算
console.log('结果:', expensiveOperation(5)); // 缓存
console.log('结果:', expensiveOperation(10)); // 计算

// ========== 4. 防抖与节流 ==========
console.log('\n4. 防抖与节流');

// 防抖: 等待停止触发后执行
function debounce(fn, delay) {
    let timer = null;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

// 节流: 固定间隔执行
function throttle(fn, interval) {
    let lastTime = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastTime >= interval) {
            lastTime = now;
            fn.apply(this, args);
        }
    };
}

console.log('防抖和节流函数已定义（在浏览器中测试效果更明显）');

// ========== 5. 柯里化 ==========
console.log('\n5. 柯里化');

// 通用柯里化函数
function curry(fn) {
    return function curried(...args) {
        if (args.length >= fn.length) {
            return fn.apply(this, args);
        } else {
            return function(...moreArgs) {
                return curried.apply(this, args.concat(moreArgs));
            };
        }
    };
}

function add(a, b, c) {
    return a + b + c;
}

const curriedAdd = curry(add);
console.log('curriedAdd(1)(2)(3):', curriedAdd(1)(2)(3)); // 6
console.log('curriedAdd(1, 2)(3):', curriedAdd(1, 2)(3)); // 6
console.log('curriedAdd(1)(2, 3):', curriedAdd(1)(2, 3)); // 6

// ========== 6. 闭包陷阱 ==========
console.log('\n6. 闭包陷阱');

// 循环中的闭包问题
console.log('var 在循环中的问题:');
for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log('  var i:', i), 50);
}
// 输出: 3, 3, 3

// 解决方案1: 使用 let
console.log('\n使用 let 解决:');
for (let j = 0; j < 3; j++) {
    setTimeout(() => console.log('  let j:', j), 100);
}
// 输出: 0, 1, 2

// 解决方案2: 使用 IIFE
console.log('\n使用 IIFE 解决:');
for (var k = 0; k < 3; k++) {
    (function(k) {
        setTimeout(() => console.log('  IIFE k:', k), 150);
    })(k);
}
// 输出: 0, 1, 2

// ========== 7. 闭包与内存 ==========
console.log('\n7. 闭包与内存');

console.log(`
注意事项:
1. 闭包会保持对外部变量的引用，可能导致内存泄漏
2. 不再需要时，将闭包设为 null 以释放内存
3. 避免在循环中创建大量闭包

释放闭包:
let handler = createHandler();
handler = null; // 允许垃圾回收
`);

console.log('\n=== 闭包完成 ===');
