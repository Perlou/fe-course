// TypeScript 基础类型
// 运行: npx ts-node 01-basic-types.ts 或 npx tsx 01-basic-types.ts

console.log("=== TypeScript 基础类型 ===\n");

// ========== 1. 原始类型 ==========
console.log("1. 原始类型");

// 字符串
let str: string = "hello";
let templateStr: string = `Hello, ${str}`;

// 数字 (整数、浮点数、十六进制、二进制、八进制)
let int: number = 42;
let float: number = 3.14;
let hex: number = 0xf00d;
let binary: number = 0b1010;
let octal: number = 0o744;

// 布尔值
let isDone: boolean = false;

// null 和 undefined
let n: null = null;
let u: undefined = undefined;

// Symbol
let sym: symbol = Symbol("description");
let uniqueSym: unique symbol = Symbol("unique"); // 唯一 symbol

// BigInt (大整数)
let big: bigint = 100n;
let bigFromNum: bigint = BigInt(9007199254740991);

console.log("字符串:", str, templateStr);
console.log("数字:", int, float, hex, binary, octal);
console.log("布尔:", isDone);
console.log("null/undefined:", n, u);
console.log("Symbol:", sym.toString());
console.log("BigInt:", big.toString());

// ========== 2. 数组与元组 ==========
console.log("\n2. 数组与元组");

// 数组两种写法
let arr1: number[] = [1, 2, 3];
let arr2: Array<string> = ["a", "b", "c"];

// 只读数组
let readonlyArr: readonly number[] = [1, 2, 3];
// readonlyArr.push(4); // ❌ Error: 只读数组不能修改
// readonlyArr[0] = 10; // ❌ Error

// 元组 (固定长度和类型)
let tuple: [string, number] = ["Alice", 20];
let [name, age] = tuple; // 解构
console.log("元组解构:", name, age);

// 可选元组元素
let optionalTuple: [string, number?] = ["Bob"];
console.log("可选元组:", optionalTuple);

// 剩余元素元组
let restTuple: [string, ...number[]] = ["scores", 90, 85, 92];
console.log("剩余元素元组:", restTuple);

// 命名元组 (提高可读性)
type NamedTuple = [name: string, age: number, active: boolean];
let person: NamedTuple = ["Charlie", 30, true];
console.log("命名元组:", person);

// ========== 3. 枚举 (enum) ==========
console.log("\n3. 枚举");

// 数字枚举
enum Direction {
  Up, // 0
  Down, // 1
  Left, // 2
  Right, // 3
}
console.log("数字枚举:", Direction.Up, Direction.Down);
console.log("反向映射:", Direction[0]); // 'Up'

// 指定初始值
enum StatusCode {
  OK = 200,
  NotFound = 404,
  ServerError = 500,
}
console.log("状态码:", StatusCode.OK, StatusCode.NotFound);

// 字符串枚举
enum Color {
  Red = "#FF0000",
  Green = "#00FF00",
  Blue = "#0000FF",
}
console.log("颜色:", Color.Red);

// const 枚举 (编译后会被内联，性能更好)
const enum Weekday {
  Mon,
  Tue,
  Wed,
  Thu,
  Fri,
  Sat,
  Sun,
}
let today: Weekday = Weekday.Mon;
console.log("const 枚举:", today); // 编译后直接变成 0

// ========== 4. 特殊类型 ==========
console.log("\n4. 特殊类型");

// any: 任意类型（关闭类型检查，尽量避免使用）
let anyVar: any = "hello";
anyVar = 42; // OK
anyVar = true; // OK
anyVar.nonExistent(); // 编译不报错，运行时可能出错

// unknown: 安全的 any（需要类型收窄后才能使用）
let unknownVar: unknown = "hello";
// unknownVar.toUpperCase(); // ❌ Error: 必须先收窄类型

if (typeof unknownVar === "string") {
  console.log("unknown 收窄为 string:", unknownVar.toUpperCase());
}

// void: 无返回值的函数
function logMessage(msg: string): void {
  console.log(msg);
}
logMessage("void 函数");

// never: 永远不会返回的函数
function throwError(msg: string): never {
  throw new Error(msg);
}

function infiniteLoop(): never {
  while (true) {}
}

// never 用于穷尽检查
type Shape = "circle" | "square" | "triangle";

function getArea(shape: Shape): number {
  switch (shape) {
    case "circle":
      return Math.PI * 10 * 10;
    case "square":
      return 10 * 10;
    case "triangle":
      return (10 * 10) / 2;
    default:
      // 如果所有 case 都处理了，_exhaustive 的类型是 never
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}

console.log(`
┌──────────────────────────────────────────────┐
│              特殊类型对比                      │
├──────────┬───────────────────────────────────┤
│ any      │ 关闭类型检查，不推荐使用             │
│ unknown  │ 安全的 any，需先收窄类型             │
│ void     │ 函数无返回值                         │
│ never    │ 永远不会到达，用于穷尽检查            │
└──────────┴───────────────────────────────────┘
`);

// ========== 5. 类型断言 ==========
console.log("5. 类型断言");

// as 语法 (推荐)
const someValue: unknown = "this is a string";
const strLength: number = (someValue as string).length;
console.log("as 断言获取长度:", strLength);

// 尖括号语法 (在 JSX/TSX 中不可用)
// const strLength2: number = (<string>someValue).length;

// 非空断言 (!)
function getElement(id: string): HTMLElement | null {
  // 模拟 DOM 操作
  return null;
}
// const el = getElement('app')!; // 断言不为 null
// el.innerHTML = 'hello';       // 不会报错，但有风险

// const 断言 (将值转为字面量类型)
const colors = ["red", "green", "blue"] as const;
// 类型: readonly ['red', 'green', 'blue']

const config = {
  url: "https://api.example.com",
  timeout: 3000,
} as const;
// 类型: { readonly url: "https://api.example.com"; readonly timeout: 3000 }

console.log("const 断言:", colors);
console.log("config 断言:", config);

// 双重断言 (慎用！绕过类型检查)
// const str = (someValue as unknown as number);

// ========== 6. 字面量类型 ==========
console.log("\n6. 字面量类型");

// 字符串字面量
type Theme = "light" | "dark" | "auto";
let currentTheme: Theme = "dark";
// currentTheme = 'blue'; // ❌ Error

// 数字字面量
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;
let roll: DiceRoll = 3;

// 布尔字面量
type True = true;
let t: True = true;

// 模板字面量类型
type EventName = `on${Capitalize<"click" | "focus" | "blur">}`;
// 'onClick' | 'onFocus' | 'onBlur'

console.log("主题:", currentTheme);
console.log("骰子:", roll);

// ========== 7. 类型推断 ==========
console.log("\n7. 类型推断");

// TypeScript 可以自动推断类型，不必每处都写
let inferStr = "hello"; // 推断为 string
let inferNum = 42; // 推断为 number
let inferArr = [1, 2, 3]; // 推断为 number[]
let inferObj = { x: 1, y: 2 }; // 推断为 { x: number; y: number }

// 函数返回类型推断
function add(a: number, b: number) {
  return a + b; // 返回类型自动推断为 number
}

// 上下文类型推断
const names = ["Alice", "Bob", "Charlie"];
names.forEach((name) => {
  // name 自动推断为 string
  console.log("  名字:", name.toUpperCase());
});

console.log(`
最佳实践:
1. 变量声明时不需要标注明显类型 → let x = 42
2. 函数参数必须标注类型 → function f(x: number)
3. 函数返回类型通常可以省略（但公共 API 建议标注）
4. 不确定类型时用 unknown 而不是 any
`);

console.log("=== 基础类型完成 ===");
