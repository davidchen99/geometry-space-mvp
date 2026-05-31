import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const samples = [
  {
    title: "正方体",
    meta: "中点 + 连线",
    text: "正方体ABCD-A1B1C1D1，边长为2，E是AB的中点，连接EC1。",
  },
  {
    title: "三棱锥",
    meta: "线面垂直",
    text: "三棱锥P-ABC，PA垂直于平面ABC，AB垂直于BC，PA=AB=BC=1，连接PB、PC。",
  },
  {
    title: "长方体",
    meta: "比例尺寸",
    text: "长方体ABCD-A1B1C1D1，AB=3，BC=2，AA1=2，M是CC1的中点，连接AM。",
  },
  {
    title: "四棱锥",
    meta: "底面中心",
    text: "四棱锥P-ABCD，底面ABCD是正方形，AB=2，O是AC和BD的交点，PO垂直于平面ABCD，PO=2，连接PA、PB、PC、PD。",
  },
  {
    title: "三角形",
    meta: "平面图形",
    text: "三角形ABC中，AB=3，BC=4，AC=5，D是AB的中点，连接CD。",
  },
];

const starterTips = [
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
];

const historyKey = "geometry-space-problem-history";

const helpItems = [
  {
    title: "读题型",
    text: "先看题目是平面题还是空间题。",
    detail: "三角形、圆、轨迹多用 2D；正方体、长方体、棱锥多用 3D。",
  },
  {
    title: "找点线面",
    text: "确认题目给了哪些点、边、面。",
    detail: "点名不够时，系统会提醒补 A、B、C、P、A1 这类标记。",
  },
  {
    title: "看已知条件",
    text: "长度、垂直、平行、中点会影响模型。",
    detail: "缺长度时可先用默认尺寸；想更准确就写 AB=2 或边长为2。",
  },
  {
    title: "生成图形",
    text: "点生成后先看整体结构。",
    detail: "2D 适合看平面关系，3D 适合看空间位置。",
  },
  {
    title: "点元素检查",
    text: "点击点、线、面，看坐标、长度和关系。",
    detail: "需要解释时点“步骤”或“问答”，不要在主界面硬看太多字。",
  },
  {
    title: "不会写题目",
    text: "点 Tips 选择规范表达。",
    detail: "圆、轨迹、球、圆锥这类题优先尝试 2D 或 AI 解析。",
  },
];

const dom = {
  appShell: document.querySelector("#appShell"),
  input: document.querySelector("#problemInput"),
  generateBtn: document.querySelector("#generateBtn"),
  tipsBtn: document.querySelector("#tipsBtn"),
  tipsPanel: document.querySelector("#tipsPanel"),
  tipsList: document.querySelector("#tipsList"),
  tipsState: document.querySelector("#tipsState"),
  problemHints: document.querySelector("#problemHints"),
  clearBtn: document.querySelector("#clearBtn"),
  selectAllBtn: document.querySelector("#selectAllBtn"),
  sampleList: document.querySelector("#sampleList"),
  title: document.querySelector("#modelTitle"),
  summary: document.querySelector("#modelSummary"),
  relationList: document.querySelector("#relationList"),
  equationList: document.querySelector("#equationList"),
  elementList: document.querySelector("#elementList"),
  selectedBox: document.querySelector("#selectedBox"),
  parseBadge: document.querySelector("#parseBadge"),
  statusText: document.querySelector("#statusText"),
  viewModeLabel: document.querySelector("#viewModeLabel"),
  view2dBtn: document.querySelector("#view2dBtn"),
  view3dBtn: document.querySelector("#view3dBtn"),
  viewModeButtons: Array.from(document.querySelectorAll("[data-view-mode]")),
  resetViewBtn: document.querySelector("#resetViewBtn"),
  gridBtn: document.querySelector("#gridBtn"),
  auxBtn: document.querySelector("#auxBtn"),
  measureBtn: document.querySelector("#measureBtn"),
  screenshotBtn: document.querySelector("#screenshotBtn"),
  sceneWrap: document.querySelector("#sceneWrap"),
  canvas: document.querySelector("#sceneCanvas"),
  labelLayer: document.querySelector("#labelLayer"),
  emptyState: document.querySelector("#emptyState"),
  userOpenBtn: document.querySelector("#userOpenBtn"),
  userEntryText: document.querySelector("#userEntryText"),
  authModal: document.querySelector("#authModal"),
  authCloseBtn: document.querySelector("#authCloseBtn"),
  authCloseBackdrop: document.querySelector("#authCloseBackdrop"),
  phoneInput: document.querySelector("#phoneInput"),
  inviteInput: document.querySelector("#inviteInput"),
  registerBtn: document.querySelector("#registerBtn"),
  userLoginBtn: document.querySelector("#userLoginBtn"),
  authHint: document.querySelector("#authHint"),
  adminOpenBtn: document.querySelector("#adminOpenBtn"),
  adminModal: document.querySelector("#adminModal"),
  adminCloseBtn: document.querySelector("#adminCloseBtn"),
  adminCloseBackdrop: document.querySelector("#adminCloseBackdrop"),
  adminLogin: document.querySelector("#adminLogin"),
  adminBoard: document.querySelector("#adminBoard"),
  adminUsername: document.querySelector("#adminUsername"),
  adminPassword: document.querySelector("#adminPassword"),
  adminLoginBtn: document.querySelector("#adminLoginBtn"),
  adminLoginHint: document.querySelector("#adminLoginHint"),
  configForm: document.querySelector("#configForm"),
  apiKeyInput: document.querySelector("#apiKeyInput"),
  endpointInput: document.querySelector("#endpointInput"),
  modelInput: document.querySelector("#modelInput"),
  dailyLimitInput: document.querySelector("#dailyLimitInput"),
  aiEnabledInput: document.querySelector("#aiEnabledInput"),
  promptInput: document.querySelector("#promptInput"),
  apiKeyState: document.querySelector("#apiKeyState"),
  clearApiKeyBtn: document.querySelector("#clearApiKeyBtn"),
  configHint: document.querySelector("#configHint"),
  passwordForm: document.querySelector("#passwordForm"),
  oldPasswordInput: document.querySelector("#oldPasswordInput"),
  newPasswordInput: document.querySelector("#newPasswordInput"),
  passwordHint: document.querySelector("#passwordHint"),
  refreshStatsBtn: document.querySelector("#refreshStatsBtn"),
  recentList: document.querySelector("#recentList"),
  inviteForm: document.querySelector("#inviteForm"),
  adminInviteCode: document.querySelector("#adminInviteCode"),
  adminInviteMaxUses: document.querySelector("#adminInviteMaxUses"),
  adminInviteDailyLimit: document.querySelector("#adminInviteDailyLimit"),
  inviteHint: document.querySelector("#inviteHint"),
  inviteList: document.querySelector("#inviteList"),
  userUsageList: document.querySelector("#userUsageList"),
  statVisits: document.querySelector("#statVisits"),
  statGenerations: document.querySelector("#statGenerations"),
  statAi: document.querySelector("#statAi"),
  statSuccess: document.querySelector("#statSuccess"),
  stepButtons: Array.from(document.querySelectorAll("[data-step]")),
  conceptSteps: Array.from(document.querySelectorAll("[data-concept]")),
  mobileTabs: Array.from(document.querySelectorAll(".mobile-tab[data-mobile-panel]")),
  assistDrawer: document.querySelector("#assistDrawer"),
  assistTitle: document.querySelector("#assistTitle"),
  assistCloseBtn: document.querySelector("#assistCloseBtn"),
  assistModeButtons: Array.from(document.querySelectorAll("[data-assist-mode]")),
  assistPanels: Array.from(document.querySelectorAll("[data-assist-panel]")),
  historyList: document.querySelector("#historyList"),
  stepsList: document.querySelector("#stepsList"),
  refreshStepsBtn: document.querySelector("#refreshStepsBtn"),
  assistEquationBox: document.querySelector("#assistEquationBox"),
  askInput: document.querySelector("#askInput"),
  askSubmitBtn: document.querySelector("#askSubmitBtn"),
  askAnswer: document.querySelector("#askAnswer"),
  helpList: document.querySelector("#helpList"),
};

const state = {
  scene: null,
  camera: null,
  perspectiveCamera: null,
  orthographicCamera: null,
  renderer: null,
  controls: null,
  raycaster: new THREE.Raycaster(),
  pointer: new THREE.Vector2(),
  grid: null,
  axesGroup: null,
  modelGroup: null,
  measureGroup: null,
  interactiveObjects: [],
  labelItems: [],
  currentModel: null,
  currentBounds: null,
  selectedElementId: null,
  measureMode: false,
  measurePoints: [],
  gridVisible: true,
  auxVisible: true,
  backendAvailable: false,
  adminToken: localStorage.getItem("geometry-space-admin-token") || "",
  userToken: localStorage.getItem("geometry-space-user-token") || "",
  currentUser: null,
  activeStep: "input",
  activeAssistMode: "",
  helpMode: false,
  viewMode: "3d",
  pendingViewMode: "",
};

const colors = {
  point: 0xd9564a,
  line: 0x2266d1,
  connection: 0x0f8f8c,
  aux: 0x8a9298,
  face: [0xffb84d, 0x6fc0a7, 0x7a9cf5, 0xe87962, 0xa6a15d, 0x58a8b0],
  selected: 0xffb84d,
  measure: 0xf08b2f,
};

init();

function init() {
  initScene();
  initUI();
  animate();
}

