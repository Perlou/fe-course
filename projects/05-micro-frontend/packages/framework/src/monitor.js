/**
 * 性能监控
 *
 * 采集指标:
 *   - 应用加载耗时
 *   - 应用挂载耗时
 *   - 路由切换耗时
 *   - 资源加载失败记录
 *
 * 对标: 前端监控 SDK (简化版)
 */

class Monitor {
  constructor() {
    this.metrics = [];       // 性能指标记录
    this.errors = [];        // 错误记录
    this.timers = new Map(); // 运行中的计时器
  }

  /**
   * 开始计时
   * @param {string} label - 标签 (如 "load:react-app")
   */
  startTimer(label) {
    this.timers.set(label, {
      start: Date.now(),
      label,
    });
  }

  /**
   * 结束计时并记录指标
   * @returns {number} 耗时 (ms)
   */
  endTimer(label) {
    const timer = this.timers.get(label);
    if (!timer) {
      console.warn(`[Monitor] 未找到计时器: ${label}`);
      return 0;
    }

    const duration = Date.now() - timer.start;
    this.timers.delete(label);

    const metric = {
      type: 'timing',
      label,
      duration,
      timestamp: Date.now(),
    };

    this.metrics.push(metric);

    // 颜色标记: >1s 红色, >500ms 黄色, 其他绿色
    const icon = duration > 1000 ? '🔴' : duration > 500 ? '🟡' : '🟢';
    console.log(`[Monitor] ${icon} ${label}: ${duration}ms`);

    return duration;
  }

  /**
   * 记录错误
   */
  logError(appName, phase, error) {
    const record = {
      type: 'error',
      appName,
      phase,       // 'load' | 'mount' | 'unmount'
      message: error.message || String(error),
      stack: error.stack,
      timestamp: Date.now(),
    };

    this.errors.push(record);
    console.error(`[Monitor] ❌ ${appName} [${phase}]:`, record.message);
  }

  /**
   * 记录自定义指标
   */
  log(label, value) {
    this.metrics.push({
      type: 'custom',
      label,
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * 获取性能报告
   */
  getReport() {
    const timings = this.metrics.filter(m => m.type === 'timing');

    // 按 label 分组统计
    const groups = {};
    for (const t of timings) {
      const key = t.label.split(':')[0]; // 提取类型前缀 (load / mount / ...)
      if (!groups[key]) groups[key] = [];
      groups[key].push(t.duration);
    }

    const stats = {};
    for (const [key, durations] of Object.entries(groups)) {
      stats[key] = {
        count: durations.length,
        avg: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
        min: Math.min(...durations),
        max: Math.max(...durations),
      };
    }

    return {
      stats,
      errors: this.errors.length,
      totalMetrics: this.metrics.length,
      details: {
        timings,
        errors: this.errors,
      },
    };
  }

  /**
   * 打印报告
   */
  printReport() {
    const report = this.getReport();

    console.log('\n📊 === 性能监控报告 ===');
    console.log(`   总指标数: ${report.totalMetrics}`);
    console.log(`   错误数: ${report.errors}`);

    for (const [key, stat] of Object.entries(report.stats)) {
      console.log(`   [${key}] 次数:${stat.count} 平均:${stat.avg}ms 最小:${stat.min}ms 最大:${stat.max}ms`);
    }

    if (report.errors > 0) {
      console.log('\n   ❌ 错误详情:');
      report.details.errors.forEach((err, i) => {
        console.log(`   ${i + 1}. [${err.appName}] ${err.phase}: ${err.message}`);
      });
    }

    console.log('======================\n');
  }

  /**
   * 清除所有记录
   */
  clear() {
    this.metrics = [];
    this.errors = [];
    this.timers.clear();
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Monitor };
}
