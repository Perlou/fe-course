/**
 * 场景管理器
 *
 * 创建 Three.js 场景 + 背景 + 雾效
 */

import * as THREE from 'three';

export function createScene() {
  const scene = new THREE.Scene();

  // 渐变背景色
  scene.background = new THREE.Color(0x0a0a1a);

  // 雾效 — 增加深度感
  scene.fog = new THREE.FogExp2(0x0a0a1a, 0.015);

  return scene;
}
