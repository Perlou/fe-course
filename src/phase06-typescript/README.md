# Phase 6: TypeScript 深入

> **目标**：掌握 TypeScript 类型系统  
> **预计时长**：2 周

---

## 📚 本阶段内容

### 学习目标

1. 掌握 TypeScript 基础类型
2. 理解泛型与类型约束
3. 掌握高级类型技巧
4. 熟悉工具类型的实现

### 知识要点

- 基础类型与接口
- 类与函数类型
- 泛型与约束
- 条件类型与映射类型
- infer 关键字
- 内置工具类型

### 实战项目

**TypeScript 工具库**：实现常用工具类型

---

## 📂 目录结构

```
phase06-typescript/
├── CONCEPT.md
├── README.md
├── examples/
│   ├── 01-basic-types.ts
│   ├── 02-interfaces.ts
│   ├── 03-generics.ts
│   ├── 04-advanced-types.ts
│   └── 05-utility-types.ts
└── exercises/
    └── type-challenges/
```

---

## 🎯 核心概念速览

### 1. 基础类型

```typescript
let str: string = "hello";
let num: number = 42;
let arr: number[] = [1, 2, 3];
let tuple: [string, number] = ["a", 1];
```

### 2. 泛型

```typescript
function identity<T>(arg: T): T {
  return arg;
}
```

### 3. 条件类型

```typescript
type IsString<T> = T extends string ? true : false;
```

---

> 完成本阶段后，你应该能够编写类型安全的 TypeScript 代码。
