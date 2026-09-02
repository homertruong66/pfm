import { defineConfig, devices } from "@playwright/test";

// Test artifacts live under [feature-id]-[slug]/ (this file's own directory) per aif-sdlc.md's convention.
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
