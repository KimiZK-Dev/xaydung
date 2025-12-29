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

function qs() {
  return new URLSearchParams(window.location.search);
}

function getBaseModelFromQuery() {
  const p = qs();
  return {
    x: clampNonNegative(num(p.get("x"))),
    y: clampNonNegative(num(p.get("y"))),
    z: clampNonNegative(num(p.get("z"))),
    floors: Math.max(1, Math.round(clampNonNegative(num(p.get("floors"))) || 1)),
    interiorWallPercent: clampNonNegative(num(p.get("interiorWallPercent"))),
    openingsArea: clampNonNegative(num(p.get("openingsArea"))),

    priceSand: clampNonNegative(num(p.get("priceSand"))),
    priceCementBag: clampNonNegative(num(p.get("priceCementBag"))),
    cementBagKg: Math.max(1, clampNonNegative(num(p.get("cementBagKg"))) || 50),
    priceConcreteM3: clampNonNegative(num(p.get("priceConcreteM3"))),
    priceSteelKg: clampNonNegative(num(p.get("priceSteelKg"))),
  };
}

function postToParent(payload) {
  if (!window.parent || window.parent === window) return;
  window.parent.postMessage(payload, "*");
}

function saveModuleSubtotal(moduleKey, subtotal) {
  postToParent({
    type: "xaydung_module_save",
    moduleKey,
    subtotal,
  });
}

function requestModuleSaved(moduleKey) {
  postToParent({
    type: "xaydung_module_get",
    moduleKey,
  });
}

function onModuleSaved(callback) {
  window.addEventListener("message", (e) => {
    const data = e?.data;
    if (!data || typeof data !== "object") return;
    if (data.type !== "xaydung_module_data") return;
    callback(data);
  });
}

function bindRecalc(recalc) {
  const inputs = document.querySelectorAll("input, select");
  for (const el of inputs) {
    el.addEventListener("input", recalc);
    el.addEventListener("change", recalc);
  }
}
