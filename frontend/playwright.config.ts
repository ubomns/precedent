import { defineConfig, devices } from "@playwright/test";

process.env.NEXT_PUBLIC_API_SECRET_KEY ??= "test-secret";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // A single `next dev` server cold-compiles routes on first visit; too many
  // parallel workers all triggering compiles at once can starve navigations past
  // their assertion timeouts. Cap local concurrency to keep runs reliable.
  workers: process.env.CI ? 1 : 2,
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

  webServer: {
    command: "npx next dev -p 3001",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_API_SECRET_KEY: process.env.NEXT_PUBLIC_API_SECRET_KEY,
    },
  },
});