function initUI() {
  samples.forEach((sample, index) => {
    const button = document.createElement("button");
    button.className = "sample-button";
    button.type = "button";
    button.innerHTML = `<strong>${sample.title}</strong><span>${sample.meta}</span>`;
    button.addEventListener("click", () => {
      dom.input.value = sample.text;
      setActiveStep("input");
      generateModel();
    });
    if (index === 0) {
      dom.input.value = sample.text;
    }
    dom.sampleList.appendChild(button);
  });

  dom.generateBtn.addEventListener("click", generateModel);
  dom.tipsBtn.addEventListener("click", showInputTips);
  dom.clearBtn.addEventListener("click", () => {
    dom.input.value = "";
    dom.input.focus();
    clearGeneratedModel();
    updateProblemHints("");
    setActiveStep("input");
    setMobilePanel("input");
    setStatus("已清空题目");
  });
  dom.selectAllBtn.addEventListener("click", () => {
    dom.input.focus();
    dom.input.select();
  });
  dom.input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      generateModel();
    }
  });
  dom.input.addEventListener("focus", () => setActiveStep("input"));
  dom.input.addEventListener("input", () => updateProblemHints(dom.input.value));

  dom.resetViewBtn.addEventListener("click", resetCameraToModel);
  dom.gridBtn.addEventListener("click", () => {
    state.gridVisible = !state.gridVisible;
    if (state.grid) state.grid.visible = state.gridVisible;
    dom.gridBtn.classList.toggle("active", state.gridVisible);
  });
  dom.auxBtn.addEventListener("click", () => {
    state.auxVisible = !state.auxVisible;
    applyAuxVisibility();
    dom.auxBtn.classList.toggle("active", state.auxVisible);
  });
  dom.measureBtn.addEventListener("click", toggleMeasureMode);
  dom.screenshotBtn.addEventListener("click", exportScreenshot);
  dom.viewModeButtons.forEach((button) => {
    button.addEventListener("click", () => setViewMode(button.dataset.viewMode, true));
  });

  dom.stepButtons.forEach((button) => {
    button.addEventListener("click", () => handleStepNavigation(button.dataset.step));
  });
  dom.mobileTabs.forEach((button) => {
    button.addEventListener("click", () => setMobilePanel(button.dataset.mobilePanel || "none"));
  });
  dom.assistModeButtons.forEach((button) => {
    button.addEventListener("click", () => openAssist(button.dataset.assistMode));
  });
  dom.assistCloseBtn.addEventListener("click", closeAssist);
  dom.refreshStepsBtn.addEventListener("click", () => renderStudySteps(true));
  dom.askSubmitBtn.addEventListener("click", askQuestion);
  dom.askInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") askQuestion();
  });
  dom.userOpenBtn.addEventListener("click", openAuthModal);
  dom.authCloseBtn.addEventListener("click", closeAuthModal);
  dom.authCloseBackdrop.addEventListener("click", closeAuthModal);
  dom.registerBtn.addEventListener("click", () => submitAuth("register"));
  dom.userLoginBtn.addEventListener("click", () => submitAuth("login"));

  dom.canvas.addEventListener("pointerdown", handlePointerDown);
  window.addEventListener("resize", resizeRenderer);

  initAdminUI();
  checkBackend();
  loadCurrentUser();
  recordVisit();
  renderHelpPanel();
  renderHistory();
  updateProblemHints(dom.input.value);
  window.lucide?.createIcons();
  generateModel();
  if (window.location.hash === "#admin") {
    openAdminModal();
  }
}

function initAdminUI() {
  dom.adminOpenBtn.addEventListener("click", openAdminModal);
  dom.adminCloseBtn.addEventListener("click", closeAdminModal);
  dom.adminCloseBackdrop.addEventListener("click", closeAdminModal);
  dom.adminLoginBtn.addEventListener("click", adminLogin);
  dom.adminPassword.addEventListener("keydown", (event) => {
    if (event.key === "Enter") adminLogin();
  });
  dom.configForm.addEventListener("submit", saveAdminConfig);
  dom.clearApiKeyBtn.addEventListener("click", clearApiKey);
  dom.passwordForm.addEventListener("submit", changeAdminPassword);
  dom.refreshStatsBtn.addEventListener("click", loadAdminDashboard);
  dom.inviteForm.addEventListener("submit", createInvite);
}

function handleStepNavigation(step) {
  setActiveStep(step);
  if (step === "input") {
    setMobilePanel("input");
    dom.input.focus();
    return;
  }
  if (step === "parse" || step === "inspect") {
    setMobilePanel("info");
    return;
  }
  if (step === "model") {
    setMobilePanel("none");
    resetCameraToModel();
    return;
  }
  if (step === "output") {
    setMobilePanel("none");
  }
}

function setActiveStep(step) {
  state.activeStep = step;
  dom.stepButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.step === step);
  });

  const conceptStep = step === "inspect" || step === "output" ? "inspect" : step;
  dom.conceptSteps.forEach((item) => {
    item.classList.toggle("active", item.dataset.concept === conceptStep);
  });
}

function setMobilePanel(panel) {
  if (!dom.appShell) return;
  dom.appShell.dataset.mobilePanel = panel || "none";
  dom.mobileTabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.mobilePanel === dom.appShell.dataset.mobilePanel);
  });
}

function closeMobilePanel() {
  if (window.matchMedia("(max-width: 820px)").matches) {
    setMobilePanel("none");
  }
}

function setViewMode(mode, reset = true) {
  const nextMode = mode === "2d" ? "2d" : "3d";
  state.viewMode = nextMode;
  state.camera = nextMode === "2d" ? state.orthographicCamera : state.perspectiveCamera;
  if (state.controls) {
    state.controls.object = state.camera;
  }
  updateCameraProjection();
  dom.viewModeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.viewMode === nextMode);
  });
  dom.viewModeLabel.textContent = nextMode === "2d" ? "二维视图" : "三维视图";
  if (state.controls) {
    state.controls.enableRotate = nextMode !== "2d";
    state.controls.screenSpacePanning = nextMode === "2d";
  }
  if (reset) resetCameraToModel();
  setStatus(nextMode === "2d" ? "已切换到 2D 平面视图" : "已切换到 3D 空间视图");
}

function inferViewModeFromText(text) {
  const clean = normalizeText(text || "");
  if (/(圆|椭圆|抛物线|双曲线|轨迹|动点|三角形|△)/.test(clean)) return "2d";
  return "3d";
}

function inferViewModeFromModel(model) {
  if (!model) return "3d";
  if (model.type === "triangle") return "2d";
  const bounds = computeBounds(model);
  return bounds.size.z < 0.2 ? "2d" : "3d";
}

async function checkBackend() {
  try {
    const data = await apiFetch("/api/health");
    state.backendAvailable = Boolean(data.ok);
    if (data.config?.apiKeySet) {
      setStatus("准备就绪：本地解析 + DeepSeek 后端可用");
    }
  } catch {
    state.backendAvailable = false;
  }
}

function recordVisit() {
  apiFetch("/api/visit", { method: "POST" }).catch(() => {});
}

function recordUsage(payload) {
  apiFetch("/api/usage", {
    method: "POST",
    body: payload,
  }).catch(() => {});
}

async function requestBackendParse(text) {
  const data = await apiFetch("/api/parse", {
    method: "POST",
    body: { text },
  });
  if (!data.ok || !data.model) {
    throw new Error(data.error || "AI 解析失败");
  }
  return data.model;
}

async function requestBackendTips(text) {
  return apiFetch("/api/tips", {
    method: "POST",
    body: { text },
  });
}

async function requestBackendCoach(mode, payload) {
  return apiFetch("/api/coach", {
    method: "POST",
    body: {
      mode,
      text: dom.input.value.trim(),
      model: summarizeCurrentModel(),
      ...payload,
    },
  });
}

async function apiFetch(url, options = {}) {
  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };
  if (state.userToken && !headers.Authorization && !headers["X-User-Token"]) {
    headers["X-User-Token"] = state.userToken;
  }
  const request = {
    method: options.method || "GET",
    headers,
  };
  if (options.body !== undefined) {
    request.headers["Content-Type"] = "application/json";
    request.body = JSON.stringify(options.body);
  }
  const response = await fetch(url, request);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `请求失败：${response.status}`);
  }
  return data;
}

function adminHeaders() {
  return {
    Authorization: `Bearer ${state.adminToken}`,
  };
}

function openAuthModal() {
  dom.authModal.classList.add("open");
  dom.authModal.setAttribute("aria-hidden", "false");
  dom.phoneInput.focus();
}

function closeAuthModal() {
  dom.authModal.classList.remove("open");
  dom.authModal.setAttribute("aria-hidden", "true");
}

async function submitAuth(mode) {
  const phone = dom.phoneInput.value.trim();
  if (!phone) {
    dom.authHint.textContent = "请先输入手机号。";
    return;
  }
  dom.authHint.textContent = mode === "register" ? "正在登记..." : "正在登录...";
  try {
    const data = await apiFetch(mode === "register" ? "/api/auth/register" : "/api/auth/login", {
      method: "POST",
      body: {
        phone,
        inviteCode: dom.inviteInput.value.trim(),
      },
    });
    state.userToken = data.token;
    state.currentUser = data.user;
    localStorage.setItem("geometry-space-user-token", state.userToken);
    renderCurrentUser();
    closeAuthModal();
    setStatus("已登录，做题记录会计入当前账号");
  } catch (error) {
    dom.authHint.textContent = error.message;
  }
}

async function loadCurrentUser() {
  if (!state.userToken) {
    renderCurrentUser();
    return;
  }
  try {
    const data = await apiFetch("/api/auth/me");
    state.currentUser = data.user || null;
    if (!state.currentUser) {
      state.userToken = "";
      localStorage.removeItem("geometry-space-user-token");
    }
  } catch {
    state.currentUser = null;
  }
  renderCurrentUser();
}

function renderCurrentUser() {
  dom.userEntryText.textContent = state.currentUser?.phone ? state.currentUser.phone.slice(-4) : "登录";
}

function openAdminModal() {
  dom.adminModal.classList.add("open");
  dom.adminModal.setAttribute("aria-hidden", "false");
  if (state.adminToken) {
    loadAdminDashboard().catch(() => showAdminLogin("登录已过期，请重新登录"));
  } else {
    showAdminLogin();
  }
  window.lucide?.createIcons();
}

function closeAdminModal() {
  dom.adminModal.classList.remove("open");
  dom.adminModal.setAttribute("aria-hidden", "true");
}

function showAdminLogin(message = "") {
  dom.adminLogin.hidden = false;
  dom.adminBoard.hidden = true;
  dom.adminLoginHint.textContent = message || "初始账号 admin，密码 123456。部署公网后请先改密码。";
}

function showAdminBoard() {
  dom.adminLogin.hidden = true;
  dom.adminBoard.hidden = false;
}

async function adminLogin() {
  dom.adminLoginHint.textContent = "正在登录...";
  try {
    const data = await apiFetch("/api/admin/login", {
      method: "POST",
      body: {
        username: dom.adminUsername.value.trim(),
        password: dom.adminPassword.value,
      },
    });
    state.adminToken = data.token;
    localStorage.setItem("geometry-space-admin-token", state.adminToken);
    showAdminBoard();
    fillAdminConfig(data.config);
    renderStats(data.stats);
    loadAdminDashboard().catch(() => {});
    dom.adminLoginHint.textContent = "登录成功";
  } catch (error) {
    showAdminLogin(error.message);
  }
}

