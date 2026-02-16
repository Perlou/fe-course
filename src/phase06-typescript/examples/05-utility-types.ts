// TypeScript 工具类型
// 运行: npx ts-node 05-utility-types.ts 或 npx tsx 05-utility-types.ts

console.log("=== TypeScript 工具类型 ===\n");

// ========== 示例接口 ==========
interface User {
  id: number;
  name: string;
  age: number;
  email: string;
  avatar?: string;
}

// ========== 1. 属性修饰工具类型 ==========
console.log("1. 属性修饰工具类型");

// Partial<T>: 所有属性变为可选
type PartialUser = Partial<User>;
// { id?: number; name?: string; age?: number; email?: string; avatar?: string }

function updateUser(user: User, updates: Partial<User>): User {
  return { ...user, ...updates };
}

const user: User = { id: 1, name: "张三", age: 25, email: "z@t.com" };
const updated = updateUser(user, { age: 26, email: "new@t.com" });
console.log("Partial 更新:", updated);

// Required<T>: 所有属性变为必选
type RequiredUser = Required<User>;
// avatar 从可选变为必选

// Readonly<T>: 所有属性变为只读
type ReadonlyUser = Readonly<User>;
const frozenUser: ReadonlyUser = {
  id: 1,
  name: "张三",
  age: 25,
  email: "z@t.com",
};
// frozenUser.name = '李四'; // ❌ Error: 只读属性

console.log("Readonly:", frozenUser);

// ========== 2. 选取与排除 ==========
console.log("\n2. 选取与排除");

// Pick<T, K>: 选取部分属性
type UserBasic = Pick<User, "id" | "name">;
// { id: number; name: string }

const basicUser: UserBasic = { id: 1, name: "张三" };
console.log("Pick:", basicUser);

// Omit<T, K>: 排除部分属性
type UserWithoutEmail = Omit<User, "email" | "avatar">;
// { id: number; name: string; age: number }

const noEmail: UserWithoutEmail = { id: 1, name: "张三", age: 25 };
console.log("Omit:", noEmail);

// Record<K, V>: 构造键值类型
type PageInfo = Record<
  "home" | "about" | "contact",
  { title: string; url: string }
>;

const pages: PageInfo = {
  home: { title: "首页", url: "/" },
  about: { title: "关于", url: "/about" },
  contact: { title: "联系", url: "/contact" },
};
console.log("Record:", pages);

// ========== 3. 联合类型操作 ==========
console.log("\n3. 联合类型操作");

type AllTypes = string | number | boolean | null | undefined;

// Exclude<T, U>: 从 T 中排除可赋值给 U 的类型
type NoNull = Exclude<AllTypes, null | undefined>;
// string | number | boolean

// Extract<T, U>: 从 T 中提取可赋值给 U 的类型
type Primitives = Extract<AllTypes, string | number>;
// string | number

// NonNullable<T>: 排除 null 和 undefined
type Defined = NonNullable<string | null | undefined>;
// string

console.log("这些都是编译时类型操作");

// ========== 4. 函数相关工具类型 ==========
console.log("\n4. 函数相关工具类型");

function createUser(name: string, age: number, email: string): User {
  return { id: Date.now(), name, age, email };
}

// ReturnType<T>: 获取函数返回类型
type CreateUserReturn = ReturnType<typeof createUser>;
// User

// Parameters<T>: 获取函数参数类型 (元组)
type CreateUserParams = Parameters<typeof createUser>;
// [string, number, string]

// 利用参数类型创建包装函数
function logAndCreate(
  ...args: Parameters<typeof createUser>
): ReturnType<typeof createUser> {
  console.log("  创建用户参数:", args);
  return createUser(...args);
}

const newUser = logAndCreate("李四", 30, "li@t.com");
console.log("  创建结果:", newUser);

// ConstructorParameters<T>: 构造函数参数
class Animal {
  constructor(
    public name: string,
    public legs: number,
  ) {}
}

type AnimalParams = ConstructorParameters<typeof Animal>;
// [string, number]

// InstanceType<T>: 构造函数实例类型
type AnimalInstance = InstanceType<typeof Animal>;
// Animal

// ========== 5. 字符串操作类型 ==========
console.log("\n5. 字符串操作类型");

type T1 = Uppercase<"hello">; // 'HELLO'
type T2 = Lowercase<"HELLO">; // 'hello'
type T3 = Capitalize<"hello">; // 'Hello'
type T4 = Uncapitalize<"Hello">; // 'hello'

// 实用案例: API 路径类型
type ApiEndpoint = "/users" | "/posts" | "/comments";
type ApiMethod = "get" | "post" | "put" | "delete";
type ApiKey = `${Uppercase<ApiMethod>} ${ApiEndpoint}`;
// 'GET /users' | 'GET /posts' | ... (共 12 种组合)

console.log("字符串类型操作在编译时完成");

// ========== 6. 手动实现工具类型 ==========
console.log("\n6. 手动实现工具类型");

// --- Partial 实现 ---
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

// --- Required 实现 ---
type MyRequired<T> = {
  [K in keyof T]-?: T[K]; // -? 移除可选修饰符
};

// --- Readonly 实现 ---
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

// --- Pick 实现 ---
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// --- Omit 实现 ---
type MyOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// --- Record 实现 ---
type MyRecord<K extends keyof any, V> = {
  [P in K]: V;
};

// --- Exclude 实现 ---
type MyExclude<T, U> = T extends U ? never : T;

// --- Extract 实现 ---
type MyExtract<T, U> = T extends U ? T : never;

// --- NonNullable 实现 ---
type MyNonNullable<T> = T extends null | undefined ? never : T;

