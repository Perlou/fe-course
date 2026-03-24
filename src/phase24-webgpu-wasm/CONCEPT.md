# WebGPU 与 WebAssembly 深入解析

## 📌 一、WebGPU

### 1. 概述

```
WebGPU vs WebGL:
┌─────────────────┬──────────────────┬──────────────────┐
│                 │     WebGL        │     WebGPU       │
├─────────────────┼──────────────────┼──────────────────┤
│ API 设计        │ 有状态机         │ 无状态，对象化   │
│ 着色器          │ GLSL             │ WGSL             │
│ 计算着色器      │ ❌ 不支持        │ ✅ 支持          │
│ 多线程          │ ❌               │ ✅ 命令编码并行  │
│ 底层映射        │ OpenGL ES        │ Vulkan/Metal/D3D │
│ 错误处理        │ 静默失败         │ 显式错误         │
│ 资源管理        │ 手动绑定         │ BindGroup 管理   │
└─────────────────┴──────────────────┴──────────────────┘
```

### 2. 基础设置

```javascript
// 检查支持
if (!navigator.gpu) {
  throw new Error('WebGPU not supported');
}

// 获取适配器和设备
const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();

// Canvas 上下文
const canvas = document.getElementById('canvas');
const context = canvas.getContext('webgpu');
const format = navigator.gpu.getPreferredCanvasFormat();
context.configure({ device, format });
```

### 3. 渲染管线

```javascript
const shaderModule = device.createShaderModule({
  code: `
    @vertex
    fn vertexMain(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
      var pos = array<vec2f, 3>(
        vec2f( 0.0,  0.5),
        vec2f(-0.5, -0.5),
        vec2f( 0.5, -0.5)
      );
      return vec4f(pos[i], 0.0, 1.0);
    }

    @fragment
    fn fragmentMain() -> @location(0) vec4f {
      return vec4f(1.0, 0.0, 0.0, 1.0);
    }
  `
});

const pipeline = device.createRenderPipeline({
  layout: 'auto',
  vertex: { module: shaderModule, entryPoint: 'vertexMain' },
  fragment: {
    module: shaderModule, entryPoint: 'fragmentMain',
    targets: [{ format }]
  },
});
```

### 4. 命令提交

```javascript
function render() {
  const encoder = device.createCommandEncoder();
  const pass = encoder.beginRenderPass({
    colorAttachments: [{
      view: context.getCurrentTexture().createView(),
      loadOp: 'clear', clearValue: { r: 0, g: 0, b: 0, a: 1 },
      storeOp: 'store',
    }]
  });
  pass.setPipeline(pipeline);
  pass.draw(3);
  pass.end();
  device.queue.submit([encoder.finish()]);
}
```

### 5. 计算着色器

```javascript
const computeShader = device.createShaderModule({
  code: `
    @group(0) @binding(0) var<storage, read_write> data: array<f32>;

    @compute @workgroup_size(64)
    fn main(@builtin(global_invocation_id) id: vec3u) {
      data[id.x] = data[id.x] * 2.0;
    }
  `
});

// GPU Buffer
const buffer = device.createBuffer({
  size: dataSize,
  usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
});

// BindGroup
const bindGroup = device.createBindGroup({
  layout: computePipeline.getBindGroupLayout(0),
  entries: [{ binding: 0, resource: { buffer } }],
});
```

---

## 📌 二、WGSL 着色器语言

```
WGSL vs GLSL:
┌──────────────────┬──────────────────┬──────────────────┐
│                  │     GLSL         │     WGSL         │
├──────────────────┼──────────────────┼──────────────────┤
│ 类型             │ vec3, mat4       │ vec3f, mat4x4f   │
│ 入口             │ void main()      │ @vertex fn main()│
│ 属性             │ attribute/in     │ @location(0)     │
│ Uniform          │ uniform          │ @group @binding  │
│ 纹理采样         │ texture2D()      │ textureSample()  │
│ 插值             │ varying          │ 自动插值         │
└──────────────────┴──────────────────┴──────────────────┘

数据类型:
f32, i32, u32, bool
vec2f, vec3f, vec4f
vec2i, vec3i, vec4i
mat2x2f, mat3x3f, mat4x4f
array<f32, 4>
```

