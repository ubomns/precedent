import { type Page } from "@playwright/test";

export const TEST_USER_ID = "11111111-1111-1111-1111-111111111111";
export const TEST_EMAIL = "tester@example.com";
// Any non-empty string; FastAPI is mocked in E2E, so the token is never verified.
export const TEST_ACCESS_TOKEN = "e2e-access-token";

const PROJECT_REF = "localhost"; // matches NEXT_PUBLIC_SUPABASE_URL=http://localhost:3001

function fakeSession() {
  return {
    access_token: TEST_ACCESS_TOKEN,
    refresh_token: "e2e-refresh-token",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: "bearer",
    user: {
      id: TEST_USER_ID,
      aud: "authenticated",
      email: TEST_EMAIL,
      role: "authenticated",
    },
  };
}

/**
 * Make the browser appear authenticated to both the middleware (server-side
 * getUser) and the browser client (getSession), without a real Supabase project.
 *
 * Strategy: intercept the only Supabase auth REST calls the app makes, and seed
 * the @supabase/ssr session cookie. If a future @supabase/ssr upgrade changes the
 * cookie encoding, the smoke test below fails loudly — update encodeCookie here.
 *
 * Cookie encoding: @supabase/ssr 0.12.0 defaults cookieEncoding="base64url".
 * The stored value is "base64-" + base64url(JSON.stringify(session)) where
 * base64url uses the URL-safe alphabet (- and _ instead of + and /) with no
 * padding. Node's Buffer.toString("base64url") produces this exact encoding.
 */
export async function stubAuth(page: Page) {
  await page.route("**/auth/v1/user**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(fakeSession().user),
    })
  );
  await page.route("**/auth/v1/token**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(fakeSession()),
    })
  );

  // @supabase/ssr 0.12.0 uses base64url encoding (URL-safe base64, no padding).
  // Buffer.toString("base64url") produces the correct URL-safe base64 encoding.
  const cookieValue = `base64-${Buffer.from(
    JSON.stringify(fakeSession())
  ).toString("base64url")}`;

  await page.context().addCookies([
    {
      name: `sb-${PROJECT_REF}-auth-token`,
      value: cookieValue,
      domain: "localhost",
      path: "/",
      httpOnly: false,
      sameSite: "Lax",
    },
  ]);
}
