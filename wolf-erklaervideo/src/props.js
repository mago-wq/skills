// Requisiten, Icons und Hintergründe – alles flach-vektoriell und bewusst ohne Augen/Gesichter.
const COL = {
  orange: "#FF8A1F", orange2: "#FFB347", yellow: "#FFD25A", red: "#FF4D5E", green: "#3DDC97", blue: "#5EC8FF",
  pink: "#FF6FB1", purple: "#9B7BFF", white: "#F5F7FB", ink: "#0E1422", muted: "#8E9BB3", navy: "#141C33",
};

window.DEFS = `
  <linearGradient id="gNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0A1022"/><stop offset="1" stop-color="#1D2747"/></linearGradient>
  <linearGradient id="gDawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A4D8F"/><stop offset="0.55" stop-color="#E58A6E"/><stop offset="1" stop-color="#FFC27A"/></linearGradient>
  <linearGradient id="gSunrise" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6FA8FF"/><stop offset="0.5" stop-color="#FFB48A"/><stop offset="1" stop-color="#FFE0A3"/></linearGradient>
  <linearGradient id="gInfo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0F1730"/><stop offset="1" stop-color="#1A2445"/></linearGradient>
  <linearGradient id="gGym" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14161D"/><stop offset="1" stop-color="#252935"/></linearGradient>
  <linearGradient id="gWallDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5D6FA3"/><stop offset="1" stop-color="#7F90C2"/></linearGradient>
  <linearGradient id="gWallNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#18213D"/><stop offset="1" stop-color="#25304F"/></linearGradient>
  <linearGradient id="gBathroom" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2C3A5C"/><stop offset="1" stop-color="#3B4C72"/></linearGradient>
  <linearGradient id="gGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A9C7E8"/><stop offset="1" stop-color="#6E8DB8"/></linearGradient>
  <linearGradient id="gBlanket" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4F73C4"/><stop offset="1" stop-color="#3A57A0"/></linearGradient>
  <linearGradient id="gFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B2238"/><stop offset="1" stop-color="#121729"/></linearGradient>
  <radialGradient id="gSpot" cx="0.5" cy="0" r="0.9"><stop offset="0" stop-color="#FFF4D6" stop-opacity="0.35"/><stop offset="1" stop-color="#FFF4D6" stop-opacity="0"/></radialGradient>
  <radialGradient id="gGlowO" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FF8A1F" stop-opacity="0.55"/><stop offset="1" stop-color="#FF8A1F" stop-opacity="0"/></radialGradient>
  <radialGradient id="gGlowG" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#3DDC97" stop-opacity="0.5"/><stop offset="1" stop-color="#3DDC97" stop-opacity="0"/></radialGradient>
  <radialGradient id="gGlowR" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FF4D5E" stop-opacity="0.55"/><stop offset="1" stop-color="#FF4D5E" stop-opacity="0"/></radialGradient>
  <radialGradient id="gGlowW" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.6"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>
  <radialGradient id="gSun" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FFF6C9"/><stop offset="0.6" stop-color="#FFD25A"/><stop offset="1" stop-color="#FFB347"/></radialGradient>
  <radialGradient id="gVignette" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.45"/></radialGradient>
  <linearGradient id="gShadeL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#05070D" stop-opacity="0.82"/><stop offset="0.55" stop-color="#05070D" stop-opacity="0"/></linearGradient>
  <linearGradient id="gShadeR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#05070D" stop-opacity="0.82"/><stop offset="0.55" stop-color="#05070D" stop-opacity="0"/></linearGradient>
  <linearGradient id="gShadeB" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#05070D" stop-opacity="0.85"/><stop offset="0.45" stop-color="#05070D" stop-opacity="0"/></linearGradient>
  <linearGradient id="gShadeT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05070D" stop-opacity="0.8"/><stop offset="0.4" stop-color="#05070D" stop-opacity="0"/></linearGradient>
  <pattern id="pDots" width="48" height="48" patternUnits="userSpaceOnUse"><circle cx="24" cy="24" r="2" fill="#FFFFFF" opacity="0.06"/></pattern>
  <pattern id="pTiles" width="90" height="90" patternUnits="userSpaceOnUse"><rect width="90" height="90" fill="none" stroke="#FFFFFF" stroke-opacity="0.06" stroke-width="3"/></pattern>
  <clipPath id="cMirror"><rect x="-210" y="-330" width="420" height="660" rx="200"/></clipPath>
  <clipPath id="cPhoneScreen"><rect x="-205" y="-405" width="410" height="810" rx="44"/></clipPath>
  <clipPath id="cWin"><rect x="-170" y="-210" width="340" height="420" rx="14"/></clipPath>
`;

