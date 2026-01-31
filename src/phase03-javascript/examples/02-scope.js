// JavaScript 作用域
// 运行: node 02-scope.js

console.log('=== JavaScript 作用域 ===\n');

// ========== 1. 全局作用域 ==========
console.log('1. 全局作用域');

var globalVar = '全局 var';
let globalLet = '全局 let';
const globalConst = '全局 const';

// 在浏览器中，var 声明的变量会成为 window 属性
// 在 Node.js 中，模块有自己的作用域

console.log('全局变量:', globalVar, globalLet, globalConst);

// ========== 2. 函数作用域 ==========
console.log('\n2. 函数作用域');

function functionScope() {
    var funcVar = '函数内 var';
    let funcLet = '函数内 let';
    const funcConst = '函数内 const';
    
    console.log('函数内部:', funcVar, funcLet, funcConst);
}

functionScope();
// console.log(funcVar); // ReferenceError: funcVar is not defined

// var 的函数作用域
function varScope() {
    if (true) {
        var insideIf = 'var 在 if 内声明';
    }
    console.log('var 穿透 if 块:', insideIf); // 可以访问
}
varScope();

// ========== 3. 块级作用域 ==========
console.log('\n3. 块级作用域 (let/const)');

{
    var blockVar = 'var 不受块限制';
    let blockLet = 'let 块级作用域';
    const blockConst = 'const 块级作用域';
    console.log('块内:', blockLet, blockConst);
}
console.log('块外访问 var:', blockVar);
// console.log(blockLet); // ReferenceError

// for 循环中的块级作用域
console.log('\nfor 循环中的作用域:');

// var - 共享同一个变量
for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log('var i:', i), 10);
}
// 输出: 3, 3, 3 (都是 3)

// let - 每次迭代创建新的绑定
for (let j = 0; j < 3; j++) {
    setTimeout(() => console.log('let j:', j), 20);
}
// 输出: 0, 1, 2

// ========== 4. 词法作用域 ==========
console.log('\n4. 词法作用域 (静态作用域)');

const outerValue = '外部值';

function outer() {
    const outerFuncValue = '外部函数值';
    
    function inner() {
        const innerValue = '内部值';
        // 可以访问外层作用域的变量
        console.log('inner 访问:', outerValue, outerFuncValue, innerValue);
    }
    
    inner();
    // console.log(innerValue); // ReferenceError
}

outer();

// 词法作用域 = 定义时确定，而非调用时
function printValue() {
    console.log('词法作用域中的 value:', value);
}

function wrapper() {
    const value = '包装函数内的值';
    // printValue 仍然查找定义时的作用域
    // printValue(); // 会报错，因为 value 在 printValue 定义时的作用域中不存在
}

// ========== 5. 作用域链 ==========
console.log('\n5. 作用域链');

const level0 = 'L0';

function level1() {
    const level1Var = 'L1';
    
    function level2() {
        const level2Var = 'L2';
        
        function level3() {
            const level3Var = 'L3';
            // 沿着作用域链向上查找
            console.log('作用域链查找:', level0, level1Var, level2Var, level3Var);
        }
        
        level3();
    }
    
    level2();
}

level1();

// 作用域链图解
console.log(`
作用域链图解:
┌──────────────────────────────────┐
│ 全局作用域                        │
│   level0 = 'L0'                  │
│   ┌────────────────────────────┐ │
│   │ level1 作用域               │ │
│   │   level1Var = 'L1'         │ │
│   │   ┌──────────────────────┐ │ │
│   │   │ level2 作用域         │ │ │
│   │   │   level2Var = 'L2'   │ │ │
│   │   │   ┌────────────────┐ │ │ │
│   │   │   │ level3 作用域   │ │ │ │
│   │   │   │  level3Var='L3'│ │ │ │
│   │   │   └────────────────┘ │ │ │
│   │   └──────────────────────┘ │ │
│   └────────────────────────────┘ │
└──────────────────────────────────┘
`);

// ========== 6. 变量遮蔽 ==========
console.log('6. 变量遮蔽 (Shadowing)');

const shadowVar = '外部';

function shadowDemo() {
    const shadowVar = '内部'; // 遮蔽外部的 shadowVar
    console.log('内部作用域:', shadowVar); // '内部'
}

shadowDemo();
console.log('外部作用域:', shadowVar); // '外部'

// ========== 7. 暂时性死区 (TDZ) ==========
console.log('\n7. 暂时性死区 (TDZ)');

// let/const 声明的变量在声明之前不可访问
function tdzDemo() {
    // console.log(tdzVar); // ReferenceError: Cannot access before initialization
    let tdzVar = 'TDZ 结束';
    console.log('TDZ 后访问:', tdzVar);
}

tdzDemo();

console.log(`
暂时性死区图解:
┌─────────────────────────────────┐
│  {                              │
│    // TDZ 开始 ─────────────    │
│    // 不能访问 x                  │
│    // TDZ 中...                  │
│    // ─────────────── TDZ 结束  │
│    let x = 'value';             │
│    // 可以正常访问 x              │
│  }                              │
└─────────────────────────────────┘
`);

console.log('\n=== 作用域完成 ===');
