const DEFAULTS = {
  x: 10,
  y: 6,
  z: 3.2,
  floors: 1,
  interiorWallPercent: 60,
  openingsArea: 10,

  bricksPerM2: 60,
  sandBuildM3PerM2: 0.02,
  cementBuildKgPerM2: 7,
  sandPlasterM3PerM2: 0.015,
  cementPlasterKgPerM2: 5,
  cementBagKg: 50,

  concreteM3PerM2: 0.12,
  steelKgPerM2: 18,
  paintM2PerM2Wall: 2,
  tileWasteFactor: 1.05,

  priceBrick: 1500,
  priceSand: 320000,
  priceCementBag: 95000,
  priceConcreteM3: 1250000,
  priceSteelKg: 16500,
  pricePaintM2: 35000,
  priceTileM2: 260000,

  contingencyPercent: 5,
  laborPerM2: 1200000,
  otherCost: 0,
  packagePricePerM2: 6500000,
};

const MODULES = [
  { key: "foundation", title: "Móng", path: "modules/foundation.html" },
  { key: "roof", title: "Mái", path: "modules/roof.html" },
  { key: "stairs", title: "Cầu thang", path: "modules/stairs.html" },
  { key: "electric", title: "Điện", path: "modules/electric.html" },
  { key: "water", title: "Nước", path: "modules/water.html" },
  { key: "waterproof", title: "Chống thấm", path: "modules/waterproof.html" },
  { key: "tiling", title: "Ốp lát", path: "modules/tiling.html" },
  { key: "ceiling", title: "Trần", path: "modules/ceiling.html" },
  { key: "doors", title: "Cửa", path: "modules/doors.html" },
  { key: "fence", title: "Lan can / Cổng / Hàng rào", path: "modules/fence.html" },
  { key: "indirect", title: "Chi phí gián tiếp", path: "modules/indirect.html" },
];

const TOOLS = {
  calculator: {
    title: "Máy tính",
    url: "modules/calculator.html",
  },
};

function byId(id) {
  return document.getElementById(id);
}

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function clampNonNegative(n) {
  if (!Number.isFinite(n)) return 0;
  return n < 0 ? 0 : n;
}

function roundTo(n, digits) {
  const p = Math.pow(10, digits);
  return Math.round(n * p) / p;
}

function formatMoneyVND(n) {
  const safe = Number.isFinite(n) ? n : 0;
  return safe.toLocaleString("vi-VN") + " đ";
}

function formatNumber(n, digits = 2) {
  const safe = Number.isFinite(n) ? n : 0;
  return safe.toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

function moduleStorageKey(moduleKey) {
  return `xaydung_module_${moduleKey}`;
}

function getModuleSaved(moduleKey) {
  const raw = localStorage.getItem(moduleStorageKey(moduleKey));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (!Number.isFinite(Number(parsed.subtotal))) return null;
    return {
      subtotal: Number(parsed.subtotal),
      updatedAt: Number(parsed.updatedAt) || 0,
    };
  } catch {
    return null;
  }
}

function computeModulesTotal() {
  let sum = 0;
  for (const m of MODULES) {
    if (m.trackTotal === false) continue;
    const saved = getModuleSaved(m.key);
    if (!saved) continue;
    if (saved.subtotal <= 0) continue;
    sum += saved.subtotal;
  }
  return sum;
}

