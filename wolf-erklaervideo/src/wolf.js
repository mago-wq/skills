// "Wolf" – Cutout-Rig im Profil (Blick nach rechts). Bewusst OHNE Augen.
// Koordinaten: Ursprung = Becken, y nach unten. Stehend liegen die Sohlen bei y=272.
const WC = {
  fur: "#8E9FB4", furD: "#71829A", furDD: "#596880", light: "#E8EDF3", lightD: "#C8D1DD",
  ear: "#D9A898", nose: "#1F252E", mouth: "#4B1823", tongue: "#E46A78", line: "#262D3A",
  shirt: "#FF7A1F", shirtD: "#D9600F", stripe: "#FFFFFF",
  shorts: "#2E3D5B", shortsD: "#222D45", seam: "#DCE3EE",
};
const WOLF_FOOT_Y = 272;

// Kapsel entlang +y (0..len), vorne = +x
function capsule(len, w0, w1, bF = 0, bB = 0) {
  const r0 = w0 / 2, r1 = w1 / 2;
  return `M ${fx(-r0)} 0 A ${fx(r0)} ${fx(r0)} 0 0 1 ${fx(r0)} 0 ` +
    `C ${fx(r0 + bF)} ${fx(len * 0.3)} ${fx(r1 + bF * 0.6)} ${fx(len * 0.72)} ${fx(r1)} ${fx(len)} ` +
    `A ${fx(r1)} ${fx(r1)} 0 0 1 ${fx(-r1)} ${fx(len)} ` +
    `C ${fx(-r1 - bB * 0.6)} ${fx(len * 0.72)} ${fx(-r0 - bB)} ${fx(len * 0.3)} ${fx(-r0)} 0 Z`;
}

// 2-Knochen-IK: liefert Winkel (Radiant, Welt) beider Knochen + Gelenkposition
function ik2(px, py, tx, ty, l1, l2, bend) {
  const dx = tx - px, dy = ty - py;
  const d = clamp(Math.hypot(dx, dy), Math.abs(l1 - l2) + 0.5, l1 + l2 - 0.5);
  const a = Math.atan2(dy, dx);
  const A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const a1 = a + bend * A;
  const ex = px + l1 * Math.cos(a1), ey = py + l1 * Math.sin(a1);
  return { a1, a2: Math.atan2(ty - ey, tx - ex), ex, ey };
}
const segRot = (a) => a / DEG - 90; // Segment zeigt lokal nach +y

