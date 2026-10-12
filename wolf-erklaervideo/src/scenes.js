// Alle Szenen des Videos. Zeiten hängen an den Voiceover-Cues (S/EN/PT/WT), nicht an festen Sekunden.
const SFX = [];
function sfx(t, kind, vol = 1) { SFX.push({ t: Math.max(0, t), kind, vol }); }
window.SFX = SFX;

// Startzeit des k-ten Satzes einer Zeile
const PT = (id, k) => {
  const l = TL.lines[id];
  if (l.parts && l.parts[k] != null) return l.parts[k];
  const n = (l.parts || []).length || 1;
  return lerp(l.start, l.end, k / n);
};
// geschätzte Zeit eines Wortes innerhalb einer Zeile (über Satzgrenzen genau, innerhalb proportional)
function WT(id, word, occ = 0) {
  const l = TL.lines[id], txt = l.text;
  let idx = -1, from = 0;
  for (let i = 0; i <= occ; i++) { idx = txt.indexOf(word, from); from = idx + 1; }
  if (idx < 0) return l.start;
  const sents = txt.split(/(?<=[.!?…“])\s+(?=[A-ZÄÖÜ„])/);
  if (l.parts && sents.length === l.parts.length) {
    let off = 0;
    for (let k = 0; k < sents.length; k++) {
      const a = txt.indexOf(sents[k], off), b = a + sents[k].length;
      if (idx >= a && idx < b) {
        const t0 = l.parts[k], t1 = k + 1 < l.parts.length ? l.parts[k + 1] - 0.16 : l.end;
        return lerp(t0, t1, (idx - a) / sents[k].length);
      }
      off = b;
    }
  }
  return lerp(l.start, l.end, idx / txt.length);
}
// Kamera: sanfter Zoom/Pan
function cam(inner, k, o = {}) {
  const z = lerp(o.z0 || 1, o.z1 || 1.05, E.inOutSine(clamp(k)));
  const cx = o.cx || 960, cy = o.cy || 540;
  const px = lerp(o.px0 || 0, o.px1 || 0, E.inOutSine(clamp(k))), py = lerp(o.py0 || 0, o.py1 || 0, E.inOutSine(clamp(k)));
  return `<g transform="translate(${fx(cx + px)} ${fx(cy + py)}) scale(${fx(z)}) translate(${-cx} ${-cy})">${inner}</g>`;
}
const shakeX = (t, at, dur, amp) => (t > at && t < at + dur ? Math.sin(t * 70) * amp * (1 - (t - at) / dur) : 0);
const standY = (floor, s) => floor - WOLF_FOOT_Y * s;
const CUT = 0.12; // Schnitt kurz vor Satzbeginn

// =============== INTRO ===============
const LIE = pose("stand", { ear: 0.45, smile: 0.25, neck: 0, aF: { x: 40, y: 170 }, aB: { x: 20, y: 172 }, fF: { x: 10, y: 248 }, fB: { x: -6, y: 248 } });
const SIT = POSES.sit;
const SIT_TIRED = pose("sit", { torso: 16, neck: 26, ear: 0.95, smile: -0.7, aF: { x: 70, y: 150 } });

function bedroomScene(t, o) {
  const bx = 1250, by = 650, s = 0.8;
  const k = o.k; // 0 liegend, 1 sitzend
  const rot = lerp(-90, 0, k), la = -rot * DEG;
  const p = { ...o.pose, fF: { x: 12 + Math.cos(la) * 228, y: 16 + Math.sin(la) * 228 }, fB: { x: -14 + Math.cos(la) * 222, y: 16 + Math.sin(la) * 222 } };
  let g = room({ night: o.night }) + windowFrame(1250, 300, o.sky, t, { sunUp: o.sunUp || 0 });
  g += nightstand(720, 820, t, { blink: o.blink, time: o.time || "06:30", lamp: o.lamp });
  g += bed(bx, by);
  g += wolf({ x: bx + 40, y: 609, s, rot, pose: p, t, shadow: false, noTail: k < 0.9 });
  const x0 = lerp(-230, -40, k), top = lerp(-108, -62, k);
  g += blanket(bx, by, x0, 400, { top });
  if (o.light) g += `<rect width="${W}" height="${H}" fill="#FFE8B0" opacity="${fx(o.light)}"/>`;
  return g;
}

scene("intro_bed", 0, S("i4") - CUT, (t, lt, d) => {
  const wake = S("i1") + 0.1;
  const k = P(t, wake, wake + 0.85, E.outBack);
  let p = kf(t, [[0, LIE], [wake, LIE], [wake + 0.85, SIT], [S("i2") + 0.3, SIT], [S("i2") + 1.2, SIT_TIRED]]);
  if (t > PT("i3", 2)) p = mix(p, pose("sit", { torso: 22, neck: 34, ear: 1, smile: -0.9, aF: { x: 80, y: 140 } }), P(t, PT("i3", 2), PT("i3", 2) + 0.6));
  let g = cam(bedroomScene(t, { k, pose: p, sky: "dawn", sunUp: P(t, 0, 6), blink: t < wake + 1.5, night: false }), lt / d, { z0: 1.0, z1: 1.08, cx: 1150, cy: 520 });
  // Fragezeichen
  g += pop(t, S("i2") + 0.35, 1150, 170, emote("question", 0, 0, t), { out: S("i3") });
  // "Kein Feuer" – Flamme erlischt
  const f0 = PT("i3", 0), f1 = PT("i3", 1), f2 = PT("i3", 2);
  const fk = P(t, f0 + 0.35, f0 + 1.0);
  g += pop(t, f0, 300, 250, (fk < 1 ? flame(-150, -30, 0.7 * (1 - fk) + 0.001, t) : "") + smoke(-150, -40, t, fk) +
    title(60, 0, [["KEIN", "#fff"], ["FEUER", COL.orange]], { size: 84, anchor: "start" }), { dur: 0.35 });
  g += pop(t, f1, 300, 420, gaugeSemi(-150, 10, 62, lerp(0.8, 0.02, P(t, f1 + 0.2, f1 + 0.9, E.outBack)), { zones: [[0, 0.33, COL.red], [0.33, 0.66, COL.yellow], [0.66, 1, COL.green]] }) +
    title(60, 0, [["KEIN", "#fff"], ["ANTRIEB", COL.yellow]], { size: 84, anchor: "start" }), { dur: 0.35 });
  const sq = P(t, WT("i3", "platt") - 0.05, WT("i3", "platt") + 0.35, E.outBack);
  g += pop(t, f2, 120, 600, title(0, 0, [["EINFACH NUR …", "#fff"]], { size: 64, anchor: "start" }), { dur: 0.35 });
  if (t > WT("i3", "platt") - 0.15) g += G(tr(340, 730, 0, 1 + sq * 0.25, 1 - sq * 0.62), title(0, 0, [["PLATT", COL.red]], { size: 150 }));
  return g;
});
sfx(S("i1") + 0.1, "whoosh", 0.5); sfx(S("i2") + 0.35, "pop"); sfx(PT("i3", 0), "pop"); sfx(PT("i3", 1), "pop"); sfx(WT("i3", "platt"), "squash");

const MIRROR_TINT = "#9DB9DA";
function mirrorScene(t, o) {
  const s = 0.95, floor = 980;
  let g = `<rect width="${W}" height="${H}" fill="url(#gBathroom)"/><rect width="${W}" height="${H}" fill="url(#pTiles)"/>`;
  g += `<rect y="${floor - 30}" width="${W}" height="${H}" fill="#202A45"/><rect y="${floor - 44}" width="${W}" height="16" fill="#1A2238"/>`;
  const refl = wolf({ x: 40, y: 702 - 470 + 30, s: s * 0.92, flip: true, pose: o.pose, t, shadow: false, wag: o.wag || 0 });
  const inner = refl + `<rect x="-210" y="-330" width="420" height="660" fill="${MIRROR_TINT}" opacity="0.22"/>` + (o.mirrorExtra || "");
  g += mirror(1300, 470, inner);
  g += `<rect x="1080" y="840" width="440" height="40" rx="12" fill="#C9D3E0"/><rect x="1120" y="880" width="360" height="90" rx="10" fill="#B0BCCD"/>`;
  if (o.aura) {
    g += op(o.aura, `<ellipse cx="660" cy="560" rx="330" ry="420" fill="url(#gGlowO)"/>`);
    for (let i = 0; i < 10; i++) {
      const k = (t * 0.7 + i / 10) % 1;
      g += op(o.aura * (1 - k), `<circle cx="${fx(520 + hash(i * 3.3) * 280 + Math.sin(t * 3 + i) * 12)}" cy="${fx(900 - k * 640)}" r="${fx(5 + hash(i) * 6)}" fill="#FFB347"/>`);
    }
  }
  g += wolf({ x: 640, y: standY(floor, s), s, pose: o.pose, t, sway: true, wag: o.wag || 0 });
  return g;
}
scene("mirror_low", S("i4") - CUT, S("i6") - CUT, (t, lt, d) => {
  const p = pose("tired", { neck: 14 });
  let g = cam(mirrorScene(t, { pose: p }), lt / d, { z0: 1.0, z1: 1.07, cx: 1050, cy: 420 });
  g += popTitle(t, PT("i5", 0), 470, 170, [["GLEICHER", "#fff"], ["WOLF", COL.blue]], { size: 90 });
  const at = PT("i5", 1);
  const blink = Math.floor(t * 3) % 2 ? 1 : 0.55;
  g += pop(t, at, 1300, 62, op(blink, battery(0, 0, 0.08, 1.0)), { dur: 0.4 });
  g += popTitle(t, at + 0.5, 470, 300, [["LEERER", "#fff"], ["AKKU", COL.red]], { size: 90 });
  return g;
});
sfx(S("i4") - CUT, "whoosh", 0.4); sfx(PT("i5", 0), "pop"); sfx(PT("i5", 1), "pop"); sfx(PT("i5", 1) + 0.5, "pop");

