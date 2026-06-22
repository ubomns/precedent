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
