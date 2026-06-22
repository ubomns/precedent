/**
 * Mock Supabase Auth /auth/v1/user endpoint.
 *
 * Only reachable when NEXT_PUBLIC_SUPABASE_URL points at the local Next.js
 * server (i.e. in Playwright tests with NEXT_PUBLIC_SUPABASE_URL=http://localhost:3001).
 * In production the real Supabase URL is used and this route is never called.
 *
 * Returns the test user object when the Authorization header carries the E2E
 * test access token, and 401 for any other token.
 */

import { NextRequest, NextResponse } from "next/server";

const E2E_TOKEN = "e2e-access-token";
const TEST_USER_ID = "11111111-1111-1111-1111-111111111111";
const TEST_EMAIL = "tester@example.com";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");

  if (token !== E2E_TOKEN) {
    return NextResponse.json(
      { message: "invalid JWT", error: "invalid_jwt" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    id: TEST_USER_ID,
    aud: "authenticated",
    email: TEST_EMAIL,
    role: "authenticated",
    app_metadata: { provider: "email" },
    user_metadata: {},
    created_at: new Date().toISOString(),
  });
}
