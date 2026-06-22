import { test, expect } from "@playwright/test";
import { stubAuth } from "./helpers-auth";
import { walkIntakeWizard } from "./helpers";

test("402 on generate shows the upgrade prompt", async ({ page }) => {
  await stubAuth(page);
  await page.route("**/api/generate", (route) =>
    route.fulfill({
      status: 402,
      contentType: "application/json",
      body: JSON.stringify({
        error: { code: "QUOTA_EXCEEDED", tier: "registered", remaining: 0 },
      }),
    })
  );

  await walkIntakeWizard(page);
  await page.getByRole("button", { name: "Generate BRD" }).click();

  await expect(page.getByText(/used your 3 free BRDs/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /upgrade/i })).toBeVisible();
});