function thermo(x, y, level, label) {
  const h = 520, c = level < 0.3 ? COL.red : level < 0.55 ? COL.yellow : COL.orange;
  return `<g transform="${tr(x, y)}"><rect x="-50" y="${-h}" width="100" height="${h}" rx="50" fill="#0B1020" stroke="#F5F7FB" stroke-width="8"/>
    <rect x="-34" y="${fx(-16 - (h - 32) * level)}" width="68" height="${fx((h - 32) * level)}" rx="34" fill="${c}"/>
    <circle cy="40" r="76" fill="${c}" stroke="#F5F7FB" stroke-width="8"/>
    <text x="0" y="66" text-anchor="middle" style="font-family:Anton;font-size:72px;fill:#fff">T</text>
    ${label ? `<text x="0" y="${-h - 30}" text-anchor="middle" style="font-family:Anton;font-size:46px;fill:${c}">${label}</text>` : ""}</g>`;
}
scene("low_t", S("i6") - CUT, S("i8") - CUT, (t, lt, d) => {
  let g = infoBg(t, COL.red);
  const lv = lerp(0.82, 0.16, P(t, S("i6") + 0.2, S("i6") + 1.6, E.inOutCubic));
  g += pop(t, S("i6"), 230, 820, thermo(0, 0, lv, Math.round(lv * 100) + " %"), { dur: 0.4 });
  g += popTitle(t, S("i6") + 0.05, 1080, 210, [["NIEDRIGES", "#fff"], ["TESTOSTERON", COL.orange]], { size: 110 });
  const a = PT("i7", 0);
  g += pop(t, a, 1080, 380, pill(0, 0, "SELTENE KRANKHEIT?", { size: 52, bg: "#2A3558" }), { out: PT("i7", 1) + 0.2 });
  g += op(1 - P(t, PT("i7", 1) + 0.2, PT("i7", 1) + 0.5), stamp(1530, 380, "NEIN", t, a + 0.75, { size: 64 }));
  const b = PT("i7", 1);
  g += popTitle(t, b + 0.1, 1080, 520, [["JAHRE", COL.yellow], ["SCHLECHTER GEWOHNHEITEN", "#fff"]], { size: 70 });
  const items = [[phoneNight(0, 0, 0.75), "HANDY UM 2 UHR"], [burger(0, 0, 0.95), "FAST FOOD"], [couch(0, 0, 0.75), "NUR SITZEN"], [energyCan(0, 0, 0.8), "ENERGY-DRINKS"]];
  items.forEach((it, i) => {
    const at = b + 0.7 + i * 0.45;
    g += pop(t, at, 600 + i * 330, 750, it[0] + T(0, 150, it[1], { size: 40, font: "barlow", fill: "#C9D3E0" }), { dur: 0.4 });
  });
  return g;
});
sfx(S("i6"), "whoosh", 0.4); sfx(PT("i7", 0), "pop"); sfx(PT("i7", 0) + 0.75, "stamp");
for (let i = 0; i < 4; i++) sfx(PT("i7", 1) + 0.7 + i * 0.45, "pop", 0.7);

// =============== HANDY-WERBUNG ===============
function bokehBg(t, c = "#1A2240") {
  let g = `<rect width="${W}" height="${H}" fill="${c}"/>`;
  for (let i = 0; i < 14; i++) {
    const x = hash(i * 5.1) * W, y = hash(i * 9.7) * H, r = 40 + hash(i * 2.3) * 90;
    g += `<circle cx="${fx(x + Math.sin(t * 0.4 + i) * 20)}" cy="${fx(y)}" r="${fx(r)}" fill="${["#FF8A1F", "#5EC8FF", "#9B7BFF", "#FFD25A"][i % 4]}" opacity="0.10"/>`;
  }
  return g;
}
function star5(x, y, r, c) {
  let p = [];
  for (let i = 0; i < 10; i++) { const a = -90 + i * 36, rr = i % 2 ? r * 0.45 : r; p.push(`${fx(x + Math.cos(a * DEG) * rr)} ${fx(y + Math.sin(a * DEG) * rr)}`); }
  return `<path d="M ${p.join(" L ")} Z" fill="${c}"/>`;
}
function adScreen(t, a, b) {
  // a: Startzeit Anzeige, b: Startzeit "Über Nacht ..."
  let g = `<rect x="-205" y="-405" width="410" height="810" fill="#FFF6EA"/>`;
  g += `<rect x="-205" y="-405" width="410" height="78" fill="#FF4D5E"/>` + T(0, -354, "ANZEIGE", { size: 34, font: "barlow", fill: "#fff", ls: 4 });
  const sp = (t * 40) % 360;
  g += `<g transform="${tr(0, -190, sp)}">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="-6" y="-210" width="12" height="70" rx="6" fill="#FFD25A" transform="rotate(${i * 45})" opacity="0.7"/>`).join("")}</g>`;
  g += pop(t, a + 0.1, 0, -175, gummyJar(0, 0, 0.85), { dur: 0.5 });
  g += pop(t, a + 0.35, 0, -10, T(0, 0, "TESTO-", { size: 60, font: "anton", fill: "#FF8A1F" }) + T(0, 58, "GUMMIBÄRCHEN", { size: 54, font: "anton", fill: "#FF8A1F" }), { dur: 0.4 });
  g += pop(t, b, 0, 118, T(0, 0, "ÜBER NACHT ZUM", { size: 38, font: "barlow", fill: "#0E1422" }) + T(0, 62, "ALPHAWOLF!", { size: 66, font: "anton", fill: "#FF4D5E" }), { dur: 0.4, rot: -6 });
  if (t > a + 0.6) for (let i = 0; i < 5; i++) g += star5(-120 + i * 60, 236, 19, "#FFB800");
  const pulse = 1 + Math.sin(t * 9) * 0.05;
  g += pop(t, a + 0.9, 0, 0, "", {});
  if (t > a + 0.9) g += G(tr(0, -330 + 0, 0, 1), "");
  return g;
}
function adButton(t, at) {
  if (t < at) return "";
  const pulse = 1 + Math.sin(t * 9) * 0.05;
  return G(tr(0, 322, 0, pulse), `<rect x="-170" y="-40" width="340" height="80" rx="40" fill="#3DDC97"/>` + T(0, 18, "JETZT KAUFEN", { size: 48, font: "anton", fill: "#fff" }));
}
function phonePaw(x, y, s) {
  // Pfote hält das Handy: Handballen unten, Daumen links, Finger rechts
  const f = WC.fur, d = WC.furD;
  return G(tr(x, y, 0, s), `<path d="M -230 120 C -240 20 -200 -40 -150 -40 L 150 -40 C 210 -40 240 20 230 120 Z" fill="${f}"/>
    <rect x="-262" y="-250" width="74" height="190" rx="37" fill="${f}" transform="rotate(12 -225 -60)"/>
    <rect x="196" y="-330" width="64" height="96" rx="32" fill="${d}"/><rect x="200" y="-236" width="64" height="96" rx="32" fill="${f}"/>
    <rect x="196" y="-142" width="64" height="96" rx="32" fill="${f}"/>`);
}
scene("phone_ad", S("i8") - CUT, PT("i10", 0) - 0.06, (t, lt, d) => {
  const vib = S("i8"), adAt = WT("i8", "Werbung") - 0.1;
  let g = bokehBg(t);
  const shake = t > vib && t < vib + 0.9 ? Math.sin(t * 90) * 7 : 0;
  let screen;
  if (t < adAt) {
    screen = `<rect x="-205" y="-405" width="410" height="810" fill="#1C2645"/>` + T(0, -180, "07:12", { size: 120, font: "bebas", fill: "#fff" }) +
      T(0, -120, "Montag", { size: 40, font: "barlow6", fill: "#C9D3E0" }) +
      (t > vib ? pop(t, vib + 0.05, 0, 40, `<rect x="-180" y="-50" width="360" height="100" rx="24" fill="#fff" opacity="0.92"/>` + T(0, 12, "Neue Nachricht", { size: 38, font: "barlow", fill: "#0E1422" }), { dur: 0.3 }) : "");
  } else {
    const slide = 1 - P(t, adAt, adAt + 0.35, E.outCubic);
    screen = G(tr(0, slide * 800), adScreen(t, adAt, PT("i9", 1)) + adButton(t, PT("i9", 0) + 0.8));
  }
  g += G(tr(shake, 0), phoneBig(960, 560, 1.0, screen, { rot: -3 }) + phonePaw(960, 1050, 1.0));
  if (t > vib && t < vib + 0.9) {
    for (const side of [-1, 1]) for (let i = 0; i < 2; i++) {
      g += `<path d="M ${960 + side * (270 + i * 30)} 450 Q ${960 + side * (290 + i * 30)} 520 ${960 + side * (270 + i * 30)} 590" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.7"/>`;
    }
  }
  if (t > PT("i9", 0)) g += emote("sparkle", 1350, 300, t, 1.2) + emote("sparkle", 560, 700, t + 1, 1);
  return g;
});
sfx(S("i8"), "buzz"); sfx(WT("i8", "Werbung") - 0.1, "whoosh", 0.5); sfx(PT("i9", 1), "pop");

scene("laugh", PT("i10", 0) - 0.06, PT("i10", 1) - 0.06, (t, lt, d) => {
  const s = 1.05, floor = 1010;
  let g = room({ night: false, floorY: 900 }) + windowFrame(1500, 330, "day", t);
  const bob = Math.sin(t * 22) * 5, tw = Math.sin(t * 11) * 3;
  const p = pose("laugh", { py: 2 + bob, torso: -8 + tw, open: 0.75 + 0.25 * Math.sin(t * 18) });
  g += wolf({ x: 820, y: standY(floor, s), s, pose: p, t, hold: "phone", phoneGlow: 1, wag: 1 });
  ["HA", "HA", "HA!"].forEach((h, i) => { g += pop(t, PT("i10", 0) + 0.15 + i * 0.22, 1130 + i * 120, 260 - i * 60, title(0, 0, [[h, COL.yellow]], { size: 90 }), { rot: -10 + i * 10 }); });
  return cam(g, lt / d, { z0: 1.05, z1: 1.12, cx: 900, cy: 420 });
});
sfx(PT("i10", 0) + 0.15, "pop", 0.6); sfx(PT("i10", 0) + 0.37, "pop", 0.6); sfx(PT("i10", 0) + 0.59, "pop", 0.6);

scene("swipe", PT("i10", 1) - 0.06, S("i11") - CUT, (t, lt, d) => {
  const sw = PT("i10", 1) + 0.35;
  let g = bokehBg(t);
  const k = P(t, sw, sw + 0.45, E.inCubic);
  const ad = G(tr(-k * 700, 0, -k * 25), adScreen(t, -10, -10) + adButton(t, -10));
  const screen = `<rect x="-205" y="-405" width="410" height="810" fill="#1C2645"/>` + T(0, -180, "07:13", { size: 120, font: "bebas", fill: "#fff" }) + ad;
  g += phoneBig(960, 560, 1.0, screen, { rot: -3 }) + phonePaw(960, 1050, 1.0);
  // wischende Pfote
  const px = lerp(1500, 520, P(t, sw - 0.25, sw + 0.4, E.inOutCubic));
  const pa = P(t, sw - 0.4, sw - 0.2) * (1 - P(t, sw + 0.45, sw + 0.7));
  g += op(pa, G(tr(px, 520, -80, 3.2), paw(WC.fur, false) + `<rect x="-16" y="-60" width="32" height="70" rx="16" fill="${WC.fur}"/>`));
  if (t > sw + 0.4) g += pop(t, sw + 0.45, 960, 820, pill(0, 0, "WEG DAMIT", { size: 50, bg: COL.green }), {});
  return g;
});
sfx(PT("i10", 1) + 0.35, "whoosh", 0.8); sfx(PT("i10", 1) + 0.8, "pop");

