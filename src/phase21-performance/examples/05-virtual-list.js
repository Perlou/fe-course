// 虚拟列表实现详解
// 运行: node 05-virtual-list.js

console.log("=== 虚拟列表实现 ===\n");

// ========== 1. 虚拟列表核心原理 ==========
console.log("1. 虚拟列表原理\n");

class VirtualList {
  constructor({ itemCount, itemHeight, containerHeight }) {
    this.itemCount = itemCount;
    this.itemHeight = itemHeight;
    this.containerHeight = containerHeight;
    this.scrollTop = 0;
    this.buffer = 2; // 缓冲区: 上下各多渲染 2 个
  }

  // 计算可见范围
  getVisibleRange() {
    const startIndex = Math.max(0,
      Math.floor(this.scrollTop / this.itemHeight) - this.buffer
    );
    const visibleCount = Math.ceil(this.containerHeight / this.itemHeight);
    const endIndex = Math.min(
      this.itemCount - 1,
      startIndex + visibleCount + this.buffer * 2
    );

    return { startIndex, endIndex, visibleCount };
  }

  // 计算容器样式
  getContainerStyle() {
    return {
      totalHeight: this.itemCount * this.itemHeight,
    };
  }

  // 计算列表项偏移
  getItemStyle(index) {
    return {
      top: index * this.itemHeight,
      height: this.itemHeight,
    };
  }

  // 模拟滚动
  scrollTo(scrollTop) {
    this.scrollTop = scrollTop;
    const { startIndex, endIndex, visibleCount } = this.getVisibleRange();
    const renderedCount = endIndex - startIndex + 1;

    return {
      scrollTop,
      startIndex,
      endIndex,
      renderedCount,
      visibleCount,
      totalItems: this.itemCount,
    };
  }

  // 渲染状态报告
  report(info) {
    console.log(`    滚动位置: ${info.scrollTop}px`);
    console.log(`    可见范围: [${info.startIndex}, ${info.endIndex}]`);
    console.log(`    渲染数量: ${info.renderedCount} / ${info.totalItems} (${((info.renderedCount / info.totalItems) * 100).toFixed(1)}%)`);
  }
}

// 创建虚拟列表: 10000 条数据, 每条 40px, 容器 400px
const vlist = new VirtualList({
  itemCount: 10000,
  itemHeight: 40,
  containerHeight: 400,
});

console.log(`  配置: ${vlist.itemCount} 条数据, 容器 ${vlist.containerHeight}px, 每项 ${vlist.itemHeight}px`);
console.log(`  总高度: ${vlist.getContainerStyle().totalHeight}px\n`);

// 模拟不同滚动位置
console.log("  滚动到顶部 (0px):");
vlist.report(vlist.scrollTo(0));

console.log("\n  滚动到中间 (200000px):");
vlist.report(vlist.scrollTo(200000));

console.log("\n  滚动到底部 (396000px):");
vlist.report(vlist.scrollTo(396000));

// ========== 2. 对比 DOM 渲染 ==========
console.log("\n2. DOM 渲染对比\n");

function compareRendering(itemCount) {
  // 普通列表
  const normalDom = itemCount;
  const normalMemory = itemCount * 0.5; // KB per DOM node

  // 虚拟列表
  const virtualDom = Math.ceil(400 / 40) + 4; // 可见 + buffer
  const virtualMemory = virtualDom * 0.5;

  console.log(`  ${itemCount} 条数据:`);
  console.log(`    普通列表: ${normalDom} DOM 节点, ~${(normalMemory / 1024).toFixed(1)}MB 内存`);
  console.log(`    虚拟列表: ${virtualDom} DOM 节点, ~${(virtualMemory / 1024).toFixed(1)}MB 内存`);
  console.log(`    节省: ${((1 - virtualDom / normalDom) * 100).toFixed(1)}% DOM, ${((1 - virtualMemory / normalMemory) * 100).toFixed(1)}% 内存\n`);
}

compareRendering(1000);
compareRendering(10000);
compareRendering(100000);

// ========== 3. 动态高度虚拟列表 ==========
console.log("3. 动态高度虚拟列表\n");

class DynamicVirtualList {
  constructor({ containerHeight, estimatedItemHeight }) {
    this.containerHeight = containerHeight;
    this.estimatedHeight = estimatedItemHeight;
    this.positions = []; // 每个项目的 top 和 height
  }

  // 初始化位置 (预估)
  initPositions(count) {
    this.positions = Array.from({ length: count }, (_, i) => ({
      index: i,
      top: i * this.estimatedHeight,
      height: this.estimatedHeight,
      bottom: (i + 1) * this.estimatedHeight,
    }));
  }

  // 实际渲染后更新真实高度
  updateItemHeight(index, realHeight) {
    const delta = realHeight - this.positions[index].height;
    this.positions[index].height = realHeight;
    this.positions[index].bottom = this.positions[index].top + realHeight;

    // 更新后续项目的位置
    for (let i = index + 1; i < this.positions.length; i++) {
      this.positions[i].top += delta;
      this.positions[i].bottom += delta;
    }
  }

  // 二分查找起始索引
  findStartIndex(scrollTop) {
    let low = 0, high = this.positions.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (this.positions[mid].bottom <= scrollTop) low = mid + 1;
      else if (this.positions[mid].top > scrollTop) high = mid - 1;
      else return mid;
    }
    return low;
  }

  getTotalHeight() {
    if (this.positions.length === 0) return 0;
    return this.positions[this.positions.length - 1].bottom;
  }
}

const dynamicList = new DynamicVirtualList({
  containerHeight: 400,
  estimatedItemHeight: 50,
});

dynamicList.initPositions(1000);
console.log(`  预估总高度: ${dynamicList.getTotalHeight()}px`);

// 模拟动态高度更新
dynamicList.updateItemHeight(0, 80);
dynamicList.updateItemHeight(1, 35);
dynamicList.updateItemHeight(2, 120);
console.log(`  更新 3 项高度后总高度: ${dynamicList.getTotalHeight()}px`);

const startIdx = dynamicList.findStartIndex(500);
console.log(`  scrollTop=500px 的起始索引: ${startIdx} (二分查找)`);

// ========== 4. 实际使用 ==========
console.log("\n4. 实际使用 (React)\n");
console.log(`
  // react-window (固定高度)
  import { FixedSizeList } from 'react-window';

  <FixedSizeList
    height={400}
    itemCount={10000}
    itemSize={40}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>Row {index}</div>
    )}
  </FixedSizeList>

  // react-virtuoso (动态高度, 推荐)
  import { Virtuoso } from 'react-virtuoso';

  <Virtuoso
    data={items}
    itemContent={(index, item) => <Row item={item} />}
    style={{ height: 400 }}
  />
`);

console.log("=== 虚拟列表完成 ===");
