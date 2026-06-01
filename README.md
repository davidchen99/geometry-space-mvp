# 几何空间 MVP

几何空间是一个面向初中、高中几何学习的文字转 2D / 3D 可视化工具。用户输入课本式几何题，系统优先用前端本地规则生成可交互模型；本地规则无法覆盖时，可通过后端代理调用 DeepSeek，把题目解析成可渲染的点、线、面和方程。

前端使用 Three.js 渲染模型，Node 版本负责本地运行和管理后台，Cloudflare 版本负责公网部署、D1 数据存储和静态资源托管。

## 快速运行

要求 Node.js 18 或更高版本。页面中的 Three.js 和 lucide 图标通过 CDN 加载，浏览器需要能访问外网 CDN。

```powershell
npm start
```

访问：

```text
http://localhost:5173/
```

管理员入口在页面左上角。初始管理员账号：

```text
账号：admin
密码：123456
```

部署到公网后先修改管理员密码，再配置 DeepSeek API Key。

## 功能清单

### 题目输入

- 示例题：内置正方体、长方体、三棱锥、四棱锥、三角形题目。
- 题目完善：输入区星光按钮只基于原文整理图形、点名、长度和关系；缺失信息会明确提示，不自动编造条件。
- Tips：无 API Key 或未登录时返回本地题目模板；配置 DeepSeek 且学生额度可用时可生成更贴近输入内容的建议。
- 选择题识别：可识别带 A、B、C、D 选项的题目，并按每个选项分别生成模型。
- 理解确认：复杂题或选择题会先展示题型、关系、视图模式和简略预览，用户确认后再生成。

### 本地规则建模

- 3D 空间几何：正方体、长方体、三棱锥 / 三角锥、四面体、四棱锥 / 正四棱锥、P-ABC / P-ABCD 这类棱锥记法；模型会尽量保持题目点名和模型标签一一对应。
- 2D 平面几何：三角形、圆、椭圆、抛物线、双曲线、直线、轨迹 / 动点示意。
- 文本特征：边长、指定线段长度、中点、交点 / 底面中心、重心、连接线、垂直 / 平行关系。
- 自动信息：点坐标、线段长度、面面积、体积、底面方程、高线方程、边或连接线的参数方程。

### 交互查看

- 2D / 3D 视图切换。
- 旋转、缩放、平移和重置视角。
- 点、线、面点击高亮，并显示元素详情。
- 坐标网格、辅助线显示开关。
- 两点测距。
- 导出画布 PNG。
- 桌面端和手机端默认只展示题目输入和模型区域；示例、Tips、解析、元素详情等通过图标按需打开。
- 手机端底部导航，可在输入、模型、解析信息之间切换。

### 学习辅助

- 本机题目历史：浏览器内保存最多 30 条题目记录，点击可恢复。
- 步骤：展示建模 / 解题步骤，并同步展示方程信息。
- 问答：围绕题目和已生成模型提问；无 API Key 时返回本地保底回答。
- Help 模式：按读题型、找点线面、看条件、生成图形、检查元素、补写题目 6 步提示。

### 用户与后台

- 学生登记 / 登录：使用用户名、手机号和可选邀请码登记。
- 使用记录与额度：前端要求学生登录后才能生成，后端也会强制校验学生 token，并按个人每日 AI 上限拦截真实 AI 调用。
- 无邀请码试用：未填写邀请码的学生也可登记试用，默认每日 AI 上限由管理员后台配置。
- 邀请码：管理员可创建、编辑、删除邀请码，设置最大使用次数、每日 AI 上限和每月 token 上限；后台列表支持一键复制邀请码。
- 管理后台：配置 DeepSeek API 地址、模型、提示词模板、每日 AI 调用上限、启停 AI、清除 Key、修改密码。
- 数据看板：查看访问、生成、AI 请求、成功率、调用记录、邀请码和学生用量。

## 历史记录说明

题目历史保存在浏览器 `localStorage`，键名是 `geometry-space-problem-history`。这类历史只属于本机浏览器，不会同步到服务器；更换浏览器、清理站点数据、使用隐私窗口或浏览器自动清理缓存后，这些题目历史会消失。

管理员后台里的调用记录和学生用量由后端保存：本地 Node 版本写入 `data/state.json`，Cloudflare 版本写入 D1 数据库。

## DeepSeek 配置

普通用户不需要填写 API Key。管理员登录后台后配置：

- DeepSeek API Key
- API 地址，默认 `https://api.deepseek.com/chat/completions`
- 模型名称，默认 `deepseek-v4-flash`
- 提示词模板，使用 `{{problem}}` 作为题目占位符
- 每日 AI 调用上限
- AI 启用状态
- 无邀请码学生的默认每日 AI 上限

前端会先走本地规则解析；本地规则失败且后端可用时，再通过 `/api/parse` 调用 DeepSeek。API Key 只保存在后端，不会发送给普通用户浏览器。

管理员首次使用默认密码登录后，后端会要求先修改密码；在修改前不能保存配置或查看完整后台数据。

## API 速查

| 接口 | 方法 | 用途 |
| --- | --- | --- |
| `/api/health` | GET | 检查后端和 AI Key 配置状态 |
| `/api/visit` | POST | 记录访问 |
| `/api/usage` | POST | 记录本地解析或失败事件 |
| `/api/auth/register` | POST | 学生登记 |
| `/api/auth/login` | POST | 学生登录 |
| `/api/auth/me` | GET | 读取当前学生 |
| `/api/parse` | POST | 调用 DeepSeek 解析模型 |
| `/api/tips` | POST | 获取输入建议 |
| `/api/coach` | POST | 获取步骤或问答 |
| `/api/admin/login` | POST | 管理员登录 |
| `/api/admin/config` | GET / PUT | 读取或保存 AI 配置 |
| `/api/admin/password` | PUT | 修改管理员密码 |
| `/api/admin/stats` | GET | 后台统计 |
| `/api/admin/invites` | GET / POST | 查看或创建邀请码 |
| `/api/admin/invites/:id` | PUT / DELETE | 编辑或删除邀请码 |
| `/api/admin/users` | GET | 查看学生用量 |
| `/api/admin/logout` | POST | 管理员退出 |

## 数据与部署

本地 Node 版本：

- 静态文件：`index.html`、`styles.css`、`app.js`
- 后端入口：`server.js`
- 本地数据：`data/state.json`
- 端口：默认 `5173`，可通过 `PORT` 环境变量修改
- 监听地址：默认 `127.0.0.1`，可通过 `HOST` 环境变量修改

Cloudflare 版本：

- Worker / Functions 代码：`cloudflare/_worker.js`
- D1 表结构：`cloudflare/schema.sql`
- Pages 配置：`wrangler.toml`
- 构建静态目录：`public/`

构建 Cloudflare Pages 输出：

```powershell
npm run build:cf
```

部署到 Cloudflare Pages：

```powershell
npm run deploy:cf
```

首次部署前需要先创建并绑定 D1 数据库，把 `cloudflare/schema.sql` 应用到数据库，并完成 Wrangler 登录。

## 已知说明

- 本地 Node 后端和 Cloudflare Worker 都会对真实 AI 调用校验学生登录态，并按全站 `dailyLimit` 和学生 `dailyAiLimit` 拦截。
- `/api/tips` 和 `/api/coach` 在未登录、未配置 Key 或超额时会返回本地保底内容，不会调用 DeepSeek。
- 学生登录当前仍是手机号快速登记 / 登录，正式收费或大规模公开使用前应接入短信验证码、邮箱验证码或密码体系。

## 更新日志

详细更新记录见 [CHANGELOG.md](./CHANGELOG.md)。