async function loadAdminDashboard() {
  const [configData, statsData, invitesData, usersData] = await Promise.all([
    apiFetch("/api/admin/config", { headers: adminHeaders() }),
    apiFetch("/api/admin/stats", { headers: adminHeaders() }),
    apiFetch("/api/admin/invites", { headers: adminHeaders() }).catch(() => ({ invites: [] })),
    apiFetch("/api/admin/users", { headers: adminHeaders() }).catch(() => ({ users: [] })),
  ]);
  showAdminBoard();
  fillAdminConfig(configData.config);
  renderStats(statsData.stats);
  renderInvites(invitesData.invites || []);
  renderUserUsage(usersData.users || []);
  window.lucide?.createIcons();
}

function fillAdminConfig(config) {
  dom.apiKeyInput.value = "";
  dom.endpointInput.value = config.endpoint || "";
  dom.modelInput.value = config.model || "";
  dom.dailyLimitInput.value = config.dailyLimit || 200;
  dom.aiEnabledInput.checked = Boolean(config.aiEnabled);
  dom.promptInput.value = config.promptTemplate || "";
  dom.apiKeyState.textContent = config.apiKeySet ? `已配置 ${config.apiKeyMask}` : "未配置";
}

function renderStats(stats) {
  dom.statVisits.textContent = stats.totalVisits || 0;
  dom.statGenerations.textContent = stats.totalGenerations || 0;
  dom.statAi.textContent = stats.aiRequests || 0;
  dom.statSuccess.textContent = `${stats.successRate || 0}%`;
  dom.recentList.innerHTML = "";

  if (!stats.recent?.length) {
    dom.recentList.innerHTML = '<div class="recent-item"><span>暂无记录</span></div>';
    return;
  }

  stats.recent.slice(0, 20).forEach((item) => {
    const el = document.createElement("div");
    el.className = "recent-item";
    const statusClass = item.status === "success" ? "recent-ok" : "recent-fail";
    const statusText = item.status === "success" ? "成功" : "失败";
    el.innerHTML = `
      <strong class="${statusClass}">${item.source || "local"} · ${statusText}</strong>
      <span>${escapeHtml(item.text || "无题目")}</span>
      <span>${escapeHtml(item.modelTitle || item.error || "")}</span>
    `;
    dom.recentList.appendChild(el);
  });
}

async function saveAdminConfig(event) {
  event.preventDefault();
  dom.configHint.textContent = "正在保存...";
  try {
    const data = await apiFetch("/api/admin/config", {
      method: "PUT",
      headers: adminHeaders(),
      body: {
        apiKey: dom.apiKeyInput.value.trim(),
        endpoint: dom.endpointInput.value.trim(),
        model: dom.modelInput.value.trim(),
        dailyLimit: Number(dom.dailyLimitInput.value),
        aiEnabled: dom.aiEnabledInput.checked,
        promptTemplate: dom.promptInput.value,
      },
    });
    fillAdminConfig(data.config);
    dom.configHint.textContent = "已保存。普通用户不会看到 API Key。";
    state.backendAvailable = true;
  } catch (error) {
    dom.configHint.textContent = error.message;
  }
}

async function clearApiKey() {
  dom.configHint.textContent = "正在清除 API Key...";
  try {
    const data = await apiFetch("/api/admin/config", {
      method: "PUT",
      headers: adminHeaders(),
      body: {
        endpoint: dom.endpointInput.value.trim(),
        model: dom.modelInput.value.trim(),
        dailyLimit: Number(dom.dailyLimitInput.value),
        aiEnabled: dom.aiEnabledInput.checked,
        promptTemplate: dom.promptInput.value,
        clearApiKey: true,
      },
    });
    fillAdminConfig(data.config);
    dom.configHint.textContent = "API Key 已清除。";
  } catch (error) {
    dom.configHint.textContent = error.message;
  }
}

async function changeAdminPassword(event) {
  event.preventDefault();
  dom.passwordHint.textContent = "正在更新...";
  try {
    await apiFetch("/api/admin/password", {
      method: "PUT",
      headers: adminHeaders(),
      body: {
        oldPassword: dom.oldPasswordInput.value,
        newPassword: dom.newPasswordInput.value,
      },
    });
    dom.oldPasswordInput.value = "";
    dom.newPasswordInput.value = "";
    dom.passwordHint.textContent = "密码已更新。";
  } catch (error) {
    dom.passwordHint.textContent = error.message;
  }
}

async function createInvite(event) {
  event.preventDefault();
  dom.inviteHint.textContent = "正在创建...";
  try {
    const data = await apiFetch("/api/admin/invites", {
      method: "POST",
      headers: adminHeaders(),
      body: {
        code: dom.adminInviteCode.value.trim(),
        maxUses: Number(dom.adminInviteMaxUses.value || 30),
        dailyAiLimit: Number(dom.adminInviteDailyLimit.value || 20),
      },
    });
    dom.adminInviteCode.value = "";
    dom.inviteHint.textContent = `已创建：${data.invite.code}`;
    await loadAdminDashboard();
  } catch (error) {
    dom.inviteHint.textContent = error.message;
  }
}

function renderInvites(invites) {
  if (!invites.length) {
    dom.inviteList.innerHTML = '<div class="recent-item"><span>暂无邀请码</span></div>';
    return;
  }
  dom.inviteList.innerHTML = invites
    .slice(0, 10)
    .map(
      (item) => `
        <div class="recent-item">
          <strong>${escapeHtml(item.code)}</strong>
          <span>已用 ${item.usedCount || 0}/${item.maxUses || 0} · 每日 AI ${item.dailyAiLimit || 0}</span>
        </div>
      `,
    )
    .join("");
}

function renderUserUsage(users) {
  if (!users.length) {
    dom.userUsageList.innerHTML = '<div class="recent-item"><span>暂无用户</span></div>';
    return;
  }
  dom.userUsageList.innerHTML = users
    .slice(0, 20)
    .map(
      (user) => `
        <div class="recent-item">
          <strong>${escapeHtml(user.phone || "")}</strong>
          <span>生成 ${user.usage?.generations || 0} · AI ${user.usage?.aiRequests || 0} / ${user.dailyAiLimit || 0}</span>
          <span>${escapeHtml(user.inviteCode || "无邀请码")}</span>
        </div>
      `,
    )
    .join("");
}

function updateProblemHints(text, extraMessage = "") {
  const hints = analyzeProblemText(text);
  if (extraMessage) hints.unshift({ level: "warn", text: extraMessage });

  if (!hints.length) {
    dom.problemHints.hidden = true;
    dom.problemHints.innerHTML = "";
    return [];
  }

  dom.problemHints.hidden = false;
  dom.problemHints.innerHTML = hints
    .slice(0, 4)
    .map((hint) => `<div class="hint-line hint-${hint.level}">${escapeHtml(hint.text)}</div>`)
    .join("");
  return hints;
}

function analyzeProblemText(text) {
  const clean = normalizeText(text || "");
  const hints = [];
  if (!clean) return hints;

  const hasSupportedType = /(正方体|长方体|三棱锥|四棱锥|正四棱锥|三角形|△)/.test(clean);
  const hasCurveType = /(圆|椭圆|抛物线|双曲线|轨迹|动点)/.test(clean);
  const hasRoundSolidType = /(球|圆锥|圆柱)/.test(clean);

  if (hasCurveType) {
    hints.push({ level: "info", text: "检测到圆类或轨迹题，建议先用 2D 平面视图；本地规则不够时会尝试 AI 解析。" });
  }

  if (hasRoundSolidType) {
    hints.push({ level: "warn", text: "检测到球、圆锥或圆柱，这类空间曲面题本地规则暂不稳定，建议使用 AI 解析。" });
  }

  if (!hasSupportedType && !hasCurveType && !hasRoundSolidType) {
    hints.push({ level: "warn", text: "题目里最好先写清图形类型，例如正方体、长方体、三棱锥或三角形。" });
  }

  const labels = clean.match(/[A-Z][0-9]?/g) || [];
  if (labels.length < 3) {
    hints.push({ level: "warn", text: "点名偏少，建议写出 A、B、C、P、A1 这类顶点标记。" });
  }

  if (!/(边长|棱长|底边长|半径|直径|=|为)\d/.test(clean)) {
    hints.push({
      level: "info",
      text: hasCurveType
        ? "没有看到半径、直径或动点范围；想更准确可以写 半径为2 或 P在圆O上运动。"
        : "没有看到长度，系统会用默认尺寸；想更准确可以写 AB=2 或边长为2。",
    });
  }

  if (!/(连接|连结|中点|交点|重心|垂直|平行|⊥|\/\/)/.test(clean)) {
    hints.push({ level: "info", text: "可以补充中点、垂直、平行或连接线，模型会更贴近题意。" });
  }

  return hints;
}

function openAssist(mode) {
  if (state.activeAssistMode === "help" && mode !== "help") toggleHelpMode(false);
  state.activeAssistMode = mode;
  dom.assistDrawer.hidden = false;
  dom.assistModeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.assistMode === mode);
  });
  dom.assistPanels.forEach((panel) => {
    panel.hidden = panel.dataset.assistPanel !== mode;
  });

  const titles = {
    history: "历史记录",
    steps: "解题步骤",
    ask: "问一问",
    help: "Help 模式",
  };
  dom.assistTitle.textContent = titles[mode] || "学习助手";

  if (mode === "history") renderHistory();
  if (mode === "steps") renderStudySteps(false);
  if (mode === "help") toggleHelpMode(true);
  if (mode === "ask") dom.askInput.focus();
  closeMobilePanel();
  window.lucide?.createIcons();
}

function closeAssist() {
  dom.assistDrawer.hidden = true;
  dom.assistModeButtons.forEach((button) => button.classList.remove("active"));
  if (state.activeAssistMode === "help") toggleHelpMode(false);
  state.activeAssistMode = "";
}

function toggleHelpMode(active = !state.helpMode) {
  state.helpMode = active;
  document.body.classList.toggle("help-mode", state.helpMode);
  setStatus(state.helpMode ? "Help 模式：看页面上的简短标注" : "已退出 Help 模式");
}

