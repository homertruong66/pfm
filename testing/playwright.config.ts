import { defineConfig, devices } from "@playwright/test";

// Runner for every feature: each testing/[feature-id]-[slug]/ folder (relative to this file) holds its
// test_[abbr].spec.ts and per-story verification evidence; test_cases.md lives in specs/[feature-id]-[slug]/.
export default defineConfig({
  testDir: ".",
  testMatch: "**/*.spec.ts",
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
