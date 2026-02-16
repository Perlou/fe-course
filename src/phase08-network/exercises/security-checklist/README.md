# 前端安全审计清单

## 使用说明

对照以下清单检查你的前端项目安全配置。每一项通过后打勾 ✅。

---

## 📋 一、XSS 防护

- [ ] **输出编码**: 所有用户输入在渲染前进行 HTML 转义
- [ ] **避免 innerHTML**: 使用 `textContent` 或框架的自动转义
- [ ] **React dangerouslySetInnerHTML**: 仅在确认输入安全时使用
- [ ] **Vue v-html**: 仅在确认输入安全时使用
- [ ] **CSP 策略**: 配置 Content-Security-Policy 头
  ```
  Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted-cdn.com
  ```
- [ ] **避免 eval()**: 不使用 eval, new Function, setTimeout(string)
- [ ] **URL 验证**: 用户提供的 URL 使用 `javascript:` 协议检查
- [ ] **富文本消毒**: 如需渲染富文本，使用 DOMPurify 等库处理

---

## 📋 二、CSRF 防护

- [ ] **CSRF Token**: 表单提交包含服务端生成的 CSRF Token
- [ ] **SameSite Cookie**: Cookie 设置 `SameSite=Lax` 或 `Strict`
- [ ] **Origin 验证**: 服务端验证 `Origin` 或 `Referer` 头
- [ ] **敏感操作确认**: 转账、删除等操作需要二次确认（密码/验证码）

---

## 📋 三、Cookie 安全

- [ ] **HttpOnly**: 会话 Cookie 设置 `HttpOnly`（防止 JS 读取）
- [ ] **Secure**: Cookie 设置 `Secure`（仅 HTTPS 传输）
- [ ] **SameSite**: Cookie 设置 `SameSite=Lax`
- [ ] **合理过期**: 设置合理的 `Max-Age` 或 `Expires`
- [ ] **最小 Path**: 限制 Cookie 的 Path 范围

---

## 📋 四、HTTPS / 传输安全

- [ ] **全站 HTTPS**: 所有页面通过 HTTPS 访问
- [ ] **HSTS**: 配置 `Strict-Transport-Security` 头
  ```
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  ```
- [ ] **HTTP 重定向**: HTTP 请求自动重定向到 HTTPS
- [ ] **混合内容**: 无 HTTP 资源在 HTTPS 页面加载

---

## 📋 五、安全响应头

- [ ] **X-Content-Type-Options**: `nosniff`
- [ ] **X-Frame-Options**: `SAMEORIGIN`（防点击劫持）
- [ ] **X-XSS-Protection**: `1; mode=block`
- [ ] **Referrer-Policy**: `strict-origin-when-cross-origin`
- [ ] **Permissions-Policy**: 禁用不需要的浏览器功能
  ```
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  ```

---

## 📋 六、认证与授权

- [ ] **JWT 存储**: Token 存储在 `httpOnly` Cookie 中（非 localStorage）
- [ ] **Token 过期**: 设置合理的过期时间，支持刷新机制
- [ ] **密码加密**: 使用 bcrypt/argon2 哈希存储，不明文传输
- [ ] **登录限制**: 实施登录失败次数限制和账户锁定
- [ ] **权限检查**: 前后端都进行权限验证

---

## 📋 七、输入验证

- [ ] **前端验证**: 所有用户输入进行格式验证
- [ ] **后端验证**: 服务端对所有输入进行严格验证
- [ ] **类型检查**: 验证数据类型（字符串、数字等）
- [ ] **长度限制**: 对输入长度进行限制
- [ ] **文件上传**: 验证文件类型、大小，不信任文件扩展名
- [ ] **SQL 注入**: 使用参数化查询，不拼接 SQL

---

## 📋 八、依赖安全

- [ ] **依赖审计**: 定期运行 `npm audit`
- [ ] **锁文件**: 使用 `package-lock.json` 或 `pnpm-lock.yaml`
- [ ] **更新策略**: 及时更新有安全漏洞的依赖
- [ ] **最小依赖**: 避免不必要的第三方库

---

## 📋 九、敏感信息

- [ ] **环境变量**: 密钥、API Key 使用环境变量，不硬编码
- [ ] **.gitignore**: `.env` 等配置文件不提交到代码仓库
- [ ] **前端无密钥**: 前端代码中不包含任何密钥
- [ ] **Source Map**: 生产环境不暴露 Source Map
- [ ] **错误信息**: 生产环境不显示详细错误堆栈

---

## 📋 十、其他

- [ ] **CORS 配置**: 不使用 `Access-Control-Allow-Origin: *`（生产环境）
- [ ] **Subresource Integrity**: CDN 资源添加 `integrity` 属性
  ```html
  <script
    src="https://cdn.example.com/lib.js"
    integrity="sha384-xxxx"
    crossorigin="anonymous"
  ></script>
  ```
- [ ] **点击劫持**: 部署 `X-Frame-Options` 或 `CSP frame-ancestors`
- [ ] **WebSocket**: WS 连接进行身份验证和 Origin 检查

---

## 练习任务

1. 选择一个你的项目（或开源项目），逐项检查以上清单
2. 标记已通过的项目，记录未通过的项目
3. 对未通过的项目提出修复方案
4. 至少修复 3 个安全问题并记录修复过程

### 参考工具

| 工具            | 用途         | 链接                        |
| --------------- | ------------ | --------------------------- |
| npm audit       | 依赖漏洞检测 | `npm audit`                 |
| Lighthouse      | 安全审计     | Chrome DevTools             |
| SecurityHeaders | 响应头检查   | securityheaders.com         |
| OWASP ZAP       | 安全扫描     | owasp.org/www-project-zap   |
| DOMPurify       | XSS 消毒     | github.com/cure53/DOMPurify |
