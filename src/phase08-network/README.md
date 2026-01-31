# Phase 8: 网络与安全

> **目标**：掌握网络协议与安全防护  
> **预计时长**：1 周

---

## 📚 本阶段内容

### 学习目标

1. 理解 HTTP/HTTPS 协议
2. 掌握浏览器缓存机制
3. 了解常见安全攻击与防护
4. 理解跨域与 CORS

### 知识要点

- HTTP 请求与响应
- HTTPS 工作原理
- 强缓存与协商缓存
- HTTP/2 与 HTTP/3
- XSS 与 CSRF 防护
- CORS 跨域

### 实战项目

**安全审计清单**：检查项目安全配置

---

## 📂 目录结构

```
phase08-network/
├── CONCEPT.md
├── README.md
├── examples/
│   ├── 01-fetch-api.js
│   ├── 02-cache-headers.js
│   └── 03-cors-example.js
└── exercises/
    └── security-checklist/
```

---

## 🎯 核心概念速览

### HTTP 状态码

```
2xx: 成功 (200 OK, 201 Created)
3xx: 重定向 (301, 302, 304)
4xx: 客户端错误 (400, 401, 403, 404)
5xx: 服务端错误 (500, 502, 503)
```

### 缓存策略

```
强缓存: Cache-Control, Expires
协商缓存: ETag, Last-Modified
```

---

> 完成本阶段后，你应该能够理解网络请求与安全防护。
