/**
 * 本地存储模块
 * 负责数据的持久化存储和读取
 */

const STORAGE_KEY = 'todo-app-data';
const THEME_KEY = 'todo-app-theme';

/**
 * 存储管理器
 */
export const storage = {
    /**
     * 获取所有待办事项
     * @returns {Array} 待办事项数组
     */
    getTodos() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('读取数据失败:', error);
            return [];
        }
    },

    /**
     * 保存所有待办事项
     * @param {Array} todos - 待办事项数组
     */
    saveTodos(todos) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
        } catch (error) {
            console.error('保存数据失败:', error);
        }
    },

    /**
     * 获取主题设置
     * @returns {string} 主题名称 ('light' | 'dark')
     */
    getTheme() {
        return localStorage.getItem(THEME_KEY) || 'light';
    },

    /**
     * 保存主题设置
     * @param {string} theme - 主题名称
     */
    saveTheme(theme) {
        localStorage.setItem(THEME_KEY, theme);
    },

    /**
     * 清除所有数据
     */
    clear() {
        localStorage.removeItem(STORAGE_KEY);
    }
};

export default storage;
