// QA: rendert pro Szene Frames an relativen Positionen (Standard 0.35 und 0.9) als JPEG.
// node qa_frames.js <scenefile> <outdir> [pos1,pos2,...]   (TL_FILE=timeline_v2.js)
const { chromium } = require("playwright-core");
const fs = require("fs"), path = require("path");
(async () => {
  const [scenefile, outdir, posS] = process.argv.slice(2);
  const pos = (posS || "0.35,0.9").split(",").map(Number);
  fs.mkdirSync(outdir, { recursive: true });
  const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8").replace("SCENEFILE", scenefile).replace("TIMELINEFILE", process.env.TL_FILE || "timeline.js");
  const tmp = path.join(__dirname, `_qa_${process.pid}.html`);
  fs.writeFileSync(tmp, html);
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--font-render-hinting=none"] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
  await page.goto("file://" + tmp);
  await page.evaluate(() => document.fonts.ready);
  console.log("images:", await page.evaluate(() => window.preloadImages ? window.preloadImages() : 0));
  await page.waitForTimeout(300);
  const scenes = await page.evaluate(() => SCENES.map((s) => ({ id: s.id, start: s.start, end: s.end })));
  const out = [];
  const only = process.env.ONLY ? process.env.ONLY.split(",") : null;
  for (const sc of scenes) {
    if (only && !only.includes(sc.id)) continue;
    for (const p of pos) {
      const t = sc.start + (sc.end - sc.start - 0.25) * p;
      await page.evaluate((tt) => window.renderFrame(tt), t);
      const f = path.join(outdir, `${sc.id}_${p.toFixed(2)}.jpg`);
      await page.screenshot({ path: f, type: "jpeg", quality: 80 });
      out.push({ id: sc.id, t: +t.toFixed(2), file: f });
    }
  }
  fs.writeFileSync(path.join(outdir, "index.json"), JSON.stringify(out, null, 1));
  console.log("frames:", out.length);
  await browser.close();
  fs.unlinkSync(tmp);
})();
