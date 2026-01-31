# WebGL 与 Three.js 深入解析

## 📌 一、WebGL 基础

### 渲染管线

```
顶点数据 → 顶点着色器 → 图元装配 → 光栅化 → 片元着色器 → 帧缓冲
```

### 着色器

```glsl
// 顶点着色器
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// 片元着色器
precision mediump float;
uniform vec3 color;

void main() {
  gl_FragColor = vec4(color, 1.0);
}
```

---

## 📌 二、Three.js 核心

### 1. 基础设置

```javascript
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// 场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

// 相机
const camera = new THREE.PerspectiveCamera(
  75, // 视野角度
  window.innerWidth / window.innerHeight, // 宽高比
  0.1, // 近裁剪面
  1000 // 远裁剪面
);
camera.position.set(0, 5, 10);

// 渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// 控制器
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 响应式
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
```

### 2. 几何体与材质

```javascript
// 基础几何体
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const planeGeometry = new THREE.PlaneGeometry(10, 10);

// 材质
const basicMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const standardMaterial = new THREE.MeshStandardMaterial({
  color: 0x00ff00,
  roughness: 0.5,
  metalness: 0.5,
});
const phongMaterial = new THREE.MeshPhongMaterial({
  color: 0x0000ff,
  shininess: 100,
});

// 网格
const cube = new THREE.Mesh(boxGeometry, standardMaterial);
scene.add(cube);
```

### 3. 光照

```javascript
// 环境光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// 平行光
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// 点光源
const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(0, 5, 0);
scene.add(pointLight);

// 聚光灯
const spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(0, 10, 0);
spotLight.angle = Math.PI / 6;
scene.add(spotLight);
```

### 4. 动画

```javascript
import gsap from "gsap";

// requestAnimationFrame
function animate() {
  requestAnimationFrame(animate);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  controls.update();
  renderer.render(scene, camera);
}
animate();

// GSAP
gsap.to(cube.position, {
  x: 5,
  duration: 2,
  ease: "power2.inOut",
  yoyo: true,
  repeat: -1,
});

gsap.to(cube.rotation, {
  y: Math.PI * 2,
  duration: 4,
  repeat: -1,
  ease: "none",
});
```

### 5. 交互

```javascript
import { Raycaster, Vector2 } from "three";

const raycaster = new Raycaster();
const mouse = new Vector2();

window.addEventListener("click", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0) {
    const object = intersects[0].object;
    object.material.color.setHex(Math.random() * 0xffffff);
  }
});
```

---

## 📌 三、React Three Fiber

```jsx
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";

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

## 📚 推荐学习资源

| 资源              | 链接                           |
| ----------------- | ------------------------------ |
| Three.js          | threejs.org                    |
| Three.js Journey  | threejs-journey.com            |
| React Three Fiber | docs.pmnd.rs/react-three-fiber |

---
