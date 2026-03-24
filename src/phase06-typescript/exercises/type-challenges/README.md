# 🔷 TypeScript 练习

## 项目概述

用 TypeScript 实现一组类型体操和工具类型，深入理解泛型、条件类型和类型推断。

## 练习列表

### 1. 基础类型练习

- 定义 `User`, `Product`, `Order` 接口
- 使用联合类型实现 `Result<T, E>`
- 使用交叉类型实现 `Mixin`

### 2. 泛型练习

- 实现类型安全的 `Stack<T>`
- 实现 `Dictionary<K, V>` 类 
- 实现 `EventEmitter<Events>` (泛型事件映射)

### 3. 工具类型练习

- 手写 `MyPick<T, K>`
- 手写 `MyOmit<T, K>`
- 手写 `MyReturnType<T>`
- 手写 `DeepReadonly<T>`
- 手写 `DeepPartial<T>`

### 4. 类型体操

- 实现 `TupleToUnion<T>` 元组转联合
- 实现 `StringToUnion<S>` 字符串转联合
- 实现 `IsEqual<A, B>` 类型判等

## 学习要点

- [ ] 接口与类型别名
- [ ] 泛型约束
- [ ] 条件类型 (infer)
- [ ] 映射类型
- [ ] 模板字面量类型
