/**
 * 材质管理器
 *
 * PBR 材质预设:
 *   - 哑光黑 (Matte Black)
 *   - 银色金属 (Silver)
 *   - 玫瑰金 (Rose Gold)
 *   - 午夜蓝 (Midnight Blue)
 *
 * 运行时切换 + 平滑过渡
 */

import * as THREE from 'three';
import gsap from 'gsap';

// 预设颜色方案
const PRESETS = {
  'matte-black': {
    name: '哑光黑',
    body:    { color: 0x1a1a1a, roughness: 0.85, metalness: 0.1 },
    metal:   { color: 0x888888, roughness: 0.2,  metalness: 0.9 },
    accent:  { color: 0x6c5ce7, roughness: 0.3,  metalness: 0.5 },
  },
  'silver': {
    name: '银色金属',
    body:    { color: 0xcccccc, roughness: 0.25, metalness: 0.8 },
    metal:   { color: 0xeeeeee, roughness: 0.1,  metalness: 0.95 },
    accent:  { color: 0x00cec9, roughness: 0.2,  metalness: 0.6 },
  },
  'rose-gold': {
    name: '玫瑰金',
    body:    { color: 0xd4a373, roughness: 0.35, metalness: 0.7 },
    metal:   { color: 0xe8c39e, roughness: 0.15, metalness: 0.85 },
    accent:  { color: 0xfaedcd, roughness: 0.2,  metalness: 0.4 },
  },
  'midnight-blue': {
    name: '午夜蓝',
    body:    { color: 0x1a1a3e, roughness: 0.7,  metalness: 0.15 },
    metal:   { color: 0x4a4a6a, roughness: 0.2,  metalness: 0.8 },
    accent:  { color: 0x74b9ff, roughness: 0.25, metalness: 0.5 },
  },
};

export class MaterialManager {
  constructor() {
    this.current = 'matte-black';
    this.materials = {};
    this.product = null;

    // 初始化材质
    this._createMaterials();
  }

  _createMaterials() {
    const preset = PRESETS[this.current];

    this.materials.body = new THREE.MeshStandardMaterial({
      color: preset.body.color,
      roughness: preset.body.roughness,
      metalness: preset.body.metalness,
    });

    this.materials.metal = new THREE.MeshStandardMaterial({
      color: preset.metal.color,
      roughness: preset.metal.roughness,
      metalness: preset.metal.metalness,
    });

    this.materials.accent = new THREE.MeshStandardMaterial({
      color: preset.accent.color,
      roughness: preset.accent.roughness,
      metalness: preset.accent.metalness,
      emissive: preset.accent.color,
      emissiveIntensity: 0.1,
    });
  }

  /**
   * 获取当前材质集
   */
  getMaterials() {
    return this.materials;
  }

  /**
   * 设置产品引用 (用于运行时切换)
   */
  setProduct(product) {
    this.product = product;
  }

  /**
   * 切换材质预设 (带动画过渡)
   */
  switchPreset(presetKey) {
    if (!PRESETS[presetKey] || presetKey === this.current) return;

    this.current = presetKey;
    const preset = PRESETS[presetKey];

    // 动画过渡材质属性
    this._animateMaterial(this.materials.body, preset.body);
    this._animateMaterial(this.materials.metal, preset.metal);
    this._animateMaterial(this.materials.accent, preset.accent);

    // 更新 emissive
    const accentColor = new THREE.Color(preset.accent.color);
    gsap.to(this.materials.accent.emissive, {
      r: accentColor.r,
      g: accentColor.g,
      b: accentColor.b,
      duration: 0.6,
    });

    console.log(`[Material] 切换: ${preset.name}`);
  }

  _animateMaterial(material, target) {
    const targetColor = new THREE.Color(target.color);

    gsap.to(material.color, {
      r: targetColor.r,
      g: targetColor.g,
      b: targetColor.b,
      duration: 0.6,
      ease: 'power2.out',
    });

    gsap.to(material, {
      roughness: target.roughness,
      metalness: target.metalness,
      duration: 0.6,
      ease: 'power2.out',
    });
  }

  /**
   * 获取所有预设名称
   */
  static getPresets() {
    return Object.entries(PRESETS).map(([key, val]) => ({
      key,
      name: val.name,
      color: `#${new THREE.Color(val.body.color).getHexString()}`,
    }));
  }
}
