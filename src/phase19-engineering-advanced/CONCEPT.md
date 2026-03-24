# 工程化进阶深入解析

## 📌 一、Monorepo 架构

### 1. pnpm workspace 配置

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

```json
// packages/ui/package.json
{
  "name": "@mylib/ui",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./button": {
      "import": "./dist/button/index.mjs",
      "require": "./dist/button/index.js"
    }
  },
  "dependencies": {
    "@mylib/utils": "workspace:*"
  }
}
```

### 2. Turborepo

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": { "outputs": [] },
    "dev": { "cache": false, "persistent": true }
  }
}
```

```bash
turbo run build               # 构建所有包 (自动拓扑排序)
turbo run test --filter=@mylib/ui  # 只测试 ui 包
turbo run dev --parallel       # 并行开发所有包
```

### 3. Monorepo vs Polyrepo

```
┌──────────────────────────────────────────────────────────┐
│            Monorepo vs Polyrepo                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Monorepo:                                               │
│  ├── 统一版本管理、原子提交                              │
│  ├── 共享配置 (ESLint, TSConfig, Jest)                   │
│  ├── 依赖关系清晰                                        │
│  └── 工具: pnpm workspaces + Turborepo / Nx              │
│                                                          │
│  Polyrepo:                                               │
│  ├── 独立发布、灵活技术栈                                │
│  ├── CI/CD 独立、权限隔离                                │
│  └── 适合: 大团队、微服务                                │
│                                                          │
│  常见 Monorepo 结构:                                     │
│  ├── packages/ui          # 组件库                       │
│  ├── packages/hooks       # 共享 Hooks                   │
│  ├── packages/utils       # 工具函数                     │
│  ├── packages/eslint-config  # 共享 ESLint               │
│  ├── apps/web             # Web 应用                     │
│  └── apps/docs            # 文档站点                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 📌 二、单元测试

### 1. Vitest 配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
});
```

### 2. 测试模式

```javascript
// 基础断言
expect(1 + 1).toBe(2);
expect({ a: 1 }).toEqual({ a: 1 });
expect([1, 2, 3]).toContain(2);
expect(() => { throw new Error('x'); }).toThrow('x');

// 异步测试
test('async', async () => {
  const data = await fetchUser(1);
  expect(data.name).toBe('Alice');
});

// Mock
const fn = vi.fn();
fn('hello');
expect(fn).toHaveBeenCalledWith('hello');
expect(fn).toHaveBeenCalledTimes(1);

// Mock 模块
vi.mock('./api', () => ({
  fetchUser: vi.fn().mockResolvedValue({ name: 'Alice' }),
}));

// Spy
const spy = vi.spyOn(console, 'log');
console.log('hello');
expect(spy).toHaveBeenCalledWith('hello');
spy.mockRestore();
```

### 3. 组件测试 (React Testing Library)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 4. Hook 测试

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('increments counter', () => {
    const { result } = renderHook(() => useCounter());
    act(() => { result.current.increment(); });
    expect(result.current.count).toBe(1);
  });

  it('decrements counter', () => {
    const { result } = renderHook(() => useCounter(10));
    act(() => { result.current.decrement(); });
    expect(result.current.count).toBe(9);
  });
});
```

---

## 📌 三、E2E 测试

### 1. Playwright 配置

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'pnpm dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
});
```

### 2. 测试用例

```typescript
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('successful login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome');
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrong');
    await page.click('button[type="submit"]');

    await expect(page.locator('.error')).toContainText('Invalid');
  });
});

test.describe('CRUD', () => {
  test('create and delete post', async ({ page }) => {
    await page.goto('/posts/new');
    await page.fill('#title', 'Test Post');
    await page.fill('#content', 'Test Content');
    await page.click('#submit');

    await expect(page.locator('.post-title')).toContainText('Test Post');

    await page.click('#delete');
    await expect(page.locator('.post-title')).not.toBeVisible();
  });
});
```

---

## 📌 四、组件库开发

### 1. 设计原则

```
┌──────────────────────────────────────────────────────┐
│              组件库设计原则                            │
├──────────────────────────────────────────────────────┤
│                                                      │
│  1. 单一职责 — 每个组件只做一件事                    │
│  2. 可组合性 — 小组件组合成复杂组件                  │
│  3. 可访问性 — 键盘导航 + ARIA 属性                  │
│  4. 可定制性 — 主题 + 样式覆盖 + variants            │
│  5. 类型安全 — 完善的 TypeScript 类型                │
│  6. 文档驱动 — Storybook 自动文档                    │
│  7. 测试覆盖 — 单元测试 + 视觉回归                  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 2. 组件目录结构

