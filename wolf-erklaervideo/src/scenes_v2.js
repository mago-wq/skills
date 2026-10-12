// v2: Standbilder (halbrealistischer Wolf, Augen nur weiß) + animierte Einblendungen und Infografiken.
// Alle Zeiten hängen an den Voiceover-Cues (S/EN/PT/WT), nicht an festen Sekunden.
const SFX = [];
function sfx(t, kind, vol = 1) { SFX.push({ t: Math.max(0, t), kind, vol }); }
window.SFX = SFX;

// Startzeit des k-ten Satzes einer Zeile
const PT = (id, k) => {
  const l = TL.lines[id];
  if (l.parts && l.parts[k] != null) return l.parts[k];
  const n = Math.max(1, l.text.split(/(?<=[.!?…“])\s+/).length);
  return lerp(l.start, l.end, k / n);
};
// geschätzte Zeit eines Wortes innerhalb einer Zeile (über Satzgrenzen genau, innerhalb proportional)
function WT(id, word, occ = 0) {
  const l = TL.lines[id], txt = l.text;
  let idx = -1, from = 0;
  for (let i = 0; i <= occ; i++) { idx = txt.indexOf(word, from); from = idx + 1; }
  if (idx < 0) throw new Error("Wort " + word + " fehlt in " + id);
  const sents = txt.split(/(?<=[.!?…“])\s+/);
  if (l.parts && sents.length === l.parts.length) {
    let off = 0;
    for (let k = 0; k < sents.length; k++) {
      const a = txt.indexOf(sents[k], off), b = a + sents[k].length;
      if (idx >= a && idx < b) {
        const t0 = l.parts[k], t1 = k + 1 < l.parts.length ? l.parts[k + 1] - 0.12 : l.end;
        return lerp(t0, t1, (idx - a) / sents[k].length);
      }
      off = b;
    }
  }
  return lerp(l.start, l.end, idx / txt.length);
}

const CUT = 0.12, XF = 0.22;
const cutAt = (id) => S(id) - CUT;

// Szene, die sich über die vorige blendet (xf = 0: harter Schnitt, z. B. hinter einem Wischer)
function shot(id, a, b, draw, o = {}) {
  const xf = o.xf != null ? o.xf : XF;
  scene(id, a, b + XF, (t, lt) => {
    const g = draw(t, lt, Math.max(0.1, b - a));
    return xf > 0 && lt < xf ? op(E.inOutSine(lt / xf), g) : g;
  });
}

// ---------- Helfer für Einblendungen über Fotos ----------
const shade = (side, o = 1) => (o <= 0.001 ? "" : `<rect width="${W}" height="${H}" fill="url(#gShade${side})" opacity="${fx(Math.min(1, o))}"/>`);
function panel(x, y, w, h, o = {}) {
  return `<rect x="${fx(x)}" y="${fx(y)}" width="${fx(w)}" height="${fx(h)}" rx="${o.r || 30}" fill="${o.fill || "#0B1020"}" opacity="${o.op != null ? o.op : 0.82}"/>` +
    (o.stroke ? `<rect x="${fx(x)}" y="${fx(y)}" width="${fx(w)}" height="${fx(h)}" rx="${o.r || 30}" fill="none" stroke="${o.stroke}" stroke-width="4" opacity="0.7"/>` : "");
}
// Panel, das als Ganzes auf- und wieder abblendet
function fadePanel(t, a, b, inner) {
  const k = Math.min(P(t, a, a + 0.3, E.outCubic), b != null ? 1 - P(t, b, b + 0.3) : 1);
  if (k <= 0) return "";
  return op(k, G(tr(0, (1 - k) * 30), inner));
}
// Ken-Burns-Abbildung: Bildpunkt -> Bildschirmpunkt (für Zeiger auf Dinge im Bild)
function kbXY(px, py, k, o) {
  const e = E.inOutSine(clamp(k));
  const z = lerp(o.z0 != null ? o.z0 : 1, o.z1 != null ? o.z1 : 1.08, e);
  const cx = lerp(o.x0 != null ? o.x0 : 0.5, o.x1 != null ? o.x1 : 0.5, e) * W;
  const cy = lerp(o.y0 != null ? o.y0 : 0.5, o.y1 != null ? o.y1 : 0.5, e) * H;
  return [cx + z * (px - cx), cy + z * (py - cy)];
}
// Etikett mit Zeigerlinie
function tag(t, at, x, y, text, o = {}) {
  if (t < at) return "";
  let g = "";
  if (o.px != null) {
    const k = P(t, at + 0.05, at + 0.35, E.outCubic);
    const ln = (c, w, a) => `<line x1="${fx(x)}" y1="${fx(y)}" x2="${fx(lerp(x, o.px, k))}" y2="${fx(lerp(y, o.py, k))}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" opacity="${a}"/>`;
    g += ln("#0B1020", 10, 0.45) + ln("#F5F7FB", 5, 1);
    if (k > 0.98) g += `<circle cx="${fx(o.px)}" cy="${fx(o.py)}" r="11" fill="#F5F7FB"/><circle cx="${fx(o.px)}" cy="${fx(o.py)}" r="5" fill="${o.bg || COL.orange}"/>`;
  }
  return g + pop(t, at, x, y, pill(0, 0, text, { size: o.size || 44, bg: o.bg || COL.orange }), { dur: 0.35 });
}
// Kapitel-Banner über einem Foto
function chapterBanner(t, at, out, num, ttl, sub, color, o = {}) {
  if (t < at) return "";
  const kin = E.outCubic(clamp((t - at) / 0.5)), kout = out != null ? E.inCubic(clamp((t - out) / 0.4)) : 0;
  if (kout >= 1) return "";
  const ts = o.size || 92, ns = ts * 1.75, ss = ts * 0.52;
  const tw = ttl.length * ts * 0.46, sw = sub ? sub.length * ss * 0.43 : 0, nw = num.length * ns * 0.47;
  const skew = 46, w = 64 + nw + 36 + Math.max(tw, sw) + 64 + skew;
  const h = sub ? ts + ss * 1.25 + 74 : ts + 84;
  const right = o.align === "right", y = o.y != null ? o.y : 80;
  const slide = (right ? 1 : -1) * ((1 - kin) + kout) * (w + 120);
  const x0 = right ? W - w : 0;
  const pts = right ? `${fx(x0)} ${y} ${W + 20} ${y} ${W + 20} ${y + h} ${fx(x0 + skew)} ${y + h}` : `-20 ${y} ${fx(w)} ${y} ${fx(w - skew)} ${y + h} -20 ${y + h}`;
  let g = `<polygon points="${pts}" fill="#05070D" opacity="0.35" transform="translate(10 12)"/><polygon points="${pts}" fill="${color}"/>`;
  const bx = x0 + 64 + (right ? skew : 0);
  g += T(bx, y + h / 2 + ns * 0.36, num, { size: ns, font: "anton", fill: "none", anchor: "start", extra: `stroke="#fff" stroke-width="6" opacity="0.92"` });
  const tx = bx + nw + 36, ty = sub ? y + 34 + ts * 0.86 : y + h / 2 + ts * 0.36;
  g += T(tx, ty, ttl, { size: ts, font: "anton", fill: "#fff", anchor: "start", ls: 3 });
  if (sub) g += op(clamp((t - at - 0.25) / 0.3), T(tx, ty + ss * 1.3, sub, { size: ss, font: "barlow", fill: "#fff", anchor: "start", ls: 1 }));
  return G(tr(slide, 0), g);
}
// Hintergrund der Infografiken: weichgezeichnetes Standbild, stark abgedunkelt
function gfxBg(t, src, tint) {
  let g = src ? `<g transform="${tr(960, 540, 0, 1.04 + 0.02 * Math.sin(t * 0.2))}"><image href="${img("blur/" + src + ".jpg")}" x="-960" y="-540" width="1920" height="1080" preserveAspectRatio="xMidYMid slice"/></g>` +
    `<rect width="${W}" height="${H}" fill="#0B1020" opacity="0.74"/>` : bgFill("gInfo");
  g += dots();
  if (tint) g += `<rect width="${W}" height="${H}" fill="${tint}" opacity="0.10"/>`;
  return g + vignette();
}
// Fotokarte (Ausschnitt eines Standbilds), crop = [x, y, b, h] in Bildkoordinaten
function photoCard(name, x, y, w, h, crop, o = {}) {
  const cap = o.caption ? 84 : 0;
  return `<g transform="${tr(x, y, o.rot || 0)}"><rect x="${-w / 2 - 14}" y="${-h / 2 - 14}" width="${w + 28}" height="${h + 28 + cap}" rx="20" fill="#05070D" opacity="0.4" transform="translate(10 14)"/>
    <rect x="${-w / 2 - 14}" y="${-h / 2 - 14}" width="${w + 28}" height="${h + 28 + cap}" rx="20" fill="#F5F7FB"/>
    <svg x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" viewBox="${crop.join(" ")}" preserveAspectRatio="xMidYMid slice"><image href="${img(name)}" width="1920" height="1080"/></svg>
    ${o.caption ? T(0, h / 2 + 66, o.caption, { size: 56, font: "anton", fill: o.capColor || "#0E1422", ls: 2 }) : ""}</g>`;
}
function lines2(x, y, arr, o = {}) {
  return arr.map((s, i) => T(x, y + i * (o.lh || (o.size || 44) * 1.25), s, { size: o.size || 44, font: o.font || "barlow", fill: o.fill || "#F5F7FB", anchor: o.anchor || "middle" })).join("");
}

// Ken-Burns-Einstellungen je Bild (Zoom/Fokus Richtung Figur)
const KB = {
  S01: { z0: 1.02, z1: 1.12, x0: 0.62, x1: 0.68, y0: 0.6, y1: 0.55 },
  S02: { z0: 1.0, z1: 1.1, x0: 0.62, x1: 0.68, y0: 0.4, y1: 0.36 },
  S04: { z0: 1.0, z1: 1.08, x0: 0.35, x1: 0.38, y0: 0.42, y1: 0.4 },
  S05: { z0: 1.06, z1: 1.0, x0: 0.36, x1: 0.42, y0: 0.4, y1: 0.42 },
  S07: { z0: 1.0, z1: 1.09, x0: 0.4, x1: 0.36, y0: 0.6, y1: 0.58 },
  S09: { z0: 1.0, z1: 1.08, x0: 0.3, x1: 0.26, y0: 0.4, y1: 0.36 },
  S10: { z0: 1.08, z1: 1.0, x0: 0.25, x1: 0.3, y0: 0.5, y1: 0.5 },
  S11: { z0: 1.0, z1: 1.08, x0: 0.7, x1: 0.68, y0: 0.4, y1: 0.36 },
  S12: { z0: 1.0, z1: 1.08, x0: 0.36, x1: 0.34, y0: 0.45, y1: 0.4 },
  S13: { z0: 1.06, z1: 1.0, x0: 0.3, x1: 0.32, y0: 0.4, y1: 0.45 },
  S15: { z0: 1.0, z1: 1.08, x0: 0.7, x1: 0.7, y0: 0.4, y1: 0.36 },
  S16: { z0: 1.0, z1: 1.08, x0: 0.7, x1: 0.66, y0: 0.45, y1: 0.45 },
  S18: { z0: 1.0, z1: 1.06, x0: 0.25, x1: 0.25, y0: 0.45, y1: 0.42 },
  S19: { z0: 1.0, z1: 1.08, x0: 0.7, x1: 0.68, y0: 0.4, y1: 0.38 },
  S21: { z0: 1.0, z1: 1.06, x0: 0.5, x1: 0.5, y0: 0.6, y1: 0.62 },
  S22: { z0: 1.0, z1: 1.09, x0: 0.3, x1: 0.28, y0: 0.42, y1: 0.4 },
  S24: { z0: 1.0, z1: 1.08, x0: 0.72, x1: 0.7, y0: 0.5, y1: 0.48 },
  S26: { z0: 1.0, z1: 1.08, x0: 0.3, x1: 0.32, y0: 0.45, y1: 0.42 },
  S27: { z0: 1.0, z1: 1.1, x0: 0.66, x1: 0.68, y0: 0.38, y1: 0.36 },
  S30: { z0: 1.0, z1: 1.1, x0: 0.6, x1: 0.62, y0: 0.4, y1: 0.36 },
  S31: { z0: 1.02, z1: 1.16, x0: 0.7, x1: 0.71, y0: 0.32, y1: 0.3 },
};
const photo = (name, k, extra = {}) => still(name + ".jpg", k, { ...KB[name], ...extra });
// optionales Teaser-Bild (rote Instinkt-Augen) – nur wenn vorhanden
const HAS_S31 = true; // wird true, sobald v2/img/final/S31.jpg (Teaser, rote Instinkt-Augen) existiert