function renderHelpPanel() {
  dom.helpList.innerHTML = helpItems
    .map((item, index) => {
      const isOpen = index === 0 ? " open" : "";
      return `
        <article class="help-item${isOpen}">
          <span class="help-step">${index + 1}</span>
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(item.text)}</span>
          <small>${escapeHtml(item.detail || "")}</small>
        </article>
      `;
    })
    .join("");
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(historyKey) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(entry) {
  const history = getHistory();
  const next = [
    {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      time: new Date().toISOString(),
      text: entry.text,
      title: entry.title || "未生成",
      source: entry.source || "local",
      status: entry.status || "success",
      error: entry.error || "",
    },
    ...history.filter((item) => item.text !== entry.text),
  ].slice(0, 30);
  localStorage.setItem(historyKey, JSON.stringify(next));
  renderHistory();
}

function renderHistory() {
  const history = getHistory();
  if (!history.length) {
    dom.historyList.innerHTML = '<div class="empty-note">还没有做题记录。</div>';
    return;
  }

  dom.historyList.innerHTML = "";
  history.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "history-item";
    const time = new Date(item.time).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    const status = item.status === "success" ? item.title : item.error || "解析失败";
    button.innerHTML = `
      <strong>${escapeHtml(status)}</strong>
      <span>${escapeHtml(time)} · ${escapeHtml(item.source || "local")}</span>
      <small>${escapeHtml(item.text || "")}</small>
    `;
    button.addEventListener("click", () => {
      dom.input.value = item.text || "";
      updateProblemHints(dom.input.value);
      setActiveStep("input");
      setMobilePanel("input");
      closeAssist();
      setStatus("已恢复历史题目");
    });
    dom.historyList.appendChild(button);
  });
}

function renderStudySteps(refreshFromApi = false) {
  const local = buildLocalStudy();
  renderStudyContent(local);

  if (!refreshFromApi) return;
  dom.stepsList.innerHTML = "<li>正在整理更完整的步骤...</li>";
  requestBackendCoach("steps", {})
    .then((data) => {
      renderStudyContent({
        equations: data.equations?.length ? data.equations : local.equations,
        steps: data.steps?.length ? data.steps : local.steps,
      });
      setStatus(data.source === "ai" ? "AI 步骤已更新" : "步骤已更新");
    })
    .catch((error) => {
      renderStudyContent(local);
      setStatus(`步骤已使用本地版本：${error.message}`);
    });
}

function renderStudyContent(content) {
  const equations = content.equations || [];
  dom.assistEquationBox.innerHTML = equations.length
    ? equations.map((item) => `<div>${escapeHtml(item)}</div>`).join("")
    : "<div>生成模型后会显示坐标、方程或参数表达。</div>";

  const steps = content.steps || [];
  dom.stepsList.innerHTML = steps.length ? steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("") : "<li>先生成一个三维模型。</li>";
}

function buildLocalStudy(model = state.currentModel) {
  if (!model) {
    return {
      equations: [],
      steps: ["先输入题目并生成模型。", "如果题目不清楚，点 Tips 选择一个规范表达。"],
    };
  }

  const relations = model.relations?.slice(0, 3) || [];
  const steps = [
    `识别题型：${model.title}。`,
    "建立坐标系：底面尽量放在 z=0 平面，高度沿 z 轴向上。",
    `标出关键元素：${Object.keys(model.points).length} 个点、${model.segments.length} 条线、${model.faces.length} 个面。`,
  ];

  if (relations.length) steps.push(`读出题目关系：${relations.join("；")}。`);
  steps.push("拖动模型观察空间位置，点击点、线、面确认细节。");
  steps.push("需要长度时点尺子图标，再依次点击两个点。");

  return {
    equations: model.equations || buildModelEquations(model),
    steps,
  };
}

async function askQuestion() {
  const question = dom.askInput.value.trim();
  if (!question) {
    dom.askAnswer.textContent = "先输入一个问题，例如：为什么 P 点在 A 点上方？";
    return;
  }

  dom.askAnswer.textContent = "正在回答...";
  try {
    const data = await requestBackendCoach("ask", { question });
    dom.askAnswer.textContent = data.answer || buildLocalAnswer(question);
    setStatus(data.source === "ai" ? "AI 已回答" : "已给出本地回答");
  } catch (error) {
    dom.askAnswer.textContent = buildLocalAnswer(question);
    setStatus(`已给出本地回答：${error.message}`);
  }
}

function buildLocalAnswer(question) {
  const model = state.currentModel;
  if (!model) return "先生成三维模型，我才能结合图形回答。";

  if (/方程|轨迹|坐标/.test(question)) {
    return (model.equations || buildModelEquations(model)).join("；") || "当前模型没有可显示的方程。";
  }
  if (/中点/.test(question)) {
    const mid = Object.values(model.points).find((point) => point.role.includes("中点"));
    return mid
      ? `${mid.label} 是${mid.role}，坐标是 (${formatNumber(mid.position.x)}, ${formatNumber(mid.position.y)}, ${formatNumber(mid.position.z)})。`
      : "当前题目没有识别到中点。";
  }
  if (/高|垂直/.test(question)) {
    const relation = model.relations.find((item) => item.includes("⟂") || item.includes("垂直"));
    return relation ? `图中关键垂直关系是：${relation}。` : "当前题目没有识别到明确的垂直关系。";
  }
  return `可以先看右侧解析：${model.description} 再点击模型中的点、线、面确认空间位置。`;
}

function summarizeCurrentModel() {
  const model = state.currentModel;
  if (!model) return null;
  return {
    title: model.title,
    description: model.description,
    pointCount: Object.keys(model.points || {}).length,
    segmentCount: model.segments?.length || 0,
    faceCount: model.faces?.length || 0,
    relations: (model.relations || []).slice(0, 8),
    equations: (model.equations || buildModelEquations(model)).slice(0, 5),
  };
}

async function showInputTips() {
  const text = dom.input.value.trim();
  dom.tipsPanel.hidden = false;
  setActiveStep("input");
  setMobilePanel("input");
  renderTips(buildLocalTips(text), "常用表达");
  dom.tipsState.textContent = "正在获取";
  setStatus("正在准备输入 Tips...");

  try {
    const data = await requestBackendTips(text);
    const tips = Array.isArray(data.tips) && data.tips.length ? data.tips : buildLocalTips(text);
    renderTips(tips, data.source === "ai" ? "AI Tips" : "常用表达");
    setStatus(data.source === "ai" ? "AI Tips 已更新" : "Tips 已就绪");
  } catch (error) {
    renderTips(buildLocalTips(text), "常用表达");
    setStatus(`Tips 已就绪：${error.message}`);
  } finally {
    window.lucide?.createIcons();
  }
}

function buildLocalTips(text) {
  const clean = String(text || "").trim();
  const tips = [];

  if (clean) {
    tips.push({
      title: "整理当前题目",
      meta: "补齐图形、长度、关系、连线",
      text: clean.endsWith("。") || clean.endsWith(".") ? clean : `${clean}。`,
    });
  }

  const matched = starterTips.filter((tip) => {
    if (!clean) return true;
    return clean.includes(tip.title.slice(0, 3)) || tip.text.includes(clean.slice(0, 3));
  });
  const pool = matched.length ? matched : starterTips;
  pool.forEach((tip) => tips.push(tip));

  return tips.slice(0, 5);
}

function renderTips(tips, stateText) {
  dom.tipsState.textContent = stateText;
  dom.tipsList.innerHTML = "";

  tips.forEach((tip) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tip-button";
    button.innerHTML = `
      <strong>${escapeHtml(tip.title || "输入建议")}</strong>
      <span>${escapeHtml(tip.meta || "可直接使用")}</span>
      <code>${escapeHtml(tip.text || "")}</code>
    `;
    button.addEventListener("click", () => {
      dom.input.value = tip.text || "";
      dom.input.focus();
      updateProblemHints(dom.input.value);
      setActiveStep("input");
      setStatus("已填入 Tips");
    });
    dom.tipsList.appendChild(button);
  });
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initScene() {
  state.scene = new THREE.Scene();
  state.scene.background = new THREE.Color(0xf0f4f2);

  state.perspectiveCamera = new THREE.PerspectiveCamera(46, 1, 0.1, 1000);
  state.perspectiveCamera.up.set(0, 0, 1);
  state.perspectiveCamera.position.set(4, -6, 4);
  state.orthographicCamera = new THREE.OrthographicCamera(-4, 4, 4, -4, 0.1, 1000);
  state.orthographicCamera.up.set(0, 1, 0);
  state.orthographicCamera.position.set(0, 0, 8);
  state.camera = state.perspectiveCamera;

  state.renderer = new THREE.WebGLRenderer({
    canvas: dom.canvas,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  state.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  state.renderer.outputColorSpace = THREE.SRGBColorSpace;

  state.controls = new OrbitControls(state.camera, dom.canvas);
  state.controls.enableDamping = true;
  state.controls.dampingFactor = 0.08;
  state.controls.target.set(0, 0, 0.8);
  state.controls.update();

  const ambient = new THREE.HemisphereLight(0xffffff, 0xc9c2b1, 2.2);
  state.scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
  keyLight.position.set(4, -5, 7);
  state.scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xfff0cf, 1.2);
  fillLight.position.set(-4, 3, 5);
  state.scene.add(fillLight);

  state.axesGroup = new THREE.Group();
  state.scene.add(state.axesGroup);
  rebuildGridAndAxes(6);
  resizeRenderer();
}

function rebuildGridAndAxes(size) {
  if (state.grid) {
    state.scene.remove(state.grid);
    state.grid.geometry.dispose();
    state.grid.material.dispose();
  }
  clearAxisLabels();
  state.axesGroup.clear();

  const gridSize = Math.max(4, size);
  state.grid = new THREE.GridHelper(gridSize, 12, 0xc5bdac, 0xe2d9ca);
  state.grid.rotation.x = Math.PI / 2;
  state.grid.visible = state.gridVisible;
  state.scene.add(state.grid);

  const axisLength = gridSize * 0.46;
  addAxis(new THREE.Vector3(1, 0, 0), axisLength, 0xd9564a, "X");
  addAxis(new THREE.Vector3(0, 1, 0), axisLength, 0x0f8f8c, "Y");
  addAxis(new THREE.Vector3(0, 0, 1), axisLength, 0x2266d1, "Z");
}

function addAxis(direction, length, color, label) {
  const arrow = new THREE.ArrowHelper(direction, new THREE.Vector3(0, 0, 0), length, color, length * 0.09, length * 0.05);
  state.axesGroup.add(arrow);
  createLabel(label, direction.clone().multiplyScalar(length * 1.06), "vertex-label axis-label", "axis");
}

function clearAxisLabels() {
  state.labelItems
    .filter((item) => item.kind === "axis")
    .forEach((item) => item.el.remove());
  state.labelItems = state.labelItems.filter((item) => item.kind !== "axis");
}

async function generateModel() {
  const text = dom.input.value.trim();
  if (!text) {
    setStatus("请先输入题目");
    updateProblemHints(text, "请先输入一道题，或者点 Tips 选一个模板。");
    return;
  }

  updateProblemHints(text);
  state.pendingViewMode = inferViewModeFromText(text);
  setLoading(true);
  setActiveStep("parse");
  setStatus("正在解析题目...");

  try {
    await sleep(80);
    try {
      const model = buildModelFromText(text);
      model.source = "local";
      renderModel(model);
      setStatus(`已生成 ${model.title}`);
      saveHistory({ text, title: model.title, source: "local", status: "success" });
      recordUsage({ source: "local", success: true, text, modelTitle: model.title });
      return;
    } catch (localError) {
      if (!state.backendAvailable) await checkBackend();
      if (!state.backendAvailable) throw localError;
      setStatus("本地规则未识别，正在请求 DeepSeek...");
      const aiModel = await requestBackendParse(text);
      aiModel.source = "ai";
      centerModelOnXY(aiModel);
      aiModel.equations = aiModel.equations?.length ? aiModel.equations : buildModelEquations(aiModel);
      renderModel(aiModel);
      setStatus(`DeepSeek 已生成 ${aiModel.title}`);
      saveHistory({ text, title: aiModel.title, source: "ai", status: "success" });
      return;
    }
  } catch (error) {
    clearGeneratedModel();
    showParseError(error);
    setActiveStep("parse");
    saveHistory({ text, title: "解析失败", source: state.backendAvailable ? "ai" : "local", status: "failure", error: error.message });
    if (!state.backendAvailable) {
      recordUsage({ source: "local", success: false, text, error: error.message });
    }
  } finally {
    setLoading(false);
  }
}

function buildModelFromText(rawText) {
  const text = normalizeText(rawText);
  let model;

  if (/正方体/.test(text)) {
    model = createCubeModel(text);
  } else if (/长方体/.test(text)) {
    model = createCuboidModel(text);
  } else if (/三棱锥/.test(text)) {
    model = createTriPyramidModel(text);
  } else if (/四棱锥|正四棱锥/.test(text)) {
    model = createSquarePyramidModel(text);
  } else if (/三角形|△/.test(text)) {
    model = createTriangleModel(text);
  } else {
    throw new Error("暂未识别该题型。");
  }

  applyTextFeatures(model, text);
  centerModelOnXY(model);
  model.equations = buildModelEquations(model);
  model.source = "local";
  return model;
}

function normalizeText(text) {
  return text
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/₁/g, "1")
    .replace(/₂/g, "2")
    .replace(/＝/g, "=")
    .replace(/\s+/g, "")
    .trim();
}

