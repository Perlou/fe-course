# TypeScript 深入解析

## 📌 一、TypeScript 是什么？

```
TypeScript = JavaScript + 静态类型系统
```

```
┌─────────────────────────────────────────────────────────┐
│                  TypeScript 编译流程                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   .ts 文件 ──→ TypeScript 编译器 (tsc) ──→ .js 文件     │
│                      ↓                                  │
│              类型检查 + 语法转换                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📌 二、基础类型

### 1. 原始类型

```typescript
// 字符串
let str: string = "hello";

// 数字
let num: number = 42;
let float: number = 3.14;
let hex: number = 0xf00d;

// 布尔
let bool: boolean = true;

// null 和 undefined
let n: null = null;
let u: undefined = undefined;

// Symbol
let sym: symbol = Symbol("key");

// BigInt
let big: bigint = 100n;
```

### 2. 数组与元组

```typescript
// 数组
let arr1: number[] = [1, 2, 3];
let arr2: Array<string> = ["a", "b", "c"];

// 元组 (固定长度和类型)
let tuple: [string, number] = ["Alice", 20];
let [name, age] = tuple;

// 可选元组元素
let optionalTuple: [string, number?] = ["Alice"];

// 剩余元素
let restTuple: [string, ...number[]] = ["a", 1, 2, 3];
```

### 3. 特殊类型

```typescript
// any: 任意类型（关闭类型检查）
let anyVar: any = "hello";
anyVar = 42; // OK

// unknown: 安全的 any（需要类型收窄）
let unknownVar: unknown = "hello";
if (typeof unknownVar === "string") {
  unknownVar.toUpperCase(); // OK
}

// void: 无返回值
function log(msg: string): void {
  console.log(msg);
}

// never: 永不返回
function error(msg: string): never {
  throw new Error(msg);
}
function infinite(): never {
  while (true) {}
}
```

### 4. 类型断言

```typescript
// as 语法
const str = someValue as string;
const len = (someValue as string).length;

// 尖括号语法（JSX 中不可用）
const str = <string>someValue;

// 非空断言
element!.innerHTML; // 断言 element 不为 null/undefined

// const 断言
const colors = ["red", "green"] as const;
// 类型: readonly ['red', 'green']
```

---

## 📌 三、接口与类型别名

### 1. 接口 (interface)

```typescript
// 基本接口
interface User {
  name: string;
  age: number;
  email?: string; // 可选属性
  readonly id: number; // 只读属性
}

// 函数类型接口
interface SearchFunc {
  (source: string, subString: string): boolean;
}

// 索引签名
interface StringArray {
  [index: number]: string;
}
interface Dictionary {
  [key: string]: any;
}

// 接口继承
interface Person {
  name: string;
}
interface Employee extends Person {
  employeeId: number;
}

// 多继承
interface Admin extends Person, Employee {
  role: string;
}
```

### 2. 类型别名 (type)

```typescript
// 基本类型别名
type ID = string | number;
type Point = { x: number; y: number };

// 联合类型
type Status = "pending" | "success" | "error";

// 交叉类型
type Admin = User & { role: string };

// 函数类型
type Callback = (data: string) => void;

// 泛型类型别名
type Container<T> = { value: T };
```

### 3. interface vs type

```
┌─────────────────┬────────────────────┬────────────────────┐
│                 │     interface      │        type        │
├─────────────────┼────────────────────┼────────────────────┤
│ 扩展方式        │ extends            │ & (交叉类型)       │
│ 声明合并        │ ✅ 支持            │ ❌ 不支持          │
│ 原始类型别名    │ ❌ 不支持          │ ✅ 支持            │
│ 联合类型        │ ❌ 不支持          │ ✅ 支持            │
│ 映射类型        │ ❌ 不支持          │ ✅ 支持            │
│ 类实现          │ ✅ implements      │ ✅ implements      │
└─────────────────┴────────────────────┴────────────────────┘
```

---

## 📌 四、函数类型

### 1. 函数声明

```typescript
// 函数声明
function add(a: number, b: number): number {
  return a + b;
}

// 函数表达式
const add: (a: number, b: number) => number = (a, b) => a + b;

// 可选参数
function greet(name: string, greeting?: string): string {
  return `${greeting || "Hello"}, ${name}`;
}

// 默认参数
function greet(name: string, greeting: string = "Hello"): string {
  return `${greeting}, ${name}`;
}

// 剩余参数
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}
```

### 2. 函数重载

```typescript
// 重载签名
function reverse(x: string): string;
function reverse(x: number[]): number[];

// 实现签名
function reverse(x: string | number[]): string | number[] {
  if (typeof x === "string") {
    return x.split("").reverse().join("");
  }
  return x.slice().reverse();
}

reverse("hello"); // string
reverse([1, 2, 3]); // number[]
```

---

## 📌 五、泛型

### 1. 泛型函数

```typescript
// 基本泛型
function identity<T>(arg: T): T {
  return arg;
}
identity<string>("hello");
identity(42); // 类型推断

// 多个类型参数
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}
```

### 2. 泛型约束

```typescript
// extends 约束
interface Lengthwise {
  length: number;
}
function logLength<T extends Lengthwise>(arg: T): number {
  return arg.length;
}
logLength("hello"); // OK
logLength([1, 2, 3]); // OK
logLength(123); // ❌ Error

// keyof 约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const user = { name: "Alice", age: 20 };
getProperty(user, "name"); // OK
getProperty(user, "email"); // ❌ Error
```

### 3. 泛型接口与类

```typescript
// 泛型接口
interface GenericIdentityFn<T> {
  (arg: T): T;
}