function getInputs() {
  return {
    x: clampNonNegative(num(byId("x").value)),
    y: clampNonNegative(num(byId("y").value)),
    z: clampNonNegative(num(byId("z").value)),
    floors: Math.max(1, Math.round(clampNonNegative(num(byId("floors").value)) || 1)),
    interiorWallPercent: clampNonNegative(num(byId("interiorWallPercent").value)),
    openingsArea: clampNonNegative(num(byId("openingsArea").value)),

    bricksPerM2: clampNonNegative(num(byId("bricksPerM2").value)),
    sandBuildM3PerM2: clampNonNegative(num(byId("sandBuildM3PerM2").value)),
    cementBuildKgPerM2: clampNonNegative(num(byId("cementBuildKgPerM2").value)),
    sandPlasterM3PerM2: clampNonNegative(num(byId("sandPlasterM3PerM2").value)),
    cementPlasterKgPerM2: clampNonNegative(num(byId("cementPlasterKgPerM2").value)),
    cementBagKg: Math.max(1, clampNonNegative(num(byId("cementBagKg").value)) || DEFAULTS.cementBagKg),

    concreteM3PerM2: clampNonNegative(num(byId("concreteM3PerM2").value)),
    steelKgPerM2: clampNonNegative(num(byId("steelKgPerM2").value)),
    paintM2PerM2Wall: clampNonNegative(num(byId("paintM2PerM2Wall").value)),
    tileWasteFactor: Math.max(1, clampNonNegative(num(byId("tileWasteFactor").value)) || DEFAULTS.tileWasteFactor),

    priceBrick: clampNonNegative(num(byId("priceBrick").value)),
    priceSand: clampNonNegative(num(byId("priceSand").value)),
    priceCementBag: clampNonNegative(num(byId("priceCementBag").value)),

    priceConcreteM3: clampNonNegative(num(byId("priceConcreteM3").value)),
    priceSteelKg: clampNonNegative(num(byId("priceSteelKg").value)),
    pricePaintM2: clampNonNegative(num(byId("pricePaintM2").value)),
    priceTileM2: clampNonNegative(num(byId("priceTileM2").value)),

    contingencyPercent: clampNonNegative(num(byId("contingencyPercent").value)),
    laborPerM2: clampNonNegative(num(byId("laborPerM2").value)),
    otherCost: clampNonNegative(num(byId("otherCost").value)),
    packagePricePerM2: clampNonNegative(num(byId("packagePricePerM2").value)),
  };
}

function compute(model) {
  const perimeter = 2 * (model.x + model.y);

  const floorArea = model.x * model.y * model.floors;
  const exteriorWallAreaGross = perimeter * model.z * model.floors;
  const exteriorWallArea = clampNonNegative(exteriorWallAreaGross - model.openingsArea);
  const interiorWallArea = exteriorWallArea * (model.interiorWallPercent / 100);
  const totalWallArea = exteriorWallArea + interiorWallArea;

  const bricksQty = totalWallArea * model.bricksPerM2;

  const sandBuildM3 = totalWallArea * model.sandBuildM3PerM2;
  const cementBuildKg = totalWallArea * model.cementBuildKgPerM2;
  const cementBuildBags = model.cementBagKg > 0 ? cementBuildKg / model.cementBagKg : 0;

  const sandPlasterM3 = totalWallArea * model.sandPlasterM3PerM2;
  const cementPlasterKg = totalWallArea * model.cementPlasterKgPerM2;
  const cementPlasterBags = model.cementBagKg > 0 ? cementPlasterKg / model.cementBagKg : 0;

  const concreteM3 = floorArea * model.concreteM3PerM2;
  const steelKg = floorArea * model.steelKgPerM2;

  const paintM2 = totalWallArea * model.paintM2PerM2Wall;
  const tilesM2 = floorArea * model.tileWasteFactor;

  const brickCost = bricksQty * model.priceBrick;
  const sandBuildCost = sandBuildM3 * model.priceSand;
  const cementBuildCost = cementBuildBags * model.priceCementBag;

  const sandPlasterCost = sandPlasterM3 * model.priceSand;
  const cementPlasterCost = cementPlasterBags * model.priceCementBag;

  const concreteCost = concreteM3 * model.priceConcreteM3;
  const steelCost = steelKg * model.priceSteelKg;
  const paintCost = paintM2 * model.pricePaintM2;
  const tilesCost = tilesM2 * model.priceTileM2;

  const materialsSubtotal =
    brickCost +
    sandBuildCost +
    cementBuildCost +
    sandPlasterCost +
    cementPlasterCost +
    concreteCost +
    steelCost +
    paintCost +
    tilesCost;

  const contingencyCost = materialsSubtotal * (model.contingencyPercent / 100);
  const laborCost = floorArea * model.laborPerM2;

  const grandTotal = materialsSubtotal + contingencyCost + laborCost + model.otherCost;
  const packageTotal = floorArea * model.packagePricePerM2;
  const delta = packageTotal - grandTotal;

  return {
    perimeter,
    floorArea,
    exteriorWallArea,
    interiorWallArea,
    totalWallArea,

    bricksQty,

    sandBuildM3,
    cementBuildKg,
    cementBuildBags,

    sandPlasterM3,
    cementPlasterKg,
    cementPlasterBags,

    concreteM3,
    steelKg,
    paintM2,
    tilesM2,

    brickCost,
    sandBuildCost,
    cementBuildCost,
    sandPlasterCost,
    cementPlasterCost,
    concreteCost,
    steelCost,
    paintCost,
    tilesCost,

    materialsSubtotal,
    contingencyCost,
    laborCost,
    grandTotal,
    packageTotal,
    delta,
  };
}

