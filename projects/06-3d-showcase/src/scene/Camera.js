/**
 * 相机管理
 *
 * PerspectiveCamera + 窗口自适应
 */

import * as THREE from 'three';

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    45,                                          // FOV
    window.innerWidth / window.innerHeight,      // 宽高比
    0.1,                                         // 近裁面
    1000                                         // 远裁面
  );
  camera.position.set(0, 3, 8);
  camera.lookAt(0, 0, 0);

  return camera;
}

/**
 * 窗口 resize 处理
 */
export function setupResize(camera, renderer) {
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
