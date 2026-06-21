import { test, expect } from "@playwright/test";
import { walkIntakeWizard } from "./helpers";

async function mockGenerateAPI(page: any) {
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
            content: { narrative: ["Test executive summary paragraph one.", "Test executive summary paragraph two."] },
            feedback: [],
          },
          business_objective: {
            content: { narrative: ["Test business objective."] },
            feedback: [],
          },
          scope: {
            content: {
              in_scope: ["Account read/write", "Payment initiation"],
              out_of_scope: ["Retail UI", "FX execution"],
            },
            feedback: [],
          },
          stakeholders: {
            content: {
              stakeholders: [
                { name: "Priya Anand", role: "Head of Compliance", raci: "C" },
                { name: "Marcus Wei", role: "Platform Lead", raci: "C" },
              ],
            },
            feedback: [],
          },
          functional_requirements: {
            content: {
              requirements: [
                { id: "FR-01", requirement: "Provide REST API", priority: "Must Have" },
                { id: "FR-02", requirement: "Support webhooks", priority: "Must Have" },
              ],
            },
            feedback: [
              { severity: "high", issue: "API lacks versioning strategy.", suggestion: "Add /v1 prefix." },
            ],
          },
          non_functional_requirements: {
            content: {
              requirements: [{ category: "Security", requirement: "OAuth2", metric: "100% tokens" }],
            },
            feedback: [],
          },
          assumptions: {
            content: { assumptions: ["API is stable"] },
            feedback: [],
          },
          constraints: {
            content: { constraints: ["Must comply with PSD2"] },
            feedback: [],
          },
          acceptance_criteria: {
            content: {
              criteria: [{ requirement_id: "AC-01", criteria: "API must expose endpoints" }],
            },
            feedback: [],
          },
          user_access_management: {
            content: {
              roles: [{ role: "Partner Engineer", permissions: "Read/Write", iam_group: "partners" }],
            },
            feedback: [],
          },
          security_controls: {
            content: {
              controls: [{ domain: "Auth", control: "OAuth2", implementation: "JWT" }],
            },
            feedback: [],
          },
          benefits_realization: {
            content: {
              benefits: [{ benefit: "Faster integration", measurement: "40% faster", timeline: "6 months" }],
            },
            feedback: [],
          },
        },
      }),
    });
  });
}

test.describe("Review Page", () => {
  test.beforeEach(async ({ page }) => {
    await mockGenerateAPI(page);
    await walkIntakeWizard(page);
    await page.getByRole("button", { name: /Generate BRD/i }).click();
    await expect(page).toHaveURL(/\/review/, { timeout: 15000 });
  });

  test("renders sidebar with all 12 sections", async ({ page }) => {
    await expect(page.getByRole("navigation", { name: "BRD sections" })).toContainText("Executive Summary");
    await expect(page.getByRole("navigation", { name: "BRD sections" })).toContainText("Benefits Realization");
  });

  test("switches between sections via sidebar", async ({ page }) => {
    await page.getByRole("navigation", { name: "BRD sections" }).getByText("Scope").click();
    await expect(page.getByRole("heading", { name: "Scope" })).toBeVisible();
    await expect(page.getByText("In Scope")).toBeVisible();
    await expect(page.getByText("Out of Scope")).toBeVisible();
  });

  test("shows drafted content for executive summary", async ({ page }) => {
    await expect(page.getByText("Test executive summary paragraph one.")).toBeVisible();
  });

  test("shows run critique banner when critique not run", async ({ page }) => {
    await expect(page.getByText("Critic Review Not Run")).toBeVisible();
    await expect(page.getByRole("button", { name: /Run Critic Review/i })).toBeVisible();
  });

  test("navigates to export page from primary nav", async ({ page }) => {
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Export" })
      .evaluate((el: HTMLElement) => el.click());
    await expect(page).toHaveURL(/\/export/);
  });

  test("renders critic feedback and accept/reject actions", async ({ page }) => {
    await page
      .getByRole("navigation", { name: "BRD sections" })
      .getByRole("button", { name: "05 Functional Requirements" })
      .click();
    await expect(page.getByText("API lacks versioning strategy.")).toBeVisible();
    await expect(page.getByRole("button", { name: /Accept changes/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Reject/i })).toBeVisible();
  });
});