function render(model, out) {
  byId("outPerimeter").textContent = formatNumber(roundTo(out.perimeter, 2), 2);
  byId("outFloorArea").textContent = formatNumber(roundTo(out.floorArea, 2), 2);
  byId("outExteriorWallArea").textContent = formatNumber(roundTo(out.exteriorWallArea, 2), 2);
  byId("outTotalWallArea").textContent = formatNumber(roundTo(out.totalWallArea, 2), 2);

  byId("outBricksQty").textContent = formatNumber(Math.ceil(out.bricksQty), 0);
  byId("outSandBuildM3").textContent = formatNumber(roundTo(out.sandBuildM3, 3), 3);
  byId("outCementBuildKg").textContent = formatNumber(roundTo(out.cementBuildKg, 1), 1);
  byId("outCementBuildBags").textContent = formatNumber(roundTo(out.cementBuildBags, 2), 2);

  byId("outSandPlasterM3").textContent = formatNumber(roundTo(out.sandPlasterM3, 3), 3);
  byId("outCementPlasterKg").textContent = formatNumber(roundTo(out.cementPlasterKg, 1), 1);
  byId("outCementPlasterBags").textContent = formatNumber(roundTo(out.cementPlasterBags, 2), 2);

  byId("outConcreteM3").textContent = formatNumber(roundTo(out.concreteM3, 3), 3);
  byId("outSteelKg").textContent = formatNumber(roundTo(out.steelKg, 1), 1);
  byId("outPaintM2").textContent = formatNumber(roundTo(out.paintM2, 2), 2);
  byId("outTilesM2").textContent = formatNumber(roundTo(out.tilesM2, 2), 2);

  byId("outBrickUnitPrice").textContent = formatMoneyVND(model.priceBrick);
  byId("outSandBuildUnitPrice").textContent = formatMoneyVND(model.priceSand);
  byId("outCementBuildUnitPrice").textContent = formatMoneyVND(model.priceCementBag);

  byId("outSandPlasterUnitPrice").textContent = formatMoneyVND(model.priceSand);
  byId("outCementPlasterUnitPrice").textContent = formatMoneyVND(model.priceCementBag);

  byId("outConcreteUnitPrice").textContent = formatMoneyVND(model.priceConcreteM3);
  byId("outSteelUnitPrice").textContent = formatMoneyVND(model.priceSteelKg);
  byId("outPaintUnitPrice").textContent = formatMoneyVND(model.pricePaintM2);
  byId("outTilesUnitPrice").textContent = formatMoneyVND(model.priceTileM2);

  byId("outLaborUnitPrice").textContent = formatMoneyVND(model.laborPerM2);
  byId("outOtherUnitPrice").textContent = formatMoneyVND(model.otherCost);

  byId("outBrickCost").textContent = formatMoneyVND(Math.ceil(out.brickCost));
  byId("outSandBuildCost").textContent = formatMoneyVND(Math.ceil(out.sandBuildCost));
  byId("outCementBuildCost").textContent = formatMoneyVND(Math.ceil(out.cementBuildCost));

  byId("outSandPlasterCost").textContent = formatMoneyVND(Math.ceil(out.sandPlasterCost));
  byId("outCementPlasterCost").textContent = formatMoneyVND(Math.ceil(out.cementPlasterCost));

  byId("outConcreteCost").textContent = formatMoneyVND(Math.ceil(out.concreteCost));
  byId("outSteelCost").textContent = formatMoneyVND(Math.ceil(out.steelCost));
  byId("outPaintCost").textContent = formatMoneyVND(Math.ceil(out.paintCost));
  byId("outTilesCost").textContent = formatMoneyVND(Math.ceil(out.tilesCost));

  byId("outContingencyPercent").textContent = formatNumber(roundTo(model.contingencyPercent, 1), 1);
  byId("outContingencyCost").textContent = formatMoneyVND(Math.ceil(out.contingencyCost));

  byId("outLaborArea").textContent = formatNumber(roundTo(out.floorArea, 2), 2);
  byId("outLaborCost").textContent = formatMoneyVND(Math.ceil(out.laborCost));

  byId("outOtherCost").textContent = formatMoneyVND(Math.ceil(model.otherCost));

  byId("outMaterialsSubtotal").textContent = formatMoneyVND(Math.ceil(out.materialsSubtotal));
  byId("outGrandTotal").textContent = formatMoneyVND(Math.ceil(out.grandTotal));

  byId("outPackageTotal").textContent = formatMoneyVND(Math.ceil(out.packageTotal));
  byId("outDelta").textContent = formatMoneyVND(Math.ceil(out.delta));

  const modulesTotal = computeModulesTotal();
  const outModulesTotal = document.getElementById("outModulesTotal");
  const outOverallTotal = document.getElementById("outOverallTotal");
  if (outModulesTotal) outModulesTotal.textContent = formatMoneyVND(Math.ceil(modulesTotal));
  if (outOverallTotal) outOverallTotal.textContent = formatMoneyVND(Math.ceil(out.grandTotal + modulesTotal));
}

