// ES6+ 解构赋值
// 运行: node 02-destructuring.js

console.log('=== 解构赋值 ===\n');

// ========== 1. 数组解构 ==========
console.log('1. 数组解构');

// 基本解构
const colors = ['red', 'green', 'blue'];
const [first, second, third] = colors;
console.log('基本:', first, second, third);

// 跳过元素
const [a, , c] = [1, 2, 3];
console.log('跳过:', a, c); // 1, 3

// 剩余元素
const [head, ...tail] = [1, 2, 3, 4, 5];
console.log('剩余:', head, tail); // 1, [2, 3, 4, 5]

// 默认值
const [x = 10, y = 20] = [1];
console.log('默认值:', x, y); // 1, 20

// 交换变量
let m = 1, n = 2;
[m, n] = [n, m];
console.log('交换:', m, n); // 2, 1

// 嵌套解构
const nested = [1, [2, 3], 4];
const [p, [q, r], s] = nested;
console.log('嵌套:', p, q, r, s); // 1, 2, 3, 4

// ========== 2. 对象解构 ==========
console.log('\n2. 对象解构');

const user = {
    name: '张三',
    age: 25,
    email: 'zhangsan@example.com'
};

// 基本解构
const { name, age } = user;
console.log('基本:', name, age);

// 重命名
const { name: userName, age: userAge } = user;
console.log('重命名:', userName, userAge);

// 默认值
const { name: n1, gender = '未知' } = user;
console.log('默认值:', n1, gender);

// 重命名 + 默认值
const { phone: userPhone = 'N/A' } = user;
console.log('重命名+默认:', userPhone);

// 嵌套对象解构
const company = {
    name: '科技公司',
    address: {
        city: '北京',
        street: '中关村'
    }
};

const { address: { city, street } } = company;
console.log('嵌套:', city, street);

// 剩余属性
const { name: companyName, ...rest } = company;
console.log('剩余:', companyName, rest);

// ========== 3. 函数参数解构 ==========
console.log('\n3. 函数参数解构');

// 数组参数
function sum([a, b, c = 0]) {
    return a + b + c;
}
console.log('数组参数:', sum([1, 2])); // 3

// 对象参数
function greet({ name, greeting = 'Hello' }) {
    return `${greeting}, ${name}!`;
}
console.log('对象参数:', greet({ name: '李四' }));

// 复杂参数解构
function createUser({
    name,
    age = 18,
    email,
    address: { city = '未知' } = {}
} = {}) {
    return { name, age, email, city };
}

console.log('复杂参数:', createUser({ name: '王五', email: 'w@e.com' }));

// ========== 4. 混合解构 ==========
console.log('\n4. 混合解构');

const data = {
    title: '标题',
    items: [
        { id: 1, name: '项目1' },
        { id: 2, name: '项目2' }
    ]
};

// 解构对象和数组
const { title, items: [firstItem, secondItem] } = data;
console.log('混合:', title, firstItem.name, secondItem.name);

// 更复杂的混合
const response = {
    status: 200,
    data: {
        users: [
            { id: 1, name: '用户1', scores: [85, 90, 88] },
            { id: 2, name: '用户2', scores: [92, 88, 95] }
        ]
    }
};

const {
    status,
    data: {
        users: [
            { name: firstUserName, scores: [firstScore] },
            { name: secondUserName }
        ]
    }
} = response;

console.log('复杂混合:', status, firstUserName, firstScore, secondUserName);

// ========== 5. 实际应用场景 ==========
console.log('\n5. 实际应用场景');

// 导入模块时解构
// const { useState, useEffect } = require('react');

// 函数返回多个值
function getMinMax(arr) {
    return [Math.min(...arr), Math.max(...arr)];
}
const [min, max] = getMinMax([3, 1, 4, 1, 5, 9]);
console.log('多返回值:', min, max);

// 配置对象
function initApp({
    debug = false,
    port = 3000,
    hostname = 'localhost'
} = {}) {
    console.log('配置:', { debug, port, hostname });
}
initApp({ port: 8080 });

// API 响应处理
const apiResponse = {
    success: true,
    data: { userId: 1, token: 'abc123' },
    message: 'Login successful'
};

const { success, data: { userId, token }, message } = apiResponse;
console.log('API 响应:', success, userId, token);

// ========== 6. 解构陷阱 ==========
console.log('\n6. 解构陷阱');

// 解构 null/undefined 会报错
// const { prop } = null; // TypeError

// 安全解构
const safeObj = null;
const { prop = 'default' } = safeObj || {};
console.log('安全解构:', prop);

// 解构时要注意已声明的变量
let existingVar;
// { existingVar } = { existingVar: 'value' }; // SyntaxError
({ existingVar } = { existingVar: 'value' }); // 需要括号
console.log('已声明变量:', existingVar);

console.log('\n=== 解构赋值完成 ===');