// ---------- Hintergründe ----------
const bgFill = (id) => `<rect width="${W}" height="${H}" fill="url(#${id})"/>`;
const vignette = () => `<rect width="${W}" height="${H}" fill="url(#gVignette)"/>`;
const dots = () => `<rect width="${W}" height="${H}" fill="url(#pDots)"/>`;
function infoBg(t, tint) {
  return bgFill("gInfo") + dots() + (tint ? `<rect width="${W}" height="${H}" fill="${tint}" opacity="0.10"/>` : "") +
    `<circle cx="${fx(1500 + Math.sin(t * 0.3) * 40)}" cy="200" r="420" fill="#2B3B73" opacity="0.25"/>` +
    `<circle cx="${fx(300 + Math.cos(t * 0.25) * 40)}" cy="900" r="360" fill="#3A2B73" opacity="0.2"/>`;
}
function stars(t, n = 60, seed = 1, yMax = 700) {
  let g = "";
  for (let i = 0; i < n; i++) {
    const x = hash(i * 7 + seed) * W, y = hash(i * 13 + seed * 3) * yMax;
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * (0.8 + hash(i) * 1.5) + i));
    g += `<circle cx="${fx(x)}" cy="${fx(y)}" r="${fx(1.2 + hash(i * 3) * 2.2)}" fill="#fff" opacity="${fx(tw * 0.8)}"/>`;
  }
  return g;
}
function moon(x, y, r = 60, c = "#F4EBD0") {
  return `<g transform="${tr(x, y)}"><circle r="${r}" fill="${c}"/><circle cx="${r * 0.42}" cy="${-r * 0.22}" r="${r * 0.9}" fill="#0A1022" opacity="0"/>
    <circle cx="${-r * 0.3}" cy="${-r * 0.2}" r="${r * 0.16}" fill="#E2D6B4"/><circle cx="${r * 0.25}" cy="${r * 0.3}" r="${r * 0.11}" fill="#E2D6B4"/><circle cx="${r * 0.35}" cy="${-r * 0.35}" r="${r * 0.07}" fill="#E2D6B4"/></g>`;
}
function crescent(x, y, r = 50, c = "#FFE7A3", bg = "#1A2447") {
  return `<g transform="${tr(x, y)}"><circle r="${r}" fill="${c}"/><circle cx="${r * 0.45}" cy="${-r * 0.3}" r="${r * 0.85}" fill="${bg}"/></g>`;
}
function sun(x, y, r, t) {
  let rays = "";
  for (let i = 0; i < 12; i++) {
    const a = i * 30 + t * 10;
    rays += `<rect x="${-r * 0.08}" y="${-r * 1.75}" width="${r * 0.16}" height="${r * 0.42}" rx="${r * 0.08}" fill="#FFD25A" transform="rotate(${fx(a)})" opacity="0.85"/>`;
  }
  return `<g transform="${tr(x, y)}"><circle r="${r * 2.4}" fill="url(#gGlowW)" opacity="0.6"/>${rays}<circle r="${r}" fill="url(#gSun)"/></g>`;
}
function hills(y, c1, c2) {
  return `<path d="M 0 ${y} C 300 ${y - 120} 600 ${y - 60} 900 ${y - 20} C 1200 ${y + 20} 1500 ${y - 150} 1920 ${y - 80} L 1920 1080 L 0 1080 Z" fill="${c1}"/>
    <path d="M 0 ${y + 90} C 400 ${y + 20} 800 ${y + 60} 1100 ${y + 80} C 1400 ${y + 100} 1700 ${y + 30} 1920 ${y + 60} L 1920 1080 L 0 1080 Z" fill="${c2}"/>`;
}
function pine(x, y, s, c) {
  return `<g transform="${tr(x, y, 0, s)}"><rect x="-8" y="-20" width="16" height="40" fill="${c}"/>
    <path d="M 0 -260 L 60 -150 L 30 -150 L 80 -70 L 45 -70 L 100 0 L -100 0 L -45 -70 L -80 -70 L -30 -150 L -60 -150 Z" fill="${c}"/></g>`;
}

// ---------- Zimmer ----------
function room(o = {}) {
  const night = o.night, wall = night ? "url(#gWallNight)" : "url(#gWallDay)";
  return `<rect width="${W}" height="${H}" fill="${wall}"/>
    <rect width="${W}" height="${H}" fill="url(#pTiles)" opacity="${night ? 0.25 : 0.35}"/>
    <rect y="${o.floorY || 820}" width="${W}" height="${H}" fill="${night ? "#121829" : "#3A3F5E"}"/>
    <rect y="${(o.floorY || 820) - 14}" width="${W}" height="14" fill="${night ? "#0D1220" : "#2C3150"}"/>`;
}
function windowFrame(x, y, sky, t, o = {}) {
  // sky: "night" | "dawn" | "day"; o.curtain 0..1 (geschlossen)
  const skyFill = sky === "night" ? "url(#gNight)" : sky === "dawn" ? "url(#gDawn)" : "url(#gSunrise)";
  const cur = o.curtain || 0;
  let inner = `<rect x="-170" y="-210" width="340" height="420" fill="${skyFill}"/>`;
  if (sky === "night") inner += `<g transform="translate(-960 -540)">${stars(t, 30, 5, 1080)}</g>` + crescent(70, -110, 42, "#FFE7A3", "#101833");
  if (sky === "dawn") inner += `<circle cx="40" cy="${fx(160 - (o.sunUp || 0) * 120)}" r="56" fill="#FFE29A"/>` + `<path d="M -170 170 C -80 120 20 150 170 110 L 170 210 L -170 210 Z" fill="#2B2F55"/>`;
  if (sky === "day") inner += sun(60, -100, 40, t) + `<path d="M -170 160 C -80 110 20 140 170 100 L 170 210 L -170 210 Z" fill="#3E7A5A"/>`;
  return `<g transform="${tr(x, y)}">
    <rect x="-186" y="-226" width="372" height="452" rx="20" fill="#E9E2D3"/>
    <g clip-path="url(#cWin)">${inner}</g>
    <rect x="-6" y="-210" width="12" height="420" fill="#E9E2D3"/><rect x="-170" y="-6" width="340" height="12" fill="#E9E2D3"/>
    <rect x="${fx(-200)}" y="-236" width="${fx(40 + cur * 170)}" height="480" rx="10" fill="#7C4B9B"/>
    <rect x="${fx(160 - cur * 170)}" y="-236" width="${fx(40 + cur * 170)}" height="480" rx="10" fill="#7C4B9B"/>
    <rect x="-210" y="-246" width="420" height="16" rx="8" fill="#5A3A70"/></g>`;
}
function bed(x, y, o = {}) {
  // y = Matratzen-Oberkante; Bett zeigt Kopfteil links
  return `<g transform="${tr(x, y)}">
    <rect x="-420" y="-170" width="40" height="330" rx="14" fill="#6B4A36"/>
    <rect x="380" y="-60" width="34" height="220" rx="12" fill="#6B4A36"/>
    <rect x="-400" y="40" width="800" height="70" rx="16" fill="#7A5640"/>
    <rect x="-390" y="-6" width="780" height="60" rx="22" fill="#EEF2F8"/>
    <ellipse cx="-300" cy="-20" rx="90" ry="40" fill="#FFFFFF"/>
    <rect x="-400" y="150" width="30" height="40" fill="#5A3E2E"/><rect x="370" y="150" width="30" height="40" fill="#5A3E2E"/></g>`;
}
function blanket(x, y, x0, x1, o = {}) {
  // Decke von x0 bis x1 (relativ zu x), Oberkante wölbt sich über Körper
  const top = o.top || -60;
  return `<g transform="${tr(x, y)}">
    <path d="M ${x0} 30 C ${x0} ${top} ${x0 + 60} ${top - 10} ${x0 + 120} ${top - 6} C ${(x0 + x1) / 2} ${top + 6} ${x1 - 80} ${top} ${x1} ${top + 16} L ${x1 + 20} 50 L ${x0 - 10} 60 Z" fill="url(#gBlanket)"/>
    <path d="M ${x0 + 40} ${top + 14} C ${(x0 + x1) / 2} ${top + 22} ${x1 - 80} ${top + 18} ${x1 - 10} ${top + 30}" stroke="#7FA0E6" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.6"/></g>`;
}
function nightstand(x, y, t, o = {}) {
  const blink = o.blink ? (Math.floor(t * 2) % 2 === 0 ? 1 : 0.25) : 1;
  return `<g transform="${tr(x, y)}">
    <rect x="-90" y="-150" width="180" height="150" rx="12" fill="#6B4A36"/><rect x="-74" y="-110" width="148" height="40" rx="8" fill="#7E5A43"/>
    <circle cx="0" cy="-90" r="6" fill="#C9A27E"/>
    <rect x="-70" y="-214" width="120" height="64" rx="12" fill="#1A1F2B"/>
    <text x="-10" y="-168" text-anchor="middle" style="font-family:'Bebas Neue';font-size:44px;fill:#FF4D5E;opacity:${blink}">${o.time || "06:30"}</text>
    <rect x="58" y="-232" width="14" height="82" fill="#C9C2B5"/><path d="M 30 -232 L 100 -232 L 86 -280 L 44 -280 Z" fill="${o.lamp ? "#FFE29A" : "#D8CFC0"}"/></g>`;
}
function mirror(x, y, inner, o = {}) {
  return `<g transform="${tr(x, y, 0, o.s || 1)}">
    <rect x="-232" y="-352" width="464" height="704" rx="222" fill="#C8A46A"/>
    <rect x="-218" y="-338" width="436" height="676" rx="212" fill="#8E6B3E"/>
    <g clip-path="url(#cMirror)"><rect x="-210" y="-330" width="420" height="660" fill="url(#gGlass)"/>${inner || ""}
      <path d="M -150 -330 L -60 -330 L -260 330 L -350 330 Z" fill="#fff" opacity="0.13"/>
      <path d="M 40 -330 L 80 -330 L -120 330 L -160 330 Z" fill="#fff" opacity="0.1"/></g></g>`;
}

