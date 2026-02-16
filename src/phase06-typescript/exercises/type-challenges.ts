// TypeScript 类型挑战练习
// 每道题需要你实现指定的类型，通过编译即为正确
// 难度: ⭐ 简单 | ⭐⭐ 中等 | ⭐⭐⭐ 困难

// ============================================================
// 辅助类型: 用于验证你的答案
// ============================================================
type Expect<T extends true> = T;
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
    ? true
    : false;

// ============================================================
// 挑战 1: MyPick ⭐
// 实现内置的 Pick<T, K>，从类型 T 中选取属性 K
// ============================================================

type MyPick<T, K extends keyof T> = {
  // 在这里实现
  // 提示: 使用映射类型 [P in K]
  [P in K]: T[P];
};

// 测试
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type _test1 = Expect<Equal<MyPick<Todo, "title">, { title: string }>>;
type _test2 = Expect<
  Equal<
    MyPick<Todo, "title" | "completed">,
    { title: string; completed: boolean }
  >
>;

// ============================================================
// 挑战 2: MyReadonly ⭐
// 实现内置的 Readonly<T>，将所有属性变为只读
// ============================================================

type MyReadonly<T> = {
  // 在这里实现
  readonly [K in keyof T]: T[K];
};

// 测试
type _test3 = Expect<
  Equal<
    MyReadonly<Todo>,
    {
      readonly title: string;
      readonly description: string;
      readonly completed: boolean;
    }
  >
>;

// ============================================================
// 挑战 3: TupleToObject ⭐
// 将元组转换为对象类型，键和值都是元组的元素
// ============================================================

type TupleToObject<T extends readonly (string | number | symbol)[]> =
  // 在这里实现
  // 提示: 使用 T[number] 获取元组所有元素的联合类型
  { [K in T[number]]: K };

// 测试
const tupleTest = ["tesla", "model 3", "model X"] as const;
type _test4 = Expect<
  Equal<
    TupleToObject<typeof tupleTest>,
    { tesla: "tesla"; "model 3": "model 3"; "model X": "model X" }
  >
>;

// ============================================================
// 挑战 4: First ⭐
// 获取数组的第一个元素的类型
// ============================================================

type First<T extends any[]> =
  // 在这里实现
  // 提示: 考虑空数组的情况
  T extends [infer F, ...any[]] ? F : never;

// 测试
type _test5 = Expect<Equal<First<[3, 2, 1]>, 3>>;
type _test6 = Expect<Equal<First<[() => 123, { a: string }]>, () => 123>>;
type _test7 = Expect<Equal<First<[]>, never>>;

// ============================================================
// 挑战 5: Length ⭐
// 获取元组的长度
// ============================================================

type Length<T extends readonly any[]> =
  // 在这里实现
  T["length"];

// 测试
type _test8 = Expect<Equal<Length<[1, 2, 3]>, 3>>;
type _test9 = Expect<Equal<Length<readonly ["hello", "world"]>, 2>>;

// ============================================================
// 挑战 6: MyExclude ⭐⭐
// 实现内置的 Exclude<T, U>
// ============================================================

type MyExclude<T, U> =
  // 在这里实现
  // 提示: 利用条件类型的分发特性
  T extends U ? never : T;

// 测试
type _test10 = Expect<Equal<MyExclude<"a" | "b" | "c", "a">, "b" | "c">>;
type _test11 = Expect<Equal<MyExclude<"a" | "b" | "c", "a" | "b">, "c">>;

// ============================================================
// 挑战 7: MyReturnType ⭐⭐
// 实现内置的 ReturnType<T>
// ============================================================

type MyReturnType<T extends (...args: any) => any> =
  // 在这里实现
  // 提示: 使用 infer 推断返回类型
  T extends (...args: any) => infer R ? R : never;

// 测试
type _test12 = Expect<Equal<MyReturnType<() => string>, string>>;
type _test13 = Expect<Equal<MyReturnType<(x: number) => number[]>, number[]>>;
type _test14 = Expect<
  Equal<MyReturnType<() => Promise<boolean>>, Promise<boolean>>
>;

// ============================================================
// 挑战 8: MyOmit ⭐⭐
// 实现内置的 Omit<T, K>
// ============================================================

type MyOmit<T, K extends keyof T> =
  // 在这里实现
  // 提示: 可以组合 Pick 和 Exclude
  { [P in Exclude<keyof T, K>]: T[P] };

// 测试
type _test15 = Expect<
  Equal<MyOmit<Todo, "description">, { title: string; completed: boolean }>
>;
type _test16 = Expect<
  Equal<MyOmit<Todo, "title" | "description">, { completed: boolean }>
>;

// ============================================================
// 挑战 9: DeepReadonly ⭐⭐⭐
// 将对象的所有属性（包括嵌套）变为只读
// ============================================================

type DeepReadonly<T> =
  // 在这里实现
  // 提示: 递归处理，但函数类型不需要递归
  {
    readonly [K in keyof T]: T[K] extends object
      ? T[K] extends Function
        ? T[K]
        : DeepReadonly<T[K]>
      : T[K];
  };

// 测试
interface DeepObj {
  a: {
    b: {
      c: number;
    };
    d: string;
  };
  e: boolean;
}

type DeepResult = DeepReadonly<DeepObj>;
// 所有嵌套属性都应该是 readonly

// ============================================================
// 挑战 10: Flatten ⭐⭐⭐
// 将嵌套数组类型展平为一维
// ============================================================

type Flatten<T extends any[]> =
  // 在这里实现
  // 提示: 递归处理数组元素
  T extends [infer First, ...infer Rest]
    ? First extends any[]
      ? [...Flatten<First>, ...Flatten<Rest>]
      : [First, ...Flatten<Rest>]
    : [];

// 测试
type _test17 = Expect<Equal<Flatten<[1, 2, [3, 4], [5]]>, [1, 2, 3, 4, 5]>>;
type _test18 = Expect<Equal<Flatten<[1, [2, [3]]]>, [1, 2, [3]]>>;
type _test19 = Expect<Equal<Flatten<[]>, []>>;

// ============================================================
// 🎉 完成以上所有挑战后，你已经对 TypeScript 类型系统有了深入理解!
//
// 更多挑战请访问:
// https://github.com/type-challenges/type-challenges
// ============================================================

console.log("类型挑战文件 - 请用 IDE 查看类型错误来验证你的答案");
console.log("如果没有类型错误，说明你的实现是正确的！");
