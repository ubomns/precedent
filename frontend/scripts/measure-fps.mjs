import { chromium, devices } from "@playwright/test";
import { spawn } from "child_process";

/**
 * Temporary FPS measurement helper for the Three.js hero PoC.
 * Starts Next.js dev server on 3001, samples rAF frame counts on desktop and
 * a mid-tier mobile emulation, then prints results and exits.
 */

const PORT = 3001;
const URL = `http://localhost:${PORT}/test-three`;

function waitForServer(url, timeoutMs = 60_000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = async () => {
      try {
        const res = await fetch(url);
        if (res.ok) {
          resolve();
          return;
        }
      } catch {
        // not ready yet
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error("Server did not start in time"));
        return;
      }
      setTimeout(check, 250);
    };
    check();
  });
}

async function measureFPS(page, durationMs = 5000) {
  return page.evaluate(
    (duration) =>
      new Promise((resolve) => {
        let frames = 0;
        const start = performance.now();
        function tick(now) {
          frames++;
          if (now - start < duration) {
            requestAnimationFrame(tick);
          } else {
            resolve({
              frames,
              duration: now - start,
              fps: Math.round((frames * 1000) / (now - start)),
            });
          }
        }
        requestAnimationFrame(tick);
      }),
    durationMs
  );
}

async function runProfile(browser, device, label) {
  const context = await browser.newContext({
    ...device,
    reducedMotion: undefined,
  });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });

  // Let the WebGL scene warm up for one second.
  await page.waitForTimeout(1000);

  const result = await measureFPS(page, 5000);
  console.log(`[${label}] FPS: ${result.fps} (${result.frames} frames / ${Math.round(result.duration)}ms)`);

  await context.close();
}

const server = spawn("npx", ["next", "dev", "-p", String(PORT)], {
  stdio: "inherit",
  shell: true,
});

try {
  await waitForServer(URL);
  console.log("Server ready. Running FPS profiles...\n");

  const browser = await chromium.launch();

  await runProfile(browser, devices["Desktop Chrome"], "Desktop Chrome");
  await runProfile(
    browser,
    devices["Moto G4"],
    "Mobile (Moto G4 mid-tier)"
  );

  await browser.close();
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  server.kill("SIGTERM");
}
