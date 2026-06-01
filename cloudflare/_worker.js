const defaultPrompt = `你是一个严谨的初高中几何题结构化解析器。
请把题目转成一个可直接渲染的 JSON，必须只输出 JSON，不要 Markdown。
JSON 格式包含 type、title、description、points、segments、faces、relations、equations。
kind 只能是 edge、connection、aux。
题目：{{problem}}`;

const DEFAULT_ADMIN_PASSWORD = "123456";

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
    if (pathname !== "/api/admin/password" && pathname !== "/api/admin/logout" && !(await isAdminPasswordChanged(env))) {
      return json({ ok: false, error: "请先修改默认管理员密码" }, 403);
    }
  }
  if (pathname === "/api/admin/config" && request.method === "GET") return json({ ok: true, config: publicConfig(await getConfig(env)) });
  if (pathname === "/api/admin/config" && request.method === "PUT") return saveConfig(request, env);
  if (pathname === "/api/admin/stats" && request.method === "GET") return adminStats(env);
  if (pathname === "/api/admin/invites" && request.method === "GET") return listInvites(env);
  if (pathname === "/api/admin/invites" && request.method === "POST") return createInvite(request, env);
  const inviteRoute = pathname.match(/^\/api\/admin\/invites\/([^/]+)$/);
  if (inviteRoute && request.method === "PUT") return updateInvite(request, env, decodeURIComponent(inviteRoute[1]));
  if (inviteRoute && request.method === "DELETE") return deleteInvite(env, decodeURIComponent(inviteRoute[1]));
  if (pathname === "/api/admin/users" && request.method === "GET") return listUsers(env);
  if (pathname === "/api/admin/password" && request.method === "PUT") return changeAdminPassword(request, env);
  if (pathname === "/api/admin/logout" && request.method === "POST") return json({ ok: true });

  return json({ ok: false, error: "接口不存在" }, 404);
}

