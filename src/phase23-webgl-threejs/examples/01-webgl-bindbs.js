// WebGL 渲染管线详解
// 运行: node 01-webgl-bindbs.js (模拟 WebGL 管线)

console.log("=== WebGL 渲染管线 ===\n");

// ========== 1. 模拟渲染管线 ==========
console.log("1. 模拟 WebGL 渲染管线\n");

class WebGLPipeline {
  constructor() {
    this.vertexShader = null;
    this.fragmentShader = null;
    this.uniforms = {};
    this.attributes = {};
  }

  // 编译着色器
  compileShader(type, source) {
    const lines = source.trim().split("\n").length;
    console.log(`  [compile] ${type} shader (${lines} 行)`);
    if (type === "vertex") this.vertexShader = source;
    else this.fragmentShader = source;
  }

  // 设置 uniform
  setUniform(name, value) {
    this.uniforms[name] = value;
  }

  // 设置顶点属性
  setAttribute(name, data) {
    this.attributes[name] = data;
  }

  // 模拟渲染一个三角形
  render() {
    const positions = this.attributes.position || [];
    const vertexCount = Math.floor(positions.length / 3);

    console.log(`\n  渲染管线执行:`);
    console.log(`  ┌─────────────────────────────────────────┐`);

    // 1. 顶点着色器
    console.log(`  │ 1. 顶点着色器                           │`);
    console.log(`  │    输入: ${vertexCount} 个顶点`);
    const transformedVerts = [];
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i], y = positions[i + 1], z = positions[i + 2];
      // 模拟 MVP 变换
      transformedVerts.push({ x: x * 100 + 200, y: -y * 100 + 200 });
      console.log(`  │    顶点 ${i / 3}: (${x}, ${y}, ${z}) → 屏幕 (${transformedVerts.at(-1).x}, ${transformedVerts.at(-1).y})`);
    }

    // 2. 图元装配
    console.log(`  │                                         │`);
    console.log(`  │ 2. 图元装配 → ${Math.floor(vertexCount / 3)} 个三角形`);

    // 3. 光栅化
    const pixelCount = Math.abs(
      (transformedVerts[0]?.x || 0) * ((transformedVerts[1]?.y || 0) - (transformedVerts[2]?.y || 0)) +
      (transformedVerts[1]?.x || 0) * ((transformedVerts[2]?.y || 0) - (transformedVerts[0]?.y || 0)) +
      (transformedVerts[2]?.x || 0) * ((transformedVerts[0]?.y || 0) - (transformedVerts[1]?.y || 0))
    ) / 2;
    console.log(`  │                                         │`);
    console.log(`  │ 3. 光栅化 → ~${Math.round(pixelCount)} 个片元 (像素)`);

    // 4. 片元着色器
    const color = this.uniforms.color || [1, 0, 0];
    console.log(`  │                                         │`);
    console.log(`  │ 4. 片元着色器                           │`);
    console.log(`  │    每个片元 → 颜色 rgb(${color.map(c => Math.round(c * 255)).join(", ")})`);

    // 5. 帧缓冲
    console.log(`  │                                         │`);
    console.log(`  │ 5. 帧缓冲 → 屏幕显示                   │`);
    console.log(`  └─────────────────────────────────────────┘`);
  }
}

const pipeline = new WebGLPipeline();

pipeline.compileShader("vertex", `
  attribute vec3 position;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`);

pipeline.compileShader("fragment", `
  precision mediump float;
  uniform vec3 color;
  void main() {
    gl_FragColor = vec4(color, 1.0);
  }
`);

// 三角形顶点
pipeline.setAttribute("position", [
  0, 1, 0,    // 顶部
  -1, -1, 0,  // 左下
  1, -1, 0,   // 右下
]);

pipeline.setUniform("color", [0.2, 0.6, 1.0]);
pipeline.render();

// ========== 2. GLSL 数据类型 ==========
console.log("\n2. GLSL 数据类型\n");
console.log(`
  标量:   float, int, bool
  向量:   vec2, vec3, vec4, ivec2, bvec3
  矩阵:   mat2, mat3, mat4
  纹理:   sampler2D, samplerCube

  向量访问:
  vec4 v = vec4(1.0, 2.0, 3.0, 4.0);
  v.x, v.y, v.z, v.w    // xyzw
  v.r, v.g, v.b, v.a    // rgba
  v.xy                   // vec2(1.0, 2.0)
  v.rgb                  // vec3(1.0, 2.0, 3.0)

  常用函数:
  mix(a, b, t)           // 线性插值
  clamp(x, min, max)     // 钳制
  smoothstep(e0, e1, x)  // 平滑过渡
  normalize(v)           // 归一化
  dot(a, b)              // 点积
  cross(a, b)            // 叉积
`);

// ========== 3. WebGL API ==========
console.log("3. WebGL 初始化流程\n");
console.log(`
  // 1. 获取 WebGL 上下文
  const gl = canvas.getContext('webgl2');

  // 2. 编译着色器
  const vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, vertexSource);
  gl.compileShader(vs);

  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, fragmentSource);
  gl.compileShader(fs);

  // 3. 链接程序
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.useProgram(program);

  // 4. 创建缓冲区
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // 5. 绑定属性
  const posLoc = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

  // 6. 渲染
  gl.drawArrays(gl.TRIANGLES, 0, 3);
`);

console.log("=== WebGL 基础完成 ===");
