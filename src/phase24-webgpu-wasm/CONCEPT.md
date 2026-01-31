# WebGPU 与 WebAssembly 深入解析

## 📌 一、WebGPU

### 1. 概述

```
WebGPU vs WebGL:
• 更现代的 API 设计
• 更好的性能
• 计算着色器支持
• 更低级的硬件访问
```

### 2. 基础设置

```javascript
// 检查支持
if (!navigator.gpu) {
  throw new Error("WebGPU not supported");
}

// 获取适配器和设备
const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();

// 获取 Canvas 上下文
const canvas = document.getElementById("canvas");
const context = canvas.getContext("webgpu");
const format = navigator.gpu.getPreferredCanvasFormat();
context.configure({ device, format });
```

### 3. 渲染管线

```javascript
// 着色器
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
  `,
});

// 渲染管线
const pipeline = device.createRenderPipeline({
  layout: "auto",
  vertex: {
    module: shaderModule,
    entryPoint: "vertexMain",
  },
  fragment: {
    module: shaderModule,
    entryPoint: "fragmentMain",
    targets: [{ format }],
  },
});

// 渲染
function render() {
  const encoder = device.createCommandEncoder();
  const pass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view: context.getCurrentTexture().createView(),
        loadOp: "clear",
        clearValue: { r: 0, g: 0, b: 0, a: 1 },
        storeOp: "store",
      },
    ],
  });

  pass.setPipeline(pipeline);
  pass.draw(3);
  pass.end();

  device.queue.submit([encoder.finish()]);
  requestAnimationFrame(render);
}
render();
```

### 4. 计算着色器

```javascript
const computeShader = device.createShaderModule({
  code: `
    @group(0) @binding(0) var<storage, read_write> data: array<f32>;
    
    @compute @workgroup_size(64)
    fn main(@builtin(global_invocation_id) id: vec3u) {
      data[id.x] = data[id.x] * 2.0;
    }
  `,
});

const computePipeline = device.createComputePipeline({
  layout: "auto",
  compute: {
    module: computeShader,
    entryPoint: "main",
  },
});
```

---

## 📌 二、WebAssembly

### 1. 概述

```
WebAssembly (WASM):
• 二进制指令格式
• 接近原生性能
• 支持多种语言编译
• 沙箱安全环境
```

### 2. 使用方式

```javascript
// 加载并实例化
const { instance } = await WebAssembly.instantiateStreaming(
  fetch("module.wasm"),
  { env: { log: console.log } }
);

// 调用导出函数
const result = instance.exports.add(1, 2);

// 内存操作
const memory = instance.exports.memory;
const buffer = new Uint8Array(memory.buffer);
```

### 3. Rust 编译到 WASM

```rust
// src/lib.rs
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[wasm_bindgen]
pub fn fibonacci(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2)
    }
}
```

```toml
# Cargo.toml
[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"
```

```bash
# 编译
wasm-pack build --target web
```

```javascript
// 使用
import init, { add, fibonacci } from "./pkg/my_wasm.js";

await init();
console.log(add(1, 2));
console.log(fibonacci(10));
```

### 4. 性能对比

```
适合 WASM 的场景:
• 计算密集型任务
• 游戏引擎
• 音视频处理
• 图像处理
• 加密算法
• 物理模拟

不适合的场景:
• DOM 操作
• 简单的 UI 交互
• 小型计算任务
```

---

## 📌 三、实际应用

### 图像处理

```rust
#[wasm_bindgen]
pub fn grayscale(data: &mut [u8]) {
    for i in (0..data.len()).step_by(4) {
        let r = data[i] as f32;
        let g = data[i + 1] as f32;
        let b = data[i + 2] as f32;
        let gray = (0.299 * r + 0.587 * g + 0.114 * b) as u8;
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
    }
}
```

```javascript
// 使用
const imageData = ctx.getImageData(0, 0, width, height);
grayscale(imageData.data);
ctx.putImageData(imageData, 0, 0);
```

---

## 📚 推荐学习资源

| 资源         | 链接                            |
| ------------ | ------------------------------- |
| WebGPU       | gpuweb.github.io/gpuweb         |
| WebAssembly  | webassembly.org                 |
| wasm-bindgen | rustwasm.github.io/wasm-bindgen |

---
