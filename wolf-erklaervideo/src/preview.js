// node preview.js <scenefile> <out-prefix> t1 t2 ...  -> PNGs
const { chromium } = require("playwright-core");
const fs = require("fs"), path = require("path");
(async () => {
  const [scenefile, prefix, ...times] = process.argv.slice(2);
  const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8").replace("SCENEFILE", scenefile).replace("TIMELINEFILE", process.env.TL_FILE || "timeline.js");
  const tmp = path.join(__dirname, "_preview.html");
  fs.writeFileSync(tmp, html);
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--font-render-hinting=none"] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on("console", (m) => console.log("console:", m.text()));
  page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
  await page.goto("file://" + tmp);
  await page.evaluate(() => document.fonts.ready);
  if (await page.evaluate(() => !!window.preloadImages)) console.log('images:', await page.evaluate(() => window.preloadImages()));
  await page.waitForTimeout(300);
  for (const t of times) {
    await page.evaluate((tt) => window.renderFrame(tt), parseFloat(t));
    await page.screenshot({ path: `${prefix}_${t}.png` });
    console.log("wrote", `${prefix}_${t}.png`);
  }
  await browser.close();
})();