function recalc() {
  const model = getInputs();
  const out = compute(model);
  render(model, out);
  renderScenarios();
  renderModules(model);
}

function buildModuleUrl(model, modulePath) {
  const params = new URLSearchParams({
    x: String(model.x),
    y: String(model.y),
    z: String(model.z),
    floors: String(model.floors),
    interiorWallPercent: String(model.interiorWallPercent),
    openingsArea: String(model.openingsArea),

    priceSand: String(model.priceSand),
    priceCementBag: String(model.priceCementBag),
    cementBagKg: String(model.cementBagKg),
    priceConcreteM3: String(model.priceConcreteM3),
    priceSteelKg: String(model.priceSteelKg),
  });
  return `${modulePath}?${params.toString()}`;
}

function renderModules(model) {
  const tbody = document.getElementById("modulesList");
  if (!tbody) return;

  tbody.innerHTML = "";

  for (const m of MODULES) {
    const saved = getModuleSaved(m.key);
    const trackTotal = m.trackTotal !== false;
    const isDone = trackTotal && !!saved && saved.subtotal > 0;
    const statusText = trackTotal ? (isDone ? "✔ Đã tính" : "⚠ Chưa tính") : "—";
    const subtotalText = trackTotal && isDone ? formatMoneyVND(Math.ceil(saved.subtotal)) : "—";

    const tr = document.createElement("tr");

    const tdName = document.createElement("td");
    tdName.textContent = m.title;

    const tdStatus = document.createElement("td");
    tdStatus.textContent = statusText;

    const tdSubtotal = document.createElement("td");
    tdSubtotal.textContent = subtotalText;

    const tdAction = document.createElement("td");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn";
    btn.textContent = "Mở";
    btn.addEventListener("click", () => {
      const url = buildModuleUrl(model, m.path);
      openPopup({
        title: m.title,
        url,
      });
    });
    tdAction.appendChild(btn);

    tr.appendChild(tdName);
    tr.appendChild(tdStatus);
    tr.appendChild(tdSubtotal);
    tr.appendChild(tdAction);
    tbody.appendChild(tr);
  }
}

