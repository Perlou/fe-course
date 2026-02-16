// TypeScript 泛型
// 运行: npx ts-node 03-generics.ts 或 npx tsx 03-generics.ts

console.log("=== TypeScript 泛型 ===\n");

// ========== 1. 为什么需要泛型？ ==========
console.log("1. 为什么需要泛型？");

// 不使用泛型 → 要么失去类型信息，要么写多个函数
function identityAny(arg: any): any {
  return arg; // 返回类型是 any，丢失了类型信息
}

function identityString(arg: string): string {
  return arg;
}

function identityNumber(arg: number): number {
  return arg;
}
// 太多重复代码！

// 使用泛型 → 一个函数解决所有类型
function identity<T>(arg: T): T {
  return arg;
}

// 显式指定类型
const str = identity<string>("hello");
// 类型推断 (推荐)
const num = identity(42); // T 推断为 number

console.log("泛型函数:", str, num);

// ========== 2. 泛型函数 ==========
console.log("\n2. 泛型函数");

// 多个类型参数
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}
console.log("pair:", pair("hello", 42));
console.log("pair:", pair(true, [1, 2, 3]));

// 交换元组
function swap<T, U>(tuple: [T, U]): [U, T] {
  return [tuple[1], tuple[0]];
}
console.log("swap:", swap(["hello", 42])); // [42, 'hello']

// 泛型箭头函数
const toArray = <T>(value: T): T[] => [value];
console.log("toArray:", toArray("hello")); // ['hello']

// 柯里化
function curry<A, B, C>(fn: (a: A, b: B) => C): (a: A) => (b: B) => C {
  return (a) => (b) => fn(a, b);
}

const add = (a: number, b: number) => a + b;
const curriedAdd = curry(add);
console.log("柯里化:", curriedAdd(1)(2)); // 3

// ========== 3. 泛型约束 ==========
console.log("\n3. 泛型约束");

// extends 约束
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): number {
  console.log(`  长度: ${arg.length}`);
  return arg.length;
}

logLength("hello"); // OK: string 有 length
logLength([1, 2, 3]); // OK: array 有 length
logLength({ length: 10, name: "test" }); // OK: 有 length 属性
// logLength(123);       // ❌ Error: number 没有 length

// keyof 约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "张三", age: 25, email: "zhang@test.com" };
console.log("name:", getProperty(user, "name")); // OK
console.log("age:", getProperty(user, "age")); // OK
// getProperty(user, 'phone'); // ❌ Error: 'phone' 不在 keyof User 中

// 多重约束
interface Printable {
  print(): void;
}
interface Loggable {
  log(): void;
}

function process<T extends Printable & Loggable>(item: T): void {
  item.print();
  item.log();
}

// ========== 4. 泛型接口 ==========
console.log("\n4. 泛型接口");

// 泛型仓储接口
interface Repository<T> {
  findById(id: number): T | undefined;
  findAll(): T[];
  save(item: T): void;
  delete(id: number): boolean;
}

// 实现泛型接口
interface Product {
  id: number;
  name: string;
  price: number;
}

class InMemoryRepository<T extends { id: number }> implements Repository<T> {
  private items: T[] = [];

  findById(id: number): T | undefined {
    return this.items.find((item) => item.id === id);
  }

  findAll(): T[] {
    return [...this.items];
  }

  save(item: T): void {
    const index = this.items.findIndex((i) => i.id === item.id);
    if (index >= 0) {
      this.items[index] = item;
    } else {
      this.items.push(item);
    }
  }

  delete(id: number): boolean {
    const index = this.items.findIndex((i) => i.id === id);
    if (index >= 0) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }
}

const productRepo = new InMemoryRepository<Product>();
productRepo.save({ id: 1, name: "手机", price: 5999 });
productRepo.save({ id: 2, name: "笔记本", price: 8999 });
console.log("所有产品:", productRepo.findAll());
console.log("查找 ID=1:", productRepo.findById(1));

// ========== 5. 泛型类 ==========
console.log("\n5. 泛型类");

// 泛型栈 (Stack)
class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);
numberStack.push(3);
console.log("栈顶:", numberStack.peek()); // 3
console.log("弹出:", numberStack.pop()); // 3
console.log("大小:", numberStack.size()); // 2

// 泛型 Map
class TypedMap<K, V> {
  private entries: Array<[K, V]> = [];

  set(key: K, value: V): void {
    const index = this.entries.findIndex(([k]) => k === key);
    if (index >= 0) {
      this.entries[index] = [key, value];
    } else {
      this.entries.push([key, value]);
    }
  }

  get(key: K): V | undefined {
    const entry = this.entries.find(([k]) => k === key);
    return entry?.[1];
  }

  has(key: K): boolean {
    return this.entries.some(([k]) => k === key);
  }
}

const userMap = new TypedMap<string, number>();
userMap.set("alice", 25);
userMap.set("bob", 30);
console.log("alice:", userMap.get("alice"));

// ========== 6. 泛型默认值 ==========
console.log("\n6. 泛型默认值");

interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

// 不指定类型时使用默认值
const response1: ApiResponse = {
  code: 200,
  message: "OK",
  data: "任意数据",
};

// 指定具体类型
const response2: ApiResponse<{ users: string[] }> = {
  code: 200,
  message: "OK",
  data: { users: ["Alice", "Bob"] },
};

console.log("默认泛型:", response1);
console.log("指定泛型:", response2);

// 有默认值的事件系统
interface EventEmitter<
  Events extends Record<string, unknown> = Record<string, unknown>,
> {
  on<K extends keyof Events>(
    event: K,
    handler: (data: Events[K]) => void,
  ): void;
  emit<K extends keyof Events>(event: K, data: Events[K]): void;
}

// ========== 7. 泛型工具函数 ==========
console.log("\n7. 泛型工具函数");

// 数组去重
function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}
console.log("去重:", unique([1, 2, 2, 3, 3, 3]));

// 分组
function groupBy<T, K extends string | number>(
  arr: T[],
  keyFn: (item: T) => K,
): Record<K, T[]> {
  return arr.reduce(
    (groups, item) => {
      const key = keyFn(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    },
    {} as Record<K, T[]>,
  );
}

const people = [
  { name: "Alice", dept: "Engineering" },
  { name: "Bob", dept: "Marketing" },
  { name: "Charlie", dept: "Engineering" },
];
console.log(
  "分组:",
  groupBy(people, (p) => p.dept),
);

// 类型安全的 pick
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    result[key] = obj[key];
  });
  return result;
}

const fullUser = { name: "张三", age: 25, email: "z@t.com", phone: "123" };
const partial = pick(fullUser, ["name", "email"]);
console.log("pick:", partial); // { name: '张三', email: 'z@t.com' }

console.log(`
泛型使用原则:
1. 当类型参数出现在多处时才用泛型
2. 能用类型推断就不要显式指定
3. 约束越精确越好 (extends)
4. 给泛型有意义的名字 (T=Type, K=Key, V=Value, E=Element)
`);

console.log("=== 泛型完成 ===");
