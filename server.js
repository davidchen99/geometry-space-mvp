const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const PORT = Number(process.env.PORT || 5173);
const HOST = process.env.HOST || "127.0.0.1";
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const STATE_FILE = path.join(DATA_DIR, "state.json");

const sessions = new Map();

const defaultPrompt = `你是一个严谨的初高中几何题结构化解析器。
请把题目转成一个可直接渲染的 JSON，必须只输出 JSON，不要 Markdown。
坐标采用右手坐标系，z 轴表示高度。优先让图形清晰、点线面关系正确。
JSON 格式：
{
  "type": "ai",
  "title": "模型名称",
  "description": "一句话说明",
  "points": {
    "A": { "label": "A", "role": "顶点", "position": { "x": 0, "y": 0, "z": 0 } }
  },
  "segments": [
    { "from": "A", "to": "B", "kind": "edge", "note": "棱" }
  ],
  "faces": [
    { "label": "平面ABC", "vertices": ["A", "B", "C"] }
  ],
  "relations": ["AB ⟂ BC"]
}
kind 只能是 edge、connection、aux。
题目：{{problem}}`;

const defaultState = {
  admin: {
    username: "admin",
    passwordHash: hashPassword("123456"),
  },
  config: {
    provider: "deepseek",
    apiKey: "",
    endpoint: "https://api.deepseek.com/chat/completions",
    model: "deepseek-v4-flash",
    promptTemplate: defaultPrompt,
    aiEnabled: true,
    dailyLimit: 200,
  },
  stats: {
    totalVisits: 0,
    totalGenerations: 0,
    localSuccess: 0,
    aiRequests: 0,
    aiSuccess: 0,
    aiFailure: 0,
    daily: {},
    recent: [],
  },
};

function hashPassword(password) {
  return crypto.createHash("sha256").update(`geometry-space:${password}`).digest("hex");
}

function ensureState() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STATE_FILE)) {
    fs.writeFileSync(STATE_FILE, JSON.stringify(defaultState, null, 2), "utf8");
  }
}

function readState() {
  ensureState();
  const raw = fs.readFileSync(STATE_FILE, "utf8");
  return mergeState(defaultState, JSON.parse(raw));
}

function writeState(state) {
  ensureState();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
}

function mergeState(base, value) {
  if (Array.isArray(base)) return Array.isArray(value) ? value : base;
  if (!base || typeof base !== "object") return value === undefined ? base : value;
  const output = { ...base };
  Object.entries(value || {}).forEach(([key, item]) => {
    output[key] = mergeState(base[key], item);
  });
  return output;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getDaily(stats) {
  const key = todayKey();
  if (!stats.daily[key]) {
    stats.daily[key] = {
      visits: 0,
      generations: 0,
      localSuccess: 0,
      aiRequests: 0,
      aiSuccess: 0,
      aiFailure: 0,
    };
  }
  return stats.daily[key];
}

function recordRecent(stats, item) {
  stats.recent.unshift({
    time: new Date().toISOString(),
    ...item,
    text: String(item.text || "").slice(0, 220),
  });
  stats.recent = stats.recent.slice(0, 50);
}

function publicConfig(config) {
  return {
    provider: config.provider,
    endpoint: config.endpoint,
    model: config.model,
    promptTemplate: config.promptTemplate,
    aiEnabled: Boolean(config.aiEnabled),
    dailyLimit: Number(config.dailyLimit || 0),
    apiKeySet: Boolean(config.apiKey),
    apiKeyMask: config.apiKey ? maskKey(config.apiKey) : "",
  };
}

function maskKey(key) {
  if (!key) return "";
  if (key.length <= 10) return "已填写";
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(payload);
}

function text(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 2 * 1024 * 1024) {
        reject(new Error("请求体过大"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("JSON 格式错误"));
      }
    });
    req.on("error", reject);
  });
}