const POSES = {
  stand: { px: 0, py: 0, torso: 2, neck: 0, aF: { x: 26, y: 186 }, aB: { x: -2, y: 186 }, fF: { x: 18, y: 246 }, fB: { x: -14, y: 246 }, ear: 0, tail: 0, smile: 0.15, open: 0, wF: 0, wB: 0 },
  tired: { px: -4, py: 10, torso: 15, neck: 26, aF: { x: 34, y: 186 }, aB: { x: 12, y: 186 }, fF: { x: 18, y: 246 }, fB: { x: -14, y: 246 }, ear: 0.85, tail: -14, smile: -0.7, open: 0, wF: 0, wB: 0 },
  proud: { px: 0, py: -4, torso: -5, neck: -8, aF: { x: 34, y: 180 }, aB: { x: -10, y: 182 }, fF: { x: 26, y: 246 }, fB: { x: -22, y: 246 }, ear: 0, tail: 22, smile: 1, open: 0, wF: 0, wB: 0 },
  laugh: { px: 0, py: 2, torso: -8, neck: -24, aF: { x: 60, y: 120 }, aB: { x: 30, y: 140 }, fF: { x: 18, y: 246 }, fB: { x: -14, y: 246 }, ear: 0.15, tail: 18, smile: 1, open: 0.95, wF: 30, wB: 20 },
  think: { px: 0, py: 0, torso: 3, neck: 6, aF: { x: 118, y: -44 }, aB: { x: 6, y: 184 }, fF: { x: 18, y: 246 }, fB: { x: -14, y: 246 }, ear: 0.2, tail: 0, smile: -0.2, open: 0, wF: -20, wB: 0 },
  stretch: { armUp: true, px: 0, py: -6, torso: -7, neck: -26, aF: { x: -128, y: -134 }, aB: { x: -160, y: -110 }, fF: { x: 22, y: 246 }, fB: { x: -18, y: 246 }, ear: 0, tail: 16, smile: 0.8, open: 0, wF: 0, wB: 0 },
  stressed: { px: -6, py: 6, torso: 12, neck: 12, aF: { x: 112, y: -60 }, aB: { x: 70, y: -40 }, fF: { x: 18, y: 246 }, fB: { x: -16, y: 246 }, ear: 1, tail: -18, smile: -1, open: 0.25, wF: -40, wB: -30 },
  calm: { px: 0, py: 0, torso: 0, neck: -4, aF: { x: 30, y: 180 }, aB: { x: 0, y: 182 }, fF: { x: 20, y: 246 }, fB: { x: -16, y: 246 }, ear: 0.1, tail: 6, smile: 0.7, open: 0, wF: 0, wB: 0 },
  flex: { px: 0, py: -2, torso: -4, neck: -12, aF: { x: 74, y: -26 }, aB: { x: 60, y: -40 }, fF: { x: 26, y: 246 }, fB: { x: -24, y: 246 }, ear: 0, tail: 24, smile: 1, open: 0, wF: -10, wB: -10 },
  phone: { px: 0, py: 0, torso: 4, neck: 10, aF: { x: 128, y: 2 }, aB: { x: 0, y: 186 }, fF: { x: 18, y: 246 }, fB: { x: -14, y: 246 }, ear: 0.3, tail: 0, smile: 0, open: 0, wF: -70, wB: 0 },
  victory: { armUp: true, px: 0, py: -6, torso: -6, neck: -18, aF: { x: -138, y: -122 }, aB: { x: -4, y: 184 }, fF: { x: 30, y: 246 }, fB: { x: -26, y: 246 }, ear: 0, tail: 26, smile: 1, open: 0, wF: 0, wB: 0 },
  sit: { px: 0, py: 0, torso: 0, neck: 4, aF: { x: 60, y: 160 }, aB: { x: 30, y: 168 }, fF: { x: 236, y: 30 }, fB: { x: 226, y: 30 }, ear: 0.4, tail: 0, smile: 0, open: 0, wF: 0, wB: 0 },
};
const pose = (name, over = {}) => ({ ...POSES[name], ...over });

// Übungs-Posen als Funktion der Bewegungsphase k (0..1)
function exPose(kind, k) {
  const e = E.inOutSine(k);
  if (kind === "squat") {
    return { ...POSES.stand, px: -24 * e, py: 120 * e, torso: 8 + 30 * e, neck: -6 - 18 * e, ear: 0.1, smile: 0.2 - 0.6 * e, tail: 10, bar: "back" };
  }
  if (kind === "deadlift") {
    return { ...POSES.stand, px: -34 * e, py: 92 * e, torso: 6 + 56 * e, neck: -10 - 34 * e, ear: 0.1, smile: 0.1 - 0.5 * e, tail: 10, bar: "hang", barY: lerp(30, 196, e), barX: lerp(24, 70, e) };
  }
  if (kind === "row") {
    return { ...POSES.stand, px: -30, py: 40, torso: 52, neck: -42, ear: 0.1, smile: -0.2, tail: 8, bar: "row", pull: e };
  }
  if (kind === "press") {
    return { ...POSES.stand, torso: -2, neck: -8 - 8 * e, ear: 0.05, smile: 0.1, tail: 10, bar: "press", barY: lerp(-262, -436, e) };
  }
  if (kind === "pullup") {
    return { ...POSES.stand, py: -110 * e, torso: -4, neck: -16, ear: 0.05, smile: 0.2, tail: -6, fF: { x: 40, y: 236 - 110 * e }, fB: { x: -6, y: 226 - 110 * e }, bar: "pullup", pull: e };
  }
  if (kind === "curl") {
    return { ...POSES.stand, torso: 0, neck: 10, ear: 0.2, smile: 0.4, tail: 4, curl: e };
  }
  return POSES.stand;
}