scene("build_not_buy", S("i11") - CUT, S("s1") - 0.3, (t, lt, d) => {
  const expand = P(t, S("i13"), S("i13") + 0.6, E.inOutCubic);
  const split = lerp(960, -40, expand);
  let g = `<rect width="${W}" height="${H}" fill="#2A0F1A"/>` + dots();
  // links: KAUFEN
  let L = `<rect width="${fx(Math.max(0, split))}" height="${H}" fill="#3A1422"/>`;
  L += popTitle(t, S("i11"), 480, 190, [["KAUFEN", COL.red]], { size: 120 });
  L += pop(t, S("i11") + 0.15, 480, 600, cart(0, 0, 1.6) + gummyJar(-20, -140, 0.55) + powderTub(100, -130, 0.45), { dur: 0.45 });
  const xk = P(t, EN("i11") - 0.35, EN("i11") + 0.1, E.outCubic);
  if (xk > 0) L += bigCross(480, 560, 1.4, xk);
  g += `<g clip-path="none">${G(tr(lerp(0, -400, expand), 0), L)}</g>`;
  // rechts: AUFBAUEN
  let R = `<rect x="${fx(split)}" width="${fx(W - split)}" height="${H}" fill="#0E3B2C"/>`;
  const rx = lerp(1440, 960, expand);
  R += popTitle(t, S("i12"), rx, 190, [["AUFBAUEN", COL.green]], { size: 120 });
  const rows = [[4, 0], [3, 1], [2, 2]];
  let n = 0;
  rows.forEach(([cnt, r]) => {
    for (let i = 0; i < cnt; i++) {
      const at = S("i12") + 0.15 + n * 0.08; n++;
      const bx = rx + (i - (cnt - 1) / 2) * 130, by = 820 - r * 86;
      const k = P(t, at, at + 0.3, E.outBack);
      if (k > 0) R += brick(bx, lerp(by - 300, by, k), 120, 76);
    }
  });
  const ft = EN("i12") - 0.1;
  if (t > ft) R += G(tr(rx, 520, 0, P(t, ft, ft + 0.4, E.outBack)), flame(0, 0, 1.4, t));
  g += R;
  g += `<rect x="${fx(split - 6)}" y="0" width="12" height="${H}" fill="#fff" opacity="${fx(1 - expand)}"/>`;
  if (t > S("i13")) g += popTitle(t, S("i13") + 0.2, 960, 1000, [["UND ZWAR", "#fff"], ["SO:", COL.yellow]], { size: 80 });
  return g;
});
sfx(S("i11"), "whoosh", 0.5); sfx(EN("i11") - 0.35, "stamp"); sfx(S("i12"), "pop");
for (let i = 0; i < 9; i++) sfx(S("i12") + 0.15 + i * 0.08 + 0.2, "tick", 0.45);
sfx(EN("i12"), "whoosh", 0.4);

// =============== KAPITEL 1: SCHLAF ===============
WIPES.push({ at: S("s1") - 0.3, color: "#5B4BD6" });
sfx(S("s1") - 0.5, "whoosh", 0.9);
scene("ch1", S("s1") - 0.3, S("s2") - CUT, (t, lt, d) => chapterCard(t, lt, d, "01", "SCHLAF", null, "#2A2577", crescent(0, 0, 90, "#FFE7A3", "#2A2577") + stars(t, 0)));

const SLEEP = pose("stand", { ear: 0.5, smile: 0.35, neck: 0, aF: { x: 40, y: 170 }, aB: { x: 20, y: 172 }, fF: { x: 10, y: 248 }, fB: { x: -6, y: 248 } });
scene("sleep_make", S("s2") - CUT, S("s4") - CUT, (t, lt, d) => {
  const restless = t > S("s3") ? Math.sin(t * 9) * 3 * P(t, S("s3"), S("s3") + 0.5) : 0;
  let g = room({ night: true }) + windowFrame(380, 330, "night", t);
  g += nightstand(1500, 820, t, { time: t > S("s3") ? "02:47" : "23:30" });
  const bx = 820, s = 0.8;
  g += bed(bx, 650);
  g += wolf({ x: bx + 40, y: 609, s, rot: -90 + restless, noTail: true, pose: mix(SLEEP, pose("stand", { ear: 0.9, smile: -0.5 }), P(t, S("s3"), S("s3") + 0.6)), t, shadow: false });
  g += blanket(bx, 650, -230 + restless * 4, 400, { top: -108 });
  g += `<rect width="${W}" height="${H}" fill="#0A1022" opacity="0.25"/>`;
  if (t < S("s3")) g += emote("zzz", 640, 400, t, 1.1);
  else g += op(P(t, S("s3"), S("s3") + 0.4), `<path d="M 600 380 l 30 -40 l 20 30 l 30 -40" stroke="${COL.yellow}" stroke-width="8" fill="none" stroke-linecap="round"/>` + emote("anger", 700, 330, t, 1.1));
  // Info-Karte rechts oben
  let card = `<rect x="-330" y="-190" width="660" height="380" rx="36" fill="#0E1530" opacity="0.88" stroke="#3A4A80" stroke-width="4"/>`;
  if (t < S("s3")) {
    const ch = P(t, S("s2") + 0.3, EN("s2"), E.inOutSine);
    card += T(0, -120, "TESTOSTERON-BILDUNG", { size: 46, font: "barlow", fill: "#C9D3E0", ls: 2 });
    card += battery(-60, 10, lerp(0.2, 1, ch), 1.15, { bolt: true });
    card += crescent(200, 10, 50, "#FFE7A3", "#0E1530");
    card += T(0, 140, "VOR ALLEM IM SCHLAF", { size: 52, font: "anton", fill: COL.orange });
  } else {
    // zerstückelter Schlaf + Abfall
    card += T(0, -125, "NUR 5 STUNDEN, ZERSTÜCKELT", { size: 44, font: "barlow", fill: "#C9D3E0" });
    const segs = [[0, 0.16], [0.22, 0.38], [0.45, 0.58], [0.66, 0.8], [0.87, 0.97]];
    segs.forEach((sg, i) => {
      const k = P(t, S("s3") + 0.2 + i * 0.12, S("s3") + 0.4 + i * 0.12, E.outBack);
      card += `<rect x="${fx(-280 + sg[0] * 560)}" y="-80" width="${fx((sg[1] - sg[0]) * 560 * k)}" height="44" rx="12" fill="${COL.blue}"/>`;
    });
    const gk = P(t, WT("s3", "Woche") - 0.2, WT("s3", "Woche") + 0.9);
    const pts = [[-280, 40], [-140, 48], [0, 70], [140, 100], [280, 120]];
    const n = gk * (pts.length - 1);
    let path = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i <= Math.ceil(n) && i < pts.length; i++) {
      const f = Math.min(1, n - (i - 1));
      path += ` L ${fx(lerp(pts[i - 1][0], pts[i][0], f))} ${fx(lerp(pts[i - 1][1], pts[i][1], f))}`;
    }
    if (gk > 0) card += `<path d="${path}" stroke="${COL.red}" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (gk > 0.6) card += pop(t, WT("s3", "Woche") + 0.5, 150, 165, T(0, 0, "−10 bis 15 % T", { size: 50, font: "anton", fill: COL.red }), {});
    card += op(gk, T(-200, 165, "1 WOCHE", { size: 40, font: "barlow", fill: "#C9D3E0" }));
  }
  g += pop(t, S("s2") + 0.2, 1400, 300, card, { dur: 0.45 });
  return cam(g, lt / d, { z0: 1.02, z1: 1.08, cx: 1000, cy: 500 });
});
sfx(S("s2") + 0.2, "pop"); sfx(S("s3"), "whoosh", 0.4);
for (let i = 0; i < 5; i++) sfx(S("s3") + 0.3 + i * 0.12, "tick", 0.4);
sfx(WT("s3", "Woche") + 0.5, "pop");

scene("slump", S("s4") - CUT, S("s5") - CUT, (t, lt, d) => {
  const s = 1.0, floor = 1000;
  let g = room({ night: false, floorY: 900 }) + `<rect width="${W}" height="${H}" fill="#2A3352" opacity="0.35"/>`;
  g += `<rect x="1180" y="560" width="520" height="30" rx="10" fill="#6B4A36"/><rect x="1200" y="590" width="24" height="310" fill="#5A3E2E"/><rect x="1656" y="590" width="24" height="310" fill="#5A3E2E"/>`;
  g += coffeeCup(1300, 500, 0.6, t);
  g += wolf({ x: 760, y: standY(floor, s), s, pose: pose("tired", { neck: 30, ear: 1 }), t, sway: true });
  g += pop(t, S("s4") + 0.3, 900, 170, emote("question", 0, 0, t), {});
  g += pop(t, S("s4") + 0.55, 1010, 120, emote("question", 0, 0, t, 0.8), {});
  g += pop(t, S("s4") + 0.2, 1440, 240, battery(0, 0, 0.15, 0.9) + T(0, 120, "SCHLAPP", { size: 70, font: "anton", fill: COL.red }), {});
  return cam(g, lt / d, { z0: 1.0, z1: 1.06, cx: 900, cy: 500 });
});
sfx(S("s4") + 0.2, "pop"); sfx(S("s4") + 0.3, "pop", 0.6);

// Schlaf-Plan Checkliste
const SLEEP_ITEMS = [["s5", "7–9 Std. Schlaf"], ["s6", "Koffein nur bis 15 Uhr"], ["s7", "Dunkles Zimmer"], ["s8", "Feste Schlafzeiten"], ["s9", "Kein Handy um 2 Uhr"]];
function checklist(t, x, y, heading, items, o = {}) {
  const w = o.w || 640, rowH = o.rowH || 120;
  let g = `<rect x="0" y="0" width="${w}" height="${110 + items.length * rowH + 30}" rx="36" fill="#F5F7FB"/>`;
  g += `<rect x="0" y="0" width="${w}" height="96" rx="36" fill="${o.head || COL.orange}"/><rect x="0" y="60" width="${w}" height="36" fill="${o.head || COL.orange}"/>`;
  g += T(w / 2, 66, heading, { size: 54, font: "anton", fill: "#fff", ls: 3 });
  items.forEach((it, i) => {
    const at = it[0], yy = 110 + i * rowH + rowH / 2;
    if (t < at) {
      g += `<rect x="36" y="${yy - 28}" width="56" height="56" rx="14" fill="none" stroke="#C9D3E0" stroke-width="6"/>`;
      g += `<rect x="120" y="${yy - 10}" width="${w - 170}" height="20" rx="10" fill="#E3E8F0"/>`;
    } else {
      const k = popScale(t, at, 0.4);
      g += G(tr(64, yy, 0, k), `<rect x="-28" y="-28" width="56" height="56" rx="14" fill="${COL.green}"/><path d="M -13 1 L -3 11 L 14 -10" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
      g += op(clamp((t - at) / 0.25), T(120, yy + 15, it[1], { size: o.size || 46, font: "barlow", fill: "#0E1422", anchor: "start" }));
    }
  });
  return G(tr(x, y), g);
}
scene("sleep_rules", S("s5") - CUT, S("s10") - CUT, (t, lt, d) => {
  let g = infoBg(t, "#5B4BD6");
  g += checklist(t, 1160, 190, "SCHLAF-PLAN", SLEEP_ITEMS.map(([id, txt]) => [S(id) + 0.25, txt]));
  // Fokus-Visual links
  const cx = 600, cy = 520;
  if (t < S("s6") - CUT) {
    g += popTitle(t, S("s5") + 0.1, cx, 300, [["7–9", COL.yellow], ["STUNDEN", "#fff"]], { size: 130 });
    const k = P(t, S("s5") + 0.4, EN("s5") + 0.3, E.inOutSine);
    g += pop(t, S("s5") + 0.2, cx, 560, `<rect x="-380" y="-36" width="760" height="72" rx="36" fill="#1D2750"/><rect x="-380" y="-36" width="${fx(760 * k)}" height="72" rx="36" fill="${COL.blue}"/>` +
      T(-380, 110, "23:00", { size: 52, font: "bebas", fill: "#C9D3E0", anchor: "start" }) + T(380, 110, "07:00", { size: 52, font: "bebas", fill: "#C9D3E0", anchor: "end" }) +
      crescent(-430, -100, 46, "#FFE7A3", "#141C3A") + sun(420, -110, 34, t), {});
  } else if (t < S("s7") - CUT) {
    const a = S("s6");
    g += pop(t, a, cx - 170, 520, coffeeCup(0, 0, 1.4, t), {});
    g += pop(t, a + 0.25, cx + 210, 470, clockFace(0, 0, 130, 15, 0), {});
    g += popTitle(t, a + 0.15, cx, 230, [["KOFFEIN", "#fff"], ["BIS 15 UHR", COL.yellow]], { size: 96 });
    // Abklingkurve
    const k = P(t, PT("s6", 1), PT("s6", 1) + 1.2);
    if (k > 0) {
      let path = "";
      for (let i = 0; i <= 40 * k; i++) { const x = -360 + i * 18, y = -120 * Math.pow(0.5, i / 14); path += (i ? " L " : "M ") + fx(x) + " " + fx(y); }
      g += G(tr(cx, 900), `<line x1="-380" y1="0" x2="380" y2="0" stroke="#3A4A80" stroke-width="4"/><path d="${path}" stroke="${COL.orange}" stroke-width="9" fill="none" stroke-linecap="round"/>` +
        T(-380, 46, "15 Uhr", { size: 36, font: "barlow", fill: "#C9D3E0", anchor: "start" }) + T(380, 46, "23 Uhr: noch aktiv", { size: 36, font: "barlow", fill: COL.orange, anchor: "end" }));
    }
  } else if (t < S("s8") - CUT) {
    const a = S("s7"), k = P(t, a + 0.1, a + 0.8);
    g += pop(t, a, cx, 560, windowFrame(0, 0, "night", t, { curtain: k }) + `<rect x="-240" y="-280" width="480" height="560" fill="#000" opacity="${fx(k * 0.35)}"/>`, {});
    g += popTitle(t, a + 0.1, cx, 210, [["DUNKLES", "#fff"], ["ZIMMER", COL.blue]], { size: 100 });
  } else if (t < S("s9") - CUT) {
    const a = S("s8");
    g += pop(t, a, cx - 200, 520, clockFace(0, 0, 140, 23, 0, { ring: COL.purple }) + T(0, 220, "SCHLAFEN", { size: 46, font: "barlow", fill: "#C9D3E0" }), {});
    g += pop(t, PT("s8", 1), cx + 200, 520, clockFace(0, 0, 140, 7, 0, { ring: COL.yellow }) + T(0, 220, "AUFSTEHEN", { size: 46, font: "barlow", fill: "#C9D3E0" }), {});
    g += popTitle(t, a + 0.1, cx, 210, [["JEDEN TAG", "#fff"], ["GLEICH", COL.green]], { size: 100 });
    ["MO", "DI", "MI", "DO", "FR", "SA", "SO"].forEach((dd, i) => { g += pop(t, PT("s8", 1) + 0.3 + i * 0.06, cx - 300 + i * 100, 880, pill(0, 0, dd, { size: 34, w: 80, bg: "#2B3A6B" }), { dur: 0.3 }); });
  } else {
    const a = S("s9");
    g += pop(t, a, cx, 560, phoneNight(0, 0, 1.9, "02:00") + `<circle r="330" fill="url(#gGlowW)" opacity="0.25"/>`, {});
    const xk = P(t, a + 1.0, a + 1.4, E.outCubic);
    if (xk > 0) g += bigCross(cx, 560, 1.5, xk);
    g += popTitle(t, a + 0.1, cx, 200, [["KEIN SCROLLEN", "#fff"], ["UM 2 UHR", COL.red]], { size: 86 });
    g += stamp(cx, 960, "RUINIERT DEN PLAN", t, PT("s9", 1) + 0.2, { size: 56 });
  }
  return g;
});
["s5", "s6", "s7", "s8", "s9"].forEach((id) => { sfx(S(id), "whoosh", 0.35); sfx(S(id) + 0.25, "tick", 0.7); });
sfx(S("s9") + 1.0, "stamp"); sfx(PT("s9", 1) + 0.2, "stamp", 0.7);

