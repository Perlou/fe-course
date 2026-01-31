// ES6+ 模块化
// 注意: ES Modules 需要在 package.json 中设置 "type": "module"
// 或者使用 .mjs 扩展名

console.log('=== ES Modules 模块化 ===\n');

// ========== 1. 导出方式 ==========
console.log('1. 导出方式');

console.log(`
// 方式1: 命名导出 (Named Exports)
export const name = '张三';
export function greet() { }
export class User { }

// 方式2: 批量导出
const a = 1;
const b = 2;
export { a, b };

// 方式3: 重命名导出
export { a as alpha, b as beta };

// 方式4: 默认导出 (每个模块只能有一个)
export default class App { }
`);

// ========== 2. 导入方式 ==========
console.log('2. 导入方式');

console.log(`
// 导入命名导出
import { name, greet } from './module.js';

// 重命名导入
import { name as userName } from './module.js';

// 导入全部命名导出到一个对象
import * as Module from './module.js';
console.log(Module.name);

// 导入默认导出
import App from './module.js';

// 同时导入默认和命名导出
import App, { name, greet } from './module.js';

// 只执行模块代码，不导入任何值
import './side-effects.js';
`);

// ========== 3. 动态导入 ==========
console.log('3. 动态导入 (Dynamic Import)');

console.log(`
// 动态导入返回 Promise
const module = await import('./module.js');

// 条件导入
if (condition) {
    const { feature } = await import('./feature.js');
}

// 按需加载
button.addEventListener('click', async () => {
    const { showModal } = await import('./modal.js');
    showModal();
});
`);

// ========== 4. 模块特性 ==========
console.log('4. 模块特性');

console.log(`
ES Modules 特性:
1. 自动严格模式 ('use strict')
2. 模块级作用域 (变量不会污染全局)
3. 同一模块只会执行一次 (单例)
4. 静态结构 (编译时确定依赖)
5. 支持 Tree Shaking

// this 是 undefined (不是 window)
console.log(this); // undefined in module

// 循环依赖处理
// moduleA 导入 moduleB，moduleB 又导入 moduleA
// ES Modules 通过"绑定"而非"值"传递来解决
`);

// ========== 5. CommonJS vs ES Modules ==========
console.log('5. CommonJS vs ES Modules');

console.log(`
┌─────────────────────┬─────────────────────────────────────┐
│       特性          │   CommonJS         │   ES Modules   │
├─────────────────────┼────────────────────┼────────────────┤
│ 语法                │ require/exports    │ import/export  │
│ 加载时机            │ 运行时             │ 编译时         │
│ 加载方式            │ 同步               │ 异步           │
│ 输出                │ 值的拷贝           │ 值的引用       │
│ this               │ 当前模块           │ undefined      │
│ 循环依赖            │ 加载已执行的部分    │ 支持 (绑定)    │
│ Tree Shaking       │ 困难               │ 原生支持       │
└─────────────────────┴────────────────────┴────────────────┘

// CommonJS (Node.js 传统方式)
const fs = require('fs');
module.exports = { name: 'module' };
exports.name = 'module';

// ES Modules
import fs from 'fs';
export const name = 'module';
export default name;
`);

// ========== 6. 实际项目结构 ==========
console.log('6. 实际项目结构');

console.log(`
src/
├── index.js          # 入口文件
├── utils/
│   ├── index.js      # 桶文件 (barrel)
│   ├── string.js
│   └── number.js
├── components/
│   ├── index.js
│   ├── Button.js
│   └── Modal.js
└── services/
    ├── index.js
    └── api.js

// utils/string.js
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// utils/number.js
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// utils/index.js (桶文件)
export * from './string.js';
export * from './number.js';
// 或者重新导出
export { capitalize } from './string.js';
export { clamp } from './number.js';

// 使用
import { capitalize, clamp } from './utils/index.js';
// 简写
import { capitalize, clamp } from './utils';
`);

// ========== 7. 浏览器中使用 ==========
console.log('7. 浏览器中使用');

console.log(`
<!-- HTML 中使用 ES Modules -->
<script type="module" src="./main.js"></script>

<!-- 内联模块 -->
<script type="module">
    import { greet } from './utils.js';
    greet();
</script>

<!-- 不支持模块的浏览器备用 -->
<script nomodule src="./fallback.js"></script>

<!-- 导入映射 (Import Maps) -->
<script type="importmap">
{
    "imports": {
        "lodash": "/node_modules/lodash-es/lodash.js",
        "@utils/": "/src/utils/"
    }
}
</script>
<script type="module">
    import _ from 'lodash';
    import { capitalize } from '@utils/string.js';
</script>
`);

// ========== 8. 模块模式示例代码 ==========
console.log('8. 模块模式示例');

// 模拟模块导出
const MathModule = {
    PI: 3.14159,
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
    multiply: (a, b) => a * b,
    divide: (a, b) => a / b
};

// 模拟导入使用
const { PI, add, multiply } = MathModule;
console.log('PI:', PI);
console.log('add(2, 3):', add(2, 3));
console.log('multiply(4, 5):', multiply(4, 5));

console.log('\n=== ES Modules 完成 ===');
