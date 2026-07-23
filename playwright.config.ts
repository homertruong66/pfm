import { defineConfig, devices } from "@playwright/test";

// Test artifacts live under tests/[feature-id]-[slug]/ per aif-sdlc.md's convention.
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
