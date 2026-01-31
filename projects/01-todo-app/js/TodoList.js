/**
 * TodoList 核心类
 * 负责待办事项的所有业务逻辑
 */

import { storage } from './storage.js';

/**
 * 生成唯一 ID
 * @returns {string}
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * TodoList 类
 */
export class TodoList {
    constructor() {
        // DOM 元素
        this.form = document.getElementById('todoForm');
        this.input = document.getElementById('todoInput');
        this.list = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.filterTabs = document.getElementById('filterTabs');
        this.todoCount = document.getElementById('todoCount');
        this.clearCompletedBtn = document.getElementById('clearCompleted');
        
        // 编辑模态框
        this.editModal = document.getElementById('editModal');
        this.editInput = document.getElementById('editInput');
        this.modalClose = document.getElementById('modalClose');
        this.modalCancel = document.getElementById('modalCancel');
        this.modalSave = document.getElementById('modalSave');
        
        // 状态
        this.todos = [];
        this.currentFilter = 'all';
        this.editingId = null;
        
        // 初始化
        this.init();
    }

    /**
     * 初始化
     */
    init() {
        // 加载数据
        this.todos = storage.getTodos();
        
        // 绑定事件
        this.bindEvents();
        
        // 渲染列表
        this.render();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 表单提交
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo();
        });

        // 列表点击（事件委托）
        this.list.addEventListener('click', (e) => {
            const item = e.target.closest('.todo-item');
            if (!item) return;

            const id = item.dataset.id;

            // 复选框点击
            if (e.target.closest('.todo-checkbox')) {
                this.toggleTodo(id);
            }
            // 编辑按钮
            else if (e.target.closest('.btn-edit')) {
                this.openEditModal(id);
            }
            // 删除按钮
            else if (e.target.closest('.btn-delete')) {
                this.deleteTodo(id, item);
            }
        });

        // 筛选标签
        this.filterTabs.addEventListener('click', (e) => {
            const tab = e.target.closest('.filter-tab');
            if (!tab) return;

            const filter = tab.dataset.filter;
            this.setFilter(filter);
        });

        // 清除已完成
        this.clearCompletedBtn.addEventListener('click', () => {
            this.clearCompleted();
        });

        // 模态框事件
        this.modalClose.addEventListener('click', () => this.closeEditModal());
        this.modalCancel.addEventListener('click', () => this.closeEditModal());
        this.modalSave.addEventListener('click', () => this.saveEdit());
        
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) {
                this.closeEditModal();
            }
        });

        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.editModal.classList.contains('visible')) {
                this.closeEditModal();
            }
            if (e.key === 'Enter' && this.editModal.classList.contains('visible')) {
                this.saveEdit();
            }
        });
    }

    /**
     * 添加待办事项
     */
    addTodo() {
        const text = this.input.value.trim();
        if (!text) return;

        const todo = {
            id: generateId(),
            text,
            completed: false,
            createdAt: Date.now()
        };

        this.todos.unshift(todo);
        this.save();
        this.render();
        
        this.input.value = '';
        this.input.focus();
    }

    /**
     * 切换完成状态
     * @param {string} id
     */
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.save();
            this.render();
        }
    }

    /**
     * 删除待办事项
     * @param {string} id
     * @param {HTMLElement} element
     */
    deleteTodo(id, element) {
        // 添加删除动画
        element.classList.add('removing');
        
        setTimeout(() => {
            this.todos = this.todos.filter(t => t.id !== id);
            this.save();
            this.render();
        }, 300);
    }

    /**
     * 打开编辑模态框
     * @param {string} id
     */
    openEditModal(id) {
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        this.editingId = id;
        this.editInput.value = todo.text;
        this.editModal.classList.add('visible');
        this.editInput.focus();
        this.editInput.select();
    }

    /**
     * 关闭编辑模态框
     */
    closeEditModal() {
        this.editModal.classList.remove('visible');
        this.editingId = null;
        this.editInput.value = '';
    }

    /**
     * 保存编辑
     */
    saveEdit() {
        const text = this.editInput.value.trim();
        if (!text || !this.editingId) return;

        const todo = this.todos.find(t => t.id === this.editingId);
        if (todo) {
            todo.text = text;
            this.save();
            this.render();
        }

        this.closeEditModal();
    }

    /**
     * 设置筛选条件
     * @param {string} filter - 'all' | 'active' | 'completed'
     */
    setFilter(filter) {
        this.currentFilter = filter;
        
        // 更新标签激活状态
        this.filterTabs.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === filter);
        });
        
        this.render();
    }

    /**
     * 清除所有已完成的任务
     */
    clearCompleted() {
        const completedItems = this.list.querySelectorAll('.todo-item.completed');
        
        if (completedItems.length === 0) return;
        
        completedItems.forEach(item => {
            item.classList.add('removing');
        });
        
        setTimeout(() => {
            this.todos = this.todos.filter(t => !t.completed);
            this.save();
            this.render();
        }, 300);
    }

    /**
     * 获取筛选后的待办事项
     * @returns {Array}
     */
    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    /**
     * 渲染列表
     */
    render() {
        const filteredTodos = this.getFilteredTodos();
        
        // 渲染列表
        this.list.innerHTML = filteredTodos.map(todo => this.createTodoHTML(todo)).join('');
        
        // 更新空状态
        this.emptyState.classList.toggle('visible', filteredTodos.length === 0);
        
        // 更新计数
        this.updateCount();
    }

    /**
     * 创建待办事项 HTML
     * @param {Object} todo
     * @returns {string}
     */
    createTodoHTML(todo) {
        return `
            <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                <div class="todo-checkbox" role="checkbox" aria-checked="${todo.completed}" tabindex="0"></div>
                <span class="todo-text">${this.escapeHTML(todo.text)}</span>
                <div class="todo-actions">
                    <button class="btn btn-icon-only btn-edit" aria-label="编辑">✏️</button>
                    <button class="btn btn-icon-only btn-delete" aria-label="删除">🗑️</button>
                </div>
            </li>
        `;
    }

    /**
     * 转义 HTML 特殊字符
     * @param {string} text
     * @returns {string}
     */
    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 更新任务计数
     */
    updateCount() {
        const activeCount = this.todos.filter(t => !t.completed).length;
        const completedCount = this.todos.filter(t => t.completed).length;
        
        this.todoCount.textContent = `${activeCount} 项待完成`;
        
        // 根据是否有已完成任务显示/隐藏清除按钮
        this.clearCompletedBtn.style.visibility = completedCount > 0 ? 'visible' : 'hidden';
    }

    /**
     * 保存到本地存储
     */
    save() {
        storage.saveTodos(this.todos);
    }
}

export default TodoList;
