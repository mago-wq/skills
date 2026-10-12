const { chromium } = require("playwright-core");
const fs = require("fs"), path = require("path");
(async () => {
  const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8").replace("SCENEFILE", "scenes.js");
  const tmp = path.join(__dirname, "_info.html"); fs.writeFileSync(tmp, html);
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.log("PAGEERROR", e.message));
  await page.goto("file://" + tmp);
  const info = await page.evaluate(() => SCENES.map((s) => [s.id, s.start.toFixed(2), s.end.toFixed(2)]));
  console.log(info.map((x) => x.join(" ")).join("\n"));
  await browser.close();
})();
