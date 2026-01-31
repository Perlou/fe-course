// ES6+ 箭头函数
// 运行: node 03-arrow-functions.js

console.log('=== 箭头函数 ===\n');

// ========== 1. 基本语法 ==========
console.log('1. 基本语法');

// 传统函数
const add1 = function(a, b) {
    return a + b;
};

// 箭头函数
const add2 = (a, b) => {
    return a + b;
};

// 简写：单表达式，省略 return 和花括号
const add3 = (a, b) => a + b;

console.log('传统:', add1(1, 2));
console.log('箭头:', add2(1, 2));
console.log('简写:', add3(1, 2));

// ========== 2. 参数变体 ==========
console.log('\n2. 参数变体');

// 无参数
const greet = () => 'Hello!';
console.log('无参数:', greet());

// 单参数：可以省略括号
const double = x => x * 2;
console.log('单参数:', double(5));

// 多参数：必须有括号
const multiply = (a, b) => a * b;
console.log('多参数:', multiply(3, 4));

// 默认参数
const power = (base, exp = 2) => base ** exp;
console.log('默认参数:', power(3), power(3, 3));

// 剩余参数
const sum = (...nums) => nums.reduce((acc, n) => acc + n, 0);
console.log('剩余参数:', sum(1, 2, 3, 4, 5));

// ========== 3. 返回值变体 ==========
console.log('\n3. 返回值变体');

// 返回对象字面量：需要用括号包裹
const createUser = (name, age) => ({ name, age });
console.log('返回对象:', createUser('张三', 25));

// 多行函数体
const formatUser = user => {
    const { name, age } = user;
    return `${name} (${age}岁)`;
};
console.log('多行:', formatUser({ name: '李四', age: 30 }));

// ========== 4. this 绑定 ==========
console.log('\n4. this 绑定 (箭头函数没有自己的 this)');

// 传统函数有自己的 this
const obj1 = {
    name: '对象1',
    getName: function() {
        return this.name;
    },
    getNameDelayed: function() {
        setTimeout(function() {
            console.log('传统函数 this:', this.name); // undefined (this 丢失)
        }, 10);
    }
};

// 箭头函数继承外层 this
const obj2 = {
    name: '对象2',
    getName: function() {
        return this.name;
    },
    getNameDelayed: function() {
        setTimeout(() => {
            console.log('箭头函数 this:', this.name); // '对象2'
        }, 20);
    }
};

console.log('普通方法:', obj1.getName());
obj1.getNameDelayed();
obj2.getNameDelayed();

// ========== 5. 不能使用箭头函数的场景 ==========
console.log('\n5. 不能使用箭头函数的场景');

// 5.1 对象方法 (需要访问 this)
const badObj = {
    name: '错误示例',
    getName: () => this.name // ✗ this 不是 badObj
};

const goodObj = {
    name: '正确示例',
    getName() {             // ✓ 简写方法语法
        return this.name;
    }
};
console.log('对象方法:', goodObj.getName());

// 5.2 构造函数
// const Person = (name) => { this.name = name; }; // ✗ 箭头函数不能 new
function Person(name) {
    this.name = name;
}
console.log('构造函数:', new Person('王五').name);

// 5.3 需要 arguments 对象
function traditionalFunc() {
    console.log('arguments:', Array.from(arguments));
}
traditionalFunc(1, 2, 3);

const arrowFunc = (...args) => {
    console.log('rest params:', args); // 用剩余参数代替
};
arrowFunc(1, 2, 3);

// 5.4 动态上下文 (事件处理)
// button.addEventListener('click', function() {
//     console.log(this); // button 元素
// });
// button.addEventListener('click', () => {
//     console.log(this); // ✗ 不是 button
// });

// ========== 6. 高阶函数中的应用 ==========
console.log('\n6. 高阶函数中的应用');

const numbers = [1, 2, 3, 4, 5];

// map
const doubled = numbers.map(n => n * 2);
console.log('map:', doubled);

// filter
const evens = numbers.filter(n => n % 2 === 0);
console.log('filter:', evens);

// reduce
const total = numbers.reduce((acc, n) => acc + n, 0);
console.log('reduce:', total);

// 链式调用
const result = numbers
    .filter(n => n > 2)
    .map(n => n * 10)
    .reduce((acc, n) => acc + n, 0);
console.log('链式:', result);

// ========== 7. 立即执行箭头函数 (IIFE) ==========
console.log('\n7. 立即执行箭头函数');

const immediateResult = (() => {
    const privateValue = 42;
    return privateValue * 2;
})();
console.log('IIFE:', immediateResult);

// ========== 8. 柯里化 ==========
console.log('\n8. 柯里化');

// 传统方式
const addTraditional = function(a) {
    return function(b) {
        return function(c) {
            return a + b + c;
        };
    };
};

// 箭头函数更简洁
const addCurried = a => b => c => a + b + c;

console.log('传统柯里化:', addTraditional(1)(2)(3));
console.log('箭头柯里化:', addCurried(1)(2)(3));

// 实用示例：创建加法器
const createAdder = n => x => x + n;
const add10 = createAdder(10);
const add100 = createAdder(100);

console.log('add10(5):', add10(5));
console.log('add100(5):', add100(5));

console.log('\n=== 箭头函数完成 ===');
