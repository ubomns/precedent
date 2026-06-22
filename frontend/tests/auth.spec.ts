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

test.describe("Auth forms", () => {
  test("login shows validation on empty submit", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByText("Email is required.")).toBeVisible();
  });

  test("signup success shows check-your-email", async ({ page }) => {
    await page.route("**/auth/v1/signup**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ user: { id: "x" }, session: null }),
      })
    );
    await page.goto("/signup");
    await page.getByLabel("Email").fill("new@example.com");
    await page.getByLabel("Password").fill("supersecret1");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText(/check your email/i)).toBeVisible();
  });
});

test.describe("Password reset", () => {
  test("forgot-password submits and confirms", async ({ page }) => {
    await page.route("**/auth/v1/recover**", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
    );
    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill("a@b.com");
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByText(/check your email/i)).toBeVisible();
  });
});

test.describe("Nav auth state", () => {
  test("shows Sign in when logged out", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  });

  test("shows Log out when authenticated", async ({ page }) => {
    await stubAuth(page);
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Log out" })).toBeVisible();
  });
});
