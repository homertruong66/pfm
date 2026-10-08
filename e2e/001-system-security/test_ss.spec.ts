import { test, expect, APIRequestContext } from '@playwright/test';

// SS-US-01: Login — e2e automation for test_cases.md's [BOTH]/[UI] test cases (TC-02, TC-04, TC-08).
// Requires: frontend dev server serving /login (see plan.md's Structure Decision) and the
// backend reachable at API_BASE_URL. Element IDs below are the NC-04 contract this suite
// pins for the Implementation Step: #login-email, #login-password, #btn-submit-login, #message-error.

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api/v1';

async function createTestUser(
  request: APIRequestContext,
  overrides: Partial<{ username: string; email: string; password: string; is_active: boolean }> = {}
) {
  const stamp = Date.now();
  const payload = {
    username: overrides.username ?? `TestQC-user-${stamp}`,
    email: overrides.email ?? `testqc-user-${stamp}@example.com`,
    password: overrides.password ?? 'TestQC-Passw0rd!',
  };
  const res = await request.post(`${API_BASE_URL}/users/`, { data: payload });
  expect(res.ok(), `seed user creation failed: ${res.status()} ${await res.text()}`).toBeTruthy();
  const body = await res.json();
  return { ...payload, id: body.id };
}

test.describe('SS-US-01: Login', () => {
  test('TC-02: valid credentials log the User in and reach the Dashboard', async ({ page, request }, testInfo) => {
    const user = await createTestUser(request);

    await page.goto('/login');
    await testInfo.attach('TC-02 before — login form', { body: await page.screenshot(), contentType: 'image/png' });

    await page.locator('#login-email').fill(user.email);
    await page.locator('#login-password').fill(user.password);
    await page.locator('#btn-submit-login').click();

    await expect(page).not.toHaveURL(/\/login$/);
    await testInfo.attach('TC-02 after — redirected off Login', { body: await page.screenshot(), contentType: 'image/png' });
  });

  test('TC-04: invalid credentials show the generic inline error', async ({ page, request }, testInfo) => {
    const user = await createTestUser(request);

    await page.goto('/login');
    await page.locator('#login-email').fill(user.email);
    await page.locator('#login-password').fill('WrongPassword!123');
    await page.locator('#btn-submit-login').click();

    const error = page.locator('#message-error');
    await error.waitFor({ state: 'visible' });
    await expect(error).toContainText('Invalid email or password.');
    await expect(page).toHaveURL(/\/login$/);
    await testInfo.attach('TC-04 step 1 — generic error shown', { body: await page.screenshot(), contentType: 'image/png' });
  });

  test('TC-08: missing password is caught by inline validation before submit', async ({ page }, testInfo) => {
    await page.goto('/login');
    // Fill every other required field first so only the field under test is empty.
    await page.locator('#login-email').fill('someone@example.com');
    await page.locator('#btn-submit-login').click();

    const error = page.locator('#message-error');
    await error.waitFor({ state: 'visible' });
    await expect(error).toContainText('Email and password are required.');
    await testInfo.attach('TC-08 step 1 — validation error for missing password', { body: await page.screenshot(), contentType: 'image/png' });
  });
});
