import { test, expect, type Page } from "@playwright/test";
import { stubAuth } from "./helpers-auth";

const okBrd = {
  brd: {
    executive_summary: { content: { narrative: "Test executive summary." }, feedback: [] },
  },
};

async function mockGenerate(page: Page, onRequest?: (body: any) => void) {
  await page.route("**/api/generate", async (route) => {
    onRequest?.(route.request().postDataJSON());
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(okBrd),
    });
  });
}

// Walk all six steps with valid answers, leaving the wizard on the review card.
async function answerAll(page: Page) {
  await page.getByLabel("Project objective").fill("Expose core banking API to partners");
  await page.getByRole("button", { name: "Send" }).click();

  await page.getByRole("textbox", { name: /Stakeholder 1 name/i }).fill("Priya Anand");
  await page.getByRole("textbox", { name: /Stakeholder 1 role/i }).fill("Head of Compliance");
  await page.getByRole("button", { name: "Send" }).click();

  await page.getByLabel("Scope in").fill("Account read/write\nPayment initiation");
  await page.getByRole("button", { name: "Send" }).click();

  await page.getByLabel("Scope out").fill("Retail UI\nFX execution");
  await page.getByRole("button", { name: "Send" }).click();

  await page.getByLabel("Target users").fill("Engineering teams at fintech partners");
  await page.getByRole("button", { name: "Send" }).click();

  await page.getByLabel("Regulatory context").fill("PSD2, GDPR, FCA");
  await page.getByRole("button", { name: "Send" }).click();

  await expect(page.getByRole("heading", { name: "Review your brief" })).toBeVisible();
}

test.describe("Intake Wizard", () => {
  test.beforeEach(async ({ page }) => {
    await stubAuth(page);
    await page.goto("/intake");
  });

  test("opens on the first question", async ({ page }) => {
    await expect(page.getByText("What are you building, and why now?")).toBeVisible();
    await expect(page.getByLabel("Project objective")).toBeVisible();
    await expect(page.getByText("01 / 06")).toBeVisible();
  });

  test("blocks advancing past an empty required step", async ({ page }) => {
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText("Project objective is required.")).toBeVisible();
    // Still on step 1: the stakeholders question has not appeared.
    await expect(page.getByText("Who are the key stakeholders?")).toHaveCount(0);
  });

  test("adds and removes stakeholder rows", async ({ page }) => {
    await page.getByLabel("Project objective").fill("Anything");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByRole("textbox", { name: /Stakeholder 1 name/i })).toBeVisible();
    await page.getByRole("button", { name: "Add stakeholder" }).click();
    await expect(page.getByRole("textbox", { name: /Stakeholder 2 name/i })).toBeVisible();
    await page.getByRole("button", { name: /Remove stakeholder 2/i }).click();
    await expect(page.getByRole("textbox", { name: /Stakeholder 2 name/i })).toHaveCount(0);
  });

  test("walks the full conversation and generates", async ({ page }) => {
    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(okBrd),
      });
    });

    await answerAll(page);
    await page.getByRole("button", { name: "Generate BRD" }).click();

    await expect(page).toHaveURL(/\/review/, { timeout: 15000 });
  });

  test("edits an earlier answer in place", async ({ page }) => {
    await page.getByLabel("Project objective").fill("First version");
    await page.getByRole("button", { name: "Send" }).click();

    // The objective bubble now shows; edit it.
    await page.getByRole("button", { name: "Edit project objective" }).click();
    await page.getByLabel("Project objective").fill("Second version");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Second version")).toBeVisible();
    await expect(page.getByText("First version")).toHaveCount(0);
  });

  test("edits a field from the review card and submits the new value", async ({ page }) => {
    let body: any = null;
    await mockGenerate(page, (b) => {
      body = b;
    });

    await answerAll(page);

    const card = page.getByTestId("review-card");
    await card.getByRole("button", { name: "Edit target users" }).click();
    // The review card's "Edit target users" button stays mounted alongside the
    // edit field, so an exact label match is required to target only the input.
    await page.getByLabel("Target users", { exact: true }).fill("Updated user group");
    await page.getByRole("button", { name: "Save" }).click();

    await page.getByRole("button", { name: "Generate BRD" }).click();
    await expect(page).toHaveURL(/\/review/, { timeout: 15000 });
    expect(body.target_users).toBe("Updated user group");
  });
});
