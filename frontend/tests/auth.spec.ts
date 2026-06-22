import { test, expect } from "@playwright/test";
import { stubAuth } from "./helpers-auth";

test.describe("Route protection", () => {
  test("logged-out visitor to /intake is redirected to /login?next=", async ({
    page,
  }) => {
    await page.goto("/intake");
    await expect(page).toHaveURL(/\/login\?next=%2Fintake/);
  });

  test("stubAuth lets an authenticated visitor reach /intake", async ({
    page,
  }) => {
    await stubAuth(page);
    await page.goto("/intake");
    await expect(page).toHaveURL(/\/intake/);
    await expect(
      page.getByText("What are you building, and why now?")
    ).toBeVisible();
  });
});
