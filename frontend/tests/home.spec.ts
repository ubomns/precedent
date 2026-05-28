import { test, expect } from "@playwright/test";

test.describe("Home / Launcher Page", () => {
  test("renders the launcher page with brand and navigation cards", async ({ page }) => {
    await page.goto("/");

    // Brand
    await expect(page.getByRole("heading", { name: "Precedent" })).toBeVisible();
    await expect(page.getByText("An AI-powered BRD generator for Business Analysts")).toBeVisible();

    // Three screen cards
    await expect(page.getByRole("heading", { name: "Brief Intake" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Review & Refine" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Export" })).toBeVisible();

    // Navigation links present
    await expect(page.getByRole("link", { name: /Begin/i })).toBeVisible();
  });

  test("navigates to intake from launcher", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Begin/i }).click();
    await expect(page).toHaveURL(/\/intake/);
    await expect(page.getByRole("heading", { name: "From brief to BRD." })).toBeVisible();
  });
});
