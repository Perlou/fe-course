/**
 * 3D 产品展示 — 主入口
 *
 * 组装所有模块 + 动画循环
 */

import * as THREE from 'three';
import { createScene } from './scene/Scene.js';
import { createCamera, setupResize } from './scene/Camera.js';
import { createRenderer } from './scene/Renderer.js';
import { createControls } from './scene/Controls.js';
import { createLights, createFloor } from './scene/Lights.js';
import { buildProduct } from './product/ProductBuilder.js';
import { MaterialManager } from './product/MaterialManager.js';
import { HotspotManager } from './interactions/Hotspots.js';
import { Animator } from './interactions/Animator.js';
import { Interaction } from './interactions/Interaction.js';
import { UI } from './ui/UI.js';

// ========== 初始化 ==========

// 场景
const scene = createScene();

// 相机
const camera = createCamera();

// 渲染器
const container = document.getElementById('canvas-container');
const renderer = createRenderer(container);

// 控制器
const controls = createControls(camera, renderer.domElement);

// 光照 + 地板
createLights(scene);
createFloor(scene);

// ========== 产品模型 ==========

// 材质管理器
const materialManager = new MaterialManager();
const materials = materialManager.getMaterials();

// 构建耳机模型
const product = buildProduct(materials);
materialManager.setProduct(product);
scene.add(product);

// ========== 交互 ==========

// 动画控制器
const animator = new Animator(product, controls);

// 热点标注
const hotspotContainer = document.getElementById('hotspot-layer');
const hotspots = new HotspotManager(camera, hotspotContainer);

// 射线交互
const interaction = new Interaction(camera, scene, renderer.domElement);

// ========== UI ==========

const ui = new UI({
  materialManager,
  animator,
  hotspots,
  controls,
});

// ========== 窗口自适应 ==========

setupResize(camera, renderer);

// ========== 动画循环 ==========

const clock = new THREE.Clock();
let frameCount = 0;
let lastFpsTime = 0;
let currentFps = 60;

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  // 更新控制器
  controls.update();

  // 更新热点位置
  hotspots.update();

  // 更新 hover 效果
  const meshes = [];
  product.traverse((child) => {
    if (child.isMesh) meshes.push(child);
  });
  interaction.update(meshes);

  // 渲染
  renderer.render(scene, camera);

  // FPS 统计
  frameCount++;
  if (elapsed - lastFpsTime >= 1) {
    currentFps = frameCount / (elapsed - lastFpsTime);
    frameCount = 0;
    lastFpsTime = elapsed;
    ui.updateStats(renderer, currentFps);
  }
}

// ========== 启动 ==========

// 入场动画
animator.playIntro();

// 开始渲染循环
animate();

console.log('🎧 3D 产品展示已启动');