function createBaseModel(type, title, description) {
  return {
    type,
    title,
    description,
    points: {},
    segments: [],
    faces: [],
    relations: [],
    equations: [],
  };
}

function createCubeModel(text) {
  const side = parseGlobalLength(text, 2);
  const h = side;
  const model = createBaseModel("cube", "正方体模型", `边长 ${formatNumber(side)}，自动标注 8 个顶点。`);
  const half = side / 2;

  addPoint(model, "A", -half, -half, 0, "顶点");
  addPoint(model, "B", half, -half, 0, "顶点");
  addPoint(model, "C", half, half, 0, "顶点");
  addPoint(model, "D", -half, half, 0, "顶点");
  addPoint(model, "A1", -half, -half, h, "顶点");
  addPoint(model, "B1", half, -half, h, "顶点");
  addPoint(model, "C1", half, half, h, "顶点");
  addPoint(model, "D1", -half, half, h, "顶点");

  addBoxEdges(model, ["A", "B", "C", "D"], ["A1", "B1", "C1", "D1"]);
  addFace(model, "平面ABCD", ["A", "B", "C", "D"]);
  addFace(model, "平面A1B1C1D1", ["A1", "B1", "C1", "D1"]);
  addFace(model, "平面ABB1A1", ["A", "B", "B1", "A1"]);
  addFace(model, "平面BCC1B1", ["B", "C", "C1", "B1"]);
  addFace(model, "平面CDD1C1", ["C", "D", "D1", "C1"]);
  addFace(model, "平面DAA1D1", ["D", "A", "A1", "D1"]);
  addRelation(model, `正方体边长 = ${formatNumber(side)}`);
  return model;
}

function createCuboidModel(text) {
  const lengths = parseLengthMap(text);
  const width = getLength(lengths, ["AB", "BA", "A1B1"], 3);
  const depth = getLength(lengths, ["BC", "CB", "AD", "DA"], 2);
  const height = getLength(lengths, ["AA1", "A1A", "BB1", "CC1", "DD1"], 2);
  const model = createBaseModel("cuboid", "长方体模型", `AB=${formatNumber(width)}，BC=${formatNumber(depth)}，AA1=${formatNumber(height)}。`);
  const x = width / 2;
  const y = depth / 2;

  addPoint(model, "A", -x, -y, 0, "顶点");
  addPoint(model, "B", x, -y, 0, "顶点");
  addPoint(model, "C", x, y, 0, "顶点");
  addPoint(model, "D", -x, y, 0, "顶点");
  addPoint(model, "A1", -x, -y, height, "顶点");
  addPoint(model, "B1", x, -y, height, "顶点");
  addPoint(model, "C1", x, y, height, "顶点");
  addPoint(model, "D1", -x, y, height, "顶点");

  addBoxEdges(model, ["A", "B", "C", "D"], ["A1", "B1", "C1", "D1"]);
  addFace(model, "平面ABCD", ["A", "B", "C", "D"]);
  addFace(model, "平面A1B1C1D1", ["A1", "B1", "C1", "D1"]);
  addFace(model, "平面ABB1A1", ["A", "B", "B1", "A1"]);
  addFace(model, "平面BCC1B1", ["B", "C", "C1", "B1"]);
  addFace(model, "平面CDD1C1", ["C", "D", "D1", "C1"]);
  addFace(model, "平面DAA1D1", ["D", "A", "A1", "D1"]);
  addRelation(model, `AB=${formatNumber(width)}`);
  addRelation(model, `BC=${formatNumber(depth)}`);
  addRelation(model, `AA1=${formatNumber(height)}`);
  return model;
}

function createTriPyramidModel(text) {
  const nameMatch = text.match(/三棱锥([A-Z][0-9]?)-([A-Z][0-9]?)([A-Z][0-9]?)([A-Z][0-9]?)/);
  const apex = nameMatch?.[1] || "P";
  const base = nameMatch ? [nameMatch[2], nameMatch[3], nameMatch[4]] : ["A", "B", "C"];
  const [a, b, c] = base;
  const lengths = parseLengthMap(text);
  const height = getLength(lengths, [`${apex}${a}`, `${a}${apex}`], 1.4);
  const ab = getLength(lengths, [`${a}${b}`, `${b}${a}`], 1.6);
  const bc = getLength(lengths, [`${b}${c}`, `${c}${b}`], 1.6);

  const model = createBaseModel("tri-pyramid", "三棱锥模型", `${apex}${a} 垂直底面时，${apex} 点位于 ${a} 点正上方。`);
  addPoint(model, a, 0, 0, 0, "底面顶点");
  addPoint(model, b, ab, 0, 0, "底面顶点");
  addPoint(model, c, ab, bc, 0, "底面顶点");
  addPoint(model, apex, 0, 0, height, "顶点");

  addSegment(model, a, b, "edge", "底边");
  addSegment(model, b, c, "edge", "底边");
  addSegment(model, c, a, "edge", "底边");
  addSegment(model, apex, a, "edge", "侧棱");
  addSegment(model, apex, b, "edge", "侧棱");
  addSegment(model, apex, c, "edge", "侧棱");
  addFace(model, `平面${a}${b}${c}`, [a, b, c]);
  addFace(model, `平面${apex}${a}${b}`, [apex, a, b]);
  addFace(model, `平面${apex}${b}${c}`, [apex, b, c]);
  addFace(model, `平面${apex}${c}${a}`, [apex, c, a]);
  addRelation(model, `${apex}${a} ⟂ 平面${a}${b}${c}`);
  return model;
}

function createSquarePyramidModel(text) {
  const nameMatch = text.match(/(?:正)?四棱锥([A-Z][0-9]?)-([A-Z][0-9]?)([A-Z][0-9]?)([A-Z][0-9]?)([A-Z][0-9]?)/);
  const apex = nameMatch?.[1] || "P";
  const base = nameMatch ? [nameMatch[2], nameMatch[3], nameMatch[4], nameMatch[5]] : ["A", "B", "C", "D"];
  const [a, b, c, d] = base;
  const lengths = parseLengthMap(text);
  const side = getLength(lengths, [`${a}${b}`, `${b}${a}`, `${b}${c}`, `${c}${b}`], parseGlobalLength(text, 2));
  const height = getLength(lengths, [`${apex}O`, `O${apex}`], side);
  const half = side / 2;
  const model = createBaseModel("square-pyramid", "四棱锥模型", `底面为正方形，${apex} 点位于底面中心正上方。`);

  addPoint(model, a, -half, -half, 0, "底面顶点");
  addPoint(model, b, half, -half, 0, "底面顶点");
  addPoint(model, c, half, half, 0, "底面顶点");
  addPoint(model, d, -half, half, 0, "底面顶点");
  if (/O/.test(text) || new RegExp(`${apex}O|O${apex}`).test(text)) {
    addPoint(model, "O", 0, 0, 0, "底面中心");
  }
  addPoint(model, apex, 0, 0, height, "顶点");

  addSegment(model, a, b, "edge", "底边");
  addSegment(model, b, c, "edge", "底边");
  addSegment(model, c, d, "edge", "底边");
  addSegment(model, d, a, "edge", "底边");
  addSegment(model, apex, a, "edge", "侧棱");
  addSegment(model, apex, b, "edge", "侧棱");
  addSegment(model, apex, c, "edge", "侧棱");
  addSegment(model, apex, d, "edge", "侧棱");
  if (model.points.O) {
    addSegment(model, apex, "O", "aux", "高");
    addSegment(model, a, c, "aux", "底面对角线");
    addSegment(model, b, d, "aux", "底面对角线");
  }
  addFace(model, `平面${a}${b}${c}${d}`, [a, b, c, d]);
  addFace(model, `平面${apex}${a}${b}`, [apex, a, b]);
  addFace(model, `平面${apex}${b}${c}`, [apex, b, c]);
  addFace(model, `平面${apex}${c}${d}`, [apex, c, d]);
  addFace(model, `平面${apex}${d}${a}`, [apex, d, a]);
  addRelation(model, `底面${a}${b}${c}${d} 为正方形`);
  addRelation(model, `${apex}O ⟂ 平面${a}${b}${c}${d}`);
  return model;
}