let popupZ = 1000;
let popupCount = 0;

function openPopup({ title, url }) {
  const host = document.getElementById("popupHost");
  if (!host) return;

  popupCount += 1;

  const win = document.createElement("div");
  win.className = "popup-window";
  win.style.zIndex = String(++popupZ);
  win.style.left = `${Math.min(60 + popupCount * 18, window.innerWidth - 620)}px`;
  win.style.top = `${Math.min(60 + popupCount * 18, window.innerHeight - 560)}px`;

  const header = document.createElement("div");
  header.className = "popup-header";

  const titleEl = document.createElement("div");
  titleEl.className = "popup-title";
  titleEl.textContent = title;

  const actions = document.createElement("div");
  actions.className = "popup-actions";

  const btnReload = document.createElement("button");
  btnReload.type = "button";
  btnReload.className = "popup-btn";
  btnReload.textContent = "↻";

  const btnClose = document.createElement("button");
  btnClose.type = "button";
  btnClose.className = "popup-btn";
  btnClose.textContent = "✕";

  actions.appendChild(btnReload);
  actions.appendChild(btnClose);

  header.appendChild(titleEl);
  header.appendChild(actions);

  const body = document.createElement("div");
  body.className = "popup-body";

  const iframe = document.createElement("iframe");
  iframe.className = "popup-iframe";
  const baseUrl = url;
  iframe.src = baseUrl;

  body.appendChild(iframe);

  const resizer = document.createElement("div");
  resizer.className = "popup-resizer";

  win.appendChild(header);
  win.appendChild(body);
  win.appendChild(resizer);
  host.appendChild(win);

  const isSmallScreen = window.innerWidth < 768 || window.innerHeight < 560;
  if (isSmallScreen) {
    win.classList.add("popup-fullscreen");
    resizer.style.display = "none";
  }

  function bringToFront() {
    win.style.zIndex = String(++popupZ);
  }

  win.addEventListener("pointerdown", bringToFront);

  btnClose.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
  });

  btnClose.addEventListener("click", (e) => {
    e.stopPropagation();
    win.remove();
  });

  btnReload.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
  });

  btnReload.addEventListener("click", (e) => {
    e.stopPropagation();
    try {
      iframe.contentWindow.location.reload();
      return;
    } catch {
      // ignore
    }

    const sep = baseUrl.includes("?") ? "&" : "?";
    iframe.src = `${baseUrl}${sep}_r=${Date.now()}`;
  });

  let dragging = false;
  let dragPointerId = null;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;
  let startWW = 0;
  let startWH = 0;

  header.addEventListener("pointerdown", (e) => {
    if (win.classList.contains("popup-fullscreen")) return;
    if (e.target && e.target.closest && e.target.closest(".popup-actions")) return;
    dragging = true;
    dragPointerId = e.pointerId;
    bringToFront();
    header.style.cursor = "grabbing";
    startX = e.clientX;
    startY = e.clientY;
    const rect = win.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;
    startWW = rect.width;
    startWH = rect.height;
    header.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  header.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    if (e.pointerId !== dragPointerId) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const maxLeft = Math.max(8, window.innerWidth - startWW - 8);
    const maxTop = Math.max(8, window.innerHeight - startWH - 8);

    const nextLeft = Math.min(Math.max(8, startLeft + dx), maxLeft);
    const nextTop = Math.min(Math.max(8, startTop + dy), maxTop);

    win.style.left = `${nextLeft}px`;
    win.style.top = `${nextTop}px`;
  });

  function stopDrag(e) {
    if (!dragging) return;
    if (e && dragPointerId !== null && e.pointerId !== dragPointerId) return;
    dragging = false;
    dragPointerId = null;
    header.style.cursor = "grab";
  }

  header.addEventListener("pointerup", stopDrag);
  header.addEventListener("pointercancel", stopDrag);

  let resizing = false;
  let resizePointerId = null;
  let startW = 0;
  let startH = 0;
  let startRX = 0;
  let startRY = 0;

  resizer.addEventListener("pointerdown", (e) => {
    if (win.classList.contains("popup-fullscreen")) return;
    resizing = true;
    resizePointerId = e.pointerId;
    bringToFront();
    const rect = win.getBoundingClientRect();
    startW = rect.width;
    startH = rect.height;
    startRX = e.clientX;
    startRY = e.clientY;
    resizer.setPointerCapture(e.pointerId);
    e.preventDefault();
    e.stopPropagation();
  });

  resizer.addEventListener("pointermove", (e) => {
    if (!resizing) return;
    if (e.pointerId !== resizePointerId) return;
    const dx = e.clientX - startRX;
    const dy = e.clientY - startRY;
    const w = Math.max(360, startW + dx);
    const h = Math.max(320, startH + dy);
    win.style.width = `${Math.min(w, window.innerWidth - 16)}px`;
    win.style.height = `${Math.min(h, window.innerHeight - 16)}px`;
  });

  function stopResize(e) {
    if (!resizing) return;
    if (e && resizePointerId !== null && e.pointerId !== resizePointerId) return;
    resizing = false;
    resizePointerId = null;
  }

  resizer.addEventListener("pointerup", stopResize);
  resizer.addEventListener("pointercancel", stopResize);
}