function createSession() {
  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, Date.now() + 1000 * 60 * 60 * 12);
  return token;
}

function getAuth(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const expires = sessions.get(token);
  if (!expires || expires < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return token;
}

function requireAdmin(req, res) {
  const token = getAuth(req);
  if (!token) {
    json(res, 401, { ok: false, error: "请先登录管理员账号" });
    return null;
  }
  return token;
}

function routeStatic(req, res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
  const filePath = path.resolve(ROOT, `.${safePath}`);
  if (!filePath.startsWith(ROOT)) return text(res, 403, "Forbidden");
  if (filePath.startsWith(DATA_DIR) || filePath.includes(`${path.sep}.git${path.sep}`)) {
    return text(res, 403, "Forbidden");
  }

  fs.readFile(filePath, (error, data) => {
    if (error) return text(res, 404, "Not found");
    const ext = path.extname(filePath).toLowerCase();
    const types = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".svg": "image/svg+xml",
    };
    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
    res.end(data);
  });
}

async function handleApi(req, res, pathname) {
  try {
    if (req.method === "GET" && pathname === "/api/health") {
      const state = readState();
      return json(res, 200, { ok: true, config: { aiEnabled: state.config.aiEnabled, apiKeySet: Boolean(state.config.apiKey) } });
    }

    if (req.method === "POST" && pathname === "/api/visit") {
      const state = readState();
      const daily = getDaily(state.stats);
      state.stats.totalVisits += 1;
      daily.visits += 1;
      writeState(state);
      return json(res, 200, { ok: true });
    }

    if (req.method === "POST" && pathname === "/api/usage") {
      const body = await readBody(req);
      const state = readState();
      const daily = getDaily(state.stats);
      state.stats.totalGenerations += 1;
      daily.generations += 1;
      if (body.source === "local" && body.success) {
        state.stats.localSuccess += 1;
        daily.localSuccess += 1;
      }
      recordRecent(state.stats, {
        source: body.source || "local",
        status: body.success ? "success" : "failure",
        text: body.text || "",
        error: body.error || "",
        modelTitle: body.modelTitle || "",
      });
      writeState(state);
      return json(res, 200, { ok: true });
    }

    if (req.method === "POST" && pathname === "/api/parse") {
      const body = await readBody(req);
      return await parseWithAi(res, body);
    }

    if (req.method === "POST" && pathname === "/api/tips") {
      const body = await readBody(req);
      return await suggestTips(res, body);
    }

    if (req.method === "POST" && pathname === "/api/admin/login") {
      const body = await readBody(req);
      const state = readState();
      if (body.username !== state.admin.username || hashPassword(body.password || "") !== state.admin.passwordHash) {
        return json(res, 401, { ok: false, error: "账号或密码不正确" });
      }
      return json(res, 200, { ok: true, token: createSession(), config: publicConfig(state.config), stats: buildStats(state) });
    }

    if (pathname.startsWith("/api/admin/")) {
      if (!requireAdmin(req, res)) return;
    }

    if (req.method === "GET" && pathname === "/api/admin/config") {
      const state = readState();
      return json(res, 200, { ok: true, config: publicConfig(state.config) });
    }

    if (req.method === "PUT" && pathname === "/api/admin/config") {
      const body = await readBody(req);
      const state = readState();
      state.config.provider = "deepseek";
      state.config.endpoint = String(body.endpoint || state.config.endpoint).trim();
      state.config.model = String(body.model || state.config.model).trim();
      state.config.promptTemplate = String(body.promptTemplate || state.config.promptTemplate).trim();
      state.config.aiEnabled = Boolean(body.aiEnabled);
      state.config.dailyLimit = clampInteger(body.dailyLimit, 1, 100000, state.config.dailyLimit);
      if (typeof body.apiKey === "string" && body.apiKey.trim()) {
        state.config.apiKey = body.apiKey.trim();
      }
      if (body.clearApiKey) {
        state.config.apiKey = "";
      }
      writeState(state);
      return json(res, 200, { ok: true, config: publicConfig(state.config) });
    }

    if (req.method === "PUT" && pathname === "/api/admin/password") {
      const body = await readBody(req);
      const state = readState();
      if (hashPassword(body.oldPassword || "") !== state.admin.passwordHash) {
        return json(res, 400, { ok: false, error: "旧密码不正确" });
      }
      const next = String(body.newPassword || "");
      if (next.length < 6) return json(res, 400, { ok: false, error: "新密码至少 6 位" });
      state.admin.passwordHash = hashPassword(next);
      writeState(state);
      return json(res, 200, { ok: true });
    }

    if (req.method === "GET" && pathname === "/api/admin/stats") {
      const state = readState();
      return json(res, 200, { ok: true, stats: buildStats(state) });
    }

    if (req.method === "POST" && pathname === "/api/admin/logout") {
      const token = getAuth(req);
      if (token) sessions.delete(token);
      return json(res, 200, { ok: true });
    }

    return json(res, 404, { ok: false, error: "接口不存在" });
  } catch (error) {
    return json(res, 500, { ok: false, error: error.message || "服务器错误" });
  }
}

