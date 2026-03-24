// WebAssembly 基础详解
// 运行: node 02-wasm-bindbs.js

console.log("=== WebAssembly 基础 ===\n");

// ========== 1. 手写 WASM 模块 (WAT 格式) ==========
console.log("1. WASM 二进制格式\n");

// WAT (WebAssembly Text Format) → WASM 二进制
// 这是一个手写的最小 WASM 模块
function createMinimalWasm() {
  // WASM 魔数 + 版本 + 类型段 + 函数段 + 导出段 + 代码段
  return new Uint8Array([
    // 魔数 \0asm
    0x00, 0x61, 0x73, 0x6d,
    // 版本 1
    0x01, 0x00, 0x00, 0x00,
    // 类型段 (section 1): 定义函数签名 (i32, i32) -> i32
    0x01, 0x07, 0x01, 0x60, 0x02, 0x7f, 0x7f, 0x01, 0x7f,
    // 函数段 (section 3): 函数 0 使用类型 0
    0x03, 0x02, 0x01, 0x00,
    // 导出段 (section 7): 导出函数 "add"
    0x07, 0x07, 0x01, 0x03, 0x61, 0x64, 0x64, 0x00, 0x00,
    // 代码段 (section 10): 函数体
    0x0a, 0x09, 0x01, 0x07, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6a, 0x0b,
  ]);
}

const wasmBytes = createMinimalWasm();
console.log(`  手写 WASM 模块: ${wasmBytes.length} 字节`);
console.log(`  魔数: \\0asm (${Array.from(wasmBytes.slice(0, 4)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ')})`);
console.log(`  版本: ${wasmBytes[4]}\n`);

// 实例化
async function loadWasm() {
  const { instance } = await WebAssembly.instantiate(wasmBytes);
  console.log(`  导出函数: ${Object.keys(instance.exports)}`);
  console.log(`  add(3, 4) = ${instance.exports.add(3, 4)}`);
  console.log(`  add(100, 200) = ${instance.exports.add(100, 200)}`);

  // ========== 2. WASM 模块结构 ==========
  console.log("\n2. WASM 模块结构\n");
  console.log(`
  WASM 二进制格式:
  ┌──────────────────────────────────────────┐
  │ 魔数 (\\0asm)  4 字节                    │
  │ 版本          4 字节                     │
  ├──────────────────────────────────────────┤
  │ Section 1: Type    (函数签名)            │
  │ Section 2: Import  (导入)                │
  │ Section 3: Function(函数声明)            │
  │ Section 4: Table   (函数表)              │
  │ Section 5: Memory  (内存)                │
  │ Section 6: Global  (全局变量)            │
  │ Section 7: Export  (导出)                │
  │ Section 8: Start   (启动函数)            │
  │ Section 9: Element (表元素)              │
  │ Section 10: Code   (函数体)              │
  │ Section 11: Data   (数据初始化)          │
  └──────────────────────────────────────────┘

  WAT (文本格式) 等价:
  (module
    (func $add (param $a i32) (param $b i32) (result i32)
      local.get $a
      local.get $b
      i32.add
    )
    (export "add" (func $add))
  )
  `);

  // ========== 3. 加载方式 ==========
  console.log("3. WASM 加载方式对比\n");
  console.log(`
  方式 1: WebAssembly.instantiate (推荐)
  ┌──────────────────────────────────────────┐
  │ const { instance } = await               │
  │   WebAssembly.instantiate(bytes, imports);│
  │ // 同时编译和实例化                       │
  └──────────────────────────────────────────┘

  方式 2: 流式编译 (最推荐)
  ┌──────────────────────────────────────────┐
  │ const { instance } = await               │
  │   WebAssembly.instantiateStreaming(       │
  │     fetch('module.wasm'), imports         │
  │   );                                     │
  │ // 边下载边编译                          │
  └──────────────────────────────────────────┘

  方式 3: 预编译 + 缓存
  ┌──────────────────────────────────────────┐
  │ const module = await                     │
  │   WebAssembly.compileStreaming(           │
  │     fetch('module.wasm')                 │
  │   );                                     │
  │ // 缓存到 IndexedDB                     │
  │ const instance =                         │
  │   await WebAssembly.instantiate(module); │
  └──────────────────────────────────────────┘
  `);

  // ========== 4. 工具链 ==========
  console.log("4. WASM 工具链\n");
  console.log(`
  源语言 → 工具链 → WASM:
  ┌────────────────┬──────────────────┬────────────────┐
  │ 源语言          │ 工具链            │ 产物           │
  ├────────────────┼──────────────────┼────────────────┤
  │ Rust           │ wasm-pack        │ .wasm + .js    │
  │ C/C++          │ Emscripten       │ .wasm + .js    │
  │ Go             │ GOOS=js GOARCH=  │ .wasm          │
  │ AssemblyScript │ asc              │ .wasm          │
  │ TypeScript     │ AssemblyScript   │ .wasm          │
  └────────────────┴──────────────────┴────────────────┘

  推荐: Rust + wasm-pack (类型安全 + 小体积 + 高性能)
  `);
}

loadWasm().then(() => {
  console.log("=== WebAssembly 基础完成 ===");
});
