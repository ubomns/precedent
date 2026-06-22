import { test, expect } from "@playwright/test";

test.describe("Theme tokens", () => {
  test("light mode resolves a warm-paper background and dark borders", async ({ page }) => {
    await page.goto("/");
    const dark = await page.evaluate(() => {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      return getComputedStyle(document.documentElement).getPropertyValue("--bg").trim();
    });
    const light = await page.evaluate(() => {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      const cs = getComputedStyle(document.documentElement);
      return {
        bg: cs.getPropertyValue("--bg").trim(),
        border: cs.getPropertyValue("--border").trim(),
        overlay: cs.getPropertyValue("--overlay-weak").trim(),
      };
    });
    expect(dark).toBe("#050505");
    expect(light.bg).toBe("#faf8f4");           // warm paper, not pure white
    expect(light.border).toContain("0, 0, 0");   // borders flip to black-translucent
    expect(light.overlay).toContain("0, 0, 0");  // overlay fills flip to black-translucent
  });
});

test.describe("Theme toggle", () => {
  test("toggles the html class and persists across reload", async ({ page }) => {
    // Seed localStorage to dark before page load so the no-flash script and
    // the React component both start in dark mode.
    await page.goto("/");
    await page.evaluate(() => localStorage.setItem("theme", "dark"));
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/);
    await page.getByRole("button", { name: /switch to light mode/i }).click();
    await expect(html).toHaveClass(/light/);
    await expect(html).not.toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/light/);
  });

  test("toggle is visible and tappable on mobile with no horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /switch to (light|dark) mode/i });
    await expect(toggle).toBeVisible();
    const box = await toggle.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(40);
    expect(box!.height).toBeGreaterThanOrEqual(40);
    for (const cls of ["dark", "light"]) {
      await page.evaluate((c) => {
        document.documentElement.classList.remove("dark", "light");
        document.documentElement.classList.add(c);
      }, cls);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow).toBeLessThanOrEqual(0);
    }
  });
});
