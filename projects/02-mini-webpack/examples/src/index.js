// 示例项目入口文件
// 这个文件使用 ESM 语法，Mini Webpack 会将它转换为 CJS 并打包

import greeting from './greeting';
import { add, multiply } from './utils/math';
import config from './data.json';
import './style.css';

// 使用导入的模块
console.log(greeting('Mini Webpack'));
console.log(`加法: 2 + 3 = ${add(2, 3)}`);
console.log(`乘法: 4 * 5 = ${multiply(4, 5)}`);
console.log(`配置: ${config.name} v${config.version}`);
console.log('🎉 打包成功！所有模块正常工作！');
