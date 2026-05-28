import { test, expect } from "@playwright/test";

test.describe("Intake Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/intake");
  });

  test("renders intake form fields", async ({ page }) => {
    await expect(page.getByPlaceholder(/What is the project trying/i)).toBeVisible();
    await expect(page.getByPlaceholder(/What\'s in scope/i)).toBeVisible();
    await expect(page.getByPlaceholder(/What\'s out/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Who will use what/i)).toBeVisible();
    await expect(page.getByPlaceholder(/Standards, jurisdictions/i)).toBeVisible();
  });

  test("submits intake form and navigates to review", async ({ page }) => {
    // Fill form
    await page.getByPlaceholder(/What is the project trying/i).fill("Expose core banking API to partners");
    await page.getByPlaceholder(/What\'s in scope/i).fill("Account read/write\nPayment initiation");
    await page.getByPlaceholder(/What\'s out/i).fill("Retail UI\nFX execution");
    await page.getByPlaceholder(/Who will use what/i).fill("Engineering teams at fintech partners");
    await page.getByPlaceholder(/Standards, jurisdictions/i).fill("PSD2, GDPR, FCA");

    // Mock the generate API so we don't actually call OpenAI
    await page.route("**/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          brd: {
            executive_summary: {
              content: { narrative: "Test executive summary." },
              feedback: [],
            },
            business_objective: {
              content: { narrative: "Test business objective." },
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
                ],
              },
              feedback: [],
            },
            non_functional_requirements: {
              content: {
                requirements: [
                  { category: "Security", requirement: "OAuth2", metric: "100%" },
                ],
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
                criteria: [
                  { requirement_id: "AC-01", criteria: "API must expose endpoints" },
                ],
              },
              feedback: [],
            },
            user_access_management: {
              content: {
                roles: [
                  { role: "Partner Engineer", permissions: "Read/Write", iam_group: "partners" },
                ],
              },
              feedback: [],
            },
            security_controls: {
              content: {
                controls: [
                  { domain: "Auth", control: "OAuth2", implementation: "JWT" },
                ],
              },
              feedback: [],
            },
            benefits_realization: {
              content: {
                benefits: [
                  { benefit: "Faster integration", measurement: "40% faster", timeline: "6 months" },
                ],
              },
              feedback: [],
            },
          },
        }),
      });
    });

    await page.getByRole("button", { name: /Generate BRD/i }).click();

    // Wait for navigation to review
    await expect(page).toHaveURL(/\/review/, { timeout: 10000 });
    await expect(page.getByRole("heading", { name: "Executive Summary" })).toBeVisible();
  });

  test("validates required fields", async ({ page }) => {
    await page.getByRole("button", { name: /Generate BRD/i }).click();
    // Should stay on intake page due to HTML5 validation
    await expect(page).toHaveURL(/\/intake/);
  });
});
