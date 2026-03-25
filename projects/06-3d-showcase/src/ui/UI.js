/**
 * UI 控制面板
 *
 * 纯 DOM 操作:
 *   - 材质/颜色选择器
 *   - 动画控制 (爆炸/组装)
 *   - 热点开关
 *   - 性能指标
 */

import { MaterialManager } from '../product/MaterialManager.js';

export class UI {
  constructor({ materialManager, animator, hotspots, controls }) {
    this.materialManager = materialManager;
    this.animator = animator;
    this.hotspots = hotspots;
    this.controls = controls;

    this._createPanel();
    this._bindEvents();
  }

  _createPanel() {
    const panel = document.createElement('div');
    panel.className = 'ui-panel';
    panel.innerHTML = `
      <div class="ui-header">
        <h2>🎧 Studio Pro X</h2>
        <p class="ui-subtitle">Premium Wireless Headphone</p>
      </div>

      <div class="ui-section">
        <h3>🎨 颜色</h3>
        <div class="color-options" id="color-options"></div>
      </div>

      <div class="ui-section">
        <h3>🎬 动画</h3>
        <div class="ui-buttons">
          <button class="ui-btn" id="btn-explode">💥 爆炸图</button>
          <button class="ui-btn" id="btn-assemble">🔧 组装</button>
        </div>
      </div>

      <div class="ui-section">
        <h3>⚙️ 设置</h3>
        <label class="ui-toggle">
          <input type="checkbox" id="toggle-hotspots" checked>
          <span>热点标注</span>
        </label>
        <label class="ui-toggle">
          <input type="checkbox" id="toggle-rotate" checked>
          <span>自动旋转</span>
        </label>
      </div>

      <div class="ui-section">
        <h3>📊 性能</h3>
        <div class="ui-stats">
          <div class="stat-row"><span>FPS</span><span id="stat-fps">60</span></div>
          <div class="stat-row"><span>Draw Calls</span><span id="stat-draws">-</span></div>
          <div class="stat-row"><span>Triangles</span><span id="stat-triangles">-</span></div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);
    this.panel = panel;

    // 生成颜色选项
    this._renderColorOptions();
  }

  _renderColorOptions() {
    const container = this.panel.querySelector('#color-options');
    const presets = MaterialManager.getPresets();

    presets.forEach((preset, index) => {
      const btn = document.createElement('button');
      btn.className = `color-swatch${index === 0 ? ' active' : ''}`;
      btn.style.background = preset.color;
      btn.title = preset.name;
      btn.dataset.key = preset.key;

      btn.addEventListener('click', () => {
        container.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        this.materialManager.switchPreset(preset.key);
      });

      container.appendChild(btn);
    });
  }

  _bindEvents() {
    // 爆炸图
    this.panel.querySelector('#btn-explode').addEventListener('click', () => {
      this.animator.explode();
    });

    // 组装
    this.panel.querySelector('#btn-assemble').addEventListener('click', () => {
      this.animator.assemble();
    });

    // 热点开关
    this.panel.querySelector('#toggle-hotspots').addEventListener('change', (e) => {
      this.hotspots.toggle(e.target.checked);
    });

    // 自动旋转
    this.panel.querySelector('#toggle-rotate').addEventListener('change', (e) => {
      this.controls.autoRotate = e.target.checked;
    });
  }

  /**
   * 更新性能统计
   */
  updateStats(renderer, fps) {
    const info = renderer.info;
    this.panel.querySelector('#stat-fps').textContent = Math.round(fps);
    this.panel.querySelector('#stat-draws').textContent = info.render.calls;
    this.panel.querySelector('#stat-triangles').textContent =
      info.render.triangles.toLocaleString();
  }
}
