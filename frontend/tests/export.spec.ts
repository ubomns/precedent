import { test, expect } from "@playwright/test";

async function mockGenerateAPI(page: any) {
  await page.route("**/api/generate", async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        brd: {
          executive_summary: {
            content: { narrative: ["Executive summary text."] },
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
}

async function fillIntakeForm(page: any) {
  await page.goto("/intake");
  await page.getByPlaceholder(/What is the project trying/i).fill("Expose core banking API");
  await page.getByPlaceholder(/What\'s in scope/i).fill("Account read/write");
  await page.getByPlaceholder(/What\'s out/i).fill("Retail UI");
  await page.getByPlaceholder(/Who will use what/i).fill("Engineering teams");
  await page.getByPlaceholder(/Standards, jurisdictions/i).fill("PSD2, GDPR");
}

test.describe("Export Page", () => {
  test.beforeEach(async ({ page }) => {
    await mockGenerateAPI(page);
    await fillIntakeForm(page);
    await page.getByRole("button", { name: /Generate BRD/i }).click();
    await expect(page).toHaveURL(/\/review/, { timeout: 10000 });
  });

  test("navigates to export and renders page", async ({ page }) => {
    await page.goto("/export");
    await expect(page.getByRole("heading", { name: /Ready to export/i })).toBeVisible();
    await expect(page.getByText("Expose core banking API")).toBeVisible();
  });

  test("export button triggers download", async ({ page }) => {
    await page.goto("/export");

    await page.route("**/api/export", async (route: any) => {
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
      page.getByRole("button", { name: /Export to Word/i }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/BRD\.docx/i);
  });
});
