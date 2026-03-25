import { defineConfig, devices } from "@playwright/test";
import path from "path";

// Load .env.test before anything else so fixtures can read credentials
// process.loadEnvFile is available in Node.js 20.6+
try {
  process.loadEnvFile(path.resolve(".env.test"));
} catch {
  // Ignore if file doesn't exist (e.g. CI uses real env vars)
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // Live session tests share Supabase state — run serially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "html",

  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },

  projects: [
    // Setup project: creates auth state files for each role
    {
      name: "setup",
      testMatch: /global\.setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Default to anonymous (no storageState) — tests override per role
      },
      dependencies: ["setup"],
    },
  ],

  // Auto-start dev server when running tests
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
