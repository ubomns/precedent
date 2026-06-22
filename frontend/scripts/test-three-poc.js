// Temporary throwaway script for WBS-000A verification.
const { chromium } = require("playwright");

const URL = "http://localhost:3000/test-three";

async function measureFPS(page) {
  return page.evaluate(async () => {
    const start = performance.now();
    let frames = 0;
    const deadline = start + 3000;

    await new Promise((resolve) => {
      const tick = () => {
        frames++;
        if (performance.now() < deadline) {
          requestAnimationFrame(tick);
        } else {
          resolve(undefined);
        }
      };
      requestAnimationFrame(tick);
    });

    const elapsed = performance.now() - start;
    return Math.round((frames * 1000) / elapsed);
  });
}

async function run() {
  const browser = await chromium.launch({ headless: true });

  // 1. Default capable context
  const defaultContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await defaultContext.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);

  const canvasCount = await page.locator("canvas").count();
  const fallbackCount = await page.locator('div[style*="radial-gradient"]').count();
  const fps = canvasCount > 0 ? await measureFPS(page) : 0;

  console.log(`default: canvas=${canvasCount}, fallback=${fallbackCount}, fps=${fps}`);

  // 2. Reduced-motion context
  const reducedContext = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    reducedMotion: "reduce",
  });
  const reducedPage = await reducedContext.newPage();
  await reducedPage.goto(URL, { waitUntil: "networkidle" });
  await reducedPage.waitForTimeout(3000);

  const reducedCanvas = await reducedPage.locator("canvas").count();
  const reducedFallback = await reducedPage.locator('div[style*="radial-gradient"]').count();
  console.log(`reduced-motion: canvas=${reducedCanvas}, fallback=${reducedFallback}`);

  // 3. WebGL-failure context
  const brokenContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const brokenPage = await brokenContext.newPage();
  await brokenPage.addInitScript(() => {
    // Disable all WebGL contexts so the renderer constructor throws/fails.
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type) {
      if (typeof type === "string" && type.toLowerCase().includes("webgl")) {
        return null;
      }
      return original.apply(this, arguments);
    };
  });
  await brokenPage.goto(URL, { waitUntil: "networkidle" });
  await brokenPage.waitForTimeout(3000);

  const brokenCanvas = await brokenPage.locator("canvas").count();
  const brokenFallback = await brokenPage.locator('div[style*="radial-gradient"]').count();
  console.log(`webgl-failure: canvas=${brokenCanvas}, fallback=${brokenFallback}`);

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
