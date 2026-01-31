---
name: React 开发技能
description: React 应用开发的最佳实践和常用模式
---

# React 开发技能

## 项目初始化

### 使用 Vite 创建项目

```bash
npx -y create-vite@latest project-name --template react
cd project-name
npm install
npm run dev
```

### 使用 Next.js 创建项目

```bash
npx -y create-next-app@latest project-name
cd project-name
npm run dev
```

## 组件开发规范

### 函数组件模板

```jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import styles from "./ComponentName.module.css";

/**
 * 组件描述
 * @param {Object} props
 * @param {string} props.title - 标题
 * @param {Function} props.onClick - 点击事件
 */
function ComponentName({ title, onClick }) {
  const [state, setState] = useState(null);

  useEffect(() => {
    // 副作用逻辑
    return () => {
      // 清理函数
    };
  }, []);

  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  const computedValue = useMemo(
    () => {
      return /* 计算逻辑 */;
    },
    [
      /* 依赖 */
    ],
  );

  return (
    <div className={styles.container}>
      <h1>{title}</h1>
      <button onClick={handleClick}>Click</button>
    </div>
  );
}

ComponentName.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

ComponentName.defaultProps = {
  onClick: () => {},
};

export default ComponentName;
```

## 常用 Hooks 模式

### useLocalStorage

```javascript
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
```

### useFetch

```javascript
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network error");
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}
```

## 状态管理

### Context + useReducer 模式

```javascript
const StateContext = createContext(null);
const DispatchContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case "INCREMENT":
      return { ...state, count: state.count + 1 };
    default:
      return state;
  }
}

function StateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

function useAppState() {
  return useContext(StateContext);
}

function useAppDispatch() {
  return useContext(DispatchContext);
}
```

## 性能优化清单

- [ ] 使用 React.memo 包装纯展示组件
- [ ] 使用 useMemo 缓存复杂计算
- [ ] 使用 useCallback 缓存回调函数
- [ ] 使用 lazy + Suspense 代码分割
- [ ] 避免在 render 中创建新对象/数组
- [ ] 使用 key 属性优化列表渲染
