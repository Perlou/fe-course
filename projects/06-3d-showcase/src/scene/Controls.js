/**
 * 相机控制
 *
 * OrbitControls + 阻尼 + 自动旋转 + 角度限制
 */

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createControls(camera, domElement) {
  const controls = new OrbitControls(camera, domElement);

  // 阻尼 (惯性)
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;

  // 自动旋转
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.8;

  // 角度限制 — 防止看到底部
  controls.minPolarAngle = Math.PI * 0.15;
  controls.maxPolarAngle = Math.PI * 0.75;

  // 缩放限制
  controls.minDistance = 4;
  controls.maxDistance = 20;

  // 平移限制
  controls.enablePan = true;
  controls.panSpeed = 0.5;

  // 触摸操作 (移动端)
  controls.touches = {
    ONE: 0, // ROTATE
    TWO: 2, // DOLLY_PAN
  };

  return controls;
}
