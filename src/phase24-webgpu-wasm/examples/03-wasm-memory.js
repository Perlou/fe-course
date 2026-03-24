// WASM 内存模型详解
// 运行: node 03-wasm-memory.js

console.log("=== WASM 内存模型 ===\n");

// ========== 1. WebAssembly.Memory ==========
console.log("1. WebAssembly.Memory\n");

// 创建 WASM 内存 (1 页 = 64KB)
const memory = new WebAssembly.Memory({ initial: 1, maximum: 10 });

console.log(`  初始大小: ${memory.buffer.byteLength / 1024}KB (1 页)`);
console.log(`  最大: 10 页 (${10 * 64}KB)`);

// TypedArray 视图
const uint8View = new Uint8Array(memory.buffer);
const int32View = new Int32Array(memory.buffer);
const float64View = new Float64Array(memory.buffer);

// 写入不同类型数据
int32View[0] = 42;
int32View[1] = 100;
float64View[2] = 3.14159;

console.log(`\n  写入 int32[0] = 42, int32[1] = 100`);
console.log(`  写入 float64[2] = 3.14159`);
console.log(`  读取 int32[0] = ${int32View[0]}`);
console.log(`  读取 int32[1] = ${int32View[1]}`);
console.log(`  读取 float64[2] = ${float64View[2]}`);

// 字节视角
console.log(`\n  字节视角 (小端序):`);
console.log(`  地址 0-3: [${uint8View[0]}, ${uint8View[1]}, ${uint8View[2]}, ${uint8View[3]}] = int32(42)`);

// ========== 2. 字符串传递 ==========
console.log("\n2. JS ↔ WASM 字符串传递\n");

class WasmStringHelper {
  constructor(memory) {
    this.memory = memory;
    this.offset = 1024; // 字符串存储起始偏移
  }

  // JS string → WASM 内存
  writeString(str) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    const view = new Uint8Array(this.memory.buffer);
    const ptr = this.offset;

    // 写入长度 (4 字节) + 数据
    new DataView(this.memory.buffer).setUint32(ptr, bytes.length, true);
    view.set(bytes, ptr + 4);

    this.offset += 4 + bytes.length;
    return { ptr, len: bytes.length };
  }

  // WASM 内存 → JS string
  readString(ptr, len) {
    const view = new Uint8Array(this.memory.buffer, ptr + 4, len);
    return new TextDecoder().decode(view);
  }
}

const helper = new WasmStringHelper(memory);

const { ptr, len } = helper.writeString("Hello WASM 你好");
console.log(`  写入: "Hello WASM 你好" → ptr=${ptr}, len=${len} 字节`);
console.log(`  读取: "${helper.readString(ptr, len)}"`);

// ========== 3. 数组传递 ==========
console.log("\n3. 数组数据传递\n");

function processArrayInWasm(inputArray) {
  // 模拟: JS → WASM 内存 → 处理 → 读回
  const memory2 = new WebAssembly.Memory({ initial: 1 });
  const view = new Float32Array(memory2.buffer);

  // 写入输入
  const inputOffset = 0;
  view.set(inputArray, inputOffset);
  console.log(`  输入 (${inputArray.length} 个 f32):`);
  console.log(`    [${inputArray.join(", ")}]`);

  // "WASM 处理" — 每个元素平方
  const outputOffset = inputArray.length;
  for (let i = 0; i < inputArray.length; i++) {
    view[outputOffset + i] = view[inputOffset + i] * view[inputOffset + i];
  }

  // 读取结果
  const result = Array.from(view.slice(outputOffset, outputOffset + inputArray.length));
  console.log(`  输出 (平方):`);
  console.log(`    [${result.join(", ")}]`);

  return result;
}

processArrayInWasm([1, 2, 3, 4, 5]);

// ========== 4. 共享内存 ==========
console.log("\n4. 共享内存 (SharedArrayBuffer)\n");
console.log(`
  用于 多线程 WASM (Worker):

  // 主线程
  const shared = new WebAssembly.Memory({
    initial: 1,
    maximum: 10,
    shared: true    // 启用共享
  });

  const worker = new Worker('worker.js');
  worker.postMessage({ memory: shared });

  // Worker 线程
  self.onmessage = ({ data }) => {
    const view = new Int32Array(data.memory.buffer);
    Atomics.add(view, 0, 1);      // 原子操作
    Atomics.notify(view, 0, 1);   // 唤醒等待线程
  };

  注意事项:
  • 需要 COOP/COEP 响应头
  • 使用 Atomics API 避免竞态
  • SharedArrayBuffer 需要安全上下文 (HTTPS)
`);

// ========== 5. 内存增长 ==========
console.log("5. 内存增长\n");

const growMem = new WebAssembly.Memory({ initial: 1, maximum: 5 });
console.log(`  初始: ${growMem.buffer.byteLength / 1024}KB`);

growMem.grow(2); // 增长 2 页
console.log(`  增长 2 页后: ${growMem.buffer.byteLength / 1024}KB`);

try {
  growMem.grow(10); // 超过最大限制
} catch (e) {
  console.log(`  增长 10 页: ❌ ${e.constructor.name}`);
}

console.log(`
  ⚠️ 注意: grow() 后旧的 TypedArray 视图失效!
  const view = new Uint8Array(memory.buffer);
  memory.grow(1);
  // view 已失效! 必须重新创建:
  const newView = new Uint8Array(memory.buffer);
`);

console.log("=== WASM 内存模型完成 ===");
