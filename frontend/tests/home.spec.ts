import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("renders hero with headline, sub-headline, and CTAs", async ({ page }) => {
    await page.goto("/");

    const hero = page.getByLabel("Hero");

    await expect(
      hero.getByRole("heading", { name: "The BRD shouldn't be the hardest part of your job." })
    ).toBeVisible();

    await expect(
      hero.getByText("Precedent turns a structured project brief into a near-complete Business Requirements Document")
    ).toBeVisible();

    await expect(hero.getByRole("link", { name: "Generate my BRD — free to try" })).toBeVisible();
    await expect(hero.getByRole("link", { name: "Download a sample BRD" })).toBeVisible();
  });

  test("renders all 8 landing sections", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "You handle the thinking. We handle the structure." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "How it works" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "The 12 sections" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "See the output before you commit" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Built for regulated environments" })).toBeVisible();
    await expect(page.getByText("Illustrative example")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ready to draft your next BRD?" })).toBeVisible();
  });

  test("lists all 12 BRD sections", async ({ page }) => {
    await page.goto("/");

    const sectionsList = page.getByLabel("The 12 BRD sections");

    for (const section of [
      "Executive Summary",
      "Business Objective",
      "Scope (in / out)",
      "Stakeholders & RACI",
      "Functional Requirements",
      "Non-Functional Requirements",
      "Assumptions",
      "Constraints",
      "Acceptance Criteria",
      "User Access Management",
      "Security Controls",
      "Benefits Realisation",
    ]) {
      await expect(sectionsList.getByText(section, { exact: true })).toBeVisible();
    }
  });

  test("navigates to intake from primary CTA", async ({ page }) => {
    await page.goto("/");
    await Promise.all([
      page.waitForURL(/\/intake/),
      page.getByRole("link", { name: "Generate my BRD — free to try" }).click(),
    ]);
    await expect(page).toHaveURL(/\/intake/);
  });

  test("download sample BRD link has correct href", async ({ page }) => {
    await page.goto("/");
    const sampleSection = page.getByLabel("Sample output");
    const downloadLink = sampleSection.getByRole("link", { name: "Download a sample BRD" });
    await expect(downloadLink).toHaveAttribute("href", "/sample-brd.docx");
    await expect(downloadLink).toHaveAttribute("download", "");
  });
});
