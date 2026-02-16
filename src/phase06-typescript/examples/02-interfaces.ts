// TypeScript 接口与类型别名
// 运行: npx ts-node 02-interfaces.ts 或 npx tsx 02-interfaces.ts

console.log("=== 接口与类型别名 ===\n");

// ========== 1. 基本接口 ==========
console.log("1. 基本接口");

interface User {
  name: string;
  age: number;
  email?: string; // 可选属性
  readonly id: number; // 只读属性
}

const user: User = {
  id: 1,
  name: "张三",
  age: 25,
};
// user.id = 2; // ❌ Error: 只读属性不能修改
user.age = 26; // ✓ 可以修改非只读属性

console.log("用户:", user);

// ========== 2. 函数类型接口 ==========
console.log("\n2. 函数类型接口");

interface SearchFunc {
  (source: string, subString: string): boolean;
}

const mySearch: SearchFunc = (source, subString) => {
  return source.includes(subString);
};

console.log("搜索 hello 中的 ell:", mySearch("hello", "ell"));

// 带有属性的可调用接口
interface Counter {
  (): void;
  count: number;
  reset(): void;
}

function createCounter(): Counter {
  const counter = function () {
    counter.count++;
  } as Counter;
  counter.count = 0;
  counter.reset = () => {
    counter.count = 0;
  };
  return counter;
}

const counter = createCounter();
counter();
counter();
console.log("计数器:", counter.count); // 2
counter.reset();
console.log("重置后:", counter.count); // 0

// ========== 3. 索引签名 ==========
console.log("\n3. 索引签名");

// 字符串索引
interface StringDictionary {
  [key: string]: string;
}

const dict: StringDictionary = {
  hello: "你好",
  world: "世界",
};
console.log("字典:", dict);

// 数字索引
interface StringArray {
  [index: number]: string;
}
const arr: StringArray = ["a", "b", "c"];
console.log("数组:", arr[0]);

// 混合索引签名
interface HybridMap {
  [key: string]: string | number;
  length: number; // OK: number 是 string | number 的子类型
  name: string; // OK: string 是 string | number 的子类型
}

// ========== 4. 接口继承 ==========
console.log("\n4. 接口继承");

interface Person {
  name: string;
  age: number;
}

interface Employee extends Person {
  employeeId: number;
  department: string;
}

// 多继承
interface Printable {
  print(): void;
}

interface Manager extends Employee, Printable {
  subordinates: Employee[];
}

const manager: Manager = {
  name: "李四",
  age: 35,
  employeeId: 1001,
  department: "技术部",
  subordinates: [],
  print() {
    console.log(`${this.name} - ${this.department}`);
  },
};

manager.print();

// ========== 5. 类型别名 (type) ==========
console.log("\n5. 类型别名");

// 基本类型别名
type ID = string | number;
type Point = { x: number; y: number };

const userId: ID = "user-123";
const point: Point = { x: 10, y: 20 };
console.log("ID:", userId);
console.log("Point:", point);

// 联合类型
type Status = "pending" | "success" | "error";
let currentStatus: Status = "pending";
console.log("状态:", currentStatus);

// 交叉类型
type Admin = User & { role: string; permissions: string[] };
const admin: Admin = {
  id: 1,
  name: "管理员",
  age: 30,
  role: "super-admin",
  permissions: ["read", "write", "delete"],
};
console.log("管理员:", admin.name, admin.role);

// 函数类型
type Callback = (data: string) => void;
type AsyncCallback = (data: string) => Promise<void>;

const myCallback: Callback = (data) => {
  console.log("回调:", data);
};
myCallback("hello");

// 泛型类型别名
type Container<T> = { value: T; timestamp: Date };

const strContainer: Container<string> = {
  value: "hello",
  timestamp: new Date(),
};
console.log("泛型容器:", strContainer);

// ========== 6. interface vs type ==========
console.log("\n6. interface vs type 对比");

// ---- 声明合并 (interface 独有) ----
interface Window {
  customProp: string;
}
interface Window {
  anotherProp: number;
}
// Window 自动合并为 { customProp: string; anotherProp: number }

// type 不支持声明合并
// type MyType = { a: string };
// type MyType = { b: number }; // ❌ Error: 重复标识符

// ---- 联合类型 (type 独有) ----
type StringOrNumber = string | number;
// interface 不能直接表示联合类型

// ---- 扩展方式 ----
// interface 使用 extends
interface Animal {
  name: string;
}
interface Dog extends Animal {
  breed: string;
}

// type 使用 & (交叉类型)
type AnimalType = { name: string };
type DogType = AnimalType & { breed: string };

// ---- 映射类型 (type 独有) ----
type ReadonlyUser = {
  readonly [K in keyof User]: User[K];
};

// ---- 实现 (都支持) ----
interface Serializable {
  serialize(): string;
}

class JsonData implements Serializable {
  constructor(private data: unknown) {}
  serialize(): string {
    return JSON.stringify(this.data);
  }
}

const json = new JsonData({ key: "value" });
console.log("序列化:", json.serialize());

console.log(`
┌─────────────────┬────────────────────┬────────────────────┐
│     特性         │     interface      │        type        │
├─────────────────┼────────────────────┼────────────────────┤
│ 扩展方式        │ extends            │ & (交叉类型)       │
│ 声明合并        │ ✅ 支持            │ ❌ 不支持          │
│ 原始类型别名    │ ❌ 不支持          │ ✅ 支持            │
│ 联合类型        │ ❌ 不支持          │ ✅ 支持            │
│ 映射类型        │ ❌ 不支持          │ ✅ 支持            │
│ 类实现          │ ✅ implements      │ ✅ implements      │
│ 性能            │ ✅ 更优 (缓存)     │ 每次重新计算       │
└─────────────────┴────────────────────┴────────────────────┘

推荐:
• 定义对象形状、类的契约 → 用 interface
• 联合类型、映射类型、复杂组合 → 用 type
• 对外公共 API → 用 interface (可扩展)
`);

// ========== 7. 实用模式 ==========
console.log("7. 实用模式");

// 递归接口
interface TreeNode<T> {
  value: T;
  children?: TreeNode<T>[];
}

const tree: TreeNode<string> = {
  value: "根节点",
  children: [
    { value: "子节点1" },
    {
      value: "子节点2",
      children: [{ value: "孙节点1" }],
    },
  ],
};
console.log("树结构:", JSON.stringify(tree, null, 2));

// 接口与 class 结合
interface Validator<T> {
  validate(value: T): boolean;
  errorMessage: string;
}

class EmailValidator implements Validator<string> {
  errorMessage = "邮箱格式不正确";

  validate(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

const emailValidator = new EmailValidator();
console.log("验证 test@email.com:", emailValidator.validate("test@email.com"));
console.log("验证 invalid:", emailValidator.validate("invalid"));

console.log("\n=== 接口与类型别名完成 ===");