---

## 📌 三、WebAssembly

### 1. 概述

```
WebAssembly (WASM) 特点:
• 二进制指令格式 (紧凑、快速解码)
• 接近原生性能 (AOT/JIT 编译)
• 支持多种源语言 (Rust, C/C++, Go, AssemblyScript)
• 沙箱安全环境 (线性内存模型)
• 与 JS 互操作 (import/export)
```

### 2. 使用方式

```javascript
// 加载并实例化
const { instance } = await WebAssembly.instantiateStreaming(
  fetch('module.wasm'),
  { env: { log: console.log } }
);

// 调用导出函数
const result = instance.exports.add(1, 2);

// 内存操作
const memory = instance.exports.memory;
const buffer = new Uint8Array(memory.buffer);
```

### 3. Rust → WASM

```rust
// src/lib.rs
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn fibonacci(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2)
    }
}

#[wasm_bindgen]
pub fn grayscale(data: &mut [u8]) {
    for i in (0..data.len()).step_by(4) {
        let gray = (0.299 * data[i] as f32
                  + 0.587 * data[i+1] as f32
                  + 0.114 * data[i+2] as f32) as u8;
        data[i] = gray;
        data[i+1] = gray;
        data[i+2] = gray;
    }
}
```

```bash
# 编译
wasm-pack build --target web
```

### 4. 内存模型

```
┌──────────────────────────────────────────────────────┐
│              WASM 线性内存                             │
├──────────────────────────────────────────────────────┤
│                                                      │
│  JS 端:     ArrayBuffer / SharedArrayBuffer          │
│  WASM 端:   线性内存 (连续字节数组)                  │
│                                                      │
│  内存布局:                                            │
│  ┌────────────────────────────────────────┐           │
│  │ Stack │ Heap      │ 未使用空间        │           │
│  │       │ (malloc)  │ (可增长)          │           │
│  └────────────────────────────────────────┘           │
│  0       ↑           ↑                   max         │
│                                                      │
│  数据传递:                                            │
│  JS → WASM: 写入 ArrayBuffer, WASM 直接读取          │
│  WASM → JS: WASM 写入内存, JS 读取 ArrayBuffer       │
│                                                      │
│  TypedArray 视图:                                     │
│  const view = new Float32Array(memory.buffer);       │
│  view[0] = 3.14;  // 写入                            │
│  const result = view[1];  // 读取                    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 📌 四、性能对比

```
任务              │  JS      │  WASM    │ 加速比
──────────────────┼──────────┼──────────┼───────
斐波那契(45)      │  ~8000ms │  ~3500ms │ 2.3x
矩阵乘法(1000x)  │  ~3000ms │  ~800ms  │ 3.8x
图像灰度化(4K)   │  ~50ms   │  ~12ms   │ 4.2x
MD5 哈希          │  ~200ms  │  ~60ms   │ 3.3x
JSON 解析         │  ~5ms    │  ~8ms    │ 0.6x ❌
DOM 操作          │  ~2ms    │  N/A     │ N/A
```

---

## 📌 五、实际应用案例

```
Figma          — WASM 渲染引擎
Google Earth   — WASM 3D 引擎
AutoCAD Web    — C++ → WASM
Photoshop Web  — WASM 图像处理
FFmpeg.wasm    — 浏览器内音视频处理
SQLite WASM    — 浏览器内数据库
TensorFlow.js  — WebGPU 加速推理
```

---

## 📚 推荐学习资源

| 资源            | 链接                            |
| --------------- | ------------------------------- |
| WebGPU 规范     | gpuweb.github.io/gpuweb         |
| WebAssembly     | webassembly.org                 |
| wasm-bindgen    | rustwasm.github.io/wasm-bindgen |
| WebGPU 入门     | webgpufundamentals.org          |
| AssemblyScript  | assemblyscript.org              |

---
