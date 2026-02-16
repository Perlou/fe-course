// Vue 3 Diff 算法详解
// 运行: node 03-diff.js

console.log("=== Vue 3 Diff 算法 ===\n");

// ========== 1. Diff 策略 ==========
console.log("1. Vue 3 Diff 策略");
console.log(`
  Vue 3 的 patchKeyedChildren 算法:
  1. 头部相同节点比较 (从前往后)
  2. 尾部相同节点比较 (从后往前)
  3. 仅新增节点
  4. 仅删除节点
  5. 乱序部分: 使用最长递增子序列 (LIS) 最小化移动
`);

// ========== 2. 最长递增子序列 (LIS) ==========
console.log("2. 最长递增子序列算法");

function getSequence(arr) {
  const p = arr.slice(); // 前驱索引记录
  const result = [0];    // 结果索引数组
  let i, j, u, v, c;
  const len = arr.length;

  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        // 比最后一个大，直接追加
        p[i] = j;
        result.push(i);
        continue;
      }
      // 二分查找: 找第一个 >= arrI 的位置
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) p[i] = result[u - 1];
        result[u] = i;
      }
    }
  }

  // 回溯: 从后往前恢复正确的索引
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }

  return result;
}

// 演示
const input = [2, 3, 1, 5, 6, 8, 7, 9, 4];
const lis = getSequence(input);
console.log(`  输入:  [${input}]`);
console.log(`  LIS 索引: [${lis}]`);
console.log(`  LIS 值:   [${lis.map((i) => input[i])}]\n`);

// ========== 3. patchKeyedChildren 模拟 ==========
console.log("3. patchKeyedChildren 完整实现");

function isSameVNode(n1, n2) {
  return n1.key === n2.key && n1.type === n2.type;
}

// 操作记录
const operations = [];

function patchKeyedChildren(c1, c2) {
  let i = 0;
  const l2 = c2.length;
  let e1 = c1.length - 1;
  let e2 = l2 - 1;

  // Step 1: 头部比较
  while (i <= e1 && i <= e2) {
    if (isSameVNode(c1[i], c2[i])) {
      operations.push(`  PATCH: ${c1[i].key} (头部相同)`);
      i++;
    } else {
      break;
    }
  }

  // Step 2: 尾部比较
  while (i <= e1 && i <= e2) {
    if (isSameVNode(c1[e1], c2[e2])) {
      operations.push(`  PATCH: ${c1[e1].key} (尾部相同)`);
      e1--;
      e2--;
    } else {
      break;
    }
  }

  // Step 3: 仅新增
  if (i > e1 && i <= e2) {
    while (i <= e2) {
      operations.push(`  INSERT: ${c2[i].key}`);
      i++;
    }
  }
  // Step 4: 仅删除
  else if (i > e2 && i <= e1) {
    while (i <= e1) {
      operations.push(`  REMOVE: ${c1[i].key}`);
      i++;
    }
  }
  // Step 5: 乱序部分
  else {
    const s1 = i;
    const s2 = i;

    // 建立新节点 key → index 映射
    const keyToNewIndexMap = new Map();
    for (i = s2; i <= e2; i++) {
      keyToNewIndexMap.set(c2[i].key, i);
    }

    const toBePatched = e2 - s2 + 1;
    const newIndexToOldIndexMap = new Array(toBePatched).fill(0);
    let moved = false;
    let maxNewIndexSoFar = 0;

    // 遍历旧节点
    for (i = s1; i <= e1; i++) {
      const prevChild = c1[i];
      const newIndex = keyToNewIndexMap.get(prevChild.key);

      if (newIndex === undefined) {
        operations.push(`  REMOVE: ${prevChild.key} (旧节点不在新列表)`);
      } else {
        newIndexToOldIndexMap[newIndex - s2] = i + 1;
        if (newIndex >= maxNewIndexSoFar) {
          maxNewIndexSoFar = newIndex;
        } else {
          moved = true;
        }
        operations.push(`  PATCH: ${prevChild.key} (可复用)`);
      }
    }

    // 使用 LIS 确定不需要移动的节点
    const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
    let j = increasingNewIndexSequence.length - 1;

    // 从后往前处理
    for (i = toBePatched - 1; i >= 0; i--) {
      const nextIndex = s2 + i;
      const nextChild = c2[nextIndex];

      if (newIndexToOldIndexMap[i] === 0) {
        operations.push(`  INSERT: ${nextChild.key} (新节点)`);
      } else if (moved) {
        if (j < 0 || i !== increasingNewIndexSequence[j]) {
          operations.push(`  MOVE: ${nextChild.key}`);
        } else {
          operations.push(`  STABLE: ${nextChild.key} (LIS 中不需要移动)`);
          j--;
        }
      }
    }
  }
}

// ========== 4. 测试用例 ==========

// Case 1: 头部新增
console.log("\n  Case 1: 头部新增");
operations.length = 0;
patchKeyedChildren(
  [{ key: "a", type: "li" }, { key: "b", type: "li" }],
  [{ key: "c", type: "li" }, { key: "a", type: "li" }, { key: "b", type: "li" }]
);
console.log(`  旧: [a, b]  →  新: [c, a, b]`);
operations.forEach((op) => console.log(op));

// Case 2: 尾部新增
console.log("\n  Case 2: 尾部新增");
operations.length = 0;
patchKeyedChildren(
  [{ key: "a", type: "li" }, { key: "b", type: "li" }],
  [{ key: "a", type: "li" }, { key: "b", type: "li" }, { key: "c", type: "li" }]
);
console.log(`  旧: [a, b]  →  新: [a, b, c]`);
operations.forEach((op) => console.log(op));

// Case 3: 删除
console.log("\n  Case 3: 中间删除");
operations.length = 0;
patchKeyedChildren(
  [{ key: "a", type: "li" }, { key: "b", type: "li" }, { key: "c", type: "li" }],
  [{ key: "a", type: "li" }, { key: "c", type: "li" }]
);
console.log(`  旧: [a, b, c]  →  新: [a, c]`);
operations.forEach((op) => console.log(op));

// Case 4: 乱序 (核心场景)
console.log("\n  Case 4: 乱序 (LIS 优化)");
operations.length = 0;
patchKeyedChildren(
  [{ key: "a", type: "li" }, { key: "b", type: "li" }, { key: "c", type: "li" }, { key: "d", type: "li" }, { key: "e", type: "li" }],
  [{ key: "a", type: "li" }, { key: "d", type: "li" }, { key: "b", type: "li" }, { key: "e", type: "li" }, { key: "c", type: "li" }]
);
console.log(`  旧: [a, b, c, d, e]  →  新: [a, d, b, e, c]`);
operations.forEach((op) => console.log(op));

// ========== 5. React vs Vue Diff 对比 ==========
console.log("\n5. React vs Vue Diff 对比");
console.log(`
  ┌──────────────────┬──────────────────┬──────────────────┐
  │                  │ React            │ Vue 3            │
  ├──────────────────┼──────────────────┼──────────────────┤
  │ Diff 粒度        │ 组件级           │ 组件级 + 编译优化 │
  │ 列表 Diff        │ 单向遍历         │ 双端 + LIS       │
  │ 编译优化         │ 无               │ PatchFlag+Block  │
  │ 静态节点         │ 参与 Diff        │ 跳过 (静态提升)  │
  │ 移动策略         │ 多次移动         │ LIS 最小化移动   │
  │ 同层比较         │ ✅               │ ✅               │
  │ Key 作用         │ 识别可复用节点   │ 识别可复用节点    │
  └──────────────────┴──────────────────┴──────────────────┘
`);

console.log("=== Diff 算法完成 ===");
