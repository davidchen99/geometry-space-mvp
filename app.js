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

const dom = {
  input: document.querySelector("#problemInput"),
  generateBtn: document.querySelector("#generateBtn"),
  clearBtn: document.querySelector("#clearBtn"),
  selectAllBtn: document.querySelector("#selectAllBtn"),
  sampleList: document.querySelector("#sampleList"),
  title: document.querySelector("#modelTitle"),
  summary: document.querySelector("#modelSummary"),
  relationList: document.querySelector("#relationList"),
  elementList: document.querySelector("#elementList"),
  selectedBox: document.querySelector("#selectedBox"),
  parseBadge: document.querySelector("#parseBadge"),
  statusText: document.querySelector("#statusText"),
  resetViewBtn: document.querySelector("#resetViewBtn"),
  gridBtn: document.querySelector("#gridBtn"),
  auxBtn: document.querySelector("#auxBtn"),
  measureBtn: document.querySelector("#measureBtn"),
  screenshotBtn: document.querySelector("#screenshotBtn"),
  sceneWrap: document.querySelector("#sceneWrap"),
  canvas: document.querySelector("#sceneCanvas"),
  labelLayer: document.querySelector("#labelLayer"),
  emptyState: document.querySelector("#emptyState"),
};

const state = {
  scene: null,
  camera: null,
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
      generateModel();
    });
    if (index === 0) {
      dom.input.value = sample.text;
    }
    dom.sampleList.appendChild(button);
  });

  dom.generateBtn.addEventListener("click", generateModel);
  dom.clearBtn.addEventListener("click", () => {
    dom.input.value = "";
    dom.input.focus();
    clearGeneratedModel();
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

  dom.canvas.addEventListener("pointerdown", handlePointerDown);
  window.addEventListener("resize", resizeRenderer);

  window.lucide?.createIcons();
  generateModel();
}

function initScene() {
  state.scene = new THREE.Scene();
  state.scene.background = new THREE.Color(0xf0f4f2);

  state.camera = new THREE.PerspectiveCamera(46, 1, 0.1, 1000);
  state.camera.up.set(0, 0, 1);
  state.camera.position.set(4, -6, 4);

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

function generateModel() {
  const text = dom.input.value.trim();
  if (!text) {
    setStatus("请先输入题目");
    return;
  }

  setLoading(true);
  setStatus("正在解析题目...");

  window.setTimeout(() => {
    try {
      const model = buildModelFromText(text);
      renderModel(model);
      setStatus(`已生成 ${model.title}`);
    } catch (error) {
      clearGeneratedModel();
      showParseError(error);
    } finally {
      setLoading(false);
    }
  }, 80);
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
  resetCameraToModel();
  dom.emptyState.classList.add("hide");
}

function renderFace(model, face, index) {
  const positions = face.vertices.map((label) => model.points[label].position);
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
    detail: `${face.label}，由 ${face.vertices.join("、")} 构成。`,
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
  model.relations.slice(0, 12).forEach((relation) => {
    const item = document.createElement("span");
    item.className = "relation-pill";
    item.textContent = relation;
    dom.relationList.appendChild(item);
  });
  dom.parseBadge.textContent = "本地规则解析";
}

function renderElementList(model) {
  const items = [
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
      meta: "平面",
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
  const objects = state.interactiveObjects.filter((object) => object.userData.elementId === elementId);
  if (!objects.length) return;

  state.interactiveObjects.forEach((object) => setHighlight(object, false));
  objects.forEach((object) => setHighlight(object, true));
  state.selectedElementId = elementId;
  updateSelectedBox(objects[0].userData);

  if (state.measureMode && objects[0].userData.type === "point") {
    handleMeasurePoint(objects[0].userData.pointLabel);
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
  if (!state.currentBounds) return;
  const bounds = state.currentBounds;
  const center = new THREE.Vector3(
    (bounds.min.x + bounds.max.x) / 2,
    (bounds.min.y + bounds.max.y) / 2,
    (bounds.min.z + bounds.max.z) / 2,
  );
  const maxSize = Math.max(bounds.size.x, bounds.size.y, bounds.size.z, 1);
  state.camera.position.set(center.x + maxSize * 1.6, center.y - maxSize * 2.1, center.z + maxSize * 1.35);
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
  setStatus("图片已导出");
}

function showParseError(error) {
  dom.title.textContent = "解析失败";
  dom.summary.textContent = `${error.message} 当前 MVP 优先支持常见正方体、长方体、三棱锥、四棱锥和三角形。`;
  dom.relationList.innerHTML = "";
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
  state.camera.aspect = width / height;
  state.camera.updateProjectionMatrix();
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
  return `你是几何题结构化解析器。请把题目解析为 JSON，字段包括 points、segments、faces、relations、solidType。只输出 JSON。\n题目：${problemText}`;
}

async function requestDeepSeekParse(problemText, apiKey, endpoint = "https://api.deepseek.com/chat/completions") {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "你只返回可被 JSON.parse 解析的几何结构数据。" },
        { role: "user", content: buildDeepSeekPrompt(problemText) },
      ],
      temperature: 0.1,
    }),
  });
  if (!response.ok) {
    throw new Error(`DeepSeek 请求失败：${response.status}`);
  }
  const data = await response.json();
  return JSON.parse(data.choices?.[0]?.message?.content || "{}");
}

window.GeometrySpaceAI = {
  provider: "deepseek",
  buildDeepSeekPrompt,
  requestDeepSeekParse,
};
