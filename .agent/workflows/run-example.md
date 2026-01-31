---
description: 运行示例代码
---

# 运行示例代码

按以下步骤运行课程中的示例代码：

## 1. JavaScript/TypeScript 示例

### 直接运行 Node.js

// turbo

```bash
node src/phaseXX-name/examples/example-name.js
```

### 使用 ts-node 运行 TypeScript

// turbo

```bash
npx ts-node src/phaseXX-name/examples/example-name.ts
```

## 2. HTML/CSS/前端示例

### 使用 Live Server

// turbo

```bash
npx -y live-server src/phaseXX-name/examples/ --port=3000
```

### 使用 Vite 开发服务器

// turbo

```bash
cd src/phaseXX-name/examples && npx -y vite
```

## 3. React 示例

### 创建临时 React 环境

```bash
npx -y create-vite@latest temp-react --template react
cd temp-react
npm install
npm run dev
```

然后将示例代码粘贴到对应文件中测试。

## 4. Vue 示例

### 创建临时 Vue 环境

```bash
npx -y create-vite@latest temp-vue --template vue
cd temp-vue
npm install
npm run dev
```

## 5. Three.js/WebGL 示例

// turbo

```bash
cd src/phase23-webgl-threejs/examples && npx -y vite
```

## 6. 清理临时环境

// turbo

```bash
rm -rf temp-react temp-vue
```
