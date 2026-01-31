/**
 * 主题切换模块
 * 负责深色/浅色主题的切换和持久化
 */

import { storage } from './storage.js';

/**
 * 主题管理器
 */
export const theme = {
    currentTheme: 'light',
    toggleButton: null,
    themeIcon: null,

    /**
     * 初始化主题
     */
    init() {
        this.toggleButton = document.getElementById('themeToggle');
        this.themeIcon = this.toggleButton?.querySelector('.theme-icon');
        
        // 加载保存的主题
        this.currentTheme = storage.getTheme();
        this.apply(this.currentTheme);
        
        // 绑定切换事件
        this.toggleButton?.addEventListener('click', () => this.toggle());
        
        // 监听系统主题变化
        this.watchSystemTheme();
    },

    /**
     * 应用主题
     * @param {string} themeName - 主题名称
     */
    apply(themeName) {
        this.currentTheme = themeName;
        document.documentElement.setAttribute('data-theme', themeName);
        this.updateIcon();
        storage.saveTheme(themeName);
    },

    /**
     * 切换主题
     */
    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.apply(newTheme);
    },

    /**
     * 更新主题图标
     */
    updateIcon() {
        if (this.themeIcon) {
            this.themeIcon.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        }
    },

    /**
     * 监听系统主题变化
     */
    watchSystemTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // 如果没有保存的主题，则跟随系统
        if (!localStorage.getItem('todo-app-theme')) {
            this.apply(mediaQuery.matches ? 'dark' : 'light');
        }
        
        // 监听变化
        mediaQuery.addEventListener('change', (e) => {
            // 只有在用户没有手动设置时才跟随系统
            // 这里我们选择不自动跟随，用户手动切换优先
        });
    }
};

export default theme;
