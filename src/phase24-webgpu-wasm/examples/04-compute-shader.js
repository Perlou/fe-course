// GPU 计算着色器详解
// 运行: node 04-compute-shader.js (模拟 GPU 计算)

console.log("=== GPU 计算着色器 ===\n");

// ========== 1. 模拟计算着色器 ==========
console.log("1. 模拟计算着色器执行\n");

class ComputeShaderSimulator {
  constructor() {
    this.workgroupSize = [64, 1, 1];
    this.bindings = new Map();
  }

  // 绑定数据
  bind(index, data) {
    this.bindings.set(index, data);
  }

  // 分派工作组
  dispatch(numGroups, shaderFn) {
    const [wgX] = this.workgroupSize;
    const totalInvocations = numGroups * wgX;

    console.log(`  工作组大小: ${wgX}`);
    console.log(`  分派数量: ${numGroups} 组`);
    console.log(`  总调用: ${totalInvocations} 次\n`);

    // 模拟每个工作组中每个线程执行
    for (let group = 0; group < numGroups; group++) {
      for (let local = 0; local < wgX; local++) {
        const globalId = group * wgX + local;
        shaderFn(globalId, local, group, this.bindings);
      }
    }
  }
}

// 示例: 数组元素翻倍
const input = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8]);
const output = new Float32Array(8);

console.log(`  输入: [${input}]`);

const simulator = new ComputeShaderSimulator();
simulator.workgroupSize = [4, 1, 1];
simulator.bind(0, input);
simulator.bind(1, output);

simulator.dispatch(2, (globalId, localId, groupId, bindings) => {
  const src = bindings.get(0);
  const dst = bindings.get(1);
  if (globalId < src.length) {
    dst[globalId] = src[globalId] * 2.0;
  }
});

console.log(`  输出: [${output}]\n`);

// ========== 2. 矩阵乘法 (GPU) ==========
console.log("2. GPU 矩阵乘法\n");

function matMulGPU(a, b, M, N, K) {
  const result = new Float32Array(M * N);

  // 模拟 GPU 并行执行
  // @compute @workgroup_size(16, 16)
  for (let row = 0; row < M; row++) {
    for (let col = 0; col < N; col++) {
      let sum = 0;
      for (let k = 0; k < K; k++) {
        sum += a[row * K + k] * b[k * N + col];
      }
      result[row * N + col] = sum;
    }
  }

  return result;
}

// 2x3 * 3x2 = 2x2
const matA = new Float32Array([1, 2, 3, 4, 5, 6]);
const matB = new Float32Array([7, 8, 9, 10, 11, 12]);
const matC = matMulGPU(matA, matB, 2, 2, 3);

console.log(`  A (2x3): [${matA}]`);
console.log(`  B (3x2): [${matB}]`);
console.log(`  C = A*B (2x2): [${matC}]`);

// ========== 3. 粒子系统 (GPU) ==========
console.log("\n3. GPU 粒子系统模拟\n");

class GPUParticleSystem {
  constructor(count) {
    this.count = count;
    // 每个粒子: x, y, vx, vy (4 个 f32)
    this.data = new Float32Array(count * 4);

    // 初始化
    for (let i = 0; i < count; i++) {
      const offset = i * 4;
      this.data[offset] = Math.random() * 100;     // x
      this.data[offset + 1] = Math.random() * 100; // y
      this.data[offset + 2] = (Math.random() - 0.5) * 2; // vx
      this.data[offset + 3] = (Math.random() - 0.5) * 2; // vy
    }
  }

  // 模拟 compute shader 更新
  update(dt) {
    // GPU 上每个粒子并行执行
    for (let i = 0; i < this.count; i++) {
      const offset = i * 4;
      this.data[offset] += this.data[offset + 2] * dt;     // x += vx * dt
      this.data[offset + 1] += this.data[offset + 3] * dt; // y += vy * dt
      this.data[offset + 3] += 0.1 * dt; // 重力

      // 边界反弹
      if (this.data[offset] < 0 || this.data[offset] > 100) this.data[offset + 2] *= -1;
      if (this.data[offset + 1] < 0 || this.data[offset + 1] > 100) this.data[offset + 3] *= -1;
    }
  }

  stats() {
    let sumX = 0, sumY = 0;
    for (let i = 0; i < this.count; i++) {
      sumX += this.data[i * 4];
      sumY += this.data[i * 4 + 1];
    }
    return {
      avgX: (sumX / this.count).toFixed(1),
      avgY: (sumY / this.count).toFixed(1),
    };
  }
}

const particles = new GPUParticleSystem(1000);
console.log(`  粒子数: ${particles.count}`);
console.log(`  初始: avg=(${particles.stats().avgX}, ${particles.stats().avgY})`);

for (let i = 0; i < 100; i++) particles.update(16); // 100 帧, 16ms/帧
console.log(`  100帧后: avg=(${particles.stats().avgX}, ${particles.stats().avgY})`);

// ========== 4. WebGPU 计算着色器代码 ==========
console.log("\n4. WebGPU 计算着色器示例\n");
console.log(`
  // WGSL 计算着色器
  @group(0) @binding(0) var<storage, read> input: array<f32>;
  @group(0) @binding(1) var<storage, read_write> output: array<f32>;

  @compute @workgroup_size(256)
  fn main(@builtin(global_invocation_id) id: vec3u) {
    let i = id.x;
    if (i < arrayLength(&input)) {
      output[i] = input[i] * input[i]; // 平方
    }
  }

  // JS 端:
  const inputBuffer = device.createBuffer({
    size: data.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(inputBuffer, 0, data);

  const encoder = device.createCommandEncoder();
  const pass = encoder.beginComputePass();
  pass.setPipeline(computePipeline);
  pass.setBindGroup(0, bindGroup);
  pass.dispatchWorkgroups(Math.ceil(data.length / 256));
  pass.end();
  device.queue.submit([encoder.finish()]);
`);

console.log("=== GPU 计算着色器完成 ===");