```
packages/ui/
├── src/
│   ├── button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   ├── Button.stories.tsx
│   │   ├── button.module.css
│   │   └── index.ts
│   ├── input/
│   │   ├── Input.tsx
│   │   └── ...
│   ├── theme/
│   │   ├── tokens.css        # Design Tokens
│   │   └── ThemeProvider.tsx
│   └── index.ts              # 统一导出
├── package.json
└── tsconfig.json
```

### 3. Design Tokens

```css
/* tokens.css */
:root {
  /* 颜色 */
  --color-primary: hsl(220, 90%, 56%);
  --color-primary-hover: hsl(220, 90%, 48%);
  --color-danger: hsl(0, 72%, 51%);
  --color-success: hsl(142, 71%, 45%);

  /* 间距 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;

  /* 圆角 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;

  /* 字体 */
  --font-sm: 14px;
  --font-md: 16px;
  --font-lg: 18px;

  /* 阴影 */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
}
```

### 4. Storybook

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { variant: 'primary', children: 'Button' } };
export const Secondary: Story = { args: { variant: 'secondary', children: 'Button' } };
export const Disabled: Story = { args: { disabled: true, children: 'Disabled' } };
```

---

## 📌 五、版本管理

### 1. 语义化版本

```
┌───────────────────────────────────────────────────────┐
│          Semantic Versioning (SemVer)                   │
├───────────────────────────────────────────────────────┤
│                                                       │
│  版本号: MAJOR.MINOR.PATCH                             │
│                                                       │
│  MAJOR — 不兼容的 API 变更     1.0.0 → 2.0.0          │
│  MINOR — 向后兼容的新功能      1.0.0 → 1.1.0          │
│  PATCH — 向后兼容的缺陷修复    1.0.0 → 1.0.1          │
│                                                       │
│  预发布: 1.0.0-alpha.1, 1.0.0-beta.1, 1.0.0-rc.1     │
│                                                       │
│  范围: ^1.2.3 (>=1.2.3 <2.0.0)                       │
│        ~1.2.3 (>=1.2.3 <1.3.0)                       │
│                                                       │
└───────────────────────────────────────────────────────┘
```

### 2. Changesets 工作流

```bash
# 安装
pnpm add -D @changesets/cli

# 初始化
pnpm changeset init

# 添加变更记录 (交互式)
pnpm changeset
# → 选择影响的包
# → 选择版本类型 (major/minor/patch)
# → 描述变更

# 更新版本号
pnpm changeset version

# 发布到 npm
pnpm changeset publish
```

### 3. 发布 CI

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - run: pnpm install
      - run: pnpm build

      - name: Create Release PR or Publish
        uses: changesets/action@v1
        with:
          publish: pnpm changeset publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 📌 六、代码质量保障

### 1. 质量工具链

```
┌──────────────────────────────────────────────────────┐
│              代码质量保障体系                          │
├──────────────────────────────────────────────────────┤
│                                                      │
│  编码阶段:                                            │
│  ├── TypeScript — 类型检查                           │
│  ├── ESLint — 代码风格 + 质量规则                    │
│  └── Prettier — 格式统一                             │
│                                                      │
│  提交阶段:                                            │
│  ├── Husky — Git hooks                               │
│  ├── lint-staged — 只检查暂存文件                    │
│  └── Commitlint — 提交信息规范                       │
│                                                      │
│  CI 阶段:                                             │
│  ├── 单元测试 + 覆盖率                               │
│  ├── E2E 测试                                        │
│  ├── 构建验证                                        │
│  └── 代码审查 (PR)                                   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 2. 共享 ESLint 配置

```javascript
// packages/eslint-config/index.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  rules: {
    'no-console': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    'react/react-in-jsx-scope': 'off',
  },
};
```

---

## 📚 推荐学习资源

| 资源         | 链接               |
| ------------ | ------------------ |
| pnpm         | pnpm.io            |
| Turborepo    | turbo.build        |
| Vitest       | vitest.dev         |
| Playwright   | playwright.dev     |
| Storybook    | storybook.js.org   |
| Changesets   | github.com/changesets |

---
