# Phase 16: Node.js 开发

> **目标**：掌握 Node.js 后端开发  
> **预计时长**：2 周

---

## 📚 本阶段内容

### 学习目标

1. 理解 Node.js 核心模块
2. 掌握 Express/Koa 框架
3. 了解 NestJS 企业级框架
4. 熟悉 API 设计规范

### 知识要点

- Node.js 事件循环
- 核心模块 (fs, http, path, stream)
- Express 中间件
- RESTful API 设计
- 错误处理与日志
- 身份认证 (JWT)

### 实战项目

**REST API 服务**：构建完整的后端 API

---

## 🎯 核心概念

### Express 中间件

```javascript
app.use((req, res, next) => {
  console.log("Request:", req.method, req.url);
  next();
});
```

### JWT 认证

```javascript
const token = jwt.sign({ userId }, secret, { expiresIn: "7d" });
const payload = jwt.verify(token, secret);
```

---

> 完成本阶段后，你应该能够独立开发后端 API 服务。
