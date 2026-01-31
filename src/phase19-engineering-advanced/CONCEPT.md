# 工程化进阶深入解析

## 📌 一、Monorepo

### 1. pnpm workspace 配置

```yaml
# pnpm-workspace.yaml
packages:
  - "packages/*"
  - "apps/*"
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
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

```bash
# 运行命令
turbo run build
turbo run test --filter=@mylib/ui
turbo run dev --parallel
```

---

## 📌 二、单元测试

### 1. Vitest 配置

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/test/"],
    },
  },
});
```

### 2. 组件测试

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("Click me");
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);

    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
```

### 3. Hook 测试

```typescript
import { renderHook, act } from "@testing-library/react";
import { useCounter } from "./useCounter";

describe("useCounter", () => {
  it("increments counter", () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

---

## 📌 三、E2E 测试

### Playwright

```typescript
// e2e/login.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Login", () => {
  test("successful login", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("h1")).toContainText("Welcome");
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[name="email"]', "wrong@example.com");
    await page.fill('input[name="password"]', "wrong");
    await page.click('button[type="submit"]');

    await expect(page.locator(".error")).toContainText("Invalid credentials");
  });
});
```

---

## 📌 四、组件库开发

### 1. 组件设计原则

```
1. 单一职责: 每个组件只做一件事
2. 可组合性: 小组件组合成复杂组件
3. 可访问性: 支持键盘导航和屏幕阅读器
4. 可定制性: 支持主题和样式覆盖
5. 类型安全: 完善的 TypeScript 类型
```

### 2. 组件结构

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
│   └── index.ts
├── package.json
└── tsconfig.json
```

### 3. Storybook

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Button",
  },
};
```

---

## 📌 五、版本管理

### Changesets

```bash
# 安装
pnpm add -D @changesets/cli

# 初始化
pnpm changeset init

# 添加变更
pnpm changeset

# 更新版本
pnpm changeset version

# 发布
pnpm changeset publish
```

```yaml
# .changeset/config.json
{
  "$schema": "https://unpkg.com/@changesets/config/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "access": "public",
  "baseBranch": "main",
}
```

---

## 📚 推荐学习资源

| 资源       | 链接             |
| ---------- | ---------------- |
| pnpm       | pnpm.io          |
| Turborepo  | turbo.build      |
| Vitest     | vitest.dev       |
| Playwright | playwright.dev   |
| Storybook  | storybook.js.org |

---
