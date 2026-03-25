/**
 * 点击交互 (Raycaster)
 *
 * 功能:
 *   - hover 高亮
 *   - 点击聚焦零部件
 *   - 双击重置
 */

import * as THREE from 'three';

export class Interaction {
  constructor(camera, scene, domElement) {
    this.camera = camera;
    this.scene = scene;
    this.domElement = domElement;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredObject = null;
    this.onClickCallbacks = [];

    this._bindEvents();
  }

  _bindEvents() {
    this.domElement.addEventListener('mousemove', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    this.domElement.addEventListener('click', (e) => {
      // 排除 UI 区域点击
      if (e.target.closest('.ui-panel') || e.target.closest('.hotspot')) return;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(
        this.scene.children, true
      );

      // 过滤地板
      const hit = intersects.find(i => i.object.name !== 'floor');
      if (hit) {
        this.onClickCallbacks.forEach(cb => cb(hit.object, hit.point));
      }
    });
  }

  /**
   * 注册点击回调
   */
  onClick(callback) {
    this.onClickCallbacks.push(callback);
  }

  /**
   * 每帧更新 hover 效果
   */
  update(meshes) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(meshes, true);

    // 恢复之前的高亮
    if (this.hoveredObject) {
      if (this.hoveredObject._originalEmissive) {
        this.hoveredObject.material.emissiveIntensity =
          this.hoveredObject._originalEmissive;
      }
      this.hoveredObject = null;
      this.domElement.style.cursor = 'default';
    }

    if (intersects.length > 0) {
      const obj = intersects[0].object;
      if (obj.isMesh && obj.material.emissive) {
        obj._originalEmissive = obj.material.emissiveIntensity;
        obj.material.emissiveIntensity = 0.3;
        this.hoveredObject = obj;
        this.domElement.style.cursor = 'pointer';
      }
    }
  }
}
