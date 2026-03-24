// 组件库设计详解
// 运行: node 04-component-library.js

console.log("=== 组件库设计 ===\n");

// ========== 1. Design Tokens ==========
console.log("1. Design Tokens 系统\n");

const tokens = {
  colors: {
    primary: { 50: "#eff6ff", 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8" },
    gray: { 50: "#f9fafb", 100: "#f3f4f6", 500: "#6b7280", 900: "#111827" },
    success: "#10b981",
    danger: "#ef4444",
    warning: "#f59e0b",
  },
  spacing: { xs: "4px", sm: "8px", md: "16px", lg: "24px", xl: "32px" },
  radius: { sm: "4px", md: "8px", lg: "16px", full: "9999px" },
  fontSize: { xs: "12px", sm: "14px", md: "16px", lg: "18px", xl: "24px" },
  shadow: {
    sm: "0 1px 2px rgba(0,0,0,0.05)",
    md: "0 4px 6px rgba(0,0,0,0.1)",
    lg: "0 10px 15px rgba(0,0,0,0.1)",
  },
};

console.log("  颜色:");
Object.entries(tokens.colors).forEach(([name, val]) => {
  if (typeof val === "string") {
    console.log(`    --color-${name}: ${val}`);
  } else {
    Object.entries(val).forEach(([shade, hex]) => {
      console.log(`    --color-${name}-${shade}: ${hex}`);
    });
  }
});

console.log("\n  间距:");
Object.entries(tokens.spacing).forEach(([name, val]) => {
  console.log(`    --space-${name}: ${val}`);
});

// ========== 2. 组件 API 设计 ==========
console.log("\n2. 组件 API 设计 (Button)\n");

// 模拟组件定义
function defineComponent(name, config) {
  console.log(`  📦 ${name}`);
  console.log(`     Props:`);
  Object.entries(config.props).forEach(([prop, def]) => {
    const required = def.required ? " (必需)" : "";
    const defaultVal = def.default ? ` = ${def.default}` : "";
    console.log(`       ${prop}: ${def.type}${defaultVal}${required}`);
  });
  if (config.variants) {
    console.log(`     Variants: ${config.variants.join(", ")}`);
  }
  if (config.sizes) {
    console.log(`     Sizes: ${config.sizes.join(", ")}`);
  }
  console.log();
  return config;
}

defineComponent("Button", {
  props: {
    children: { type: "ReactNode", required: true },
    variant: { type: "string", default: "'primary'" },
    size: { type: "string", default: "'md'" },
    disabled: { type: "boolean", default: "false" },
    loading: { type: "boolean", default: "false" },
    icon: { type: "ReactNode" },
    onClick: { type: "(e: Event) => void" },
    className: { type: "string" },
  },
  variants: ["primary", "secondary", "ghost", "danger", "link"],
  sizes: ["sm", "md", "lg"],
});

defineComponent("Input", {
  props: {
    value: { type: "string" },
    defaultValue: { type: "string" },
    placeholder: { type: "string" },
    type: { type: "string", default: "'text'" },
    disabled: { type: "boolean" },
    error: { type: "string" },
    label: { type: "string" },
    onChange: { type: "(value: string) => void" },
  },
  variants: ["outline", "filled", "underline"],
  sizes: ["sm", "md", "lg"],
});

defineComponent("Modal", {
  props: {
    open: { type: "boolean", required: true },
    onClose: { type: "() => void", required: true },
    title: { type: "string" },
    children: { type: "ReactNode" },
    size: { type: "string", default: "'md'" },
    closeOnOverlay: { type: "boolean", default: "true" },
  },
  sizes: ["sm", "md", "lg", "full"],
});

// ========== 3. 组件文件结构 ==========
console.log("3. 组件文件结构\n");
console.log(`
  packages/ui/src/button/
  ├── Button.tsx           # 组件实现
  ├── Button.test.tsx      # 单元测试
  ├── Button.stories.tsx   # Storybook 文档
  ├── button.module.css    # 样式
  ├── types.ts             # Props 类型
  └── index.ts             # 导出

  // Button.tsx 结构
  import { ButtonProps } from './types';
  import styles from './button.module.css';
  import { clsx } from 'clsx';

  export function Button({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon,
    className,
    ...rest
  }: ButtonProps) {
    return (
      <button
        className={clsx(
          styles.button,
          styles[variant],
          styles[size],
          { [styles.loading]: loading },
          className
        )}
        disabled={disabled || loading}
        {...rest}
      >
        {loading && <Spinner />}
        {icon && <span className={styles.icon}>{icon}</span>}
        {children}
      </button>
    );
  }
`);

// ========== 4. CSS Module 样式 ==========
console.log("4. 组件样式 (CSS Modules)\n");

const buttonCSS = `
  /* button.module.css */
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    font-weight: 500;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s;
  }

  /* Variants */
  .primary {
    background: var(--color-primary-500);
    color: white;
  }
  .primary:hover {
    background: var(--color-primary-600);
  }

  .secondary {
    background: var(--color-gray-100);
    color: var(--color-gray-900);
  }

  .ghost {
    background: transparent;
    color: var(--color-gray-700);
  }
  .ghost:hover {
    background: var(--color-gray-100);
  }

  /* Sizes */
  .sm { padding: 6px 12px; font-size: 14px; }
  .md { padding: 8px 16px; font-size: 16px; }
  .lg { padding: 12px 24px; font-size: 18px; }

  .button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

console.log(buttonCSS);

// ========== 5. 构建配置 ==========
console.log("5. 构建配置 (Vite Library Mode)\n");
console.log(`
  // packages/ui/vite.config.ts
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';
  import { resolve } from 'path';

  export default defineConfig({
    plugins: [react()],
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'MyUI',
        formats: ['es', 'cjs'],
        fileName: (format) => \`index.\${format === 'es' ? 'mjs' : 'js'}\`,
      },
      rollupOptions: {
        external: ['react', 'react-dom'],
        output: {
          globals: { react: 'React', 'react-dom': 'ReactDOM' },
        },
      },
    },
  });

  // package.json exports
  {
    "exports": {
      ".": {
        "import": "./dist/index.mjs",
        "require": "./dist/index.js",
        "types": "./dist/index.d.ts"
      },
      "./button": "./dist/button/index.mjs",
      "./input": "./dist/input/index.mjs"
    },
    "sideEffects": false  // 支持 tree-shaking
  }
`);

console.log("=== 组件库设计完成 ===");
