/**
 * Global setup: logs in as each test role and saves browser storage state.
 * Runs once before all tests. Requires .env.test with valid credentials.
 */
import {test as setup } from "@playwright/test";
import path from "path";

const ADMIN_STORAGE = path.resolve("e2e/.auth/admin.json");
const MEMBER_STORAGE = path.resolve("e2e/.auth/member.json");

/**
 * Sign in via the Embers login page and save the resulting localStorage/cookies.
 * Supabase stores the session in localStorage under "sb-*-auth-token".
 */
async function signIn(
  page: Parameters<Parameters<typeof setup>[1]>[0],
  email: string,
  password: string,
  storagePath: string
) {
  await page.goto("/auth");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  // Wait until redirected away from /auth
  await page.waitForURL((url) => !url.pathname.startsWith("/auth"), {
    timeout: 10_000,
  });
  await page.context().storageState({ path: storagePath });
}

setup("authenticate as admin", async ({ page }) => {
  await signIn(
    page,
    process.env.TEST_ADMIN_EMAIL!,
    process.env.TEST_ADMIN_PASSWORD!,
    ADMIN_STORAGE
  );
});

setup("authenticate as member", async ({ page }) => {
  await signIn(
    page,
    process.env.TEST_MEMBER_EMAIL!,
    process.env.TEST_MEMBER_PASSWORD!,
    MEMBER_STORAGE
  );
});