function createTriangleModel(text) {
  const nameMatch = text.match(/(?:三角形|△)([A-Z][0-9]?)([A-Z][0-9]?)([A-Z][0-9]?)/);
  const [a, b, c] = nameMatch ? [nameMatch[1], nameMatch[2], nameMatch[3]] : ["A", "B", "C"];
  const lengths = parseLengthMap(text);
  const ab = getLength(lengths, [`${a}${b}`, `${b}${a}`], 3);
  const bc = getLength(lengths, [`${b}${c}`, `${c}${b}`], 2.4);
  const ac = getLength(lengths, [`${a}${c}`, `${c}${a}`], 2.4);

  const model = createBaseModel("triangle", "平面三角形模型", `${a}${b}=${formatNumber(ab)}，${b}${c}=${formatNumber(bc)}，${a}${c}=${formatNumber(ac)}。`);
  addPoint(model, a, 0, 0, 0, "顶点");
  addPoint(model, b, ab, 0, 0, "顶点");

  let cx;
  let cy;
  if (new RegExp(`${a}${b}垂直于?${b}${c}|${b}${c}垂直于?${a}${b}`).test(text)) {
    cx = ab;
    cy = bc;
  } else {
    cx = (ac * ac + ab * ab - bc * bc) / (2 * ab);
    cy = Math.sqrt(Math.max(ac * ac - cx * cx, 0.18));
  }
  addPoint(model, c, cx, cy, 0, "顶点");

  addSegment(model, a, b, "edge", "边");
  addSegment(model, b, c, "edge", "边");
  addSegment(model, c, a, "edge", "边");
  addFace(model, `三角形${a}${b}${c}`, [a, b, c]);
  addRelation(model, `${a}${b}=${formatNumber(ab)}`);
  addRelation(model, `${b}${c}=${formatNumber(bc)}`);
  addRelation(model, `${a}${c}=${formatNumber(ac)}`);
  return model;
}

function applyTextFeatures(model, text) {
  applyMidpoints(model, text);
  applyIntersections(model, text);
  applyCentroids(model, text);
  applyConnections(model, text);
  applyRelations(model, text);
}

function applyMidpoints(model, text) {
  const midpointRegex = /([A-Z][0-9]?)是([A-Z][0-9]?[A-Z][0-9]?)的中点/g;
  for (const match of text.matchAll(midpointRegex)) {
    const label = match[1];
    const endpoints = parseSegmentEndpoints(match[2]);
    if (!endpoints) continue;
    const [from, to] = endpoints;
    const p1 = model.points[from];
    const p2 = model.points[to];
    if (!p1 || !p2) continue;
    const point = midpoint(p1.position, p2.position);
    addPoint(model, label, point.x, point.y, point.z, `${from}${to} 的中点`);
    addRelation(model, `${label} 是 ${from}${to} 的中点`);
  }
}

function applyIntersections(model, text) {
  const intersectionRegex = /([A-Z][0-9]?)是([A-Z][0-9]?[A-Z][0-9]?)和([A-Z][0-9]?[A-Z][0-9]?)的交点/g;
  for (const match of text.matchAll(intersectionRegex)) {
    const label = match[1];
    const first = parseSegmentEndpoints(match[2]);
    const second = parseSegmentEndpoints(match[3]);
    if (!first || !second) continue;
    const points = [model.points[first[0]], model.points[first[1]], model.points[second[0]], model.points[second[1]]];
    if (points.some((point) => !point)) continue;
    const midOne = midpoint(points[0].position, points[1].position);
    const midTwo = midpoint(points[2].position, points[3].position);
    const point = midpoint(midOne, midTwo);
    addPoint(model, label, point.x, point.y, point.z, `${match[2]} 与 ${match[3]} 的交点`);
    addSegment(model, first[0], first[1], "aux", "交点辅助线");
    addSegment(model, second[0], second[1], "aux", "交点辅助线");
    addRelation(model, `${label} 是 ${match[2]} 和 ${match[3]} 的交点`);
  }
}

function applyCentroids(model, text) {
  const centroidRegex = /([A-Z][0-9]?)是(?:三角形|△)?([A-Z][0-9]?)([A-Z][0-9]?)([A-Z][0-9]?)的重心/g;
  for (const match of text.matchAll(centroidRegex)) {
    const [, label, a, b, c] = match;
    const points = [model.points[a], model.points[b], model.points[c]];
    if (points.some((point) => !point)) continue;
    const position = {
      x: (points[0].position.x + points[1].position.x + points[2].position.x) / 3,
      y: (points[0].position.y + points[1].position.y + points[2].position.y) / 3,
      z: (points[0].position.z + points[1].position.z + points[2].position.z) / 3,
    };
    addPoint(model, label, position.x, position.y, position.z, `三角形${a}${b}${c} 的重心`);
    addRelation(model, `${label} 是 三角形${a}${b}${c} 的重心`);
  }
}

function applyConnections(model, text) {
  const connectionRegex = /(?:连接|连结|作|画出?)((?:[A-Z][0-9]?[A-Z][0-9]?)(?:[、,，和及\s]*(?:[A-Z][0-9]?[A-Z][0-9]?))*)/g;
  for (const match of text.matchAll(connectionRegex)) {
    const tokens = match[1].match(/[A-Z][0-9]?[A-Z][0-9]?/g) || [];
    tokens.forEach((token) => {
      const endpoints = parseSegmentEndpoints(token);
      if (!endpoints) return;
      const [from, to] = endpoints;
      if (model.points[from] && model.points[to]) {
        addSegment(model, from, to, "connection", "题目连线");
        addRelation(model, `连接 ${from}${to}`);
      }
    });
  }
}

function applyRelations(model, text) {
  const linePlaneRegex = /([A-Z][0-9]?[A-Z][0-9]?)垂直于?平面([A-Z0-9]+)/g;
  for (const match of text.matchAll(linePlaneRegex)) {
    const endpoints = parseSegmentEndpoints(match[1]);
    if (!endpoints) continue;
    addRelation(model, `${match[1]} ⟂ 平面${match[2]}`);
    addSegment(model, endpoints[0], endpoints[1], "aux", "垂直关系");
  }

  const perpendicularRegex = /([A-Z][0-9]?[A-Z][0-9]?)(?:垂直于?|⊥)([A-Z][0-9]?[A-Z][0-9]?)/g;
  for (const match of text.matchAll(perpendicularRegex)) {
    addRelation(model, `${match[1]} ⟂ ${match[2]}`);
    const first = parseSegmentEndpoints(match[1]);
    const second = parseSegmentEndpoints(match[2]);
    if (first) addSegment(model, first[0], first[1], "aux", "垂直关系");
    if (second) addSegment(model, second[0], second[1], "aux", "垂直关系");
  }

  const parallelRegex = /([A-Z][0-9]?[A-Z][0-9]?)(?:平行于?|\/\/)([A-Z][0-9]?[A-Z][0-9]?)/g;
  for (const match of text.matchAll(parallelRegex)) {
    addRelation(model, `${match[1]} ∥ ${match[2]}`);
    const first = parseSegmentEndpoints(match[1]);
    const second = parseSegmentEndpoints(match[2]);
    if (first) addSegment(model, first[0], first[1], "aux", "平行关系");
    if (second) addSegment(model, second[0], second[1], "aux", "平行关系");
  }
}

function addBoxEdges(model, bottom, top) {
  for (let i = 0; i < 4; i += 1) {
    addSegment(model, bottom[i], bottom[(i + 1) % 4], "edge", "棱");
    addSegment(model, top[i], top[(i + 1) % 4], "edge", "棱");
    addSegment(model, bottom[i], top[i], "edge", "棱");
  }
}

function addPoint(model, label, x, y, z, role = "点") {
  model.points[label] = {
    id: `point:${label}`,
    label,
    role,
    position: { x, y, z },
  };
}

function addSegment(model, from, to, kind = "edge", note = "") {
  if (!model.points[from] || !model.points[to] || from === to) return;
  const key = segmentKey(from, to);
  const existing = model.segments.find((segment) => segment.key === key);
  if (existing) {
    if (existing.kind === "aux" && kind !== "aux") existing.kind = kind;
    if (note && !existing.note.includes(note)) existing.note = [existing.note, note].filter(Boolean).join("，");
    return;
  }
  model.segments.push({
    id: `line:${key}`,
    key,
    from,
    to,
    label: `${from}${to}`,
    kind,
    note,
  });
}

function addFace(model, label, vertices) {
  if (vertices.some((vertex) => !model.points[vertex])) return;
  model.faces.push({
    id: `face:${label}`,
    label,
    vertices,
  });
}

function addRelation(model, text) {
  if (!text || model.relations.includes(text)) return;
  model.relations.push(text);
}

function selectModelMeasurement() {
  if (!state.currentModel) return;
  state.interactiveObjects.forEach((object) => setHighlight(object, false));
  const metrics = computeModelMetrics(state.currentModel);
  const parts = [`总表面积 ${formatNumber(metrics.totalFaceArea)}`];
  if (metrics.volume > 0) parts.push(`体积 ${formatNumber(metrics.volume)}`);
  else parts.push("平面图形体积为 0");
  dom.selectedBox.innerHTML = `<strong>${state.currentModel.title}</strong><span>${parts.join("，")}。</span>`;
  setActiveStep("inspect");
  if (window.matchMedia("(max-width: 820px)").matches) setMobilePanel("info");
}

function computeModelMetrics(model) {
  const totalFaceArea = (model.faces || []).reduce((sum, face) => sum + computeFaceArea(model, face), 0);
  return {
    totalFaceArea,
    volume: computeModelVolume(model),
  };
}

function computeFaceArea(model, face) {
  const points = (face.vertices || []).map((label) => model.points[label]?.position).filter(Boolean);
  if (points.length < 3) return 0;
  const origin = toVector3(points[0]);
  let area = 0;
  for (let index = 1; index < points.length - 1; index += 1) {
    const a = toVector3(points[index]).sub(origin);
    const b = toVector3(points[index + 1]).sub(origin);
    area += a.cross(b).length() / 2;
  }
  return area;
}

