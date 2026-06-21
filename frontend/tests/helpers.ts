import { expect, type Page } from "@playwright/test";

/**
 * Walk the conversational intake wizard with valid answers for all six steps,
 * leaving the page on the review card. Does NOT click "Generate BRD" — callers
 * that need a generated BRD should click it themselves after this resolves.
 *
 * This is the shared setup seam for any spec that needs downstream state
 * (review/export), since the app's Zustand store is seeded only by completing
 * intake and has no persistence.
 */
export async function walkIntakeWizard(page: Page) {
  await page.goto("/intake");

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