// --- ReturnType 实现 ---
type MyReturnType<T extends (...args: any) => any> = T extends (
  ...args: any
) => infer R
  ? R
  : any;

// --- Parameters 实现 ---
type MyParameters<T extends (...args: any) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never;

console.log(`
工具类型实现原理:
┌────────────────┬──────────────────────────────────────┐
│ Partial        │ [K in keyof T]?: T[K]                │
│ Required       │ [K in keyof T]-?: T[K]               │
│ Readonly       │ readonly [K in keyof T]: T[K]        │
│ Pick           │ [P in K]: T[P]  (K extends keyof T)  │
│ Omit           │ Pick<T, Exclude<keyof T, K>>         │
│ Record         │ [P in K]: V                          │
│ Exclude        │ T extends U ? never : T              │
│ Extract        │ T extends U ? T : never              │
│ NonNullable    │ T extends null|undefined ? never : T  │
│ ReturnType     │ infer R from (...args) => R          │
│ Parameters     │ infer P from (...args: P) => any     │
└────────────────┴──────────────────────────────────────┘
`);

// ========== 7. 类型体操实战 ==========
console.log("7. 类型体操实战");

// --- DeepReadonly: 深度只读 ---
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K] // 函数不递归
      : DeepReadonly<T[K]> // 对象递归处理
    : T[K];
};

interface NestedConfig {
  db: {
    host: string;
    port: number;
    options: {
      ssl: boolean;
    };
  };
}

type ReadonlyConfig = DeepReadonly<NestedConfig>;
// 所有嵌套属性都变为 readonly

// --- DeepPartial: 深度可选 ---
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepPartial<T[K]>
    : T[K];
};

// --- Flatten: 展开数组 ---
type Flatten<T> = T extends (infer U)[] ? Flatten<U> : T;

type F1 = Flatten<number[][]>; // number
type F2 = Flatten<string[][][]>; // string

// --- TupleToUnion: 元组转联合 ---
type TupleToUnion<T extends any[]> = T[number];

type TU = TupleToUnion<["a", "b", "c"]>; // 'a' | 'b' | 'c'

// --- UnionToIntersection: 联合转交叉 ---
type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (
  x: infer I,
) => void
  ? I
  : never;

type UI = UnionToIntersection<{ a: 1 } | { b: 2 }>;
// { a: 1 } & { b: 2 }

// --- Awaited (手动实现): 解包 Promise ---
type MyAwaited<T> = T extends Promise<infer U> ? MyAwaited<U> : T;

type AW = MyAwaited<Promise<Promise<string>>>; // string

// --- PathKeys: 提取嵌套对象路径 ---
type PathKeys<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends object
    ? `${Prefix}${K}` | PathKeys<T[K], `${Prefix}${K}.`>
    : `${Prefix}${K}`;
}[keyof T & string];

interface AppConfig {
  app: {
    name: string;
    version: string;
  };
  db: {
    host: string;
    port: number;
  };
}

type ConfigPaths = PathKeys<AppConfig>;
// 'app' | 'app.name' | 'app.version' | 'db' | 'db.host' | 'db.port'

console.log("类型体操都是编译时计算，运行时已完全擦除");

// ========== 8. 实际应用场景 ==========
console.log("\n8. 实际应用场景");

// 场景1: API 响应类型
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

type UserListResponse = ApiResponse<User[]>;
type UserDetailResponse = ApiResponse<User>;

// 场景2: 表单状态
type FormState<T> = {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
};

type UserForm = FormState<Pick<User, "name" | "email" | "age">>;

const form: UserForm = {
  values: { name: "", email: "", age: 0 },
  errors: { email: "邮箱格式不正确" },
  touched: { name: true, email: true },
  isValid: false,
  isSubmitting: false,
};
console.log("表单状态:", form);

// 场景3: 不可变状态管理
type Action =
  | { type: "SET_NAME"; payload: string }
  | { type: "SET_AGE"; payload: number }
  | { type: "RESET" };

function reducer(state: DeepReadonly<User>, action: Action): User {
  switch (action.type) {
    case "SET_NAME":
      return { ...state, name: action.payload };
    case "SET_AGE":
      return { ...state, age: action.payload };
    case "RESET":
      return { id: 0, name: "", age: 0, email: "" };
  }
}

const initialState: User = { id: 1, name: "张三", age: 25, email: "z@t.com" };
const newState = reducer(initialState, { type: "SET_NAME", payload: "李四" });
console.log("Reducer:", newState);

console.log(`
常用工具类型速查:
┌─────────────────┬──────────────────────┬──────────────────────┐
│ 类型             │ 作用                 │ 使用场景              │
├─────────────────┼──────────────────────┼──────────────────────┤
│ Partial<T>      │ 所有属性可选          │ 更新操作              │
│ Required<T>     │ 所有属性必选          │ 严格验证              │
│ Readonly<T>     │ 所有属性只读          │ 不可变数据            │
│ Pick<T,K>       │ 选取部分属性          │ 精简对象              │
│ Omit<T,K>       │ 排除部分属性          │ 隐藏敏感字段          │
│ Record<K,V>     │ 构造键值对            │ 字典/映射             │
│ Exclude<T,U>    │ 从联合排除            │ 过滤类型              │
│ Extract<T,U>    │ 从联合提取            │ 筛选类型              │
│ ReturnType<T>   │ 函数返回类型          │ 类型复用              │
│ Parameters<T>   │ 函数参数类型          │ 包装函数              │
└─────────────────┴──────────────────────┴──────────────────────┘
`);

console.log("=== 工具类型完成 ===");
