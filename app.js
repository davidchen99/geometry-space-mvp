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
    title: "圆台",
    meta: "根号 + 侧面积体积",
    text: "已知圆台O₁O，上底面圆心为O₁，半径r=1，下底面圆心为O，半径R=3。圆台的高O₁O=2√3，母线AB=4，其中A为上底面圆周上一点，B为下底面圆周上一点，且O₁A⊥O₁O，OB⊥O₁O，O₁A∥OB。求该圆台的侧面积和体积。",
  },
  {
    title: "圆柱",
    meta: "半径 + 高",
    text: "圆柱，底面圆心O，上底圆心O₁，半径=2，高O₁O=4，连接OO₁。",
  },
  {
    title: "球",
    meta: "半径 + 坐标",
    text: "球O，半径=3，A(3,0,0)，B(0,3,0)，C(0,0,3)。",
  },
  {
    title: "正四面体",
    meta: "棱长 + 点位",
    text: "正四面体ABCD，棱长=2。",
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
    title: "圆台侧面积体积",
    meta: "正常考试题写法 + 根号",
    text: "已知圆台O₁O，上底面圆心为O₁，半径r=1，下底面圆心为O，半径R=3。圆台的高O₁O=2√3，母线AB=4，其中A为上底面圆周上一点，B为下底面圆周上一点，且O₁A⊥O₁O，OB⊥O₁O，O₁A∥OB。求该圆台的侧面积和体积。",
  },
  {
    title: "圆柱半径高度",
    meta: "圆心 + 半径 + 高",
    text: "圆柱，底面圆心O，上底圆心O₁，半径=2，高O₁O=4，连接OO₁。",
  },
  {
    title: "圆锥底面和高",
    meta: "底面半径 + 顶点高度",
    text: "圆锥P-O，底面半径=2，高=3，连接PO。",
  },
  {
    title: "椭球面三半轴",
    meta: "二次曲面 + 半轴",
    text: "椭球面，a=3，b=2，c=1.5。",
  },
  {
    title: "直三棱柱",
    meta: "底面边长 + 高",
    text: "直三棱柱ABC-A₁B₁C₁，底面边长=2，高AA₁=3。",
  },
  {
    title: "长方体截面圆",
    meta: "组合图形 + 交线",
    text: "长方体ABCD-A₁B₁C₁D₁，AB=6，BC=4，AA₁=4。一个圆柱垂直穿过长方体，圆柱轴线经过上下底面中心，半径=1.5，显示圆柱与长方体上下底面的交线。",
  },
  {
    title: "显式坐标点",
    meta: "按坐标准确放置",
    text: "A(1,2,3)，B(4,2,3)，C(1,5,3)，连接AB、BC、CA。",
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
    detail: "三角形、圆、轨迹多用 2D；正方体、长方体、棱柱、棱锥和曲面体多用 3D。",
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
    detail: "圆柱、圆锥、圆台、球、椭球面、棱柱、棱锥都可以先写类型、点名和尺寸。",
  },
];

const dom = {
  appShell: document.querySelector("#appShell"),
  input: document.querySelector("#problemInput"),
  generateBtn: document.querySelector("#generateBtn"),
  completeBtn: document.querySelector("#completeBtn"),
  tipsBtn: document.querySelector("#tipsBtn"),
  samplesBtn: document.querySelector("#samplesBtn"),
  samplesPanel: document.querySelector("#samplesPanel"),
  tipsPanel: document.querySelector("#tipsPanel"),
  tipsList: document.querySelector("#tipsList"),
  tipsState: document.querySelector("#tipsState"),
  problemHints: document.querySelector("#problemHints"),
  clearBtn: document.querySelector("#clearBtn"),
  selectAllBtn: document.querySelector("#selectAllBtn"),
  choicePanel: document.querySelector("#choicePanel"),
  choiceState: document.querySelector("#choiceState"),
  choiceOptions: document.querySelector("#choiceOptions"),
  reviewPanel: document.querySelector("#reviewPanel"),
  reviewState: document.querySelector("#reviewState"),
  reviewContent: document.querySelector("#reviewContent"),
  reviewConfirmBtn: document.querySelector("#reviewConfirmBtn"),
  reviewEditBtn: document.querySelector("#reviewEditBtn"),
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
  detailsBtn: document.querySelector("#detailsBtn"),
  sceneWrap: document.querySelector("#sceneWrap"),
  canvas: document.querySelector("#sceneCanvas"),
  labelLayer: document.querySelector("#labelLayer"),
  emptyState: document.querySelector("#emptyState"),
  elementToast: document.querySelector("#elementToast"),
  elementToastTitle: document.querySelector("#elementToastTitle"),
  elementToastDetail: document.querySelector("#elementToastDetail"),
  elementDetailBtn: document.querySelector("#elementDetailBtn"),
  insightCloseBtn: document.querySelector("#insightCloseBtn"),
  userOpenBtn: document.querySelector("#userOpenBtn"),
  userEntryText: document.querySelector("#userEntryText"),
  authModal: document.querySelector("#authModal"),
  authCloseBtn: document.querySelector("#authCloseBtn"),
  authCloseBackdrop: document.querySelector("#authCloseBackdrop"),
  authReason: document.querySelector("#authReason"),
  displayNameInput: document.querySelector("#displayNameInput"),
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
  defaultStudentDailyLimitInput: document.querySelector("#defaultStudentDailyLimitInput"),
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
  adminInviteMonthlyLimit: document.querySelector("#adminInviteMonthlyLimit"),
  inviteSubmitBtn: document.querySelector("#inviteSubmitBtn"),
  inviteCancelEditBtn: document.querySelector("#inviteCancelEditBtn"),
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
  adminPasswordChangeRequired: false,
  activeStep: "input",
  activeAssistMode: "",
  helpMode: false,
  viewMode: "3d",
  pendingViewMode: "",
  choiceQuestion: null,
  choiceSignature: "",
  activeChoiceKey: "",
  choiceCache: {},
  pendingReviewContext: null,
  pendingAuthAction: null,
  pendingAuthMessage: "",
  editingInviteId: "",
  adminInvites: [],
  pointerDown: null,
  longPressTimer: null,
  longPressTriggered: false,
};

const colors = {
  point: 0xd9564a,
  line: 0x2266d1,
  connection: 0x0f8f8c,
  aux: 0x8a9298,
  face: [0xffb84d, 0x6fc0a7, 0x7a9cf5, 0xe87962, 0xa6a15d, 0x58a8b0],
  surface: [0x6fc0a7, 0x7a9cf5, 0xffb84d, 0xe87962, 0x8fc6df, 0xa6a15d],
  selected: 0xffb84d,
  measure: 0xf08b2f,
};

init();

function init() {
  initScene();
  initUI();
  registerServiceWorker();
  animate();
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // PWA registration is optional; the app should still run normally without it.
    });
  });
}

function initUI() {
  samples.slice(0, 3).forEach((sample, index) => {
    const button = document.createElement("button");
    button.className = "sample-button";
    button.type = "button";
    button.innerHTML = `<strong>${sample.title}</strong><span>${sample.meta}</span>`;
    button.addEventListener("click", () => {
      dom.input.value = sample.text;
      syncChoiceQuestion();
      setActiveStep("input");
      generateModel({ bypassAuth: true, skipReview: true });
    });
    if (index === 0) {
      dom.input.value = sample.text;
    }
    dom.sampleList.appendChild(button);
  });

  dom.generateBtn.addEventListener("click", () => generateModel());
  dom.completeBtn.addEventListener("click", completeProblemText);
  dom.tipsBtn.addEventListener("click", showInputTips);
  dom.samplesBtn.addEventListener("click", toggleSamplesPanel);
  dom.clearBtn.addEventListener("click", () => {
    dom.input.value = "";
    dom.input.focus();
    clearGeneratedModel();
    updateProblemHints("");
    syncChoiceQuestion();
    hideReviewPanel();
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
  dom.input.addEventListener("input", () => {
    updateProblemHints(dom.input.value);
    syncChoiceQuestion();
    hideReviewPanel();
  });

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
  dom.detailsBtn.addEventListener("click", () => {
    setMobilePanel(dom.appShell.dataset.mobilePanel === "info" ? "none" : "info");
    setActiveStep("inspect");
  });
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
  dom.userOpenBtn.addEventListener("click", () => openAuthModal());
  dom.authCloseBtn.addEventListener("click", closeAuthModal);
  dom.authCloseBackdrop.addEventListener("click", closeAuthModal);
  dom.registerBtn.addEventListener("click", () => submitAuth("register"));
  dom.userLoginBtn.addEventListener("click", () => submitAuth("login"));
  dom.elementDetailBtn.addEventListener("click", () => {
    setActiveStep("inspect");
    setMobilePanel("info");
  });
  dom.insightCloseBtn.addEventListener("click", () => {
    setMobilePanel("none");
    setActiveStep("model");
  });
  dom.reviewConfirmBtn.addEventListener("click", () => {
    const context = state.pendingReviewContext;
    hideReviewPanel();
    generateModel({ choiceKey: context?.optionKey || "", skipReview: true });
  });
  dom.reviewEditBtn.addEventListener("click", () => {
    dom.input.focus();
    setMobilePanel("input");
    setStatus("可以先修改题目，再生成");
  });

  dom.canvas.addEventListener("pointerdown", handlePointerDown);
  dom.canvas.addEventListener("pointermove", handlePointerMove);
  dom.canvas.addEventListener("pointerup", handlePointerUp);
  dom.canvas.addEventListener("pointercancel", clearPointerTracking);
  window.addEventListener("resize", resizeRenderer);

  initAdminUI();
  checkBackend();
  loadCurrentUser();
  recordVisit();
  renderHelpPanel();
  renderHistory();
  updateProblemHints(dom.input.value);
  syncChoiceQuestion();
  setMobilePanel(dom.appShell.dataset.mobilePanel || "none");
  window.lucide?.createIcons();
  generateModel({ bypassAuth: true, skipReview: true });
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
  dom.inviteForm.addEventListener("submit", saveInvite);
  dom.inviteCancelEditBtn.addEventListener("click", resetInviteForm);
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
  dom.detailsBtn?.classList.toggle("active", dom.appShell.dataset.mobilePanel === "info");
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
  if (state.axesGroup) {
    state.axesGroup.visible = nextMode !== "2d";
  }
  if (state.controls) {
    state.controls.enableRotate = nextMode !== "2d";
    state.controls.enablePan = true;
    state.controls.screenSpacePanning = nextMode === "2d";
    state.controls.mouseButtons.LEFT = nextMode === "2d" ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE;
    state.controls.mouseButtons.MIDDLE = THREE.MOUSE.DOLLY;
    state.controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
    state.controls.touches.ONE = nextMode === "2d" ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE;
    state.controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
  }
  if (reset) resetCameraToModel();
  setStatus(nextMode === "2d" ? "已切换到 2D 平面视图" : "已切换到 3D 空间视图");
}

function inferViewModeFromText(text) {
  const clean = normalizeText(text || "");
  if (/(正方体|长方体|三棱锥|三角锥|四面体|四棱锥|棱锥|棱柱|圆锥|圆柱|圆台|球|椭球面|椭球|双曲面|抛物面|柱面|二次曲面)/.test(clean)) return "3d";
  if (/(圆|椭圆|抛物线|双曲线|轨迹|动点|三角形|△)/.test(clean)) return "2d";
  return "3d";
}

function inferViewModeFromModel(model) {
  if (!model) return "3d";
  if (model.type === "triangle") return "2d";
  const bounds = computeBounds(model);
  return bounds.size.z < 0.2 ? "2d" : "3d";
}

function parseChoiceQuestion(rawText) {
  const raw = String(rawText || "").trim();
  if (!raw) return null;

  const lineChoice = parseLineChoiceQuestion(raw);
  if (lineChoice) return lineChoice;

  const markerRegex = /(?:^|[\s;；。:：])(?:[（(]\s*([A-Da-d])\s*[）)]|([A-Da-d])\s*[.．:：])\s*/g;
  const markers = [];
  let match;
  while ((match = markerRegex.exec(raw))) {
    const key = (match[1] || match[2] || "").toUpperCase();
    if (!key) continue;
    markers.push({
      key,
      index: match.index,
      contentStart: markerRegex.lastIndex,
    });
  }

  return buildChoiceQuestion(raw, markers);
}

function parseLineChoiceQuestion(raw) {
  const lines = raw.split(/\r?\n/);
  const markers = [];
  let cursor = 0;

  lines.forEach((line) => {
    const trimmed = line.trimStart();
    const leading = line.length - trimmed.length;
    const match = trimmed.match(/^(?:[（(]\s*([A-Da-d])\s*[）)]|([A-Da-d])\s*[.．、:：])\s*/);
    if (match) {
      markers.push({
        key: (match[1] || match[2]).toUpperCase(),
        index: cursor + leading,
        contentStart: cursor + leading + match[0].length,
      });
    }
    cursor += line.length + 1;
  });

  return buildChoiceQuestion(raw, markers);
}

function buildChoiceQuestion(raw, markers) {
  if (markers.length < 2) return null;

  const uniqueMarkers = [];
  const seen = new Set();
  markers
    .filter((item) => /[A-D]/.test(item.key))
    .forEach((item) => {
      if (seen.has(item.key)) return;
      seen.add(item.key);
      uniqueMarkers.push(item);
    });

  if (uniqueMarkers.length < 2) return null;
  uniqueMarkers.sort((a, b) => a.index - b.index);

  const options = uniqueMarkers
    .map((item, index) => {
      const next = uniqueMarkers[index + 1];
      const text = raw.slice(item.contentStart, next ? next.index : raw.length).trim();
      return {
        key: item.key,
        text,
      };
    })
    .filter((item) => item.text);

  if (options.length < 2) return null;
  const stem = raw.slice(0, uniqueMarkers[0].index).trim();
  if (!stem || stem.length < 6) return null;

  return {
    stem,
    options,
    signature: `${stem}\n${options.map((item) => `${item.key}:${item.text}`).join("\n")}`,
  };
}

function syncChoiceQuestion() {
  const choice = parseChoiceQuestion(dom.input.value);
  const signature = choice?.signature || "";

  if (signature !== state.choiceSignature) {
    state.choiceSignature = signature;
    state.activeChoiceKey = "";
    state.choiceCache = {};
  }

  state.choiceQuestion = choice;
  if (choice && state.activeChoiceKey && !choice.options.some((item) => item.key === state.activeChoiceKey)) {
    state.activeChoiceKey = "";
  }
  renderChoicePanel();
  return choice;
}

function renderChoicePanel() {
  if (!dom.choicePanel || !dom.choiceOptions) return;
  const choice = state.choiceQuestion;
  if (!choice) {
    dom.choicePanel.hidden = true;
    dom.choiceOptions.innerHTML = "";
    return;
  }

  dom.choicePanel.hidden = false;
  dom.choiceState.textContent = state.activeChoiceKey ? `当前 ${state.activeChoiceKey}` : "点选项看对应情况";
  dom.choiceOptions.innerHTML = "";

  choice.options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-option";
    button.classList.toggle("active", option.key === state.activeChoiceKey);
    if (state.choiceCache[option.key]) button.classList.add("ready");
    button.innerHTML = `
      <strong>${escapeHtml(option.key)}</strong>
      <span>${escapeHtml(truncateText(option.text, 34))}</span>
    `;
    button.addEventListener("click", () => chooseOption(option.key));
    dom.choiceOptions.appendChild(button);
  });
}

function truncateText(text, maxLength) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  return clean.length > maxLength ? `${clean.slice(0, maxLength)}...` : clean;
}

function chooseOption(key) {
  const choice = syncChoiceQuestion();
  if (!choice || !choice.options.some((item) => item.key === key)) return;
  state.activeChoiceKey = key;
  renderChoicePanel();

  const cached = state.choiceCache[key];
  if (cached?.model) {
    state.pendingViewMode = cached.viewMode || inferViewModeFromText(cached.problemText);
    renderModel(cached.model);
    setStatus(`已切换到 ${key} 选项`);
    return;
  }

  generateModel({ choiceKey: key });
}