function clampInteger(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

function buildStats(state) {
  const daily = getDaily(state.stats);
  const totalAi = state.stats.aiSuccess + state.stats.aiFailure;
  return {
    totalVisits: state.stats.totalVisits,
    totalGenerations: state.stats.totalGenerations,
    localSuccess: state.stats.localSuccess,
    aiRequests: state.stats.aiRequests,
    aiSuccess: state.stats.aiSuccess,
    aiFailure: state.stats.aiFailure,
    successRate: totalAi ? Math.round((state.stats.aiSuccess / totalAi) * 100) : 0,
    today: daily,
    recent: state.stats.recent,
  };
}

async function parseWithAi(res, body) {
  const problemText = String(body.text || "").trim();
  if (!problemText) return json(res, 400, { ok: false, error: "题目不能为空" });

  const state = readState();
  const daily = getDaily(state.stats);
  state.stats.totalGenerations += 1;
  daily.generations += 1;

  if (!state.config.aiEnabled) {
    recordRecent(state.stats, { source: "ai", status: "failure", text: problemText, error: "AI 解析未启用" });
    writeState(state);
    return json(res, 400, { ok: false, error: "管理员暂未启用 AI 解析" });
  }

  if (!state.config.apiKey) {
    recordRecent(state.stats, { source: "ai", status: "failure", text: problemText, error: "未配置 DeepSeek API Key" });
    writeState(state);
    return json(res, 400, { ok: false, error: "管理员还没有配置 DeepSeek API Key" });
  }

  if (state.config.dailyLimit && daily.aiRequests >= state.config.dailyLimit) {
    recordRecent(state.stats, { source: "ai", status: "failure", text: problemText, error: "今日 AI 调用次数已达上限" });
    writeState(state);
    return json(res, 429, { ok: false, error: "今日 AI 调用次数已达上限" });
  }

  const start = Date.now();
  state.stats.aiRequests += 1;
  daily.aiRequests += 1;
  writeState(state);

  try {
    const prompt = state.config.promptTemplate.replaceAll("{{problem}}", problemText);
    const response = await fetch(state.config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.config.apiKey}`,
      },
      body: JSON.stringify({
        model: state.config.model,
        messages: [
          { role: "system", content: "你只输出 JSON，不要解释。" },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data.error?.message || `DeepSeek 请求失败：${response.status}`;
      throw new Error(message);
    }

    const content = data.choices?.[0]?.message?.content || "{}";
    const model = normalizeAiModel(JSON.parse(stripJsonFence(content)));
    const next = readState();
    const nextDaily = getDaily(next.stats);
    next.stats.aiSuccess += 1;
    nextDaily.aiSuccess += 1;
    recordRecent(next.stats, {
      source: "ai",
      status: "success",
      text: problemText,
      modelTitle: model.title,
      latencyMs: Date.now() - start,
      tokens: data.usage?.total_tokens || 0,
    });
    writeState(next);
    return json(res, 200, { ok: true, model, usage: data.usage || null });
  } catch (error) {
    const next = readState();
    const nextDaily = getDaily(next.stats);
    next.stats.aiFailure += 1;
    nextDaily.aiFailure += 1;
    recordRecent(next.stats, {
      source: "ai",
      status: "failure",
      text: problemText,
      error: error.message || "AI 解析失败",
      latencyMs: Date.now() - start,
    });
    writeState(next);
    return json(res, 502, { ok: false, error: error.message || "AI 解析失败" });
  }
}

async function suggestTips(res, body) {
  const problemText = String(body.text || "").trim().slice(0, 1200);
  const fallbackTips = buildLocalTips(problemText);
  const state = readState();
  const daily = getDaily(state.stats);

  if (!state.config.aiEnabled || !state.config.apiKey || (state.config.dailyLimit && daily.aiRequests >= state.config.dailyLimit)) {
    return json(res, 200, {
      ok: true,
      source: "local",
      tips: fallbackTips,
    });
  }

  const start = Date.now();
  state.stats.aiRequests += 1;
  daily.aiRequests += 1;
  writeState(state);

  try {
    const response = await fetch(state.config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.config.apiKey}`,
      },
      body: JSON.stringify({
        model: state.config.model,
        messages: [
          { role: "system", content: "你只输出 JSON，不要解释。" },
          { role: "user", content: buildTipsPrompt(problemText) },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data.error?.message || `DeepSeek 请求失败：${response.status}`;
      throw new Error(message);
    }

    const content = data.choices?.[0]?.message?.content || "{}";
    const tips = normalizeTips(JSON.parse(stripJsonFence(content)));
    const next = readState();
    const nextDaily = getDaily(next.stats);
    next.stats.aiSuccess += 1;
    nextDaily.aiSuccess += 1;
    recordRecent(next.stats, {
      source: "tips",
      status: "success",
      text: problemText || "空题目",
      modelTitle: "输入 Tips",
      latencyMs: Date.now() - start,
      tokens: data.usage?.total_tokens || 0,
    });
    writeState(next);

    return json(res, 200, {
      ok: true,
      source: "ai",
      tips,
    });
  } catch (error) {
    const next = readState();
    const nextDaily = getDaily(next.stats);
    next.stats.aiFailure += 1;
    nextDaily.aiFailure += 1;
    recordRecent(next.stats, {
      source: "tips",
      status: "failure",
      text: problemText || "空题目",
      error: error.message || "Tips 生成失败",
      latencyMs: Date.now() - start,
    });
    writeState(next);

    return json(res, 200, {
      ok: true,
      source: "local",
      tips: fallbackTips,
      warning: error.message || "Tips 生成失败",
    });
  }
}

function buildTipsPrompt(problemText) {
  return `你是一个中学几何三维建模输入助手。
请根据用户当前输入，给出 3 到 5 条可以直接点击使用的题目表达建议。
目标是让题目更容易被三维建模器稳定识别：必须优先补齐图形类型、点名、长度、垂直/平行/中点/中心关系、需要连接的线段。
不要解题，不要讲步骤。
只输出 JSON：
{
  "tips": [
    {
      "title": "短标题",
      "meta": "这条建议补齐了什么",
      "text": "可直接用于生成三维图形的完整中文题目"
    }
  ]
}
当前输入：${problemText || "用户还没有输入题目"}`;
}

function normalizeTips(input) {
  const rawTips = Array.isArray(input) ? input : input.tips;
  const tips = (rawTips || [])
    .map((item) => ({
      title: String(item.title || "输入建议").trim().slice(0, 36),
      meta: String(item.meta || "可直接使用").trim().slice(0, 60),
      text: String(item.text || "").trim().slice(0, 500),
    }))
    .filter((item) => item.text);

  if (!tips.length) throw new Error("AI 没有返回可用 Tips");
  return dedupeTips(tips).slice(0, 5);
}

function buildLocalTips(problemText) {
  const clean = String(problemText || "").trim();
  const tips = [];

  if (clean) {
    tips.push({
      title: "整理当前题目",
      meta: "补齐图形、长度、关系、连线",
      text: clean.endsWith("。") || clean.endsWith(".") ? clean : `${clean}。`,
    });
  }

  [
    {
      title: "正方体中点连线",
      meta: "图形 + 边长 + 中点 + 连接线",
      text: "正方体ABCD-A1B1C1D1，边长为2，E是AB的中点，连接EC1。",
    },
    {
      title: "长方体比例尺寸",
      meta: "三向长度 + 特殊点 + 连线",
      text: "长方体ABCD-A1B1C1D1，AB=3，BC=2，AA1=2，M是CC1的中点，连接AM。",
    },
    {
      title: "三棱锥垂直关系",
      meta: "线面垂直 + 底面直角",
      text: "三棱锥P-ABC，PA垂直于平面ABC，AB垂直于BC，PA=AB=BC=1，连接PB、PC。",
    },
    {
      title: "四棱锥底面中心",
      meta: "底面 + 中心 + 高",
      text: "四棱锥P-ABCD，底面ABCD是正方形，AB=2，O是AC和BD的交点，PO垂直于平面ABCD，PO=2，连接PA、PB、PC、PD。",
    },
  ].forEach((item) => tips.push(item));

  return dedupeTips(tips).slice(0, 5);
}

function dedupeTips(tips) {
  const seen = new Set();
  return tips.filter((tip) => {
    const key = tip.text;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function stripJsonFence(content) {
  return String(content)
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function normalizeAiModel(input) {
  const points = {};
  Object.entries(input.points || {}).forEach(([key, value]) => {
    const label = String(value.label || key).trim();
    const position = value.position || {};
    points[label] = {
      id: `point:${label}`,
      label,
      role: String(value.role || "点"),
      position: {
        x: Number(position.x || 0),
        y: Number(position.y || 0),
        z: Number(position.z || 0),
      },
    };
  });

  const segments = (input.segments || [])
    .filter((item) => points[item.from] && points[item.to] && item.from !== item.to)
    .map((item) => {
      const from = String(item.from);
      const to = String(item.to);
      const key = [from, to].sort((a, b) => a.localeCompare(b, "en")).join("-");
      return {
        id: `line:${key}`,
        key,
        from,
        to,
        label: `${from}${to}`,
        kind: ["edge", "connection", "aux"].includes(item.kind) ? item.kind : "edge",
        note: String(item.note || "线段"),
      };
    });

  const faces = (input.faces || [])
    .filter((item) => Array.isArray(item.vertices) && item.vertices.every((vertex) => points[vertex]))
    .map((item) => ({
      id: `face:${item.label || item.vertices.join("")}`,
      label: String(item.label || `平面${item.vertices.join("")}`),
      vertices: item.vertices.map(String),
    }));

  if (!Object.keys(points).length) throw new Error("AI 没有返回可渲染的点");

  return {
    type: String(input.type || "ai"),
    title: String(input.title || "AI 解析模型"),
    description: String(input.description || "由 DeepSeek 解析生成。"),
    points,
    segments,
    faces,
    relations: Array.isArray(input.relations) ? input.relations.map(String).slice(0, 20) : [],
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`);
  if (url.pathname.startsWith("/api/")) {
    return handleApi(req, res, url.pathname);
  }
  return routeStatic(req, res, url.pathname);
});

ensureState();
server.listen(PORT, HOST, () => {
  console.log(`几何空间已启动：http://${HOST}:${PORT}/`);
  console.log("管理员账号：admin / 123456");
});