async function registerUser(request, env) {
  const body = await readBody(request);
  const phone = normalizePhone(body.phone);
  const username = normalizeUsername(body.username);
  if (!phone) return json({ ok: false, error: "请输入手机号" }, 400);
  if (!username) return json({ ok: false, error: "请输入用户名" }, 400);
  let user = await env.DB.prepare("SELECT * FROM users WHERE phone = ?").bind(phone).first();
  if (!user) {
    const config = await getConfig(env);
    const inviteCode = String(body.inviteCode || "").trim().toUpperCase();
    const invite = inviteCode ? await env.DB.prepare("SELECT * FROM invites WHERE code = ?").bind(inviteCode).first() : null;
    if (inviteCode && !invite) return json({ ok: false, error: "邀请码不存在" }, 400);
    if (invite && invite.max_uses && invite.used_count >= invite.max_uses) return json({ ok: false, error: "邀请码已用完" }, 400);
    const defaultDailyLimit = clamp(config.defaultStudentDailyLimit, 0, 100000, 20);
    user = {
      id: crypto.randomUUID(),
      username,
      phone,
      role: "student",
      invite_code: inviteCode,
      plan: invite?.plan || "trial",
      daily_ai_limit: invite ? clamp(invite.daily_ai_limit, 0, 100000, defaultDailyLimit) : defaultDailyLimit,
      monthly_token_limit: invite?.monthly_token_limit || 100000,
      created_at: new Date().toISOString(),
    };
    await env.DB.prepare(
      "INSERT INTO users (id, username, phone, role, invite_code, plan, daily_ai_limit, monthly_token_limit, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(user.id, user.username, user.phone, user.role, user.invite_code, user.plan, user.daily_ai_limit, user.monthly_token_limit, user.created_at)
      .run();
    if (invite) await env.DB.prepare("UPDATE invites SET used_count = used_count + 1 WHERE code = ?").bind(inviteCode).run();
  } else if (username && user.username !== username) {
    await env.DB.prepare("UPDATE users SET username = ? WHERE id = ?").bind(username, user.id).run();
    user.username = username;
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
  const adminPassword = await getAdminPassword(env);
  if (body.username !== "admin" || password !== adminPassword) return json({ ok: false, error: "账号或密码不正确" }, 401);
  const admin = await env.DB.prepare("SELECT * FROM users WHERE role = 'admin' LIMIT 1").first();
  const token = await createSession(env, admin.id, "admin");
  return json({ ok: true, token, passwordChangeRequired: !(await isAdminPasswordChanged(env)), config: publicConfig(await getConfig(env)), stats: await buildStats(env) });
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
  const access = await requireAiAccess(request, env);
  if (!access.ok) return json({ ok: false, error: access.error }, access.status);
  try {
    const data = await callDeepSeek(access.config, access.config.promptTemplate.replaceAll("{{problem}}", text), 0.1);
    const model = normalizeAiModel(JSON.parse(stripJsonFence(data.choices?.[0]?.message?.content || "{}")));
    await writeUsage(env, access.user.id, "ai", "parse", true, text, model.title, data.usage);
    return json({ ok: true, model, usage: data.usage || null });
  } catch (error) {
    await writeUsage(env, access.user.id, "ai", "parse", false, text, error.message || "AI 解析失败");
    return json({ ok: false, error: error.message || "AI 解析失败" }, 502);
  }
}

async function tips(request, env) {
  const body = await readBody(request);
  const text = String(body.text || "").trim();
  const fallback = buildLocalTips(text);
  const access = await requireAiAccess(request, env);
  if (!access.ok) return json({ ok: true, source: "local", tips: fallback, warning: access.error });
  try {
    const data = await callDeepSeek(access.config, buildTipsPrompt(text), 0.2);
    const content = JSON.parse(stripJsonFence(data.choices?.[0]?.message?.content || "{}"));
    await writeUsage(env, access.user.id, "ai", "tips", true, text || "空题目", "输入 Tips", data.usage);
    return json({ ok: true, source: "ai", tips: normalizeTips(content) });
  } catch (error) {
    await writeUsage(env, access.user.id, "ai", "tips", false, text || "空题目", error.message || "Tips 生成失败");
    return json({ ok: true, source: "local", tips: fallback, warning: error.message });
  }
}

async function coach(request, env) {
  const body = await readBody(request);
  const mode = body.mode === "ask" ? "ask" : "steps";
  const fallback = buildLocalCoach(mode, body.text || "", body.question || "", body.model || null);
  const access = await requireAiAccess(request, env);
  if (!access.ok) return json({ ok: true, source: "local", ...fallback, warning: access.error });
  try {
    const data = await callDeepSeek(access.config, buildCoachPrompt(mode, body.text || "", body.question || "", body.model || null), 0.2);
    await writeUsage(env, access.user.id, "ai", `coach-${mode}`, true, body.text || body.question || "空请求", mode === "ask" ? "问答" : "步骤", data.usage);
    return json({ ok: true, source: "ai", ...normalizeCoach(JSON.parse(stripJsonFence(data.choices?.[0]?.message?.content || "{}")), fallback) });
  } catch (error) {
    await writeUsage(env, access.user.id, "ai", `coach-${mode}`, false, body.text || body.question || "空请求", error.message || "辅导失败");
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
    defaultStudentDailyLimit: clamp(body.defaultStudentDailyLimit, 0, 100000, config.defaultStudentDailyLimit || 20),
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
  const current = await getAdminPassword(env);
  if (String(body.oldPassword || "") !== current) return json({ ok: false, error: "旧密码不正确" }, 400);
  const next = String(body.newPassword || "");
  if (next.length < 6) return json({ ok: false, error: "新密码至少 6 位" }, 400);
  if (next === DEFAULT_ADMIN_PASSWORD) return json({ ok: false, error: "新密码不能继续使用默认密码" }, 400);
  await setSetting(env, "adminPassword", next);
  await setSetting(env, "adminPasswordChanged", "true");
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
  const existing = await env.DB.prepare("SELECT id FROM invites WHERE code = ?").bind(code).first();
  if (existing) return json({ ok: false, error: "邀请码已存在" }, 400);
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

async function updateInvite(request, env, id) {
  const body = await readBody(request);
  const row = await env.DB.prepare("SELECT * FROM invites WHERE id = ?").bind(id).first();
  if (!row) return json({ ok: false, error: "邀请码不存在" }, 404);
  const code = String(body.code || row.code || "").trim().toUpperCase();
  if (!code) return json({ ok: false, error: "邀请码不能为空" }, 400);
  const duplicated = await env.DB.prepare("SELECT id FROM invites WHERE code = ? AND id != ?").bind(code, id).first();
  if (duplicated) return json({ ok: false, error: "邀请码已存在" }, 400);
  const minUses = Math.max(1, Number(row.used_count || 0));
  const invite = {
    id,
    code,
    maxUses: clamp(body.maxUses, minUses, 100000, Math.max(row.max_uses || 30, minUses)),
    usedCount: row.used_count || 0,
    plan: String(body.plan || row.plan || "trial"),
    dailyAiLimit: clamp(body.dailyAiLimit, 1, 100000, row.daily_ai_limit || 20),
    monthlyTokenLimit: clamp(body.monthlyTokenLimit, 1000, 100000000, row.monthly_token_limit || 100000),
    createdAt: row.created_at,
  };
  await env.DB.prepare("UPDATE invites SET code = ?, max_uses = ?, plan = ?, daily_ai_limit = ?, monthly_token_limit = ? WHERE id = ?")
    .bind(invite.code, invite.maxUses, invite.plan, invite.dailyAiLimit, invite.monthlyTokenLimit, id)
    .run();
  return json({ ok: true, invite });
}

async function deleteInvite(env, id) {
  const row = await env.DB.prepare("SELECT code FROM invites WHERE id = ?").bind(id).first();
  if (!row) return json({ ok: false, error: "邀请码不存在" }, 404);
  await env.DB.prepare("DELETE FROM invites WHERE id = ?").bind(id).run();
  return json({ ok: true });
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
  const total = await env.DB.prepare("SELECT COUNT(*) AS count FROM usage_events WHERE feature IN ('generate', 'parse')").first();
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
  const generationDelta = feature === "generate" || feature === "parse" ? 1 : 0;
  const aiDelta = source === "ai" ? 1 : 0;
  const tokenDelta = usage?.total_tokens || 0;
  await env.DB.prepare(
    "INSERT INTO usage_events (id, user_id, feature, source, success, text, model_title, tokens_in, tokens_out, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  )
    .bind(crypto.randomUUID(), userId, feature, source, success ? 1 : 0, String(text || "").slice(0, 500), modelTitle || "", usage?.prompt_tokens || 0, usage?.completion_tokens || 0, new Date().toISOString())
    .run();
  if (userId) {
    await env.DB.prepare(
      "INSERT INTO daily_usage (user_id, date, generations, ai_calls, tokens) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id, date) DO UPDATE SET generations = generations + ?, ai_calls = ai_calls + ?, tokens = tokens + ?",
    )
      .bind(userId, today(), generationDelta, aiDelta, tokenDelta, generationDelta, aiDelta, tokenDelta)
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
    await setSetting(env, "config", JSON.stringify({ endpoint: "https://api.deepseek.com/chat/completions", model: "deepseek-v4-flash", promptTemplate: defaultPrompt, aiEnabled: true, dailyLimit: 200, defaultStudentDailyLimit: 20, apiKey: env.DEEPSEEK_API_KEY || "" }));
  }
}

async function getConfig(env) {
  const raw = await getSetting(env, "config");
  const config = raw ? JSON.parse(raw) : {};
  return { endpoint: "https://api.deepseek.com/chat/completions", model: "deepseek-v4-flash", promptTemplate: defaultPrompt, aiEnabled: true, dailyLimit: 200, defaultStudentDailyLimit: 20, apiKey: env.DEEPSEEK_API_KEY || "", ...config };
}

function publicConfig(config) {
  return { provider: "deepseek", endpoint: config.endpoint, model: config.model, promptTemplate: config.promptTemplate, aiEnabled: Boolean(config.aiEnabled), dailyLimit: Number(config.dailyLimit || 0), defaultStudentDailyLimit: Number(config.defaultStudentDailyLimit ?? 20), apiKeySet: Boolean(config.apiKey), apiKeyMask: config.apiKey ? "已配置" : "" };
}

async function getSetting(env, key) {
  const row = await env.DB.prepare("SELECT value FROM settings WHERE key = ?").bind(key).first();
  return row?.value || "";
}

async function setSetting(env, key, value) {
  await env.DB.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(key, value).run();
}

async function getAdminPassword(env) {
  return (await getSetting(env, "adminPassword")) || env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
}

async function isAdminPasswordChanged(env) {
  const flag = await getSetting(env, "adminPasswordChanged");
  if (flag) return flag === "true";
  return (await getAdminPassword(env)) !== DEFAULT_ADMIN_PASSWORD;
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

async function requireAiAccess(request, env) {
  const session = await getSession(request, env);
  if (!session) return { ok: false, status: 401, error: "请先登录后使用 AI 功能" };
  const user = await env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(session.user_id).first();
  if (!user) return { ok: false, status: 401, error: "登录已失效，请重新登录" };
  const config = await getConfig(env);
  if (!config.aiEnabled) return { ok: false, status: 400, error: "管理员暂未启用 AI 解析" };
  if (!config.apiKey) return { ok: false, status: 400, error: "管理员还没有配置 AI Key" };
  const date = today();
  const globalLimit = Number(config.dailyLimit || 0);
  if (globalLimit > 0) {
    const globalUsage = await env.DB.prepare("SELECT COALESCE(SUM(ai_calls), 0) AS count FROM daily_usage WHERE date = ?").bind(date).first();
    if ((globalUsage?.count || 0) >= globalLimit) return { ok: false, status: 429, error: "今日全站 AI 调用次数已达上限" };
  }
  const usage = await env.DB.prepare("SELECT * FROM daily_usage WHERE user_id = ? AND date = ?").bind(user.id, date).first();
  const userLimit = clamp(user.daily_ai_limit, 0, 100000, config.defaultStudentDailyLimit || 20);
  if (userLimit <= 0 || (usage?.ai_calls || 0) >= userLimit) {
    return { ok: false, status: 429, error: `今日个人 AI 调用次数已达上限（${userLimit} 次）` };
  }
  return { ok: true, session, user, config, usage };
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
  return `你是中学几何三维建模输入助手。根据当前输入给出 3 到 5 条整理原文的表达建议。只能改写、归并和规范化原文已经出现的图形类型、点名、长度、垂直/平行/中点/中心关系和连线，不要凭空添加题目没有给出的点、长度、底面形状、高、垂直关系或连线。输出给学生看的题目必须像正常考试题，优先使用 O₁、A₁、√3、×、÷、⊥、∥ 这类常见数学符号，不要输出 \\(...\\)、sqrt(3) 或代码式表达。如果用户只输入“三角锥”“四面体”等几个字，不要补成完整题，在 meta 写清缺少什么，text 只保留整理后的原输入。不要解题，只输出 JSON：{"tips":[{"title":"短标题","meta":"整理内容或缺失项","text":"整理后的原文"}]}。当前输入：${text || "空"}`;
}

function buildLocalTips(text) {
  const clean = String(text || "").trim();
  const normalized = normalizeTipText(clean);
  const templates = [
    { title: "圆台", meta: "根号 + 侧面积体积", text: "已知圆台O₁O，上底面圆心为O₁，半径r=1，下底面圆心为O，半径R=3。圆台的高O₁O=2√3，母线AB=4，其中A为上底面圆周上一点，B为下底面圆周上一点，且O₁A⊥O₁O，OB⊥O₁O，O₁A∥OB。求该圆台的侧面积和体积。" },
    { title: "正方体", meta: "中点 + 连线", text: "正方体ABCD-A1B1C1D1，边长为2，E是AB的中点，连接EC1。" },
    { title: "三角形", meta: "平面图形", text: "三角形ABC中，AB=3，BC=4，AC=5，D是AB的中点，连接CD。" },
    { title: "三棱锥", meta: "线面垂直", text: "三棱锥P-ABC，PA垂直于平面ABC，AB垂直于BC，PA=AB=BC=1，连接PB、PC。" },
    { title: "四棱锥", meta: "底面中心 + 高", text: "四棱锥P-ABCD，底面ABCD是正方形，AB=2，O是AC和BD的交点，PO垂直于平面ABCD，PO=2，连接PA、PB、PC、PD。" },
    { title: "圆柱", meta: "半径 + 高", text: "圆柱，底面圆心O，上底圆心O₁，半径=2，高O₁O=4，连接OO₁。" },
    { title: "圆锥", meta: "底面半径 + 高", text: "圆锥P-O，底面半径=2，高=3，连接PO。" },
    { title: "椭球面", meta: "三半轴", text: "椭球面，a=3，b=2，c=1.5。" },
    { title: "直三棱柱", meta: "底面边长 + 高", text: "直三棱柱ABC-A₁B₁C₁，底面边长=2，高AA₁=3。" },
    { title: "长方体截面圆", meta: "组合图形 + 交线", text: "长方体ABCD-A₁B₁C₁D₁，AB=6，BC=4，AA₁=4。一个圆柱垂直穿过长方体，圆柱轴线经过上下底面中心，半径=1.5，显示圆柱与长方体上下底面的交线。" },
    { title: "显式坐标点", meta: "按坐标准确放置", text: "A(1,2,3)，B(4,2,3)，C(1,5,3)，连接AB、BC、CA。" },
  ];
  const matched = templates.filter((tip) => {
    if (!normalized) return true;
    return (
      normalizeTipText(tip.title).includes(normalized.slice(0, 3)) ||
      normalizeTipText(tip.text).includes(normalized.slice(0, 3)) ||
      (/三角锥|三棱锥|四面体|棱锥/.test(normalized) && /三棱锥|四棱锥/.test(tip.text)) ||
      (/圆柱|圆锥|圆台|球|椭球|柱面|棱柱/.test(normalized) && /圆柱|圆锥|椭球|棱柱|坐标/.test(tip.text))
    );
  });
  const tips = [...(matched.length ? matched : templates)];
  if (clean && normalized.length >= 12) {
    tips.push({ title: "整理当前题目", meta: "补齐图形、长度、关系、连线", text: clean.endsWith("。") || clean.endsWith(".") ? clean : `${clean}。` });
  }
  return tips.slice(0, 5);
}

function normalizeTipText(text) {
  return String(text || "").replace(/\s+/g, "").trim();
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
  return { id: row.id, username: row.username || "", phone: row.phone, role: row.role, plan: row.plan, dailyAiLimit: row.daily_ai_limit, monthlyTokenLimit: row.monthly_token_limit, createdAt: row.created_at };
}

function normalizePhone(value) {
  const phone = String(value || "").replace(/[^\d+]/g, "");
  return phone.length >= 6 ? phone.slice(0, 24) : "";
}

function normalizeUsername(value) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 32);
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