// ---------- Icons ----------
function battery(x, y, level, s = 1, o = {}) {
  const c = level < 0.25 ? COL.red : level < 0.6 ? COL.yellow : COL.green;
  const w = 200, h = 96;
  const bars = Math.max(0.04, level) * (w - 24);
  return `<g transform="${tr(x, y, 0, s)}">
    <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="18" fill="#0E1422" stroke="#F5F7FB" stroke-width="9"/>
    <rect x="${w / 2 + 4}" y="-20" width="18" height="40" rx="6" fill="#F5F7FB"/>
    <rect x="${-w / 2 + 12}" y="${-h / 2 + 12}" width="${fx(bars)}" height="${h - 24}" rx="8" fill="${c}"/>
    ${o.bolt ? `<path d="M 10 -36 L -22 6 L 0 6 L -10 36 L 24 -8 L 2 -8 Z" fill="#FFFFFF"/>` : ""}
    ${o.label ? `<text x="0" y="${h / 2 + 64}" text-anchor="middle" style="font-family:Anton;font-size:56px;fill:${c}">${o.label}</text>` : ""}</g>`;
}
function flame(x, y, s, t, o = {}) {
  const f = 1 + Math.sin(t * 13) * 0.04 + Math.sin(t * 7.3) * 0.03;
  const lean = Math.sin(t * 5) * 3;
  return `<g transform="${tr(x, y, lean, s, s * f)}"><ellipse cx="0" cy="10" rx="70" ry="80" fill="url(#gGlowO)"/>${flameIcon(o.c1 || "#FF6A1A", o.c2 || "#FFC24A")}</g>`;
}
function smoke(x, y, t, s = 1) {
  let g = "";
  for (let i = 0; i < 4; i++) {
    const k = (t * 0.6 + i * 0.25) % 1;
    g += op((1 - k) * 0.7, `<circle cx="${fx(Math.sin(k * 6 + i) * 18)}" cy="${fx(-k * 120)}" r="${fx(10 + k * 26)}" fill="#9AA5B8"/>`);
  }
  return G(tr(x, y, 0, s), g);
}
function gaugeSemi(x, y, r, v, o = {}) {
  // v: 0..1 (links->rechts); Zonen grün/gelb/rot
  const arc = (a0, a1, c) => {
    const p0 = [Math.cos(Math.PI + a0 * Math.PI) * r, Math.sin(Math.PI + a0 * Math.PI) * r];
    const p1 = [Math.cos(Math.PI + a1 * Math.PI) * r, Math.sin(Math.PI + a1 * Math.PI) * r];
    return `<path d="M ${fx(p0[0])} ${fx(p0[1])} A ${r} ${r} 0 0 1 ${fx(p1[0])} ${fx(p1[1])}" stroke="${c}" stroke-width="${r * 0.22}" fill="none"/>`;
  };
  const zones = o.zones || [[0, 0.45, COL.green], [0.45, 0.7, COL.yellow], [0.7, 1, COL.red]];
  const a = Math.PI + v * Math.PI;
  return `<g transform="${tr(x, y, 0, o.s || 1)}">
    ${zones.map((z) => arc(z[0], z[1], z[2])).join("")}
    <line x1="0" y1="0" x2="${fx(Math.cos(a) * r * 0.86)}" y2="${fx(Math.sin(a) * r * 0.86)}" stroke="#F5F7FB" stroke-width="${r * 0.07}" stroke-linecap="round"/>
    <circle r="${r * 0.11}" fill="#F5F7FB"/>
    ${o.label ? `<text x="0" y="${r * 0.42}" text-anchor="middle" style="font-family:Anton;font-size:${r * 0.26}px;fill:#F5F7FB;letter-spacing:2px">${o.label}</text>` : ""}</g>`;
}
function checkIcon(x, y, s = 1, c = COL.green) {
  return `<g transform="${tr(x, y, 0, s)}"><circle r="34" fill="${c}"/><path d="M -15 1 L -4 13 L 17 -12" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}
function crossIcon(x, y, s = 1, c = COL.red) {
  return `<g transform="${tr(x, y, 0, s)}"><circle r="34" fill="${c}"/><path d="M -13 -13 L 13 13 M 13 -13 L -13 13" stroke="#fff" stroke-width="9" stroke-linecap="round"/></g>`;
}
function bigCross(x, y, s, prog) {
  const k1 = clamp(prog * 2), k2 = clamp(prog * 2 - 1);
  return `<g transform="${tr(x, y, 0, s)}">
    <line x1="-120" y1="-120" x2="${fx(-120 + 240 * k1)}" y2="${fx(-120 + 240 * k1)}" stroke="${COL.red}" stroke-width="44" stroke-linecap="round"/>
    ${k2 > 0 ? `<line x1="120" y1="-120" x2="${fx(120 - 240 * k2)}" y2="${fx(-120 + 240 * k2)}" stroke="${COL.red}" stroke-width="44" stroke-linecap="round"/>` : ""}</g>`;
}
function stamp(x, y, text, t, at, o = {}) {
  if (t < at) return "";
  const k = clamp((t - at) / 0.28);
  const s = lerp(2.2, 1, E.outCubic(k));
  const c = o.color || COL.red;
  const w = o.w || text.length * (o.size || 70) * 0.5 + 60;
  return op(k, `<g transform="${tr(x, y, o.rot != null ? o.rot : -8, s)}">
    <rect x="${-w / 2}" y="${-(o.size || 70) * 0.8}" width="${w}" height="${(o.size || 70) * 1.35}" rx="14" fill="none" stroke="${c}" stroke-width="10"/>
    <text x="0" y="${(o.size || 70) * 0.33}" text-anchor="middle" style="font-family:Anton;font-size:${o.size || 70}px;fill:${c};letter-spacing:3px">${esc(text)}</text></g>`);
}
function phoneBig(x, y, s, screen, o = {}) {
  return `<g transform="${tr(x, y, o.rot || 0, s)}">
    <rect x="-226" y="-430" width="452" height="860" rx="64" fill="#0C1018"/>
    <rect x="-220" y="-424" width="440" height="848" rx="60" fill="none" stroke="#3A4256" stroke-width="4"/>
    <g clip-path="url(#cPhoneScreen)"><rect x="-205" y="-405" width="410" height="810" fill="${o.screenBg || "#101626"}"/>${screen || ""}</g>
    <rect x="-56" y="-404" width="112" height="26" rx="13" fill="#0C1018"/></g>`;
}
function gummyBear(x, y, s, c) {
  return `<g transform="${tr(x, y, 0, s)}"><circle cx="0" cy="-34" r="22" fill="${c}"/><circle cx="-16" cy="-52" r="9" fill="${c}"/><circle cx="16" cy="-52" r="9" fill="${c}"/>
    <ellipse cx="0" cy="6" rx="26" ry="32" fill="${c}"/><ellipse cx="-24" cy="-6" rx="9" ry="13" fill="${c}"/><ellipse cx="24" cy="-6" rx="9" ry="13" fill="${c}"/>
    <ellipse cx="-14" cy="34" rx="11" ry="10" fill="${c}"/><ellipse cx="14" cy="34" rx="11" ry="10" fill="${c}"/>
    <ellipse cx="-8" cy="-12" rx="6" ry="14" fill="#fff" opacity="0.35"/></g>`;
}
function gummyJar(x, y, s) {
  return `<g transform="${tr(x, y, 0, s)}"><rect x="-90" y="-150" width="180" height="40" rx="12" fill="#FF4D5E"/>
    <rect x="-100" y="-114" width="200" height="230" rx="40" fill="#D9E8FF" opacity="0.85" stroke="#9FB3D1" stroke-width="6"/>
    ${gummyBear(-40, 10, 0.9, "#FF6FB1")}${gummyBear(30, 40, 0.9, "#FFD25A")}${gummyBear(40, -40, 0.85, "#3DDC97")}${gummyBear(-30, 70, 0.8, "#5EC8FF")}
    <rect x="-80" y="-60" width="160" height="70" rx="10" fill="#FF8A1F"/>
    <text x="0" y="-12" text-anchor="middle" style="font-family:Anton;font-size:40px;fill:#fff">TESTO</text></g>`;
}
function powderTub(x, y, s) {
  return `<g transform="${tr(x, y, 0, s)}"><rect x="-100" y="-150" width="200" height="40" rx="12" fill="#2A3146"/>
    <rect x="-110" y="-118" width="220" height="250" rx="26" fill="#3B4562"/>
    <rect x="-110" y="-60" width="220" height="110" fill="#FFD25A"/>
    <text x="0" y="8" text-anchor="middle" style="font-family:Anton;font-size:56px;fill:#1A1F2B">MEGA</text>
    <text x="0" y="40" text-anchor="middle" style="font-family:'Barlow Condensed';font-weight:800;font-size:28px;fill:#1A1F2B">TESTO-PULVER</text></g>`;
}
function burger(x, y, s) {
  return `<g transform="${tr(x, y, 0, s)}"><path d="M -80 -10 C -80 -70 80 -70 80 -10 Z" fill="#E8A04E"/>
    ${[[-40, -40, -30], [-12, -52, 20], [14, -44, -10], [40, -34, 30], [-30, -26, 10], [6, -28, -25]].map(([sx, sy, r]) => `<ellipse cx="${sx}" cy="${sy}" rx="7" ry="3" fill="#FFF3D6" transform="rotate(${r} ${sx} ${sy})"/>`).join("")}
    <rect x="-86" y="-12" width="172" height="16" rx="8" fill="#5FBF4A"/><rect x="-82" y="2" width="164" height="26" rx="10" fill="#6B3A26"/>
    <path d="M -84 26 L 84 26 L 70 40 L -70 40 Z" fill="#FFD25A"/><path d="M -80 40 L 80 40 C 80 64 -80 64 -80 40 Z" fill="#E8A04E"/></g>`;
}
function couch(x, y, s) {
  return `<g transform="${tr(x, y, 0, s)}"><rect x="-110" y="-60" width="220" height="80" rx="20" fill="#7C6BC4"/>
    <rect x="-130" y="-20" width="260" height="60" rx="18" fill="#9182D6"/><rect x="-140" y="-40" width="40" height="90" rx="16" fill="#6D5DB4"/>
    <rect x="100" y="-40" width="40" height="90" rx="16" fill="#6D5DB4"/><rect x="-120" y="50" width="16" height="22" fill="#3B3360"/><rect x="104" y="50" width="16" height="22" fill="#3B3360"/></g>`;
}
function energyCan(x, y, s) {
  return `<g transform="${tr(x, y, 0, s)}"><rect x="-44" y="-90" width="88" height="180" rx="16" fill="#25C2A0"/>
    <rect x="-44" y="-90" width="88" height="22" rx="10" fill="#BFC8D6"/><rect x="-44" y="68" width="88" height="22" rx="10" fill="#BFC8D6"/>
    <path d="M 8 -50 L -18 6 L 2 6 L -10 50 L 22 -10 L 2 -10 Z" fill="#FFF35A"/></g>`;
}
function phoneNight(x, y, s, label = "02:00") {
  return `<g transform="${tr(x, y, 0, s)}"><rect x="-60" y="-110" width="120" height="220" rx="20" fill="#0C1018"/>
    <rect x="-52" y="-98" width="104" height="196" rx="14" fill="#9FD4FF"/>
    <text x="0" y="-30" text-anchor="middle" style="font-family:'Bebas Neue';font-size:54px;fill:#0E1422">${label}</text>
    <rect x="-36" y="-6" width="72" height="12" rx="6" fill="#0E1422" opacity="0.35"/><rect x="-36" y="16" width="56" height="12" rx="6" fill="#0E1422" opacity="0.35"/>
    <rect x="-36" y="38" width="64" height="12" rx="6" fill="#0E1422" opacity="0.35"/></g>`;
}
function cart(x, y, s) {
  return `<g transform="${tr(x, y, 0, s)}"><path d="M -130 -90 L -96 -90 L -60 40 L 90 40 L 116 -50 L -84 -50" stroke="#F5F7FB" stroke-width="16" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="-40" cy="80" r="18" fill="#F5F7FB"/><circle cx="70" cy="80" r="18" fill="#F5F7FB"/></g>`;
}
function brick(x, y, w, h, c = "#E2734A") {
  return `<rect x="${fx(x - w / 2)}" y="${fx(y - h / 2)}" width="${w}" height="${h}" rx="8" fill="${c}"/><rect x="${fx(x - w / 2 + 8)}" y="${fx(y - h / 2 + 6)}" width="${w - 16}" height="8" rx="4" fill="#fff" opacity="0.18"/>`;
}
function clockFace(x, y, r, hh, mm, o = {}) {
  const ha = ((hh % 12) + mm / 60) * 30, ma = mm * 6;
  let ticks = "";
  for (let i = 0; i < 12; i++) ticks += `<rect x="-3" y="${-r * 0.92}" width="6" height="${r * 0.14}" rx="3" fill="#0E1422" transform="rotate(${i * 30})"/>`;
  return `<g transform="${tr(x, y, 0, o.s || 1)}"><circle r="${r}" fill="${o.face || "#F5F7FB"}" stroke="${o.ring || COL.orange}" stroke-width="${r * 0.1}"/>${ticks}
    <rect x="${-r * 0.045}" y="${-r * 0.5}" width="${r * 0.09}" height="${r * 0.55}" rx="${r * 0.045}" fill="#0E1422" transform="rotate(${fx(ha)})"/>
    <rect x="${-r * 0.03}" y="${-r * 0.78}" width="${r * 0.06}" height="${r * 0.83}" rx="${r * 0.03}" fill="#0E1422" transform="rotate(${fx(ma)})"/>
    <circle r="${r * 0.07}" fill="${COL.orange}"/></g>`;
}
function coffeeCup(x, y, s, t, o = {}) {
  return `<g transform="${tr(x, y, 0, s)}">${o.steam === false ? "" : emote("steam", 0, -90, t, 0.9)}
    <path d="M -70 -60 L 70 -60 L 56 70 C 54 84 44 90 30 90 L -30 90 C -44 90 -54 84 -56 70 Z" fill="#F5F1E8"/>
    <rect x="-76" y="-72" width="152" height="18" rx="9" fill="#6B4A36"/>
    <path d="M 66 -30 C 120 -30 120 50 58 46" stroke="#F5F1E8" stroke-width="18" fill="none"/>
    <rect x="-40" y="-14" width="80" height="44" rx="10" fill="#6B4A36" opacity="0.85"/>
    <text x="0" y="17" text-anchor="middle" style="font-family:'Bebas Neue';font-size:34px;fill:#F5F1E8">KAFFEE</text></g>`;
}
function brain(x, y, s, o = {}) {
  const c = o.c || "#FF8FB8", d = o.d || "#D9628F";
  return `<g transform="${tr(x, y, 0, s)}">
    <path d="M -120 20 C -150 -30 -120 -100 -60 -110 C -40 -150 30 -150 50 -115 C 110 -120 150 -70 135 -20 C 160 20 130 70 90 70 C 70 100 20 105 0 85 C -30 110 -90 100 -100 60 C -130 60 -140 40 -120 20 Z" fill="${c}"/>
    <path d="M -80 -60 C -60 -80 -30 -70 -20 -50 M -10 -100 C 0 -70 30 -70 40 -90 M 60 -60 C 80 -40 110 -50 115 -30 M -100 10 C -80 -10 -50 0 -40 20 M -20 0 C 0 -20 30 -20 40 0 C 50 20 80 20 95 10 M -60 50 C -40 40 -20 50 -10 65 M 30 40 C 40 60 60 60 75 50" stroke="${d}" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M 40 70 C 50 100 46 130 30 150 L 0 150 C 14 130 18 100 10 82 Z" fill="${d}"/></g>`;
}
function muscleArm(x, y, s, o = {}) {
  // angespannter Bizeps (Oberarm waagrecht, Unterarm senkrecht, Faust oben) – Figur ohne Gesicht
  const c = o.c || WC.fur, d = o.d || WC.furD;
  return `<g transform="${tr(x, y, 0, s)}">
    <rect x="-210" y="40" width="230" height="100" rx="50" fill="${c}"/>
    <ellipse cx="-80" cy="40" rx="96" ry="72" fill="${c}"/>
    <path d="M -150 30 C -120 -10 -40 -14 -10 26" stroke="${d}" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.7"/>
    <rect x="-30" y="-120" width="96" height="230" rx="48" fill="${c}" transform="rotate(8 18 0)"/>
    <ellipse cx="34" cy="-150" rx="66" ry="60" fill="${c}"/>
    <path d="M 0 -184 Q 12 -196 26 -186 M 30 -190 Q 44 -200 58 -188" stroke="${d}" stroke-width="7" fill="none" stroke-linecap="round"/>
    <rect x="-30" y="-96" width="104" height="40" rx="12" fill="${COL.orange}" transform="rotate(8 22 -76)"/></g>`;
}
function speechBubble(x, y, w, h, tail, lines, o = {}) {
  // tail: "left" | "right" | "down-left" ...
  const fill = o.fill || "#F5F7FB", ink = o.ink || "#0E1422";
  let tp = "";
  if (tail === "left") tp = `<path d="M ${-w / 2 + 10} ${h / 2 - 50} L ${-w / 2 - 50} ${h / 2 + 10} L ${-w / 2 + 50} ${h / 2 - 10} Z" fill="${fill}"/>`;
  if (tail === "right") tp = `<path d="M ${w / 2 - 10} ${h / 2 - 50} L ${w / 2 + 50} ${h / 2 + 10} L ${w / 2 - 50} ${h / 2 - 10} Z" fill="${fill}"/>`;
  if (tail === "down") tp = `<path d="M -40 ${h / 2 - 10} L 0 ${h / 2 + 60} L 40 ${h / 2 - 10} Z" fill="${fill}"/>`;
  const size = o.size || 52, lh = size * 1.15;
  const y0 = -((lines.length - 1) * lh) / 2 + size * 0.35;
  const txt = lines.map((l, i) => `<text x="0" y="${fx(y0 + i * lh)}" text-anchor="middle" style="font-family:${o.font || "'Barlow Condensed'"};font-weight:800;font-size:${size}px;fill:${ink}">${esc(l)}</text>`).join("");
  return `<g transform="${tr(x, y, 0, o.s || 1)}"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${Math.min(46, h / 2)}" fill="${fill}"/>${tp}${txt}</g>`;
}
function signalWaves(x, y, t, s = 1, c = COL.yellow) {
  let g = "";
  for (let i = 0; i < 3; i++) {
    const k = (t * 1.6 + i / 3) % 1;
    g += op(1 - k, `<path d="M ${fx(-30 - k * 60)} ${fx(-40 - k * 40)} A ${fx(50 + k * 90)} ${fx(50 + k * 90)} 0 0 1 ${fx(-30 - k * 60)} ${fx(40 + k * 40)}" stroke="${c}" stroke-width="8" fill="none" stroke-linecap="round" transform="scale(-1 1)"/>`);
  }
  return G(tr(x, y, 0, s), g);
}

