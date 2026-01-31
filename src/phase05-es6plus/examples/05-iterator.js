// ES6+ 迭代器
// 运行: node 05-iterator.js

console.log('=== 迭代器 (Iterator) ===\n');

// ========== 1. 可迭代协议 ==========
console.log('1. 可迭代协议 (Iterable Protocol)');

console.log(`
可迭代对象必须实现 [Symbol.iterator]() 方法，
该方法返回一个迭代器对象。

内置可迭代对象:
- String, Array, TypedArray, Map, Set
- arguments, NodeList

可以使用的语法:
- for...of 循环
- 展开运算符 (...)
- 解构赋值
- Array.from()
- new Map(), new Set()
- Promise.all(), Promise.race()
`);

// 检查是否可迭代
function isIterable(obj) {
    return obj != null && typeof obj[Symbol.iterator] === 'function';
}

console.log('数组可迭代:', isIterable([1, 2, 3]));
console.log('字符串可迭代:', isIterable('hello'));
console.log('普通对象可迭代:', isIterable({ a: 1 }));

// ========== 2. 迭代器协议 ==========
console.log('\n2. 迭代器协议 (Iterator Protocol)');

// 手动获取和使用迭代器
const arr = ['a', 'b', 'c'];
const iterator = arr[Symbol.iterator]();

console.log(iterator.next()); // { value: 'a', done: false }
console.log(iterator.next()); // { value: 'b', done: false }
console.log(iterator.next()); // { value: 'c', done: false }
console.log(iterator.next()); // { value: undefined, done: true }

// ========== 3. 自定义迭代器 ==========
console.log('\n3. 自定义迭代器');

// 创建一个范围迭代器
function createRangeIterator(start, end, step = 1) {
    let current = start;
    
    return {
        [Symbol.iterator]() {
            return this;
        },
        next() {
            if (current <= end) {
                const value = current;
                current += step;
                return { value, done: false };
            }
            return { done: true };
        }
    };
}

const range = createRangeIterator(1, 5);
console.log('自定义范围迭代器:');
for (const num of range) {
    console.log(' ', num);
}

// ========== 4. 可迭代类 ==========
console.log('\n4. 可迭代类');

class Range {
    constructor(start, end, step = 1) {
        this.start = start;
        this.end = end;
        this.step = step;
    }
    
    [Symbol.iterator]() {
        let current = this.start;
        const end = this.end;
        const step = this.step;
        
        return {
            next() {
                if (current <= end) {
                    const value = current;
                    current += step;
                    return { value, done: false };
                }
                return { done: true };
            }
        };
    }
}

const myRange = new Range(0, 10, 2);
console.log('Range 类:', [...myRange]); // [0, 2, 4, 6, 8, 10]

// ========== 5. 让普通对象可迭代 ==========
console.log('\n5. 让普通对象可迭代');

const person = {
    name: '张三',
    age: 25,
    city: '北京',
    
    [Symbol.iterator]() {
        const entries = Object.entries(this).filter(
            ([key]) => key !== Symbol.iterator.toString()
        );
        let index = 0;
        
        return {
            next() {
                if (index < entries.length) {
                    return { value: entries[index++], done: false };
                }
                return { done: true };
            }
        };
    }
};

console.log('可迭代对象:');
for (const [key, value] of person) {
    console.log(`  ${key}: ${value}`);
}

// ========== 6. 字符串迭代 ==========
console.log('\n6. 字符串迭代');

const str = 'Hello 👋';

// for...of 正确处理 Unicode
console.log('for...of:');
for (const char of str) {
    console.log(' ', char);
}

// 展开运算符
console.log('展开:', [...str]);

// 与传统 for 循环的区别
console.log('传统 for 循环的问题:');
for (let i = 0; i < str.length; i++) {
    console.log(' ', str[i]); // emoji 会被拆分
}

// ========== 7. for...of vs for...in ==========
console.log('\n7. for...of vs for...in');

const array = ['a', 'b', 'c'];
array.customProp = 'custom';

console.log('for...in (遍历键，包括原型链):');
for (const key in array) {
    console.log(' ', key); // 0, 1, 2, customProp
}

console.log('for...of (遍历值，只遍历可迭代元素):');
for (const value of array) {
    console.log(' ', value); // a, b, c
}

// ========== 8. 迭代器方法 ==========
console.log('\n8. 数组迭代器方法');

const fruits = ['apple', 'banana', 'cherry'];

// keys()
console.log('keys():', [...fruits.keys()]); // [0, 1, 2]

// values()
console.log('values():', [...fruits.values()]); // ['apple', 'banana', 'cherry']

// entries()
console.log('entries():', [...fruits.entries()]); // [[0, 'apple'], ...]

// 实际使用
console.log('\n遍历 entries:');
for (const [index, value] of fruits.entries()) {
    console.log(`  ${index}: ${value}`);
}

// ========== 9. Map 和 Set 迭代 ==========
console.log('\n9. Map 和 Set 迭代');

const map = new Map([
    ['a', 1],
    ['b', 2],
    ['c', 3]
]);

console.log('Map 迭代:');
for (const [key, value] of map) {
    console.log(`  ${key} => ${value}`);
}

const set = new Set([1, 2, 3, 2, 1]);
console.log('Set 迭代:', [...set]); // [1, 2, 3]

console.log('\n=== 迭代器完成 ===');
