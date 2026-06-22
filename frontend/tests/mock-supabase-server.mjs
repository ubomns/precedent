/**
 * Standalone mock Supabase Auth server for E2E tests.
 *
 * Used by Playwright as a webServer entry so the Next.js middleware's
 * server-side `supabase.auth.getUser()` (which fetches SUPABASE_URL/auth/v1/user
 * on the server, NOT in the browser) has a real HTTP endpoint to talk to.
 *
 * Run directly: node tests/mock-supabase-server.mjs
 * Playwright starts it automatically via the webServer array in playwright.config.ts.
 *
 * Routes:
 *   GET  /auth/v1/user   – validates Bearer token; returns test user or 401
 *   POST /auth/v1/token  – returns a test session (any body/grant type)
 *   *                    – 404
 */

import { createServer } from "node:http";

const PORT = 54321;

const TEST_USER = {
  id: "11111111-1111-1111-1111-111111111111",
  aud: "authenticated",
  email: "tester@example.com",
  role: "authenticated",
  app_metadata: { provider: "email" },
  user_metadata: {},
  created_at: new Date().toISOString(),
};

const E2E_TOKEN = "e2e-access-token";

function makeSession() {
  return {
    access_token: E2E_TOKEN,
    refresh_token: "e2e-refresh-token",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: "bearer",
    user: TEST_USER,
  };
}

function send(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(json),
  });
  res.end(json);
}

const server = createServer((req, res) => {
  const url = req.url ?? "";
  const method = req.method ?? "GET";

  // GET /auth/v1/user — validate Bearer token
  if (method === "GET" && url.startsWith("/auth/v1/user")) {
    const auth = req.headers["authorization"] ?? "";
    const token = auth.replace(/^Bearer\s+/i, "").trim();
    if (token === E2E_TOKEN) {
      send(res, 200, TEST_USER);
    } else {
      send(res, 401, { message: "invalid JWT" });
    }
    return;
  }

  // POST /auth/v1/token — return a session (any grant type)
  if (method === "POST" && url.startsWith("/auth/v1/token")) {
    send(res, 200, makeSession());
    return;
  }

  // Everything else
  send(res, 404, { message: "not found" });
});

server.listen(PORT, () => {
  console.log(`Mock Supabase server listening on http://localhost:${PORT}`);
});