function rotPt(x, y, deg) { const c = Math.cos(deg * DEG), s = Math.sin(deg * DEG); return [x * c - y * s, x * s + y * c]; }

// Hauptfunktion. o: {x, y, s, flip, rot, pose, t, wag, tint}
function wolf(o) {
  const p = o.pose || POSES.stand, t = o.t != null ? o.t : CURRENT_T;
  const s = o.s || 1, flip = o.flip ? -1 : 1;
  const breathe = Math.sin(t * TAU * 0.28) * 0.012;
  const th = p.torso + (o.sway ? Math.sin(t * TAU * 0.2) * 1.2 : 0);
  const pel = [p.px, p.py];
  const T2W = (x, y) => { const r = rotPt(x, y * (1 + breathe), th); return [r[0] + pel[0], r[1] + pel[1]]; };

  const shF = T2W(16, -186), shB = T2W(-2, -190), neckP = T2W(24, -236), tailP = T2W(-40, -4);
  const hipF = [pel[0] + 12, pel[1] + 16], hipB = [pel[0] - 14, pel[1] + 16];

  // Hantel/Stange: Pfotenziele bestimmen
  let barSvg = "", aFt, aBt, aFk = null;
  const rel = (sh, a) => [sh[0] + a.x, sh[1] + a.y];
  aFt = rel(shF, p.aF); aBt = rel(shB, p.aB);
  if (p.bar === "back") {
    const b = T2W(-14, -214);
    aFt = [b[0] + 30, b[1] + 8]; aBt = [b[0] + 10, b[1] + 8];
    barSvg = barbell(b[0], b[1], 0.9);
  } else if (p.bar === "hang") {
    aFt = [p.barX + 8, p.barY]; aBt = [p.barX - 6, p.barY];
    barSvg = barbell(p.barX, p.barY + 6, 0.9);
  } else if (p.bar === "row") {
    const bx = lerp(150, 70, p.pull), by = lerp(190, 60, p.pull);
    aFt = [bx + 8, by]; aBt = [bx - 6, by];
    barSvg = barbell(bx, by + 6, 0.8);
  } else if (p.bar === "press") {
    aFt = [52, p.barY + 8]; aBt = [36, p.barY + 8];
    barSvg = barbell(44, p.barY, 0.85);
  } else if (p.bar === "pullup") {
    aFt = [40, -470]; aBt = [26, -470];
  } else if (p.curl != null) {
    aFk = { s: 96, e: lerp(84, -64, p.curl) };
  }

  const armF = aFk
    ? (() => { const a1 = aFk.s * DEG, ex = shF[0] + 100 * Math.cos(a1), ey = shF[1] + 100 * Math.sin(a1); return { a1, a2: aFk.e * DEG, ex, ey }; })()
    : ik2(shF[0], shF[1], aFt[0], aFt[1], 100, 94, 1);
  const armB = ik2(shB[0], shB[1], aBt[0], aBt[1], 100, 94, 1);
  const legF = ik2(hipF[0], hipF[1], p.fF.x + (p.px * 0), p.fF.y, 118, 116, -1);
  const legB = ik2(hipB[0], hipB[1], p.fB.x, p.fB.y, 118, 116, -1);

  const C = o.tint ? o.tint : WC;
  const arm = (sh, a, back, wrist, holding) => {
    const up = capsule(100, 56, 40, 13, 7), lo = capsule(94, 44, 34, 6, 5);
    const fill = back ? C.furD : C.fur;
    const wx = a.ex + 94 * Math.cos(a.a2), wy = a.ey + 94 * Math.sin(a.a2);
    return G(tr(sh[0], sh[1], segRot(a.a1)), `<path d="${up}" fill="${fill}"/><ellipse cx="0" cy="6" rx="33" ry="30" fill="${fill}"/>`) +
      G(tr(a.ex, a.ey, segRot(a.a2)), `<path d="${lo}" fill="${fill}"/>`) +
      G(tr(wx, wy, segRot(a.a2) + (wrist || 0)), (holding || "") + paw(fill, back));
  };
  const leg = (hip, l, back, foot) => {
    const th1 = capsule(118, 68, 54, 6, 4), sh1 = capsule(116, 46, 34, 2, 10);
    const ax = l.ex + 116 * Math.cos(l.a2), ay = l.ey + 116 * Math.sin(l.a2);
    const fur = back ? C.furD : C.fur, sh = back ? C.shortsD : C.shorts;
    return G(tr(l.ex, l.ey, segRot(l.a2)), `<path d="${sh1}" fill="${fur}"/>`) +
      G(tr(ax, ay, foot || 0), footShape(fur)) +
      G(tr(hip[0], hip[1], segRot(l.a1)), `<path d="${th1}" fill="${sh}"/>` +
        `<rect x="-31" y="104" width="62" height="16" rx="8" fill="${back ? C.shortsD : C.shorts}"/>` +
        `<path d="M 2 6 L 2 108" stroke="${C.seam}" stroke-width="5" stroke-linecap="round" opacity="${back ? 0.35 : 0.8}"/>`);
  };

  const wag = (o.wag || 0) * Math.sin(t * TAU * 2.2) * 14;
  const tail = G(tr(tailP[0], tailP[1], 28 - p.tail + wag + th * 0.4), tailShape(C));

  // Torso (im Torso-Frame)
  const torso = G(tr(pel[0], pel[1], th, 1, 1 + breathe), `
    <path d="M -42 8 C -56 -40 -72 -110 -66 -165 C -62 -200 -38 -228 -8 -236 L 34 -240 C 60 -228 86 -198 88 -158 C 89 -128 74 -104 56 -92 C 50 -60 46 -25 42 8 Z" fill="${C.fur}"/>
    <path d="M -43 10 C -57 -40 -72 -110 -66 -165 C -64 -180 -60 -192 -53 -199 C -24 -186 36 -183 76 -192 C 84 -176 88 -162 87 -150 C 86 -126 72 -104 56 -92 C 50 -60 46 -25 42 10 Z" fill="${C.shirt}"/>
    <path d="M -66 -150 C -64 -176 -60 -190 -53 -199 C -40 -192 -28 -188 -16 -186 C -32 -170 -48 -160 -66 -150 Z" fill="${C.shirtD}"/><path d="M -43 10 C -50 -20 -56 -50 -60 -80 C -48 -60 -36 -30 -30 10 Z" fill="${C.shirtD}" opacity="0.6"/>
    ${G(tr(46, -134, 0, 0.62), flameIcon("#FFFFFF", "#FFE2C2"))}
    <path d="M -50 -6 L 46 -6 C 52 10 52 26 46 34 L -50 34 C -56 20 -55 4 -50 -6 Z" fill="${C.shorts}"/>
    <rect x="-52" y="-10" width="100" height="14" rx="6" fill="${C.shortsD}"/>`);

  const ruff = G(tr(pel[0], pel[1], th), `
    <ellipse cx="22" cy="-232" rx="44" ry="30" fill="${C.fur}"/>
    <path d="M -44 -196 L -58 -210 L -40 -216 L -52 -234 L -28 -232 L -32 -252 L -10 -242 L 0 -262 L 16 -246 L 34 -258 L 40 -240 L 60 -246 L 56 -226 L 74 -220 L 60 -204 C 40 -192 -2 -190 -44 -196 Z" fill="${C.lightD}"/>
    <path d="M -30 -200 L -38 -214 L -22 -214 L -24 -230 L -6 -224 L 4 -240 L 14 -226 L 30 -236 L 34 -220 L 52 -222 L 46 -206 C 28 -198 0 -196 -30 -200 Z" fill="${C.light}" opacity="0.9"/>`);

  const head = G(tr(neckP[0], neckP[1], th + p.neck, 1.2), wolfHead(p, C, t));

  let holdF = "";
  if (o.hold === "phone") holdF = G(tr(4, 22, 90), phoneSmall(o.phoneGlow || 0));
  if (o.hold === "dumbbell" || p.curl != null) holdF = G(tr(2, 20, 90), dumbbell(0.8));
  if (o.hold === "cup") holdF = G(tr(10, 16, -90), cupSmall());

  const frontArm = arm(shF, armF, false, p.wF, holdF);
  const body =
    arm(shB, armB, true, p.wB) +
    leg(hipB, legB, true, p.footB || 0) +
    (o.noTail ? "" : tail) + torso +
    leg(hipF, legF, false, p.footF || 0) +
    (p.armUp ? frontArm : "") +
    ruff + head +
    (p.bar && p.bar !== "pullup" ? barSvg : "") +
    (p.armUp ? "" : frontArm) +
    (p.bar === "pullup" ? `<rect x="-120" y="-492" width="300" height="16" rx="8" fill="#B8C2D0"/>` : "");

  const shadow = o.shadow === false ? "" : `<ellipse cx="${fx(p.px * 0.5 + 4)}" cy="${WOLF_FOOT_Y}" rx="${fx(120 - p.py * 0.1)}" ry="16" fill="#000" opacity="0.22"/>`;
  return G(tr(o.x, o.y, o.rot || 0, s * flip, s), shadow + body, o.extra || "");
}

