// Rendert einen Frame-Bereich der Szenen per Chromium-Screenshot direkt in ffmpeg (H.264).
// node render.js <scenefile> <out.mp4> <fps> <frameStart> <frameEnd> [--sfx sfx.json]
const { chromium } = require("playwright-core");
const { spawn } = require("child_process");
const fs = require("fs"), path = require("path");

(async () => {
  const [scenefile, out, fpsS, f0S, f1S, flag, sfxOut] = process.argv.slice(2);
  const fps = parseInt(fpsS, 10), f0 = parseInt(f0S, 10), f1 = parseInt(f1S, 10);
  const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8").replace("SCENEFILE", scenefile);
  const tmp = path.join(__dirname, `_render_${process.pid}.html`);
  fs.writeFileSync(tmp, html);
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--font-render-hinting=none", "--disable-gpu"] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  let pageErr = null;
  page.on("pageerror", (e) => { pageErr = e.message; console.error("PAGEERROR", e.message); });
  await page.goto("file://" + tmp);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  if (flag === "--sfx") {
    const sfx = await page.evaluate(() => ({ sfx: window.SFX, duration: window.TL.duration }));
    fs.writeFileSync(sfxOut, JSON.stringify(sfx));
  }
  if (f1 <= f0) { await browser.close(); fs.unlinkSync(tmp); return; }

  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-tune", "animation", "-pix_fmt", "yuv420p", "-threads", "2", out],
    { stdio: ["pipe", "inherit", "inherit"] });
  const cdp = await page.context().newCDPSession(page);
  const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    await page.evaluate((tt) => window.renderFrame(tt), f / fps);
    const shot = await cdp.send("Page.captureScreenshot", { format: "jpeg", quality: 94, optimizeForSpeed: true });
    const buf = Buffer.from(shot.data, "base64");
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if ((f - f0) % 300 === 0) console.log(`[${path.basename(out)}] frame ${f - f0}/${f1 - f0}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    if (pageErr) break;
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  await browser.close();
  fs.unlinkSync(tmp);
  console.log(`[${path.basename(out)}] done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  if (pageErr) process.exit(2);
})();
