const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  page.on("console", (msg) => console.log("console:", msg.type(), msg.text()));
  page.on("pageerror", (err) => console.log("pageerror:", err.message));
  page.on("response", (r) => { if (r.status() >= 400) console.log("response error:", r.status(), r.url()); });
  await page.goto("http://localhost:3000/test-three", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  const html = await page.evaluate(() => document.querySelector("main").innerHTML);
  console.log("main HTML:", html.slice(0, 800));
  await browser.close();
})();
