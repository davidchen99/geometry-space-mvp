const defaultPrompt = `你是一个严谨的初高中几何题结构化解析器。
请把题目转成一个可直接渲染的 JSON，必须只输出 JSON，不要 Markdown。
JSON 格式包含 type、title、description、points、segments、faces、relations、equations。
kind 只能是 edge、connection、aux。
题目：{{problem}}`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);
    try {
      await ensureDefaults(env);
      return await handleApi(request, env, url.pathname);
    } catch (error) {
      return json({ ok: false, error: error.message || "服务器错误" }, 500);
    }
  },
};

async function handleApi(request, env, pathname) {
  if (request.method === "GET" && pathname === "/api/health") {
    const config = await getConfig(env);
    return json({ ok: true, config: { aiEnabled: config.aiEnabled, apiKeySet: Boolean(config.apiKey) } });
  }

  if (request.method === "POST" && pathname === "/api/auth/register") return registerUser(request, env);
  if (request.method === "POST" && pathname === "/api/auth/login") return loginUser(request, env);
  if (request.method === "GET" && pathname === "/api/auth/me") return currentUser(request, env);
  if (request.method === "POST" && pathname === "/api/visit") return json({ ok: true });
  if (request.method === "POST" && pathname === "/api/usage") return recordUsage(request, env);
  if (request.method === "POST" && pathname === "/api/parse") return parseWithAi(request, env);
  if (request.method === "POST" && pathname === "/api/tips") return tips(request, env);
  if (request.method === "POST" && pathname === "/api/coach") return coach(request, env);

  if (pathname === "/api/admin/login" && request.method === "POST") return adminLogin(request, env);
  if (pathname.startsWith("/api/admin/")) {
    const admin = await requireAdmin(request, env);
    if (!admin) return json({ ok: false, error: "请先登录管理员账号" }, 401);
  }
  if (pathname === "/api/admin/config" && request.method === "GET") return json({ ok: true, config: publicConfig(await getConfig(env)) });
  if (pathname === "/api/admin/config" && request.method === "PUT") return saveConfig(request, env);
  if (pathname === "/api/admin/stats" && request.method === "GET") return adminStats(env);
  if (pathname === "/api/admin/invites" && request.method === "GET") return listInvites(env);
  if (pathname === "/api/admin/invites" && request.method === "POST") return createInvite(request, env);
  if (pathname === "/api/admin/users" && request.method === "GET") return listUsers(env);
  if (pathname === "/api/admin/password" && request.method === "PUT") return changeAdminPassword(request, env);
  if (pathname === "/api/admin/logout" && request.method === "POST") return json({ ok: true });

  return json({ ok: false, error: "接口不存在" }, 404);
}