function outdoor(t, o = {}) {
  let g = `<rect width="${W}" height="${H}" fill="url(#gSunrise)"/>`;
  g += sun(o.sunX || 1450, lerp(o.sunY0 || 760, o.sunY1 || 420, o.sunK || 0), 90, t);
  g += hills(760, "#5A6FA8", "#3E4F86");
  for (let i = 0; i < 9; i++) g += pine(80 + i * 230 + (i % 2) * 40, 860 + (i % 3) * 30, 0.7 + (i % 3) * 0.15, i % 2 ? "#2C3B66" : "#24325A");
  g += `<path d="M 0 900 C 400 840 900 860 1300 900 C 1600 930 1800 920 1920 900 L 1920 1080 L 0 1080 Z" fill="#1E2A4D"/>`;
  return g;
}
scene("sunlight", S("s10") - CUT, S("t1") - 0.3, (t, lt, d) => {
  const sk = P(t, S("s10") - 0.2, EN("s11"), E.outCubic);
  let g = outdoor(t, { sunK: sk });
  g += `<g opacity="${fx(0.25 + 0.15 * Math.sin(t))}">${[0, 1, 2, 3, 4].map((i) => `<path d="M 1450 ${fx(lerp(760, 420, sk))} L ${-200 + i * 250} 1080 L ${-80 + i * 250} 1080 Z" fill="#FFF3C4" opacity="0.18"/>`).join("")}</g>`;
  const p = kf(t, [[S("s10"), pose("stand", { ear: 0.3 })], [S("s10") + 0.8, POSES.stretch], [PT("s11", 1), POSES.stretch], [PT("s11", 1) + 0.6, pose("proud", { neck: -14 })]]);
  g += wolf({ x: 640, y: standY(900, 0.95), s: 0.95, pose: p, t, wag: 0.6 });
  g += popTitle(t, S("s10") + 0.6, 1160, 200, [["TAGESLICHT", COL.yellow]], { size: 120 });
  g += pop(t, PT("s11", 0) + 0.1, 1380, 560, clockFace(-170, 0, 70, 7, 0, { ring: COL.green }) + pill(60, 10, "INNERE UHR ✓", { size: 50, bg: "#24325A" }), {});
  g += pop(t, PT("s11", 1) + 0.2, 1380, 730, `<g transform="${tr(-210, 0)}"><circle r="62" fill="${COL.yellow}"/><text x="0" y="26" text-anchor="middle" style="font-family:Anton;font-size:72px;fill:#0E1422">D</text></g>` + pill(60, 10, "VITAMIN D", { size: 50, bg: "#24325A" }), {});
  return cam(g, lt / d, { z0: 1.0, z1: 1.05 });
});
sfx(S("s10") + 0.6, "pop"); sfx(PT("s11", 0) + 0.1, "pop"); sfx(PT("s11", 1) + 0.2, "pop");

// =============== KAPITEL 2: TRAINING ===============
WIPES.push({ at: S("t1") - 0.3, color: COL.orange });
sfx(S("t1") - 0.5, "whoosh", 0.9);
scene("ch2", S("t1") - 0.3, S("t2") - CUT, (t, lt, d) => chapterCard(t, lt, d, "02", "SCHWER TRAINIEREN", "& SCHLANK WERDEN", "#A8361C", barbell(0, 0, 0.9)));

function gym(t, o = {}) {
  let g = bgFill("gGym");
  g += `<rect x="0" y="0" width="${W}" height="${H}" fill="url(#pTiles)" opacity="0.4"/>`;
  g += rack(o.rackX || 960, 960, 1.0);
  g += `<path d="M ${o.spotX || 960} -40 L ${(o.spotX || 960) - 520} 980 L ${(o.spotX || 960) + 520} 980 Z" fill="url(#gSpot)"/>`;
  g += `<rect y="960" width="${W}" height="120" fill="#0F1116"/><rect y="956" width="${W}" height="8" fill="#2A2F3E"/>`;
  g += plateStack(240, 960, 1.2) + plateStack(1700, 960, 1.1);
  return g;
}
scene("gym_squat", S("t2") - CUT, S("t4") - CUT, (t, lt, d) => {
  const s = 1.0;
  const stopAt = S("t3") + 0.2;
  let ph = 0.5 - 0.5 * Math.cos(TAU * Math.max(0, t - S("t2")) / 1.9);
  if (t > stopAt) ph *= 1 - P(t, stopAt, stopAt + 0.5);
  const panic = WT("t2", "Panik") - 0.6;
  let g = gym(t);
  const wx = 900, wy = standY(960, s);
  g += wolf({ x: wx, y: wy, s, pose: exPose("squat", ph), t });
  // Panik: Beine glühen rot
  if (t > panic) {
    const pk = 0.5 + 0.5 * Math.sin(t * 16);
    g += op(P(t, panic, panic + 0.3) * (1 - P(t, S("t3") + 1.6, S("t3") + 2.2)) * (0.5 + 0.4 * pk), `<ellipse cx="${wx + 20}" cy="${wy + 140}" rx="150" ry="170" fill="url(#gGlowR)"/>`);
    g += pop(t, panic + 0.1, wx - 230, wy + 40, emote("excl", 0, 0, t), { out: S("t3") + 1.5 });
    g += pop(t, panic + 0.2, wx + 250, wy + 10, emote("excl", 0, 0, t, 0.8), { out: S("t3") + 1.5 });
    g += pop(t, panic + 0.05, 1450, 260, title(0, 0, [["PANIK!", COL.red]], { size: 130 }), { rot: -8, out: S("t3") });
  }
  // Begriffe
  [["Kniebeugen", "KNIEBEUGEN"], ["Kreuzheben", "KREUZHEBEN"], ["Drücken", "DRÜCKEN"]].forEach(([w, lbl], i) => {
    g += pop(t, WT("t2", w), 330, 200 + i * 110, pill(0, 0, lbl, { size: 52, bg: i === 0 ? COL.orange : "#3A4156" }), { out: panic });
  });
  // Signal nach oben ans Gehirn
  const sk = P(t, S("t3") + 0.3, S("t3") + 1.6, E.inOutSine);
  if (sk > 0) {
    const path = [[wx + 20, wy + 150], [wx - 20, wy + 40], [wx - 40, wy - 80], [wx - 40, wy - 200], [wx - 70, wy - 430], [wx + 330, 200]];
    const n = sk * (path.length - 1);
    let dpath = `M ${path[0][0]} ${path[0][1]}`, hx = path[0][0], hy = path[0][1];
    for (let i = 1; i <= Math.ceil(n) && i < path.length; i++) {
      const f = Math.min(1, n - (i - 1));
      hx = lerp(path[i - 1][0], path[i][0], f); hy = lerp(path[i - 1][1], path[i][1], f);
      dpath += ` L ${fx(hx)} ${fx(hy)}`;
    }
    g += `<path d="${dpath}" stroke="${COL.yellow}" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>`;
    g += `<circle cx="${fx(hx)}" cy="${fx(hy)}" r="24" fill="#fff"/><circle cx="${fx(hx)}" cy="${fx(hy)}" r="60" fill="url(#gGlowW)"/>`;
  }
  g += pop(t, S("t3") + 1.4, wx + 380, 170, brain(0, 0, 0.6) + signalWaves(-120, 0, t, 0.8) + signalWaves(120, 0, t + 0.3, -0.8), {});
  g += popTitle(t, S("t3") + 0.3, 1480, 820, [["NACHRICHT", "#fff"], ["ANS GEHIRN", COL.yellow]], { size: 72 });
  return cam(g, lt / d, { z0: 1.0, z1: 1.06, cx: 900, cy: 560, py1: t > S("t3") ? 30 : 0 });
});
sfx(WT("t2", "Kniebeugen"), "pop", 0.6); sfx(WT("t2", "Kreuzheben"), "pop", 0.6); sfx(WT("t2", "Drücken"), "pop", 0.6);
sfx(WT("t2", "Panik") - 0.55, "alarm"); sfx(S("t3") + 0.3, "zap"); sfx(S("t3") + 1.4, "pop");

