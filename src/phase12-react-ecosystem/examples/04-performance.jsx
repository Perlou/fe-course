// React 性能优化详解
// 本文件展示 React 性能优化技巧（伪代码，需在 React 项目中运行）
// 运行: node 04-performance.jsx

console.log("=== React 性能优化 ===\n");

// ========== 1. React.memo ==========
console.log("1. React.memo 避免无效重渲染");

console.log(`
  // 未优化: 父组件每次渲染，子组件都会重渲染
  function Parent() {
    const [count, setCount] = useState(0);
    return (
      <div>
        <button onClick={() => setCount(c => c + 1)}>{count}</button>
        <ExpensiveChild data={staticData} />  {/* 每次都重渲染! */}
      </div>
    );
  }

  // 优化: 使用 React.memo
  const ExpensiveChild = React.memo(function ExpensiveChild({ data }) {
    console.log('渲染 ExpensiveChild'); // props 不变时不会打印
    return <div>{data.map(...)}</div>;
  });

  // 自定义比较函数
  const MemoList = React.memo(
    function MemoList({ items, selectedId }) {
      return <ul>{items.map(...)}</ul>;
    },
    (prev, next) => {
      // 只比较关键 props
      return prev.selectedId === next.selectedId
        && prev.items.length === next.items.length;
    }
  );
`);

// ========== 2. useMemo & useCallback ==========
console.log("2. useMemo & useCallback");

console.log(`
  function SearchResults({ items, query }) {
    // ✅ useMemo: 缓存计算结果
    const filtered = useMemo(() => {
      console.log('过滤中...');
      return items.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
    }, [items, query]);  // 只有 items/query 变化时重新计算

    // ✅ useCallback: 缓存函数引用
    const handleSelect = useCallback((id) => {
      console.log('选中:', id);
    }, []);  // 引用不变，不会导致子组件重渲染

    return (
      <List
        items={filtered}
        onSelect={handleSelect}  // 稳定引用
      />
    );
  }

  // ⚠️ 常见错误: 在 memo 组件中传递内联对象/函数
  // ❌ 每次渲染都创建新对象/函数
  <MemoChild style={{ color: 'red' }} onClick={() => doSth()} />

  // ✅ 使用 useMemo/useCallback
  const style = useMemo(() => ({ color: 'red' }), []);
  const onClick = useCallback(() => doSth(), []);
  <MemoChild style={style} onClick={onClick} />
`);

// ========== 3. 代码分割 ==========
console.log("3. 代码分割 (lazy + Suspense)");

console.log(`
  import { lazy, Suspense } from 'react';

  // 路由级别分割
  const Home = lazy(() => import('./pages/Home'));
  const Dashboard = lazy(() => import('./pages/Dashboard'));
  const Settings = lazy(() => import('./pages/Settings'));

  function App() {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    );
  }

  // 组件级别分割
  const HeavyChart = lazy(() => import('./components/Chart'));

  function Analytics() {
    const [showChart, setShowChart] = useState(false);
    return (
      <div>
        <button onClick={() => setShowChart(true)}>显示图表</button>
        {showChart && (
          <Suspense fallback={<Spinner />}>
            <HeavyChart />
          </Suspense>
        )}
      </div>
    );
  }

  // 预加载 (hover 时开始加载)
  const ChartModule = () => import('./components/Chart');
  const HeavyChart = lazy(ChartModule);

  <button
    onMouseEnter={ChartModule}  // hover 时预加载
    onClick={() => setShowChart(true)}
  >显示图表</button>
`);

// ========== 4. 虚拟列表 ==========
console.log("4. 虚拟列表 (长列表优化)");

