/**
 * 动画控制器
 *
 * GSAP 驱动动画:
 *   - 自动旋转
 *   - 爆炸图 (零部件分离)
 *   - 组装 (复位)
 *   - 入场动画
 */

import gsap from 'gsap';

export class Animator {
  constructor(product, controls) {
    this.product = product;
    this.controls = controls;
    this.isExploded = false;
    this.timeline = null;

    // 记录零部件原始位置
    this.originalPositions = {};
    this._savePositions();
  }

  _savePositions() {
    const parts = this.product.userData.parts;
    for (const [key, part] of Object.entries(parts)) {
      this.originalPositions[key] = {
        x: part.position.x,
        y: part.position.y,
        z: part.position.z,
      };
    }
  }

  /**
   * 入场动画
   */
  playIntro() {
    // 产品从上方落下 + 旋转出现
    this.product.position.y = 4;
    this.product.rotation.y = -Math.PI;
    this.product.scale.setScalar(0.5);

    gsap.to(this.product.position, {
      y: 0,
      duration: 1.2,
      ease: 'back.out(1.2)',
    });

    gsap.to(this.product.rotation, {
      y: 0,
      duration: 1.5,
      ease: 'power3.out',
    });

    gsap.to(this.product.scale, {
      x: 1, y: 1, z: 1,
      duration: 1.0,
      ease: 'elastic.out(1, 0.6)',
    });
  }

  /**
   * 爆炸图 — 零部件展开
   */
  explode() {
    if (this.isExploded) return;
    this.isExploded = true;

    // 暂停自动旋转
    this.controls.autoRotate = false;

    const parts = this.product.userData.parts;
    const tl = gsap.timeline({ defaults: { duration: 0.8, ease: 'power3.out' } });

    // 头带上移
    tl.to(parts.headband.position, { y: 2.5 }, 0);

    // 左耳罩左移
    tl.to(parts.leftEar.position, { x: -3.5, y: -1.5 }, 0.1);

    // 右耳罩右移
    tl.to(parts.rightEar.position, { x: 3.5, y: -1.5 }, 0.1);

    // 连接杆分离
    tl.to(parts.leftArm.position, { x: -2.5, y: 0.8 }, 0.15);
    tl.to(parts.rightArm.position, { x: 2.5, y: 0.8 }, 0.15);

    // 整体慢速旋转，便于观察
    tl.to(this.product.rotation, { y: Math.PI * 0.5, duration: 1.5 }, 0.2);

    this.timeline = tl;
    console.log('[Animator] 💥 爆炸图');
  }

  /**
   * 组装 — 零部件复位
   */
  assemble() {
    if (!this.isExploded) return;
    this.isExploded = false;

    const parts = this.product.userData.parts;
    const orig = this.originalPositions;
    const tl = gsap.timeline({
      defaults: { duration: 0.8, ease: 'power3.inOut' },
      onComplete: () => {
        this.controls.autoRotate = true;
      },
    });

    for (const [key, part] of Object.entries(parts)) {
      tl.to(part.position, {
        x: orig[key].x,
        y: orig[key].y,
        z: orig[key].z,
      }, 0);
    }

    // 旋转复位
    tl.to(this.product.rotation, { y: 0, duration: 1.0 }, 0);

    this.timeline = tl;
    console.log('[Animator] 🔧 组装');
  }

  /**
   * 切换爆炸/组装
   */
  toggleExplode() {
    if (this.isExploded) {
      this.assemble();
    } else {
      this.explode();
    }
  }

  /**
   * 聚焦某个零部件
   */
  focusPart(partName) {
    const parts = this.product.userData.parts;
    const part = parts[partName];
    if (!part) return;

    // 降低其他零部件透明度
    for (const [key, p] of Object.entries(parts)) {
      p.traverse((child) => {
        if (child.isMesh) {
          gsap.to(child.material, {
            opacity: key === partName ? 1 : 0.15,
            duration: 0.4,
          });
          child.material.transparent = true;
        }
      });
    }

    console.log(`[Animator] 🔍 聚焦: ${partName}`);
  }

  /**
   * 取消聚焦，恢复所有零部件
   */
  unfocus() {
    const parts = this.product.userData.parts;
    for (const [, p] of Object.entries(parts)) {
      p.traverse((child) => {
        if (child.isMesh) {
          gsap.to(child.material, { opacity: 1, duration: 0.4 });
        }
      });
    }
  }
}
