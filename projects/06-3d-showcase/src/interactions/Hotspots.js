/**
 * 热点标注系统
 *
 * 在 3D 空间放置可交互热点:
 *   - 3D 位置 → CSS 屏幕坐标映射
 *   - 点击展开详情面板
 *   - 脉冲动画吸引注意
 */

import * as THREE from 'three';

const HOTSPOT_DATA = [
  {
    id: 'driver',
    label: '40mm 驱动单元',
    position: new THREE.Vector3(-1.8, -0.9, 0.9),
    description: '定制 40mm 钕磁铁驱动单元，频率响应 20Hz-40kHz，提供宽广的音域和精准的声音还原。',
    icon: '🔊',
  },
  {
    id: 'headband',
    label: '自适应头带',
    position: new THREE.Vector3(0, 1.2, 0),
    description: '航空铝合金头带，配合记忆海绵衬垫，自动调节佩戴压力，长时间佩戴无压迫感。',
    icon: '👑',
  },
  {
    id: 'cushion',
    label: '蛋白质皮革耳垫',
    position: new THREE.Vector3(1.8, -0.9, 0.9),
    description: '采用生物蛋白质仿皮革材质，透气排湿，达到被动降噪 -26dB 的隔音效果。',
    icon: '🎯',
  },
  {
    id: 'controls',
    label: '触控面板',
    position: new THREE.Vector3(-2.2, -0.9, -0.3),
    description: '左耳罩集成电容触控面板，支持播放/暂停、音量调节、ANC 模式切换。',
    icon: '✋',
  },
];

export class HotspotManager {
  constructor(camera, container) {
    this.camera = camera;
    this.container = container;
    this.hotspots = [];
    this.activeHotspot = null;
    this.visible = true;

    this._createHotspots();
  }

  _createHotspots() {
    HOTSPOT_DATA.forEach((data) => {
      // 创建 DOM 元素
      const el = document.createElement('div');
      el.className = 'hotspot';
      el.dataset.id = data.id;
      el.innerHTML = `
        <div class="hotspot-dot">
          <div class="hotspot-pulse"></div>
          <span class="hotspot-icon">${data.icon}</span>
        </div>
        <div class="hotspot-label">${data.label}</div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggleDetail(data);
      });

      this.container.appendChild(el);

      this.hotspots.push({
        data,
        element: el,
        position: data.position.clone(),
      });
    });

    // 创建详情面板
    this._createDetailPanel();
  }

  _createDetailPanel() {
    this.detailPanel = document.createElement('div');
    this.detailPanel.className = 'hotspot-detail hidden';
    this.detailPanel.innerHTML = `
      <button class="hotspot-detail-close">✕</button>
      <div class="hotspot-detail-icon"></div>
      <h4 class="hotspot-detail-title"></h4>
      <p class="hotspot-detail-desc"></p>
    `;
    this.container.appendChild(this.detailPanel);

    this.detailPanel.querySelector('.hotspot-detail-close').addEventListener('click', () => {
      this.detailPanel.classList.add('hidden');
      this.activeHotspot = null;
    });
  }

  _toggleDetail(data) {
    if (this.activeHotspot === data.id) {
      this.detailPanel.classList.add('hidden');
      this.activeHotspot = null;
      return;
    }

    this.activeHotspot = data.id;
    this.detailPanel.querySelector('.hotspot-detail-icon').textContent = data.icon;
    this.detailPanel.querySelector('.hotspot-detail-title').textContent = data.label;
    this.detailPanel.querySelector('.hotspot-detail-desc').textContent = data.description;
    this.detailPanel.classList.remove('hidden');
  }

  /**
   * 每帧更新热点位置 (3D → 屏幕坐标)
   */
  update() {
    if (!this.visible) return;

    this.hotspots.forEach(({ element, position }) => {
      const screenPos = position.clone().project(this.camera);

      const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-screenPos.y * 0.5 + 0.5) * window.innerHeight;

      // 在视野内才显示
      const isVisible = screenPos.z < 1;
      element.style.display = isVisible ? 'flex' : 'none';
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
    });
  }

  /**
   * 显示/隐藏热点
   */
  toggle(show) {
    this.visible = show !== undefined ? show : !this.visible;
    this.hotspots.forEach(({ element }) => {
      element.style.display = this.visible ? 'flex' : 'none';
    });
    if (!this.visible) {
      this.detailPanel.classList.add('hidden');
      this.activeHotspot = null;
    }
  }
}
