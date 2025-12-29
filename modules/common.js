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

function applyFontScaleFromQuery() {
  try {
    const p = qs();
    const rawPx = p.get("fspx");
    if (rawPx) {
      const px = Number(rawPx);
      if (Number.isFinite(px)) {
        const clampedPx = Math.min(32, Math.max(12, px));
        document.documentElement.style.setProperty("--fs-scale", String(clampedPx / 16));
        return;
      }
    }

    const raw = p.get("fs");
    if (!raw) return;
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    const clamped = Math.min(200, Math.max(85, n));
    document.documentElement.style.setProperty("--fs-scale", String(clamped / 100));
  } catch {
    // ignore
  }
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

function applyNumericKeyboards(root = document) {
  const inputs = root.querySelectorAll('input[type="number"]');
  for (const el of inputs) {
    if (el.hasAttribute("inputmode")) continue;
    const stepAttr = String(el.getAttribute("step") || "").trim();
    const isInteger = stepAttr === "" || stepAttr === "1" || stepAttr === "0";
    el.setAttribute("inputmode", isInteger ? "numeric" : "decimal");
    el.setAttribute("pattern", isInteger ? "[0-9]*" : "[0-9]*[.,]?[0-9]*");
  }
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      applyFontScaleFromQuery();
      applyNumericKeyboards(document);
    });
  } else {
    applyFontScaleFromQuery();
    applyNumericKeyboards(document);
  }
}
