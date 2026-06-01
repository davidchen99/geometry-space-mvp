# AGENTS.md

## 项目速览

几何空间 MVP 是一个初高中几何题文字转 2D / 3D 模型工具。前端在 `index.html`、`styles.css`、`app.js`，本地 Node 后端在 `server.js`，Cloudflare Pages / Worker 后端在 `cloudflare/_worker.js`，D1 schema 在 `cloudflare/schema.sql`。

## 必守边界

- 不要把真实 DeepSeek API Key、`data/state.json`、`.wrangler/`、`public/`、`node_modules/`、`test-results/` 提交进 Git。
- DeepSeek API Key 只能由后端保存和调用；普通用户前端只能看到 `apiKeySet` / 脱敏状态。
- 改 AI 调用、安全、额度、用户、邀请码逻辑时，必须同时检查 `server.js` 和 `cloudflare/_worker.js`，避免本地和公网行为分裂。
- `/api/parse` 必须强制学生登录；`/api/tips` 和 `/api/coach` 未登录或超额时只能返回本地保底，不应调用 DeepSeek。
- 真实 AI 调用必须同时受全站 `dailyLimit` 和学生 `dailyAiLimit` 限制。
- 管理员默认密码只能用于首次进入；默认密码未修改前不能允许保存后台配置或查看完整后台数据。
- 学生登录目前是手机号快速登记 / 登录；正式公开或收费前不要把它当作强认证。
- 浏览器题目历史只存在 `localStorage`，不要承诺跨设备同步。

## 常用命令

```powershell
npm start
npm run build:cf
npm run deploy:cf
node --check server.js
node --check cloudflare\_worker.js
node --check app.js
```

## 文档维护

- README 面向使用者和接手者，保持运行、功能、API、部署、安全说明与代码一致。
- CHANGELOG 只记录对使用、部署、运维或后续开发有影响的变化。
- AGENTS.md 只放下次 AI 写代码时必须遵守的规则，不写单次开发流水账。