// ======================= INTRO =======================
shot("s01", 0, cutAt("i4"), (t, lt, d) => {
  let g = photo("S01", lt / d);
  g += shade("L", P(t, S("i2"), S("i2") + 0.8) * 0.95) + shade("T", P(t, S("i2"), S("i2") + 0.8) * 0.5);
  g += pop(t, WT("i2", "stimmt") - 0.1, 1290, 240, emote("question", 0, 0, t, 1.3), { out: PT("i3", 0) + 0.2 });
  const f0 = PT("i3", 0), f1 = PT("i3", 1), f2 = PT("i3", 2);
  const fk = P(t, f0 + 0.35, f0 + 1.0);
  g += pop(t, f0, 300, 220, (fk < 1 ? flame(-150, -30, 0.7 * (1 - fk) + 0.001, t) : "") + smoke(-150, -40, t, fk) +
    title(-60, 0, [["KEIN", "#fff"], ["FEUER", COL.orange]], { size: 92, anchor: "start" }), { dur: 0.35 });
  g += pop(t, f1, 300, 390, gaugeSemi(-150, 10, 62, lerp(0.8, 0.02, P(t, f1 + 0.2, f1 + 0.9, E.outBack)), { zones: [[0, 0.33, COL.red], [0.33, 0.66, COL.yellow], [0.66, 1, COL.green]] }) +
    title(-60, 0, [["KEIN", "#fff"], ["ANTRIEB", COL.yellow]], { size: 92, anchor: "start" }), { dur: 0.35 });
  g += pop(t, f2, 240, 540, title(0, 0, [["EINFACH NUR …", "#fff"]], { size: 62, anchor: "start" }), { dur: 0.35 });
  const pw = WT("i3", "platt"), sq = P(t, pw - 0.05, pw + 0.35, E.outBack);
  if (t > pw - 0.15) g += G(tr(470, 700, 0, 1 + sq * 0.25, 1 - sq * 0.6), title(0, 0, [["PLATT", COL.red]], { size: 150 }));
  return g;
}, { xf: 0 });
sfx(WT("i2", "stimmt") - 0.1, "pop"); sfx(PT("i3", 0), "pop"); sfx(PT("i3", 1), "pop"); sfx(WT("i3", "platt"), "squash");

shot("s02", cutAt("i4"), cutAt("i6"), (t, lt, d) => {
  let g = photo("S02", lt / d);
  g += shade("L", P(t, PT("i5", 0) - 0.3, PT("i5", 0)) * 0.9);
  g += popTitle(t, PT("i5", 0), 400, 250, [["GLEICHER", "#fff"], ["WOLF", COL.blue]], { size: 88 });
  const a = PT("i5", 1), blink = Math.floor(t * 3) % 2 ? 1 : 0.5;
  g += pop(t, a, 400, 500, op(t > PT("i5", 2) ? blink : 1, battery(0, 0, lerp(0.3, 0.05, P(t, a + 0.2, PT("i5", 2) + 0.2)), 1.5)), { dur: 0.4 });
  g += pop(t, a + 0.15, 400, 400, T(0, 0, "UND DER AKKU?", { size: 46, font: "barlow", fill: "#C9D3E0", ls: 2 }), { dur: 0.3 });
  g += popTitle(t, PT("i5", 2), 400, 720, [["LEER.", COL.red]], { size: 130 });
  return g;
});
sfx(cutAt("i4"), "whoosh", 0.3); sfx(PT("i5", 0), "pop"); sfx(PT("i5", 1), "pop"); sfx(PT("i5", 2), "stamp", 0.7);

function thermo(x, y, level, label) {
  const h = 520, c = level < 0.3 ? COL.red : level < 0.55 ? COL.yellow : COL.orange;
  return `<g transform="${tr(x, y)}"><rect x="-50" y="${-h}" width="100" height="${h}" rx="50" fill="#0B1020" stroke="#F5F7FB" stroke-width="8"/>
    <rect x="-34" y="${fx(-16 - (h - 32) * level)}" width="68" height="${fx((h - 32) * level)}" rx="34" fill="${c}"/>
    <circle cy="40" r="76" fill="${c}" stroke="#F5F7FB" stroke-width="8"/>
    <text x="0" y="66" text-anchor="middle" style="font-family:Anton;font-size:72px;fill:#fff">T</text>
    ${label ? `<text x="0" y="${-h - 30}" text-anchor="middle" style="font-family:Anton;font-size:46px;fill:${c}">${label}</text>` : ""}</g>`;
}
shot("s03", cutAt("i6"), cutAt("i9"), (t, lt, d) => {
  let g = gfxBg(t, "S02", COL.red);
  const lv = lerp(0.82, 0.18, P(t, S("i6") + 0.2, S("i6") + 1.6));
  g += pop(t, S("i6"), 230, 820, thermo(0, 0, lv), { dur: 0.4 });
  g += pop(t, S("i6"), 1080, 105, pill(0, 0, "VERDACHT", { size: 46, bg: "#2A3558" }), {});
  g += popTitle(t, S("i6") + 0.2, 1080, 240, [["NIEDRIGES", "#fff"], ["TESTOSTERON", COL.orange]], { size: 104 });
  const a = PT("i7", 0), b = PT("i7", 1);
  g += pop(t, a, 1080, 390, pill(0, 0, "SELTENE KRANKHEIT?", { size: 52, bg: "#2A3558" }), { out: b + 0.1 });
  g += op(1 - P(t, b + 0.1, b + 0.4), stamp(1530, 390, "NEIN", t, a + 0.7, { size: 64 }));
  g += popTitle(t, b + 0.05, 1080, 520, [["OFT:", COL.yellow], ["JAHRE SCHLECHTER GEWOHNHEITEN", "#fff"]], { size: 66 });
  const items = [[phoneNight(0, 0, 0.75), "HANDY UM 2 UHR"], [burger(0, 0, 0.95), "FAST FOOD"], [couch(0, 0, 0.75), "NUR SITZEN"], [energyCan(0, 0, 0.8), "ENERGY-DRINKS"]];
  items.forEach((it, i) => { g += pop(t, b + 0.6 + i * 0.4, 600 + i * 330, 760, it[0] + T(0, 150, it[1], { size: 40, font: "barlow", fill: "#C9D3E0" }), { dur: 0.4 }); });
  return g;
});
sfx(cutAt("i6"), "whoosh", 0.4); sfx(S("i6"), "pop"); sfx(PT("i7", 0), "pop"); sfx(PT("i7", 0) + 0.7, "stamp");
for (let i = 0; i < 4; i++) sfx(PT("i7", 1) + 0.6 + i * 0.4, "pop", 0.6);

// ---------- Handy-Werbung ----------
function star5(x, y, r, c) {
  const p = [];
  for (let i = 0; i < 10; i++) { const a = -90 + i * 36, rr = i % 2 ? r * 0.45 : r; p.push(`${fx(x + Math.cos(a * DEG) * rr)} ${fx(y + Math.sin(a * DEG) * rr)}`); }
  return `<path d="M ${p.join(" L ")} Z" fill="${c}"/>`;
}
function adCard(t, a, b, btn) {
  // a: Anzeige erscheint, b: "Über Nacht ...", btn: Kauf-Knopf
  let g = `<rect x="-215" y="-415" width="430" height="830" rx="48" fill="#05070D" opacity="0.45" transform="translate(14 18)"/>`;
  g += `<rect x="-215" y="-415" width="430" height="830" rx="48" fill="#FFFFFF"/>`;
  let s = `<rect x="-205" y="-405" width="410" height="810" fill="#FFF6EA"/>`;
  s += `<rect x="-205" y="-405" width="410" height="78" fill="#FF4D5E"/>` + T(0, -354, "ANZEIGE", { size: 34, font: "barlow", fill: "#fff", ls: 4 });
  s += `<g transform="${tr(0, -190, (t * 40) % 360)}">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="-6" y="-210" width="12" height="70" rx="6" fill="#FFD25A" transform="rotate(${i * 45})" opacity="0.7"/>`).join("")}</g>`;
  s += pop(t, a + 0.1, 0, -175, gummyJar(0, 0, 0.85), { dur: 0.5 });
  s += pop(t, a + 0.35, 0, -10, T(0, 0, "TESTO-", { size: 60, font: "anton", fill: "#FF8A1F" }) + T(0, 58, "GUMMIBÄRCHEN", { size: 54, font: "anton", fill: "#FF8A1F" }), { dur: 0.4 });
  s += pop(t, b, 0, 118, T(0, 0, "ÜBER NACHT ZUM", { size: 38, font: "barlow", fill: "#0E1422" }) + T(0, 62, "ALPHAWOLF!", { size: 66, font: "anton", fill: "#FF4D5E" }), { dur: 0.4, rot: -6 });
  if (t > a + 0.6) for (let i = 0; i < 5; i++) s += star5(-120 + i * 60, 236, 19, "#FFB800");
  if (t > btn) s += G(tr(0, 322, 0, 1 + Math.sin(t * 9) * 0.05), `<rect x="-170" y="-40" width="340" height="80" rx="40" fill="#3DDC97"/>` + T(0, 18, "JETZT KAUFEN", { size: 48, font: "anton", fill: "#fff" }));
  return g + `<g clip-path="url(#cPhoneScreen)">${s}</g>`;
}
const AD_A = () => WT("i9", "Werbung") - 0.1, AD_B = () => PT("i10", 1), AD_BTN = () => PT("i10", 0) + 0.7;
const AD_X = 1480, AD_Y = 540;
shot("s04", cutAt("i9"), cutAt("i11"), (t, lt, d) => {
  const k = lt / d;
  let g = photo("S04", k);
  // Handy leuchtet: Lichtimpuls am Telefon
  const [px, py] = kbXY(815, 505, k, KB.S04);
  const glow = P(t, S("i9") + 0.2, S("i9") + 0.6) * (0.6 + 0.4 * Math.sin(t * 12));
  if (glow > 0) g += op(glow, `<circle cx="${fx(px)}" cy="${fx(py)}" r="210" fill="url(#gGlowW)"/>`);
  if (t > S("i9") + 0.2 && t < AD_A() + 0.3) for (const sd of [-1, 1]) for (let i = 0; i < 2; i++) {
    const ox = px + sd * (95 + i * 26);
    g += `<path d="M ${fx(ox)} ${fx(py - 60)} Q ${fx(ox + sd * 18)} ${fx(py)} ${fx(ox)} ${fx(py + 60)}" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.8"/>`;
  }
  const ak = P(t, AD_A(), AD_A() + 0.45, E.outBack);
  if (ak > 0) g += G(tr(AD_X, AD_Y + (1 - ak) * 700, (1 - ak) * 12, 1), adCard(t, AD_A(), AD_B(), AD_BTN()));
  if (t > PT("i10", 0)) g += emote("sparkle", AD_X - 300, 210, t, 1.1) + emote("sparkle", AD_X + 290, 860, t + 1, 1);
  return g;
});
sfx(S("i9") + 0.2, "buzz"); sfx(AD_A(), "whoosh", 0.5); sfx(PT("i10", 1), "pop");

shot("s05", cutAt("i11"), S("i14") - 0.3, (t, lt, d) => {
  let g = photo("S05", lt / d);
  // Werbung wird weggewischt
  const sw = PT("i11", 1) + 0.1, k = P(t, sw, sw + 0.45, E.inCubic);
  if (k < 1) g += G(tr(AD_X + k * 900, AD_Y - k * 120, k * 35), adCard(t, -10, -10, -10));
  ["HA", "HA", "HA!"].forEach((h, i) => { g += pop(t, S("i11") + 0.1 + i * 0.2, 960 + i * 110, 230 - i * 55, title(0, 0, [[h, COL.yellow]], { size: 84 }), { rot: -10 + i * 10, out: sw + 0.5 }); });
  g += pop(t, PT("i11", 2), 1580, 940, pill(0, 0, "ERLEDIGT ✓", { size: 50, bg: COL.green }), { out: S("i12") - 0.1 });
  g += shade("R", P(t, S("i12") - 0.2, S("i12") + 0.2) * 0.85);
  // Kaufen vs. Aufbauen
  const a = S("i12");
  g += popTitle(t, a, 1560, 250, [["KAUFEN?", "#fff"]], { size: 100 });
  g += pop(t, a + 0.1, 1560, 450, cart(0, 0, 1.15) + gummyJar(-10, -100, 0.42) + powderTub(80, -94, 0.34), { dur: 0.4 });
  const xk = P(t, EN("i12") - 0.4, EN("i12"), E.outCubic);
  if (xk > 0) g += bigCross(1560, 420, 0.95, xk);
  const b = S("i13");
  g += popTitle(t, b, 1560, 680, [["AUFBAUEN!", COL.green]], { size: 110 });
  const rows = [[4, 0], [3, 1], [2, 2]];
  let n = 0;
  rows.forEach(([cnt, r]) => {
    for (let i = 0; i < cnt; i++) {
      const at = b + 0.15 + n * 0.07; n++;
      const kk = P(t, at, at + 0.3, E.outBack);
      if (kk > 0) g += brick(1560 + (i - (cnt - 1) / 2) * 112, lerp(640, 960 - r * 72, kk), 104, 64);
    }
  });
  return g;
});
sfx(cutAt("i11"), "whoosh", 0.3);
sfx(S("i11") + 0.1, "pop", 0.5); sfx(S("i11") + 0.3, "pop", 0.5); sfx(S("i11") + 0.5, "pop", 0.5);
sfx(PT("i11", 1) + 0.1, "whoosh", 0.8); sfx(PT("i11", 2), "tick"); sfx(S("i12"), "pop"); sfx(EN("i12") - 0.4, "stamp"); sfx(S("i13"), "pop");
for (let i = 0; i < 9; i++) sfx(S("i13") + 0.15 + i * 0.07 + 0.2, "tick", 0.4);

