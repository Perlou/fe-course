// JavaScript 事件循环
// 运行: node 06-event-loop.js

console.log('=== JavaScript 事件循环 ===\n');

// ========== 1. 同步 vs 异步 ==========
console.log('1. 同步 vs 异步');

console.log('开始');

setTimeout(() => {
    console.log('setTimeout 0ms');
}, 0);

console.log('结束');

// 输出顺序: 开始 → 结束 → setTimeout 0ms

// ========== 2. 宏任务与微任务 ==========
console.log('\n2. 宏任务与微任务');

console.log('=== 开始 ===');

// 宏任务
setTimeout(() => console.log('宏任务: setTimeout 1'), 0);
setTimeout(() => console.log('宏任务: setTimeout 2'), 0);

// 微任务
Promise.resolve().then(() => console.log('微任务: Promise 1'));
Promise.resolve().then(() => console.log('微任务: Promise 2'));

// queueMicrotask
queueMicrotask(() => console.log('微任务: queueMicrotask'));

console.log('=== 同步结束 ===');

// 输出顺序:
// === 开始 ===
// === 同步结束 ===
// 微任务: Promise 1
// 微任务: Promise 2
// 微任务: queueMicrotask
// 宏任务: setTimeout 1
// 宏任务: setTimeout 2

// ========== 3. 事件循环图解 ==========
console.log(`
3. 事件循环图解
┌───────────────────────────────────────────────────────┐
│                    调用栈 (Call Stack)                 │
│                   ┌───────────────┐                   │
│                   │  执行中代码     │                   │
│                   └───────────────┘                   │
└───────────────────────────────────────────────────────┘
                           │
                           ▼
┌───────────────────────────────────────────────────────┐
│                    事件循环                            │
│                                                       │
│   1. 执行完所有同步代码                                  │
│                                                       │
│   2. 清空微任务队列                                      │
│      ┌─────────────────────────────────┐              │
│      │ Promise.then, queueMicrotask,  │              │
│      │ MutationObserver               │              │
│      └─────────────────────────────────┘              │
│                                                       │
│   3. 执行一个宏任务                                      │
│      ┌─────────────────────────────────┐              │
│      │ setTimeout, setInterval,       │              │
│      │ setImmediate, I/O, UI rendering│              │
│      └─────────────────────────────────┘              │
│                                                       │
│   4. 回到步骤 2                                         │
└───────────────────────────────────────────────────────┘
`);

// ========== 4. 复杂示例 ==========
console.log('\n4. 复杂示例');

setTimeout(() => {
    console.log('A: setTimeout 外层');
    
    Promise.resolve().then(() => {
        console.log('B: setTimeout 内的 Promise');
    });
    
    setTimeout(() => {
        console.log('C: setTimeout 内的 setTimeout');
    }, 0);
}, 0);

Promise.resolve().then(() => {
    console.log('D: Promise 外层');
    
    setTimeout(() => {
        console.log('E: Promise 内的 setTimeout');
    }, 0);
    
    Promise.resolve().then(() => {
        console.log('F: Promise 内的 Promise');
    });
});

console.log('G: 同步代码');

// 输出顺序: G → D → F → A → B → E → C

// ========== 5. async/await 与事件循环 ==========
console.log('\n5. async/await 与事件循环');

async function asyncFunc() {
    console.log('async 函数开始 (同步)');
    await Promise.resolve();
    console.log('await 之后 (微任务)');
}

console.log('脚本开始');
asyncFunc();
console.log('脚本结束');

// 输出顺序:
// 脚本开始
// async 函数开始 (同步)
// 脚本结束
// await 之后 (微任务)

// ========== 6. Node.js 事件循环特点 ==========
console.log(`
6. Node.js 事件循环阶段
┌───────────────────────────────────────────────────────┐
│                      Node.js 事件循环                  │
│                                                       │
│   ┌─────────────────────────────────────────────────┐ │
│   │                  timers                         │ │
│   │            setTimeout, setInterval              │ │
│   └───────────────────────┬─────────────────────────┘ │
│                           ▼                           │
│   ┌─────────────────────────────────────────────────┐ │
│   │             pending callbacks                   │ │
│   │         系统操作的回调（如TCP错误）                  │ │
│   └───────────────────────┬─────────────────────────┘ │
│                           ▼                           │
│   ┌─────────────────────────────────────────────────┐ │
│   │              idle, prepare                      │ │
│   │               内部使用                           │ │
│   └───────────────────────┬─────────────────────────┘ │
│                           ▼                           │
│   ┌─────────────────────────────────────────────────┐ │
│   │                   poll                          │ │
│   │          I/O 回调（文件、网络）                    │ │
│   └───────────────────────┬─────────────────────────┘ │
│                           ▼                           │
│   ┌─────────────────────────────────────────────────┐ │
│   │                  check                          │ │
│   │              setImmediate                       │ │
│   └───────────────────────┬─────────────────────────┘ │
│                           ▼                           │
│   ┌─────────────────────────────────────────────────┐ │
│   │              close callbacks                    │ │
│   │            socket.on('close', ...)              │ │
│   └─────────────────────────────────────────────────┘ │
│                                                       │
│   注意: 每个阶段之间都会执行 process.nextTick 和微任务   │
└───────────────────────────────────────────────────────┘
`);

// Node.js 特有
if (typeof setImmediate !== 'undefined') {
    setImmediate(() => console.log('setImmediate'));
    setTimeout(() => console.log('setTimeout 0'), 0);
    // 顺序不确定
    
    process.nextTick(() => console.log('process.nextTick'));
    // process.nextTick 优先于 Promise
    
    Promise.resolve().then(() => console.log('Promise'));
}

// ========== 7. 经典面试题 ==========
console.log('\n7. 经典面试题');

async function async1() {
    console.log('async1 start');
    await async2();
    console.log('async1 end');
}

async function async2() {
    console.log('async2');
}

console.log('script start');

setTimeout(() => {
    console.log('setTimeout');
}, 0);

async1();

new Promise(resolve => {
    console.log('promise1');
    resolve();
}).then(() => {
    console.log('promise2');
});

console.log('script end');

/* 输出顺序:
script start
async1 start
async2
promise1
script end
async1 end
promise2
setTimeout
*/

console.log('\n=== 事件循环完成 ===');
