// ES6+ 生成器
// 运行: node 06-generator.js

console.log('=== 生成器 (Generator) ===\n');

// ========== 1. 基本语法 ==========
console.log('1. 基本语法');

// 生成器函数使用 function* 语法
function* simpleGenerator() {
    console.log('开始执行');
    yield 1;
    console.log('继续执行');
    yield 2;
    console.log('最后执行');
    yield 3;
    console.log('执行完毕');
}

const gen = simpleGenerator();
console.log('创建生成器，代码还未执行');
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
console.log(gen.next()); // { value: undefined, done: true }

// ========== 2. yield 表达式 ==========
console.log('\n2. yield 表达式');

function* counter() {
    let count = 0;
    while (true) {
        const reset = yield count++;
        if (reset) {
            count = 0;
        }
    }
}

const c = counter();
console.log('计数:', c.next().value); // 0
console.log('计数:', c.next().value); // 1
console.log('计数:', c.next().value); // 2
console.log('重置:', c.next(true).value); // 0
console.log('计数:', c.next().value); // 1

// ========== 3. 生成器是可迭代的 ==========
console.log('\n3. 生成器是可迭代的');

function* range(start, end) {
    for (let i = start; i <= end; i++) {
        yield i;
    }
}

console.log('for...of:');
for (const num of range(1, 5)) {
    console.log(' ', num);
}

console.log('展开:', [...range(1, 5)]);

// ========== 4. yield* 委托 ==========
console.log('\n4. yield* 委托');

function* inner() {
    yield 'a';
    yield 'b';
}

function* outer() {
    yield 1;
    yield* inner(); // 委托给另一个生成器
    yield 2;
    yield* [3, 4]; // 也可以委托给可迭代对象
}

console.log('yield* 委托:', [...outer()]);
// [1, 'a', 'b', 2, 3, 4]

// ========== 5. 生成器返回值 ==========
console.log('\n5. 生成器返回值');

function* withReturn() {
    yield 1;
    yield 2;
    return 'done';
}

const g = withReturn();
console.log(g.next()); // { value: 1, done: false }
console.log(g.next()); // { value: 2, done: false }
console.log(g.next()); // { value: 'done', done: true }
console.log(g.next()); // { value: undefined, done: true }

// 注意: for...of 不会获取 return 值
console.log('for...of 不包含 return:', [...withReturn()]); // [1, 2]

// ========== 6. 生成器控制方法 ==========
console.log('\n6. 生成器控制方法');

function* controlled() {
    try {
        const a = yield 1;
        console.log('收到:', a);
        const b = yield 2;
        console.log('收到:', b);
        yield 3;
    } catch (e) {
        console.log('捕获错误:', e.message);
    } finally {
        console.log('finally 执行');
    }
}

// next() - 获取下一个值
const g1 = controlled();
console.log('next():', g1.next().value);
console.log('next(传值):', g1.next('hello').value);

// return() - 提前结束
const g2 = controlled();
console.log('return():', g2.next().value);
console.log('return(早退):', g2.return('早退').value);

// throw() - 抛出错误
const g3 = controlled();
console.log('throw():', g3.next().value);
console.log('throw(错误):', g3.throw(new Error('出错了')));

// ========== 7. 实际应用：无限序列 ==========
console.log('\n7. 实际应用：无限序列');

// 斐波那契数列
function* fibonacci() {
    let [prev, curr] = [0, 1];
    while (true) {
        yield curr;
        [prev, curr] = [curr, prev + curr];
    }
}

function take(n, iterable) {
    const result = [];
    for (const value of iterable) {
        result.push(value);
        if (result.length >= n) break;
    }
    return result;
}

console.log('斐波那契前10个:', take(10, fibonacci()));

// 素数生成器
function* primes() {
    const found = [];
    let n = 2;
    
    while (true) {
        if (found.every(p => n % p !== 0)) {
            found.push(n);
            yield n;
        }
        n++;
    }
}

console.log('前10个素数:', take(10, primes()));

// ========== 8. 异步生成器 ==========
console.log('\n8. 异步生成器 (async generator)');

async function* asyncRange(start, end) {
    for (let i = start; i <= end; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        yield i;
    }
}

// 使用 for await...of
(async () => {
    console.log('异步生成器:');
    for await (const num of asyncRange(1, 3)) {
        console.log(' ', num);
    }
})();

// ========== 9. 状态机 ==========
console.log('\n9. 状态机');

function* trafficLight() {
    while (true) {
        yield '🔴 红灯';
        yield '🟡 黄灯';
        yield '🟢 绿灯';
    }
}

const light = trafficLight();
console.log(light.next().value);
console.log(light.next().value);
console.log(light.next().value);
console.log(light.next().value); // 循环回到红灯

// ========== 10. 惰性求值 ==========
console.log('\n10. 惰性求值');

function* map(iterable, fn) {
    for (const item of iterable) {
        yield fn(item);
    }
}

function* filter(iterable, predicate) {
    for (const item of iterable) {
        if (predicate(item)) {
            yield item;
        }
    }
}

// 只有在需要时才计算
const numbers = range(1, 1000000);
const evens = filter(numbers, n => n % 2 === 0);
const squares = map(evens, n => n * n);

// 只取前5个，不会计算100万个数
console.log('惰性求值前5个:', take(5, squares));

console.log('\n=== 生成器完成 ===');
