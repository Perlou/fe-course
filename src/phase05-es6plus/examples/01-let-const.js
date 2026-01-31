// ES6+ let/const 与块级作用域
// 运行: node 01-let-const.js

console.log('=== let/const 与块级作用域 ===\n');

// ========== 1. var 的问题 ==========
console.log('1. var 的问题');

// 问题1: 变量提升
console.log('变量提升 - hoisted:', typeof hoisted); // undefined, 不是 ReferenceError
var hoisted = 'value';

// 问题2: 没有块级作用域
if (true) {
    var varInBlock = 'var 在 if 块内';
}
console.log('var 穿透块作用域:', varInBlock); // 可以访问

// 问题3: 循环变量泄露
for (var i = 0; i < 3; i++) {}
console.log('循环后的 i:', i); // 3

// 问题4: 重复声明
var duplicate = 1;
var duplicate = 2; // 不报错
console.log('重复声明:', duplicate);

// ========== 2. let - 块级作用域变量 ==========
console.log('\n2. let - 块级作用域');

// 块级作用域
{
    let letInBlock = 'let 在块内';
    console.log('块内访问:', letInBlock);
}
// console.log(letInBlock); // ReferenceError

// 不能重复声明
let unique = 1;
// let unique = 2; // SyntaxError: Identifier 'unique' has already been declared

// 循环中的 let
console.log('\n循环中的 let:');
for (let j = 0; j < 3; j++) {
    setTimeout(() => console.log('  let j:', j), 10);
}
// 输出: 0, 1, 2 (每次迭代都有独立的绑定)

// ========== 3. const - 常量 ==========
console.log('\n3. const - 常量');

const PI = 3.14159;
console.log('PI:', PI);
// PI = 3.14; // TypeError: Assignment to constant variable

// 必须初始化
// const empty; // SyntaxError: Missing initializer

// const 对象的属性可以修改
const user = { name: '张三', age: 25 };
user.age = 26; // ✓ 允许
console.log('修改 const 对象属性:', user);
// user = {}; // ✗ TypeError: 不能重新赋值

// 冻结对象
const frozen = Object.freeze({ x: 1, y: 2 });
frozen.x = 100; // 静默失败 (严格模式下报错)
console.log('冻结对象:', frozen); // { x: 1, y: 2 }

// ========== 4. 暂时性死区 (TDZ) ==========
console.log('\n4. 暂时性死区 (Temporal Dead Zone)');

// let/const 声明的变量在声明之前无法访问
// console.log(tdzVar); // ReferenceError: Cannot access before initialization
let tdzVar = 'TDZ 结束后';
console.log('TDZ 后:', tdzVar);

// TDZ 示意图
console.log(`
┌─────────────────────────────┐
│ {                           │
│   // TDZ 开始 ─────────     │
│   // 不能访问 x             │
│   // ...                    │
│   // ─────────── TDZ 结束   │
│   let x = 'value';          │
│   // 可以正常访问 x          │
│ }                           │
└─────────────────────────────┘
`);

// typeof 也会触发 TDZ
// console.log(typeof tdzTest); // ReferenceError
let tdzTest = 'test';

// ========== 5. 最佳实践 ==========
console.log('5. 最佳实践');

console.log(`
使用规则:
1. 默认使用 const
2. 需要重新赋值时使用 let
3. 完全避免使用 var

const arr = [];
arr.push(1);    // ✓ 修改内容可以
arr = [1, 2];   // ✗ 重新赋值不行

const obj = {};
obj.name = 'x'; // ✓ 修改属性可以
obj = {};       // ✗ 重新赋值不行
`);

// ========== 6. 块级作用域应用 ==========
console.log('6. 块级作用域应用');

// 立即执行函数 (IIFE) 可以用块级作用域替代
// 旧写法
(function() {
    var privateVar = 'IIFE 私有';
})();

// 新写法
{
    let privateVar = '块级作用域私有';
    // 在这里可以访问
}
// 外部无法访问

// 条件声明
const condition = true;
let result;

if (condition) {
    const temp = '临时值';
    result = temp.toUpperCase();
}
// temp 在这里无法访问，避免变量污染

console.log('条件声明结果:', result);

// ========== 7. 循环中的闭包问题 ==========
console.log('\n7. 循环中的闭包问题');

// var 的问题
const funcsVar = [];
for (var k = 0; k < 3; k++) {
    funcsVar.push(() => k);
}
console.log('var 循环:', funcsVar.map(f => f())); // [3, 3, 3]

// let 的解决
const funcsLet = [];
for (let m = 0; m < 3; m++) {
    funcsLet.push(() => m);
}
console.log('let 循环:', funcsLet.map(f => f())); // [0, 1, 2]

console.log('\n=== let/const 完成 ===');