// Fundament statt Superheld
shot("s06", S("i14") - 0.3, S("s1") - 0.3, (t, lt, d) => {
  let g = gfxBg(t, "S05", COL.green);
  g += popTitle(t, PT("i14", 0), 960, 190, [["HEUTE:", "#fff"], ["DAS FUNDAMENT", COL.orange]], { size: 104 });
  // Skala niedrig – normal – darüber
  const x0 = 260, x1 = 1660, y = 560, X = (v) => lerp(x0, x1, v);
  const zones = [[0, 0.38, COL.red, "NIEDRIG"], [0.38, 0.72, COL.green, "NORMALBEREICH"], [0.72, 1, COL.purple, "DARÜBER"]];
  const sk = P(t, PT("i14", 0) + 0.3, PT("i14", 0) + 0.8, E.outCubic);
  let sc = "";
  zones.forEach(([a, b, c, lbl], i) => {
    const hl = i === 1 ? 0.55 + 0.45 * P(t, PT("i14", 1), PT("i14", 1) + 0.5) : 0.5;
    sc += `<rect x="${fx(X(a))}" y="${y - 40}" width="${fx(X(b) - X(a))}" height="80" fill="${c}" opacity="${fx(hl)}"/>`;
    sc += T((X(a) + X(b)) / 2, y + 120, lbl, { size: i === 1 ? 54 : 44, font: "anton", fill: i === 1 ? COL.green : "#C9D3E0", ls: 2 });
  });
  sc += `<rect x="${x0}" y="${y - 40}" width="${x1 - x0}" height="80" rx="10" fill="none" stroke="#F5F7FB" stroke-width="6"/>`;
  g += op(sk, sc);
  const mv = kf(t, [[PT("i14", 1), 0.16], [PT("i14", 1) + 1.0, 0.55, E.inOutCubic], [PT("i15", 0) + 0.2, 0.55], [PT("i15", 0) + 0.7, 0.86, E.inOutCubic], [PT("i15", 1), 0.86], [PT("i15", 1) + 0.6, 0.55, E.inOutCubic]]);
  if (sk > 0.5) g += G(tr(X(mv), y - 120), `<path d="M -26 34 L 26 34 L 0 74 Z" fill="#F5F7FB"/>` + tBadge(0, -20, 0.62, COL.orange));
  g += pop(t, PT("i14", 1) + 0.3, 960, 790, pill(0, 0, "ZIEL: GESUNDES NORMALNIVEAU", { size: 54, bg: COL.green }), {});
  // Superheld? -> Nein
  const sh = PT("i15", 0);
  g += pop(t, sh + 0.2, X(0.86), 330, pill(0, 0, "SUPERHELD?", { size: 44, bg: "#3A2B73" }), {});
  if (t > PT("i15", 1)) g += bigCross(X(0.86), 330, 0.55, P(t, PT("i15", 1), PT("i15", 1) + 0.35));
  if (t > PT("i15", 1) + 0.6) g += checkIcon(X(0.55), 370, 1.1 * popScale(t, PT("i15", 1) + 0.6));
  // Und der Kopf? Kommt später.
  const hk = PT("i16", 0);
  g += pop(t, hk, 1500, 930, brain(0, 0, 0.42) + T(110, 20, "?", { size: 100, font: "anton", fill: COL.yellow }), {});
  g += pop(t, PT("i16", 1), 1240, 930, pill(0, 0, "KOMMT SPÄTER", { size: 46, bg: "#3A2B73" }), {});
  return g;
});
sfx(S("i14") - 0.3, "whoosh", 0.5); sfx(PT("i14", 0), "pop"); sfx(PT("i14", 1) + 0.3, "pop");
sfx(PT("i15", 0) + 0.2, "pop", 0.7); sfx(PT("i15", 1), "stamp", 0.7); sfx(PT("i15", 1) + 0.6, "tick"); sfx(PT("i16", 0), "pop"); sfx(PT("i16", 1), "pop", 0.7);

// ======================= KAPITEL 1: SCHLAF =======================
WIPES.push({ at: S("s1") - 0.3, color: "#5B4BD6" });
sfx(S("s1") - 0.5, "whoosh", 0.9);
shot("s07", S("s1") - 0.3, cutAt("s4"), (t, lt, d) => {
  let g = photo("S07", lt / d);
  g += shade("T", 0.7);
  g += chapterBanner(t, S("s1"), S("s3") - 0.3, "01", "SCHLAF", null, "#5B4BD6", { size: 110, y: 70 });
  g += pop(t, PT("s2", 0), 1420, 270, pill(0, 0, "LANGWEILIG?", { size: 50, bg: "#2B3A6B" }), { out: S("s3") - 0.2 });
  g += op(1 - P(t, S("s3") - 0.2, S("s3") + 0.1), stamp(1420, 400, "IST ES NICHT!", t, PT("s2", 1), { size: 60, color: COL.yellow }));
  // Testosteron entsteht im Schlaf
  const a = S("s3");
  g += fadePanel(t, a, null, panel(70, 70, 760, 330, { stroke: "#3A4A80" }) +
    T(450, 140, "TESTOSTERON-BILDUNG", { size: 46, font: "barlow", fill: "#C9D3E0", ls: 2 }) +
    battery(370, 245, lerp(0.15, 1, P(t, a + 0.3, EN("s3"), E.inOutSine)), 1.1, { bolt: true }) + crescent(620, 245, 56, "#FFE7A3", "#141A2E") +
    T(450, 370, "VOR ALLEM IM SCHLAF", { size: 50, font: "anton", fill: COL.orange }));
  if (t > a) g += op(P(t, a, a + 0.4), emote("zzz", 800, 470, t, 1.2));
  return g;
}, { xf: 0 });
sfx(PT("s2", 0), "pop"); sfx(PT("s2", 1), "stamp"); sfx(S("s3"), "pop"); sfx(S("s3") + 0.5, "charge", 0.6);

shot("s08", cutAt("s4"), cutAt("s7"), (t, lt, d) => {
  let g = gfxBg(t, "S07", COL.purple);
  g += pop(t, PT("s4", 0), 960, 110, pill(0, 0, "EINE STUDIE", { size: 50, bg: "#5B4BD6" }), {});
  g += popTitle(t, WT("s4", "Junge") - 0.1, 960, 230, [["JUNGE, GESUNDE MÄNNER", "#fff"]], { size: 70 });
  // 7 Nächte mit je 5 von 8 Stunden
  const days = ["MO", "DI", "MI", "DO", "FR", "SA", "SO"];
  days.forEach((dd, i) => {
    const at = WT("s4", "Woche") - 0.2 + i * 0.12, x = 960 + (i - 3) * 200;
    const fk = P(t, at + 0.1, at + 0.5, E.outCubic);
    g += pop(t, at, x, 400, `<rect x="-80" y="-70" width="160" height="150" rx="22" fill="#1A2448" stroke="#3A4A80" stroke-width="4"/>` +
      crescent(-42, -30, 22, "#FFE7A3", "#1A2448") + T(28, -16, dd, { size: 34, font: "barlow", fill: "#C9D3E0" }) +
      `<rect x="-60" y="22" width="120" height="26" rx="13" fill="#2A3558"/><rect x="-60" y="22" width="${fx(120 * 0.62 * fk)}" height="26" rx="13" fill="${COL.blue}"/>`, { dur: 0.3 });
  });
  g += pop(t, WT("s4", "fünf"), 960, 545, T(0, 0, "NUR 5 STUNDEN PRO NACHT", { size: 52, font: "anton", fill: COL.blue, ls: 2 }), {});
  g += popTitle(t, S("s5"), 960, 710, [["ERGEBNIS?", COL.yellow]], { size: 110, out: S("s6") - 0.05 });
  // Balken
  const a = S("s6"), base = 1000, hMax = 300;
  if (t > a - 0.05) {
    const k1 = P(t, a, a + 0.4, E.outCubic), k2 = P(t, a + 0.25, a + 0.9, E.outCubic);
    const bar = (x, h, c, lbl) => `<rect x="${x - 90}" y="${fx(base - h)}" width="180" height="${fx(h)}" rx="14" fill="${c}"/>` + T(x, base + 52, lbl, { size: 38, font: "barlow", fill: "#C9D3E0" });
    g += bar(760, hMax * k1, "#7F8FB8", "NORMALER SCHLAF") + bar(1160, hMax * 0.87 * k2, COL.orange, "1 WOCHE À 5 STD.");
    g += `<line x1="640" y1="${base - hMax}" x2="1280" y2="${base - hMax}" stroke="#F5F7FB" stroke-width="3" stroke-dasharray="12 10" opacity="${fx(k2 * 0.6)}"/>`;
    g += pop(t, a + 0.9, 1480, base - hMax + 30, T(0, 0, "−10 bis 15 %", { size: 70, font: "anton", fill: COL.red }) + T(0, 52, "Testosteron", { size: 40, font: "barlow", fill: "#FFB3BD" }), {});
  }
  g += pop(t, PT("s6", 1), 1480, base - 70, pill(0, 0, "☀ TAGSÜBER", { size: 46, bg: "#B5520E" }), {});
  g += op(P(t, a + 0.5, a + 1.0), T(1890, 1060, "Leproult & Van Cauter, JAMA 2011 – kleine Studie, 10 Teilnehmer", { size: 26, font: "barlow6", fill: "#8E9BB3", anchor: "end" }));
  return g;
});
sfx(cutAt("s4"), "whoosh", 0.4); sfx(PT("s4", 0), "pop"); sfx(WT("s4", "Junge") - 0.1, "pop", 0.6);
for (let i = 0; i < 7; i++) sfx(WT("s4", "Woche") - 0.2 + i * 0.12, "tick", 0.35);
sfx(S("s5"), "pop"); sfx(S("s6"), "whoosh", 0.4); sfx(S("s6") + 0.9, "stamp", 0.6); sfx(PT("s6", 1), "pop", 0.7);

function sleepBar(t, a, e) {
  const k = P(t, a + 0.2, e, E.inOutSine);
  return `<rect x="-300" y="-30" width="600" height="60" rx="30" fill="#1D2750"/><rect x="-300" y="-30" width="${fx(600 * k)}" height="60" rx="30" fill="${COL.blue}"/>` +
    T(-300, 90, "23:00", { size: 46, font: "bebas", fill: "#C9D3E0", anchor: "start" }) + T(300, 90, "07:00", { size: 46, font: "bebas", fill: "#C9D3E0", anchor: "end" }) +
    crescent(-350, -80, 38, "#FFE7A3", "#0B1020") + sun(350, -86, 28, t);
}
shot("s09", cutAt("s7"), cutAt("s10"), (t, lt, d) => {
  const k = lt / d;
  let g = photo("S09", k);
  g += pop(t, PT("s7", 0), 1500, 520, battery(0, 0, 0.12, 1.1) + T(0, 130, "PLATT", { size: 80, font: "anton", fill: COL.red }), { out: S("s8") - 0.1 });
  const [hx, hy] = kbXY(560, 120, k, KB.S09);
  g += pop(t, PT("s7", 1) + 0.1, hx + 60, hy + 40, emote("question", 0, 0, t, 1.1), { out: S("s8") - 0.1 });
  g += pop(t, PT("s7", 1) + 0.3, hx + 170, hy - 10, emote("question", 0, 0, t, 0.85), { out: S("s8") - 0.1 });
  // Panel rechts (Uhr an der Wand bleibt frei)
  const a = S("s8"), b = S("s9");
  g += fadePanel(t, a - 0.05, null, panel(1110, 330, 760, 440, { stroke: "#3A4A80" }));
  if (t < b - 0.05) {
    g += popTitle(t, a, 1490, 440, [["7–9", COL.yellow], ["STUNDEN", "#fff"]], { size: 96 });
    g += pop(t, a + 0.2, 1490, 590, sleepBar(t, a, EN("s8")), {});
    g += pop(t, PT("s8", 1), 1490, 730, pill(0, 0, "FEST EINGEPLANT", { size: 44, bg: "#5B4BD6" }), {});
  } else {
    g += pop(t, b, 1250, 520, coffeeCup(0, 0, 0.95, t), {});
    g += popTitle(t, b + 0.1, 1590, 440, [["KOFFEIN", "#fff"]], { size: 84 });
    g += pop(t, PT("s9", 1), 1590, 540, T(0, 0, "NUR BIS CA. 15 UHR", { size: 50, font: "anton", fill: COL.yellow }), {});
    // auf die Wanduhr im Bild zeigen
    const [cx, cy] = kbXY(1506, 174, k, KB.S09);
    const rk = P(t, PT("s9", 1), PT("s9", 1) + 0.4, E.outBack);
    if (rk > 0) g += `<circle cx="${fx(cx)}" cy="${fx(cy)}" r="${fx(125 * rk)}" fill="none" stroke="${COL.yellow}" stroke-width="10" opacity="${fx(0.6 + 0.4 * Math.sin(t * 6))}"/>`;
    const ck = P(t, PT("s9", 2), PT("s9", 2) + 1.2);
    if (ck > 0) {
      let path = "";
      for (let i = 0; i <= 40 * ck; i++) { const x = -300 + i * 15, y = -100 * Math.pow(0.5, i / 14); path += (i ? " L " : "M ") + fx(x) + " " + fx(y); }
      g += G(tr(1490, 700), `<line x1="-320" y1="0" x2="320" y2="0" stroke="#3A4A80" stroke-width="4"/><path d="${path}" stroke="${COL.orange}" stroke-width="9" fill="none" stroke-linecap="round"/>` +
        T(-320, 46, "15 Uhr", { size: 34, font: "barlow", fill: "#C9D3E0", anchor: "start" }) + T(320, 46, "23 Uhr: wirkt noch", { size: 34, font: "barlow", fill: COL.orange, anchor: "end" }));
    }
  }
  return g;
});
sfx(cutAt("s7"), "whoosh", 0.3); sfx(PT("s7", 0), "pop"); sfx(PT("s7", 1) + 0.1, "pop", 0.6); sfx(S("s8"), "pop"); sfx(PT("s8", 1), "tick");
sfx(S("s9"), "pop"); sfx(PT("s9", 1), "pop", 0.7); sfx(PT("s9", 2), "whoosh", 0.3);

