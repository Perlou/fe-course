// TypeScript 高级类型
// 运行: npx ts-node 04-advanced-types.ts 或 npx tsx 04-advanced-types.ts

console.log("=== TypeScript 高级类型 ===\n");

// ========== 1. 联合类型与交叉类型 ==========
console.log("1. 联合类型与交叉类型");

// 联合类型 (Union): 值可以是多种类型之一
type ID = string | number;

function printId(id: ID): void {
  if (typeof id === "string") {
    console.log("  字符串 ID:", id.toUpperCase());
  } else {
    console.log("  数字 ID:", id.toFixed(0));
  }
}
printId("abc-123");
printId(42);

// 可辨识联合 (Discriminated Union)
interface Circle {
  kind: "circle";
  radius: number;
}
interface Square {
  kind: "square";
  sideLength: number;
}
interface Triangle {
  kind: "triangle";
  base: number;
  height: number;
}

type Shape = Circle | Square | Triangle;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.sideLength ** 2;
    case "triangle":
      return (shape.base * shape.height) / 2;
  }
}

console.log("圆面积:", getArea({ kind: "circle", radius: 5 }).toFixed(2));
console.log("方面积:", getArea({ kind: "square", sideLength: 4 }));
console.log("三角面积:", getArea({ kind: "triangle", base: 6, height: 3 }));

// 交叉类型 (Intersection): 合并多个类型
type Name = { firstName: string; lastName: string };
type Age = { age: number };
type Person = Name & Age;

const person: Person = {
  firstName: "张",
  lastName: "三",
  age: 25,
};
console.log("交叉类型:", person);

// ========== 2. 类型收窄 (Type Narrowing) ==========
console.log("\n2. 类型收窄");

// typeof 守卫
function padLeft(value: string, padding: string | number): string {
  if (typeof padding === "number") {
    return " ".repeat(padding) + value;
  }
  return padding + value;
}
console.log("typeof:", padLeft("hello", 4));
console.log("typeof:", padLeft("hello", ">>> "));

// instanceof 守卫
class Dog {
  bark() {
    return "汪汪!";
  }
}
class Cat {
  meow() {
    return "喵喵!";
  }
}

function makeSoundOf(animal: Dog | Cat): string {
  if (animal instanceof Dog) {
    return animal.bark();
  }
  return animal.meow();
}
console.log("instanceof:", makeSoundOf(new Dog()));
console.log("instanceof:", makeSoundOf(new Cat()));

// in 操作符
type Fish = { swim: () => string };
type Bird = { fly: () => string };

function move(animal: Fish | Bird): string {
  if ("swim" in animal) {
    return animal.swim();
  }
  return animal.fly();
}
console.log("in:", move({ swim: () => "游泳中..." }));
console.log("in:", move({ fly: () => "飞行中..." }));

// 类型谓词 (Type Predicates) - 自定义类型守卫
interface Admin {
  role: string;
  permissions: string[];
}
interface Guest {
  visitCount: number;
}

function isAdmin(user: Admin | Guest): user is Admin {
  return "role" in user;
}

function handleUser(user: Admin | Guest): void {
  if (isAdmin(user)) {
    console.log("  管理员权限:", user.permissions);
  } else {
    console.log("  访客次数:", user.visitCount);
  }
}
handleUser({ role: "admin", permissions: ["read", "write"] });
handleUser({ visitCount: 5 });

// 断言函数 (Assertion Functions)
function assertString(val: unknown): asserts val is string {
  if (typeof val !== "string") {
    throw new Error(`Expected string, got ${typeof val}`);
  }
}

const maybeString: unknown = "hello";
assertString(maybeString);
console.log("断言后:", maybeString.toUpperCase()); // 类型收窄为 string

// ========== 3. 条件类型 ==========
console.log("\n3. 条件类型");

// 基本语法: T extends U ? X : Y
type IsString<T> = T extends string ? true : false;
type IsNumber<T> = T extends number ? "yes" : "no";

// 使用
type A = IsString<"hello">; // true
type B = IsString<42>; // false
type C = IsNumber<100>; // 'yes'

// 条件类型的分发特性
type ToArray<T> = T extends any ? T[] : never;

// 联合类型会被分发处理
type D = ToArray<string | number>;
// = ToArray<string> | ToArray<number>
// = string[] | number[]

// 阻止分发 (用方括号包裹)
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type E = ToArrayNonDist<string | number>;
// = (string | number)[]

console.log("条件类型是编译时计算，运行时已擦除");

// 嵌套条件类型
type TypeName<T> = T extends string
  ? "string"
  : T extends number
    ? "number"
    : T extends boolean
      ? "boolean"
      : T extends undefined
        ? "undefined"
        : T extends Function
          ? "function"
          : "object";

type T1 = TypeName<"hello">; // 'string'
type T2 = TypeName<42>; // 'number'
type T3 = TypeName<() => void>; // 'function'

// ========== 4. infer 关键字 ==========
console.log("\n4. infer 关键字");

// 推断函数返回类型
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type Fn1 = () => string;
type R1 = MyReturnType<Fn1>; // string

type Fn2 = (x: number) => boolean;
type R2 = MyReturnType<Fn2>; // boolean

// 推断函数参数类型
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;

type P1 = MyParameters<(a: string, b: number) => void>; // [string, number]

// 推断数组元素类型
type ElementType<T> = T extends (infer E)[] ? E : T;

type E1 = ElementType<string[]>; // string
type E2 = ElementType<number>; // number (不是数组，返回自身)

