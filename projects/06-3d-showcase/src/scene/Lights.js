/**
 * 光照系统
 *
 * 多光源组合:
 *   - AmbientLight — 全局环境光
 *   - DirectionalLight — 主光源 (带阴影)
 *   - PointLight — 补光
 *   - HemisphereLight — 天空/地面光
 */

import * as THREE from 'three';

export function createLights(scene) {
  const lights = {};

  // 1. 环境光 — 填充暗部
  lights.ambient = new THREE.AmbientLight(0x404060, 0.6);
  scene.add(lights.ambient);

  // 2. 主平行光 — 模拟阳光 (带阴影)
  lights.directional = new THREE.DirectionalLight(0xfff5e6, 1.5);
  lights.directional.position.set(8, 12, 8);
  lights.directional.castShadow = true;
  lights.directional.shadow.mapSize.width = 2048;
  lights.directional.shadow.mapSize.height = 2048;
  lights.directional.shadow.camera.near = 0.5;
  lights.directional.shadow.camera.far = 50;
  lights.directional.shadow.camera.left = -10;
  lights.directional.shadow.camera.right = 10;
  lights.directional.shadow.camera.top = 10;
  lights.directional.shadow.camera.bottom = -10;
  lights.directional.shadow.bias = -0.001;
  scene.add(lights.directional);

  // 3. 补充点光源 — 暖色
  lights.point1 = new THREE.PointLight(0xff8866, 0.6, 30);
  lights.point1.position.set(-6, 4, -4);
  scene.add(lights.point1);

  // 4. 补充点光源 — 冷色
  lights.point2 = new THREE.PointLight(0x6688ff, 0.4, 30);
  lights.point2.position.set(4, 2, -6);
  scene.add(lights.point2);

  // 5. 半球光 — 天空/地面渐变
  lights.hemisphere = new THREE.HemisphereLight(0x8888cc, 0x222244, 0.3);
  scene.add(lights.hemisphere);

  return lights;
}

/**
 * 创建地板
 */
export function createFloor(scene) {
  const geometry = new THREE.CircleGeometry(15, 64);
  const material = new THREE.MeshStandardMaterial({
    color: 0x111122,
    roughness: 0.8,
    metalness: 0.2,
  });
  const floor = new THREE.Mesh(geometry, material);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.5;
  floor.receiveShadow = true;
  scene.add(floor);

  return floor;
}