function wolfHead(p, C, t) {
  const earR = -p.ear * 52 + Math.sin(t * TAU * 0.5) * 1.5;
  const jaw = p.open * 22;
  const sm = p.smile;
  const cx = 60, cy = -34 - 9 * sm;
  const teeth = fx(clamp(p.open * 4));
  const mouthLine = `<path d="M 118 -40 Q 92 -36 68 -34 Q 63 -34 ${fx(cx)} ${fx(cy)}" stroke="${C.line}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  return `
    ${G(tr(-20, -116, earR), `<path d="M -24 6 Q -28 -52 -12 -80 Q 10 -50 22 -8 Z" fill="${C.furDD}"/>`)}
    <path d="M 44 -32 L 124 -44 L 124 -24 L 44 -14 Z" fill="${C.mouth}"/>
    ${G(`rotate(${fx(jaw)} 48 -28)`, `
      <ellipse cx="88" cy="-27" rx="26" ry="8" fill="${C.tongue}" opacity="${fx(clamp(p.open * 3))}"/>
      <path d="M 42 -32 L 116 -38 C 124 -37 127 -30 121 -23 C 105 -11 80 -5 54 -7 C 38 -7 28 -13 26 -19 Z" fill="${C.lightD}"/>
      <path d="M 102 -36 L 108 -36 L 105 -44 Z" fill="#fff" opacity="${teeth}"/>`)}
    <path d="M -52 -30 C -66 -66 -52 -122 -6 -136 C 30 -146 62 -128 70 -102 C 74 -96 80 -92 90 -90 C 106 -88 120 -82 134 -74 C 148 -66 151 -52 143 -44 C 137 -40 128 -40 120 -40 L 68 -34 L 38 -22 C 8 -12 -22 -6 -38 -10 C -46 -14 -50 -22 -52 -30 Z" fill="${C.fur}"/>
    <path d="M -42 -112 C -22 -138 30 -148 60 -124 C 42 -116 10 -114 -12 -108 C -24 -104 -36 -104 -42 -112 Z" fill="${C.furD}" opacity="0.5"/>
    <path d="M 60 -50 C 84 -64 116 -66 141 -54 L 140 -46 C 133 -41 124 -40 120 -40 L 68 -34 Z" fill="${C.light}"/>
    <path d="M 112 -40 L 118 -40 L 115 -31 Z" fill="#fff" opacity="${teeth}"/>
    <path d="M 88 -38 L 94 -38 L 91 -30 Z" fill="#fff" opacity="${teeth}"/>
    <path d="M 64 -46 C 56 -30 50 -18 42 -10 L 36 2 L 26 -6 L 16 8 L 6 -4 L -6 10 L -14 -6 L -28 4 L -30 -12 C -38 -22 -36 -40 -24 -50 C -4 -60 26 -58 46 -54 C 54 -52 60 -50 64 -46 Z" fill="${C.light}"/>
    ${p.open < 0.15 ? mouthLine : ""}
    <path d="M 130 -80 C 142 -82 152 -72 150 -60 C 148 -50 138 -48 132 -53 C 126 -59 124 -74 130 -80 Z" fill="${C.nose}"/>
    <ellipse cx="139" cy="-73" rx="4.5" ry="2.6" fill="#fff" opacity="0.35"/>
    ${G(tr(2, -122, earR), `<path d="M -24 6 Q -24 -54 -8 -86 Q 14 -52 24 -4 Z" fill="${C.fur}"/><path d="M -15 0 Q -14 -44 -6 -66 Q 6 -42 13 -4 Z" fill="${C.ear}"/>`)}`;
}

function paw(fill, back) {
  return `<ellipse cx="0" cy="16" rx="19" ry="22" fill="${fill}"/>
    <ellipse cx="13" cy="6" rx="8" ry="12" transform="rotate(-25 13 6)" fill="${fill}"/>
    <path d="M -10 30 Q -4 34 2 31 M 4 31 Q 9 33 13 28" stroke="${back ? "#4A586C" : "#66778F"}" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7"/>`;
}