// Dialog Muskel <-> Zentrale
scene("dialogue", S("t4") - CUT, S("t8") - CUT, (t, lt, d) => {
  let g = `<rect width="${W}" height="${H}" fill="#2B1F66"/><path d="M 0 0 L 1060 0 L 860 1080 L 0 1080 Z" fill="#7A1E2C"/>` + dots();
  const talkM = (t > S("t4") && t < EN("t4")) || (t > S("t6") && t < EN("t6"));
  const talkB = (t > S("t5") && t < EN("t5")) || (t > S("t7") && t < EN("t7"));
  const bm = talkM ? 1 + Math.abs(Math.sin(t * 14)) * 0.05 : 1, bb = talkB ? 1 + Math.abs(Math.sin(t * 14)) * 0.05 : 1;
  g += G(tr(470, 700, 0, bm), muscleArm(0, 0, 1.5));
  g += T(470, 1000, "MUSKEL", { size: 64, font: "anton", fill: "#FFB3BD", ls: 4 });
  g += G(tr(1460, 640, 0, bb), brain(0, 0, 1.45) + `<path d="M -150 -60 C -150 -200 150 -200 150 -60" stroke="#1A1F2B" stroke-width="16" fill="none"/><rect x="-176" y="-80" width="40" height="80" rx="14" fill="#1A1F2B"/><rect x="136" y="-80" width="40" height="80" rx="14" fill="#1A1F2B"/>`);
  if (talkB) g += signalWaves(1240, 560, t, 1.0, "#FFD25A");
  g += T(1460, 1000, "ZENTRALE", { size: 64, font: "anton", fill: "#C8B6FF", ls: 4 });
  // Sprechblasen
  if (t > S("t4") && t < S("t5")) {
    const lines = [];
    if (t > PT("t4", 0)) lines.push("Hey, Zentrale!");
    if (t > PT("t4", 1)) lines.push("Das war richtig viel Gewicht!");
    if (t > PT("t4", 2)) lines.push("Nächstes Mal: mehr Kraft!");
    g += pop(t, S("t4"), 760, 250, speechBubble(0, 0, 900, 90 + lines.length * 66, "left", lines, { size: 56 }), { dur: 0.3 });
  }
  if (t > S("t5") && t < S("t6")) {
    const lines = ["Verstanden."]; if (t > PT("t5", 1)) lines.push("Befehl geht raus.");
    g += pop(t, S("t5"), 1240, 250, speechBubble(0, 0, 620, 90 + lines.length * 66, "right", lines, { size: 60 }), { dur: 0.3 });
  }
  if (t > S("t6") && t < S("t7")) g += pop(t, S("t6"), 700, 280, speechBubble(0, 0, 560, 140, "left", ["Wie viel mehr?"], { size: 66 }), { dur: 0.3 });
  if (t > S("t7")) {
    const sh = shakeX(t, S("t7") + 0.1, 0.6, 14);
    g += G(tr(sh, 0), pop(t, S("t7"), 1180, 250, speechBubble(0, 0, 640, 220, "right", ["ALLES."], { size: 150, font: "Anton", fill: COL.yellow }), { dur: 0.35, ease: E.outBackBig }));
    for (let i = 0; i < 12; i++) { const a = i * 30 * DEG, r0 = 380, r1 = 470 + 20 * Math.sin(t * 20 + i); g += op(P(t, S("t7"), S("t7") + 0.2), `<line x1="${fx(1180 + Math.cos(a) * r0)}" y1="${fx(250 + Math.sin(a) * r0 * 0.6)}" x2="${fx(1180 + Math.cos(a) * r1)}" y2="${fx(250 + Math.sin(a) * r1 * 0.6)}" stroke="${COL.yellow}" stroke-width="10" stroke-linecap="round"/>`); }
  }
  return g;
});
sfx(S("t4") - CUT, "whoosh", 0.6); sfx(S("t4"), "pop"); sfx(S("t5"), "pop"); sfx(S("t6"), "pop"); sfx(S("t7"), "boom");