function storageKey(letter) {
  return `xaydung_scenario_${letter}`;
}

function safeParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function getScenario(letter) {
  const raw = localStorage.getItem(storageKey(letter));
  if (!raw) return null;
  const parsed = safeParseJson(raw);
  if (!parsed || typeof parsed !== "object") return null;
  if (!parsed.model || typeof parsed.model !== "object") return null;
  return parsed;
}

function setScenario(letter, model, out) {
  const payload = {
    model,
    computed: {
      grandTotal: out.grandTotal,
      materialsSubtotal: out.materialsSubtotal,
      packageTotal: out.packageTotal,
    },
    savedAt: Date.now(),
  };
  localStorage.setItem(storageKey(letter), JSON.stringify(payload));
}

function clearScenarios() {
  localStorage.removeItem(storageKey("A"));
  localStorage.removeItem(storageKey("B"));
  renderScenarios();
}

function applyScenario(letter) {
  const scenario = getScenario(letter);
  if (!scenario) return;

  const model = scenario.model;
  for (const [key, value] of Object.entries(model)) {
    const el = document.getElementById(key);
    if (!el) continue;
    el.value = value;
  }

  recalc();
}

function renderScenarios() {
  const a = getScenario("A");
  const b = getScenario("B");

  const aTotal = a?.computed?.grandTotal ?? null;
  const bTotal = b?.computed?.grandTotal ?? null;

  const outA = document.getElementById("outScenarioATotal");
  const outB = document.getElementById("outScenarioBTotal");
  const outD = document.getElementById("outScenarioDelta");

  if (outA) outA.textContent = aTotal == null ? "—" : formatMoneyVND(Math.ceil(aTotal));
  if (outB) outB.textContent = bTotal == null ? "—" : formatMoneyVND(Math.ceil(bTotal));
  if (outD) {
    if (aTotal == null || bTotal == null) outD.textContent = "—";
    else outD.textContent = formatMoneyVND(Math.ceil(bTotal - aTotal));
  }
}

