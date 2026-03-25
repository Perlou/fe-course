/**
 * 程序化产品模型构建器
 *
 * 使用 Three.js 几何体组合构建耳机模型:
 *   - 头带 (TorusGeometry)
 *   - 左/右耳罩 (CylinderGeometry + SphereGeometry)
 *   - 耳垫 (TorusGeometry)
 *   - 连接杆 (CylinderGeometry)
 *
 * 所有零部件使用 Group 分组，支持爆炸图动画
 */

import * as THREE from 'three';

export function buildProduct(materialSet) {
  const product = new THREE.Group();
  product.name = 'headphone';

  // ===== 零部件记录 (供爆炸图使用) =====
  product.userData.parts = {};

  // ===== 1. 头带 =====
  const headband = createHeadband(materialSet.body);
  product.add(headband);
  product.userData.parts.headband = headband;

  // ===== 2. 左耳罩 =====
  const leftEar = createEarCup(materialSet, 'left');
  leftEar.position.set(-1.8, -0.9, 0);
  product.add(leftEar);
  product.userData.parts.leftEar = leftEar;

  // ===== 3. 右耳罩 =====
  const rightEar = createEarCup(materialSet, 'right');
  rightEar.position.set(1.8, -0.9, 0);
  product.add(rightEar);
  product.userData.parts.rightEar = rightEar;

  // ===== 4. 左连接杆 =====
  const leftArm = createArm(materialSet.metal);
  leftArm.position.set(-1.5, -0.15, 0);
  leftArm.rotation.z = -0.22;
  product.add(leftArm);
  product.userData.parts.leftArm = leftArm;

  // ===== 5. 右连接杆 =====
  const rightArm = createArm(materialSet.metal);
  rightArm.position.set(1.5, -0.15, 0);
  rightArm.rotation.z = 0.22;
  product.add(rightArm);
  product.userData.parts.rightArm = rightArm;

  // 整体阴影
  product.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return product;
}

// ===== 头带 =====
function createHeadband(material) {
  const group = new THREE.Group();
  group.name = 'headband';

  // 主弧形
  const bandGeo = new THREE.TorusGeometry(1.8, 0.12, 16, 48, Math.PI);
  const band = new THREE.Mesh(bandGeo, material);
  band.rotation.x = Math.PI;
  band.position.y = 0.6;
  group.add(band);

  // 顶部垫条
  const padGeo = new THREE.TorusGeometry(1.75, 0.08, 12, 32, Math.PI * 0.6);
  const padMat = material.clone();
  padMat.roughness = 0.9;
  const pad = new THREE.Mesh(padGeo, padMat);
  pad.rotation.x = Math.PI;
  pad.rotation.y = 0;
  pad.position.y = 0.62;
  group.add(pad);

  return group;
}

// ===== 耳罩 =====
function createEarCup(materialSet, side) {
  const group = new THREE.Group();
  group.name = `earCup_${side}`;

  // 外壳 — 圆柱体
  const shellGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.55, 32);
  const shell = new THREE.Mesh(shellGeo, materialSet.body);
  shell.rotation.z = Math.PI / 2;
  group.add(shell);

  // 外圆饰环
  const ringGeo = new THREE.TorusGeometry(0.85, 0.04, 8, 32);
  const ring = new THREE.Mesh(ringGeo, materialSet.accent);
  ring.position.x = side === 'left' ? -0.28 : 0.28;
  ring.rotation.y = Math.PI / 2;
  group.add(ring);

  // 品牌标志（小球）
  const logoGeo = new THREE.SphereGeometry(0.12, 16, 16);
  const logo = new THREE.Mesh(logoGeo, materialSet.accent);
  logo.position.x = side === 'left' ? -0.3 : 0.3;
  group.add(logo);

  // 内部耳垫
  const cushionGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.2, 32);
  const cushionMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.95,
    metalness: 0,
  });
  const cushion = new THREE.Mesh(cushionGeo, cushionMat);
  cushion.rotation.z = Math.PI / 2;
  cushion.position.x = side === 'left' ? 0.25 : -0.25;
  group.add(cushion);

  // 耳垫环 (软质)
  const padRingGeo = new THREE.TorusGeometry(0.65, 0.12, 12, 32);
  const padRingMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 1.0,
    metalness: 0,
  });
  const padRing = new THREE.Mesh(padRingGeo, padRingMat);
  padRing.position.x = side === 'left' ? 0.3 : -0.3;
  padRing.rotation.y = Math.PI / 2;
  group.add(padRing);

  return group;
}

// ===== 连接杆 =====
function createArm(material) {
  const group = new THREE.Group();
  group.name = 'arm';

  const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.0, 8);
  const arm = new THREE.Mesh(armGeo, material);
  group.add(arm);

  // 顶部连接铰链
  const hingeGeo = new THREE.SphereGeometry(0.07, 12, 12);
  const hinge = new THREE.Mesh(hingeGeo, material);
  hinge.position.y = 0.5;
  group.add(hinge);

  return group;
}
