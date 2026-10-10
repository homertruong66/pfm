import { test, expect } from '@playwright/test';
import {
  API_BASE_URL,
  adminTokens,
  createUserAsAdmin,
  login,
  loginInBrowser,
  uniqueEmail,
} from '../support/api';

// UM-US-01: Create a User (ADMIN) — e2e automation for test_cases.md's [BOTH]/[UI] test cases
// (TC-02, TC-04, TC-06, TC-11, TC-13). Requires the frontend serving /users/new, the backend at
// API_BASE_URL, and an existing ADMIN account in E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD.
// Element IDs below are the NC-04 contract from plan.md: #user-full-name, #user-email, #user-password,
// #user-full-name-error, #user-email-error, #user-password-error, #btn-submit-user, #message-success,
// #message-error, #message-access-denied.

const PASSWORD = 'TestQC-Passw0rd!';

test.describe('UM-US-01: Create a User (ADMIN)', () => {
  test('TC-02: ADMIN creates a User through the Create User screen', async ({ page, request, browser }, testInfo) => {
    const email = uniqueEmail('um02');
    await loginInBrowser(page, await adminTokens(request));

    await page.goto('/users/new');
    await testInfo.attach('TC-02 before — Create User form', { body: await page.screenshot(), contentType: 'image/png' });

    await page.locator('#user-full-name').fill(`TestQC-user-${Date.now()}`);
    await page.locator('#user-email').fill(email);
    await page.locator('#user-password').fill(PASSWORD);
    await page.locator('#btn-submit-user').click();

    const success = page.locator('#message-success');
    await success.waitFor({ state: 'visible' });
    await expect(success).toContainText('User account created');
    await testInfo.attach('TC-02 after — success message', { body: await page.screenshot(), contentType: 'image/png' });

    // The new User can log in with the assigned email and initial password — through the Login page.
    const newUserContext = await browser.newContext();
    const loginPage = await newUserContext.newPage();
    await loginPage.goto('/login');
    await loginPage.locator('#login-email').fill(email);
    await loginPage.locator('#login-password').fill(PASSWORD);
    await loginPage.locator('#btn-submit-login').click();
    await loginPage.waitForURL((url) => url.pathname === '/');
    await expect(loginPage.locator('#nav-dashboard')).toBeVisible();
    await newUserContext.close();
  });

  test('TC-04: missing email shows "Email is required"', async ({ page, request }, testInfo) => {
    const createRequests: string[] = [];
    page.on('request', (req) => {
      if (req.method() === 'POST' && req.url().includes('/api/v1/users/')) createRequests.push(req.url());
    });
    await loginInBrowser(page, await adminTokens(request));

    await page.goto('/users/new');
    await page.locator('#user-full-name').fill(`TestQC-user-${Date.now()}`);
    await page.locator('#user-password').fill(PASSWORD);
    await page.locator('#btn-submit-user').click();

    const error = page.locator('#user-email-error');
    await error.waitFor({ state: 'visible' });
    await expect(error).toContainText('Email is required');
    await expect(page.locator('#message-success')).toHaveCount(0);
    expect(createRequests, 'no create request may be sent while a required field is empty').toHaveLength(0);
    await testInfo.attach('TC-04 step 1 — email required message', { body: await page.screenshot(), contentType: 'image/png' });
  });

  test('TC-06: an email already in use shows "Account already exists"', async ({ page, request }, testInfo) => {
    const existing = await createUserAsAdmin(request);
    await loginInBrowser(page, await adminTokens(request));

    await page.goto('/users/new');
    await page.locator('#user-full-name').fill(`TestQC-user-${Date.now()}`);
    await page.locator('#user-email').fill(existing.email);
    await page.locator('#user-password').fill(PASSWORD);
    await page.locator('#btn-submit-user').click();

    const error = page.locator('#message-error');
    await error.waitFor({ state: 'visible' });
    await expect(error).toContainText('Account already exists');
    await expect(page.locator('#message-success')).toHaveCount(0);
    await testInfo.attach('TC-06 step 1 — account already exists', { body: await page.screenshot(), contentType: 'image/png' });
  });

  test('TC-11: a USER opening the Create User screen is shown an access-denied message', async ({ page, request }, testInfo) => {
    const plainUser = await createUserAsAdmin(request);
    const attemptedEmail = uniqueEmail('um11');
    await loginInBrowser(page, await login(request, plainUser));

    await page.goto('/users/new');
    await page.locator('#user-full-name').fill(`TestQC-user-${Date.now()}`);
    await page.locator('#user-email').fill(attemptedEmail);
    await page.locator('#user-password').fill(PASSWORD);
    await page.locator('#btn-submit-user').click();

    const denied = page.locator('#message-access-denied');
    await denied.waitFor({ state: 'visible' });
    await expect(denied).toContainText('You do not have permission to create User accounts.');
    await expect(page.locator('#message-success')).toHaveCount(0);
    await testInfo.attach('TC-11 step 1 — access denied', { body: await page.screenshot(), contentType: 'image/png' });

    // The account was not created: logging in with those values is rejected.
    const res = await request.post(`${API_BASE_URL}/auth/login/`, { data: { email: attemptedEmail, password: PASSWORD } });
    expect(res.status()).toBe(401);
  });

  test('TC-13: missing full name and password show their messages', async ({ page, request }, testInfo) => {
    const createRequests: string[] = [];
    page.on('request', (req) => {
      if (req.method() === 'POST' && req.url().includes('/api/v1/users/')) createRequests.push(req.url());
    });
    await loginInBrowser(page, await adminTokens(request));

    await page.goto('/users/new');
    await page.locator('#user-email').fill(uniqueEmail('um13'));
    await page.locator('#btn-submit-user').click();

    const nameError = page.locator('#user-full-name-error');
    const passwordError = page.locator('#user-password-error');
    await nameError.waitFor({ state: 'visible' });
    await passwordError.waitFor({ state: 'visible' });
    await expect(nameError).toContainText('Full name is required');
    await expect(passwordError).toContainText('Password is required');
    expect(createRequests, 'no create request may be sent while a required field is empty').toHaveLength(0);
    await testInfo.attach('TC-13 step 1 — required field messages', { body: await page.screenshot(), contentType: 'image/png' });
  });
});
