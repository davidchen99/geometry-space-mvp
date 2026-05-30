# 几何空间 MVP

一个面向初中、高中学生的数学题文字转图形理解工具。当前版本不依赖登录和 API Key，使用本地规则解析常见题型，并用 Three.js 生成可交互模型。

## 快速运行

推荐用本地静态服务器打开，避免浏览器拦截 ES Module：

```powershell
python -m http.server 5173
```

然后访问：

```text
http://localhost:5173/
```

## 当前支持

- 正方体：边长、顶点标注、中点、连接线
- 长方体：AB、BC、AA1 三向尺寸
- 三棱锥：线面垂直、底面直角关系、侧棱
- 四棱锥：正方形底面、底面中心、高、对角线
- 平面三角形：三边长度、中点、连接线
- 交互：旋转、缩放、平移、点击高亮、重置视角、辅助线开关、测距、导出 PNG

## DeepSeek 接入预留

当前默认是本地规则解析。后续接 DeepSeek 时，入口已预留在 `app.js`：

- `window.GeometrySpaceAI.provider`
- `buildDeepSeekPrompt(problemText)`
- `requestDeepSeekParse(problemText, apiKey, endpoint)`

正式上线时不要把 DeepSeek API Key 直接写进前端页面，建议通过后端代理请求。
