import { defineConfig, devices } from "@playwright/test";

// Runner for every feature: each e2e/[feature-id]-[slug]/ folder (relative to this file) holds its
// test_cases.md and test_[abbr].spec.ts, per aif-sdlc.md's convention.
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
