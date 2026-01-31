/**
 * Todo App 应用入口
 * 初始化应用的各个模块
 */

import { TodoList } from './TodoList.js';
import { theme } from './theme.js';

/**
 * 应用初始化
 */
function initApp() {
    // 初始化主题
    theme.init();
    
    // 初始化待办事项列表
    const todoList = new TodoList();
    
    // 开发调试：暴露到全局
    if (import.meta.env?.DEV) {
        window.todoList = todoList;
    }
    
    console.log('📝 Todo App 已启动');
}

// DOM 加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