console.log(`
  // react-window: 只渲染可见区域的 DOM
  import { FixedSizeList, VariableSizeList } from 'react-window';

  // 固定高度列表
  function VirtualList({ items }) {
    const Row = ({ index, style }) => (
      <div style={style} className="list-item">
        <span>{items[index].name}</span>
        <span>{items[index].email}</span>
      </div>
    );

    return (
      <FixedSizeList
        height={600}              // 容器高度
        width="100%"
        itemCount={items.length}  // 10000 条也不卡
        itemSize={50}             // 每行高度
        overscanCount={5}         // 多渲染 5 条缓冲
      >
        {Row}
      </FixedSizeList>
    );
  }

  // 不定高度列表
  <VariableSizeList
    height={600}
    itemCount={items.length}
    itemSize={index => items[index].expanded ? 120 : 50}
  >
    {Row}
  </VariableSizeList>

  // react-virtuoso: 更简单的 API
  import { Virtuoso } from 'react-virtuoso';

  <Virtuoso
    style={{ height: 600 }}
    totalCount={10000}
    itemContent={index => <div>Item {index}</div>}
  />
`);

// ========== 5. useTransition ==========
console.log("5. useTransition (并发模式)");

console.log(`
  import { useState, useTransition, useDeferredValue } from 'react';

  // useTransition: 标记低优先级更新
  function Search() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isPending, startTransition] = useTransition();

    const handleChange = (e) => {
      setQuery(e.target.value);             // 高优先级: 输入响应

      startTransition(() => {
        setResults(filterData(e.target.value)); // 低优先级: 列表更新
      });
    };

    return (
      <div>
        <input value={query} onChange={handleChange} />
        {isPending && <Spinner />}
        <ResultList items={results} />
      </div>
    );
  }

  // useDeferredValue: 延迟某个值的更新
  function SearchResults({ query }) {
    const deferredQuery = useDeferredValue(query);
    const isStale = query !== deferredQuery;

    const results = useMemo(
      () => filterData(deferredQuery),
      [deferredQuery]
    );

    return (
      <div style={{ opacity: isStale ? 0.5 : 1 }}>
        <ResultList items={results} />
      </div>
    );
  }
`);

// ========== 6. Profiler ==========
console.log("6. Profiler 性能分析");

console.log(`
  import { Profiler } from 'react';

  function onRender(id, phase, actualDuration, baseDuration) {
    console.log({
      id,              // Profiler id
      phase,           // 'mount' | 'update'
      actualDuration,  // 实际渲染时间 (ms)
      baseDuration,    // 未优化的渲染时间 (ms)
    });

    // 发送到监控平台
    if (actualDuration > 16) { // 超过 1 帧 (60fps)
      reportSlowRender(id, actualDuration);
    }
  }

  <Profiler id="Dashboard" onRender={onRender}>
    <Dashboard />
  </Profiler>

  // React DevTools Profiler:
  //   1. 打开 React DevTools → Profiler 标签
  //   2. 点击录制按钮
  //   3. 执行操作
  //   4. 查看火焰图和排行榜
`);

// ========== 7. 优化清单 ==========
console.log("7. 性能优化清单");

console.log(`
  ┌──────────────────────────────────────────────────────────┐
  │  渲染优化                                                │
  ├──────────────────────────────────────────────────────────┤
  │  □ React.memo 包裹纯展示组件                             │
  │  □ useMemo 缓存复杂计算                                 │
  │  □ useCallback 稳定函数引用                              │
  │  □ 避免在 render 中创建新对象/数组                       │
  │  □ 使用 key 帮助 React 识别列表项                        │
  ├──────────────────────────────────────────────────────────┤
  │  加载优化                                                │
  ├──────────────────────────────────────────────────────────┤
  │  □ React.lazy 路由级代码分割                             │
  │  □ Suspense 展示加载状态                                 │
  │  □ 预加载关键路由 (prefetch)                              │
  │  □ 图片懒加载 (loading="lazy")                           │
  ├──────────────────────────────────────────────────────────┤
  │  状态优化                                                │
  ├──────────────────────────────────────────────────────────┤
  │  □ 状态下沉到使用的组件                                  │
  │  □ 避免不必要的 Context 值变化                            │
  │  □ 大列表用 react-window 虚拟滚动                       │
  │  □ useTransition 处理低优先级更新                        │
  └──────────────────────────────────────────────────────────┘
`);

console.log("=== 性能优化完成 ===");
