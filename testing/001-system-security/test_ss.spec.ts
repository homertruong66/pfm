import { test, expect } from '@playwright/test';
import { createUserAsAdmin } from '../support/api';

// SS-US-01: Login — e2e automation for test_cases.md's [BOTH]/[UI] test cases (TC-02, TC-04, TC-08).
// Requires: frontend dev server serving /login (see plan.md's Structure Decision) and the
// backend reachable at API_BASE_URL. Element IDs below are the NC-04 contract this suite
// pins for the Implementation Step: #login-email, #login-password, #btn-submit-login, #message-error.

// Accounts are created through the ADMIN-only POST /api/v1/users/ (UM-US-01) by the shared helper —
// it needs E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD (an existing ADMIN account).

test.describe('SS-US-01: Login', () => {
  test('TC-02: valid credentials log the User in and reach the Dashboard', async ({ page, request }, testInfo) => {
    const user = await createUserAsAdmin(request);

    await page.goto('/login');
    await testInfo.attach('TC-02 before — login form', { body: await page.screenshot(), contentType: 'image/png' });

    await page.locator('#login-email').fill(user.email);
    await page.locator('#login-password').fill(user.password);
    await page.locator('#btn-submit-login').click();

    // Lands on the Dashboard (its sidebar entry is rendered) and the token pair is stored for later requests.
    await page.waitForURL((url) => url.pathname === '/');
    await expect(page.locator('#nav-dashboard')).toBeVisible();
    expect(await page.evaluate(() => window.localStorage.getItem('pfm_access_token'))).toBeTruthy();
    expect(await page.evaluate(() => window.localStorage.getItem('pfm_refresh_token'))).toBeTruthy();
    await testInfo.attach('TC-02 after — redirected off Login', { body: await page.screenshot(), contentType: 'image/png' });
  });

  test('TC-04: invalid credentials show the generic inline error', async ({ page, request }, testInfo) => {
    const user = await createUserAsAdmin(request);

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
    const loginRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/auth/login/')) loginRequests.push(req.url());
    });

    await page.goto('/login');
    // Only the field under test (password) is left empty; the email is filled.
    await page.locator('#login-email').fill('someone@example.com');
    await page.locator('#btn-submit-login').click();

    const error = page.locator('#message-error');
    await error.waitFor({ state: 'visible' });
    await expect(error).toContainText('Email and password are required.');
    expect(loginRequests, 'validation must happen before any login request is sent').toHaveLength(0);
    await testInfo.attach('TC-08 step 1 — validation error for missing password', { body: await page.screenshot(), contentType: 'image/png' });
  });
});
