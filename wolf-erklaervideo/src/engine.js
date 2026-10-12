// Kleine deterministische Animations-Engine: jede Szene ist eine reine Funktion der Zeit.
const W = 1920, H = 1080, FPS = 30;
const TAU = Math.PI * 2, DEG = Math.PI / 180;

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const fx = (n) => (Math.round(n * 100) / 100).toString();

const E = {
  linear: (t) => t,
  inQuad: (t) => t * t,
  outQuad: (t) => 1 - (1 - t) * (1 - t),
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  inCubic: (t) => t * t * t,
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outQuart: (t) => 1 - Math.pow(1 - t, 4),
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  outBack: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outBackBig: (t) => { const c1 = 2.6, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outElastic: (t) => (t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)) + 1),
};

// Fortschritt zwischen a und b (0..1), optional mit Easing
const P = (t, a, b, ease = E.inOutCubic) => (b <= a ? (t >= b ? 1 : 0) : ease(clamp((t - a) / (b - a))));

// Timeline-Cues aus dem Voiceover
const S = (id) => { if (!TL.lines[id]) throw new Error("cue " + id); return TL.lines[id].start; };
const EN = (id) => TL.lines[id].end;
const MID = (id, f = 0.5) => lerp(S(id), EN(id), f);

// Keyframes: [[zeit, wert, easing?], ...]; Werte dürfen Zahlen oder (verschachtelte) Objekte aus Zahlen sein
function mix(a, b, k) {
  if (typeof a === "number") return lerp(a, b, k);
  if (typeof a === "string" || typeof a === "boolean") return k < 0.5 ? a : b;
  const o = {};
  for (const key in a) o[key] = b && key in b ? mix(a[key], b[key], k) : a[key];
  if (b) for (const key in b) if (!(key in o)) o[key] = b[key];
  return o;
}
function kf(t, frames) {
  if (t <= frames[0][0]) return frames[0][1];
  for (let i = 0; i < frames.length - 1; i++) {
    const [t0, v0] = frames[i], [t1, v1, ease] = frames[i + 1];
    if (t <= t1) return mix(v0, v1, (ease || E.inOutCubic)(clamp((t - t0) / (t1 - t0))));
  }
  return frames[frames.length - 1][1];
}

// Deterministisches Rauschen (für Wackeln, Partikel)
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function noise1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }

// SVG-Helfer
const tr = (x = 0, y = 0, r = 0, sx = 1, sy = sx) =>
  `translate(${fx(x)} ${fx(y)})` + (r ? ` rotate(${fx(r)})` : "") + (sx !== 1 || sy !== 1 ? ` scale(${fx(sx)} ${fx(sy)})` : "");
const G = (transform, inner, extra = "") => `<g transform="${transform}" ${extra}>${inner}</g>`;
const op = (o, inner) => (o >= 0.999 ? inner : o <= 0.001 ? "" : `<g opacity="${fx(o)}">${inner}</g>`);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Text: font = "anton" | "bebas" | "barlow" | "nunito"
const FONTS = {
  anton: "font-family:Anton;font-weight:400",
  bebas: "font-family:'Bebas Neue';font-weight:400",
  barlow: "font-family:'Barlow Condensed';font-weight:800",
  barlow6: "font-family:'Barlow Condensed';font-weight:600",
  nunito: "font-family:Nunito;font-weight:900",
  nunito8: "font-family:Nunito;font-weight:800",
};
function T(x, y, str, o = {}) {
  const size = o.size || 60, fill = o.fill || "#fff", anchor = o.anchor || "middle";
  const font = FONTS[o.font || "anton"];
  const ls = o.ls != null ? `letter-spacing:${o.ls}px;` : "";
  const stroke = o.stroke ? `stroke:${o.stroke};stroke-width:${o.sw || 8}px;stroke-linejoin:round;paint-order:stroke;` : "";
  return `<text x="${fx(x)}" y="${fx(y)}" text-anchor="${anchor}" style="${font};font-size:${size}px;fill:${fill};${ls}${stroke}" ${o.extra || ""}>${esc(str)}</text>`;
}

// Pop-in-Skalierung (0 -> Überschwinger -> 1) und Aus-Fade
function popScale(t, at, dur = 0.45, ease = E.outBack) { return t < at ? 0 : ease(clamp((t - at) / dur)); }
function fadeIO(t, a, b, fin = 0.25, fout = 0.25) {
  if (t < a || t > b) return 0;
  return Math.min(clamp((t - a) / fin), clamp((b - t) / fout));
}
// Element, das an Position (x,y) aufpoppt
function pop(t, at, x, y, inner, o = {}) {
  const s = popScale(t, at, o.dur || 0.45, o.ease || E.outBack);
  if (s <= 0) return "";
  const out = o.out != null ? 1 - P(t, o.out, o.out + (o.outDur || 0.3), E.inCubic) : 1;
  if (out <= 0) return "";
  const rot = o.rot != null ? (1 - clamp((t - at) / (o.dur || 0.45))) * o.rot : 0;
  return op(out * clamp((t - at) / 0.12), G(tr(x, y, rot, s * (o.scale || 1)), inner));
}

// Szenenverwaltung
const SCENES = [];
function scene(id, start, end, draw, o = {}) { SCENES.push({ id, start, end, draw, ...o }); }

// Übergangs-Wischer (Panel fegt über das Bild)
function wipe(t, at, color = "#FF8A1F", dir = 1, dur = 0.5) {
  const k = (t - (at - dur / 2)) / dur;
  if (k <= 0 || k >= 1) return "";
  const e = E.inOutCubic(k);
  const x = lerp(-W * 1.3, W * 1.3, e) * dir;
  return `<g transform="translate(${fx(x + W / 2)} ${H / 2}) skewX(-14)">
    <rect x="${-W * 0.62}" y="${-H}" width="${W * 1.24}" height="${H * 2}" fill="${color}"/>
    <rect x="${-W * 0.62 - 60 * dir}" y="${-H}" width="40" height="${H * 2}" fill="#fff" opacity="0.85"/>
  </g>`;
}

let CURRENT_T = 0;
function renderFrame(t) {
  CURRENT_T = t;
  let out = "";
  for (const sc of SCENES) {
    if (t >= sc.start && t < sc.end) {
      const lt = t - sc.start, d = sc.end - sc.start;
      out += sc.draw(t, lt, d);
    }
  }
  for (const w of WIPES) out += wipe(t, w.at, w.color, w.dir || 1, w.dur || 0.5);
  out += OVERLAY ? OVERLAY(t) : "";
  document.getElementById("dyn").innerHTML = out;
  return true;
}
const WIPES = [];
let OVERLAY = null;
window.renderFrame = renderFrame;
