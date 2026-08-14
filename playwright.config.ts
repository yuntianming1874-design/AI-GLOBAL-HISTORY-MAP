import { defineConfig, devices } from "@playwright/test";

/**
 * E2E suite for the three V0.2 demo flows + hydration checks.
 * Runs against a production build on port 3100 (kept separate from any
 * dev/prod server on 3000).
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npx next start -p 3100",
    url: "http://localhost:3100",
    timeout: 240_000,
    reuseExistingServer: true,
    stdout: "pipe",
  },
});