// Steroid-Grundgerüst (3 Sechsringe + 1 Fünfring)
function steroid(x, y, s, c, o = {}) {
  const L = 40, r3 = Math.sqrt(3);
  const hex = (cx, cy) => { let p = []; for (let k = 0; k < 6; k++) { const a = (-90 + k * 60) * DEG; p.push([cx + L * Math.cos(a), cy + L * Math.sin(a)]); } return p; };
  const A = hex(0, 0), B = hex(L * r3, 0), Cc = hex(L * r3 * 1.5, -1.5 * L);
  // Fünfring an Cs rechter Kante (Ecken bei -30° und 30°)
  const p1 = Cc[1], p2 = Cc[2];
  const mx = (p1[0] + p2[0]) / 2 + L * 0.95, my = (p1[1] + p2[1]) / 2;
  const D = [p1, [p1[0] + L * 0.6, p1[1] - L * 0.45], [mx + 8, my], [p2[0] + L * 0.6, p2[1] + L * 0.45], p2];
  const poly = (pts) => `<path d="M ${pts.map((p) => fx(p[0]) + " " + fx(p[1])).join(" L ")} Z" fill="${o.fill || "none"}" stroke="${c}" stroke-width="10" stroke-linejoin="round"/>`;
  let extra = "";
  const lab = (px, py, txt) => `<text x="${fx(px)}" y="${fx(py)}" text-anchor="middle" style="font-family:'Barlow Condensed';font-weight:800;font-size:34px;fill:${c}">${txt}</text>`;
  if (o.aromatic) extra += `<circle cx="0" cy="0" r="${L * 0.55}" fill="none" stroke="${c}" stroke-width="7"/>`;
  // Gruppen: C3 (Ring A links unten) und C17 (Fünfring oben rechts)
  const a3 = A[4];
  if (o.left === "O") extra += `<line x1="${fx(a3[0])}" y1="${fx(a3[1])}" x2="${fx(a3[0] - 34)}" y2="${fx(a3[1] + 20)}" stroke="${c}" stroke-width="8"/>` + lab(a3[0] - 58, a3[1] + 42, "O");
  if (o.left === "OH") extra += `<line x1="${fx(a3[0])}" y1="${fx(a3[1])}" x2="${fx(a3[0] - 34)}" y2="${fx(a3[1] + 20)}" stroke="${c}" stroke-width="8"/>` + lab(a3[0] - 64, a3[1] + 42, "HO");
  const d17 = D[1];
  if (o.right === "OH") extra += `<line x1="${fx(d17[0])}" y1="${fx(d17[1])}" x2="${fx(d17[0] + 24)}" y2="${fx(d17[1] - 34)}" stroke="${c}" stroke-width="8"/>` + lab(d17[0] + 40, d17[1] - 46, "OH");
  if (o.right === "tail") extra += `<path d="M ${fx(d17[0])} ${fx(d17[1])} l 30 -30 l 40 10 l 30 -30 l 40 10 l 30 -30 M ${fx(d17[0] + 140)} ${fx(d17[1] - 50)} l 10 40" stroke="${c}" stroke-width="8" fill="none" stroke-linejoin="round"/>`;
  return `<g transform="${tr(x, y, o.rot || 0, s)}"><g transform="translate(-60 30)">${poly(A)}${poly(B)}${poly(Cc)}${poly(D)}${extra}</g></g>`;
}
function fatCell(x, y, s, t, o = {}) {
  const wob = (k) => 1 + Math.sin(t * 2.2 + k) * 0.03;
  let blobs = "";
  for (let i = 0; i < 6; i++) {
    const a = i * 1.05 + 0.4, r = 55 + (i % 2) * 25;
    blobs += `<circle cx="${fx(Math.cos(a) * r)}" cy="${fx(Math.sin(a) * r)}" r="${fx((26 + (i % 3) * 8) * wob(i))}" fill="#FFE9A8" opacity="0.8"/>`;
  }
  return `<g transform="${tr(x, y, 0, s * wob(9), s / wob(9))}">${o.glow ? `<circle r="230" fill="url(#gGlowO)" opacity="${fx(o.glow)}"/>` : ""}
    <path d="M -150 -10 C -150 -110 -60 -160 20 -150 C 110 -140 160 -70 152 10 C 145 100 70 150 -10 148 C -100 146 -150 80 -150 -10 Z" fill="#F6C343" stroke="#E0A526" stroke-width="10"/>
    ${blobs}</g>`;
}
function enzyme(x, y, s, t, o = {}) {
  const open = o.open != null ? o.open : 0.5 + 0.5 * Math.sin(t * 6);
  const a = 18 + open * 22;
  return `<g transform="${tr(x, y, o.rot || 0, s)}">
    <path d="M 0 0 L ${fx(Math.cos(a * DEG) * 80)} ${fx(-Math.sin(a * DEG) * 80)} A 80 80 0 1 0 ${fx(Math.cos(a * DEG) * 80)} ${fx(Math.sin(a * DEG) * 80)} Z" fill="${COL.purple}"/>
    <path d="M -50 -20 A 55 55 0 0 0 -20 48" stroke="#C8B6FF" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.7"/></g>`;
}
function plate(x, y, s, inner = "") {
  return `<g transform="${tr(x, y, 0, s)}"><ellipse rx="160" ry="60" fill="#E9EEF5"/><ellipse rx="120" ry="42" fill="#FFFFFF"/>${inner}</g>`;
}
function egg(x, y, s) {
  return `<g transform="${tr(x, y, 0, s)}"><path d="M 0 -90 C 50 -90 76 0 70 30 C 64 70 34 90 0 90 C -34 90 -64 70 -70 30 C -76 0 -50 -90 0 -90 Z" fill="#FFF4E0"/>
    <ellipse cx="-24" cy="-30" rx="14" ry="26" fill="#fff" opacity="0.7"/></g>`;
}
function steak(x, y, s) {
  return `<g transform="${tr(x, y, 0, s)}"><path d="M -110 -20 C -110 -80 -20 -90 40 -70 C 100 -50 120 0 100 40 C 80 80 0 90 -50 70 C -100 50 -110 20 -110 -20 Z" fill="#B5473A"/>
    <path d="M -80 -20 C -60 -50 0 -60 40 -40 C 80 -20 80 20 60 40" stroke="#F3D1C4" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M -110 -20 C -110 -80 -20 -90 40 -70" stroke="#F3D1C4" stroke-width="10" fill="none" opacity="0.6"/></g>`;
}
function halalBadge(x, y, s) {
  return `<g transform="${tr(x, y, -10, s)}"><circle r="56" fill="${COL.green}"/><circle r="46" fill="none" stroke="#fff" stroke-width="4" opacity="0.8"/>
    <text x="0" y="12" text-anchor="middle" style="font-family:Anton;font-size:34px;fill:#fff;letter-spacing:1px">HALAL</text></g>`;
}
function avocado(x, y, s) {
  return `<g transform="${tr(x, y, 0, s)}"><path d="M 0 -100 C 40 -100 60 -40 76 10 C 92 60 60 100 0 100 C -60 100 -92 60 -76 10 C -60 -40 -40 -100 0 -100 Z" fill="#3E6B2E"/>
    <path d="M 0 -84 C 32 -84 48 -36 62 8 C 74 50 48 84 0 84 C -48 84 -74 50 -62 8 C -48 -36 -32 -84 0 -84 Z" fill="#CFE88A"/>
    <circle cx="0" cy="26" r="36" fill="#8A5A3B"/><path d="M -24 14 A 28 28 0 0 1 4 -4" stroke="#B07A55" stroke-width="6" fill="none" stroke-linecap="round"/></g>`;
}
function oliveOil(x, y, s) {
  return `<g transform="${tr(x, y, 0, s)}"><rect x="-18" y="-150" width="36" height="34" rx="6" fill="#2D4A1E"/>
    <path d="M -24 -118 L 24 -118 L 30 -70 C 60 -50 64 -20 64 10 L 64 110 C 64 124 54 132 40 132 L -40 132 C -54 132 -64 124 -64 110 L -64 10 C -64 -20 -60 -50 -30 -70 Z" fill="#9BBF3A" opacity="0.9"/>
    <path d="M -64 30 L 64 30 L 64 110 C 64 124 54 132 40 132 L -40 132 C -54 132 -64 124 -64 110 Z" fill="#7FA22A"/>
    <rect x="-46" y="-10" width="92" height="70" rx="10" fill="#F5F1E1"/>
    <ellipse cx="0" cy="24" rx="14" ry="20" fill="#5D7F23" transform="rotate(20)"/></g>`;
}
function salmon(x, y, s) {
  return `<g transform="${tr(x, y, 0, s)}"><path d="M -120 -30 C -60 -70 60 -70 120 -30 C 130 0 120 30 100 40 C 40 60 -40 60 -100 40 C -120 30 -130 0 -120 -30 Z" fill="#FF8C69"/>
    <path d="M -80 -40 C -70 -10 -70 20 -80 40 M -30 -52 C -20 -20 -20 20 -30 50 M 20 -54 C 30 -20 30 20 20 52 M 70 -46 C 80 -16 80 16 70 44" stroke="#FFD0BF" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M -120 -30 C -60 -70 60 -70 120 -30" stroke="#C7C9CF" stroke-width="10" fill="none"/></g>`;
}
function tunaCan(x, y, s) {
  return `<g transform="${tr(x, y, 0, s)}"><ellipse cx="0" cy="40" rx="90" ry="26" fill="#9AA5B8"/><rect x="-90" y="-20" width="180" height="60" fill="#5EC8FF"/>
    <ellipse cx="0" cy="-20" rx="90" ry="26" fill="#C9D3E0"/><ellipse cx="0" cy="-20" rx="70" ry="18" fill="#B0BCCD"/>
    <text x="0" y="28" text-anchor="middle" style="font-family:Anton;font-size:30px;fill:#fff">THUNFISCH</text></g>`;
}
function bottleCrossed(x, y, s) {
  return `<g transform="${tr(x, y, 0, s)}"><rect x="-16" y="-120" width="32" height="40" rx="6" fill="#6E7B8F"/>
    <path d="M -20 -84 L 20 -84 L 24 -50 C 48 -36 50 -10 50 10 L 50 100 C 50 114 40 120 28 120 L -28 120 C -40 120 -50 114 -50 100 L -50 10 C -50 -10 -48 -36 -24 -50 Z" fill="#8E9BB3"/>
    <line x1="-90" y1="-110" x2="90" y2="110" stroke="${COL.red}" stroke-width="22" stroke-linecap="round"/></g>`;
}
function pawPrint(x, y, s, c = COL.orange) {
  return `<g transform="${tr(x, y, 0, s)}"><ellipse cx="0" cy="18" rx="34" ry="28" fill="${c}"/>
    <ellipse cx="-38" cy="-18" rx="13" ry="17" fill="${c}"/><ellipse cx="-14" cy="-40" rx="13" ry="17" fill="${c}"/>
    <ellipse cx="14" cy="-40" rx="13" ry="17" fill="${c}"/><ellipse cx="38" cy="-18" rx="13" ry="17" fill="${c}"/></g>`;
}
function calendarPage(x, y, s, label, sub) {
  return `<g transform="${tr(x, y, 0, s)}"><rect x="-150" y="-170" width="300" height="340" rx="26" fill="#F5F7FB"/>
    <rect x="-150" y="-170" width="300" height="90" rx="26" fill="${COL.red}"/><rect x="-150" y="-110" width="300" height="30" fill="${COL.red}"/>
    <text x="0" y="-110" text-anchor="middle" style="font-family:'Bebas Neue';font-size:56px;fill:#fff">${sub || "WOCHE"}</text>
    <text x="0" y="90" text-anchor="middle" style="font-family:Anton;font-size:150px;fill:#0E1422">${label}</text></g>`;
}
function seesaw(x, y, s, ang, left, right) {
  return `<g transform="${tr(x, y, 0, s)}"><path d="M -60 120 L 0 0 L 60 120 Z" fill="#3B4562"/>
    <g transform="rotate(${fx(ang)})"><rect x="-460" y="-16" width="920" height="32" rx="16" fill="#C9D3E0"/>
      <g transform="translate(-360 -16)">${left}</g><g transform="translate(360 -16)">${right}</g></g></g>`;
}
function weightBlock(label, c, w = 260) {
  return `<rect x="${-w / 2}" y="-130" width="${w}" height="130" rx="22" fill="${c}"/><text x="0" y="-46" text-anchor="middle" style="font-family:Anton;font-size:52px;fill:#fff;letter-spacing:2px">${label}</text>`;
}
function rack(x, y, s) {
  return `<g transform="${tr(x, y, 0, s)}"><rect x="-260" y="-560" width="30" height="560" fill="#3A4156"/><rect x="230" y="-560" width="30" height="560" fill="#3A4156"/>
    <rect x="-270" y="-575" width="540" height="26" rx="8" fill="#4A5270"/><rect x="-300" y="-10" width="600" height="20" rx="6" fill="#2A3042"/>
    <rect x="-248" y="-380" width="36" height="14" fill="#7A84A0"/><rect x="212" y="-380" width="36" height="14" fill="#7A84A0"/></g>`;
}
function plateStack(x, y, s) {
  return `<g transform="${tr(x, y, 0, s)}"><rect x="-70" y="-30" width="140" height="30" rx="10" fill="#2A2F3A"/><rect x="-60" y="-58" width="120" height="28" rx="10" fill="#3A4150"/>
    <rect x="-48" y="-82" width="96" height="24" rx="10" fill="#2A2F3A"/></g>`;
}
// Testosteron-Badge (Kreis mit T)
function tBadge(x, y, s, c = COL.orange, letter = "T") {
  return `<g transform="${tr(x, y, 0, s)}"><circle r="70" fill="${c}"/><circle r="58" fill="none" stroke="#fff" stroke-width="5" opacity="0.6"/>
    <text x="0" y="26" text-anchor="middle" style="font-family:Anton;font-size:76px;fill:#fff">${letter}</text></g>`;
}
function arrowRight(x, y, w, c = "#F5F7FB", s = 1) {
  return `<g transform="${tr(x, y, 0, s)}"><rect x="0" y="-10" width="${w - 40}" height="20" rx="10" fill="${c}"/><path d="M ${w - 50} -34 L ${w} 0 L ${w - 50} 34 Z" fill="${c}"/></g>`;
}
function arrowUpDown(x, y, up, c, s = 1) {
  return `<g transform="${tr(x, y, up ? 0 : 180, s)}"><path d="M 0 -60 L 50 0 L 20 0 L 20 60 L -20 60 L -20 0 L -50 0 Z" fill="${c}"/></g>`;
}