function footShape(fill) {
  return `<path d="M -16 -6 C -22 10 -18 24 -4 26 L 54 26 C 68 26 72 14 64 4 C 56 -4 40 -8 24 -10 C 8 -14 -10 -14 -16 -6 Z" fill="${fill}"/>
    <path d="M 46 26 Q 48 18 46 12 M 58 24 Q 60 16 57 10" stroke="#5A697E" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.6"/>`;
}

function tailShape(C) {
  return `<path d="M 6 -6 C -20 4 -46 34 -60 80 C -70 112 -68 146 -54 170 C -42 146 -26 120 -12 88 C 2 56 14 26 18 6 Z" fill="${C.furD}"/>
    <path d="M -60 120 C -66 140 -64 158 -54 170 C -46 154 -38 138 -32 122 C -42 118 -52 118 -60 120 Z" fill="${C.light}"/>`;
}

// Kleine Requisiten, die der Wolf halten kann
function barbell(x, y, s = 1) {
  return G(tr(x, y, 0, s), `
    <rect x="-150" y="-7" width="300" height="14" rx="7" fill="#C7CFDA"/>
    <rect x="-150" y="-36" width="26" height="72" rx="8" fill="#2A2F3A"/><rect x="-176" y="-28" width="22" height="56" rx="7" fill="#3A4150"/>
    <rect x="124" y="-36" width="26" height="72" rx="8" fill="#2A2F3A"/><rect x="154" y="-28" width="22" height="56" rx="7" fill="#3A4150"/>
    <rect x="-152" y="-36" width="6" height="72" rx="3" fill="#FF8A1F"/><rect x="146" y="-36" width="6" height="72" rx="3" fill="#FF8A1F"/>`);
}
function dumbbell(s = 1) {
  return G(tr(0, 0, 0, s), `<rect x="-36" y="-5" width="72" height="10" rx="5" fill="#C7CFDA"/>
    <rect x="-46" y="-20" width="16" height="40" rx="6" fill="#2A2F3A"/><rect x="30" y="-20" width="16" height="40" rx="6" fill="#2A2F3A"/>`);
}
function phoneSmall(glow) {
  return `<rect x="-20" y="-36" width="40" height="72" rx="8" fill="#10141C"/>
    <rect x="-16" y="-31" width="32" height="62" rx="5" fill="${glow > 0 ? "#BFE6FF" : "#2A3446"}" opacity="${fx(0.5 + glow * 0.5)}"/>`;
}
function cupSmall() {
  return `<path d="M -18 -22 L 18 -22 L 14 22 L -14 22 Z" fill="#F4F1EA"/><rect x="-20" y="-28" width="40" height="8" rx="3" fill="#6B4A36"/>
    <path d="M 18 -12 C 30 -12 30 10 16 10" stroke="#F4F1EA" stroke-width="6" fill="none"/>`;
}
function flameIcon(c1 = "#FF8A1F", c2 = "#FFC24A") {
  return `<path d="M 0 40 C -26 40 -36 18 -30 0 C -26 -12 -16 -18 -14 -34 C -2 -26 4 -14 2 -4 C 8 -10 10 -18 8 -26 C 26 -12 34 8 28 22 C 24 34 14 40 0 40 Z" fill="${c1}"/>
    <path d="M 0 40 C -12 40 -16 30 -12 20 C -9 12 -3 8 -2 0 C 6 6 10 14 8 22 C 12 20 14 16 14 12 C 20 22 18 40 0 40 Z" fill="${c2}"/>`;
}