scene("train_explain", S("t8") - CUT, S("t9") - CUT, (t, lt, d) => {
  let g = infoBg(t, COL.orange);
  const pk = P(t, PT("t8", 1) - 0.35, PT("t8", 1) + 0.15, E.inOutCubic);
  g += pop(t, PT("t8", 0), 960, lerp(520, 150, pk), G(tr(0, 0, 0, lerp(1.6, 1, pk)), pill(0, 0, "STARK VEREINFACHT", { size: 54, bg: "#3A4A80" })), { rot: -4 });
  // Karte 1: kurzfristig
  const a = PT("t8", 1);
  let c1 = `<rect x="-380" y="-260" width="760" height="560" rx="40" fill="#F5F7FB"/>` + T(0, -180, "KURZFRISTIG", { size: 70, font: "anton", fill: "#0E1422", ls: 3 });
  const k1 = P(t, a + 0.4, a + 1.6, E.inOutSine);
  let path = "";
  for (let i = 0; i <= 60 * k1; i++) { const x = -300 + i * 10, bump = Math.exp(-Math.pow((i - 28) / 7, 2)); path += (i ? " L " : "M ") + fx(x) + " " + fx(120 - bump * 230); }
  c1 += `<line x1="-300" y1="130" x2="300" y2="130" stroke="#C9D3E0" stroke-width="6"/>` + (path ? `<path d="${path}" stroke="${COL.orange}" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : "");
  c1 += op(P(t, a + 1.0, a + 1.3), T(0, 230, "Testosteron ↑ nach dem Training", { size: 44, font: "barlow", fill: "#0E1422" }));
  g += pop(t, a, 520, 600, c1, { dur: 0.45 });
  // Karte 2: langfristig
  const b = PT("t8", 2);
  let c2 = `<rect x="-380" y="-260" width="760" height="560" rx="40" fill="#F5F7FB"/>` + T(0, -180, "LANGFRISTIG", { size: 70, font: "anton", fill: "#0E1422", ls: 3 });
  for (let i = 0; i < 5; i++) {
    const hk = P(t, b + 0.3 + i * 0.15, b + 0.8 + i * 0.15, E.outBack), h = (60 + i * 45) * hk;
    c2 += `<rect x="${-250 + i * 105}" y="${fx(130 - h)}" width="80" height="${fx(h)}" rx="12" fill="${COL.green}"/>`;
  }
  c2 += `<line x1="-300" y1="130" x2="300" y2="130" stroke="#C9D3E0" stroke-width="6"/>`;
  c2 += op(P(t, b + 1.2, b + 1.5), T(0, 200, "MEHR MUSKELN", { size: 48, font: "anton", fill: "#0E1422" }) + T(0, 255, "= Hormone stabil", { size: 42, font: "barlow", fill: "#3E4A66" }));
  g += pop(t, b, 1400, 600, c2, { dur: 0.45 });
  return g;
});
sfx(PT("t8", 0), "pop"); sfx(PT("t8", 1), "whoosh", 0.5); sfx(PT("t8", 2), "whoosh", 0.5);
for (let i = 0; i < 5; i++) sfx(PT("t8", 2) + 0.5 + i * 0.15, "tick", 0.4);

const EXES = [["Kniebeugen", "squat", "KNIEBEUGEN"], ["Kreuzheben", "deadlift", "KREUZHEBEN"], ["Klimmzüge", "pullup", "KLIMMZÜGE"], ["Drücken", "press", "DRÜCKEN"], ["Langhantel", "row", "RUDERN"]];
scene("exercises", S("t9") - CUT, S("t10") - CUT, (t, lt, d) => {
  let g = bgFill("gGym") + `<rect width="${W}" height="${H}" fill="url(#pTiles)" opacity="0.3"/>`;
  g += popTitle(t, S("t9"), 960, 170, [["DIE", "#fff"], ["GRUNDÜBUNGEN", COL.orange]], { size: 96 });
  EXES.forEach(([word, kind, lbl], i) => {
    const at = WT("t9", word) - 0.1;
    const cx = 960 + (i - 2) * 362;
    const ph = 0.5 - 0.5 * Math.cos(TAU * (t - at) / 1.7);
    const tile = `<rect x="-165" y="-260" width="330" height="560" rx="34" fill="#20263A" stroke="#343C58" stroke-width="4"/>` +
      `<rect x="-150" y="190" width="300" height="10" rx="5" fill="#343C58"/>` +
      wolf({ x: 0, y: 190 - WOLF_FOOT_Y * 0.42, s: 0.42, pose: exPose(kind, ph), t }) +
      T(0, 262, lbl, { size: 50, font: "anton", fill: "#fff", ls: 2 });
    g += pop(t, at, cx, 560, tile, { dur: 0.45 });
  });
  return g;
});
EXES.forEach(([w]) => sfx(WT("t9", w) - 0.1, "pop", 0.7));

scene("curl_mirror", S("t10") - CUT, S("f1") - CUT, (t, lt, d) => {
  const ph = 0.5 - 0.5 * Math.cos(TAU * t / 1.1);
  const p = exPose("curl", ph);
  let g = mirrorScene(t, { pose: { ...p, smile: 0.8 } });
  g += pop(t, S("t10") + 0.1, 230, 200, clockFace(0, 0, 110, 17 + (t - S("t10")) * 3, ((t - S("t10")) * 180) % 60), {});
  g += pop(t, S("t10") + 0.2, 230, 360, pill(0, 0, "STUNDENLANG", { size: 44, bg: "#3A4156" }), {});
  const xk = P(t, WT("t10", "Spiegel") - 0.1, WT("t10", "Spiegel") + 0.35, E.outCubic);
  if (xk > 0) g += `<rect width="${W}" height="${H}" fill="#000" opacity="${fx(0.35 * xk)}"/>` + bigCross(960, 520, 2.4, xk);
  g += popTitle(t, WT("t10", "Spiegel") + 0.2, 960, 960, [["NICHT NUR", "#fff"], ["BIZEPS-CURLS", COL.red]], { size: 96 });
  return g;
});
sfx(S("t10") + 0.1, "pop"); sfx(WT("t10", "Spiegel") - 0.1, "stamp");

// =============== FETT & AROMATASE ===============
function moleculeT(x, y, s, o = {}) { return tBadge(x, y, s, COL.orange, "T"); }
function moleculeE(x, y, s) { return tBadge(x, y, s, COL.pink, "E"); }
scene("fat_active", S("f1") - CUT, S("f4") - CUT, (t, lt, d) => {
  let g = infoBg(t, COL.yellow);
  const enzAt = PT("f3", 0) + 0.2;
  const mv = P(t, enzAt - 0.4, enzAt + 0.4, E.inOutCubic);
  const cx = lerp(960, 520, mv), cy = lerp(580, 600, mv), cs = lerp(1.25, 0.95, mv);
  const glow = t > PT("f2", 1) ? 0.6 + 0.3 * Math.sin(t * 6) : 0;
  g += pop(t, S("f1") + 0.1, cx, cy, fatCell(0, 0, cs, t, { glow }), { dur: 0.5 });
  g += popTitle(t, S("f1"), 960, 170, [["KÖRPERFETT", COL.yellow]], { size: 110 });
  // nur Speicher? -> aktiv
  g += pop(t, PT("f2", 0) + 0.2, 1450, 420, battery(0, 0, 0.7, 0.8) + T(0, 110, "NUR SPEICHER?", { size: 50, font: "anton", fill: "#C9D3E0" }), { out: PT("f2", 1) + 0.3 });
  g += popTitle(t, PT("f2", 1), 960, 310, [["FETT IST", "#fff"], ["AKTIV", COL.orange]], { size: 90, out: enzAt - 0.3 });
  // Enzym + Umwandlung
  if (t > enzAt) {
    const ex = lerp(cx + 80, 1200, P(t, enzAt, enzAt + 0.6, E.outCubic));
    g += enzyme(ex, 600, 1.2, t, { rot: 180 });
    g += op(P(t, enzAt + 0.3, enzAt + 0.6), T(1200, 790, "AROMATASE", { size: 64, font: "anton", fill: COL.purple, ls: 2 }));
    const cv = PT("f3", 1) + 0.6;
    for (let i = 0; i < 3; i++) {
      const t0 = cv + i * 0.9;
      const k = (t - t0) / 1.2;
      if (k > 0 && k < 1.4) {
        if (k < 0.5) g += moleculeT(lerp(760, 1180, E.inQuad(k / 0.5)), 600 + (1 - k / 0.5) * -160, 0.75);
        else if (k > 0.55) g += moleculeE(lerp(1230, 1700, E.outCubic(clamp((k - 0.55) / 0.6))), 600 - (k - 0.55) * 200, 0.75);
      }
    }
    g += op(P(t, cv, cv + 0.3), T(820, 380, "TESTOSTERON", { size: 52, font: "anton", fill: COL.orange }));
    g += op(P(t, cv + 0.7, cv + 1.0), T(1640, 380, "ÖSTROGEN", { size: 52, font: "anton", fill: COL.pink }));
  }
  return g;
});
sfx(S("f1") + 0.1, "pop"); sfx(PT("f2", 0) + 0.2, "pop", 0.6); sfx(PT("f2", 1), "pop"); sfx(PT("f3", 0) + 0.2, "whoosh", 0.5);
for (let i = 0; i < 3; i++) sfx(PT("f3", 1) + 0.6 + i * 0.9 + 0.6, "tick", 0.6);

scene("fat_more", S("f4") - CUT, S("f5") - CUT, (t, lt, d) => {
  let g = infoBg(t, COL.yellow);
  const a = S("f4");
  const n = Math.min(5, 1 + Math.floor(Math.max(0, t - a) / 0.5));
  for (let i = 0; i < 5; i++) {
    const at = a + i * 0.5;
    const x = 260 + (i % 3) * 260 + (i > 2 ? 130 : 0), y = 420 + (i > 2 ? 300 : 0);
    g += pop(t, at, x, y, fatCell(0, 0, 0.55, t + i) + enzyme(150, 0, 0.55, t + i * 0.4, { rot: 180 }), { dur: 0.4 });
  }
  // Molekülstrom
  for (let j = 0; j < 14; j++) {
    const k = ((t - a) * 0.6 + j / 14) % 1;
    if (t - a < 0.8) break;
    const y = 300 + ((j * 97) % 520);
    g += k < 0.5 ? moleculeT(lerp(80, 1200, k * 2), y, 0.32) : moleculeE(lerp(1200, 1450, (k - 0.5) * 2), y, 0.32);
  }
  // Meter rechts
  const mk = P(t, a + 0.6, EN("f4"), E.inOutSine);
  const bar = (y, label, v, c) => `<g transform="${tr(1480, y)}">${T(0, -20, label, { size: 46, font: "anton", fill: c, anchor: "start" })}<rect x="0" y="0" width="360" height="40" rx="20" fill="#26304F"/><rect x="0" y="0" width="${fx(360 * v)}" height="40" rx="20" fill="${c}"/></g>`;
  g += pop(t, a + 0.3, 0, 0, bar(420, "TESTOSTERON", lerp(0.8, 0.25, mk), COL.orange) + bar(600, "ÖSTROGEN", lerp(0.25, 0.75, mk), COL.pink), {});
  g += popTitle(t, a + 0.2, 960, 160, [["MEHR FETT", COL.yellow], ["=", "#fff"], ["MEHR AROMATASE", COL.purple]], { size: 76 });
  return g;
});
for (let i = 0; i < 5; i++) sfx(S("f4") + i * 0.5, "pop", 0.55);

scene("cycle", S("f5") - CUT, S("f7") - CUT, (t, lt, d) => {
  let g = infoBg(t, COL.red);
  const cx = 960, cy = 560, R = 300;
  const spin = 0;
  // Ring + Pfeile
  let ring = `<circle r="${R}" fill="none" stroke="#2C3966" stroke-width="26"/>`;
  for (let i = 0; i < 4; i++) {
    const a0 = (-90 + i * 90 + 18) * DEG, a1 = (-90 + (i + 1) * 90 - 18) * DEG;
    const on = t > PT("f5", Math.min(3, i)) + 0.3;
    const c = on ? COL.orange : "#43507E";
    ring += `<path d="M ${fx(Math.cos(a0) * R)} ${fx(Math.sin(a0) * R)} A ${R} ${R} 0 0 1 ${fx(Math.cos(a1) * R)} ${fx(Math.sin(a1) * R)}" stroke="${c}" stroke-width="20" fill="none" stroke-linecap="round" ${t > S("f6") ? `stroke-dasharray="30 22" stroke-dashoffset="${fx(-t * 160)}"` : ""}/>`;
    const ax = Math.cos(a1) * R, ay = Math.sin(a1) * R, ang = (-90 + (i + 1) * 90 - 18) + 90;
    ring += `<path d="M -26 -22 L 26 0 L -26 22 Z" fill="${c}" transform="translate(${fx(ax)} ${fx(ay)}) rotate(${fx(ang)})"/>`;
  }
  g += G(tr(cx, cy, spin), ring);
  const nodes = [
    [0, -R, "MEHR FETT", COL.yellow, fatCell(0, 0, 0.32, t)],
    [R, 0, "MEHR ÖSTROGEN", COL.pink, moleculeE(0, 0, 0.6)],
    [0, R, "WENIGER TESTOSTERON", COL.orange, moleculeT(0, 0, 0.6) + arrowUpDown(70, 10, false, COL.red, 0.6)],
    [-R, 0, "NOCH MEHR FETT", COL.yellow, fatCell(0, 0, 0.42, t + 1)],
  ];
  nodes.forEach(([x, y, lbl, c, icon], i) => {
    const at = PT("f5", i);
    const rot = spin * DEG;
    const rx = x * Math.cos(rot) - y * Math.sin(rot), ry = x * Math.sin(rot) + y * Math.cos(rot);
    const hl = t > at && t < at + 0.9 ? 1.12 : 1;
    const lx = rx > 50 ? 150 : rx < -50 ? -150 : 0, ly = ry < -50 ? -120 : ry > 50 ? 130 : 95;
    g += pop(t, at, cx + rx, cy + ry, G(tr(0, 0, 0, hl), `<circle r="95" fill="#141C38" stroke="${c}" stroke-width="8"/>` + icon) +
      T(lx * 1.6, ly + (Math.abs(lx) > 0 ? 18 : 0), lbl, { size: 48, font: "anton", fill: c, anchor: lx > 0 ? "start" : lx < 0 ? "end" : "middle", stroke: "#0B1020", sw: 10 }), { dur: 0.4 });
  });
  g += pop(t, S("f6") + 0.1, cx, cy + 10, title(0, 0, [["KREIS-", "#fff"]], { size: 70 }) + title(0, 70, [["LAUF", COL.red]], { size: 70 }), {});
  return g;
});
for (let i = 0; i < 4; i++) sfx(PT("f5", i), "pop", 0.8);
sfx(S("f6") + 0.1, "whoosh", 0.5);

function fatScale(t, v, o = {}) {
  const x0 = 760, x1 = 1800, y = 640;
  const X = (p) => lerp(x0, x1, (p - 5) / 25);
  let g = "";
  const zones = [[5, 8, COL.red], [8, 12, COL.yellow], [12, 15, COL.green], [15, 20, COL.yellow], [20, 30, "#FF7A45"]];
  zones.forEach(([a, b, c]) => { g += `<rect x="${fx(X(a))}" y="${y - 30}" width="${fx(X(b) - X(a))}" height="60" fill="${c}" opacity="${o.hl && o.hl[0] === a ? 1 : 0.55}"/>`; });
  g += `<rect x="${x0}" y="${y - 30}" width="${x1 - x0}" height="60" rx="8" fill="none" stroke="#F5F7FB" stroke-width="5"/>`;
  [5, 8, 12, 15, 20, 25, 30].forEach((p) => { g += T(X(p), y + 80, p + "%", { size: 38, font: "barlow", fill: "#C9D3E0" }); });
  const mx = X(v);
  g += `<g transform="${tr(mx, y - 46)}"><path d="M -26 -40 L 26 -40 L 0 0 Z" fill="#F5F7FB"/><rect x="-62" y="-104" width="124" height="60" rx="16" fill="#F5F7FB"/>
    <text x="0" y="-60" text-anchor="middle" style="font-family:Anton;font-size:44px;fill:#0E1422">${Math.round(v)} %</text></g>`;
  return g;
}
scene("bodyfat", S("f7") - CUT, S("e1") - 0.3, (t, lt, d) => {
  let g = infoBg(t);
  const v = kf(t, [[S("f8"), 24], [S("f8") + 0.2, 24], [WT("f8", "zwölf") - 0.2, 13.5, E.inOutCubic], [S("f9"), 13.5], [S("f9") + 0.7, 6.5, E.inOutCubic], [S("f10"), 6.5], [S("f10") + 0.8, 24, E.inOutCubic], [WT("f10", "Kalorien", 1), 24], [EN("f10"), 15, E.inOutSine]]);
  const p = t < S("f8") ? POSES.think : t < S("f9") ? pose("proud", { neck: -10 }) : t < S("f10") ? pose("tired", { neck: 20 }) : t < EN("f10") - 0.8 ? POSES.think : POSES.proud;
  g += wolf({ x: 330, y: standY(1010, 0.85), s: 0.85, pose: p, t, sway: true });
  if (t < S("f8")) g += pop(t, S("f7") + 0.1, 470, 230, emote("question", 0, 0, t), {});
  g += popTitle(t, S("f8"), 1280, 200, [["KÖRPERFETT", "#fff"], ["%", COL.yellow]], { size: 96 });
  if (t > S("f8")) {
    const hl = t < S("f9") ? [12] : t < S("f10") ? [5] : t < WT("f10", "Kalorien", 1) ? [20] : [12];
    g += op(P(t, S("f8"), S("f8") + 0.3), fatScale(t, v, { hl }));
  }
  if (t > S("f8") && t < S("f9")) g += pop(t, WT("f8", "zwölf"), 1300, 860, pill(0, 0, "ZIEL: 12–15 %", { size: 58, bg: COL.green }), {});
  if (t > S("f9") && t < S("f10")) {
    g += pop(t, S("f9") + 0.3, 1300, 840, pill(0, 0, "ZU EXTREM", { size: 58, bg: COL.red }), {});
    g += pop(t, PT("f9", 1), 1300, 950, T(0, 0, "Hormone ↓  ·  ständig müde", { size: 48, font: "barlow", fill: "#FFB3BD" }), {});
  }
  if (t > S("f10")) {
    g += pop(t, S("f10") + 0.5, 1300, 840, pill(0, 0, "ÜBER 20 %?", { size: 58, bg: "#FF7A45" }), {});
    g += pop(t, WT("f10", "Kaloriendefizit"), 1300, 960, plate(-330, 0, 0.45, "") + T(40, 18, "−300 bis −500 kcal / Tag", { size: 54, font: "anton", fill: COL.yellow }), {});
  }
  return g;
});
sfx(S("f7") + 0.1, "pop"); sfx(S("f8"), "whoosh", 0.4); sfx(WT("f8", "zwölf"), "pop"); sfx(S("f9") + 0.3, "pop"); sfx(S("f10") + 0.5, "pop"); sfx(WT("f10", "Kaloriendefizit"), "pop");

// =============== KAPITEL 3: ESSEN ===============
WIPES.push({ at: S("e1") - 0.3, color: COL.green });
sfx(S("e1") - 0.5, "whoosh", 0.9);
scene("ch3", S("e1") - 0.3, S("e2") - CUT, (t, lt, d) => chapterCard(t, lt, d, "03", "ECHTES ESSEN", null, "#17704A", plate(0, 30, 0.7, egg(-30, -16, 0.35) + avocado(40, -10, 0.3))));

const FOODS = [["e4", (x, y) => egg(x, y, 0.85), "EIER"], ["e5", (x, y) => steak(x, y, 0.9) + halalBadge(x + 110, y - 70, 0.75), "ROTES FLEISCH"], ["e6", (x, y) => avocado(x, y, 0.85), "AVOCADO"],
  ["e7", (x, y) => oliveOil(x, y - 10, 0.75), "OLIVENÖL"], ["e8", (x, y) => salmon(x, y, 0.9), "LACHS"], ["e8b", (x, y) => tunaCan(x, y, 1.0), "THUNFISCH"]];
scene("food", S("e2") - CUT, S("c1") - 0.3, (t, lt, d) => {
  let g = infoBg(t, COL.green);
  const up = P(t, S("e3"), S("e3") + 0.5, E.inOutCubic);
  // Cholesterin -> Testosteron
  const my = lerp(470, 165, up), ms = lerp(1, 0.55, up);
  g += pop(t, S("e2"), lerp(560, 640, up), my, steroid(0, 0, ms, COL.yellow, { left: "OH", right: "tail" }) + op(1 - up, T(0, 210, "CHOLESTERIN", { size: 56, font: "anton", fill: COL.yellow })), {});
  g += pop(t, S("e2") + 0.5, 960, my, arrowRight(-90, 0, 180, "#F5F7FB", ms), {});
  g += pop(t, WT("e2", "gebaut") - 0.2, lerp(1380, 1280, up), my, steroid(0, 0, ms, COL.orange, { left: "O", right: "OH" }) + op(1 - up, T(0, 210, "TESTOSTERON", { size: 56, font: "anton", fill: COL.orange })), {});
  g += popTitle(t, S("e3") + 0.2, 960, 330, [["GESUNDE", "#fff"], ["FETTE", COL.green]], { size: 96 });
  FOODS.forEach(([id, draw, lbl], i) => {
    const at = id === "e8b" ? WT("e8", "Thunfisch") - 0.1 : id === "e8" ? WT("e8", "Lachs") - 0.1 : S(id);
    const x = 960 + (i - 2.5) * 300, y = 640;
    g += pop(t, at, x, y, `<circle r="128" fill="#1D2A4A"/>` + G(tr(0, 0, 0, 0.85), draw(0, -10)) + T(0, 185, lbl, { size: 40, font: "anton", fill: "#F5F7FB", ls: 1 }), { dur: 0.4 });
  });
  if (t > S("e9")) {
    const k = P(t, S("e9"), S("e9") + 0.4);
    g += `<rect y="${fx(lerp(1080, 960, k))}" width="${W}" height="140" fill="#0E1422" opacity="0.92"/>`;
    g += op(k, title(960, 1040, [["= ROHMATERIAL FÜR", "#fff"], ["TESTOSTERON", COL.orange]], { size: 64 }));
  }
  return g;
});
sfx(S("e2"), "pop"); sfx(WT("e2", "gebaut") - 0.2, "pop"); sfx(S("e3") + 0.2, "whoosh", 0.4);
["e4", "e5", "e6", "e7"].forEach((id) => sfx(S(id), "pop", 0.8)); sfx(WT("e8", "Lachs") - 0.1, "pop", 0.8); sfx(WT("e8", "Thunfisch") - 0.1, "pop", 0.8); sfx(S("e9"), "whoosh", 0.4);

// =============== KAPITEL 4: STRESS ===============
WIPES.push({ at: S("c1") - 0.3, color: COL.red });
sfx(S("c1") - 0.5, "whoosh", 0.9);
scene("ch4", S("c1") - 0.3, S("c2") - CUT, (t, lt, d) => chapterCard(t, lt, d, "04", "STRESS", "KONTROLLIEREN", "#8C1D3A", gaugeSemi(0, 30, 80, 0.3 + 0.1 * Math.sin(t * 2))));

function moonCracked(x, y, s) { return G(tr(x, y, 0, s), crescent(0, 0, 60, "#FFE7A3", "#141C38") + `<path d="M -40 -30 L -10 -5 L -30 15 L 0 40" stroke="#FF4D5E" stroke-width="7" fill="none"/>`); }
scene("cortisol", S("c2") - CUT, S("c5") - CUT, (t, lt, d) => {
  let g = infoBg(t, COL.red);
  const v = kf(t, [[S("c2"), 0.22], [PT("c3", 0) + 0.6, 0.22], [WT("c3", "Feind"), 0.9, E.inOutCubic], [EN("c4"), 0.95]]);
  const stressed = P(t, WT("c3", "Schlaf"), WT("c3", "Feind"));
  const p = mix(POSES.calm, POSES.stressed, stressed);
  g += wolf({ x: 380, y: standY(1010, 0.85), s: 0.85, pose: p, t, sway: true });
  if (stressed > 0.5) g += emote("sweat", 590, 430, t, 1.2) + emote("anger", 320, 400, t, 1.1);
  g += pop(t, S("c2"), 1240, 470, gaugeSemi(0, 0, 250, v + Math.sin(t * 20) * 0.01 * (v > 0.6 ? 1 : 0), { label: "CORTISOL" }), {});
  if (t < S("c3")) {
    g += pop(t, PT("c2", 0) + 0.3, 1240, 110, pill(0, 0, "AN SICH NICHT SCHLECHT", { size: 50, bg: "#2B3A6B" }), {});
    g += pop(t, PT("c2", 1) + 0.1, 1040, 700, checkIcon(-150, 0, 0.8) + T(-110, 15, "hilft bei Stress", { size: 46, font: "barlow", fill: "#F5F7FB", anchor: "start" }), {});
    g += pop(t, WT("c2", "Blutzucker") - 0.1, 1040, 800, checkIcon(-150, 0, 0.8) + T(-110, 15, "Blutzucker stabil", { size: 46, font: "barlow", fill: "#F5F7FB", anchor: "start" }), {});
  } else if (t < S("c4")) {
    const causes = [["Schlaf", moonCracked(0, 0, 0.9), "SCHLECHTER SCHLAF"], ["Übertraining", barbell(0, 0, 0.55) + emote("sweat", 70, -60, t, 0.9), "ÜBERTRAINING"], ["Scrollen", phoneNight(0, 0, 0.6), "2-UHR-SCROLLEN"]];
    causes.forEach(([w, icon, lbl], i) => { g += pop(t, WT("c3", w) - 0.1, 900 + i * 330, 790, icon + T(0, 130, lbl, { size: 38, font: "anton", fill: "#FFB3BD" }), {}); });
    g += stamp(1240, 120, "FEIND DES TESTOSTERONS", t, WT("c3", "Feind"), { size: 54, rot: -4 });
  } else {
    const fx3 = [["Blutzucker", "BLUTZUCKER", true], ["Bauchfett", "BAUCHFETT", true], ["Testosteron", "TESTOSTERON", false]];
    fx3.forEach(([w, lbl, up], i) => {
      g += pop(t, WT("c4", w) - 0.1, 960 + i * 300, 800, arrowUpDown(0, -10, up, up ? COL.red : COL.orange, 1.1) + T(0, 110, lbl, { size: 40, font: "anton", fill: "#F5F7FB" }), {});
    });
  }
  return g;
});
sfx(S("c2"), "pop"); sfx(PT("c2", 0) + 0.3, "pop", 0.6); sfx(PT("c2", 1) + 0.1, "tick"); sfx(WT("c2", "Blutzucker") - 0.1, "tick");
["Schlaf", "Übertraining", "Scrollen"].forEach((w) => sfx(WT("c3", w) - 0.1, "pop", 0.7)); sfx(WT("c3", "Feind"), "stamp");
["Blutzucker", "Bauchfett", "Testosteron"].forEach((w) => sfx(WT("c4", w) - 0.1, "pop", 0.7));

scene("calm", S("c5") - CUT, S("r1") - 0.3, (t, lt, d) => {
  let g = infoBg(t, COL.green);
  g += `<circle cx="420" cy="620" r="420" fill="url(#gGlowG)" opacity="0.8"/>`;
  g += wolf({ x: 420, y: standY(1010, 0.9), s: 0.9, pose: pose("calm", { smile: 0.9 }), t, sway: true, wag: 0.5 });
  if (t < S("c6") - 0.1) {
    const items = [[S("c5") + 0.3, "Schlaf schützen"], [WT("c5", "Stress") - 0.1, "Stress niedrig halten"], [PT("c5", 1) + 0.6, "Alkohol? Sowieso nie."]];
    g += checklist(t, 980, 230, "STRESS-PLAN", items, { head: COL.green, w: 740 });
    g += pop(t, PT("c5", 1) + 0.6, 1640, 640, bottleCrossed(0, 0, 0.45), {});
  } else {
    const a = S("c6");
    const ang = lerp(14, -14, P(t, a + 0.2, a + 1.4, E.outBack));
    g += pop(t, a, 1250, 620, seesaw(0, 0, 0.75, ang, weightBlock("CORTISOL", COL.red), weightBlock("TESTOSTERON", COL.orange, 330)), {});
    g += pop(t, a + 0.5, 980, 300, arrowUpDown(0, 0, false, COL.red, 1) , {});
    g += pop(t, PT("c6", 1) + 0.1, 1540, 300, arrowUpDown(0, 0, true, COL.green, 1), {});
  }
  return g;
});
sfx(S("c5") + 0.3, "tick"); sfx(WT("c5", "Stress") - 0.1, "tick"); sfx(PT("c5", 1) + 0.6, "tick"); sfx(S("c6"), "whoosh", 0.5); sfx(S("c6") + 1.2, "boom", 0.5);

// =============== RUDEL-PLAN ===============
WIPES.push({ at: S("r1") - 0.3, color: COL.orange });
sfx(S("r1") - 0.5, "whoosh", 0.9);
const PLAN = [["r2", "7–9 STUNDEN SCHLAF", () => crescent(0, 0, 30, "#FFE7A3", "#26304F")], ["r3", "SCHWERE GRUNDÜBUNGEN", () => barbell(0, 0, 0.17)],
  ["r4", "12–15 % KÖRPERFETT", () => T(0, 16, "%", { size: 52, font: "anton", fill: COL.yellow })], ["r5", "ECHTE FETTE & PROTEIN", () => avocado(0, 0, 0.3)],
  ["r6", "KEIN ALKOHOL · WENIG STRESS · KEIN 2-UHR-SCROLLEN", () => bottleCrossed(0, 0, 0.26)]];
scene("recap", S("r1") - 0.3, S("r7") - CUT, (t, lt, d) => {
  let g = `<rect width="${W}" height="${H}" fill="#141B33"/>` + dots();
  g += `<rect x="0" y="0" width="${W}" height="190" fill="${COL.orange}"/>`;
  g += pop(t, S("r1"), 960, 125, title(0, 0, [["DER RUDEL-PLAN", "#fff"]], { size: 110, stroke: "#B5520E", sw: 10 }) + pawPrint(-520, -36, 0.7, "#fff") + pawPrint(520, -36, 0.7, "#fff"), {});
  PLAN.forEach(([id, txt, icon], i) => {
    const y = 300 + i * 150;
    const row = `<rect x="-760" y="-58" width="1300" height="116" rx="58" fill="#1F2A4D"/><circle cx="-700" cy="0" r="46" fill="#2E3B66"/>` +
      G(tr(-700, 0), icon()) + T(-620, 18, txt, { size: i === 4 ? 44 : 54, font: "anton", fill: "#F5F7FB", anchor: "start", ls: 1 }) + checkIcon(470, 0, 0.9);
    if (t < S(id)) g += op(0.35 * P(t, S("r1") + 0.2, S("r1") + 0.6), G(tr(840, y), `<rect x="-760" y="-58" width="1300" height="116" rx="58" fill="#1F2A4D"/><circle cx="-700" cy="0" r="46" fill="#2E3B66"/>`));
    g += pop(t, S(id), 840, y, row, { dur: 0.4 });
  });
  g += wolf({ x: 1700, y: standY(1060, 0.78), s: 0.78, pose: POSES.proud, t, wag: 0.8 });
  return g;
});
sfx(S("r1"), "pop"); ["r2", "r3", "r4", "r5", "r6"].forEach((id) => sfx(S(id), "tick", 0.8));

scene("not_gummy", S("r7") - CUT, S("r10") - 0.3, (t, lt, d) => {
  let g = infoBg(t);
  g += pop(t, S("r7"), 330, 540, gummyJar(0, 0, 1.3) + T(0, 330, "KEIN GUMMIBÄRCHEN", { size: 52, font: "anton", fill: "#F5F7FB" }), {});
  if (t > S("r7") + 0.5) g += bigCross(330, 540, 1.1, P(t, S("r7") + 0.5, S("r7") + 0.9));
  g += pop(t, S("r8"), 960, 540, powderTub(0, 0, 1.3) + T(0, 330, "KEIN PULVER", { size: 52, font: "anton", fill: "#F5F7FB" }), {});
  if (t > S("r8") + 0.5) g += bigCross(960, 540, 1.1, P(t, S("r8") + 0.5, S("r8") + 0.9));
  if (t > S("r9")) {
    g += pop(t, S("r9"), 1590, 560, `<circle r="320" fill="url(#gGlowO)"/>`, {});
    g += pop(t, S("r9"), 1590, 560, wolf({ x: 0, y: standY(300, 0.72), s: 0.72, pose: POSES.victory, t, wag: 1 }) + emote("sparkle", 170, -330, t, 1.3), { dur: 0.5 });
    g += pop(t, S("r9") + 0.3, 1590, 965, T(0, 0, "WOLF!", { size: 84, font: "anton", fill: COL.orange }) + checkIcon(160, -28, 1), {});
  }
  return g;
});
sfx(S("r7"), "pop"); sfx(S("r7") + 0.5, "stamp", 0.7); sfx(S("r8"), "pop"); sfx(S("r8") + 0.5, "stamp", 0.7); sfx(S("r9"), "boom", 0.6);

scene("weeks", S("r10") - 0.3, S("r11") - CUT, (t, lt, d) => {
  let g = `<rect width="${W}" height="${H}" fill="#2A2577"/>` + dots();
  const k = P(t, S("r10"), EN("r10") + 0.3, E.inOutSine);
  const wk = 1 + Math.floor(k * 7.99);
  const flip = (k * 8) % 1;
  g += calendarPage(960, 520, 1.2, String(Math.min(8, wk)), "WOCHE");
  if (k < 0.99) g += op(1 - flip, G(tr(960, 520 - flip * 300, flip * 40, 1.2, 1.2 * (1 - flip * 0.6)), `<rect x="-150" y="-170" width="300" height="340" rx="26" fill="#E3E8F0"/>`));
  g += popTitle(t, S("r10"), 960, 160, [["WOCHEN", "#fff"], ["SPÄTER", COL.yellow]], { size: 110 });
  const a = k * TAU * 3;
  g += sun(960 + Math.cos(a) * 640, 560 + Math.sin(a) * 300, 40, t) + crescent(960 - Math.cos(a) * 640, 560 - Math.sin(a) * 300, 40, "#FFE7A3", "#2A2577");
  return g;
});
sfx(S("r10") - 0.3, "whoosh", 0.7); for (let i = 0; i < 7; i++) sfx(S("r10") + i * 0.18, "tick", 0.35);

scene("final_bed", S("r11") - CUT, PT("r11", 1) - 0.06, (t, lt, d) => {
  const wake = S("r11") + 0.05;
  const k = P(t, wake, wake + 0.5, E.outBackBig);
  const p = kf(t, [[wake, LIE], [wake + 0.5, pose("sit", { ear: 0, smile: 1, neck: -10, torso: -4 })]]);
  return cam(bedroomScene(t, { k, pose: p, sky: "day", time: "06:30", light: 0.08 }), lt / Math.max(d, 0.1), { z0: 1.04, z1: 1.1, cx: 1050, cy: 520 });
});
sfx(S("r11") + 0.05, "whoosh", 0.6);

scene("final_mirror", PT("r11", 1) - 0.06, S("r15") - CUT, (t, lt, d) => {
  const sm = t > S("r14") ? 1 : 0.7;
  const p = pose("proud", { smile: sm, neck: -6 });
  const aura = t > S("r13") ? P(t, S("r13"), S("r13") + 0.6) * (0.75 + 0.25 * Math.sin(t * 5)) : 0;
  let g = cam(mirrorScene(t, { pose: p, wag: 0.8, aura }), lt / d, { z0: 1.0, z1: 1.06, cx: 1000, cy: 420 });
  const bk = P(t, S("r12") + 0.6, S("r12") + 1.9, E.inOutCubic);
  g += pop(t, PT("r12", 1), 1300, 120, battery(0, 0, lerp(0.08, 1, bk), 1.05, { bolt: bk < 1 }), {});
  g += popTitle(t, WT("r12", "voll") - 0.1, 470, 220, [["AKKU", "#fff"], ["VOLL", COL.green]], { size: 90 });
  if (t > S("r13")) {
    g += pop(t, S("r13") + 0.1, 1560, 92, flame(0, 0, 0.9, t), { dur: 0.5, ease: E.outBackBig });
    g += popTitle(t, S("r13") + 0.3, 470, 110, [["DAS FEUER", "#fff"], ["IST ZURÜCK", COL.orange]], { size: 76 });
  }
  if (t > S("r14")) g += emote("sparkle", 860, 230, t, 1.3) + emote("sparkle", 1640, 230, t + 0.7, 1.0);
  return g;
});
sfx(PT("r11", 1), "whoosh", 0.4); sfx(PT("r12", 1), "pop"); sfx(S("r12") + 0.6, "charge"); sfx(S("r13") + 0.1, "fire"); sfx(S("r14"), "sparkle");

scene("outro", S("r15") - CUT, TL.duration + 1, (t, lt, d) => {
  const endT = EN("r15") + 0.8;
  let g = outdoor(t, { sunK: 1 });
  g += wolf({ x: 560, y: standY(900, 0.95), s: 0.95, pose: POSES.victory, t, wag: 1 });
  g += popTitle(t, PT("r15", 0), 1240, 250, [["KEIN", "#fff"], ["GLÜCK.", COL.yellow]], { size: 110 });
  g += popTitle(t, PT("r15", 1) + 0.3, 1240, 420, [["TRAINIER", "#fff"], ["DEIN HORMON.", COL.orange]], { size: 96 });
  g += popTitle(t, WT("r15", "raten") - 0.4, 1240, 560, [["STATT ZU RATEN.", "#fff"]], { size: 80 });
  const fk = P(t, endT, endT + 0.8);
  if (fk > 0) {
    g += `<rect width="${W}" height="${H}" fill="#0B1020" opacity="${fx(fk)}"/>`;
    g += op(P(t, endT + 0.5, endT + 1.1), pawPrint(960, 330, 1.2) +
      T(960, 520, "Hinweis", { size: 64, font: "anton", fill: COL.orange, ls: 3 }) +
      T(960, 610, "Allgemeine Informationen – keine ärztliche Beratung.", { size: 50, font: "barlow6", fill: "#E3E8F0" }) +
      T(960, 680, "Bei anhaltenden Beschwerden: ärztlich abklären lassen.", { size: 50, font: "barlow6", fill: "#E3E8F0" }));
  }
  return g;
});
sfx(PT("r15", 0), "pop"); sfx(PT("r15", 1) + 0.3, "pop"); sfx(WT("r15", "raten") - 0.4, "boom", 0.6);