// Kapitelkarte
function chapterCard(t, lt, d, num, title, sub, color, icon) {
  const inK = E.outCubic(clamp(lt / 0.5));
  const outK = clamp((lt - (d - 0.35)) / 0.35);
  let g = `<rect width="${W}" height="${H}" fill="${color}"/>` + dots();
  for (let i = 0; i < 6; i++) g += `<rect x="${fx(-200 + i * 380 + ((lt * 60) % 380))}" y="-100" width="120" height="1400" fill="#fff" opacity="0.04" transform="rotate(18 960 540)"/>`;
  const tsize = Math.min(170, 1080 / (title.length * 0.46));
  g += op(1 - outK, T(lerp(-300, 400, inK) - outK * 200, 690, num, { size: 420, font: "anton", fill: "none", extra: `stroke="#fff" stroke-width="10" opacity="0.9"` }));
  g += op(1 - outK, T(lerp(2200, 700, inK) + outK * 200, 600, title, { size: tsize, font: "anton", fill: "#fff", ls: 4, anchor: "start" }));
  if (sub) g += op(clamp((lt - 0.3) / 0.3) * (1 - outK), T(706, 690, sub, { size: 70, font: "barlow", fill: "#fff", anchor: "start", extra: 'opacity="0.85"' }));
  if (icon) g += op(1 - outK, G(tr(820, 360, Math.sin(lt * 2) * 4, popScale(lt, 0.15)), icon));
  return g;
}

