import { test, expect } from "@playwright/test";
import { walkIntakeWizard } from "./helpers";

test.describe("Export Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/generate", async (route: any) => {
      expect(await route.request().headerValue("authorization")).toBe(
        `Bearer ${process.env.NEXT_PUBLIC_API_SECRET_KEY}`
      );
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          brd: {
            executive_summary: {
              content: { narrative: "Executive summary text." },
              feedback: [],
            },
            functional_requirements: {
              content: {
                requirements: [
                  { id: "FR-01", requirement: "Provide REST API", priority: "Must Have" },
                ],
              },
              feedback: [],
            },
          },
        }),
      });
    });

    await walkIntakeWizard(page);
    await page.getByRole("button", { name: /Generate BRD/i }).click();
    await expect(page).toHaveURL(/\/review/, { timeout: 15000 });

    // Navigate client-side to preserve ephemeral Zustand state.
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Export" })
      .evaluate((el: HTMLElement) => el.click());
    await expect(page).toHaveURL(/\/export/);
  });

  test("renders export confirmation with BRD details", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Your BRD is ready/i })).toBeVisible();
    await expect(page.getByText("Expose core banking API")).toBeVisible();
  });

  test("navigates from export to review via primary nav", async ({ page }) => {
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Review" })
      .evaluate((el: HTMLElement) => el.click());
    await expect(page).toHaveURL(/\/review/);
  });

  test("export button triggers download", async ({ page }) => {
    await page.route("**/api/export", async (route: any) => {
      expect(await route.request().headerValue("authorization")).toBe(
        `Bearer ${process.env.NEXT_PUBLIC_API_SECRET_KEY}`
      );
      await route.fulfill({
        status: 200,
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        body: Buffer.from("PK"),
        headers: {
          "Content-Disposition": "attachment; filename=BRD.docx",
        },
      });
    });

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /Download \.docx/i }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/BRD\.docx/i);
  });

  test("back-to-review link navigates to review", async ({ page }) => {
    await page.getByRole("button", { name: /Back to review/i }).click();
    await expect(page).toHaveURL(/\/review/);
  });
});