async function registerUser(request, env) {
  const body = await readBody(request);
  const phone = normalizePhone(body.phone);
  if (!phone) return json({ ok: false, error: "请输入手机号" }, 400);
  let user = await env.DB.prepare("SELECT * FROM users WHERE phone = ?").bind(phone).first();
  if (!user) {
    const inviteCode = String(body.inviteCode || "").trim().toUpperCase();
    const invite = inviteCode ? await env.DB.prepare("SELECT * FROM invites WHERE code = ?").bind(inviteCode).first() : null;
    if (inviteCode && !invite) return json({ ok: false, error: "邀请码不存在" }, 400);
    if (invite && invite.max_uses && invite.used_count >= invite.max_uses) return json({ ok: false, error: "邀请码已用完" }, 400);
    user = {
      id: crypto.randomUUID(),
      phone,
      role: "student",
      invite_code: inviteCode,
      plan: invite?.plan || "trial",
      daily_ai_limit: invite?.daily_ai_limit || 20,
      monthly_token_limit: invite?.monthly_token_limit || 100000,
      created_at: new Date().toISOString(),
    };
    await env.DB.prepare(
      "INSERT INTO users (id, phone, role, invite_code, plan, daily_ai_limit, monthly_token_limit, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(user.id, user.phone, user.role, user.invite_code, user.plan, user.daily_ai_limit, user.monthly_token_limit, user.created_at)
      .run();
    if (invite) await env.DB.prepare("UPDATE invites SET used_count = used_count + 1 WHERE code = ?").bind(inviteCode).run();
  }
  const token = await createSession(env, user.id, user.role || "student");
  return json({ ok: true, token, user: publicUser(user) });
}

async function loginUser(request, env) {
  const body = await readBody(request);
  const phone = normalizePhone(body.phone);
  const user = await env.DB.prepare("SELECT * FROM users WHERE phone = ?").bind(phone).first();
  if (!user) return json({ ok: false, error: "手机号还未登记，请先登记" }, 404);
  const token = await createSession(env, user.id, user.role || "student");
  return json({ ok: true, token, user: publicUser(user) });
}

async function currentUser(request, env) {
  const session = await getSession(request, env);
  if (!session) return json({ ok: true, user: null });
  const user = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(session.user_id).first();
  return json({ ok: true, user: publicUser(user) });
}

async function adminLogin(request, env) {
  const body = await readBody(request);
  const password = String(body.password || "");
  const adminPassword = (await getSetting(env, "adminPassword")) || env.ADMIN_PASSWORD || "123456";
  if (body.username !== "admin" || password !== adminPassword) return json({ ok: false, error: "账号或密码不正确" }, 401);
  const admin = await env.DB.prepare("SELECT * FROM users WHERE role = 'admin' LIMIT 1").first();
  const token = await createSession(env, admin.id, "admin");
  return json({ ok: true, token, config: publicConfig(await getConfig(env)), stats: await buildStats(env) });
}

async function recordUsage(request, env) {
  const body = await readBody(request);
  const session = await getSession(request, env);
  await writeUsage(env, session?.user_id || null, body.source || "local", "generate", Boolean(body.success), body.text || "", body.modelTitle || "");
  return json({ ok: true });
}

async function parseWithAi(request, env) {
  const body = await readBody(request);
  const text = String(body.text || "").trim();
  if (!text) return json({ ok: false, error: "题目不能为空" }, 400);
  const config = await getConfig(env);
  if (!config.aiEnabled || !config.apiKey) return json({ ok: false, error: "管理员还没有配置 AI Key" }, 400);
  const data = await callDeepSeek(config, config.promptTemplate.replaceAll("{{problem}}", text), 0.1);
  const model = normalizeAiModel(JSON.parse(stripJsonFence(data.choices?.[0]?.message?.content || "{}")));
  const session = await getSession(request, env);
  await writeUsage(env, session?.user_id || null, "ai", "parse", true, text, model.title, data.usage);
  return json({ ok: true, model, usage: data.usage || null });
}

async function tips(request, env) {
  const body = await readBody(request);
  const text = String(body.text || "").trim();
  const fallback = buildLocalTips(text);
  const config = await getConfig(env);
  if (!config.aiEnabled || !config.apiKey) return json({ ok: true, source: "local", tips: fallback });
  try {
    const data = await callDeepSeek(config, buildTipsPrompt(text), 0.2);
    const content = JSON.parse(stripJsonFence(data.choices?.[0]?.message?.content || "{}"));
    return json({ ok: true, source: "ai", tips: normalizeTips(content) });
  } catch (error) {
    return json({ ok: true, source: "local", tips: fallback, warning: error.message });
  }
}

async function coach(request, env) {
  const body = await readBody(request);
  const mode = body.mode === "ask" ? "ask" : "steps";
  const fallback = buildLocalCoach(mode, body.text || "", body.question || "", body.model || null);
  const config = await getConfig(env);
  if (!config.aiEnabled || !config.apiKey) return json({ ok: true, source: "local", ...fallback });
  try {
    const data = await callDeepSeek(config, buildCoachPrompt(mode, body.text || "", body.question || "", body.model || null), 0.2);
    return json({ ok: true, source: "ai", ...normalizeCoach(JSON.parse(stripJsonFence(data.choices?.[0]?.message?.content || "{}")), fallback) });
  } catch (error) {
    return json({ ok: true, source: "local", ...fallback, warning: error.message });
  }
}

async function saveConfig(request, env) {
  const body = await readBody(request);
  const config = await getConfig(env);
  const next = {
    endpoint: String(body.endpoint || config.endpoint).trim(),
    model: String(body.model || config.model).trim(),
    aiEnabled: Boolean(body.aiEnabled),
    dailyLimit: Number(body.dailyLimit || config.dailyLimit || 200),
    promptTemplate: String(body.promptTemplate || config.promptTemplate || defaultPrompt),
  };
  if (body.apiKey) next.apiKey = String(body.apiKey).trim();
  else if (body.clearApiKey) next.apiKey = "";
  else next.apiKey = config.apiKey || "";
  await setSetting(env, "config", JSON.stringify(next));
  return json({ ok: true, config: publicConfig(next) });
}

async function changeAdminPassword(request, env) {
  const body = await readBody(request);
  const current = (await getSetting(env, "adminPassword")) || env.ADMIN_PASSWORD || "123456";
  if (String(body.oldPassword || "") !== current) return json({ ok: false, error: "旧密码不正确" }, 400);
  const next = String(body.newPassword || "");
  if (next.length < 6) return json({ ok: false, error: "新密码至少 6 位" }, 400);
  await setSetting(env, "adminPassword", next);
  return json({ ok: true });
}

async function adminStats(env) {
  return json({ ok: true, stats: await buildStats(env) });
}

async function listInvites(env) {
  const { results } = await env.DB.prepare("SELECT * FROM invites ORDER BY created_at DESC LIMIT 50").all();
  return json({ ok: true, invites: results.map(fromInviteRow) });
}

async function createInvite(request, env) {
  const body = await readBody(request);
  const code = String(body.code || "").trim().toUpperCase() || `GEO-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
  const invite = {
    id: crypto.randomUUID(),
    code,
    maxUses: clamp(body.maxUses, 1, 100000, 30),
    usedCount: 0,
    plan: "trial",
    dailyAiLimit: clamp(body.dailyAiLimit, 1, 100000, 20),
    monthlyTokenLimit: clamp(body.monthlyTokenLimit, 1000, 100000000, 100000),
    createdAt: new Date().toISOString(),
  };
  await env.DB.prepare(
    "INSERT INTO invites (id, code, max_uses, used_count, plan, daily_ai_limit, monthly_token_limit, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  )
    .bind(invite.id, invite.code, invite.maxUses, 0, invite.plan, invite.dailyAiLimit, invite.monthlyTokenLimit, invite.createdAt)
    .run();
  return json({ ok: true, invite });
}

async function listUsers(env) {
  const { results } = await env.DB.prepare("SELECT * FROM users WHERE role != 'admin' ORDER BY created_at DESC LIMIT 200").all();
  const users = [];
  const date = today();
  for (const row of results) {
    const usage = await env.DB.prepare("SELECT * FROM daily_usage WHERE user_id = ? AND date = ?").bind(row.id, date).first();
    users.push({ ...publicUser(row), inviteCode: row.invite_code || "", usage: { generations: usage?.generations || 0, aiRequests: usage?.ai_calls || 0, tokens: usage?.tokens || 0 } });
  }
  return json({ ok: true, users });
}

async function buildStats(env) {
  const total = await env.DB.prepare("SELECT COUNT(*) AS count FROM usage_events").first();
  const ai = await env.DB.prepare("SELECT COUNT(*) AS count FROM usage_events WHERE source = 'ai'").first();
  const users = await env.DB.prepare("SELECT COUNT(*) AS count FROM users WHERE role != 'admin'").first();
  const { results } = await env.DB.prepare("SELECT * FROM usage_events ORDER BY created_at DESC LIMIT 20").all();
  return {
    totalVisits: 0,
    totalGenerations: total?.count || 0,
    aiRequests: ai?.count || 0,
    successRate: 100,
    users: users?.count || 0,
    recent: results.map((item) => ({ source: item.source, status: item.success ? "success" : "failure", text: item.text, modelTitle: item.model_title })),
  };
}

async function writeUsage(env, userId, source, feature, success, text, modelTitle, usage = {}) {
  await env.DB.prepare(
    "INSERT INTO usage_events (id, user_id, feature, source, success, text, model_title, tokens_in, tokens_out, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  )
    .bind(crypto.randomUUID(), userId, feature, source, success ? 1 : 0, String(text || "").slice(0, 500), modelTitle || "", usage?.prompt_tokens || 0, usage?.completion_tokens || 0, new Date().toISOString())
    .run();
  if (userId) {
    await env.DB.prepare(
      "INSERT INTO daily_usage (user_id, date, generations, ai_calls, tokens) VALUES (?, ?, 1, ?, ?) ON CONFLICT(user_id, date) DO UPDATE SET generations = generations + 1, ai_calls = ai_calls + ?, tokens = tokens + ?",
    )
      .bind(userId, today(), source === "ai" ? 1 : 0, usage?.total_tokens || 0, source === "ai" ? 1 : 0, usage?.total_tokens || 0)
      .run();
  }
}

async function ensureDefaults(env) {
  const admin = await env.DB.prepare("SELECT * FROM users WHERE role = 'admin' LIMIT 1").first();
  if (!admin) {
    await env.DB.prepare("INSERT INTO users (id, phone, role, plan, daily_ai_limit, monthly_token_limit, created_at) VALUES (?, ?, 'admin', 'admin', 999999, 999999999, ?)")
      .bind(crypto.randomUUID(), "admin", new Date().toISOString())
      .run();
  }
  if (!(await getSetting(env, "config"))) {
    await setSetting(env, "config", JSON.stringify({ endpoint: "https://api.deepseek.com/chat/completions", model: "deepseek-v4-flash", promptTemplate: defaultPrompt, aiEnabled: true, dailyLimit: 200, apiKey: env.DEEPSEEK_API_KEY || "" }));
  }
}

async function getConfig(env) {
  const raw = await getSetting(env, "config");
  const config = raw ? JSON.parse(raw) : {};
  return { endpoint: "https://api.deepseek.com/chat/completions", model: "deepseek-v4-flash", promptTemplate: defaultPrompt, aiEnabled: true, dailyLimit: 200, apiKey: env.DEEPSEEK_API_KEY || "", ...config };
}

function publicConfig(config) {
  return { provider: "deepseek", endpoint: config.endpoint, model: config.model, promptTemplate: config.promptTemplate, aiEnabled: Boolean(config.aiEnabled), dailyLimit: Number(config.dailyLimit || 0), apiKeySet: Boolean(config.apiKey), apiKeyMask: config.apiKey ? "已配置" : "" };
}

async function getSetting(env, key) {
  const row = await env.DB.prepare("SELECT value FROM settings WHERE key = ?").bind(key).first();
  return row?.value || "";
}

async function setSetting(env, key, value) {
  await env.DB.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(key, value).run();
}

async function createSession(env, userId, role) {
  const token = crypto.randomUUID() + crypto.randomUUID().replaceAll("-", "");
  await env.DB.prepare("INSERT INTO sessions (token, user_id, role, expires_at, created_at) VALUES (?, ?, ?, ?, ?)")
    .bind(token, userId, role, Date.now() + 1000 * 60 * 60 * 24 * 30, new Date().toISOString())
    .run();
  return token;
}

async function getSession(request, env) {
  const token = request.headers.get("x-user-token") || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (!token) return null;
  const session = await env.DB.prepare("SELECT * FROM sessions WHERE token = ?").bind(token).first();
  if (!session || session.expires_at < Date.now()) return null;
  return session;
}

async function requireAdmin(request, env) {
  const session = await getSession(request, env);
  return session?.role === "admin" ? session : null;
}

async function callDeepSeek(config, prompt, temperature) {
  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
    body: JSON.stringify({ model: config.model, messages: [{ role: "system", content: "你只输出 JSON，不要解释。" }, { role: "user", content: prompt }], temperature, response_format: { type: "json_object" } }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error?.message || `AI 请求失败：${response.status}`);
  return data;
}

function normalizeAiModel(input) {
  const points = {};
  Object.entries(input.points || {}).forEach(([key, value]) => {
    const label = String(value.label || key).trim();
    const position = value.position || {};
    points[label] = { id: `point:${label}`, label, role: String(value.role || "点"), position: { x: Number(position.x || 0), y: Number(position.y || 0), z: Number(position.z || 0) } };
  });
  const segments = (input.segments || []).filter((item) => points[item.from] && points[item.to] && item.from !== item.to).map((item) => {
    const from = String(item.from);
    const to = String(item.to);
    const key = [from, to].sort((a, b) => a.localeCompare(b, "en")).join("-");
    return { id: `line:${key}`, key, from, to, label: `${from}${to}`, kind: ["edge", "connection", "aux"].includes(item.kind) ? item.kind : "edge", note: String(item.note || "线段") };
  });
  const faces = (input.faces || []).filter((item) => Array.isArray(item.vertices) && item.vertices.every((vertex) => points[vertex])).map((item) => ({ id: `face:${item.label || item.vertices.join("")}`, label: String(item.label || `平面${item.vertices.join("")}`), vertices: item.vertices.map(String) }));
  if (!Object.keys(points).length) throw new Error("AI 没有返回可渲染的点");
  return { type: String(input.type || "ai"), title: String(input.title || "AI 解析模型"), description: String(input.description || "由 AI 解析生成。"), points, segments, faces, relations: Array.isArray(input.relations) ? input.relations.map(String).slice(0, 20) : [], equations: Array.isArray(input.equations) ? input.equations.map(String).slice(0, 10) : [] };
}

function buildTipsPrompt(text) {
  return `给出 3 到 5 条几何建模题目输入建议，只输出 JSON：{"tips":[{"title":"短标题","meta":"补齐内容","text":"完整题目"}]}。当前输入：${text || "空"}`;
}

function buildLocalTips(text) {
  return [
    { title: "正方体", meta: "中点 + 连线", text: "正方体ABCD-A1B1C1D1，边长为2，E是AB的中点，连接EC1。" },
    { title: "三角形", meta: "平面图形", text: "三角形ABC中，AB=3，BC=4，AC=5，D是AB的中点，连接CD。" },
    { title: "三棱锥", meta: "线面垂直", text: "三棱锥P-ABC，PA垂直于平面ABC，AB垂直于BC，PA=AB=BC=1，连接PB、PC。" },
  ];
}

function normalizeTips(input) {
  const raw = Array.isArray(input) ? input : input.tips || [];
  return raw.map((item) => ({ title: String(item.title || "输入建议").slice(0, 36), meta: String(item.meta || "可直接使用").slice(0, 60), text: String(item.text || "").slice(0, 500) })).filter((item) => item.text).slice(0, 5);
}

function buildCoachPrompt(mode, text, question, model) {
  if (mode === "ask") return `回答学生几何问题，不超过120字，只输出 JSON：{"answer":"回答"}。题目：${text} 模型：${JSON.stringify(model || {})} 问题：${question}`;
  return `生成 4 到 6 条几何建模/解题步骤，只输出 JSON：{"equations":["方程"],"steps":["步骤"]}。题目：${text} 模型：${JSON.stringify(model || {})}`;
}

function normalizeCoach(input, fallback) {
  return { steps: Array.isArray(input.steps) ? input.steps.map(String).slice(0, 8) : fallback.steps || [], equations: Array.isArray(input.equations) ? input.equations.map(String).slice(0, 6) : fallback.equations || [], answer: String(input.answer || fallback.answer || "") };
}

function buildLocalCoach(mode, text, question, model) {
  if (mode === "ask") return { answer: model ? "可以点击模型中的点、线、面查看信息；方程在右侧解析区和步骤面板里。" : "先生成模型，再提问。", steps: [], equations: model?.equations || [] };
  return { steps: model ? [`识别题型：${model.title}`, "看点线面关系", "切换 2D/3D 检查结构", "点击元素查看长度、面积或体积"] : ["先输入题目并生成模型"], equations: model?.equations || [], answer: "" };
}

function fromInviteRow(row) {
  return { id: row.id, code: row.code, maxUses: row.max_uses, usedCount: row.used_count, plan: row.plan, dailyAiLimit: row.daily_ai_limit, monthlyTokenLimit: row.monthly_token_limit, createdAt: row.created_at };
}

function publicUser(row) {
  if (!row) return null;
  return { id: row.id, phone: row.phone, role: row.role, plan: row.plan, dailyAiLimit: row.daily_ai_limit, monthlyTokenLimit: row.monthly_token_limit, createdAt: row.created_at };
}

function normalizePhone(value) {
  const phone = String(value || "").replace(/[^\d+]/g, "");
  return phone.length >= 6 ? phone.slice(0, 24) : "";
}

function stripJsonFence(content) {
  return String(content).replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
}

function clamp(value, min, max, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, Math.round(number))) : fallback;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
}

async function readBody(request) {
  return request.json().catch(() => ({}));
}