// 推断 Promise 解包
type UnwrapPromise<T> = T extends Promise<infer U> ? UnwrapPromise<U> : T;

type U1 = UnwrapPromise<Promise<string>>; // string
type U2 = UnwrapPromise<Promise<Promise<number>>>; // number (递归解包)

// 提取对象值类型
type ValueOf<T> = T[keyof T];

interface Config {
  host: string;
  port: number;
  debug: boolean;
}
type ConfigValue = ValueOf<Config>; // string | number | boolean

// 提取构造函数参数
type ConstructorParams<T> = T extends new (...args: infer P) => any ? P : never;

class UserClass {
  constructor(
    public name: string,
    public age: number,
  ) {}
}
type UserParams = ConstructorParams<typeof UserClass>; // [string, number]

console.log("infer 是编译时类型推断，运行时已擦除");

// ========== 5. 映射类型 ==========
console.log("\n5. 映射类型");

interface User {
  name: string;
  age: number;
  email: string;
}

// 基本映射: 将所有属性变为可选
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

// 将所有属性变为只读
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

// 将所有属性变为可写 (移除 readonly)
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

// 将所有属性变为必选 (移除 ?)
type MyRequired<T> = {
  [K in keyof T]-?: T[K];
};

// 键重映射 (as)
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type Setters<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
};

type UserGetters = Getters<User>;
// { getName: () => string; getAge: () => number; getEmail: () => string }

type UserSetters = Setters<User>;
// { setName: (value: string) => void; setAge: (value: number) => void; ... }

// 过滤键
type FilterByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

type StringProps = FilterByType<User, string>;
// { name: string; email: string }  (age 被过滤掉)

type NumberProps = FilterByType<User, number>;
// { age: number }

console.log("映射类型是编译时类型变换，用于批量修改属性");

// ========== 6. 模板字面量类型 ==========
console.log("\n6. 模板字面量类型");

// 基本模板字面量
type Greeting = `Hello, ${string}`;
const g1: Greeting = "Hello, World"; // OK
// const g2: Greeting = 'Hi, World';      // ❌ Error

// 事件名称生成
type EventName = `${"click" | "focus" | "blur"}${"" | "Capture"}`;
// 'click' | 'clickCapture' | 'focus' | 'focusCapture' | 'blur' | 'blurCapture'

// CSS 单位
type CSSUnit = "px" | "em" | "rem" | "%" | "vh" | "vw";
type CSSValue = `${number}${CSSUnit}`;
const width: CSSValue = "100px";
const height: CSSValue = "50vh";

// 内置字符串操作类型
type Upper = Uppercase<"hello">; // 'HELLO'
type Lower = Lowercase<"HELLO">; // 'hello'
type Cap = Capitalize<"hello">; // 'Hello'
type Uncap = Uncapitalize<"Hello">; // 'hello'

// 结合映射类型: 事件系统
type EventHandlers<T> = {
  [K in keyof T as `on${Capitalize<string & K>}Change`]: (
    oldValue: T[K],
    newValue: T[K],
  ) => void;
};

type UserHandlers = EventHandlers<User>;
// {
//   onNameChange: (oldValue: string, newValue: string) => void;
//   onAgeChange: (oldValue: number, newValue: number) => void;
//   onEmailChange: (oldValue: string, newValue: string) => void;
// }

console.log("CSS值:", width, height);

// ========== 7. 综合应用: 类型安全的事件系统 ==========
console.log("\n7. 综合应用: 类型安全的事件系统");

type EventMap = {
  login: { userId: string; timestamp: number };
  logout: { userId: string };
  purchase: { productId: string; amount: number };
};

// 类型安全的事件发射器
class TypedEventEmitter<Events extends Record<string, any>> {
  private handlers: Partial<{
    [K in keyof Events]: Array<(data: Events[K]) => void>;
  }> = {};

  on<K extends keyof Events>(
    event: K,
    handler: (data: Events[K]) => void,
  ): void {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event]!.push(handler);
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    const eventHandlers = this.handlers[event];
    if (eventHandlers) {
      eventHandlers.forEach((handler) => handler(data));
    }
  }
}

const emitter = new TypedEventEmitter<EventMap>();

emitter.on("login", (data) => {
  // data 自动推断为 { userId: string; timestamp: number }
  console.log(
    `  用户 ${data.userId} 登录于 ${new Date(data.timestamp).toLocaleString()}`,
  );
});

emitter.on("purchase", (data) => {
  // data 自动推断为 { productId: string; amount: number }
  console.log(`  购买 ${data.productId}，金额 ${data.amount}`);
});

emitter.emit("login", { userId: "user-001", timestamp: Date.now() });
emitter.emit("purchase", { productId: "prod-001", amount: 99.9 });

// emitter.emit('login', { wrongProp: true }); // ❌ 类型错误
// emitter.emit('nonexistent', {});            // ❌ 事件名错误

console.log(`
高级类型总结:
┌──────────────────┬────────────────────────────────────┐
│ 联合类型          │ A | B - 值可以是 A 或 B            │
│ 交叉类型          │ A & B - 同时满足 A 和 B            │
│ 类型收窄          │ typeof/instanceof/in/谓词           │
│ 条件类型          │ T extends U ? X : Y                │
│ infer            │ 在条件类型中推断类型                 │
│ 映射类型          │ { [K in keyof T]: ... }            │
│ 模板字面量        │ \`prefix\${Type}suffix\`             │
└──────────────────┴────────────────────────────────────┘
`);

console.log("=== 高级类型完成 ===");