function setDefaults() {
  byId("x").value = DEFAULTS.x;
  byId("y").value = DEFAULTS.y;
  byId("z").value = DEFAULTS.z;
  byId("floors").value = DEFAULTS.floors;
  byId("interiorWallPercent").value = DEFAULTS.interiorWallPercent;
  byId("openingsArea").value = DEFAULTS.openingsArea;

  byId("bricksPerM2").value = DEFAULTS.bricksPerM2;
  byId("sandBuildM3PerM2").value = DEFAULTS.sandBuildM3PerM2;
  byId("cementBuildKgPerM2").value = DEFAULTS.cementBuildKgPerM2;
  byId("sandPlasterM3PerM2").value = DEFAULTS.sandPlasterM3PerM2;
  byId("cementPlasterKgPerM2").value = DEFAULTS.cementPlasterKgPerM2;
  byId("cementBagKg").value = DEFAULTS.cementBagKg;

  byId("concreteM3PerM2").value = DEFAULTS.concreteM3PerM2;
  byId("steelKgPerM2").value = DEFAULTS.steelKgPerM2;
  byId("paintM2PerM2Wall").value = DEFAULTS.paintM2PerM2Wall;
  byId("tileWasteFactor").value = DEFAULTS.tileWasteFactor;

  byId("priceBrick").value = DEFAULTS.priceBrick;
  byId("priceSand").value = DEFAULTS.priceSand;
  byId("priceCementBag").value = DEFAULTS.priceCementBag;

  byId("priceConcreteM3").value = DEFAULTS.priceConcreteM3;
  byId("priceSteelKg").value = DEFAULTS.priceSteelKg;
  byId("pricePaintM2").value = DEFAULTS.pricePaintM2;
  byId("priceTileM2").value = DEFAULTS.priceTileM2;

  byId("contingencyPercent").value = DEFAULTS.contingencyPercent;
  byId("laborPerM2").value = DEFAULTS.laborPerM2;
  byId("otherCost").value = DEFAULTS.otherCost;
  byId("packagePricePerM2").value = DEFAULTS.packagePricePerM2;

  recalc();
}

function bindEvents() {
  const inputs = document.querySelectorAll("input");
  for (const el of inputs) {
    el.addEventListener("input", recalc);
  }

  const btnReset = byId("btnReset");
  btnReset.addEventListener("click", setDefaults);

  const btnOpenCalc = byId("btnOpenCalc");
  if (btnOpenCalc) {
    btnOpenCalc.addEventListener("click", () => {
      openPopup({
        title: TOOLS.calculator.title,
        url: TOOLS.calculator.url,
      });
    });
  }

  const btnSaveA = document.getElementById("btnSaveA");
  const btnApplyA = document.getElementById("btnApplyA");
  const btnSaveB = document.getElementById("btnSaveB");
  const btnApplyB = document.getElementById("btnApplyB");
  const btnClear = document.getElementById("btnClearScenarios");

  if (btnSaveA)
    btnSaveA.addEventListener("click", () => {
      const model = getInputs();
      const out = compute(model);
      setScenario("A", model, out);
      renderScenarios();
    });

  if (btnApplyA) btnApplyA.addEventListener("click", () => applyScenario("A"));

  if (btnSaveB)
    btnSaveB.addEventListener("click", () => {
      const model = getInputs();
      const out = compute(model);
      setScenario("B", model, out);
      renderScenarios();
    });

  if (btnApplyB) btnApplyB.addEventListener("click", () => applyScenario("B"));
  if (btnClear) btnClear.addEventListener("click", clearScenarios);
}

window.addEventListener("storage", (e) => {
  if (!e.key) return;
  if (!e.key.startsWith("xaydung_module_")) return;
  recalc();
});

window.addEventListener("message", (e) => {
  const data = e?.data;
  if (!data || typeof data !== "object") return;

  if (data.type === "xaydung_module_save") {
    const moduleKey = String(data.moduleKey || "");
    const subtotal = Number(data.subtotal);
    if (!moduleKey) return;
    if (!Number.isFinite(subtotal) || subtotal < 0) return;
    if (!MODULES.some((m) => m.key === moduleKey)) return;

    if (subtotal <= 0) {
      localStorage.removeItem(moduleStorageKey(moduleKey));
      recalc();
      return;
    }

    localStorage.setItem(
      moduleStorageKey(moduleKey),
      JSON.stringify({
        subtotal,
        updatedAt: Date.now(),
      })
    );

    recalc();
    return;
  }

  if (data.type === "xaydung_module_get") {
    const moduleKey = String(data.moduleKey || "");
    if (!moduleKey) return;
    if (!MODULES.some((m) => m.key === moduleKey)) return;
    const saved = getModuleSaved(moduleKey);
    e.source?.postMessage(
      {
        type: "xaydung_module_data",
        moduleKey,
        saved,
      },
      "*"
    );
  }
});

bindEvents();
recalc();