function computeModelVolume(model) {
  if (!model || model.type === "triangle") return 0;
  if (model.type === "cube" || model.type === "cuboid") {
    const bounds = computeBounds(model);
    return bounds.size.x * bounds.size.y * bounds.size.z;
  }
  if (model.type === "tri-pyramid" || model.type === "square-pyramid") {
    const baseFace = model.faces.find((face) => face.vertices.every((label) => Math.abs(model.points[label].position.z - model.points[face.vertices[0]].position.z) < 0.001));
    if (!baseFace) return 0;
    const baseArea = computeFaceArea(model, baseFace);
    const baseZ = model.points[baseFace.vertices[0]].position.z;
    const apex = Object.values(model.points).reduce((top, point) => (point.position.z > top.position.z ? point : top), Object.values(model.points)[0]);
    return (baseArea * Math.abs(apex.position.z - baseZ)) / 3;
  }
  return 0;
}

function buildModelEquations(model) {
  if (!model || !Object.keys(model.points || {}).length) return [];
  const bounds = computeBounds(model);
  const minZ = formatNumber(bounds.min.z);
  const maxZ = formatNumber(bounds.max.z);
  const equations = [`底面平面：z = ${minZ}`];

  if (Math.abs(bounds.max.z - bounds.min.z) > 0.001) {
    equations.push(`高度范围：${minZ} <= z <= ${maxZ}`);
  }

  const connection = model.segments.find((segment) => segment.kind === "connection");
  if (connection) equations.push(segmentParamEquation(model, connection, "轨迹方程"));

  const vertical = model.segments.find((segment) => {
    const from = model.points[segment.from]?.position;
    const to = model.points[segment.to]?.position;
    return from && to && Math.abs(from.x - to.x) < 0.001 && Math.abs(from.y - to.y) < 0.001 && Math.abs(from.z - to.z) > 0.001;
  });
  if (vertical) equations.push(segmentParamEquation(model, vertical, "高线方程"));

  const edge = model.segments.find((segment) => segment.kind === "edge");
  if (edge) equations.push(segmentParamEquation(model, edge, "边的参数方程"));

  return [...new Set(equations.filter(Boolean))].slice(0, 5);
}

function segmentParamEquation(model, segment, title) {
  const from = model.points[segment.from]?.position;
  const to = model.points[segment.to]?.position;
  if (!from || !to) return "";
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = to.z - from.z;
  return `${title} ${segment.label}：(x,y,z)=(${formatNumber(from.x)},${formatNumber(from.y)},${formatNumber(from.z)})+t(${formatNumber(dx)},${formatNumber(dy)},${formatNumber(dz)})，0<=t<=1`;
}

