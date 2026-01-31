// JavaScript 变量与数据类型
// 运行: node 01-variables.js

console.log('=== JavaScript 变量与数据类型 ===\n');

// ========== 1. 变量声明 ==========
console.log('1. 变量声明 (var / let / const)');

// var - 函数作用域，存在变量提升
var varVariable = 'var 声明';
console.log('var:', varVariable);

// let - 块级作用域，不能重复声明
let letVariable = 'let 声明';
console.log('let:', letVariable);

// const - 块级作用域，必须初始化，不能重新赋值
const constVariable = 'const 声明';
console.log('const:', constVariable);

// 变量提升示例
console.log('\n变量提升:');
console.log('hoisted 变量 (提升前访问):', typeof hoisted); // undefined
var hoisted = '已提升';
// console.log(notHoisted); // ReferenceError: let/const 无变量提升
let notHoisted = '未提升';

// ========== 2. 数据类型 ==========
console.log('\n2. 数据类型');

// 7种原始类型
const string = 'Hello';           // String
const number = 42;                // Number (包含整数和浮点数)
const bigint = 9007199254740991n; // BigInt
const boolean = true;             // Boolean
const nullValue = null;           // null
const undefinedValue = undefined; // undefined
const symbol = Symbol('id');      // Symbol

console.log('原始类型:');
console.log('  string:', typeof string, '-', string);
console.log('  number:', typeof number, '-', number);
console.log('  bigint:', typeof bigint, '-', String(bigint));
console.log('  boolean:', typeof boolean, '-', boolean);
console.log('  null:', typeof nullValue, '-', nullValue); // typeof null 是 'object' (历史遗留bug)
console.log('  undefined:', typeof undefinedValue, '-', undefinedValue);
console.log('  symbol:', typeof symbol, '-', symbol.toString());

// 引用类型
const object = { name: '对象' };
const array = [1, 2, 3];
const func = function() {};
const date = new Date();
const regex = /pattern/g;

console.log('\n引用类型:');
console.log('  object:', typeof object, '-', object);
console.log('  array:', typeof array, '-', array, '(Array.isArray:', Array.isArray(array) + ')');
console.log('  function:', typeof func);
console.log('  date:', typeof date, '-', date.constructor.name);
console.log('  regex:', typeof regex, '-', regex.constructor.name);

// ========== 3. 类型转换 ==========
console.log('\n3. 类型转换');

// 显式转换
console.log('显式转换:');
console.log('  String(123):', String(123), typeof String(123));
console.log('  Number("456"):', Number("456"), typeof Number("456"));
console.log('  Boolean(1):', Boolean(1), typeof Boolean(1));
console.log('  parseInt("10px"):', parseInt("10px"));
console.log('  parseFloat("3.14abc"):', parseFloat("3.14abc"));

// 隐式转换
console.log('\n隐式转换:');
console.log('  "5" + 3:', "5" + 3);       // "53" (字符串拼接)
console.log('  "5" - 3:', "5" - 3);       // 2 (转为数字)
console.log('  "5" * "2":', "5" * "2");   // 10
console.log('  [] + []:', [] + []);       // "" (空字符串)
console.log('  [] + {}:', [] + {});       // "[object Object]"
console.log('  {} + []:', {} + []);       // 0 或 "[object Object]" (取决于上下文)

// 假值 (Falsy values)
console.log('\n假值 (Falsy):');
const falsyValues = [false, 0, -0, 0n, '', null, undefined, NaN];
falsyValues.forEach(v => console.log(`  Boolean(${JSON.stringify(v)}):`, Boolean(v)));

// ========== 4. 相等性比较 ==========
console.log('\n4. 相等性比较');

console.log('== (宽松相等，会类型转换):');
console.log('  5 == "5":', 5 == '5');         // true
console.log('  null == undefined:', null == undefined); // true
console.log('  0 == false:', 0 == false);     // true

console.log('\n=== (严格相等，不转换类型):');
console.log('  5 === "5":', 5 === '5');       // false
console.log('  null === undefined:', null === undefined); // false
console.log('  0 === false:', 0 === false);   // false

console.log('\nObject.is() (更严格):');
console.log('  NaN === NaN:', NaN === NaN);   // false
console.log('  Object.is(NaN, NaN):', Object.is(NaN, NaN)); // true
console.log('  -0 === +0:', -0 === +0);       // true
console.log('  Object.is(-0, +0):', Object.is(-0, +0)); // false

// ========== 5. 值传递 vs 引用传递 ==========
console.log('\n5. 值传递 vs 引用传递');

// 原始类型：按值传递
let a = 10;
let b = a;
b = 20;
console.log('原始类型: a =', a, ', b =', b); // a = 10, b = 20

// 引用类型：按引用传递
const obj1 = { value: 10 };
const obj2 = obj1;
obj2.value = 20;
console.log('引用类型: obj1.value =', obj1.value, ', obj2.value =', obj2.value); // 都是 20

// 如何复制对象
const original = { a: 1, b: { c: 2 } };
const shallowCopy = { ...original };
const deepCopy = JSON.parse(JSON.stringify(original));

shallowCopy.b.c = 999;
console.log('\n浅拷贝后修改嵌套属性:');
console.log('  original.b.c:', original.b.c);   // 999 (被影响)
console.log('  shallowCopy.b.c:', shallowCopy.b.c); // 999

console.log('\n=== 变量与数据类型完成 ===');
