import { expect, APIRequestContext, Page } from '@playwright/test';

// Shared API helpers for the e2e suites. Accounts are created the way the product allows it:
// an ADMIN (credentials supplied through the environment — nothing is seeded) calls
// POST /api/v1/users/ (UM-US-01). See plan.md (002-user-management) G8/A3.

export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api/v1';

export type Credentials = { email: string; password: string };
export type Tokens = { access: string; refresh: string };

export function adminCredentials(): Credentials {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      'E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD must be set to an existing ADMIN account ' +
        '(python manage.py createsuperuser) — the e2e suites create their test Users through UM-US-01.'
    );
  }
  return { email, password };
}

export async function login(request: APIRequestContext, creds: Credentials): Promise<Tokens> {
  const res = await request.post(`${API_BASE_URL}/auth/login/`, { data: creds });
  expect(res.status(), `login failed for ${creds.email}: ${await res.text()}`).toBe(200);
  return (await res.json()) as Tokens;
}

export async function adminTokens(request: APIRequestContext): Promise<Tokens> {
  return login(request, adminCredentials());
}

export function uniqueEmail(prefix = 'user'): string {
  return `testqc-${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}@example.com`;
}

// Creates a USER account through the ADMIN-only endpoint and returns its credentials.
export async function createUserAsAdmin(
  request: APIRequestContext,
  overrides: Partial<{ full_name: string; email: string; password: string }> = {}
): Promise<Credentials & { id: number; full_name: string }> {
  const admin = await adminTokens(request);
  const payload = {
    full_name: overrides.full_name ?? `TestQC-user-${Date.now()}`,
    email: overrides.email ?? uniqueEmail(),
    password: overrides.password ?? 'TestQC-Passw0rd!',
  };
  const res = await request.post(`${API_BASE_URL}/users/`, {
    data: payload,
    headers: { Authorization: `Bearer ${admin.access}` },
  });
  expect(res.status(), `seed user creation failed: ${await res.text()}`).toBe(201);
  const body = await res.json();
  return { id: body.id, full_name: payload.full_name, email: payload.email, password: payload.password };
}

// Puts a token pair where the frontend looks for it (SS-US-01), so a test can start already logged in.
export async function loginInBrowser(page: Page, tokens: Tokens): Promise<void> {
  await page.addInitScript(({ access, refresh }) => {
    window.localStorage.setItem('pfm_access_token', access);
    window.localStorage.setItem('pfm_refresh_token', refresh);
  }, tokens);
}