// Großer Untertitel/Keyword mit Farbteilen: parts = [["TEXT", farbe], ...]
function title(x, y, parts, o = {}) {
  const size = o.size || 110;
  const spans = parts.map((p, i) => `<tspan fill="${p[1] || "#fff"}">${esc(p[0])}${i < parts.length - 1 ? " " : ""}</tspan>`).join("");
  return `<text x="${fx(x)}" y="${fx(y)}" text-anchor="${o.anchor || "middle"}" style="font-family:${o.font || "Anton"};font-size:${size}px;letter-spacing:${o.ls || 2}px;stroke:${o.stroke || "#0B1020"};stroke-width:${o.sw != null ? o.sw : 14}px;stroke-linejoin:round;paint-order:stroke">${spans}</text>`;
}
function popTitle(t, at, x, y, parts, o = {}) {
  return pop(t, at, x, y, title(0, 0, parts, o), { out: o.out, dur: 0.4 });
}
// kleines Label in Pillenform
function pill(x, y, text, o = {}) {
  const size = o.size || 40, w = o.w || text.length * size * 0.52 + 50;
  return `<g transform="${tr(x, y)}"><rect x="${-w / 2}" y="${-size * 0.85}" width="${w}" height="${size * 1.5}" rx="${size * 0.75}" fill="${o.bg || COL.orange}"/>
    <text x="0" y="${size * 0.3}" text-anchor="middle" style="font-family:'Barlow Condensed';font-weight:800;font-size:${size}px;fill:${o.fg || "#fff"};letter-spacing:1px">${esc(text)}</text></g>`;
}