function parseGlobalLength(text, fallback) {
  const match = text.match(/(?:边长|棱长|底边长)(?:为|是|=)?(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : fallback;
}

function parseLengthMap(text) {
  const map = new Map();
  const chainRegex = /((?:[A-Z][0-9]?[A-Z][0-9]?=)+)(\d+(?:\.\d+)?)/g;
  for (const match of text.matchAll(chainRegex)) {
    const value = Number(match[2]);
    const segments = match[1].match(/[A-Z][0-9]?[A-Z][0-9]?/g) || [];
    segments.forEach((segment) => setLength(map, segment, value));
  }

  const directRegex = /([A-Z][0-9]?[A-Z][0-9]?)(?:=|长为|为)(\d+(?:\.\d+)?)/g;
  for (const match of text.matchAll(directRegex)) {
    setLength(map, match[1], Number(match[2]));
  }
  return map;
}

function setLength(map, segment, value) {
  const endpoints = parseSegmentEndpoints(segment);
  if (!endpoints) return;
  map.set(`${endpoints[0]}${endpoints[1]}`, value);
  map.set(`${endpoints[1]}${endpoints[0]}`, value);
}

function getLength(map, keys, fallback) {
  for (const key of keys) {
    if (map.has(key)) return map.get(key);
  }
  return fallback;
}

function parseSegmentEndpoints(token) {
  const endpoints = token.match(/[A-Z][0-9]?/g);
  return endpoints && endpoints.length === 2 ? endpoints : null;
}

function segmentKey(a, b) {
  return [a, b].sort((left, right) => left.localeCompare(right, "en")).join("-");
}

function midpoint(p1, p2) {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
    z: (p1.z + p2.z) / 2,
  };
}

function centerModelOnXY(model) {
  const bounds = computeBounds(model);
  const offsetX = (bounds.min.x + bounds.max.x) / 2;
  const offsetY = (bounds.min.y + bounds.max.y) / 2;
  Object.values(model.points).forEach((point) => {
    point.position.x -= offsetX;
    point.position.y -= offsetY;
  });
}

function renderModel(model) {
  clearGeneratedModel();
  state.currentModel = model;
  state.modelGroup = new THREE.Group();
  state.scene.add(state.modelGroup);

  const bounds = computeBounds(model);
  state.currentBounds = bounds;
  rebuildGridAndAxes(Math.max(bounds.size.x, bounds.size.y, bounds.size.z, 2) * 3.2);

  model.faces.forEach((face, index) => renderFace(model, face, index));
  model.segments.forEach((segment) => renderSegment(model, segment));
  Object.values(model.points).forEach((point) => renderPoint(point));
  applyAuxVisibility();

  renderModelInfo(model);
  renderElementList(model);
  setViewMode(state.pendingViewMode || inferViewModeFromModel(model), false);
  state.pendingViewMode = "";
  resetCameraToModel();
  dom.emptyState.classList.add("hide");
  setActiveStep("model");
  closeMobilePanel();
}

function renderFace(model, face, index) {
  const positions = face.vertices.map((label) => model.points[label].position);
  const area = computeFaceArea(model, face);
  const geometry = new THREE.BufferGeometry();
  const vertices = [];

  if (positions.length === 3) {
    positions.forEach((point) => vertices.push(point.x, point.y, point.z));
  } else if (positions.length === 4) {
    const order = [0, 1, 2, 0, 2, 3];
    order.forEach((item) => {
      const point = positions[item];
      vertices.push(point.x, point.y, point.z);
    });
  }

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: colors.face[index % colors.face.length],
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
    roughness: 0.72,
    metalness: 0,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData = {
    elementId: face.id,
    type: "face",
    label: face.label,
    detail: `${face.label}，由 ${face.vertices.join("、")} 构成，面积 ${formatNumber(area)}。`,
    baseColor: material.color.clone(),
    baseOpacity: material.opacity,
  };
  state.modelGroup.add(mesh);
  state.interactiveObjects.push(mesh);
}

function renderSegment(model, segment) {
  const from = model.points[segment.from].position;
  const to = model.points[segment.to].position;
  const start = toVector3(from);
  const end = toVector3(to);
  const length = start.distanceTo(end);
  const radius = segment.kind === "aux" ? 0.012 : 0.018;
  const material = new THREE.MeshStandardMaterial({
    color: segment.kind === "connection" ? colors.connection : segment.kind === "aux" ? colors.aux : colors.line,
    transparent: segment.kind === "aux",
    opacity: segment.kind === "aux" ? 0.56 : 1,
    roughness: 0.45,
  });
  const geometry = new THREE.CylinderGeometry(radius, radius, length, 14);
  const mesh = new THREE.Mesh(geometry, material);
  const midpointVector = start.clone().add(end).multiplyScalar(0.5);
  const direction = end.clone().sub(start).normalize();
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  mesh.position.copy(midpointVector);
  mesh.userData = {
    elementId: segment.id,
    type: "line",
    label: segment.label,
    detail: `${segment.label}，${segment.note || "线段"}，长度 ${formatNumber(length)}。`,
    baseColor: material.color.clone(),
    baseOpacity: material.opacity,
    aux: segment.kind === "aux",
    from: segment.from,
    to: segment.to,
  };
  state.modelGroup.add(mesh);
  state.interactiveObjects.push(mesh);
}

function renderPoint(point) {
  const geometry = new THREE.SphereGeometry(0.065, 24, 24);
  const material = new THREE.MeshStandardMaterial({
    color: point.role.includes("中点") || point.role.includes("中心") ? 0xf08b2f : colors.point,
    roughness: 0.38,
    metalness: 0.08,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(point.position.x, point.position.y, point.position.z);
  mesh.userData = {
    elementId: point.id,
    type: "point",
    label: `点 ${point.label}`,
    detail: `${point.role}，坐标 (${formatNumber(point.position.x)}, ${formatNumber(point.position.y)}, ${formatNumber(point.position.z)})。`,
    baseColor: material.color.clone(),
    baseOpacity: 1,
    pointLabel: point.label,
  };
  state.modelGroup.add(mesh);
  state.interactiveObjects.push(mesh);
  createLabel(point.label, mesh.position, "vertex-label", "model", point.id);
}

function createLabel(text, position, className, kind, elementId = "") {
  const el = document.createElement("div");
  el.className = className;
  el.textContent = text;
  dom.labelLayer.appendChild(el);
  state.labelItems.push({
    el,
    position: position.clone ? position.clone() : new THREE.Vector3(position.x, position.y, position.z),
    kind,
    elementId,
  });
}

function clearGeneratedModel() {
  if (state.modelGroup) {
    state.scene.remove(state.modelGroup);
    disposeObject(state.modelGroup);
    state.modelGroup = null;
  }
  if (state.measureGroup) {
    state.scene.remove(state.measureGroup);
    disposeObject(state.measureGroup);
    state.measureGroup = null;
  }
  state.interactiveObjects = [];
  state.currentModel = null;
  state.currentBounds = null;
  state.selectedElementId = null;
  state.measurePoints = [];
  state.labelItems
    .filter((item) => item.kind === "model")
    .forEach((item) => item.el.remove());
  state.labelItems = state.labelItems.filter((item) => item.kind !== "model");
  dom.emptyState.classList.remove("hide");
  dom.title.textContent = "等待生成";
  dom.summary.textContent = "选择示例或粘贴题目后生成图形。";
  dom.relationList.innerHTML = "";
  dom.equationList.innerHTML = "";
  dom.elementList.innerHTML = "";
  updateSelectedBox(null);
}

function disposeObject(object) {
  object.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
}

function renderModelInfo(model) {
  dom.title.textContent = model.title;
  dom.summary.textContent = model.description;
  dom.relationList.innerHTML = "";
  dom.equationList.innerHTML = "";
  model.relations.slice(0, 12).forEach((relation) => {
    const item = document.createElement("span");
    item.className = "relation-pill";
    item.textContent = relation;
    dom.relationList.appendChild(item);
  });
  (model.equations || buildModelEquations(model)).slice(0, 5).forEach((equation) => {
    const item = document.createElement("div");
    item.className = "equation-pill";
    item.textContent = equation;
    dom.equationList.appendChild(item);
  });
  dom.parseBadge.textContent = model.source === "ai" ? "DeepSeek 解析" : "本地规则解析";
  if (state.activeAssistMode === "steps") renderStudySteps(false);
}

function renderElementList(model) {
  const metrics = computeModelMetrics(model);
  const items = [
    {
      id: "measure:model",
      label: metrics.volume > 0 ? "整体体积" : "整体面积",
      meta: metrics.volume > 0 ? `体积 ${formatNumber(metrics.volume)}` : `面积 ${formatNumber(metrics.totalFaceArea)}`,
      type: "measure",
    },
    ...Object.values(model.points).map((point) => ({
      id: point.id,
      label: `点 ${point.label}`,
      meta: point.role,
      type: "point",
    })),
    ...model.segments.map((segment) => ({
      id: segment.id,
      label: `线段 ${segment.label}`,
      meta: segment.note || "线段",
      type: "line",
    })),
    ...model.faces.map((face) => ({
      id: face.id,
      label: face.label,
      meta: `面积 ${formatNumber(computeFaceArea(model, face))}`,
      type: "face",
    })),
  ];

  dom.elementList.innerHTML = "";
  items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "element-item";
    button.innerHTML = `
      <span><strong>${item.label}</strong><br><small>${item.meta}</small></span>
      <span class="type-dot type-${item.type}"></span>
    `;
    button.addEventListener("click", () => selectElement(item.id));
    dom.elementList.appendChild(button);
  });
}

function handlePointerDown(event) {
  if (!state.currentModel) return;
  const rect = dom.canvas.getBoundingClientRect();
  state.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  state.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  state.raycaster.setFromCamera(state.pointer, state.camera);
  const intersects = state.raycaster.intersectObjects(state.interactiveObjects, false);
  if (!intersects.length) return;
  const object = intersects[0].object;
  selectElement(object.userData.elementId);
}

function selectElement(elementId) {
  if (elementId === "measure:model") {
    selectModelMeasurement();
    return;
  }

  const objects = state.interactiveObjects.filter((object) => object.userData.elementId === elementId);
  if (!objects.length) return;

  state.interactiveObjects.forEach((object) => setHighlight(object, false));
  objects.forEach((object) => setHighlight(object, true));
  state.selectedElementId = elementId;
  updateSelectedBox(objects[0].userData);
  setActiveStep("inspect");

  if (state.measureMode && objects[0].userData.type === "point") {
    handleMeasurePoint(objects[0].userData.pointLabel);
  } else if (window.matchMedia("(max-width: 820px)").matches) {
    setMobilePanel("info");
  }
}

function setHighlight(object, active) {
  const { material, userData } = object;
  if (!material || !userData.baseColor) return;
  material.color.copy(active ? new THREE.Color(colors.selected) : userData.baseColor);
  if ("opacity" in material) material.opacity = active ? Math.max(userData.baseOpacity, 0.88) : userData.baseOpacity;
  if (object.userData.type === "point") {
    object.scale.setScalar(active ? 1.45 : 1);
  }
}

function updateSelectedBox(data) {
  if (!data) {
    dom.selectedBox.innerHTML = "<strong>未选择</strong><span>点击模型中的点、线或面。</span>";
    return;
  }
  dom.selectedBox.innerHTML = `<strong>${data.label}</strong><span>${data.detail}</span>`;
}

function toggleMeasureMode() {
  if (!state.currentModel) {
    setStatus("请先生成图形");
    return;
  }
  state.measureMode = !state.measureMode;
  state.measurePoints = [];
  dom.measureBtn.classList.toggle("active", state.measureMode);
  setActiveStep("inspect");
  closeMobilePanel();
  setStatus(state.measureMode ? "测距：选择两个点" : "已退出测距");
}

function handleMeasurePoint(pointLabel) {
  if (!state.currentModel?.points[pointLabel]) return;
  if (state.measurePoints.includes(pointLabel)) return;
  state.measurePoints.push(pointLabel);
  if (state.measurePoints.length === 1) {
    setStatus(`已选择点 ${pointLabel}`);
    return;
  }

  const [first, second] = state.measurePoints;
  const p1 = toVector3(state.currentModel.points[first].position);
  const p2 = toVector3(state.currentModel.points[second].position);
  const distance = p1.distanceTo(p2);
  renderMeasureLine(p1, p2);
  state.measureMode = false;
  dom.measureBtn.classList.remove("active");
  state.measurePoints = [];
  const detail = `${first}${second} 距离 ${formatNumber(distance)}。`;
  dom.selectedBox.innerHTML = `<strong>测距结果</strong><span>${detail}</span>`;
  setActiveStep("output");
  if (window.matchMedia("(max-width: 820px)").matches) setMobilePanel("info");
  setStatus(detail);
}

function renderMeasureLine(p1, p2) {
  if (state.measureGroup) {
    state.scene.remove(state.measureGroup);
    disposeObject(state.measureGroup);
  }
  state.measureGroup = new THREE.Group();
  state.scene.add(state.measureGroup);

  const length = p1.distanceTo(p2);
  const geometry = new THREE.CylinderGeometry(0.024, 0.024, length, 16);
  const material = new THREE.MeshStandardMaterial({ color: colors.measure, roughness: 0.36 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
  mesh.position.copy(p1.clone().add(p2).multiplyScalar(0.5));
  state.measureGroup.add(mesh);
}

function applyAuxVisibility() {
  state.interactiveObjects.forEach((object) => {
    if (object.userData.aux) {
      object.visible = state.auxVisible;
    }
  });
}

function resetCameraToModel() {
  const bounds = state.currentBounds || {
    min: { x: -1, y: -1, z: 0 },
    max: { x: 1, y: 1, z: 1 },
    size: { x: 2, y: 2, z: 1 },
  };
  const center = new THREE.Vector3(
    (bounds.min.x + bounds.max.x) / 2,
    (bounds.min.y + bounds.max.y) / 2,
    (bounds.min.z + bounds.max.z) / 2,
  );
  const maxSize = Math.max(bounds.size.x, bounds.size.y, bounds.size.z, 1);
  updateCameraProjection(maxSize);

  if (state.viewMode === "2d") {
    state.orthographicCamera.up.set(0, 1, 0);
    state.orthographicCamera.position.set(center.x, center.y, center.z + maxSize * 3);
    state.orthographicCamera.lookAt(center);
  } else {
    state.perspectiveCamera.up.set(0, 0, 1);
    state.perspectiveCamera.position.set(center.x + maxSize * 1.6, center.y - maxSize * 2.1, center.z + maxSize * 1.35);
    state.perspectiveCamera.lookAt(center);
  }

  state.controls.target.copy(center);
  state.controls.update();
}

function exportScreenshot() {
  if (!state.currentModel) {
    setStatus("请先生成图形");
    return;
  }
  state.renderer.render(state.scene, state.camera);
  const link = document.createElement("a");
  link.download = "几何空间模型.png";
  link.href = dom.canvas.toDataURL("image/png");
  link.click();
  setActiveStep("output");
  setStatus("图片已导出");
}

function showParseError(error) {
  dom.title.textContent = "解析失败";
  dom.summary.textContent = `${error.message} 当前 MVP 优先支持常见正方体、长方体、三棱锥、四棱锥和三角形。`;
  dom.relationList.innerHTML = "";
  dom.equationList.innerHTML = "";
  updateProblemHints(dom.input.value, error.message);
  setMobilePanel("info");
  setStatus("解析失败，请换用更明确的题目描述");
}

function setStatus(text) {
  dom.statusText.textContent = text;
}

function setLoading(active) {
  document.body.classList.toggle("loading", active);
}

function computeBounds(model) {
  const values = Object.values(model.points).map((point) => point.position);
  const min = {
    x: Math.min(...values.map((point) => point.x)),
    y: Math.min(...values.map((point) => point.y)),
    z: Math.min(...values.map((point) => point.z)),
  };
  const max = {
    x: Math.max(...values.map((point) => point.x)),
    y: Math.max(...values.map((point) => point.y)),
    z: Math.max(...values.map((point) => point.z)),
  };
  return {
    min,
    max,
    size: {
      x: Math.max(max.x - min.x, 0.1),
      y: Math.max(max.y - min.y, 0.1),
      z: Math.max(max.z - min.z, 0.1),
    },
  };
}

function toVector3(point) {
  return new THREE.Vector3(point.x, point.y, point.z);
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return "--";
  const rounded = Math.round(value * 1000) / 1000;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function resizeRenderer() {
  const width = Math.max(dom.sceneWrap.clientWidth, 320);
  const height = Math.max(dom.sceneWrap.clientHeight, 360);
  state.renderer.setSize(width, height, false);
  updateCameraProjection();
}

function updateCameraProjection(modelSize = null) {
  const width = Math.max(dom.sceneWrap.clientWidth || 320, 320);
  const height = Math.max(dom.sceneWrap.clientHeight || 360, 360);
  const aspect = width / height;
  if (state.perspectiveCamera) {
    state.perspectiveCamera.aspect = aspect;
    state.perspectiveCamera.updateProjectionMatrix();
  }
  if (state.orthographicCamera) {
    const size = Math.max(modelSize || Math.max(state.currentBounds?.size.x || 2, state.currentBounds?.size.y || 2, 2), 2) * 1.55;
    state.orthographicCamera.left = (-size * aspect) / 2;
    state.orthographicCamera.right = (size * aspect) / 2;
    state.orthographicCamera.top = size / 2;
    state.orthographicCamera.bottom = -size / 2;
    state.orthographicCamera.near = 0.1;
    state.orthographicCamera.far = 1000;
    state.orthographicCamera.updateProjectionMatrix();
  }
}

function animate() {
  requestAnimationFrame(animate);
  state.controls.update();
  updateLabels();
  state.renderer.render(state.scene, state.camera);
}

function updateLabels() {
  const width = dom.sceneWrap.clientWidth;
  const height = dom.sceneWrap.clientHeight;
  state.labelItems.forEach((item) => {
    const projected = item.position.clone().project(state.camera);
    const visible = projected.z > -1 && projected.z < 1;
    item.el.style.display = visible ? "grid" : "none";
    if (!visible) return;
    const x = (projected.x * 0.5 + 0.5) * width;
    const y = (-projected.y * 0.5 + 0.5) * height;
    item.el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
  });
}

function buildDeepSeekPrompt(problemText) {
  return `你是几何题结构化解析器。请把题目解析为 JSON，字段包括 points、segments、faces、relations、equations、solidType。只输出 JSON。\n题目：${problemText}`;
}

async function requestDeepSeekParse(problemText) {
  return requestBackendParse(problemText);
}

window.GeometrySpaceAI = {
  provider: "deepseek",
  buildDeepSeekPrompt,
  requestDeepSeekParse,
};
