#!/bin/bash

# Husky + lint-staged + Commitlint 一键配置脚本
# 运行: bash 04-husky-setup.sh
# 注意: 需要在项目根目录执行，且已有 package.json

set -e

echo "============================================"
echo "  Husky + lint-staged + Commitlint 配置"
echo "============================================"
echo ""

# ========== 1. 检查前置条件 ==========
echo "📋 1. 检查前置条件..."

if [ ! -f "package.json" ]; then
  echo "❌ 未找到 package.json，请在项目根目录执行"
  exit 1
fi

if ! command -v pnpm &> /dev/null; then
  echo "⚠️  未找到 pnpm，使用 npm 替代"
  PKG_MGR="npm"
  INSTALL_CMD="npm install -D"
  EXEC_CMD="npx"
else
  PKG_MGR="pnpm"
  INSTALL_CMD="pnpm add -D"
  EXEC_CMD="pnpm exec"
fi

echo "✅ 使用 $PKG_MGR 作为包管理器"
echo ""

# ========== 2. 安装依赖 ==========
echo "📦 2. 安装依赖..."
echo "   - husky (Git Hooks 管理)"
echo "   - lint-staged (暂存文件检查)"
echo "   - @commitlint/cli (Commit 校验)"
echo "   - @commitlint/config-conventional (规范配置)"
echo ""

$INSTALL_CMD husky lint-staged @commitlint/cli @commitlint/config-conventional

echo ""
echo "✅ 依赖安装完成"
echo ""

# ========== 3. 初始化 Husky ==========
echo "🐶 3. 初始化 Husky..."

$EXEC_CMD husky init

echo "✅ Husky 初始化完成"
echo ""

# ========== 4. 创建 pre-commit hook ==========
echo "📝 4. 配置 pre-commit hook (lint-staged)..."

cat > .husky/pre-commit << 'EOF'
npx lint-staged
EOF

echo "✅ pre-commit hook 已创建:"
echo "   .husky/pre-commit → 运行 lint-staged"
echo ""

# ========== 5. 创建 commit-msg hook ==========
echo "📝 5. 配置 commit-msg hook (commitlint)..."

cat > .husky/commit-msg << 'EOF'
npx --no -- commitlint --edit "$1"
EOF

echo "✅ commit-msg hook 已创建:"
echo "   .husky/commit-msg → 运行 commitlint"
echo ""

# ========== 6. 创建 lint-staged 配置 ==========
echo "📝 6. 创建 lint-staged 配置..."

cat > .lintstagedrc.json << 'EOF'
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix --max-warnings 0",
    "prettier --write"
  ],
  "*.{css,scss,less}": [
    "prettier --write"
  ],
  "*.{json,md,yml,yaml}": [
    "prettier --write"
  ]
}
EOF

echo "✅ .lintstagedrc.json 已创建"
echo ""

# ========== 7. 创建 commitlint 配置 ==========
echo "📝 7. 创建 commitlint 配置..."

cat > commitlint.config.js << 'EOF'
// Conventional Commits 规范
// 格式: <type>(<scope>): <subject>
// 示例: feat(auth): 添加登录功能

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2, // error
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复 Bug
        'docs',     // 文档变更
        'style',    // 代码格式 (不影响逻辑)
        'refactor', // 重构 (既非新增也非修复)
        'perf',     // 性能优化
        'test',     // 测试相关
        'build',    // 构建系统或外部依赖
        'ci',       // CI 配置
        'chore',    // 其他杂项
        'revert',   // 回滚
      ],
    ],
    // 允许中文 subject
    'subject-case': [0],
    // subject 不为空
    'subject-empty': [2, 'never'],
    // type 不为空
    'type-empty': [2, 'never'],
  },
};
EOF

echo "✅ commitlint.config.js 已创建"
echo ""

# ========== 8. 添加 prepare 脚本 ==========
echo "📝 8. 检查 prepare 脚本..."

if grep -q '"prepare"' package.json; then
  echo "✅ prepare 脚本已存在"
else
  # 使用 npm pkg set 添加
  npm pkg set scripts.prepare="husky" 2>/dev/null || echo "⚠️ 请手动添加 prepare 脚本"
  echo "✅ prepare 脚本已添加"
fi

echo ""

# ========== 9. 最终结构 ==========
echo "============================================"
echo "  ✅ 配置完成！最终文件结构:"
echo "============================================"
echo ""
echo "  .husky/"
echo "  ├── pre-commit          # 提交前运行 lint-staged"
echo "  └── commit-msg          # 检查 Commit 信息格式"
echo "  .lintstagedrc.json      # lint-staged 配置"
echo "  commitlint.config.js    # commitlint 配置"
echo ""

# ========== 10. 使用说明 ==========
echo "============================================"
echo "  📖 使用说明"
echo "============================================"
echo ""
echo "  ✅ 合法提交:"
echo "    git commit -m 'feat: 添加用户登录'"
echo "    git commit -m 'fix(auth): 修复 token 过期'"
echo "    git commit -m 'docs: 更新 README'"
echo "    git commit -m 'refactor: 重构组件结构'"
echo ""
echo "  ❌ 非法提交 (会被拦截):"
echo "    git commit -m '修复了一个 bug'"
echo "    git commit -m 'update'"
echo "    git commit -m 'Feature: 新功能'"
echo ""
echo "  Commit Type 说明:"
echo "    feat     → 新功能"
echo "    fix      → 修复 Bug"
echo "    docs     → 文档变更"
echo "    style    → 代码格式"
echo "    refactor → 重构"
echo "    perf     → 性能优化"
echo "    test     → 测试相关"
echo "    build    → 构建系统"
echo "    ci       → CI 配置"
echo "    chore    → 杂项"
echo "    revert   → 回滚"
echo ""
echo "============================================"
echo "  🎉 全部完成！开始提交代码吧"
echo "============================================"
