# WebGL 与 Three.js 深入解析

## 📌 一、WebGL 基础

### 1. 渲染管线

```
┌──────────────────────────────────────────────────────────┐
│                 WebGL 渲染管线                             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  CPU 端:                                                 │
│  ├── 顶点数据 (位置/法线/UV) → 缓冲区                   │
│  ├── 着色器程序编译与链接                                 │
│  └── Uniform 变量 (矩阵/颜色/纹理)                      │
│                                                          │
│  GPU 端 (可编程):                                        │
│  ├── 顶点着色器 → 坐标变换 + 顶点属性                   │
│  │   ↓                                                   │
│  ├── 图元装配 → 三角形                                   │
│  │   ↓                                                   │
│  ├── 光栅化 → 像素片元                                   │
│  │   ↓                                                   │
│  ├── 片元着色器 → 计算每个像素颜色                       │
│  │   ↓                                                   │
│  └── 帧缓冲 → 屏幕显示                                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 2. 着色器语言 (GLSL)

```glsl
// 顶点着色器 (Vertex Shader)
attribute vec3 position;     // 顶点位置 (每个顶点不同)
attribute vec2 uv;           // 纹理坐标
uniform mat4 modelViewMatrix;   // 模型视图矩阵 (所有顶点相同)
uniform mat4 projectionMatrix;  // 投影矩阵
varying vec2 vUv;            // 传递给片元着色器

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// 片元着色器 (Fragment Shader)
precision mediump float;
uniform vec3 color;
uniform sampler2D texture1;  // 纹理
varying vec2 vUv;

void main() {
  vec4 texColor = texture2D(texture1, vUv);
  gl_FragColor = texColor * vec4(color, 1.0);
}
```

### 3. 变量类型

```
┌──────────────┬─────────────────────────────────────┐
│ 类型          │ 说明                                │
├──────────────┼─────────────────────────────────────┤
│ attribute    │ 每顶点数据 (position, normal, uv)   │
│ uniform      │ 全局常量 (矩阵, 颜色, 时间)         │
│ varying      │ 顶点→片元插值传递                    │
│ vec2/3/4     │ 2/3/4 维向量                        │
│ mat3/mat4    │ 3x3/4x4 矩阵                        │
│ sampler2D    │ 2D 纹理                              │
└──────────────┴─────────────────────────────────────┘
```

---

## 📌 二、Three.js 核心

### 1. 基础设置

```javascript
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
```

### 2. 几何体

```javascript
const box = new THREE.BoxGeometry(1, 1, 1);
const sphere = new THREE.SphereGeometry(0.5, 32, 32);
const cylinder = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
const plane = new THREE.PlaneGeometry(10, 10);
const torus = new THREE.TorusGeometry(0.5, 0.2, 16, 100);

// 自定义几何体
const bufferGeometry = new THREE.BufferGeometry();
const vertices = new Float32Array([0,1,0, -1,-1,0, 1,-1,0]);
bufferGeometry.setAttribute('position',
  new THREE.BufferAttribute(vertices, 3)
);
```

### 3. 材质

```
┌──────────────────────┬──────────────────────────────┐
│ 材质                  │ 说明                         │
├──────────────────────┼──────────────────────────────┤
│ MeshBasicMaterial    │ 不受光照影响，纯色            │
│ MeshLambertMaterial  │ 漫反射 (哑光)                 │
│ MeshPhongMaterial    │ 镜面反射 (高光)               │
│ MeshStandardMaterial │ PBR 物理材质 (推荐)           │
│ MeshPhysicalMaterial │ 更高级 PBR (透明/折射)        │
│ ShaderMaterial       │ 自定义着色器                  │
└──────────────────────┴──────────────────────────────┘
```

### 4. 光照

```javascript
const ambient = new THREE.AmbientLight(0xffffff, 0.5);
const directional = new THREE.DirectionalLight(0xffffff, 1);
directional.position.set(5, 10, 5);
directional.castShadow = true;

const point = new THREE.PointLight(0xffffff, 1, 100);
const spot = new THREE.SpotLight(0xffffff, 1, 50, Math.PI / 6);
const hemisphere = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
```

---

## 📌 三、动画与交互

### 1. 动画循环

```javascript
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  cube.rotation.y += delta;
  cube.position.y = Math.sin(elapsed) * 2;

  controls.update();
  renderer.render(scene, camera);
}
```

### 2. Raycaster 交互

```javascript
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0) {
    intersects[0].object.material.color.setHex(Math.random() * 0xffffff);
  }
});
```

---

## 📌 四、React Three Fiber

```jsx
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

function Box() {
  const meshRef = useRef();
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

function App() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      <Box />
      <OrbitControls />
      <Environment preset="sunset" />
    </Canvas>
  );
}
```

---

## 📌 五、性能优化

```
┌──────────────────────────────────────────────────────┐
│              3D 性能优化                               │
├──────────────────────────────────────────────────────┤
│                                                      │
│  几何体:                                              │
│  ├── 合并几何体 (mergeBufferGeometries)              │
│  ├── LOD (Level of Detail)                           │
│  └── 实例化 (InstancedMesh)                          │
│                                                      │
│  材质:                                                │
│  ├── 共享材质                                        │
│  ├── 纹理图集 (Texture Atlas)                        │
│  └── 纹理压缩                                        │
│                                                      │
│  渲染:                                                │
│  ├── 视锥体剔除 (Frustum Culling)                    │
│  ├── 遮挡剔除 (Occlusion Culling)                    │
│  ├── 降低像素比 (setPixelRatio)                      │
│  └── 后处理优化 (EffectComposer)                     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 📚 推荐学习资源

| 资源              | 链接                           |
| ----------------- | ------------------------------ |
| Three.js          | threejs.org                    |
| Three.js Journey  | threejs-journey.com            |
| React Three Fiber | docs.pmnd.rs/react-three-fiber |
| WebGL Fundamentals | webglfundamentals.org         |

---