// 泛型类
class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;
}

const myNumber = new GenericNumber<number>();
myNumber.zeroValue = 0;
myNumber.add = (x, y) => x + y;
```

### 4. 泛型默认值

```typescript
interface Container<T = string> {
  value: T;
}

const c1: Container = { value: "hello" }; // T = string
const c2: Container<number> = { value: 42 }; // T = number
```

---

## 📌 六、高级类型

### 1. 联合类型与交叉类型

```typescript
// 联合类型 (Union)
type ID = string | number;
function printId(id: ID) {
  if (typeof id === "string") {
    console.log(id.toUpperCase());
  } else {
    console.log(id);
  }
}

// 交叉类型 (Intersection)
type Name = { name: string };
type Age = { age: number };
type Person = Name & Age; // { name: string; age: number }
```

### 2. 类型收窄

```typescript
// typeof
function padLeft(value: string, padding: string | number) {
  if (typeof padding === "number") {
    return " ".repeat(padding) + value;
  }
  return padding + value;
}

// instanceof
function logValue(x: Date | string) {
  if (x instanceof Date) {
    console.log(x.toISOString());
  } else {
    console.log(x);
  }
}

// in 操作符
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    animal.swim();
  } else {
    animal.fly();
  }
}

// 类型谓词 (Type Predicates)
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

if (isFish(pet)) {
  pet.swim(); // TypeScript 知道 pet 是 Fish
}
```

### 3. 条件类型

```typescript
// 基本条件类型
type IsString<T> = T extends string ? true : false;

IsString<"hello">; // true
IsString<123>; // false

// 条件类型分发
type ToArray<T> = T extends any ? T[] : never;

ToArray<string | number>; // string[] | number[]

// 阻止分发
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;

ToArrayNonDist<string | number>; // (string | number)[]
```

### 4. infer 关键字

```typescript
// 推断返回类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type Fn = () => string;
type R = ReturnType<Fn>; // string

// 推断参数类型
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

type P = Parameters<(a: string, b: number) => void>; // [string, number]

// 推断数组元素类型
type ElementType<T> = T extends (infer E)[] ? E : never;

type E = ElementType<string[]>; // string

// 推断 Promise 类型
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type U = UnwrapPromise<Promise<string>>; // string
```

### 5. 映射类型

```typescript
// 基本映射类型
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};

type Partial<T> = {
  [K in keyof T]?: T[K];
};

// 键重映射 (as)
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Person {
  name: string;
  age: number;
}
type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number; }

// 过滤键
type FilterByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

type StringProps = FilterByType<Person, string>;
// { name: string }
```

---

## 📌 七、内置工具类型

### 1. 常用工具类型

```typescript
// Partial: 所有属性可选
type PartialUser = Partial<User>;

// Required: 所有属性必选
type RequiredUser = Required<User>;

// Readonly: 所有属性只读
type ReadonlyUser = Readonly<User>;

// Pick: 选取部分属性
type NameOnly = Pick<User, "name">;

// Omit: 排除部分属性
type WithoutAge = Omit<User, "age">;

// Record: 构造对象类型
type PageInfo = Record<"home" | "about", { title: string }>;

// Exclude: 从联合类型中排除
type T = Exclude<"a" | "b" | "c", "a">; // 'b' | 'c'

// Extract: 从联合类型中提取
type T = Extract<"a" | "b" | "c", "a" | "d">; // 'a'

// NonNullable: 排除 null 和 undefined
type T = NonNullable<string | null | undefined>; // string

// ReturnType: 获取函数返回类型
type R = ReturnType<() => string>; // string

// Parameters: 获取函数参数类型
type P = Parameters<(a: string, b: number) => void>; // [string, number]

// InstanceType: 获取构造函数实例类型
type I = InstanceType<typeof Date>; // Date
```

### 2. 工具类型实现

```typescript
// Partial 实现
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

// Required 实现
type MyRequired<T> = {
  [K in keyof T]-?: T[K]; // -? 移除可选
};

// Readonly 实现
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

// Pick 实现
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// Omit 实现
type MyOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Exclude 实现
type MyExclude<T, U> = T extends U ? never : T;

// Extract 实现
type MyExtract<T, U> = T extends U ? T : never;

// ReturnType 实现
type MyReturnType<T extends (...args: any) => any> = T extends (
  ...args: any
) => infer R
  ? R
  : any;
```

---

## 📌 八、类型体操示例

### 1. DeepReadonly

```typescript
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepReadonly<T[K]>
    : T[K];
};
```

### 2. Flatten

```typescript
type Flatten<T> = T extends (infer U)[] ? Flatten<U> : T;

type T = Flatten<number[][]>; // number
```

### 3. TupleToUnion

```typescript
type TupleToUnion<T extends any[]> = T[number];

type T = TupleToUnion<["a", "b", "c"]>; // 'a' | 'b' | 'c'
```

### 4. UnionToIntersection

```typescript
type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (
  x: infer I
) => void
  ? I
  : never;

type T = UnionToIntersection<{ a: 1 } | { b: 2 }>;
// { a: 1 } & { b: 2 }
```

---

## 📚 推荐学习资源

| 资源                | 链接                       |
| ------------------- | -------------------------- |
| TypeScript 官方文档 | typescriptlang.org         |
| Type Challenges     | github.com/type-challenges |
| TypeScript 入门教程 | ts.xcatliu.com             |

---
