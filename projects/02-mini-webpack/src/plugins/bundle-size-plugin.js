/**
 * Bundle Size Plugin
 *
 * 输出每个模块的大小统计
 * 类似 webpack-bundle-analyzer 的简化版
 */

class BundleSizePlugin {
  apply(compiler) {
    compiler.tap("afterCompile", ({ modules, moduleCount }) => {
      console.log(`\n📊 [BundleSizePlugin] 模块大小统计:`);

      let totalSize = 0;
      const rows = modules
        .map((mod) => {
          const size = Buffer.byteLength(mod.code, "utf-8");
          totalSize += size;
          const path = require("path");
          return {
            name: path.basename(mod.filePath),
            size,
          };
        })
        .sort((a, b) => b.size - a.size);

      rows.forEach((row) => {
        const pct = ((row.size / totalSize) * 100).toFixed(1);
        const bar = "█".repeat(Math.round((row.size / totalSize) * 20));
        console.log(
          `   ${row.name.padEnd(20)} ${(row.size + "B").padStart(6)} ${pct.padStart(5)}% ${bar}`
        );
      });

      console.log(
        `   ${"─".repeat(20)} ${("─".repeat(6))} ${"─".repeat(7)}`
      );
      console.log(
        `   ${"Total".padEnd(20)} ${(totalSize + "B").padStart(6)} 100.0%`
      );
    });
  }
}

module.exports = BundleSizePlugin;
