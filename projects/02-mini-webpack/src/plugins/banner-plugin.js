/**
 * Banner Plugin
 *
 * 在打包结果顶部添加注释横幅
 * 演示 Plugin 如何通过钩子介入构建流程
 *
 * 用法:
 *   new BannerPlugin({ banner: '版权所有 © 2024' })
 */

class BannerPlugin {
  constructor(options = {}) {
    this.banner = options.banner || "Bundled by Mini Webpack";
  }

  /**
   * Webpack Plugin 标准接口
   * @param {Compiler} compiler
   */
  apply(compiler) {
    // 在 emit 阶段修改输出内容
    compiler.tap("emit", ({ assets }) => {
      const banner = `/**\n * ${this.banner}\n * ${new Date().toISOString()}\n */\n`;

      // 在每个资源文件前添加 banner
      Object.keys(assets).forEach((filename) => {
        assets[filename] = banner + assets[filename];
      });

      console.log(`  🏷️  [BannerPlugin] 已添加 banner`);
    });
  }
}

module.exports = BannerPlugin;