function getProblemContext(choiceKey = "") {
  const raw = dom.input.value.trim();
  const choice = syncChoiceQuestion();
  if (!choice) {
    return {
      rawText: raw,
      problemText: raw,
      optionKey: "",
      optionText: "",
    };
  }

  const key = choiceKey || state.activeChoiceKey || choice.options[0]?.key || "";
  const option = choice.options.find((item) => item.key === key);
  if (!option) {
    return {
      rawText: raw,
      problemText: raw,
      optionKey: "",
      optionText: "",
    };
  }

  state.activeChoiceKey = key;
  renderChoicePanel();
  return {
    rawText: raw,
    problemText: `${choice.stem}\n按 ${key} 选项理解：${option.text}`,
    optionKey: key,
    optionText: option.text,
  };
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

function requireUser(message, action) {
  if (state.currentUser?.id) return true;
  state.pendingAuthAction = typeof action === "function" ? action : null;
  state.pendingAuthMessage = message || "生成题目前先登记手机号，用来控制调用额度。";
  openAuthModal(state.pendingAuthMessage);
  setStatus("请先登记手机号后继续");
  return false;
}

function openAuthModal(message = "") {
  dom.authModal.classList.add("open");
  dom.authModal.setAttribute("aria-hidden", "false");
  dom.authReason.textContent = message || "登记后可以生成题目，管理员能看到用量。";
  if (state.currentUser?.username) dom.displayNameInput.value = state.currentUser.username;
  if (state.currentUser?.phone) dom.phoneInput.value = state.currentUser.phone;
  (dom.displayNameInput.value ? dom.phoneInput : dom.displayNameInput).focus();
}

function closeAuthModal() {
  dom.authModal.classList.remove("open");
  dom.authModal.setAttribute("aria-hidden", "true");
}

async function submitAuth(mode) {
  const phone = dom.phoneInput.value.trim();
  const username = dom.displayNameInput.value.trim();
  if (mode === "register" && !username) {
    dom.authHint.textContent = "请先写一个用户名，方便老师或管理员识别。";
    return;
  }
  if (!phone) {
    dom.authHint.textContent = "请先输入手机号。";
    return;
  }
  dom.authHint.textContent = mode === "register" ? "正在登记..." : "正在登录...";
  try {
    const data = await apiFetch(mode === "register" ? "/api/auth/register" : "/api/auth/login", {
      method: "POST",
      body: {
        username,
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
    const action = state.pendingAuthAction;
    state.pendingAuthAction = null;
    state.pendingAuthMessage = "";
    if (action) window.setTimeout(action, 0);
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
  dom.userEntryText.textContent = state.currentUser?.username || (state.currentUser?.phone ? state.currentUser.phone.slice(-4) : "登录");
}

function openAdminModal() {
  dom.adminModal.classList.add("open");
  dom.adminModal.setAttribute("aria-hidden", "false");
  if (state.adminToken) {
    loadAdminDashboard().catch((error) => {
      if (error.message.includes("修改默认管理员密码")) {
        showAdminBoard();
        dom.passwordHint.textContent = "首次使用必须先把默认密码改掉。";
        dom.configHint.textContent = error.message;
        return;
      }
      showAdminLogin("登录已过期，请重新登录");
    });
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
    state.adminPasswordChangeRequired = Boolean(data.passwordChangeRequired);
    localStorage.setItem("geometry-space-admin-token", state.adminToken);
    showAdminBoard();
    fillAdminConfig(data.config);
    renderStats(data.stats);
    if (state.adminPasswordChangeRequired) {
      renderInvites([]);
      renderUserUsage([]);
      dom.passwordHint.textContent = "首次使用必须先修改默认管理员密码。";
      dom.configHint.textContent = "请先修改默认管理员密码，之后才能保存配置和查看完整后台。";
    } else {
      loadAdminDashboard().catch(() => {});
    }
    dom.adminLoginHint.textContent = state.adminPasswordChangeRequired ? "请先修改默认密码" : "登录成功";
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
  dom.defaultStudentDailyLimitInput.value = config.defaultStudentDailyLimit ?? 20;
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
        defaultStudentDailyLimit: Number(dom.defaultStudentDailyLimitInput.value),
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
        defaultStudentDailyLimit: Number(dom.defaultStudentDailyLimitInput.value),
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
    state.adminPasswordChangeRequired = false;
    dom.passwordHint.textContent = "密码已更新。";
    loadAdminDashboard().catch(() => {});
  } catch (error) {
    dom.passwordHint.textContent = error.message;
  }
}

async function saveInvite(event) {
  event.preventDefault();
  const editing = Boolean(state.editingInviteId);
  dom.inviteHint.textContent = editing ? "正在保存..." : "正在创建...";
  try {
    const data = await apiFetch(editing ? `/api/admin/invites/${encodeURIComponent(state.editingInviteId)}` : "/api/admin/invites", {
      method: editing ? "PUT" : "POST",
      headers: adminHeaders(),
      body: {
        code: dom.adminInviteCode.value.trim(),
        maxUses: Number(dom.adminInviteMaxUses.value || 30),
        dailyAiLimit: Number(dom.adminInviteDailyLimit.value || 20),
        monthlyTokenLimit: Number(dom.adminInviteMonthlyLimit.value || 100000),
      },
    });
    resetInviteForm();
    dom.inviteHint.textContent = editing ? `已保存：${data.invite.code}` : `已创建：${data.invite.code}`;
    await loadAdminDashboard();
  } catch (error) {
    dom.inviteHint.textContent = error.message;
  }
}

function resetInviteForm() {
  state.editingInviteId = "";
  dom.adminInviteCode.value = "";
  dom.adminInviteMaxUses.value = 30;
  dom.adminInviteDailyLimit.value = 20;
  dom.adminInviteMonthlyLimit.value = 100000;
  dom.inviteSubmitBtn.textContent = "创建邀请码";
  dom.inviteCancelEditBtn.hidden = true;
}

function renderInvites(invites) {
  state.adminInvites = invites;
  if (!invites.length) {
    dom.inviteList.innerHTML = '<div class="recent-item"><span>暂无邀请码</span></div>';
    return;
  }
  dom.inviteList.innerHTML = invites
    .slice(0, 10)
    .map(
      (item) => `
        <div class="recent-item invite-item">
          <div class="invite-row">
            <strong>${escapeHtml(item.code)}</strong>
            <div class="invite-actions">
              <button class="copy-button" type="button" data-copy-invite="${escapeHtml(item.code)}">复制</button>
              <button class="copy-button" type="button" data-edit-invite="${escapeHtml(item.id)}">编辑</button>
              <button class="copy-button danger" type="button" data-delete-invite="${escapeHtml(item.id)}">删除</button>
            </div>
          </div>
          <span>已用 ${item.usedCount || 0}/${item.maxUses || 0} · 每日 AI ${item.dailyAiLimit || 0} · 月 token ${item.monthlyTokenLimit || 0}</span>
        </div>
      `,
    )
    .join("");
  dom.inviteList.querySelectorAll("[data-copy-invite]").forEach((button) => {
    button.addEventListener("click", () => copyInviteCode(button.dataset.copyInvite || ""));
  });
  dom.inviteList.querySelectorAll("[data-edit-invite]").forEach((button) => {
    button.addEventListener("click", () => editInvite(button.dataset.editInvite || ""));
  });
  dom.inviteList.querySelectorAll("[data-delete-invite]").forEach((button) => {
    button.addEventListener("click", () => deleteInvite(button.dataset.deleteInvite || ""));
  });
}

function editInvite(id) {
  const invite = state.adminInvites.find((item) => item.id === id);
  if (!invite) return;
  state.editingInviteId = id;
  dom.adminInviteCode.value = invite.code || "";
  dom.adminInviteMaxUses.value = invite.maxUses || 30;
  dom.adminInviteDailyLimit.value = invite.dailyAiLimit || 20;
  dom.adminInviteMonthlyLimit.value = invite.monthlyTokenLimit || 100000;
  dom.inviteSubmitBtn.textContent = "保存邀请码";
  dom.inviteCancelEditBtn.hidden = false;
  dom.inviteHint.textContent = `正在编辑：${invite.code}`;
  dom.adminInviteCode.focus();
}

async function deleteInvite(id) {
  const invite = state.adminInvites.find((item) => item.id === id);
  if (!invite) return;
  if (!window.confirm(`确定删除邀请码 ${invite.code}？已登记用户不会被删除。`)) return;
  dom.inviteHint.textContent = "正在删除...";
  try {
    await apiFetch(`/api/admin/invites/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: adminHeaders(),
    });
    if (state.editingInviteId === id) resetInviteForm();
    dom.inviteHint.textContent = `已删除：${invite.code}`;
    await loadAdminDashboard();
  } catch (error) {
    dom.inviteHint.textContent = error.message;
  }
}

async function copyInviteCode(code) {
  if (!code) return;
  try {
    await navigator.clipboard.writeText(code);
  } catch {
    const input = document.createElement("input");
    input.value = code;
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }
  dom.inviteHint.textContent = `已复制：${code}`;
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
          <strong>${escapeHtml(user.username || user.phone || "")}</strong>
          <span>生成 ${user.usage?.generations || 0} · AI ${user.usage?.aiRequests || 0} / ${user.dailyAiLimit || 0}</span>
          <span>${escapeHtml(user.phone || "")} · ${escapeHtml(user.inviteCode || "无邀请码")}</span>
        </div>
      `,
    )
    .join("");
}

function updateProblemHints(text, extraMessage = "") {
  const hints = analyzeProblemText(text);
  const choice = parseChoiceQuestion(text);
  if (choice) {
    hints.unshift({
      level: "info",
      text: `检测到选择题：已识别 ${choice.options.map((item) => item.key).join("、")}，点选项可分别生成对应情况。`,
    });
  }
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

  const hasSupportedType = /(正方体|长方体|三棱锥|三角锥|四面体|正四面体|四棱锥|正四棱锥|棱锥|棱柱|圆柱|圆锥|圆台|球|椭球面|椭球|双曲面|抛物面|柱面|二次曲面|三角形|△)/.test(clean);
  const hasCurveType = /(椭圆|抛物线|双曲线|轨迹|动点)/.test(clean) || (/圆/.test(clean) && !/(圆柱|圆锥|圆台)/.test(clean));
  const hasSurfaceSolidType = /(球|圆锥|圆柱|圆台|椭球面|椭球|双曲面|抛物面|柱面|二次曲面)/.test(clean);

  if (hasCurveType) {
    hints.push({ level: "info", text: "检测到圆类或轨迹题，建议先用 2D 平面视图；本地规则不够时会尝试 AI 解析。" });
  }

  if (hasSurfaceSolidType) {
    hints.push({ level: "info", text: "检测到空间曲面或旋转体，系统会按题目给出的半径、高、半轴或点坐标生成 3D 模型。" });
  }

  if (!hasSupportedType && !hasCurveType) {
    hints.push({ level: "warn", text: "题目里最好先写清图形类型，例如正方体、棱柱、棱锥、圆柱、圆锥、球或椭球面。" });
  }

  const labels = clean.match(/[A-Z][0-9]?/g) || [];
  if (labels.length < 3) {
    hints.push({ level: "warn", text: "点名偏少，建议写出 A、B、C、P、A1 这类顶点标记。" });
  }

  if (!/(边长|棱长|底边长|半径|直径|高|高度|a|b|c|=|为)\d/.test(clean)) {
    hints.push({
      level: "info",
      text: hasCurveType || hasSurfaceSolidType
        ? "没有看到半径、直径、高或半轴；系统会用默认尺寸，想更准确可以写 半径=2、高=4 或 a=3,b=2,c=1。"
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

function toggleSamplesPanel() {
  dom.samplesPanel.hidden = !dom.samplesPanel.hidden;
  dom.tipsPanel.hidden = true;
  hideReviewPanel();
  setActiveStep("input");
  setMobilePanel("input");
  setStatus(dom.samplesPanel.hidden ? "已收起示例" : "已打开示例");
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
      syncChoiceQuestion();
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
  if (!requireUser("AI 解题步骤会消耗额度，请先登记手机号。", () => renderStudySteps(true))) return;
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
    `标出关键元素：${Object.keys(model.points).length} 个点、${model.segments.length} 条线、${model.faces.length} 个面、${model.curves?.length || 0} 条曲线、${model.surfaces?.length || 0} 个曲面。`,
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
  if (!requireUser("问答会调用 AI，请先登记手机号。", askQuestion)) return;

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
    curveCount: model.curves?.length || 0,
    surfaceCount: model.surfaces?.length || 0,
    relations: (model.relations || []).slice(0, 8),
    equations: (model.equations || buildModelEquations(model)).slice(0, 5),
  };
}

async function showInputTips() {
  const text = dom.input.value.trim();
  dom.tipsPanel.hidden = false;
  dom.samplesPanel.hidden = true;
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

async function completeProblemText() {
  const text = dom.input.value.trim();
  const result = organizeProblemText(text);
  dom.tipsPanel.hidden = true;
  dom.samplesPanel.hidden = true;
  setActiveStep("input");
  setMobilePanel("input");
  hideReviewPanel();
  if (result.text) {
    dom.input.value = result.text;
    updateProblemHints(dom.input.value, result.missing.length ? `还缺：${result.missing.join("、")}` : "");
    syncChoiceQuestion();
  } else {
    updateProblemHints("", "请先输入题目原文。");
  }
  dom.input.focus();
  setStatus(result.missing.length ? "已按原文整理，请补齐缺失项后再生成" : "已按原文整理，可直接生成");
  window.lucide?.createIcons();
}

function organizeProblemText(rawText) {
  const raw = String(rawText || "").trim();
  const normalized = normalizeText(raw);
  const shape = normalized.match(/正方体|长方体|正四面体|正三棱锥|三棱锥|三角锥|四面体|正四棱锥|四棱锥|棱锥|棱柱|圆柱|圆锥|圆台|球|椭球面|椭球|双曲面|抛物面|二次柱面|柱面|三角形|△|圆|椭圆|双曲线|抛物线|直线|轨迹/)?.[0] || "";
  const labels = Array.from(new Set(normalized.match(/[A-Z][0-9]?/g) || []));
  const seenLengths = new Set();
  const lengthEntries = Array.from(parseLengthMap(normalized).entries())
    .filter(([key]) => {
      const endpoints = parseSegmentEndpoints(key);
      const uniqueKey = endpoints ? segmentKey(endpoints[0], endpoints[1]) : key;
      if (seenLengths.has(uniqueKey)) return false;
      seenLengths.add(uniqueKey);
      return true;
    })
    .slice(0, 8);
  const relations = [];
  if (/垂直|⊥/.test(normalized)) relations.push("垂直");
  if (/平行|\/\//.test(normalized)) relations.push("平行");
  if (/中点/.test(normalized)) relations.push("中点");
  if (/交点/.test(normalized)) relations.push("交点");
  if (/连接|连结/.test(normalized)) relations.push("连接线");

  const missing = [];
  if (!raw) missing.push("请先输入题目原文");
  if (!shape) missing.push("图形类型");
  const isPyramidLike = /(三棱锥|三角锥|四面体|棱锥)/.test(shape);
  if (isPyramidLike && labels.length < 4) missing.push("顶点和底面点名");
  if (!isPyramidLike && labels.length < 3) missing.push("点名至少 3 个");
  if (isPyramidLike && !/-|－|—/.test(normalized) && !/(垂直于?|⊥)平面/.test(normalized)) {
    missing.push("顶点和底面点的对应关系");
  }
  if (!lengthEntries.length && !/(边长|棱长|半径|直径|长度|高|高度)/.test(normalized)) missing.push("长度或尺寸条件");
  if (!relations.length) missing.push("关键关系或需要连接的线段");

  const text = raw ? (/[。.!！?？]$/.test(raw) ? raw : `${raw}。`) : "";
  return {
    text,
    shape: shape || "未识别",
    labels,
    lengths: lengthEntries,
    relations,
    missing,
  };
}

function buildLocalTips(text) {
  const clean = String(text || "").trim();
  const tips = [];

  const matched = starterTips.filter((tip) => {
    if (!clean) return true;
    const normalized = normalizeText(clean);
    return (
      normalizeText(tip.title).includes(normalized.slice(0, 3)) ||
      normalizeText(tip.text).includes(normalized.slice(0, 3)) ||
      (/三角锥|三棱锥|四面体|棱锥/.test(normalized) && /三棱锥|四棱锥/.test(tip.text)) ||
      (/圆柱|圆锥|圆台|球|椭球|柱面|棱柱/.test(normalized) && /圆柱|圆锥|椭球|棱柱|坐标/.test(tip.text))
    );
  });
  const pool = matched.length ? matched : starterTips;
  pool.forEach((tip) => tips.push(tip));

  if (clean && normalizeText(clean).length >= 12) {
    tips.push({
      title: "整理当前题目",
      meta: "补齐图形、长度、关系、连线",
      text: clean.endsWith("。") || clean.endsWith(".") ? clean : `${clean}。`,
    });
  }

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
      syncChoiceQuestion();
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
  state.controls.enablePan = true;
  state.controls.touches.ONE = THREE.TOUCH.ROTATE;
  state.controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
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

async function generateModel(options = {}) {
  const context = getProblemContext(options.choiceKey || "");
  const text = context.problemText.trim();
  const historyText = context.rawText || text;
  if (!historyText) {
    setStatus("请先输入题目");
    updateProblemHints(historyText, "请先输入一道题，或者点 Tips 选一个模板。");
    return;
  }

  if (!options.bypassAuth && !requireUser("生成题目前先登记手机号，用来控制使用额度。", () => generateModel(options))) {
    return;
  }

  updateProblemHints(historyText);

  if (context.optionKey && state.choiceCache[context.optionKey]?.model) {
    const cached = state.choiceCache[context.optionKey];
    state.pendingViewMode = cached.viewMode || inferViewModeFromText(cached.problemText);
    renderModel(cached.model);
    setStatus(`已切换到 ${context.optionKey} 选项`);
    return;
  }

  state.pendingViewMode = inferViewModeFromText(text);
  setLoading(true);
  setActiveStep("parse");
  setStatus(context.optionKey ? `正在解析 ${context.optionKey} 选项...` : "正在解析题目...");

  try {
    await sleep(80);
    try {
      const model = buildModelFromText(text);
      model.source = "local";
      cacheChoiceModel(context, model);
      renderModel(model);
      setStatus(context.optionKey ? `已生成 ${context.optionKey} 选项：${model.title}` : `已生成 ${model.title}`);
      saveHistory({ text: historyText, title: formatHistoryTitle(model.title, context), source: "local", status: "success" });
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
      cacheChoiceModel(context, aiModel);
      renderModel(aiModel);
      setStatus(context.optionKey ? `DeepSeek 已生成 ${context.optionKey} 选项：${aiModel.title}` : `DeepSeek 已生成 ${aiModel.title}`);
      saveHistory({ text: historyText, title: formatHistoryTitle(aiModel.title, context), source: "ai", status: "success" });
      return;
    }
  } catch (error) {
    clearGeneratedModel();
    showParseError(error);
    setActiveStep("parse");
    saveHistory({ text: historyText, title: "解析失败", source: state.backendAvailable ? "ai" : "local", status: "failure", error: error.message });
    if (!state.backendAvailable) {
      recordUsage({ source: "local", success: false, text, error: error.message });
    }
  } finally {
    setLoading(false);
  }
}

function cacheChoiceModel(context, model) {
  if (!context.optionKey) return;
  state.choiceCache[context.optionKey] = {
    model,
    problemText: context.problemText,
    viewMode: state.pendingViewMode || inferViewModeFromModel(model),
  };
  renderChoicePanel();
}

function formatHistoryTitle(title, context) {
  return context.optionKey ? `${title} · ${context.optionKey}选项` : title;
}

function shouldReviewBeforeGenerate(context) {
  const clean = normalizeText(context.rawText || context.problemText || "");
  if (!clean) return false;
  if (context.optionKey || parseChoiceQuestion(context.rawText)) return true;
  if (/(圆|椭圆|双曲线|抛物线|轨迹|动点|方程|函数|参数|变量|求|证明)/.test(clean)) return true;
  if (clean.length > 90) return true;
  return analyzeProblemText(context.rawText).some((hint) => hint.level === "warn");
}

function renderProblemReview(context) {
  const summary = buildUnderstandingSummary(context);
  state.pendingReviewContext = context;
  dom.reviewPanel.hidden = false;
  dom.reviewState.textContent = summary.level;
  dom.reviewContent.innerHTML = `
    <div class="review-brief">${escapeHtml(summary.brief)}</div>
    <div class="review-grid">
      ${summary.items.map((item) => `<span><strong>${escapeHtml(item.label)}</strong>${escapeHtml(item.value)}</span>`).join("")}
    </div>
    <div class="review-preview">${escapeHtml(summary.preview)}</div>
  `;
  setActiveStep("parse");
  setMobilePanel("input");
  setStatus("复杂题已先整理理解，确认后再生成");
  window.lucide?.createIcons();
}

function hideReviewPanel() {
  if (!dom.reviewPanel) return;
  dom.reviewPanel.hidden = true;
  state.pendingReviewContext = null;
}

function buildUnderstandingSummary(context) {
  const raw = context.rawText || context.problemText || "";
  const clean = normalizeText(raw);
  const choice = parseChoiceQuestion(raw);
  const labels = Array.from(new Set(clean.match(/[A-Z][0-9]?/g) || [])).slice(0, 10);
  const lengths = Array.from(parseLengthMap(clean).entries()).slice(0, 6);
  const shape =
    clean.match(/正方体|长方体|正四面体|三棱锥|三角锥|四面体|四棱锥|正四棱锥|棱锥|棱柱|圆柱|圆锥|圆台|球|椭球面|椭球|双曲面|抛物面|二次柱面|柱面|三角形|圆|椭圆|双曲线|抛物线|直线|轨迹/)?.[0] || "待判断";
  const relations = [];
  if (/垂直|⊥/.test(clean)) relations.push("垂直");
  if (/平行|\/\//.test(clean)) relations.push("平行");
  if (/中点/.test(clean)) relations.push("中点");
  if (/交点/.test(clean)) relations.push("交点");
  if (/方程|=/.test(clean)) relations.push("方程/长度");

  const items = [
    { label: "图形：", value: shape },
    { label: "视图：", value: inferViewModeFromText(raw) === "2d" ? "2D 平面" : "3D 空间" },
    { label: "点名：", value: labels.length ? labels.join("、") : "未明确" },
    { label: "条件：", value: relations.length ? relations.join("、") : "未识别到特殊关系" },
  ];

  if (lengths.length) {
    items.push({ label: "长度：", value: lengths.map(([key, info]) => `${displayLabelText(key)}=${formatDimension(info)}`).join("、") });
  }
  if (choice) {
    items.push({ label: "选项：", value: choice.options.map((item) => item.key).join("、") });
  }
  if (context.optionKey) {
    items.push({ label: "当前：", value: `${context.optionKey}：${context.optionText}` });
  }

  return {
    level: choice || context.optionKey ? "选择题确认" : "复杂题确认",
    brief: context.optionKey ? `准备按 ${context.optionKey} 选项理解题目。` : "系统先把题目拆成图形、条件和视图，再生成模型。",
    items,
    preview: buildPreviewText(shape, relations, choice, context),
  };
}

function buildPreviewText(shape, relations, choice, context) {
  if (choice && !context.optionKey) return `简略图：题干 + ${choice.options.length} 个选项，点某个选项后会按该条件生成。`;
  if (/圆柱|圆锥|圆台|球|椭球面|椭球|双曲面|抛物面|柱面|棱柱/.test(shape)) return `简略图：优先用 3D 坐标系展示 ${shape}，按题目尺寸和显式坐标标点。`;
  if (/圆|椭圆|双曲线|抛物线|轨迹|直线/.test(shape)) return `简略图：优先用 2D 坐标系展示 ${shape}，再标出点、交点或轨迹。`;
  return `简略图：先生成 ${shape} 的主体，再叠加 ${relations.length ? relations.join("、") : "题目给出的"} 关系。`;
}

function buildModelFromText(rawText) {
  const text = normalizeText(rawText);
  let model;

  if (isCompositeGeometryText(text)) {
    model = createCompositeGeometryModel(text);
  } else if (/正方体/.test(text)) {
    model = createCubeModel(text);
  } else if (/长方体/.test(text)) {
    model = createCuboidModel(text);
  } else if (/正四面体/.test(text)) {
    model = createRegularTetrahedronModel(text);
  } else if (/二次柱面|椭圆柱面|双曲柱面|抛物柱面/.test(text)) {
    model = createQuadraticCylinderModel(text);
  } else if (/圆柱/.test(text)) {
    model = createCylinderModel(text);
  } else if (/圆锥/.test(text)) {
    model = createConeModel(text);
  } else if (/圆台/.test(text)) {
    model = createFrustumModel(text);
  } else if (/球|球面/.test(text) && !/椭球/.test(text)) {
    model = createSphereModel(text);
  } else if (/椭球面|椭球/.test(text)) {
    model = createEllipsoidModel(text);
  } else if (/双曲面/.test(text)) {
    model = createHyperboloidModel(text);
  } else if (/抛物面/.test(text)) {
    model = createParaboloidModel(text);
  } else if (/直.*棱柱|棱柱/.test(text)) {
    model = createPrismModel(text);
  } else if (/正五棱锥|正六棱锥|正棱锥/.test(text)) {
    model = createRegularPyramidModel(text);
  } else if (/三棱锥|三角锥|四面体|正三棱锥/.test(text)) {
    model = createTriPyramidModel(text);
  } else if (/四棱锥|正四棱锥/.test(text)) {
    model = createSquarePyramidModel(text);
  } else if (/棱锥/.test(text)) {
    model = createGenericPyramidModel(text);
  } else if (/三角形|△/.test(text)) {
    model = createTriangleModel(text);
  } else if (/(椭圆|双曲线|抛物线|圆|直线|方程|轨迹|动点)/.test(text) && !/(圆柱|圆锥|圆台|球|椭球面|椭球|双曲面|抛物面|柱面)/.test(text)) {
    model = createAnalytic2DModel(text);
  } else if (hasCoordinateInput(text)) {
    model = createCoordinateModel(text);
  } else {
    throw new Error("暂未识别该题型。");
  }

  applyExplicitCoordinates(model, text);
  applyTextFeatures(model, text);
  applyGivenLengthDisplays(model, text);
  if (!model.preserveCoordinates) centerModelOnXY(model);
  model.equations = model.equations?.length ? model.equations : buildModelEquations(model);
  model.source = "local";
  return model;
}

function normalizeText(text) {
  return text
    .replace(/\\\(|\\\)/g, "")
    .replace(/\\sqrt\{([^}]+)\}/g, "√$1")
    .replace(/\\(?:times|cdot)/g, "×")
    .replace(/\\div/g, "÷")
    .replace(/\\perp/g, "⊥")
    .replace(/\\parallel/g, "∥")
    .replace(/_(\d+)/g, "$1")
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (char) => "0123456789"["₀₁₂₃₄₅₆₇₈₉".indexOf(char)])
    .replace(/＝/g, "=")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/∥/g, "//")
    .replace(/[（〔［【]/g, "(")
    .replace(/[）〕］】]/g, ")")
    .replace(/[，、]/g, ",")
    .replace(/[；]/g, ";")
    .replace(/[：]/g, ":")
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
    curves: [],
    surfaces: [],
    relations: [],
    equations: [],
    dimensions: {},
  };
}

function createCubeModel(text) {
  const labels = parseBoxNotation(text, "正方体");
  const [a, b, c, d] = labels.bottom;
  const [a1, b1, c1, d1] = labels.top;
  const sideInfo = parseGlobalLengthInfo(text, 2);
  const side = sideInfo.value;
  const h = side;
  const model = createBaseModel("cube", "正方体模型", `边长 ${formatDimension(sideInfo)}，自动标注 8 个顶点。`);
  const half = side / 2;

  addPoint(model, a, -half, -half, 0, "底面顶点");
  addPoint(model, b, half, -half, 0, "底面顶点");
  addPoint(model, c, half, half, 0, "底面顶点");
  addPoint(model, d, -half, half, 0, "底面顶点");
  addPoint(model, a1, -half, -half, h, "上底顶点");
  addPoint(model, b1, half, -half, h, "上底顶点");
  addPoint(model, c1, half, half, h, "上底顶点");
  addPoint(model, d1, -half, half, h, "上底顶点");

  addBoxEdges(model, labels.bottom, labels.top);
  addFace(model, `平面${a}${b}${c}${d}`, labels.bottom);
  addFace(model, `平面${a1}${b1}${c1}${d1}`, labels.top);
  addFace(model, `平面${a}${b}${b1}${a1}`, [a, b, b1, a1]);
  addFace(model, `平面${b}${c}${c1}${b1}`, [b, c, c1, b1]);
  addFace(model, `平面${c}${d}${d1}${c1}`, [c, d, d1, c1]);
  addFace(model, `平面${d}${a}${a1}${d1}`, [d, a, a1, d1]);
  addRelation(model, `正方体边长 = ${formatDimension(sideInfo)}`);
  addRelation(model, `点位映射：底面 ${labels.bottom.join("、")}；上底 ${labels.top.join("、")}`);
  return model;
}

function createCuboidModel(text) {
  const labels = parseBoxNotation(text, "长方体");
  const [a, b, c, d] = labels.bottom;
  const [a1, b1, c1, d1] = labels.top;
  const lengths = parseLengthMap(text);
  const width = getLength(lengths, [`${a}${b}`, `${b}${a}`, `${a1}${b1}`, `${b1}${a1}`], 3);
  const depth = getLength(lengths, [`${b}${c}`, `${c}${b}`, `${a}${d}`, `${d}${a}`], 2);
  const height = getLength(lengths, [`${a}${a1}`, `${a1}${a}`, `${b}${b1}`, `${c}${c1}`, `${d}${d1}`], 2);
  const model = createBaseModel("cuboid", "长方体模型", `${a}${b}=${formatNumber(width)}，${b}${c}=${formatNumber(depth)}，${a}${a1}=${formatNumber(height)}。`);
  const x = width / 2;
  const y = depth / 2;

  addPoint(model, a, -x, -y, 0, "底面顶点");
  addPoint(model, b, x, -y, 0, "底面顶点");
  addPoint(model, c, x, y, 0, "底面顶点");
  addPoint(model, d, -x, y, 0, "底面顶点");
  addPoint(model, a1, -x, -y, height, "上底顶点");
  addPoint(model, b1, x, -y, height, "上底顶点");
  addPoint(model, c1, x, y, height, "上底顶点");
  addPoint(model, d1, -x, y, height, "上底顶点");

  addBoxEdges(model, labels.bottom, labels.top);
  addFace(model, `平面${a}${b}${c}${d}`, labels.bottom);
  addFace(model, `平面${a1}${b1}${c1}${d1}`, labels.top);
  addFace(model, `平面${a}${b}${b1}${a1}`, [a, b, b1, a1]);
  addFace(model, `平面${b}${c}${c1}${b1}`, [b, c, c1, b1]);
  addFace(model, `平面${c}${d}${d1}${c1}`, [c, d, d1, c1]);
  addFace(model, `平面${d}${a}${a1}${d1}`, [d, a, a1, d1]);
  addRelation(model, `${a}${b}=${formatNumber(width)}`);
  addRelation(model, `${b}${c}=${formatNumber(depth)}`);
  addRelation(model, `${a}${a1}=${formatNumber(height)}`);
  addRelation(model, `点位映射：底面 ${labels.bottom.join("、")}；上底 ${labels.top.join("、")}`);
  return model;
}

function parseBoxNotation(text, keyword) {
  const match = text.match(new RegExp(`${keyword}((?:[A-Z][0-9]?){4})[-－—]((?:[A-Z][0-9]?){4})`));
  if (match) {
    return {
      bottom: splitPointLabels(match[1]).slice(0, 4),
      top: splitPointLabels(match[2]).slice(0, 4),
    };
  }
  return {
    bottom: ["A", "B", "C", "D"],
    top: ["A1", "B1", "C1", "D1"],
  };
}

function createGenericPyramidModel(text) {
  const parsed = parsePyramidNotation(text);
  if (parsed?.base.length === 3) return createTriPyramidModel(text);
  if (parsed?.base.length === 4) return createSquarePyramidModel(text);
  throw new Error("请写清棱锥的顶点和底面点，例如 P-ABC 或 P-ABCD。");
}

function createTriPyramidModel(text) {
  const parsed = parsePyramidNotation(text, 3) || { apex: "P", base: ["A", "B", "C"], kind: "三棱锥" };
  const apex = parsed.apex;
  const [a, b, c] = parsed.base;
  const lengths = parseLengthMap(text);
  const baseData = buildTriangleBaseData(text, [a, b, c], lengths);
  const model = createBaseModel(
    "tri-pyramid",
    /四面体/.test(text) ? "四面体模型" : "三棱锥模型",
    `${apex}-${a}${b}${c} 已按底面 z=0 建系，顶点 ${apex} 放在底面上方。`,
  );

  addPoint(model, a, baseData.positions[a].x, baseData.positions[a].y, 0, "底面顶点");
  addPoint(model, b, baseData.positions[b].x, baseData.positions[b].y, 0, "底面顶点");
  addPoint(model, c, baseData.positions[c].x, baseData.positions[c].y, 0, "底面顶点");

  const foot = findLinePlaneFoot(text, apex, [a, b, c]) || (/(正三棱锥|正三角锥|底面中心|重心|中心|高)/.test(text) ? "O" : "");
  const footLabel = foot || "O";
  const footPosition = foot ? ensureBaseFootPoint(model, foot, [a, b, c]) : averagePointPosition(model, [a, b, c]);
  const defaultHeight = Math.max(1.1, Math.max(baseData.ab, baseData.bc, baseData.ac) * 0.85);
  const height = getLength(lengths, [`${apex}${footLabel}`, `${footLabel}${apex}`], parseNamedNumber(text, ["高", "高度"], defaultHeight));
  addPoint(model, apex, footPosition.x, footPosition.y, Math.max(height, 0.6), "顶点");

  addSegment(model, a, b, "edge", "底边");
  addSegment(model, b, c, "edge", "底边");
  addSegment(model, c, a, "edge", "底边");
  addSegment(model, apex, a, "edge", "侧棱");
  addSegment(model, apex, b, "edge", "侧棱");
  addSegment(model, apex, c, "edge", "侧棱");
  if (foot && model.points[foot]) addSegment(model, apex, foot, "aux", "高");
  addFace(model, `平面${a}${b}${c}`, [a, b, c]);
  addFace(model, `平面${apex}${a}${b}`, [apex, a, b]);
  addFace(model, `平面${apex}${b}${c}`, [apex, b, c]);
  addFace(model, `平面${apex}${c}${a}`, [apex, c, a]);
  if (baseData.rightAtB) addRelation(model, `${a}${b} ⟂ ${b}${c}`);
  if (/(正三棱锥|正三角锥|等边三角形|正三角形)/.test(text)) addRelation(model, `底面${a}${b}${c} 为等边三角形`);
  addRelation(model, `点位映射：${apex} 为顶点；${a}、${b}、${c} 为底面顶点`);
  addRelation(model, foot ? `${formatSegmentFromText(text, apex, foot)} ⟂ 平面${a}${b}${c}` : `${apex} 位于底面${a}${b}${c}上方`);
  return model;
}

function createSquarePyramidModel(text) {
  const parsed = parsePyramidNotation(text, 4) || { apex: "P", base: ["A", "B", "C", "D"], kind: "四棱锥" };
  const apex = parsed.apex;
  const [a, b, c, d] = parsed.base;
  const lengths = parseLengthMap(text);
  const width = getLength(lengths, [`${a}${b}`, `${b}${a}`, `${c}${d}`, `${d}${c}`], parseGlobalLength(text, 2));
  const depth = getLength(lengths, [`${b}${c}`, `${c}${b}`, `${a}${d}`, `${d}${a}`], /正四棱锥|正方形/.test(text) ? width : width);
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  const model = createBaseModel("square-pyramid", "四棱锥模型", `${apex}-${a}${b}${c}${d} 已按底面 z=0 建系，顶点 ${apex} 放在底面上方。`);

  addPoint(model, a, -halfWidth, -halfDepth, 0, "底面顶点");
  addPoint(model, b, halfWidth, -halfDepth, 0, "底面顶点");
  addPoint(model, c, halfWidth, halfDepth, 0, "底面顶点");
  addPoint(model, d, -halfWidth, halfDepth, 0, "底面顶点");
  if (/O/.test(text) || new RegExp(`${apex}O|O${apex}`).test(text)) {
    addPoint(model, "O", 0, 0, 0, "底面中心");
  }

  const foot = findLinePlaneFoot(text, apex, [a, b, c, d]) || (model.points.O ? "O" : "");
  const footLabel = foot || "O";
  const footPosition = foot ? ensureBaseFootPoint(model, foot, [a, b, c, d]) : averagePointPosition(model, [a, b, c, d]);
  const height = getLength(lengths, [`${apex}${footLabel}`, `${footLabel}${apex}`], parseNamedNumber(text, ["高", "高度"], Math.max(width, depth)));
  addPoint(model, apex, footPosition.x, footPosition.y, Math.max(height, 0.6), "顶点");

  addSegment(model, a, b, "edge", "底边");
  addSegment(model, b, c, "edge", "底边");
  addSegment(model, c, d, "edge", "底边");
  addSegment(model, d, a, "edge", "底边");
  addSegment(model, apex, a, "edge", "侧棱");
  addSegment(model, apex, b, "edge", "侧棱");
  addSegment(model, apex, c, "edge", "侧棱");
  addSegment(model, apex, d, "edge", "侧棱");
  if (foot && model.points[foot]) addSegment(model, apex, foot, "aux", "高");
  if (model.points.O) {
    addSegment(model, a, c, "aux", "底面对角线");
    addSegment(model, b, d, "aux", "底面对角线");
  }
  addFace(model, `平面${a}${b}${c}${d}`, [a, b, c, d]);
  addFace(model, `平面${apex}${a}${b}`, [apex, a, b]);
  addFace(model, `平面${apex}${b}${c}`, [apex, b, c]);
  addFace(model, `平面${apex}${c}${d}`, [apex, c, d]);
  addFace(model, `平面${apex}${d}${a}`, [apex, d, a]);
  addRelation(model, /正四棱锥|正方形/.test(text) ? `底面${a}${b}${c}${d} 为正方形` : `底面${a}${b}${c}${d} 位于 z=0`);
  addRelation(model, `点位映射：${apex} 为顶点；${a}、${b}、${c}、${d} 为底面顶点`);
  addRelation(model, foot ? `${formatSegmentFromText(text, apex, foot)} ⟂ 平面${a}${b}${c}${d}` : `${apex} 位于底面${a}${b}${c}${d}上方`);
  return model;
}

function createCylinderModel(text) {
  const radiusInfo = parseRadiusInfo(text, 2);
  const heightInfo = parseHeightInfo(text, 4);
  const radius = radiusInfo.value;
  const height = heightInfo.value;
  const radiusText = formatDimension(radiusInfo);
  const heightText = formatDimension(heightInfo);
  const bottomCenter = parseNamedLabel(text, ["底面圆心", "下底圆心"], "O");
  const topCenter = parseNamedLabel(text, ["上底圆心", "顶面圆心"], "O1");
  const model = createBaseModel("cylinder", "圆柱模型", `底面半径 ${radiusText}，高 ${heightText}。`);

  addPoint(model, bottomCenter, 0, 0, 0, "底面圆心");
  addPoint(model, topCenter, 0, 0, height, "上底圆心");
  addPoint(model, "A", radius, 0, 0, "底面圆上一点");
  addPoint(model, "A1", radius, 0, height, "上底圆上一点");
  setPointDisplayPosition(model, topCenter, { x: "0", y: "0", z: heightText });
  setPointDisplayPosition(model, "A", { x: radiusText, y: "0", z: "0" });
  setPointDisplayPosition(model, "A1", { x: radiusText, y: "0", z: heightText });
  addSegment(model, bottomCenter, topCenter, "aux", "轴线");
  addSegment(model, bottomCenter, "A", "aux", "底面半径");
  addSegment(model, "A", "A1", "edge", "母线");
  addCurve(model, "下底圆", circleCurve(radius, 0), `x^2+y^2=${formatNumber(radius * radius)}`);
  addCurve(model, "上底圆", circleCurve(radius, height), `x^2+y^2=${formatNumber(radius * radius)}, z=${heightText}`);
  addSurface(model, "圆柱侧面", makeParametricSurface(48, 12, (u, v) => {
    const angle = u * Math.PI * 2;
    return { x: radius * Math.cos(angle), y: radius * Math.sin(angle), z: v * height };
  }, true), `半径 ${radiusText}，高 ${heightText}`);
  addSurface(model, "圆柱下底面", makeDiskSurface(radius, 0, false), "底面圆盘");
  addSurface(model, "圆柱上底面", makeDiskSurface(radius, height, true), "上底圆盘");
  addRelation(model, `${bottomCenter}${topCenter} 为圆柱轴线`);
  addDefaultDimensionNotice(model, [radiusInfo, heightInfo]);
  model.dimensions = { radius, height };
  model.equations.push(`圆柱：x^2 + y^2 = ${formatNumber(radius * radius)}，0 <= z <= ${heightText}`);
  model.volume = Math.PI * radius * radius * height;
  return model;
}

function createConeModel(text) {
  const radiusInfo = parseRadiusInfo(text, 2);
  const heightInfo = parseHeightInfo(text, 3);
  const radius = radiusInfo.value;
  const height = heightInfo.value;
  const radiusText = formatDimension(radiusInfo);
  const heightText = formatDimension(heightInfo);
  const parsed = text.match(/圆锥([A-Z][0-9]?)[-－—]([A-Z][0-9]?)/);
  const apex = parsed?.[1] || "P";
  const center = parsed?.[2] || parseNamedLabel(text, ["底面圆心", "圆心"], "O");
  const model = createBaseModel("cone", "圆锥模型", `底面半径 ${radiusText}，高 ${heightText}。`);

  addPoint(model, center, 0, 0, 0, "底面圆心");
  addPoint(model, apex, 0, 0, height, "顶点");
  addPoint(model, "A", radius, 0, 0, "底面圆上一点");
  setPointDisplayPosition(model, apex, { x: "0", y: "0", z: heightText });
  setPointDisplayPosition(model, "A", { x: radiusText, y: "0", z: "0" });
  addSegment(model, center, apex, "aux", "高");
  addSegment(model, center, "A", "aux", "底面半径");
  addSegment(model, apex, "A", "edge", "母线");
  addCurve(model, "底面圆", circleCurve(radius, 0), `x^2+y^2=${formatNumber(radius * radius)}`);
  addSurface(model, "圆锥侧面", makeParametricSurface(48, 16, (u, v) => {
    const angle = u * Math.PI * 2;
    const currentRadius = radius * (1 - v);
    return { x: currentRadius * Math.cos(angle), y: currentRadius * Math.sin(angle), z: v * height };
  }, true), `底面半径 ${radiusText}，高 ${heightText}`);
  addSurface(model, "圆锥底面", makeDiskSurface(radius, 0, false), "底面圆盘");
  addRelation(model, `${apex}${center} ⟂ 底面圆`);
  addDefaultDimensionNotice(model, [radiusInfo, heightInfo]);
  model.dimensions = { radius, height };
  model.equations.push(`圆锥：x^2 + y^2 = (${formatNumber(radius / height)}(${heightText} - z))^2，0 <= z <= ${heightText}`);
  model.volume = (Math.PI * radius * radius * height) / 3;
  return model;
}

function createSphereModel(text) {
  const radiusInfo = parseRadiusInfo(text, 3);
  const radius = radiusInfo.value;
  const radiusText = formatDimension(radiusInfo);
  const center = parseNamedLabel(text, ["球心", "圆心"], text.match(/球([A-Z][0-9]?)/)?.[1] || "O");
  const model = createBaseModel("sphere", "球模型", `球心 ${displayLabelText(center)}，半径 ${radiusText}。`);

  addPoint(model, center, 0, 0, 0, "球心");
  addPoint(model, "A", radius, 0, 0, "球面点");
  addPoint(model, "B", 0, radius, 0, "球面点");
  addPoint(model, "C", 0, 0, radius, "球面点");
  setPointDisplayPosition(model, "A", { x: radiusText, y: "0", z: "0" });
  setPointDisplayPosition(model, "B", { x: "0", y: radiusText, z: "0" });
  setPointDisplayPosition(model, "C", { x: "0", y: "0", z: radiusText });
  addSegment(model, center, "A", "aux", "半径");
  addSegment(model, center, "B", "aux", "半径");
  addSegment(model, center, "C", "aux", "半径");
  addCurve(model, "赤道圆", circleCurve(radius, 0), `x^2+y^2=${formatNumber(radius * radius)}`);
  addCurve(model, "经线圆", sampleParametricCurve((t) => {
    const angle = t * Math.PI * 2;
    return { x: radius * Math.cos(angle), y: 0, z: radius * Math.sin(angle) };
  }, 112, true), "x-z 平面截圆");
  addSurface(model, "球面", makeParametricSurface(56, 24, (u, v) => {
    const theta = u * Math.PI * 2;
    const phi = v * Math.PI;
    return {
      x: radius * Math.sin(phi) * Math.cos(theta),
      y: radius * Math.sin(phi) * Math.sin(theta),
      z: radius * Math.cos(phi),
    };
  }, true), `半径 ${radiusText}`);
  addDefaultDimensionNotice(model, [radiusInfo]);
  model.dimensions = { radius };
  model.equations.push(`球面：x^2 + y^2 + z^2 = ${formatNumber(radius * radius)}`);
  model.volume = (4 * Math.PI * radius ** 3) / 3;
  return model;
}

function createFrustumModel(text) {
  const bottomInfo = parseRadiusInfo(text, 2.4, ["下底半径", "底面半径", "大半径", "R"]);
  const topInfo = parseRadiusInfo(text, 1.2, ["上底半径", "顶面半径", "小半径", "r"]);
  const heightInfo = parseHeightInfo(text, 3);
  const bottomRadius = Math.max(bottomInfo.value, topInfo.value);
  const topRadius = Math.min(bottomInfo.value, topInfo.value);
  const bottomText = bottomInfo.value >= topInfo.value ? formatDimension(bottomInfo) : formatDimension(topInfo);
  const topText = bottomInfo.value >= topInfo.value ? formatDimension(topInfo) : formatDimension(bottomInfo);
  const height = heightInfo.value;
  const heightText = formatDimension(heightInfo);
  const model = createBaseModel("frustum", "圆台模型", `下底半径 ${bottomText}，上底半径 ${topText}，高 ${heightText}。`);

  addPoint(model, "O", 0, 0, 0, "下底圆心");
  addPoint(model, "O1", 0, 0, height, "上底圆心");
  addPoint(model, "A", bottomRadius, 0, 0, "下底圆上一点");
  addPoint(model, "A1", topRadius, 0, height, "上底圆上一点");
  setPointDisplayPosition(model, "O1", { x: "0", y: "0", z: heightText });
  setPointDisplayPosition(model, "A", { x: bottomText, y: "0", z: "0" });
  setPointDisplayPosition(model, "A1", { x: topText, y: "0", z: heightText });
  addSegment(model, "O", "O1", "aux", "轴线");
  addSegment(model, "O", "A", "aux", "下底半径");
  addSegment(model, "O1", "A1", "aux", "上底半径");
  addSegment(model, "A", "A1", "edge", "母线");
  addCurve(model, "下底圆", circleCurve(bottomRadius, 0), `x^2+y^2=${formatNumber(bottomRadius * bottomRadius)}`);
  addCurve(model, "上底圆", circleCurve(topRadius, height), `x^2+y^2=${formatNumber(topRadius * topRadius)}`);
  addSurface(model, "圆台侧面", makeParametricSurface(48, 14, (u, v) => {
    const angle = u * Math.PI * 2;
    const currentRadius = bottomRadius + (topRadius - bottomRadius) * v;
    return { x: currentRadius * Math.cos(angle), y: currentRadius * Math.sin(angle), z: v * height };
  }, true), `下底 ${bottomText}，上底 ${topText}，高 ${heightText}`);
  addSurface(model, "圆台下底面", makeDiskSurface(bottomRadius, 0, false), "下底圆盘");
  addSurface(model, "圆台上底面", makeDiskSurface(topRadius, height, true), "上底圆盘");
  addDefaultDimensionNotice(model, [bottomInfo, topInfo, heightInfo]);
  model.dimensions = { bottomRadius, topRadius, height };
  model.equations.push(`圆台：r(z)=${bottomText}+(${formatNumber(topRadius - bottomRadius)}/${heightText})z，0 <= z <= ${heightText}`);
  model.volume = (Math.PI * height * (bottomRadius ** 2 + bottomRadius * topRadius + topRadius ** 2)) / 3;
  return model;
}

function createEllipsoidModel(text) {
  const aInfo = parseNamedNumberInfo(text, ["长半轴", "半轴a", "a"], 3, "a");
  const bInfo = parseNamedNumberInfo(text, ["短半轴", "半轴b", "b"], 2, "b");
  const cInfo = parseNamedNumberInfo(text, ["竖半轴", "半轴c", "c"], 1.5, "c");
  const a = aInfo.value;
  const b = bInfo.value;
  const c = cInfo.value;
  const model = createBaseModel("ellipsoid", "椭球面模型", `a=${formatDimension(aInfo)}，b=${formatDimension(bInfo)}，c=${formatDimension(cInfo)}。`);

  addPoint(model, "O", 0, 0, 0, "中心");
  addPoint(model, "A", a, 0, 0, "x轴端点");
  addPoint(model, "B", 0, b, 0, "y轴端点");
  addPoint(model, "C", 0, 0, c, "z轴端点");
  setPointDisplayPosition(model, "A", { x: formatDimension(aInfo), y: "0", z: "0" });
  setPointDisplayPosition(model, "B", { x: "0", y: formatDimension(bInfo), z: "0" });
  setPointDisplayPosition(model, "C", { x: "0", y: "0", z: formatDimension(cInfo) });
  addCurve(model, "赤道椭圆", sampleParametricCurve((t) => {
    const angle = t * Math.PI * 2;
    return { x: a * Math.cos(angle), y: b * Math.sin(angle), z: 0 };
  }, 112, true), "z=0 截面");
  addSurface(model, "椭球面", makeParametricSurface(56, 24, (u, v) => {
    const theta = u * Math.PI * 2;
    const phi = v * Math.PI;
    return {
      x: a * Math.sin(phi) * Math.cos(theta),
      y: b * Math.sin(phi) * Math.sin(theta),
      z: c * Math.cos(phi),
    };
  }, true), "三半轴椭球面");
  addDefaultDimensionNotice(model, [aInfo, bInfo, cInfo]);
  model.dimensions = { a, b, c };
  model.equations.push(`椭球面：x^2/${formatNumber(a * a)} + y^2/${formatNumber(b * b)} + z^2/${formatNumber(c * c)} = 1`);
  model.volume = (4 * Math.PI * a * b * c) / 3;
  return model;
}

function createHyperboloidModel(text) {
  const aInfo = parseNamedNumberInfo(text, ["实半轴a", "半轴a", "a"], 1.4, "a");
  const bInfo = parseNamedNumberInfo(text, ["实半轴b", "半轴b", "b"], 1.1, "b");
  const cInfo = parseNamedNumberInfo(text, ["虚半轴", "半轴c", "c"], 1.2, "c");
  const heightInfo = parseHeightInfo(text, 2.6);
  const a = aInfo.value;
  const b = bInfo.value;
  const c = cInfo.value;
  const height = heightInfo.value;
  const twoSheet = /双叶/.test(text);
  const model = createBaseModel(twoSheet ? "hyperboloid-two" : "hyperboloid-one", twoSheet ? "双叶双曲面模型" : "单叶双曲面模型", `a=${formatDimension(aInfo)}，b=${formatDimension(bInfo)}，c=${formatDimension(cInfo)}。`);

  addPoint(model, "O", 0, 0, 0, "中心");
  addPoint(model, "A", a, 0, 0, "参考点");
  addPoint(model, "C", 0, 0, c, "轴上点");
  if (twoSheet) {
    addSurface(model, "上叶双曲面", makeParametricSurface(48, 16, (u, v) => {
      const theta = u * Math.PI * 2;
      const z = c + height * v;
      const factor = Math.sqrt((z * z) / (c * c) - 1);
      return { x: a * factor * Math.cos(theta), y: b * factor * Math.sin(theta), z };
    }, true), "z 轴方向上叶");
    addSurface(model, "下叶双曲面", makeParametricSurface(48, 16, (u, v) => {
      const theta = u * Math.PI * 2;
      const z = -c - height * v;
      const factor = Math.sqrt((z * z) / (c * c) - 1);
      return { x: a * factor * Math.cos(theta), y: b * factor * Math.sin(theta), z };
    }, true), "z 轴方向下叶");
    model.equations.push(`双叶双曲面：z^2/${formatNumber(c * c)} - x^2/${formatNumber(a * a)} - y^2/${formatNumber(b * b)} = 1`);
  } else {
    addSurface(model, "单叶双曲面", makeParametricSurface(56, 22, (u, v) => {
      const theta = u * Math.PI * 2;
      const z = -height + 2 * height * v;
      const factor = Math.sqrt(1 + (z * z) / (c * c));
      return { x: a * factor * Math.cos(theta), y: b * factor * Math.sin(theta), z };
    }, true), "z 轴方向单叶");
    addCurve(model, "腰椭圆", sampleParametricCurve((t) => {
      const angle = t * Math.PI * 2;
      return { x: a * Math.cos(angle), y: b * Math.sin(angle), z: 0 };
    }, 112, true), "z=0 截面");
    model.equations.push(`单叶双曲面：x^2/${formatNumber(a * a)} + y^2/${formatNumber(b * b)} - z^2/${formatNumber(c * c)} = 1`);
  }
  addDefaultDimensionNotice(model, [aInfo, bInfo, cInfo, heightInfo]);
  model.dimensions = { a, b, c, height };
  return model;
}

function createParaboloidModel(text) {
  const aInfo = parseNamedNumberInfo(text, ["尺度a", "半轴a", "a"], 1.4, "a");
  const bInfo = parseNamedNumberInfo(text, ["尺度b", "半轴b", "b"], 1.2, "b");
  const heightInfo = parseHeightInfo(text, 3);
  const a = aInfo.value;
  const b = bInfo.value;
  const height = heightInfo.value;
  const saddle = /双曲抛物面|马鞍/.test(text);
  const model = createBaseModel(saddle ? "hyperbolic-paraboloid" : "elliptic-paraboloid", saddle ? "双曲抛物面模型" : "椭圆抛物面模型", saddle ? "按马鞍面 z=x^2/a^2-y^2/b^2 示意。" : "按 z=x^2/a^2+y^2/b^2 示意。");

  addPoint(model, "O", 0, 0, 0, "顶点");
  addPoint(model, "A", a, 0, saddle ? 1 : 1, "参考点");
  addSurface(model, saddle ? "双曲抛物面" : "椭圆抛物面", makeParametricSurface(28, 28, (u, v) => {
    const x = -a * 2 + a * 4 * u;
    const y = -b * 2 + b * 4 * v;
    const z = saddle ? (x * x) / (a * a) - (y * y) / (b * b) : ((x * x) / (a * a) + (y * y) / (b * b)) * (height / 8);
    return { x, y, z };
  }), saddle ? "马鞍面" : "开口向 z 轴正向");
  addDefaultDimensionNotice(model, [aInfo, bInfo, heightInfo]);
  model.dimensions = { a, b, height };
  model.equations.push(saddle
    ? `双曲抛物面：z = x^2/${formatNumber(a * a)} - y^2/${formatNumber(b * b)}`
    : `椭圆抛物面：z = (${formatNumber(height / 8)})(x^2/${formatNumber(a * a)} + y^2/${formatNumber(b * b)})`);
  return model;
}

function createQuadraticCylinderModel(text) {
  if (/双曲柱面/.test(text)) return createHyperbolicCylinderModel(text);
  if (/抛物柱面/.test(text)) return createParabolicCylinderModel(text);
  return createEllipticCylinderModel(text);
}

function createEllipticCylinderModel(text) {
  const aInfo = parseNamedNumberInfo(text, ["长半轴", "半轴a", "a"], 2, "a");
  const bInfo = parseNamedNumberInfo(text, ["短半轴", "半轴b", "b"], 1.2, "b");
  const heightInfo = parseHeightInfo(text, 4);
  const a = aInfo.value;
  const b = bInfo.value;
  const height = heightInfo.value;
  const model = createBaseModel("elliptic-cylinder", "椭圆柱面模型", `a=${formatNumber(a)}，b=${formatNumber(b)}，高 ${formatNumber(height)}。`);
  addPoint(model, "O", 0, 0, 0, "下底中心");
  addPoint(model, "O1", 0, 0, height, "上底中心");
  addSurface(model, "椭圆柱面", makeParametricSurface(48, 12, (u, v) => {
    const angle = u * Math.PI * 2;
    return { x: a * Math.cos(angle), y: b * Math.sin(angle), z: v * height };
  }, true), "沿 z 轴延展");
  addCurve(model, "底面椭圆", sampleParametricCurve((t) => {
    const angle = t * Math.PI * 2;
    return { x: a * Math.cos(angle), y: b * Math.sin(angle), z: 0 };
  }, 112, true), "z=0 截面");
  addDefaultDimensionNotice(model, [aInfo, bInfo, heightInfo]);
  model.equations.push(`椭圆柱面：x^2/${formatNumber(a * a)} + y^2/${formatNumber(b * b)} = 1`);
  return model;
}

function createHyperbolicCylinderModel(text) {
  const aInfo = parseNamedNumberInfo(text, ["实半轴", "半轴a", "a"], 1.4, "a");
  const bInfo = parseNamedNumberInfo(text, ["虚半轴", "半轴b", "b"], 1, "b");
  const heightInfo = parseHeightInfo(text, 4);
  const a = aInfo.value;
  const b = bInfo.value;
  const height = heightInfo.value;
  const model = createBaseModel("hyperbolic-cylinder", "双曲柱面模型", `a=${formatNumber(a)}，b=${formatNumber(b)}，高 ${formatNumber(height)}。`);
  ["右支柱面", "左支柱面"].forEach((label, branchIndex) => {
    const sign = branchIndex === 0 ? 1 : -1;
    addSurface(model, label, makeParametricSurface(24, 16, (u, v) => {
      const t = -1.4 + 2.8 * u;
      return { x: sign * a * Math.cosh(t), y: b * Math.sinh(t), z: v * height };
    }), "沿 z 轴延展");
  });
  addPoint(model, "O", 0, 0, 0, "中心");
  addDefaultDimensionNotice(model, [aInfo, bInfo, heightInfo]);
  model.equations.push(`双曲柱面：x^2/${formatNumber(a * a)} - y^2/${formatNumber(b * b)} = 1`);
  return model;
}

function createParabolicCylinderModel(text) {
  const pInfo = parseNamedNumberInfo(text, ["焦参数", "参数p", "p"], 1, "p");
  const heightInfo = parseHeightInfo(text, 4);
  const p = pInfo.value;
  const height = heightInfo.value;
  const model = createBaseModel("parabolic-cylinder", "抛物柱面模型", `p=${formatNumber(p)}，高 ${formatNumber(height)}。`);
  addPoint(model, "O", 0, 0, 0, "顶点线起点");
  addPoint(model, "O1", 0, 0, height, "顶点线终点");
  addSegment(model, "O", "O1", "aux", "顶点母线");
  addSurface(model, "抛物柱面", makeParametricSurface(30, 14, (u, v) => {
    const y = -3 * p + 6 * p * u;
    return { x: (y * y) / (4 * p), y, z: v * height };
  }), "沿 z 轴延展");
  addDefaultDimensionNotice(model, [pInfo, heightInfo]);
  model.equations.push(`抛物柱面：y^2 = ${formatNumber(4 * p)}x`);
  return model;
}

function createPrismModel(text) {
  const parsed = parsePrismNotation(text);
  const count = parsed?.bottom.length || parseChineseSideCount(text, 3);
  const sideInfo = parseNamedNumberInfo(text, ["底面边长", "边长", "棱长"], parseGlobalLength(text, 2), "底面边长");
  const heightInfo = parseHeightInfo(text, 3);
  const side = sideInfo.value;
  const height = heightInfo.value;
  const bottom = parsed?.bottom || defaultPolygonLabels(count);
  const top = parsed?.top || bottom.map((label) => `${label}1`);
  const radius = side / (2 * Math.sin(Math.PI / count));
  const basePoints = regularPolygonPoints(count, radius, 0);
  const model = createBaseModel("prism", `直${countText(count)}棱柱模型`, `${bottom.join("")}-${top.join("")}，底面边长 ${formatNumber(side)}，高 ${formatNumber(height)}。`);

  bottom.forEach((label, index) => addPoint(model, label, basePoints[index].x, basePoints[index].y, 0, "下底顶点"));
  top.forEach((label, index) => addPoint(model, label, basePoints[index].x, basePoints[index].y, height, "上底顶点"));
  for (let index = 0; index < count; index += 1) {
    addSegment(model, bottom[index], bottom[(index + 1) % count], "edge", "下底边");
    addSegment(model, top[index], top[(index + 1) % count], "edge", "上底边");
    addSegment(model, bottom[index], top[index], "edge", "侧棱");
    addFace(model, `平面${bottom[index]}${bottom[(index + 1) % count]}${top[(index + 1) % count]}${top[index]}`, [bottom[index], bottom[(index + 1) % count], top[(index + 1) % count], top[index]]);
  }
  addFace(model, `平面${bottom.join("")}`, bottom);
  addFace(model, `平面${top.join("")}`, top);
  addRelation(model, `点位映射：下底 ${bottom.join("、")}；上底 ${top.join("、")}`);
  addDefaultDimensionNotice(model, [sideInfo, heightInfo]);
  model.dimensions = { side, height, count };
  model.volume = polygonArea(count, radius) * height;
  return model;
}

function createRegularPyramidModel(text) {
  const count = parseChineseSideCount(text, 4);
  const parsed = parseRegularPyramidNotation(text, count);
  const sideInfo = parseNamedNumberInfo(text, ["底面边长", "边长", "棱长"], parseGlobalLength(text, 2), "底面边长");
  const heightInfo = parseHeightInfo(text, 2.8);
  const side = sideInfo.value;
  const height = heightInfo.value;
  const apex = parsed?.apex || "P";
  const base = parsed?.base || defaultPolygonLabels(count);
  const radius = side / (2 * Math.sin(Math.PI / count));
  const basePoints = regularPolygonPoints(count, radius, 0);
  const model = createBaseModel("regular-pyramid", `正${countText(count)}棱锥模型`, `${apex}-${base.join("")}，底面边长 ${formatNumber(side)}，高 ${formatNumber(height)}。`);

  base.forEach((label, index) => addPoint(model, label, basePoints[index].x, basePoints[index].y, 0, "底面顶点"));
  addPoint(model, apex, 0, 0, height, "顶点");
  addPoint(model, "O", 0, 0, 0, "底面中心");
  for (let index = 0; index < count; index += 1) {
    addSegment(model, base[index], base[(index + 1) % count], "edge", "底边");
    addSegment(model, apex, base[index], "edge", "侧棱");
    addFace(model, `平面${apex}${base[index]}${base[(index + 1) % count]}`, [apex, base[index], base[(index + 1) % count]]);
  }
  addSegment(model, apex, "O", "aux", "高");
  addFace(model, `平面${base.join("")}`, base);
  addRelation(model, `底面${base.join("")} 为正${countText(count)}形`);
  addRelation(model, `${apex}O ⟂ 平面${base.join("")}`);
  addRelation(model, `点位映射：${apex} 为顶点；${base.join("、")} 为底面顶点`);
  addDefaultDimensionNotice(model, [sideInfo, heightInfo]);
  model.dimensions = { side, height, count };
  model.volume = (polygonArea(count, radius) * height) / 3;
  return model;
}

function createRegularTetrahedronModel(text) {
  const labels = splitPointLabels(text.match(/正四面体((?:[A-Z][0-9]?){4})/)?.[1] || "").slice(0, 4);
  const [a, b, c, d] = labels.length === 4 ? labels : ["A", "B", "C", "D"];
  const sideInfo = parseNamedNumberInfo(text, ["棱长", "边长"], parseGlobalLength(text, 2), "棱长");
  const side = sideInfo.value;
  const half = side / 2;
  const baseY = -Math.sqrt(3) * side / 6;
  const apexHeight = Math.sqrt(2 / 3) * side;
  const model = createBaseModel("regular-tetrahedron", "正四面体模型", `${a}${b}${c}${d}，棱长 ${formatNumber(side)}。`);

  addPoint(model, a, -half, baseY, 0, "顶点");
  addPoint(model, b, half, baseY, 0, "顶点");
  addPoint(model, c, 0, Math.sqrt(3) * side / 3, 0, "顶点");
  addPoint(model, d, 0, 0, apexHeight, "顶点");
  [[a, b], [b, c], [c, a], [d, a], [d, b], [d, c]].forEach(([from, to]) => addSegment(model, from, to, "edge", "棱"));
  addFace(model, `平面${a}${b}${c}`, [a, b, c]);
  addFace(model, `平面${d}${a}${b}`, [d, a, b]);
  addFace(model, `平面${d}${b}${c}`, [d, b, c]);
  addFace(model, `平面${d}${c}${a}`, [d, c, a]);
  addRelation(model, `正四面体四个面均为等边三角形`);
  addRelation(model, `点位映射：${a}、${b}、${c} 为底面；${d} 为上方顶点`);
  addDefaultDimensionNotice(model, [sideInfo]);
  model.dimensions = { side };
  model.volume = side ** 3 / (6 * Math.sqrt(2));
  return model;
}

function isCompositeGeometryText(text) {
  if (!/(正方体|长方体)/.test(text)) return false;
  return /(圆柱|球|圆形|截面圆|多个圆|两个圆|圆[A-Z][0-9]?|三棱锥|三角锥|四棱锥|棱锥|四面体|多面体|相交|穿过|贯穿|截)/.test(text);
}

function createCompositeGeometryModel(text) {
  const model = /正方体/.test(text) ? createCubeModel(text) : createCuboidModel(text);
  const bounds = computeBounds(model);
  model.type = "composite";
  model.title = "组合几何模型";
  model.description = `${model.description} 已在同一坐标系中叠加其它形体并标出相交或截面部分。`;
  addRelation(model, "组合模型：所有形体共用同一三维坐标系。");

  addCompositePolyhedra(model, text, bounds);
  const hasCylinder = /圆柱/.test(text) || /穿过|贯穿/.test(text);
  const hasSphere = /球/.test(text) && !/椭球/.test(text);
  if (hasCylinder) addCompositeCylinder(model, text, bounds);
  if (hasSphere) addCompositeSphere(model, text, bounds);
  addCompositeCircles(model, text, bounds, hasCylinder || hasSphere);

  if ((model.curves || []).some((curve) => /交线|截面/.test(curve.label))) {
    addRelation(model, "相交或截面部分已用加粗曲线标出，半透明面表示对应圆面或曲面。");
  }
  return model;
}

function addCompositePolyhedra(model, text, bounds) {
  if (/四棱锥/.test(text)) {
    addCompositeSquarePyramid(model, text, bounds);
    return;
  }
  if (/三棱锥|三角锥|四面体|棱锥|多面体/.test(text)) {
    addCompositeTriPyramid(model, text, bounds);
  }
}

function addCompositeTriPyramid(model, text, bounds) {
  const parsed = parsePyramidNotation(text, 3);
  const preferred = parsed ? [parsed.apex, ...parsed.base] : ["P", "E", "F", "G"];
  const [apex, a, b, c] = allocateCompositeLabels(model, preferred, ["P", "E", "F", "G"]);
  const width = Math.max(Math.min(bounds.size.x, bounds.size.y) * 0.68, 1.2);
  const baseZ = bounds.min.z + bounds.size.z * 0.42;
  const apexZ = bounds.min.z + bounds.size.z * 0.95;
  const baseCenter = { x: 0, y: 0, z: baseZ };
  const points = {
    [a]: { x: -width / 2, y: -width * 0.28, z: baseZ },
    [b]: { x: width / 2, y: -width * 0.28, z: baseZ },
    [c]: { x: 0, y: width * 0.55, z: baseZ },
    [apex]: { x: 0, y: 0, z: apexZ },
  };

  Object.entries(points).forEach(([label, point]) => addPoint(model, label, point.x, point.y, point.z, label === apex ? "组合三棱锥顶点" : "组合三棱锥底面顶点"));
  [[a, b], [b, c], [c, a], [apex, a], [apex, b], [apex, c]].forEach(([from, to]) => addSegment(model, from, to, "edge", "组合三棱锥棱"));
  addFace(model, `组合平面${a}${b}${c}`, [a, b, c]);
  addFace(model, `组合平面${apex}${a}${b}`, [apex, a, b]);
  addFace(model, `组合平面${apex}${b}${c}`, [apex, b, c]);
  addFace(model, `组合平面${apex}${c}${a}`, [apex, c, a]);
  addSurface(model, "长方体与三棱锥相交高亮区", {
    vertices: [points[a], points[b], points[c]].map((point) => ({ ...point, z: point.z + 0.012 })),
    indices: [0, 1, 2],
  }, "用高亮三角形表示两个多面体的相交截面", { color: 0xff4f7b, opacity: 0.58 });
  addCurve(model, "三棱锥相交边界", [points[a], points[b], points[c], points[a]].map((point) => ({ ...point, z: point.z + 0.018 })), "相交区域边界");
  addRelation(model, `组合三棱锥 ${displayLabelText(apex)}-${displayLabelText(a)}${displayLabelText(b)}${displayLabelText(c)} 已完整显示点、棱和面。`);
  addRelation(model, "粉色高亮面表示长方体与三棱锥的相交参考区域。");
}

function addCompositeSquarePyramid(model, text, bounds) {
  const parsed = parsePyramidNotation(text, 4);
  const preferred = parsed ? [parsed.apex, ...parsed.base] : ["P", "E", "F", "G", "H"];
  const [apex, a, b, c, d] = allocateCompositeLabels(model, preferred, ["P", "E", "F", "G", "H"]);
  const width = Math.max(Math.min(bounds.size.x, bounds.size.y) * 0.64, 1.2);
  const baseZ = bounds.min.z + bounds.size.z * 0.38;
  const apexZ = bounds.min.z + bounds.size.z * 0.96;
  const half = width / 2;
  const points = {
    [a]: { x: -half, y: -half, z: baseZ },
    [b]: { x: half, y: -half, z: baseZ },
    [c]: { x: half, y: half, z: baseZ },
    [d]: { x: -half, y: half, z: baseZ },
    [apex]: { x: 0, y: 0, z: apexZ },
  };

  Object.entries(points).forEach(([label, point]) => addPoint(model, label, point.x, point.y, point.z, label === apex ? "组合四棱锥顶点" : "组合四棱锥底面顶点"));
  [[a, b], [b, c], [c, d], [d, a], [apex, a], [apex, b], [apex, c], [apex, d]].forEach(([from, to]) => addSegment(model, from, to, "edge", "组合四棱锥棱"));
  addFace(model, `组合平面${a}${b}${c}${d}`, [a, b, c, d]);
  addFace(model, `组合平面${apex}${a}${b}`, [apex, a, b]);
  addFace(model, `组合平面${apex}${b}${c}`, [apex, b, c]);
  addFace(model, `组合平面${apex}${c}${d}`, [apex, c, d]);
  addFace(model, `组合平面${apex}${d}${a}`, [apex, d, a]);
  addSurface(model, "长方体与四棱锥相交高亮区", {
    vertices: [points[a], points[b], points[c], points[d]].map((point) => ({ ...point, z: point.z + 0.012 })),
    indices: [0, 1, 2, 0, 2, 3],
  }, "用高亮四边形表示两个多面体的相交截面", { color: 0xff4f7b, opacity: 0.58 });
  addCurve(model, "四棱锥相交边界", [points[a], points[b], points[c], points[d], points[a]].map((point) => ({ ...point, z: point.z + 0.018 })), "相交区域边界");
  addRelation(model, `组合四棱锥 ${displayLabelText(apex)}-${displayLabelText(a)}${displayLabelText(b)}${displayLabelText(c)}${displayLabelText(d)} 已完整显示点、棱和面。`);
  addRelation(model, "粉色高亮面表示长方体与四棱锥的相交参考区域。");
}

function allocateCompositeLabels(model, preferred, fallback) {
  const used = new Set(Object.keys(model.points || {}));
  const allocated = [];
  const source = preferred.length === fallback.length ? preferred : fallback;
  source.forEach((label, index) => {
    const fallbackLabel = fallback[index] || label || `P${index + 1}`;
    const candidate = label && !used.has(label) && !allocated.includes(label) ? label : uniquePointLabel({ points: Object.fromEntries([...used, ...allocated].map((item) => [item, true])) }, fallbackLabel);
    allocated.push(candidate);
    used.add(candidate);
  });
  return allocated;
}

function addCompositeCylinder(model, text, bounds) {
  const radiusInfo = parseRadiusInfo(text, Math.min(bounds.size.x, bounds.size.y) / 4);
  const radius = radiusInfo.value;
  const radiusText = formatDimension(radiusInfo);
  const bottom = { x: 0, y: 0, z: bounds.min.z };
  const top = { x: 0, y: 0, z: bounds.max.z };
  const bottomLabel = uniquePointLabel(model, "O");
  const topLabel = uniquePointLabel(model, "O1");
  addPoint(model, bottomLabel, bottom.x, bottom.y, bottom.z, "圆柱下底圆心");
  addPoint(model, topLabel, top.x, top.y, top.z, "圆柱上底圆心");
  addSegment(model, bottomLabel, topLabel, "aux", "圆柱轴线");
  addCurve(model, "圆柱与下底面交线", circleCurveAt(radius, bottom), `半径 ${radiusText}`);
  addCurve(model, "圆柱与上底面交线", circleCurveAt(radius, top), `半径 ${radiusText}`);
  addSurface(model, "组合圆柱侧面", makeParametricSurface(48, 12, (u, v) => {
    const angle = u * Math.PI * 2;
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
      z: bottom.z + (top.z - bottom.z) * v,
    };
  }, true), `与长方体相交，半径 ${radiusText}`);
  addRelation(model, `圆柱半径 = ${radiusText}`);
}

function addCompositeSphere(model, text, bounds) {
  const radiusInfo = parseRadiusInfo(text, Math.min(bounds.size.x, bounds.size.y, bounds.size.z) / 3);
  const radius = radiusInfo.value;
  const radiusText = formatDimension(radiusInfo);
  const center = { x: 0, y: 0, z: (bounds.min.z + bounds.max.z) / 2 };
  const label = uniquePointLabel(model, "S");
  addPoint(model, label, center.x, center.y, center.z, "球心");
  addSurface(model, "组合球面", makeParametricSurface(48, 20, (u, v) => {
    const theta = u * Math.PI * 2;
    const phi = v * Math.PI;
    return {
      x: center.x + radius * Math.sin(phi) * Math.cos(theta),
      y: center.y + radius * Math.sin(phi) * Math.sin(theta),
      z: center.z + radius * Math.cos(phi),
    };
  }, true), `半径 ${radiusText}`);
  addCurve(model, "球与中截面交线", circleCurveAt(radius, center), `z=${formatNumber(center.z)} 截面`);
  addRelation(model, `球半径 = ${radiusText}`);
}

function addCompositeCircles(model, text, bounds, alreadyHasRoundSolid) {
  const labels = [];
  for (const match of text.matchAll(/(?:圆形|截面圆|圆)([A-Z][0-9]?)/g)) {
    if (match[1] && !labels.includes(match[1])) labels.push(match[1]);
  }
  if (/多个圆|两个圆/.test(text)) {
    ["O", "P"].forEach((label) => {
      if (!labels.includes(label)) labels.push(label);
    });
  }
  if (!labels.length && !alreadyHasRoundSolid && /圆形|截面圆|圆/.test(text)) labels.push("O");
  if (!labels.length) return;

  const radiusInfo = parseRadiusInfo(text, Math.min(bounds.size.x, bounds.size.y) / (labels.length > 1 ? 5 : 4));
  const radius = radiusInfo.value;
  const radiusText = formatDimension(radiusInfo);
  const z = /上底面|顶面|上表面/.test(text)
    ? bounds.max.z
    : /底面|下底面|下表面/.test(text)
      ? bounds.min.z
      : (bounds.min.z + bounds.max.z) / 2;
  const span = Math.max(bounds.size.x - radius * 2, radius * 2);

  labels.slice(0, 4).forEach((rawLabel, index, array) => {
    const label = uniquePointLabel(model, rawLabel);
    const offset = array.length === 1 ? 0 : -span / 2 + (span * index) / (array.length - 1);
    const center = { x: offset, y: 0, z };
    addPoint(model, label, center.x, center.y, center.z, "圆心");
    addCurve(model, `圆${displayLabelText(label)}截面交线`, circleCurveAt(radius, center), `半径 ${radiusText}`);
    addSurface(model, `圆${displayLabelText(label)}截面圆面`, makeDiskSurfaceAt(radius, center), `半径 ${radiusText}`);
  });
}

function uniquePointLabel(model, preferred) {
  if (!model.points[preferred]) return preferred;
  const base = preferred.replace(/\d+$/, "") || "P";
  for (let index = 1; index <= 9; index += 1) {
    const candidate = `${base}${index}`;
    if (!model.points[candidate]) return candidate;
  }
  return `${base}${Object.keys(model.points).length}`;
}

function parsePyramidNotation(text, baseCount = 0) {
  const expected = baseCount ? [baseCount] : [4, 3];
  for (const count of expected) {
    const shapePattern = count === 3 ? "正?三棱锥|三角锥|正三角锥" : "正?四棱锥";
    const explicit = text.match(new RegExp(`(?:${shapePattern})([A-Z][0-9]?)[-－—]((?:[A-Z][0-9]?){${count}})`));
    if (explicit) return { apex: explicit[1], base: splitPointLabels(explicit[2]).slice(0, count), kind: count === 3 ? "三棱锥" : "四棱锥" };

    const genericExplicit = text.match(new RegExp(`棱锥([A-Z][0-9]?)[-－—]((?:[A-Z][0-9]?){${count}})`));
    if (genericExplicit) return { apex: genericExplicit[1], base: splitPointLabels(genericExplicit[2]).slice(0, count), kind: "棱锥" };

    const compact = text.match(new RegExp(`(?:${shapePattern})((?:[A-Z][0-9]?){${count + 1}})`));
    if (compact) return compactPyramidMapping(text, splitPointLabels(compact[1]).slice(0, count + 1), count, count === 3 ? "三棱锥" : "四棱锥");

    const genericCompact = text.match(new RegExp(`棱锥((?:[A-Z][0-9]?){${count + 1}})`));
    if (genericCompact) return compactPyramidMapping(text, splitPointLabels(genericCompact[1]).slice(0, count + 1), count, "棱锥");
  }

  const tetraExplicit = text.match(/四面体([A-Z][0-9]?)[-－—]((?:[A-Z][0-9]?){3})/);
  if (tetraExplicit && (!baseCount || baseCount === 3)) {
    return { apex: tetraExplicit[1], base: splitPointLabels(tetraExplicit[2]).slice(0, 3), kind: "四面体" };
  }

  const tetra = text.match(/四面体((?:[A-Z][0-9]?){4})/);
  if (tetra && (!baseCount || baseCount === 3)) {
    const labels = splitPointLabels(tetra[1]).slice(0, 4);
    return compactPyramidMapping(text, labels, 3, "四面体");
  }
  return null;
}

function compactPyramidMapping(text, labels, baseCount, kind) {
  const relationMapping = inferPyramidMappingFromRelations(text, labels, baseCount);
  if (relationMapping) return { ...relationMapping, kind };
  const apexFirst = /^[PSV]$/.test(labels[0] || "");
  const apex = apexFirst ? labels[0] : labels[labels.length - 1];
  const base = apexFirst ? labels.slice(1, baseCount + 1) : labels.slice(0, baseCount);
  return { apex, base, kind };
}

function inferPyramidMappingFromRelations(text, labels, baseCount) {
  const labelSet = new Set(labels);
  const linePlaneRegex = /([A-Z][0-9]?[A-Z][0-9]?)(?:垂直于?|⊥)平面([A-Z0-9]+)/g;
  for (const match of text.matchAll(linePlaneRegex)) {
    const endpoints = parseSegmentEndpoints(match[1]);
    const planeLabels = splitPointLabels(match[2]).filter((label) => labelSet.has(label));
    if (!endpoints || planeLabels.length < baseCount) continue;
    const apex = endpoints.find((label) => labelSet.has(label) && !planeLabels.includes(label));
    if (!apex) continue;
    const base = labels.filter((label) => label !== apex && planeLabels.includes(label)).slice(0, baseCount);
    if (base.length === baseCount) return { apex, base };
  }
  return null;
}

function formatSegmentFromText(text, first, second) {
  if (text.includes(`${second}${first}`)) return `${second}${first}`;
  return `${first}${second}`;
}

function splitPointLabels(value) {
  return String(value || "").match(/[A-Z][0-9]?/g) || [];
}

function displayLabelText(value) {
  const subscripts = ["₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"];
  return String(value || "").replace(/\d/g, (digit) => subscripts[Number(digit)] || digit);
}

function buildTriangleBaseData(text, labels, lengths) {
  const [a, b, c] = labels;
  const side = parseGlobalLength(text, 1.8);
  const ab = getLength(lengths, [`${a}${b}`, `${b}${a}`], side);
  const bc = getLength(lengths, [`${b}${c}`, `${c}${b}`], /等边三角形|正三角形|正三棱锥|正三角锥/.test(text) ? ab : side);
  const ac = getLength(lengths, [`${a}${c}`, `${c}${a}`], /等边三角形|正三角形|正三棱锥|正三角锥/.test(text) ? ab : Math.max(ab, bc));
  const rightAtB = hasPerpendicularRelation(text, `${a}${b}`, `${b}${c}`);
  const positions = {
    [a]: { x: 0, y: 0 },
    [b]: { x: ab, y: 0 },
  };

  if (rightAtB) {
    positions[c] = { x: ab, y: bc };
  } else {
    const safeAb = Math.max(ab, 0.4);
    let cx = (ac * ac + safeAb * safeAb - bc * bc) / (2 * safeAb);
    let cy = Math.sqrt(Math.max(ac * ac - cx * cx, 0.36));
    if (!Number.isFinite(cx) || !Number.isFinite(cy)) {
      cx = safeAb / 2;
      cy = Math.max(bc, ac, safeAb) * 0.8;
    }
    positions[c] = { x: cx, y: cy };
  }
  return { positions, ab, bc, ac, rightAtB };
}

function hasPerpendicularRelation(text, first, second) {
  const a = first.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const b = second.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`${a}(?:垂直于?|⊥)${b}|${b}(?:垂直于?|⊥)${a}`).test(text);
}

function findLinePlaneFoot(text, apex, baseLabels) {
  const linePlaneRegex = /([A-Z][0-9]?[A-Z][0-9]?)(?:垂直于?|⊥)平面([A-Z0-9]+)/g;
  for (const match of text.matchAll(linePlaneRegex)) {
    const endpoints = parseSegmentEndpoints(match[1]);
    if (!endpoints || !endpoints.includes(apex)) continue;
    const planeLabels = splitPointLabels(match[2]);
    if (baseLabels.some((label) => !planeLabels.includes(label))) continue;
    return endpoints.find((label) => label !== apex) || "";
  }
  return "";
}

function ensureBaseFootPoint(model, foot, baseLabels) {
  if (model.points[foot]) return model.points[foot].position;
  const center = averagePointPosition(model, baseLabels);
  addPoint(model, foot, center.x, center.y, center.z, "底面垂足");
  return model.points[foot].position;
}

function averagePointPosition(model, labels) {
  const points = labels.map((label) => model.points[label]?.position).filter(Boolean);
  const count = Math.max(points.length, 1);
  return points.reduce(
    (sum, point) => ({
      x: sum.x + point.x / count,
      y: sum.y + point.y / count,
      z: sum.z + point.z / count,
    }),
    { x: 0, y: 0, z: 0 },
  );
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

function createAnalytic2DModel(text) {
  if (/椭圆/.test(text)) return createEllipseModel(text);
  if (/双曲线/.test(text)) return createHyperbolaModel(text);
  if (/抛物线/.test(text)) return createParabolaModel(text);
  if (/圆|轨迹|动点/.test(text)) return createCircleModel(text);
  return createLineModel(text);
}

function createCircleModel(text) {
  const radius = parseNamedNumber(text, ["半径", "r"], 2);
  const model = createBaseModel("circle", "圆的平面模型", `以 O 为圆心，半径 ${formatNumber(radius)}。`);
  addPoint(model, "O", 0, 0, 0, "圆心");
  addPoint(model, "A", radius, 0, 0, "圆上一点");
  addSegment(model, "O", "A", "aux", "半径");
  addCurve(model, "圆O", sampleParametricCurve((t) => {
    const angle = t * Math.PI * 2;
    return { x: radius * Math.cos(angle), y: radius * Math.sin(angle), z: 0 };
  }, 96, true), `x^2 + y^2 = ${formatNumber(radius * radius)}`);
  addRelation(model, `半径 r=${formatNumber(radius)}`);
  model.equations.push(`圆：x^2 + y^2 = ${formatNumber(radius * radius)}`);
  return model;
}

function createEllipseModel(text) {
  const a = parseNamedNumber(text, ["长半轴", "a"], 3);
  const b = parseNamedNumber(text, ["短半轴", "b"], 2);
  const model = createBaseModel("ellipse", "椭圆平面模型", `长半轴 ${formatNumber(a)}，短半轴 ${formatNumber(b)}。`);
  addPoint(model, "O", 0, 0, 0, "中心");
  addPoint(model, "A", a, 0, 0, "长轴端点");
  addPoint(model, "B", 0, b, 0, "短轴端点");
  addCurve(model, "椭圆", sampleParametricCurve((t) => {
    const angle = t * Math.PI * 2;
    return { x: a * Math.cos(angle), y: b * Math.sin(angle), z: 0 };
  }, 112, true), `x^2/${formatNumber(a * a)} + y^2/${formatNumber(b * b)} = 1`);
  addRelation(model, `a=${formatNumber(a)}，b=${formatNumber(b)}`);
  model.equations.push(`椭圆：x^2/${formatNumber(a * a)} + y^2/${formatNumber(b * b)} = 1`);
  return model;
}

function createParabolaModel(text) {
  const p = parseNamedNumber(text, ["焦参数", "p"], 1);
  const model = createBaseModel("parabola", "抛物线平面模型", `示意 y^2 = ${formatNumber(4 * p)}x。`);
  addPoint(model, "O", 0, 0, 0, "顶点");
  addPoint(model, "F", p, 0, 0, "焦点");
  addCurve(model, "抛物线", sampleRangeCurve(-3, 3, 90, (u) => ({ x: (u * u) / (4 * p), y: u, z: 0 })), `y^2 = ${formatNumber(4 * p)}x`);
  addRelation(model, `焦点 F(${formatNumber(p)},0)`);
  model.equations.push(`抛物线：y^2 = ${formatNumber(4 * p)}x`);
  return model;
}

function createHyperbolaModel(text) {
  const a = parseNamedNumber(text, ["实半轴", "a"], 2);
  const b = parseNamedNumber(text, ["虚半轴", "b"], 1.3);
  const model = createBaseModel("hyperbola", "双曲线平面模型", `示意 x^2/${formatNumber(a * a)} - y^2/${formatNumber(b * b)} = 1。`);
  addPoint(model, "O", 0, 0, 0, "中心");
  addPoint(model, "A", a, 0, 0, "右顶点");
  addPoint(model, "B", -a, 0, 0, "左顶点");
  addCurve(model, "双曲线右支", sampleRangeCurve(-1.35, 1.35, 70, (u) => ({ x: a * Math.cosh(u), y: b * Math.sinh(u), z: 0 })), "右支");
  addCurve(model, "双曲线左支", sampleRangeCurve(-1.35, 1.35, 70, (u) => ({ x: -a * Math.cosh(u), y: b * Math.sinh(u), z: 0 })), "左支");
  addRelation(model, `a=${formatNumber(a)}，b=${formatNumber(b)}`);
  model.equations.push(`双曲线：x^2/${formatNumber(a * a)} - y^2/${formatNumber(b * b)} = 1`);
  return model;
}

function createLineModel(text) {
  const slopeMatch = text.match(/k=?(-?\d+(?:\.\d+)?)/);
  const slope = slopeMatch ? Number(slopeMatch[1]) : 1;
  const interceptMatch = text.match(/b=?(-?\d+(?:\.\d+)?)/);
  const intercept = interceptMatch ? Number(interceptMatch[1]) : 0;
  const model = createBaseModel("line2d", "直线平面模型", `示意直线 y=${formatNumber(slope)}x+${formatNumber(intercept)}。`);
  addPoint(model, "A", -2.5, slope * -2.5 + intercept, 0, "直线上一点");
  addPoint(model, "B", 2.5, slope * 2.5 + intercept, 0, "直线上一点");
  addSegment(model, "A", "B", "edge", "直线示意");
  addRelation(model, `斜率 k=${formatNumber(slope)}`);
  model.equations.push(`直线：y=${formatNumber(slope)}x+${formatNumber(intercept)}`);
  return model;
}

function sampleParametricCurve(factory, count, closed = false) {
  const points = [];
  const max = closed ? count : count - 1;
  for (let index = 0; index < count; index += 1) {
    points.push(factory(index / max));
  }
  if (closed) points.push({ ...points[0] });
  return points;
}

function sampleRangeCurve(from, to, count, factory) {
  const points = [];
  for (let index = 0; index < count; index += 1) {
    const t = from + ((to - from) * index) / (count - 1);
    points.push(factory(t));
  }
  return points;
}

function circleCurve(radius, z = 0) {
  return circleCurveAt(radius, { x: 0, y: 0, z });
}

function circleCurveAt(radius, center = { x: 0, y: 0, z: 0 }, axis = "z") {
  return sampleParametricCurve((t) => {
    const angle = t * Math.PI * 2;
    if (axis === "x") return { x: center.x, y: center.y + radius * Math.cos(angle), z: center.z + radius * Math.sin(angle) };
    if (axis === "y") return { x: center.x + radius * Math.cos(angle), y: center.y, z: center.z + radius * Math.sin(angle) };
    return { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle), z: center.z };
  }, 112, true);
}

function makeParametricSurface(uSteps, vSteps, factory, closeU = false) {
  const vertices = [];
  const indices = [];
  for (let vIndex = 0; vIndex < vSteps; vIndex += 1) {
    const v = vSteps === 1 ? 0 : vIndex / (vSteps - 1);
    for (let uIndex = 0; uIndex < uSteps; uIndex += 1) {
      const u = closeU ? uIndex / uSteps : uIndex / Math.max(uSteps - 1, 1);
      vertices.push(factory(u, v));
    }
  }

  for (let vIndex = 0; vIndex < vSteps - 1; vIndex += 1) {
    for (let uIndex = 0; uIndex < uSteps; uIndex += 1) {
      if (!closeU && uIndex === uSteps - 1) continue;
      const nextU = (uIndex + 1) % uSteps;
      const a = vIndex * uSteps + uIndex;
      const b = vIndex * uSteps + nextU;
      const c = (vIndex + 1) * uSteps + uIndex;
      const d = (vIndex + 1) * uSteps + nextU;
      indices.push(a, c, b, b, c, d);
    }
  }
  return { vertices, indices };
}

function makeDiskSurface(radius, z, reverse = false, steps = 48) {
  const vertices = [{ x: 0, y: 0, z }];
  const indices = [];
  for (let index = 0; index < steps; index += 1) {
    const angle = (index / steps) * Math.PI * 2;
    vertices.push({ x: radius * Math.cos(angle), y: radius * Math.sin(angle), z });
  }
  for (let index = 1; index <= steps; index += 1) {
    const next = index === steps ? 1 : index + 1;
    if (reverse) indices.push(0, next, index);
    else indices.push(0, index, next);
  }
  return { vertices, indices };
}

function makeDiskSurfaceAt(radius, center = { x: 0, y: 0, z: 0 }, axis = "z", reverse = false, steps = 48) {
  const surface = makeDiskSurface(radius, 0, reverse, steps);
  surface.vertices = surface.vertices.map((point) => {
    if (axis === "x") return { x: center.x, y: center.y + point.x, z: center.z + point.y };
    if (axis === "y") return { x: center.x + point.x, y: center.y, z: center.z + point.y };
    return { x: center.x + point.x, y: center.y + point.y, z: center.z };
  });
  return surface;
}

function addCurve(model, label, points, note = "") {
  model.curves.push({
    id: `curve:${label}`,
    label,
    points,
    note,
  });
}

function addSurface(model, label, surfaceData, note = "", options = {}) {
  if (!surfaceData?.vertices?.length || !surfaceData?.indices?.length) return;
  model.surfaces.push({
    id: `surface:${label}`,
    label,
    vertices: surfaceData.vertices,
    indices: surfaceData.indices,
    note,
    color: options.color,
    opacity: options.opacity,
  });
}

function parseNamedNumber(text, names, fallback) {
  return parseNamedNumberInfo(text, names, fallback).value;
}

function parseNamedNumberInfo(text, names, fallback, label = names[0]) {
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = text.match(new RegExp(`${escaped}(?:为|是|=|:)?(${mathExpressionPattern()})`));
    if (match) {
      const parsed = parseMathExpression(match[1]);
      if (parsed) return { value: Math.abs(parsed.value) || fallback, display: parsed.display, explicit: true, label };
    }
  }
  return { value: fallback, display: formatNumber(fallback), explicit: false, label };
}

function parseRadiusInfo(text, fallback, names = ["底面半径", "半径", "r"]) {
  const radiusInfo = parseNamedNumberInfo(text, names, fallback, "半径");
  if (radiusInfo.explicit) return radiusInfo;
  const diameterInfo = parseNamedNumberInfo(text, ["直径", "d"], fallback * 2, "直径");
  if (diameterInfo.explicit) return { value: diameterInfo.value / 2, display: `${diameterInfo.display}/2`, explicit: true, label: "半径" };
  return radiusInfo;
}

function parseHeightInfo(text, fallback) {
  const named = parseNamedNumberInfo(text, ["高度", "高", "h"], fallback, "高");
  if (named.explicit) return named;
  const lengths = parseLengthMap(text);
  const segment = getLengthInfo(lengths, ["O1O", "OO1", "PO", "OP", "AA1", "A1A"]);
  return segment ? { ...segment, label: "高" } : named;
}

function mathExpressionPattern() {
  const atom = "(?:\\d+(?:\\.\\d+)?√\\d+(?:\\.\\d+)?|√\\d+(?:\\.\\d+)?|根号\\d+(?:\\.\\d+)?|\\d+(?:\\.\\d+)?|\\.\\d+)";
  return `-?${atom}(?:[+\\-*/]${atom})*`;
}

function parseMathExpression(rawExpression) {
  const raw = String(rawExpression || "").trim();
  if (!raw) return null;
  let display = raw
    .replace(/\*/g, "×")
    .replace(/\//g, "÷")
    .replace(/根号/g, "√");
  let js = raw
    .replace(/根号/g, "√")
    .replace(/(\d+(?:\.\d+)?)√(\d+(?:\.\d+)?)/g, "$1*Math.sqrt($2)")
    .replace(/√(\d+(?:\.\d+)?)/g, "Math.sqrt($1)");
  js = js.replace(/×/g, "*").replace(/÷/g, "/");
  if (!/^[0-9+\-*/().Mathsqrt\s]+$/.test(js)) return null;
  try {
    const value = Function(`"use strict"; return (${js});`)();
    if (!Number.isFinite(value)) return null;
    return { value, display };
  } catch {
    return null;
  }
}

function formatDimension(infoOrValue) {
  if (infoOrValue && typeof infoOrValue === "object" && "value" in infoOrValue) {
    return infoOrValue.explicit && infoOrValue.display ? infoOrValue.display : formatNumber(infoOrValue.value);
  }
  return formatNumber(infoOrValue);
}

function parseNamedLabel(text, names, fallback) {
  for (const name of names) {
    const match = text.match(new RegExp(`${name}([A-Z][0-9]?)`));
    if (match) return match[1];
  }
  return fallback;
}

function addDefaultDimensionNotice(model, infos) {
  const missing = infos.filter((item) => !item.explicit).map((item) => item.label);
  if (missing.length) addRelation(model, `未写清${[...new Set(missing)].join("、")}，已使用默认尺寸。`);
}

function parseChineseSideCount(text, fallback) {
  if (/六/.test(text)) return 6;
  if (/五/.test(text)) return 5;
  if (/四/.test(text)) return 4;
  if (/三/.test(text)) return 3;
  return fallback;
}

function countText(count) {
  return { 3: "三", 4: "四", 5: "五", 6: "六" }[count] || `${count}`;
}

function defaultPolygonLabels(count) {
  return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, count).split("");
}

function regularPolygonPoints(count, radius, z = 0) {
  const startAngle = -Math.PI / 2;
  return Array.from({ length: count }, (_, index) => {
    const angle = startAngle + (index * Math.PI * 2) / count;
    return { x: radius * Math.cos(angle), y: radius * Math.sin(angle), z };
  });
}

function polygonArea(count, radius) {
  return (count * radius * radius * Math.sin((Math.PI * 2) / count)) / 2;
}

function parsePrismNotation(text) {
  const match = text.match(/(?:直[三四五六]?棱柱|[三四五六]?棱柱)([A-Z0-9]+)[-－—]([A-Z0-9]+)/);
  if (!match) return null;
  const bottom = splitPointLabels(match[1]);
  const top = splitPointLabels(match[2]);
  if (bottom.length < 3 || bottom.length !== top.length) return null;
  return { bottom, top };
}

function parseRegularPyramidNotation(text, count) {
  const explicit = text.match(/正[三四五六]?棱锥([A-Z][0-9]?)[-－—]([A-Z0-9]+)/);
  if (explicit) {
    const base = splitPointLabels(explicit[2]).slice(0, count);
    if (base.length === count) return { apex: explicit[1], base };
  }
  const compact = text.match(/正[三四五六]?棱锥((?:[A-Z][0-9]?){4,8})/);
  if (compact) return compactPyramidMapping(text, splitPointLabels(compact[1]).slice(0, count + 1), count, "正棱锥");
  return null;
}

function hasCoordinateInput(text) {
  return parseCoordinateMap(text).size > 0;
}

function parseCoordinateMap(text) {
  const map = new Map();
  const coordinateRegex = new RegExp(`([A-Z][0-9]?)\\((${mathExpressionPattern()}),(${mathExpressionPattern()})(?:,(${mathExpressionPattern()}))?\\)`, "g");
  for (const match of text.matchAll(coordinateRegex)) {
    const x = parseMathExpression(match[2]);
    const y = parseMathExpression(match[3]);
    const z = match[4] === undefined ? { value: 0, display: "0" } : parseMathExpression(match[4]);
    if (!x || !y || !z) continue;
    map.set(match[1], {
      x: x.value,
      y: y.value,
      z: z.value,
      display: { x: x.display, y: y.display, z: z.display },
    });
  }
  return map;
}

function createCoordinateModel(text) {
  const coordinates = parseCoordinateMap(text);
  const model = createBaseModel("coordinate-points", "坐标点模型", "按题目给出的显式坐标放置点。");
  coordinates.forEach((point, label) => addPoint(model, label, point.x, point.y, point.z, "题目给定坐标"));
  addRelation(model, `已按题目给定坐标放置：${Array.from(coordinates.keys()).join("、")}`);
  model.preserveCoordinates = true;
  return model;
}

function applyExplicitCoordinates(model, text) {
  const coordinates = parseCoordinateMap(text);
  if (!coordinates.size) return;
  const entries = Array.from(coordinates.entries());
  const anchor = entries.find(([label]) => {
    const role = model.points[label]?.role || "";
    return /心|中心|圆心|球心/.test(role);
  }) || entries.find(([label]) => model.points[label]);

  if (anchor && model.points[anchor[0]]) {
    const current = model.points[anchor[0]].position;
    const target = anchor[1];
    const delta = { x: target.x - current.x, y: target.y - current.y, z: target.z - current.z };
    if (Math.abs(delta.x) > 0.001 || Math.abs(delta.y) > 0.001 || Math.abs(delta.z) > 0.001) {
      translateModelGeometry(model, delta);
    }
  }

  entries.forEach(([label, point]) => {
    if (model.points[label]) {
      model.points[label].position = { x: point.x, y: point.y, z: point.z };
      model.points[label].displayPosition = point.display;
      model.points[label].role = model.points[label].role.includes("题目给定坐标")
        ? model.points[label].role
        : `${model.points[label].role}，题目给定坐标`;
    } else {
      addPoint(model, label, point.x, point.y, point.z, "题目给定坐标");
      model.points[label].displayPosition = point.display;
    }
  });
  addRelation(model, `显式坐标优先：${entries.map(([label, point]) => `${label}(${formatNumber(point.x)},${formatNumber(point.y)},${formatNumber(point.z)})`).join("、")}`);
  model.preserveCoordinates = true;
}

function translateModelGeometry(model, delta) {
  Object.values(model.points || {}).forEach((point) => {
    point.position.x += delta.x;
    point.position.y += delta.y;
    point.position.z += delta.z;
  });
  (model.curves || []).forEach((curve) => {
    (curve.points || []).forEach((point) => {
      point.x += delta.x;
      point.y += delta.y;
      point.z += delta.z;
    });
  });
  (model.surfaces || []).forEach((surface) => {
    (surface.vertices || []).forEach((point) => {
      point.x += delta.x;
      point.y += delta.y;
      point.z += delta.z;
    });
  });
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

function setPointDisplayPosition(model, label, displayPosition) {
  if (!model.points[label]) return;
  model.points[label].displayPosition = displayPosition;
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

function applyGivenLengthDisplays(model, text) {
  const lengths = parseLengthMap(text);
  if (!lengths.size) return;
  (model.segments || []).forEach((segment) => {
    const info = getLengthInfo(lengths, [`${segment.from}${segment.to}`, `${segment.to}${segment.from}`]);
    if (!info) return;
    segment.displayLength = info.display;
    segment.givenLengthValue = info.value;
  });
}

function selectModelMeasurement() {
  if (!state.currentModel) return;
  state.interactiveObjects.forEach((object) => setHighlight(object, false));
  const metrics = computeModelMetrics(state.currentModel);
  const hasSurface = (state.currentModel.surfaces || []).length > 0;
  const parts = (state.currentModel.curves || []).length && !(state.currentModel.faces || []).length && !hasSurface
    ? [`曲线 ${state.currentModel.curves.length} 条`, "平面解析几何"]
    : [`总面积约 ${formatNumber(metrics.totalArea)}`];
  if (!((state.currentModel.curves || []).length && !(state.currentModel.faces || []).length && !hasSurface)) {
    if (metrics.volume > 0) parts.push(`体积 ${formatNumber(metrics.volume)}`);
    else parts.push("平面图形体积为 0");
  }
  const data = {
    label: state.currentModel.title,
    detail: `${parts.join("，")}。`,
    quick: parts.join(" · "),
    infoPosition: new THREE.Vector3(
      (state.currentBounds.min.x + state.currentBounds.max.x) / 2,
      (state.currentBounds.min.y + state.currentBounds.max.y) / 2,
      state.currentBounds.max.z,
    ),
  };
  dom.selectedBox.innerHTML = `<strong>${data.label}</strong><span>${data.detail}</span>`;
  showElementToast(data);
  showInlineInfoLabel(data);
  setActiveStep("inspect");
  if (window.matchMedia("(max-width: 820px)").matches) setMobilePanel("info");
}

function computeModelMetrics(model) {
  const totalFaceArea = (model.faces || []).reduce((sum, face) => sum + computeFaceArea(model, face), 0);
  const totalSurfaceArea = (model.surfaces || []).reduce((sum, surface) => sum + computeSurfaceArea(surface), 0);
  return {
    totalFaceArea,
    totalSurfaceArea,
    totalArea: totalFaceArea + totalSurfaceArea,
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

function computeSurfaceArea(surface) {
  const vertices = surface.vertices || [];
  const indices = surface.indices || [];
  let area = 0;
  for (let index = 0; index < indices.length; index += 3) {
    const a = vertices[indices[index]];
    const b = vertices[indices[index + 1]];
    const c = vertices[indices[index + 2]];
    if (!a || !b || !c) continue;
    const ab = toVector3(b).sub(toVector3(a));
    const ac = toVector3(c).sub(toVector3(a));
    area += ab.cross(ac).length() / 2;
  }
  return area;
}

function computeModelVolume(model) {
  if (!model || model.type === "triangle") return 0;
  if (Number.isFinite(model.volume)) return model.volume;
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
  return parseGlobalLengthInfo(text, fallback).value;
}

function parseGlobalLengthInfo(text, fallback) {
  return parseNamedNumberInfo(text, ["底面边长", "底边长", "边长", "棱长"], fallback, "边长");
}

function parseLengthMap(text) {
  const map = new Map();
  const chainRegex = new RegExp(`((?:[A-Z][0-9]?[A-Z][0-9]?=)+)(${mathExpressionPattern()})`, "g");
  for (const match of text.matchAll(chainRegex)) {
    const parsed = parseMathExpression(match[2]);
    if (!parsed) continue;
    const segments = match[1].match(/[A-Z][0-9]?[A-Z][0-9]?/g) || [];
    segments.forEach((segment) => setLength(map, segment, parsed));
  }

  const directRegex = new RegExp(`([A-Z][0-9]?[A-Z][0-9]?)(?:=|长为|为)(${mathExpressionPattern()})`, "g");
  for (const match of text.matchAll(directRegex)) {
    const parsed = parseMathExpression(match[2]);
    if (parsed) setLength(map, match[1], parsed);
  }
  return map;
}

function setLength(map, segment, parsed) {
  const endpoints = parseSegmentEndpoints(segment);
  if (!endpoints) return;
  const info = {
    value: Math.abs(parsed.value),
    display: parsed.display,
    explicit: true,
    label: segment,
  };
  map.set(`${endpoints[0]}${endpoints[1]}`, info);
  map.set(`${endpoints[1]}${endpoints[0]}`, info);
}

function getLength(map, keys, fallback) {
  const info = getLengthInfo(map, keys);
  return info ? info.value : fallback;
}

function getLengthInfo(map, keys) {
  for (const key of keys) {
    if (map.has(key)) return map.get(key);
  }
  return null;
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
  (model.curves || []).forEach((curve) => {
    (curve.points || []).forEach((point) => {
      point.x -= offsetX;
      point.y -= offsetY;
    });
  });
  (model.surfaces || []).forEach((surface) => {
    (surface.vertices || []).forEach((point) => {
      point.x -= offsetX;
      point.y -= offsetY;
    });
  });
}

function renderModel(model) {
  hideReviewPanel();
  clearGeneratedModel();
  state.currentModel = model;
  state.modelGroup = new THREE.Group();
  state.scene.add(state.modelGroup);

  const bounds = computeBounds(model);
  state.currentBounds = bounds;
  rebuildGridAndAxes(Math.max(bounds.size.x, bounds.size.y, bounds.size.z, 2) * 3.2);

  (model.surfaces || []).forEach((surface, index) => renderSurface(model, surface, index));
  model.faces.forEach((face, index) => renderFace(model, face, index));
  (model.curves || []).forEach((curve, index) => renderCurve(model, curve, index));
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
  if (positions.length < 3) return;

  for (let index = 1; index < positions.length - 1; index += 1) {
    [positions[0], positions[index], positions[index + 1]].forEach((point) => {
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
  const center = positions.reduce((sum, point) => sum.add(toVector3(point)), new THREE.Vector3()).multiplyScalar(1 / positions.length);
  mesh.userData = {
    elementId: face.id,
    type: "face",
    label: face.label,
    detail: `${face.label}，由 ${face.vertices.join("、")} 构成，面积 ${formatNumber(area)}。`,
    quick: `面积 ${formatNumber(area)}`,
    infoPosition: center,
    baseColor: material.color.clone(),
    baseOpacity: material.opacity,
  };
  state.modelGroup.add(mesh);
  state.interactiveObjects.push(mesh);
}

function renderSurface(model, surface, index) {
  const vertices = [];
  (surface.vertices || []).forEach((point) => vertices.push(point.x, point.y, point.z));
  if (vertices.length < 9) return;

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(surface.indices || []);
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: surface.color || colors.surface[index % colors.surface.length],
    transparent: true,
    opacity: surface.opacity ?? 0.28,
    side: THREE.DoubleSide,
    roughness: 0.68,
    metalness: 0,
  });
  const mesh = new THREE.Mesh(geometry, material);
  const center = (surface.vertices || []).reduce((sum, point) => sum.add(toVector3(point)), new THREE.Vector3()).multiplyScalar(1 / surface.vertices.length);
  const area = computeSurfaceArea(surface);
  mesh.userData = {
    elementId: surface.id,
    type: "surface",
    label: surface.label,
    detail: `${surface.label}${surface.note ? `，${surface.note}` : ""}，采样面积约 ${formatNumber(area)}。`,
    quick: `曲面面积约 ${formatNumber(area)}`,
    infoPosition: center,
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
  const slope = segmentSlopeText(start, end);
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
  const lengthText = segment.displayLength || formatNumber(length);
  mesh.userData = {
    elementId: segment.id,
    type: "line",
    label: displayLabelText(segment.label),
    detail: `${displayLabelText(segment.label)}，${segment.note || "线段"}，长度 ${lengthText}${slope ? `，${slope}` : ""}。`,
    quick: `${displayLabelText(segment.label)} = ${lengthText}${slope ? ` · ${slope}` : ""}`,
    infoPosition: midpointVector.clone(),
    baseColor: material.color.clone(),
    baseOpacity: material.opacity,
    aux: segment.kind === "aux",
    from: segment.from,
    to: segment.to,
  };
  state.modelGroup.add(mesh);
  state.interactiveObjects.push(mesh);
}

function renderCurve(model, curve, index) {
  const vectors = (curve.points || []).map((point) => toVector3(point));
  if (vectors.length < 2) return;
  const path = new THREE.CatmullRomCurve3(vectors);
  const geometry = new THREE.TubeGeometry(path, Math.max(vectors.length * 2, 36), 0.018, 10, false);
  const material = new THREE.MeshStandardMaterial({
    color: colors.face[index % colors.face.length],
    roughness: 0.42,
    transparent: true,
    opacity: 0.95,
  });
  const mesh = new THREE.Mesh(geometry, material);
  const center = vectors[Math.floor(vectors.length / 2)].clone();
  mesh.userData = {
    elementId: curve.id,
    type: "curve",
    label: curve.label,
    detail: `${curve.label}${curve.note ? `，${curve.note}` : ""}。`,
    quick: curve.note || curve.label,
    infoPosition: center,
    baseColor: material.color.clone(),
    baseOpacity: material.opacity,
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
  const coordinateText = point.displayPosition
    ? `(${point.displayPosition.x}, ${point.displayPosition.y}, ${point.displayPosition.z})`
    : `(${formatNumber(point.position.x)}, ${formatNumber(point.position.y)}, ${formatNumber(point.position.z)})`;
  mesh.userData = {
    elementId: point.id,
    type: "point",
    label: `点 ${displayLabelText(point.label)}`,
    detail: `${point.role}，坐标 ${coordinateText}。`,
    quick: `${displayLabelText(point.label)}${coordinateText}`,
    infoPosition: mesh.position.clone(),
    baseColor: material.color.clone(),
    baseOpacity: 1,
    pointLabel: point.label,
  };
  state.modelGroup.add(mesh);
  state.interactiveObjects.push(mesh);
  createLabel(displayLabelText(point.label), mesh.position, "vertex-label", "model", point.id);
}

function createLabel(text, position, className, kind, elementId = "") {
  const el = document.createElement("div");
  el.className = className;
  el.textContent = text;
  dom.labelLayer.appendChild(el);
  const item = {
    el,
    position: position.clone ? position.clone() : new THREE.Vector3(position.x, position.y, position.z),
    kind,
    elementId,
  };
  state.labelItems.push(item);
  return item;
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
  hideElementToast();
  clearInlineInfoLabels();
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
  const hasSurface = (model.surfaces || []).length > 0;
  const hasCurveOnly = (model.curves || []).length && !(model.faces || []).length && !hasSurface;
  const items = [
    {
      id: "measure:model",
      label: hasCurveOnly ? "整体曲线" : hasSurface ? "整体曲面" : metrics.volume > 0 ? "整体体积" : "整体面积",
      meta: hasCurveOnly ? "2D 解析几何" : metrics.volume > 0 ? `体积 ${formatNumber(metrics.volume)}` : `面积 ${formatNumber(metrics.totalArea)}`,
      type: "measure",
    },
    ...Object.values(model.points).map((point) => ({
      id: point.id,
      label: `点 ${displayLabelText(point.label)}`,
      meta: point.role,
      type: "point",
    })),
    ...model.segments.map((segment) => ({
      id: segment.id,
      label: `线段 ${displayLabelText(segment.label)}`,
      meta: segment.note || "线段",
      type: "line",
    })),
    ...(model.curves || []).map((curve) => ({
      id: curve.id,
      label: curve.label,
      meta: curve.note || "曲线",
      type: "curve",
    })),
    ...(model.surfaces || []).map((surface) => ({
      id: surface.id,
      label: surface.label,
      meta: surface.note || `面积约 ${formatNumber(computeSurfaceArea(surface))}`,
      type: "surface",
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
  state.longPressTriggered = false;
  clearLongPressTimer();
  state.pointerDown = {
    pointerId: event.pointerId,
    pointerType: event.pointerType,
    clientX: event.clientX,
    clientY: event.clientY,
    moved: false,
  };

  if (event.pointerType === "touch") {
    state.longPressTimer = window.setTimeout(() => {
      if (!state.pointerDown || state.pointerDown.moved) return;
      state.longPressTriggered = true;
      selectElementAt(state.pointerDown.clientX, state.pointerDown.clientY, { openInfo: true });
    }, 520);
  }
}

function handlePointerMove(event) {
  if (!state.pointerDown || state.pointerDown.pointerId !== event.pointerId) return;
  const distance = Math.hypot(event.clientX - state.pointerDown.clientX, event.clientY - state.pointerDown.clientY);
  if (distance > 8) {
    state.pointerDown.moved = true;
    clearLongPressTimer();
  }
}

function handlePointerUp(event) {
  if (!state.pointerDown || state.pointerDown.pointerId !== event.pointerId) return;
  const pointer = state.pointerDown;
  clearLongPressTimer();
  state.pointerDown = null;

  const distance = Math.hypot(event.clientX - pointer.clientX, event.clientY - pointer.clientY);
  if (state.longPressTriggered || pointer.moved || distance > 8) {
    state.longPressTriggered = false;
    return;
  }

  selectElementAt(event.clientX, event.clientY, { openInfo: false });
}

function clearPointerTracking() {
  state.pointerDown = null;
  state.longPressTriggered = false;
  clearLongPressTimer();
}

function clearLongPressTimer() {
  if (!state.longPressTimer) return;
  window.clearTimeout(state.longPressTimer);
  state.longPressTimer = null;
}

function selectElementAt(clientX, clientY, options = {}) {
  if (!state.currentModel) return;
  const rect = dom.canvas.getBoundingClientRect();
  state.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  state.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  state.raycaster.setFromCamera(state.pointer, state.camera);
  const intersects = state.raycaster.intersectObjects(state.interactiveObjects, false);
  if (!intersects.length) return;
  const object = intersects[0].object;
  selectElement(object.userData.elementId, options);
}

function selectElement(elementId, options = {}) {
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
  showElementToast(objects[0].userData);
  showInlineInfoLabel(objects[0].userData);
  setActiveStep("inspect");

  if (state.measureMode && objects[0].userData.type === "point") {
    handleMeasurePoint(objects[0].userData.pointLabel);
  } else if (options.openInfo && window.matchMedia("(max-width: 820px)").matches) {
    setMobilePanel("info");
  }
}

function setHighlight(object, active) {
  const { material, userData } = object;
  if (!material || !userData.baseColor) return;
  material.color.copy(active ? new THREE.Color(colors.selected) : userData.baseColor);
  if ("opacity" in material) {
    const boost = userData.type === "face" ? 0.48 : 0.9;
    material.opacity = active ? Math.max(userData.baseOpacity, boost) : userData.baseOpacity;
  }
  if (object.userData.type === "point") {
    object.scale.setScalar(active ? 1.85 : 1);
  }
  if (object.userData.type === "line") {
    object.scale.set(active ? 1.9 : 1, 1, active ? 1.9 : 1);
  }
}

function updateSelectedBox(data) {
  if (!data) {
    dom.selectedBox.innerHTML = "<strong>未选择</strong><span>点击模型中的点、线或面；手机端长按可直接展开详情。</span>";
    return;
  }
  dom.selectedBox.innerHTML = `<strong>${data.label}</strong><span>${data.detail}</span>`;
}

function showElementToast(data) {
  if (!dom.elementToast || !data) return;
  dom.elementToastTitle.textContent = data.label || "当前元素";
  dom.elementToastDetail.textContent = data.quick || data.detail || "已选中元素。";
  dom.elementToast.hidden = false;
  setStatus(`${data.label || "元素"} 已选中`);
}

function hideElementToast() {
  if (!dom.elementToast) return;
  dom.elementToast.hidden = true;
}

function showInlineInfoLabel(data) {
  if (!data?.infoPosition) return;
  clearInlineInfoLabels();
  createLabel(data.quick || data.detail || data.label, data.infoPosition, "info-label", "info");
}

function clearInlineInfoLabels() {
  state.labelItems
    .filter((item) => item.kind === "info")
    .forEach((item) => item.el.remove());
  state.labelItems = state.labelItems.filter((item) => item.kind !== "info");
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
  if (state.measureMode) {
    showToolHint("测距", "先点第一个点，再点第二个点。");
    setStatus("测距：先点第一个点，再点第二个点");
  } else {
    hideElementToast();
    setStatus("已退出测距");
  }
}

function handleMeasurePoint(pointLabel) {
  if (!state.currentModel?.points[pointLabel]) return;
  if (state.measurePoints.includes(pointLabel)) return;
  state.measurePoints.push(pointLabel);
  if (state.measurePoints.length === 1) {
    showToolHint("测距", `已选 ${pointLabel}，再点第二个点。`);
    setStatus(`已选择点 ${pointLabel}，再点第二个点`);
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
  showElementToast({
    label: "测距结果",
    detail,
    quick: `${first}${second} = ${formatNumber(distance)}`,
    infoPosition: p1.clone().add(p2).multiplyScalar(0.5),
  });
  showInlineInfoLabel({
    label: "测距结果",
    quick: `${first}${second} = ${formatNumber(distance)}`,
    infoPosition: p1.clone().add(p2).multiplyScalar(0.5),
  });
  setActiveStep("output");
  if (window.matchMedia("(max-width: 820px)").matches) setMobilePanel("info");
  setStatus(detail);
}

function showToolHint(title, detail) {
  if (!dom.elementToast) return;
  dom.elementToastTitle.textContent = title;
  dom.elementToastDetail.textContent = detail;
  dom.elementToast.hidden = false;
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
  dom.summary.textContent = `${error.message} 当前本地规则支持正方体、长方体、棱柱、棱锥、正四面体、圆柱、圆锥、圆台、球、椭球面、双曲面、抛物面、二次柱面和常见平面解析几何。`;
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
  const values = [
    ...Object.values(model.points).map((point) => point.position),
    ...(model.curves || []).flatMap((curve) => curve.points || []),
    ...(model.surfaces || []).flatMap((surface) => surface.vertices || []),
  ];
  if (!values.length) {
    values.push({ x: -1, y: -1, z: 0 }, { x: 1, y: 1, z: 0 });
  }
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

function segmentSlopeText(start, end) {
  if (Math.abs((start.z || 0) - (end.z || 0)) > 0.001) return "";
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (Math.abs(dx) < 0.001) return "斜率 k=∞";
  return `斜率 k=${formatNumber(dy / dx)}`;
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
    if (item.kind === "axis" && state.viewMode === "2d") {
      item.el.style.display = "none";
      return;
    }
    const projected = item.position.clone().project(state.camera);
    const visible = projected.z > -1 && projected.z < 1;
    item.el.style.display = visible ? "grid" : "none";
    if (!visible) return;
    const x = (projected.x * 0.5 + 0.5) * width;
    const y = (-projected.y * 0.5 + 0.5) * height;
    const offset = item.kind === "info" ? "translate(-50%, calc(-100% - 14px))" : "translate(-50%, -50%)";
    item.el.style.transform = `translate(${x}px, ${y}px) ${offset}`;
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