// Checkliste auf hellem Grund
function checklist(t, x, y, heading, items, o = {}) {
  const w = o.w || 640, rowH = o.rowH || 112;
  let g = `<rect x="8" y="12" width="${w}" height="${110 + items.length * rowH + 26}" rx="34" fill="#05070D" opacity="0.4"/>`;
  g += `<rect x="0" y="0" width="${w}" height="${110 + items.length * rowH + 26}" rx="34" fill="#F5F7FB"/>`;
  g += `<rect x="0" y="0" width="${w}" height="96" rx="34" fill="${o.head || COL.orange}"/><rect x="0" y="60" width="${w}" height="36" fill="${o.head || COL.orange}"/>`;
  g += T(w / 2, 66, heading, { size: 52, font: "anton", fill: "#fff", ls: 3 });
  items.forEach((it, i) => {
    const at = it[0], yy = 110 + i * rowH + rowH / 2;
    const bad = it[2] === "x";
    if (t < at) {
      g += `<rect x="36" y="${yy - 28}" width="56" height="56" rx="14" fill="none" stroke="#C9D3E0" stroke-width="6"/>`;
      g += `<rect x="120" y="${yy - 10}" width="${w - 170}" height="20" rx="10" fill="#E3E8F0"/>`;
    } else {
      const k = popScale(t, at, 0.4);
      g += G(tr(64, yy, 0, k), bad ? `<rect x="-28" y="-28" width="56" height="56" rx="14" fill="${COL.red}"/><path d="M -12 -12 L 12 12 M 12 -12 L -12 12" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`
        : `<rect x="-28" y="-28" width="56" height="56" rx="14" fill="${COL.green}"/><path d="M -13 1 L -3 11 L 14 -10" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
      g += op(clamp((t - at) / 0.25), T(120, yy + 15, it[1], { size: o.size || 46, font: "barlow", fill: "#0E1422", anchor: "start" }));
    }
  });
  return G(tr(x, y), g);
}
shot("s10", cutAt("s10"), cutAt("s13"), (t, lt, d) => {
  let g = photo("S10", lt / d);
  g += shade("R", 0.6);
  const items = [[PT("s10", 0) + 0.1, "Dunkles Zimmer"], [PT("s10", 1), "Gleiche Schlafenszeit"], [PT("s10", 2), "Gleiche Aufstehzeit"]];
  const ruin = S("s12");
  const shake = shakeX(t, ruin + 0.15, 0.5, 12);
  g += pop(t, S("s10") - 0.05, 1500 + shake, 400, G(tr(-330, -290), checklist(t, 0, 0, "SCHLAF-PLAN", items, { w: 660 })), { dur: 0.4 });
  const a = S("s11");
  g += pop(t, a, 1500, 860, phoneNight(0, 0, 1.0, "02:00") + `<circle r="200" fill="url(#gGlowW)" opacity="0.25"/>`, {});
  const xk = P(t, WT("s11", "zwei") - 0.1, WT("s11", "zwei") + 0.3, E.outCubic);
  if (xk > 0) g += bigCross(1500, 860, 0.85, xk);
  g += stamp(1500, 380, "RUINIERT DEN PLAN", t, ruin + 0.15, { size: 58 });
  return g;
});
function shakeX(t, at, dur, amp) { return t > at && t < at + dur ? Math.sin(t * 70) * amp * (1 - (t - at) / dur) : 0; }
sfx(cutAt("s10"), "whoosh", 0.3); sfx(S("s10") - 0.05, "pop", 0.6); ["s10"].forEach((id) => { for (let k = 0; k < 3; k++) sfx(PT(id, k) + (k ? 0 : 0.1), "tick", 0.8); });
sfx(S("s11"), "pop"); sfx(WT("s11", "zwei") - 0.1, "stamp", 0.7); sfx(S("s12") + 0.15, "stamp");

shot("s11", cutAt("s13"), S("t1") - 0.3, (t, lt, d) => {
  let g = photo("S11", lt / d);
  g += popTitle(t, WT("s13", "raus") - 0.1, 520, 210, [["RAUS IN DIE", "#fff"], ["SONNE", COL.yellow]], { size: 100 });
  g += pop(t, PT("s14", 0), 520, 420, clockFace(-230, 0, 62, 7, 0, { ring: COL.green }) + pill(50, 10, "INNERE UHR ✓", { size: 50, bg: "#24325A" }), {});
  g += pop(t, PT("s14", 1), 520, 590, `<g transform="${tr(-230, 0)}"><circle r="60" fill="${COL.yellow}"/><text x="0" y="26" text-anchor="middle" style="font-family:Anton;font-size:70px;fill:#0E1422">D</text></g>` +
    pill(50, 10, "VITAMIN D", { size: 50, bg: "#24325A" }), {});
  g += pop(t, WT("s14", "Sommer") - 0.1, 560, 700, T(0, 0, "mittags · etwa April bis September", { size: 40, font: "barlow", fill: "#0E1422" }), {});
  return g;
});
sfx(cutAt("s13"), "whoosh", 0.3); sfx(WT("s13", "raus") - 0.1, "pop"); sfx(PT("s14", 0), "pop"); sfx(PT("s14", 1), "pop"); sfx(WT("s14", "Sommer") - 0.1, "tick");

// ======================= KAPITEL 2: TRAINING & FETT =======================
WIPES.push({ at: S("t1") - 0.3, color: COL.orange });
sfx(S("t1") - 0.5, "whoosh", 0.9);
shot("s12", S("t1") - 0.3, cutAt("t4"), (t, lt, d) => {
  const panic = PT("t3", 1);
  const k = lt / d;
  let g = photo("S12", k);
  if (t > panic) g = G(tr(shakeX(t, panic, 0.6, 9), 0), g);
  g += shade("R", 0.75);
  g += chapterBanner(t, S("t1"), S("t2") - 0.15, "02", "SCHWER HEBEN", "& SCHLANK WERDEN", "#C2561B", { size: 78, y: 120, align: "right" });
  [["Kniebeugen", "KNIEBEUGEN"], ["Kreuzheben", "KREUZHEBEN"], ["Drücken", "DRÜCKEN"]].forEach(([w, lbl], i) => {
    g += pop(t, WT("t2", w) - 0.05, 1610, 300 + i * 120, pill(0, 0, lbl, { size: 56, bg: i === 0 ? COL.orange : "#3A4156", w: 420 }), { out: panic });
  });
  // Panik: Beine glühen rot
  if (t > PT("t3", 0)) g += pop(t, PT("t3", 0), 1610, 330, T(0, 0, "UND DIE GROSSEN MUSKELN?", { size: 44, font: "barlow", fill: "#C9D3E0" }), {});
  if (t > panic) {
    const pk = 0.5 + 0.5 * Math.sin(t * 16);
    const [lx, ly] = kbXY(640, 800, k, KB.S12);
    g += op(P(t, panic, panic + 0.3) * (0.45 + 0.4 * pk), `<ellipse cx="${fx(lx)}" cy="${fx(ly)}" rx="330" ry="250" fill="url(#gGlowR)"/>`);
    g += pop(t, panic + 0.05, 1610, 560, title(0, 0, [["PANIK!", COL.red]], { size: 150 }), { rot: -8 });
    g += pop(t, panic + 0.15, lx - 300, ly - 120, emote("excl", 0, 0, t, 1.1), {});
    g += pop(t, panic + 0.25, lx + 330, ly - 160, emote("excl", 0, 0, t, 0.9), {});
  }
  return g;
}, { xf: 0 });
sfx(WT("t2", "Kniebeugen") - 0.05, "pop", 0.6); sfx(WT("t2", "Kreuzheben") - 0.05, "pop", 0.6); sfx(WT("t2", "Drücken") - 0.05, "pop", 0.6);
sfx(PT("t3", 0), "tick"); sfx(PT("t3", 1) - 0.05, "alarm");

// Funkgespräch Muskel <-> Zentrale
function headsetBrain(s) {
  return G(tr(0, 0, 0, s), brain(0, 0, 1) + `<path d="M -150 -60 C -150 -200 150 -200 150 -60" stroke="#1A1F2B" stroke-width="16" fill="none"/><rect x="-176" y="-80" width="40" height="80" rx="14" fill="#1A1F2B"/><rect x="136" y="-80" width="40" height="80" rx="14" fill="#1A1F2B"/><path d="M -156 -10 C -170 60 -110 90 -60 90" stroke="#1A1F2B" stroke-width="10" fill="none"/><circle cx="-56" cy="90" r="14" fill="#1A1F2B"/>`);
}
shot("s13", cutAt("t4"), cutAt("t9"), (t, lt, d) => {
  const k = lt / d;
  let g = photo("S13", k);
  g += shade("R", 0.55);
  const talkB = (t > S("t6") && t < EN("t6")) || (t > S("t7") && t < EN("t7"));
  const bb = talkB ? 1 + Math.abs(Math.sin(t * 14)) * 0.05 : 1;
  g += pop(t, S("t4") + 0.2, 1660, 800, G(tr(0, 0, 0, bb), headsetBrain(0.85)) + T(0, 200, "ZENTRALE", { size: 52, font: "anton", fill: "#C8B6FF", ls: 4 }), {});
  if (t > S("t4") + 0.2) g += signalWaves(1430, 760, t, 0.9, "#FFD25A");
  const [mx, my] = kbXY(520, 520, k, KB.S13);
  if (t > S("t4") && t < S("t6")) g += signalWaves(mx + 230, my, t, 0.8, COL.red);
  // Sprechblasen
  if (t > S("t5") && t < S("t6")) {
    const ls = [];
    if (t > PT("t5", 0)) ls.push("Zentrale! Zentrale!");
    if (t > PT("t5", 2)) ls.push("Das war richtig schwer!");
    if (t > PT("t5", 3)) ls.push("Nächstes Mal: mehr Kraft!");
    g += pop(t, S("t5"), 1180, 250, speechBubble(0, 0, 820, 90 + ls.length * 66, "left", ls, { size: 56 }), { dur: 0.3 });
  }
  if (t > S("t6") && t < S("t7")) {
    const ls = ["Verstanden."]; if (t > PT("t6", 1)) ls.push("Befehl geht raus.");
    g += pop(t, S("t6"), 1400, 520, speechBubble(0, 0, 600, 90 + ls.length * 66, "right", ls, { size: 58, fill: "#E6DEFF" }), { dur: 0.3 });
  }
  if (t > S("t7") && t < S("t8")) g += pop(t, S("t7"), 1400, 540, speechBubble(0, 0, 560, 140, "right", ["Wie viel mehr?"], { size: 62, fill: "#E6DEFF" }), { dur: 0.3 });
  if (t > S("t8")) {
    const sh = shakeX(t, S("t8") + 0.05, 0.6, 14);
    g += G(tr(sh, 0), pop(t, S("t8"), 1180, 260, speechBubble(0, 0, 640, 220, "left", ["ALLES."], { size: 150, font: "Anton", fill: COL.yellow }), { dur: 0.35, ease: E.outBackBig }));
    for (let i = 0; i < 12; i++) {
      const a = i * 30 * DEG, r0 = 380, r1 = 470 + 20 * Math.sin(t * 20 + i);
      g += op(P(t, S("t8"), S("t8") + 0.2), `<line x1="${fx(1180 + Math.cos(a) * r0)}" y1="${fx(260 + Math.sin(a) * r0 * 0.6)}" x2="${fx(1180 + Math.cos(a) * r1)}" y2="${fx(260 + Math.sin(a) * r1 * 0.6)}" stroke="${COL.yellow}" stroke-width="10" stroke-linecap="round"/>`);
    }
  }
  return g;
});
sfx(cutAt("t4"), "whoosh", 0.4); sfx(S("t4") + 0.2, "zap", 0.7); sfx(S("t5"), "pop"); sfx(S("t6"), "pop"); sfx(S("t7"), "pop"); sfx(S("t8"), "boom");

shot("s14", cutAt("t9"), cutAt("t12"), (t, lt, d) => {
  let g = gfxBg(t, "S13", COL.orange);
  const pk = P(t, S("t10") - 0.35, S("t10") + 0.1, E.inOutCubic);
  g += pop(t, S("t9") + 0.05, 960, lerp(520, 140, pk), G(tr(0, 0, 0, lerp(1.6, 1, pk)), pill(0, 0, "STARK VEREINFACHT", { size: 54, bg: "#3A4A80" })), { rot: -4 });
  const a = S("t10");
  let c1 = `<rect x="-400" y="-280" width="800" height="600" rx="40" fill="#F5F7FB"/>` + T(0, -190, "KURZFRISTIG", { size: 70, font: "anton", fill: "#0E1422", ls: 3 });
  const k1 = P(t, a + 0.4, a + 1.6, E.inOutSine);
  let path = "";
  for (let i = 0; i <= 60 * k1; i++) { const x = -300 + i * 10, bump = Math.exp(-Math.pow((i - 28) / 7, 2)); path += (i ? " L " : "M ") + fx(x) + " " + fx(120 - bump * 200); }
  c1 += `<line x1="-300" y1="130" x2="300" y2="130" stroke="#C9D3E0" stroke-width="6"/>` + (path ? `<path d="${path}" stroke="${COL.orange}" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : "");
  c1 += op(P(t, a + 1.0, a + 1.3), T(0, 220, "Testosteron steigt kurz an", { size: 44, font: "barlow", fill: "#0E1422" }) + T(0, 272, "nach schweren Grundübungen", { size: 38, font: "barlow6", fill: "#3E4A66" }));
  g += pop(t, a, 510, 610, c1, { dur: 0.45 });
  const b = S("t11");
  let c2 = `<rect x="-400" y="-280" width="800" height="600" rx="40" fill="#F5F7FB"/>` + T(0, -190, "LANGFRISTIG", { size: 70, font: "anton", fill: "#0E1422", ls: 3 });
  const m = WT("t11", "Muskeln"), f = WT("t11", "Fett");
  for (let i = 0; i < 4; i++) {
    const hk = P(t, m - 0.1 + i * 0.1, m + 0.4 + i * 0.1, E.outBack), h = (50 + i * 40) * hk;
    c2 += `<rect x="${-300 + i * 70}" y="${fx(110 - h)}" width="54" height="${fx(h)}" rx="10" fill="${COL.green}"/>`;
    const fk = P(t, f - 0.1 + i * 0.1, f + 0.4 + i * 0.1, E.outBack), fh = (170 - i * 40) * fk;
    c2 += `<rect x="${40 + i * 70}" y="${fx(110 - fh)}" width="54" height="${fx(fh)}" rx="10" fill="${COL.yellow}"/>`;
  }
  c2 += `<line x1="-320" y1="110" x2="320" y2="110" stroke="#C9D3E0" stroke-width="6"/>`;
  c2 += op(P(t, m, m + 0.3), T(-160, 170, "MUSKELN ↑", { size: 46, font: "anton", fill: "#178A5A" })) + op(P(t, f, f + 0.3), T(180, 170, "FETT ↓", { size: 46, font: "anton", fill: "#B58A12" }));
  c2 += op(P(t, WT("t11", "indirekt") - 0.1, WT("t11", "indirekt") + 0.3), T(0, 260, "= wirkt indirekt", { size: 44, font: "barlow", fill: "#3E4A66" }));
  g += pop(t, b, 1410, 610, c2, { dur: 0.45 });
  return g;
});
sfx(cutAt("t9"), "whoosh", 0.4); sfx(S("t9") + 0.05, "pop"); sfx(S("t10"), "whoosh", 0.5); sfx(S("t11"), "whoosh", 0.5);
for (let i = 0; i < 4; i++) { sfx(WT("t11", "Muskeln") + i * 0.1, "tick", 0.35); sfx(WT("t11", "Fett") + i * 0.1, "tick", 0.35); }

const EXES = [["Kniebeugen", "Kniebeugen"], ["Kreuzheben", "Kreuzheben"], ["Rudern", "Rudern"], ["Drücken", "Drücken"], ["Klimmzüge", "Klimmzüge"]];
shot("s15", cutAt("t12"), cutAt("t14"), (t, lt, d) => {
  let g = photo("S15", lt / d);
  g += shade("L", 0.75);
  const items = EXES.map(([w, lbl]) => [WT("t12", w) - 0.05, lbl]);
  g += pop(t, S("t12"), 420, 450, G(tr(-320, -330), checklist(t, 0, 0, "GRUNDÜBUNGEN", items, { w: 640, rowH: 96 })), { dur: 0.4 });
  const a = S("t13");
  const strike = P(t, WT("t13", "Spiegel") - 0.1, WT("t13", "Spiegel") + 0.3, E.outCubic);
  g += pop(t, a, 420, 930, pill(0, 0, "1 STD. BIZEPS VORM SPIEGEL", { size: 46, bg: "#3A4156", w: 640 }) + crossIcon(-350, -2, 1.05) +
    (strike > 0 ? `<line x1="-290" y1="-4" x2="${fx(-290 + 590 * strike)}" y2="-4" stroke="${COL.red}" stroke-width="10" stroke-linecap="round"/>` : ""), {});
  return g;
});
sfx(cutAt("t12"), "whoosh", 0.3); EXES.forEach(([w]) => sfx(WT("t12", w) - 0.05, "tick", 0.8)); sfx(S("t13"), "pop"); sfx(WT("t13", "Spiegel") - 0.1, "stamp", 0.7);

shot("s16", cutAt("t14"), cutAt("t16"), (t, lt, d) => {
  let g = photo("S16", lt / d);
  g += shade("L", 0.8);
  g += popTitle(t, PT("t14", 0) + 0.1, 470, 250, [["DER HEIMLICHE", "#fff"]], { size: 70 });
  g += popTitle(t, PT("t14", 0) + 0.4, 470, 360, [["SABOTEUR:", COL.red]], { size: 96 });
  g += pop(t, PT("t14", 1), 470, 500, title(0, 0, [["KÖRPERFETT", COL.yellow]], { size: 120 }), { ease: E.outBackBig });
  g += pop(t, PT("t15", 0), 470, 680, pill(0, 0, "NUR SPEICHER?", { size: 50, bg: "#3A4156" }), {});
  if (t > PT("t15", 1)) g += op(0.5 + 0.5 * Math.sin(t * 5), `<circle cx="270" cy="860" r="150" fill="url(#gGlowO)"/>`);
  g += pop(t, PT("t15", 1), 270, 860, fatCell(0, 0, 0.55, t), {});
  g += stamp(560, 860, "AKTIV!", t, WT("t15", "aktiv", 0) - 0.05, { size: 84, color: COL.orange });
  return g;
});
sfx(cutAt("t14"), "whoosh", 0.3); sfx(PT("t14", 0) + 0.1, "pop", 0.6); sfx(PT("t14", 0) + 0.4, "pop"); sfx(PT("t14", 1), "boom", 0.5);
sfx(PT("t15", 0), "pop", 0.7); sfx(PT("t15", 1), "pop"); sfx(WT("t15", "aktiv") - 0.05, "stamp");

// Aromatase + Teufelskreis
function moleculeT(x, y, s) { return tBadge(x, y, s, COL.orange, "T"); }
function moleculeE(x, y, s) { return tBadge(x, y, s, COL.pink, "E"); }
shot("s17", cutAt("t16"), cutAt("t19"), (t, lt, d) => {
  let g = gfxBg(t, "S16", COL.yellow);
  const cyc = S("t17");
  const ok = 1 - P(t, cyc - 0.3, cyc + 0.1);
  if (ok > 0) {
    let c = "";
    c += pop(t, S("t16"), 420, 560, fatCell(0, 0, 1.05, t, { glow: 0.5 }), { dur: 0.5 });
    c += pop(t, S("t16") + 0.1, 960, 170, title(0, 0, [["FETT BILDET EIN ENZYM", "#fff"]], { size: 76 }), {});
    const ea = WT("t16", "Aromatase") - 0.15;
    if (t > ea) {
      const ex = lerp(520, 960, P(t, ea, ea + 0.6, E.outCubic));
      c += enzyme(ex, 560, 1.25, t, { rot: 180 });
      c += op(P(t, ea + 0.3, ea + 0.6), T(960, 780, "AROMATASE", { size: 72, font: "anton", fill: COL.purple, ls: 3 }));
    }
    const cv = PT("t16", 1) + 0.2;
    for (let i = 0; i < 4; i++) {
      const t0 = cv + i * 0.7, kk = (t - t0) / 1.2;
      if (kk > 0 && kk < 1.4) {
        if (kk < 0.5) c += moleculeT(lerp(560, 920, E.inQuad(kk / 0.5)), 560 + (1 - kk / 0.5) * -170, 0.72);
        else if (kk > 0.55) c += moleculeE(lerp(1000, 1520, E.outCubic(clamp((kk - 0.55) / 0.6))), 560 - (kk - 0.55) * 160, 0.72);
      }
    }
    c += op(P(t, cv, cv + 0.3), T(640, 360, "TESTOSTERON", { size: 52, font: "anton", fill: COL.orange }));
    c += op(P(t, cv + 0.6, cv + 0.9), T(1460, 360, "→ ÖSTROGEN", { size: 52, font: "anton", fill: COL.pink }));
    g += op(ok, c);
  }
  if (t > cyc - 0.3) {
    const ck = P(t, cyc - 0.3, cyc + 0.1);
    const cx = 960, cy = 570, R = 300;
    let ring = `<circle r="${R}" fill="none" stroke="#2C3966" stroke-width="26"/>`;
    for (let i = 0; i < 4; i++) {
      const a0 = (-90 + i * 90 + 18) * DEG, a1 = (-90 + (i + 1) * 90 - 18) * DEG;
      const on = t > PT("t17", Math.min(3, i)) + 0.3, c = on ? COL.orange : "#43507E";
      ring += `<path d="M ${fx(Math.cos(a0) * R)} ${fx(Math.sin(a0) * R)} A ${R} ${R} 0 0 1 ${fx(Math.cos(a1) * R)} ${fx(Math.sin(a1) * R)}" stroke="${c}" stroke-width="20" fill="none" stroke-linecap="round" ${t > S("t18") ? `stroke-dasharray="30 22" stroke-dashoffset="${fx(-t * 160)}"` : ""}/>`;
      ring += `<path d="M -26 -22 L 26 0 L -26 22 Z" fill="${c}" transform="translate(${fx(Math.cos(a1) * R)} ${fx(Math.sin(a1) * R)}) rotate(${fx(-90 + (i + 1) * 90 - 18 + 90)})"/>`;
    }
    g += op(ck, G(tr(cx, cy), ring));
    const nodes = [[0, -R, "MEHR FETT", COL.yellow, fatCell(0, 0, 0.32, t)], [R, 0, "MEHR ÖSTROGEN", COL.pink, moleculeE(0, 0, 0.6)],
      [0, R, "WENIGER TESTOSTERON", COL.orange, moleculeT(0, 0, 0.6) + arrowUpDown(70, 10, false, COL.red, 0.6)], [-R, 0, "NOCH MEHR FETT", COL.yellow, fatCell(0, 0, 0.42, t + 1)]];
    nodes.forEach(([x, y, lbl, c, icon], i) => {
      const at = PT("t17", i), hl = t > at && t < at + 0.9 ? 1.12 : 1;
      const lx = x > 50 ? 150 : x < -50 ? -150 : 0, ly = y < -50 ? -120 : y > 50 ? 130 : 95;
      g += pop(t, at, cx + x, cy + y, G(tr(0, 0, 0, hl), `<circle r="95" fill="#141C38" stroke="${c}" stroke-width="8"/>` + icon) +
        T(lx * 1.6, ly + (Math.abs(lx) > 0 ? 18 : 0), lbl, { size: 48, font: "anton", fill: c, anchor: lx > 0 ? "start" : lx < 0 ? "end" : "middle", stroke: "#0B1020", sw: 10 }), { dur: 0.4 });
    });
    g += pop(t, S("t18") + 0.05, cx, cy - 20, title(0, 0, [["TEUFELS-", "#fff"]], { size: 72 }) + title(0, 76, [["KREIS", COL.red]], { size: 72 }), { ease: E.outBackBig });
  }
  return g;
});
sfx(cutAt("t16"), "whoosh", 0.4); sfx(S("t16"), "pop"); sfx(WT("t16", "Aromatase") - 0.15, "whoosh", 0.4);
for (let i = 0; i < 4; i++) sfx(PT("t16", 1) + 0.2 + i * 0.7 + 0.6, "tick", 0.5);
for (let i = 0; i < 4; i++) sfx(PT("t17", i), "pop", 0.8);
sfx(S("t18") + 0.05, "boom", 0.6);

function fatScale(t, v, o = {}) {
  const x0 = o.x0 || 860, x1 = o.x1 || 1800, y = o.y || 600;
  const X = (p) => lerp(x0, x1, (p - 5) / 25);
  let g = "";
  const zones = [[5, 8, COL.red], [8, 12, COL.yellow], [12, 15, COL.green], [15, 20, COL.yellow], [20, 30, "#FF7A45"]];
  zones.forEach(([a, b, c]) => { g += `<rect x="${fx(X(a))}" y="${y - 30}" width="${fx(X(b) - X(a))}" height="60" fill="${c}" opacity="${o.hl === a ? 1 : 0.5}"/>`; });
  g += `<rect x="${x0}" y="${y - 30}" width="${x1 - x0}" height="60" rx="8" fill="none" stroke="#F5F7FB" stroke-width="5"/>`;
  [5, 8, 12, 15, 20, 25, 30].forEach((p) => { g += T(X(p), y + 76, p + "%", { size: 36, font: "barlow", fill: "#C9D3E0" }); });
  g += `<g transform="${tr(X(v), y - 46)}"><path d="M -26 -40 L 26 -40 L 0 0 Z" fill="#F5F7FB"/><rect x="-66" y="-104" width="132" height="60" rx="16" fill="#F5F7FB"/>
    <text x="0" y="-60" text-anchor="middle" style="font-family:Anton;font-size:44px;fill:#0E1422">${Math.round(v)} %</text></g>`;
  return g;
}
shot("s18", cutAt("t19"), S("e1") - 0.3, (t, lt, d) => {
  let g = photo("S18", lt / d);
  g += shade("R", 0.6);
  g += popTitle(t, PT("t19", 1), 1330, 190, [["WIE", "#fff"], ["SCHLANK?", COL.yellow]], { size: 100 });
  const a = S("t20");
  if (t > a - 0.1) {
    g += fadePanel(t, a - 0.1, null, panel(800, 300, 1060, 720, { stroke: "#3A4A80" }) + T(1330, 380, "KÖRPERFETT", { size: 54, font: "anton", fill: "#F5F7FB", ls: 3 }));
    const v = kf(t, [[a, 24], [a + 0.2, 24], [WT("t20", "Zwölf") + 0.6, 13.5, E.inOutCubic], [S("t21"), 13.5], [S("t21") + 0.7, 6.5, E.inOutCubic], [S("t22"), 6.5], [S("t22") + 0.8, 24, E.inOutCubic], [PT("t22", 2), 24], [EN("t22"), 15, E.inOutSine]]);
    const hl = t < S("t21") ? 12 : t < S("t22") ? 5 : t < PT("t22", 2) ? 20 : 12;
    g += op(P(t, a, a + 0.3), fatScale(t, v, { hl, y: 560 }));
    if (t < S("t21")) {
      g += pop(t, PT("t20", 0) + 0.4, 1330, 760, pill(0, 0, "FAUSTREGEL: 12–15 %", { size: 56, bg: COL.green }), {});
      g += pop(t, PT("t20", 1), 1330, 880, T(0, 0, "aus dem Kraftsport – keine medizinische Norm", { size: 42, font: "barlow", fill: "#C9D3E0" }), {});
    } else if (t < S("t22")) {
      g += pop(t, S("t21") + 0.2, 1330, 760, pill(0, 0, "UNTER 8 %: ZU EXTREM", { size: 56, bg: COL.red }), {});
      g += pop(t, PT("t21", 2), 1330, 880, T(0, 0, "Hormone können absacken ↓", { size: 46, font: "barlow", fill: "#FFB3BD" }), {});
    } else {
      g += pop(t, S("t22") + 0.3, 1330, 760, pill(0, 0, "ÜBER 20 %? KALORIENDEFIZIT", { size: 52, bg: "#FF7A45" }), {});
      g += pop(t, PT("t22", 2), 1330, 890, T(0, 0, "−300 bis −500 kcal pro Tag", { size: 60, font: "anton", fill: COL.yellow }), {});
    }
  }
  return g;
});
sfx(cutAt("t19"), "whoosh", 0.3); sfx(PT("t19", 1), "pop"); sfx(S("t20"), "whoosh", 0.4); sfx(PT("t20", 0) + 0.4, "pop"); sfx(PT("t20", 1), "tick");
sfx(S("t21") + 0.2, "pop"); sfx(PT("t21", 2), "tick"); sfx(S("t22") + 0.3, "pop"); sfx(PT("t22", 2), "pop");

// ======================= KAPITEL 3: ESSEN =======================
WIPES.push({ at: S("e1") - 0.3, color: COL.green });
sfx(S("e1") - 0.5, "whoosh", 0.9);
shot("s19", S("e1") - 0.3, cutAt("e4"), (t, lt, d) => {
  let g = photo("S19", lt / d);
  g += shade("L", 0.8);
  g += chapterBanner(t, S("e1"), S("e2") - 0.1, "03", "ECHTES ESSEN", null, "#17704A", { size: 100, y: 90 });
  g += pop(t, PT("e2", 0), 330, 200, pill(0, 0, "KURZE FRAGE", { size: 50, bg: "#17704A" }), {});
  g += popTitle(t, PT("e2", 1), 470, 340, [["WORAUS WIRD", "#fff"]], { size: 84 });
  g += popTitle(t, PT("e2", 1) + 0.25, 470, 440, [["TESTOSTERON", COL.orange], ["GEBAUT?", "#fff"]], { size: 84 });
  const a = S("e3");
  g += fadePanel(t, a - 0.05, null, panel(60, 540, 840, 400, { stroke: "#2F7A55" }));
  g += pop(t, a, 260, 720, steroid(0, 0, 0.62, COL.yellow, { left: "OH", right: "tail" }) + T(20, 170, "CHOLESTERIN", { size: 50, font: "anton", fill: COL.yellow }), {});
  g += pop(t, a + 0.3, 480, 720, arrowRight(-60, 0, 120, "#F5F7FB", 1), {});
  g += pop(t, a + 0.5, 700, 720, steroid(0, 0, 0.62, COL.orange, { left: "O", right: "OH" }) + T(20, 170, "TESTOSTERON", { size: 50, font: "anton", fill: COL.orange }), {});
  return g;
}, { xf: 0 });
sfx(PT("e2", 0), "pop"); sfx(PT("e2", 1), "pop", 0.6); sfx(S("e3"), "pop"); sfx(S("e3") + 0.5, "pop");

function donut(cx, cy, r, frac, k) {
  // frac: Anteil "Körper" (grün), Rest "Essen"
  const seg = (a0, a1, c) => {
    const p0 = [Math.cos(a0) * r, Math.sin(a0) * r], p1 = [Math.cos(a1) * r, Math.sin(a1) * r];
    return `<path d="M ${fx(p0[0])} ${fx(p0[1])} A ${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${fx(p1[0])} ${fx(p1[1])}" stroke="${c}" stroke-width="${r * 0.42}" fill="none"/>`;
  };
  const A = -Math.PI / 2, f = frac * k;
  return G(tr(cx, cy), `<circle r="${r}" fill="none" stroke="#26304F" stroke-width="${r * 0.42}"/>` + (f > 0 ? seg(A, A + TAU * Math.min(f, 0.999), COL.green) : "") +
    (k >= 1 ? seg(A + TAU * frac, A + TAU * 0.999, COL.yellow) : ""));
}
shot("s20", cutAt("e4"), cutAt("e7"), (t, lt, d) => {
  let g = gfxBg(t, "S19", COL.green);
  g += popTitle(t, S("e4"), 960, 160, [["CHOLESTERIN", COL.yellow]], { size: 100 });
  const dk = P(t, S("e4") + 0.2, S("e4") + 1.2, E.inOutCubic);
  g += pop(t, S("e4") + 0.1, 520, 600, donut(0, 0, 230, 0.78, dk), {});
  g += op(P(t, S("e4") + 0.8, S("e4") + 1.1), T(520, 590, "KÖRPER", { size: 64, font: "anton", fill: COL.green }) + T(520, 650, "macht's selbst", { size: 40, font: "barlow", fill: "#C9D3E0" }));
  g += op(P(t, S("e4") + 1.1, S("e4") + 1.4), T(250, 360, "Essen", { size: 42, font: "barlow", fill: COL.yellow, anchor: "end" }));
  g += pop(t, WT("e4", "größtenteils") - 0.1, 520, 920, pill(0, 0, "GRÖSSTENTEILS SELBST GEBILDET", { size: 44, bg: "#17704A" }), {});
  const a = S("e5");
  g += pop(t, a, 1360, 420, `<path d="M 0 -80 L 92 80 L -92 80 Z" fill="${COL.yellow}" stroke="#0B1020" stroke-width="6" stroke-linejoin="round"/>` + T(0, 62, "!", { size: 110, font: "anton", fill: "#0B1020" }), {});
  g += pop(t, WT("e5", "fettarmes") - 0.1, 1360, 580, pill(0, 0, "SEHR FETTARM ESSEN", { size: 50, bg: "#3A4156" }), {});
  g += pop(t, WT("e5", "drücken") - 0.2, 1360, 690, T(-40, 20, "TESTOSTERON", { size: 56, font: "anton", fill: COL.orange }) + arrowUpDown(200, 0, false, COL.red, 0.75), {});
  g += pop(t, S("e6"), 1360, 870, checkIcon(-280, 0, 1.1) + pill(40, 4, "GENUG FETT ESSEN", { size: 56, bg: COL.green }), {});
  return g;
});
sfx(cutAt("e4"), "whoosh", 0.4); sfx(S("e4"), "pop"); sfx(WT("e4", "größtenteils") - 0.1, "tick"); sfx(S("e5"), "pop"); sfx(WT("e5", "fettarmes") - 0.1, "pop", 0.6);
sfx(WT("e5", "drücken") - 0.2, "pop", 0.6); sfx(S("e6"), "tick");

// Lebensmittel-Etiketten (Zeigerziele in Bildkoordinaten von S21)
const FOOD = { egg: [830, 905], steak: [770, 985], avocado: [1050, 1000], oil: [155, 790], salmon: [1205, 930] };
shot("s21", cutAt("e7"), S("c1") - 0.3, (t, lt, d) => {
  const k = lt / d;
  let g = photo("S21", k);
  const P2 = (n) => kbXY(FOOD[n][0], FOOD[n][1], k, KB.S21);
  const L = [[WT("e7", "Eier") - 0.05, "EIER", "egg", 300, 230, COL.orange], [WT("e7", "rotes") - 0.05, "ROTES FLEISCH · IN MASSEN", "steak", 370, 345, "#B5473A"],
    [PT("e8", 0), "AVOCADO", "avocado", 1640, 230, "#4E7A2E"], [PT("e8", 1), "OLIVENÖL", "oil", 300, 560, "#7FA22A"], [WT("e9", "Lachs") - 0.1, "LACHS", "salmon", 1640, 345, "#E0613F"]];
  L.forEach(([at, txt, n, x, y, bg]) => { const [px, py] = P2(n); g += tag(t, at, x, y, txt, { px, py, size: txt.length > 12 ? 40 : 46, bg }); });
  g += pop(t, S("e10"), 1640, 470, pill(0, 0, "+ GENUG EIWEISS", { size: 50, bg: COL.green }), {});
  return g;
});
sfx(cutAt("e7"), "whoosh", 0.3); sfx(WT("e7", "Eier") - 0.05, "pop"); sfx(WT("e7", "rotes") - 0.05, "pop");
sfx(PT("e8", 0), "pop"); sfx(PT("e8", 1), "pop"); sfx(WT("e9", "Lachs") - 0.1, "pop"); sfx(S("e10"), "pop");

// ======================= KAPITEL 4: STRESS =======================
WIPES.push({ at: S("c1") - 0.3, color: COL.red });
sfx(S("c1") - 0.5, "whoosh", 0.9);
shot("s22", S("c1") - 0.3, cutAt("c4"), (t, lt, d) => {
  let g = photo("S22", lt / d);
  g += shade("R", 0.8);
  g += chapterBanner(t, S("c1"), S("c2") - 0.1, "04", "STRESS IM GRIFF", null, "#8C1D3A", { size: 84, y: 90, align: "right" });
  const v = kf(t, [[S("c2"), 0.3], [S("c2") + 0.8, 0.62, E.outBack], [PT("c3", 1), 0.5]]);
  g += pop(t, S("c2"), 1500, 300, pill(0, 0, "GEGENSPIELER", { size: 46, bg: "#8C1D3A" }), {});
  g += pop(t, S("c2") + 0.1, 1500, 600, gaugeSemi(0, 0, 210, v + Math.sin(t * 20) * 0.006, { label: "KORTISOL" }), {});
  g += pop(t, PT("c3", 0) + 0.1, 1500, 740, pill(0, 0, "NICHT BÖSE", { size: 50, bg: "#2B3A6B" }), {});
  g += pop(t, PT("c3", 1), 1500, 850, checkIcon(-240, 0, 0.8) + T(-196, 15, "hilft bei Stress", { size: 46, font: "barlow", fill: "#F5F7FB", anchor: "start" }), {});
  g += pop(t, WT("c3", "Blutzucker") - 0.1, 1500, 940, checkIcon(-240, 0, 0.8) + T(-196, 15, "hält Blutzucker stabil", { size: 46, font: "barlow", fill: "#F5F7FB", anchor: "start" }), {});
  return g;
}, { xf: 0 });
sfx(S("c2"), "pop"); sfx(S("c2") + 0.1, "pop", 0.6); sfx(PT("c3", 0) + 0.1, "pop", 0.6); sfx(PT("c3", 1), "tick"); sfx(WT("c3", "Blutzucker") - 0.1, "tick");

function moonCracked(x, y, s) { return G(tr(x, y, 0, s), crescent(0, 0, 60, "#FFE7A3", "#141C38") + `<path d="M -40 -30 L -10 -5 L -30 15 L 0 40" stroke="#FF4D5E" stroke-width="7" fill="none"/>`); }
shot("s23", cutAt("c4"), cutAt("c7"), (t, lt, d) => {
  let g = gfxBg(t, "S22", COL.red);
  g += popTitle(t, S("c4"), 960, 150, [["PROBLEM:", COL.red], ["DAUERHAFT HOCH", "#fff"]], { size: 88 });
  // Kortisol-Kurve: Stresstag mit Erholung vs. dauerhaft oben
  const ck = P(t, S("c4") + 0.3, PT("c4", 1), E.inOutSine);
  const tip = P(t, S("c5"), S("c5") + 0.6, E.inOutCubic);
  let path = "";
  const N = Math.floor(80 * ck);
  for (let i = 0; i <= N; i++) {
    const x = -330 + i * 8.25, u = i / 80;
    const y = -40 - 170 * (1 - Math.exp(-u * 5)) - 12 * Math.sin(u * 30);
    path += (i ? " L " : "M ") + fx(x) + " " + fx(y);
  }
  const lc = tip > 0.5 ? COL.red : COL.orange;
  let chart = `<rect x="-380" y="-300" width="760" height="420" rx="30" fill="#0E1530" opacity="0.9" stroke="#3A4A80" stroke-width="4"/>`;
  chart += `<line x1="-330" y1="60" x2="330" y2="60" stroke="#3A4A80" stroke-width="4"/>` + T(-330, 100, "KORTISOL", { size: 36, font: "anton", fill: "#C9D3E0", anchor: "start" });
  chart += `<line x1="-330" y1="-150" x2="330" y2="-150" stroke="${COL.red}" stroke-width="3" stroke-dasharray="14 10" opacity="0.6"/>`;
  if (path) chart += `<path d="${path}" stroke="${lc}" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  g += pop(t, S("c4") + 0.2, 960, 560, G(tr(0, 0, tip * -4 + (tip > 0 && tip < 1 ? Math.sin(t * 40) * 2 : 0)), chart), {});
  const causes = [["Schlafmangel", moonCracked(0, 0, 0.9), "SCHLAFMANGEL"], ["Übertraining", barbell(0, 0, 0.5) + emote("sweat", 70, -60, t, 0.9), "ÜBERTRAINING"], ["Scrollen", phoneNight(0, 0, 0.55), "NÄCHTLICHES SCROLLEN"]];
  causes.forEach(([w, icon, lbl], i) => { g += pop(t, WT("c4", w) - 0.1, 260, 330 + i * 250, icon + T(0, 120, lbl, { size: 34, font: "anton", fill: "#FFB3BD" }), {}); });
  g += stamp(960, 870, "DANN KIPPT ES", t, S("c5") + 0.1, { size: 64 });
  const fx3 = [["Blutzucker", "BLUTZUCKER", true], ["Bauchfett", "BAUCHFETT", true], ["Testosteron", "TESTOSTERON", false]];
  fx3.forEach(([w, lbl, up], i) => {
    g += pop(t, WT("c6", w) - 0.1, 1650, 330 + i * 250, arrowUpDown(0, -20, up, up ? COL.red : COL.orange, 0.95) + T(0, 90, lbl, { size: 40, font: "anton", fill: "#F5F7FB" }), {});
  });
  return g;
});
sfx(cutAt("c4"), "whoosh", 0.4); sfx(S("c4"), "pop"); ["Schlafmangel", "Übertraining", "Scrollen"].forEach((w) => sfx(WT("c4", w) - 0.1, "pop", 0.7));
sfx(S("c5") + 0.1, "stamp"); ["Blutzucker", "Bauchfett", "Testosteron"].forEach((w) => sfx(WT("c6", w) - 0.1, "pop", 0.7));

shot("s24", cutAt("c7"), S("r1") - 0.3, (t, lt, d) => {
  let g = photo("S24", lt / d);
  g += shade("L", 0.7);
  const items = [[PT("c7", 0) + 0.35, "Schlaf schützen"], [PT("c7", 1), "Stress runter"], [PT("c8", 1), "Alkohol: lässt er weg"]];
  g += pop(t, S("c7"), 430, 400, G(tr(-350, -260), checklist(t, 0, 0, "STRESS-PLAN", items, { head: COL.green, w: 700 })), { dur: 0.4 });
  g += pop(t, PT("c8", 1) + 0.1, 870, 610, bottleCrossed(0, 0, 0.4), {});
  g += pop(t, PT("c9", 0), 260, 880, arrowUpDown(-130, 0, false, COL.green, 0.9) + T(20, 22, "KORTISOL", { size: 58, font: "anton", fill: "#F5F7FB", anchor: "start", stroke: "#0B1020", sw: 10 }), {});
  g += pop(t, PT("c9", 2), 760, 880, arrowUpDown(-130, 0, true, COL.orange, 0.9) + T(20, 22, "TESTOSTERON", { size: 58, font: "anton", fill: "#F5F7FB", anchor: "start", stroke: "#0B1020", sw: 10 }), {});
  return g;
});
sfx(cutAt("c7"), "whoosh", 0.3); sfx(S("c7"), "pop", 0.6); sfx(PT("c7", 0) + 0.35, "tick"); sfx(PT("c7", 1), "tick"); sfx(PT("c8", 1), "tick"); sfx(PT("c8", 1) + 0.1, "pop", 0.6);
sfx(PT("c9", 0), "pop"); sfx(PT("c9", 2), "pop");

// ======================= RUDEL-PLAN =======================
WIPES.push({ at: S("r1") - 0.3, color: COL.orange });
sfx(S("r1") - 0.5, "whoosh", 0.9);
const PLAN = [["r2", "7–9 STUNDEN SCHLAF", () => crescent(0, 0, 30, "#FFE7A3", "#2E3B66")], ["r3", "SCHWERE GRUNDÜBUNGEN", () => barbell(0, 0, 0.17)],
  ["r4", "SCHLANK BLEIBEN (FAUSTREGEL 12–15 %)", () => T(0, 16, "%", { size: 52, font: "anton", fill: COL.yellow })], ["r5", "ECHTE FETTE · GENUG EIWEISS", () => avocado(0, 0, 0.3)],
  ["r6", "WENIGER STRESS · KEIN SCROLLEN UM 2 UHR", () => phoneNight(0, 0, 0.28)]];
shot("s25", S("r1") - 0.3, cutAt("r7"), (t, lt, d) => {
  let g = gfxBg(t, "S24", COL.orange);
  g += `<rect x="0" y="0" width="${W}" height="190" fill="${COL.orange}"/>`;
  g += pop(t, S("r1"), 960, 125, title(0, 0, [["DER PLAN FÜRS RUDEL", "#fff"]], { size: 104, stroke: "#B5520E", sw: 10 }) + pawPrint(-610, -36, 0.7, "#fff") + pawPrint(610, -36, 0.7, "#fff"), {});
  PLAN.forEach(([id, txt, icon], i) => {
    const y = 300 + i * 150;
    const row = `<rect x="-700" y="-58" width="1300" height="116" rx="58" fill="#1F2A4D"/><circle cx="-640" cy="0" r="46" fill="#2E3B66"/>` +
      G(tr(-640, 0), icon()) + T(-560, 18, txt, { size: txt.length > 26 ? 44 : 54, font: "anton", fill: "#F5F7FB", anchor: "start", ls: 1 }) + checkIcon(530, 0, 0.9);
    if (t < S(id)) g += op(0.35 * P(t, S("r1") + 0.2, S("r1") + 0.6), G(tr(780, y), `<rect x="-700" y="-58" width="1300" height="116" rx="58" fill="#1F2A4D"/>`));
    g += pop(t, S(id), 780, y, row, { dur: 0.4 });
  });
  g += pop(t, S("r1") + 0.3, 1680, 640, photoCard("S13.jpg", 0, 0, 340, 520, [200, 0, 760, 1080], { rot: 4 }), {});
  return g;
}, { xf: 0 });
sfx(S("r1"), "pop"); ["r2", "r3", "r4", "r5", "r6"].forEach((id) => sfx(S(id), "tick", 0.8)); sfx(S("r1") + 0.3, "pop", 0.5);

shot("s25b", cutAt("r7"), cutAt("r10"), (t, lt, d) => {
  let g = gfxBg(t, "S24");
  g += pop(t, S("r7"), 330, 520, gummyJar(0, 0, 1.3) + T(0, 330, "KEIN GUMMIBÄRCHEN", { size: 50, font: "anton", fill: "#F5F7FB" }), {});
  if (t > S("r7") + 0.5) g += bigCross(330, 520, 1.1, P(t, S("r7") + 0.5, S("r7") + 0.9));
  g += pop(t, S("r8"), 900, 520, powderTub(0, 0, 1.3) + T(0, 330, "KEIN PULVER", { size: 50, font: "anton", fill: "#F5F7FB" }), {});
  if (t > S("r8") + 0.5) g += bigCross(900, 520, 1.1, P(t, S("r8") + 0.5, S("r8") + 0.9));
  if (t > S("r9")) {
    g += pop(t, S("r9"), 1520, 520, `<circle r="380" fill="url(#gGlowO)"/>`, {});
    g += pop(t, S("r9"), 1520, 500, photoCard("S05.jpg", 0, 0, 470, 600, [300, 0, 840, 1080], { rot: -3, caption: "WOLF ✓", capColor: COL.orange }), { dur: 0.5, ease: E.outBackBig });
    g += emote("sparkle", 1840, 160, t, 1.2) + emote("sparkle", 1190, 900, t + 0.6, 1.0);
  }
  return g;
});
sfx(cutAt("r7"), "whoosh", 0.4); sfx(S("r7"), "pop"); sfx(S("r7") + 0.5, "stamp", 0.7); sfx(S("r8"), "pop"); sfx(S("r8") + 0.5, "stamp", 0.7); sfx(S("r9"), "boom", 0.6); sfx(S("r9") + 0.3, "sparkle", 0.6);

// ======================= WOCHEN SPÄTER =======================
shot("s26", cutAt("r10"), PT("r11", 1) - 0.08, (t, lt, d) => {
  let g = photo("S26", lt / d);
  const a = S("r10"), m = PT("r10", 1);
  const cal = 1 - P(t, S("r11") - 0.2, S("r11") + 0.2);
  if (cal > 0) {
    let c = shade("R", 0.7);
    const kw = P(t, a, m, E.inOutSine), km = P(t, m, EN("r10") + 0.2, E.inOutSine);
    const months = t > m;
    const n = months ? 1 + Math.floor(km * 2.99) : 1 + Math.floor(kw * 7.99);
    const flip = ((months ? km * 3 : kw * 8) % 1);
    c += calendarPage(1480, 600, 1.15, String(n), months ? "MONAT" : "WOCHE");
    if ((months ? km : kw) < 0.99) c += op(1 - flip, G(tr(1480, 600 - flip * 300, flip * 40, 1.15, 1.15 * (1 - flip * 0.6)), `<rect x="-150" y="-170" width="300" height="340" rx="26" fill="#E3E8F0"/>`));
    c += popTitle(t, a, 1480, 230, [[months ? "MONATE" : "WOCHEN", COL.yellow], ["SPÄTER", "#fff"]], { size: 100 });
    g += op(cal, c);
  }
  if (t > S("r11")) g += emote("sparkle", 1150, 260, t, 1.2);
  return g;
});
sfx(cutAt("r10"), "whoosh", 0.5); for (let i = 0; i < 8; i++) sfx(S("r10") + i * ((PT("r10", 1) - S("r10")) / 8), "tick", 0.35);
for (let i = 0; i < 3; i++) sfx(PT("r10", 1) + i * 0.3, "tick", 0.45); sfx(S("r11"), "sparkle", 0.5);

shot("s27", PT("r11", 1) - 0.08, cutAt("r16"), (t, lt, d) => {
  let g = photo("S27", lt / d);
  g += shade("L", 0.75);
  const out = S("r15") - 0.15;
  const bk = P(t, PT("r12", 1) + 0.2, PT("r12", 1) + 1.4, E.inOutCubic);
  g += popTitle(t, PT("r12", 0), 420, 230, [["GLEICHER", "#fff"], ["WOLF", COL.blue]], { size: 84, out });
  g += pop(t, PT("r12", 1), 420, 400, battery(0, 0, lerp(0.06, 1, bk), 1.4, { bolt: bk < 1 }), { out });
  g += popTitle(t, WT("r12", "voll") - 0.1, 420, 560, [["AKKU", "#fff"], ["VOLL", COL.green]], { size: 96, out });
  if (t > S("r13")) {
    g += pop(t, S("r13") + 0.05, 150, 770, flame(0, 0, 1.5, t), { dur: 0.5, ease: E.outBackBig, out });
    g += popTitle(t, S("r13") + 0.2, 500, 730, [["DAS FEUER", "#fff"]], { size: 80, out });
    g += popTitle(t, S("r13") + 0.35, 500, 830, [["IST ZURÜCK", COL.orange]], { size: 80, out });
  }
  if (t > S("r14")) g += emote("sparkle", 1780, 80, t, 1.2) + emote("sparkle", 1880, 520, t + 0.7, 1.0) + emote("sparkle", 1560, 780, t + 0.3, 0.9);
  g += popTitle(t, PT("r15", 0), 440, 300, [["KEIN", "#fff"], ["GLÜCK.", COL.yellow]], { size: 104 });
  g += popTitle(t, PT("r15", 1), 440, 470, [["EIN", "#fff"], ["PLAN.", COL.orange]], { size: 104 });
  g += pop(t, PT("r15", 2), 440, 650, title(0, 0, [["DURCHGEZOGEN.", COL.green]], { size: 110 }), { ease: E.outBackBig, rot: -4 });
  return g;
});
sfx(PT("r11", 1) - 0.08, "whoosh", 0.4); sfx(PT("r12", 0), "pop"); sfx(PT("r12", 1) + 0.2, "charge"); sfx(S("r13") + 0.05, "fire"); sfx(S("r14"), "sparkle");
sfx(PT("r15", 0), "pop"); sfx(PT("r15", 1), "pop"); sfx(PT("r15", 2), "boom", 0.6);

shot("s28", cutAt("r16"), S("n1") - 0.3, (t, lt, d) => {
  let g = gfxBg(t, "S01", COL.blue);
  const a = PT("r16", 0), b = PT("r16", 1), blink = Math.floor(t * 3) % 2 ? 1 : 0.45;
  g += pop(t, a, 560, 470, op(blink, battery(0, 0, 0.05, 2.0)), {});
  g += popTitle(t, a + 0.2, 560, 760, [["AKKU BLEIBT", "#fff"], ["LEER?", COL.red]], { size: 86 });
  const doc = `<rect x="-300" y="-330" width="600" height="660" rx="44" fill="#F5F7FB"/>` +
    `<rect x="-60" y="-250" width="120" height="300" rx="16" fill="${COL.red}"/><rect x="-150" y="-160" width="300" height="120" rx="16" fill="${COL.red}"/>` +
    T(0, 170, "AB ZUM ARZT", { size: 84, font: "anton", fill: "#0E1422", ls: 2 }) + T(0, 250, "Werte checken lassen", { size: 44, font: "barlow", fill: "#3E4A66" });
  g += pop(t, b, 1360, 540, doc, { ease: E.outBackBig });
  return g;
});
sfx(cutAt("r16"), "whoosh", 0.4); sfx(PT("r16", 0), "pop"); sfx(PT("r16", 1), "pop");

// ======================= TEASER: DER KOPF =======================
WIPES.push({ at: S("n1") - 0.3, color: "#3A2B73" });
sfx(S("n1") - 0.5, "whoosh", 0.8);
const BLOCKS = [["SCHLAF", "#5B4BD6"], ["TRAINING", "#C2561B"], ["KÖRPERFETT", "#B58A12"], ["ESSEN", "#17704A"], ["STRESS", "#8C1D3A"]];
shot("s29", S("n1") - 0.3, cutAt("n3"), (t, lt, d) => {
  let g = gfxBg(t, "S27", COL.purple);
  const a = PT("n1", 0), b = PT("n1", 1), c = PT("n1", 2);
  g += popTitle(t, b, 960, 170, [["ERST DAS", "#fff"], ["FUNDAMENT", COL.orange]], { size: 100 });
  BLOCKS.forEach(([lbl, col], i) => {
    const at = a + 0.15 + i * 0.16, k = P(t, at, at + 0.35, E.outBack);
    if (k > 0) g += G(tr(960 + (i - 2) * 330, lerp(400, 880, k)), `<rect x="-155" y="-80" width="310" height="160" rx="18" fill="${col}"/><rect x="-155" y="-80" width="310" height="22" rx="10" fill="#fff" opacity="0.15"/>` + T(0, 20, lbl, { size: lbl.length > 8 ? 42 : 50, font: "anton", fill: "#fff", ls: 2 }));
  });
  const sk = P(t, c, c + 0.4, E.outBack);
  if (sk > 0) g += G(tr(960, 740, 0, sk), `<rect x="-560" y="-50" width="1120" height="100" rx="50" fill="#F5F7FB"/>` + T(0, 22, "GESUNDES NORMALNIVEAU", { size: 60, font: "anton", fill: COL.green, ls: 3 }));
  // Ein Mitspieler fehlt
  const m = S("n2"), mk = P(t, m, m + 0.4, E.outBack);
  if (mk > 0) {
    const pulse = 1 + 0.04 * Math.sin(t * 6);
    g += G(tr(960, 500, 0, mk * pulse), `<rect x="-170" y="-130" width="340" height="260" rx="22" fill="#3A2B73" opacity="0.6"/><rect x="-170" y="-130" width="340" height="260" rx="22" fill="none" stroke="${COL.yellow}" stroke-width="8" stroke-dasharray="26 16"/>` +
      T(0, 60, "?", { size: 200, font: "anton", fill: COL.yellow }));
    g += pop(t, WT("n2", "fehlt") - 0.1, 960, 330, pill(0, 0, "EIN MITSPIELER FEHLT", { size: 50, bg: "#3A2B73" }), {});
  }
  return g;
}, { xf: 0 });
for (let i = 0; i < 5; i++) sfx(PT("n1", 0) + 0.15 + i * 0.16 + 0.25, "stamp", 0.45);
sfx(PT("n1", 1), "pop"); sfx(PT("n1", 2), "pop"); sfx(S("n2"), "whoosh", 0.4); sfx(WT("n2", "fehlt") - 0.1, "pop");

function iconTile(inner, crossed, k) {
  return `<circle r="92" fill="#0E1422" opacity="0.85" stroke="#F5F7FB" stroke-width="5"/>${inner}` + (crossed > 0 ? bigCross(0, 0, 0.6, crossed) : "");
}
const bedIcon = () => `<rect x="-62" y="-6" width="124" height="40" rx="8" fill="#5EC8FF"/><rect x="-62" y="-36" width="34" height="30" rx="8" fill="#F5F7FB"/><rect x="-70" y="-46" width="12" height="96" rx="5" fill="#C9D3E0"/><rect x="58" y="-10" width="12" height="60" rx="5" fill="#C9D3E0"/>`;
const panIcon = () => `<circle cx="-14" cy="6" r="46" fill="#3A4156" stroke="#C9D3E0" stroke-width="6"/><rect x="28" y="-2" width="62" height="16" rx="8" fill="#C9D3E0"/>` + egg(-14, 6, 0.32);
shot("s30", cutAt("n3"), HAS_S31 ? cutAt("n4") : TL.duration + 1, (t, lt, d) => {
  let g = photo("S30", Math.min(1, lt / Math.max(d, 8)));
  g += shade("T", 0.6) + shade("L", 0.6);
  const ic = [[PT("n3", 0), bedIcon(), "BETT"], [PT("n3", 1), panIcon(), "KÜCHE"], [PT("n3", 2), barbell(0, 0, 0.32), "KRAFTRAUM"]];
  const icOut = S("n4") - 0.1;
  ic.forEach(([at, inner, lbl], i) => {
    const ck = P(t, at + 0.35, at + 0.7, E.outCubic);
    g += pop(t, at, 200 + i * 240, 200, iconTile(inner, ck) + T(0, 140, lbl, { size: 38, font: "anton", fill: "#F5F7FB", ls: 2, stroke: "#0B1020", sw: 8 }), { out: HAS_S31 ? null : icOut });
  });
  if (!HAS_S31) g += teaserOverlay(t);
  return g;
});
ic_sfx();
function ic_sfx() { for (let k = 0; k < 3; k++) { sfx(PT("n3", k), "pop", 0.7); sfx(PT("n3", k) + 0.35, "stamp", 0.5); } }
sfx(cutAt("n3"), "whoosh", 0.4);

// Teaser-Einblendungen (Kopf, Schlagworte, nächstes Video)
function teaserOverlay(t) {
  let g = "";
  const a = S("n4");
  const glow = P(t, a, a + 0.5) * (0.7 + 0.3 * Math.sin(t * 4));
  g += pop(t, a, 360, 470, `<circle r="190" fill="url(#gGlowO)" opacity="${fx(glow)}"/>` + brain(0, 0, 0.85), { ease: E.outBackBig, out: S("n5") - 0.1 });
  g += popTitle(t, a + 0.15, 560, 720, [["ER SITZT IM", "#fff"], ["KOPF.", COL.orange]], { size: 100, out: S("n5") - 0.1 });
  const words = [["WETTBEWERB.", "#fff"], ["SIEGEN.", COL.yellow], ["MENTALITÄT.", COL.orange]];
  words.forEach(([w, c], i) => { g += pop(t, PT("n5", i), 120, 360 + i * 160, title(0, 0, [[w, c]], { size: 130, anchor: "start" }), { ease: E.outBackBig, out: S("n6") - 0.15 }); });
  const b = S("n6");
  g += fadePanel(t, b - 0.1, Math.min(EN("n6") + 0.6, S("n7") - 0.5), panel(70, 230, 1100, 520, { stroke: "#5B4BD6" }) +
    (t > PT("n6", 0) ? T(620, 360, "WAS SIEGEN WIRKLICH", { size: 70, font: "anton", fill: "#fff", ls: 2 }) + T(620, 450, "MIT TESTOSTERON MACHT", { size: 70, font: "anton", fill: COL.orange, ls: 2 }) : "") +
    (t > PT("n6", 1) ? T(620, 560, "… UND WAS NUR MYTHOS IST", { size: 60, font: "anton", fill: COL.yellow, ls: 2 }) : "") +
    (t > PT("n6", 2) ? G(tr(620, 670, 0, popScale(t, PT("n6", 2))), pill(0, 0, "IM NÄCHSTEN VIDEO", { size: 50, bg: "#5B4BD6" })) : ""));
  // Endkarte
  const e = S("n7") - 0.1, ek = P(t, e, e + 0.6);
  if (ek > 0) {
    g += `<rect width="${W}" height="${H}" fill="#0B1020" opacity="${fx(ek * 0.88)}"/>`;
    g += op(P(t, e + 0.1, e + 0.6), pawPrint(960, 290, 1.3) + title(960, 500, [["DAS RUDEL", "#fff"], ["WARTET.", COL.orange]], { size: 120 }) +
      T(960, 600, "Nächstes Video: Mentalität, Wettbewerb & Testosteron", { size: 46, font: "barlow", fill: "#C9D3E0" }));
    g += op(P(t, EN("n7") + 0.6, EN("n7") + 1.2), T(960, 930, "Allgemeine Informationen – keine ärztliche Beratung.", { size: 36, font: "barlow6", fill: "#8E9BB3" }) +
      T(960, 980, "Bei anhaltenden Beschwerden: ärztlich abklären lassen.", { size: 36, font: "barlow6", fill: "#8E9BB3" }));
  }
  return g;
}
if (HAS_S31) {
  shot("s31", cutAt("n4"), TL.duration + 1, (t, lt, d) => {
    let g = photo("S31", Math.min(1, lt / 10));
    g += shade("L", 0.7) + shade("B", 0.5);
    return g + teaserOverlay(t);
  }, { xf: 0.12 });
  sfx(cutAt("n4"), "boom", 0.6);
}
sfx(S("n4"), "whoosh", 0.4); sfx(S("n4") + 0.15, "pop"); for (let i = 0; i < 3; i++) sfx(PT("n5", i), "stamp", 0.7);
sfx(S("n6") - 0.1, "whoosh", 0.4); sfx(PT("n6", 2), "pop"); sfx(S("n7") - 0.1, "whoosh", 0.6);

// Alle Bilder schon beim Laden registrieren, damit preloadImages() sie vor dem ersten Frame dekodiert
Object.keys(KB).filter((n) => n !== "S31" || HAS_S31).forEach((n) => img(n + ".jpg"));
["S01", "S02", "S05", "S07", "S13", "S16", "S19", "S22", "S24", "S27"].forEach((n) => img("blur/" + n + ".jpg"));
