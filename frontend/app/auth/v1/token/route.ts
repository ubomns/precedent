/**
 * Mock Supabase Auth /auth/v1/token endpoint.
 *
 * Only reachable when NEXT_PUBLIC_SUPABASE_URL points at the local Next.js
 * server (i.e. in Playwright tests with NEXT_PUBLIC_SUPABASE_URL=http://localhost:3001).
 * In production the real Supabase URL is used and this route is never called.
 */

import { NextRequest, NextResponse } from "next/server";

const TEST_USER_ID = "11111111-1111-1111-1111-111111111111";
const TEST_EMAIL = "tester@example.com";

export async function POST(_request: NextRequest) {
  return NextResponse.json({
    access_token: "e2e-access-token",
    refresh_token: "e2e-refresh-token",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: "bearer",
    user: {
      id: TEST_USER_ID,
      aud: "authenticated",
      email: TEST_EMAIL,
      role: "authenticated",
      app_metadata: { provider: "email" },
      user_metadata: {},
      created_at: new Date().toISOString(),
    },
  });
}
