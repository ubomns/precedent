import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // The suite runs against a single `next dev` server that cold-compiles routes
  // on first visit. Parallel workers all triggering compiles at once intermittently
  // starve navigations (even `page.goto`) past their timeouts, so run serially.
  // Fast enough for this suite (~3 min) and deterministic regardless of machine load.
  workers: 1,
  reporter: "html",
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], reducedMotion: "reduce" } as any,
    },
  ],

  webServer: [
    {
      command: "npx next dev -p 3001",
      url: "http://localhost:3001",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "stub-anon-key",
      },
    },
    {
      command: "node tests/mock-supabase-server.mjs",
      port: 54321,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