// Cartoon-Emotionssymbole (keine Augen nötig)
function emote(kind, x, y, t, s = 1) {
  let g = "";
  if (kind === "sweat") {
    const d = (t * 1.2) % 1;
    g = `<path d="M 0 ${fx(-20 + d * 30)} C 10 ${fx(-6 + d * 30)} 10 ${fx(6 + d * 30)} 0 ${fx(8 + d * 30)} C -10 ${fx(6 + d * 30)} -10 ${fx(-6 + d * 30)} 0 ${fx(-20 + d * 30)} Z" fill="#7FD3FF" opacity="${fx(1 - d)}"/>`;
  } else if (kind === "question") {
    g = T(0, 0, "?", { size: 110, font: "anton", fill: "#FFD25A", stroke: "#0E1422", sw: 10 });
  } else if (kind === "excl") {
    g = T(0, 0, "!", { size: 110, font: "anton", fill: "#FF4D5E", stroke: "#0E1422", sw: 10 });
  } else if (kind === "zzz") {
    for (let i = 0; i < 3; i++) {
      const k = ((t * 0.5 + i / 3) % 1);
      g += op(Math.sin(k * Math.PI), T(k * 60, -k * 120, "Z", { size: 50 + k * 40, font: "anton", fill: "#BFD4FF" }));
    }
  } else if (kind === "sparkle") {
    for (let i = 0; i < 4; i++) {
      const a = i * 1.7 + 0.6, r = 70 + 20 * Math.sin(i * 3.1);
      const k = 0.5 + 0.5 * Math.sin(t * 5 + i * 1.9);
      g += G(tr(Math.cos(a) * r, Math.sin(a) * r, 0, 0.5 + 0.6 * k), `<path d="M 0 -20 Q 3 -3 20 0 Q 3 3 0 20 Q -3 3 -20 0 Q -3 -3 0 -20 Z" fill="#FFE27A"/>`);
    }
  } else if (kind === "steam") {
    for (let i = 0; i < 2; i++) {
      const k = (t * 0.9 + i * 0.5) % 1;
      g += op(1 - k, `<circle cx="${fx(i * 40 - 20 + k * 10)}" cy="${fx(-k * 80)}" r="${fx(14 + k * 18)}" fill="#E6ECF5"/>`);
    }
  } else if (kind === "anger") {
    g = `<path d="M -18 -6 L -6 -6 L -6 -18 M 6 -18 L 6 -6 L 18 -6 M 18 6 L 6 6 L 6 18 M -6 18 L -6 6 L -18 6" stroke="#FF4D5E" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  }
  return G(tr(x, y, 0, s), g);
}
