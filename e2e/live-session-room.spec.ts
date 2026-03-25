import { expect,test } from "@playwright/test";

import { ADMIN_STORAGE, MEMBER_STORAGE } from "./fixtures/auth";
import { createTestSession, updateSessionStatus } from "./fixtures/session";
import { interceptDailyGetToken } from "./mocks/daily";

// ---------------------------------------------------------------------------
// Group 2: Waiting room behaviour
// ---------------------------------------------------------------------------

test.describe("Waiting room — audience (member)", () => {
  test.use({ storageState: MEMBER_STORAGE });

  test("lands in waiting room when session is scheduled", async ({ page }) => {
    const session = await createTestSession({ status: "scheduled" });
    try {
      await page.goto(`/live/${session.id}`);
      await expect(page.getByText(/Waiting for the session to begin/i)).toBeVisible();
    } finally {
      await session.cleanup();
    }
  });

  test("auto-advances to pre-join when session goes live", async ({ page }) => {
    const session = await createTestSession({ status: "scheduled" });
    try {
      await page.goto(`/live/${session.id}`);
      await expect(page.getByText(/Waiting for the session to begin/i)).toBeVisible();

      // Simulate admin clicking "Go Live"
      await updateSessionStatus(session.id, "live");

      // Polling runs every 5s — allow up to 10s for the UI to transition
      await interceptDailyGetToken(page, { role: "audience" });
      await expect(
        page.getByRole("button", { name: /Join Live Session/i })
      ).toBeVisible({ timeout: 10_000 });
    } finally {
      await session.cleanup();
    }
  });
});

test.describe("Waiting room — host (admin)", () => {
  test.use({ storageState: ADMIN_STORAGE });

  test("host bypasses waiting room and sees pre-join even when scheduled", async ({ page }) => {
    const session = await createTestSession({ status: "scheduled" });
    try {
      await interceptDailyGetToken(page, { role: "host" });
      await page.goto(`/live/${session.id}?role=host`);

      // Should see pre-join, not waiting room
      await expect(page.getByText(/Waiting for the session to begin/i)).not.toBeVisible();
      await expect(
        page.getByRole("button", { name: /Join to Test Setup/i })
      ).toBeVisible();
    } finally {
      await session.cleanup();
    }
  });
});

// ---------------------------------------------------------------------------
// Group 3: Error states & access control
// ---------------------------------------------------------------------------

test.describe("Error states", () => {
  test("unknown session UUID shows 'Session not found'", async ({ page }) => {
    await page.goto("/live/00000000-0000-0000-0000-000000000000");
    await expect(page.getByText(/Session not found/i)).toBeVisible();
  });

  test("expired guest token shows error after clicking join", async ({ page }) => {
    const guestToken = "expired-test-token";
    const session = await createTestSession({
      status: "live",
      guestToken,
      guestTokenExpired: true,
    });
    try {
      // Intercept the token request to return the same error our edge function would
      await interceptDailyGetToken(page, { errorMessage: "Guest link has expired" });

      await page.goto(`/live/${session.id}?role=guest&token=${guestToken}`);
      await page.getByRole("button", { name: /Join/i }).click();

      await expect(page.getByText(/Guest link has expired/i)).toBeVisible();
    } finally {
      await session.cleanup();
    }
  });

  test("non-member attempting to join a members-only session sees an error", async ({ page }) => {
    // No storageState — anonymous user
    const session = await createTestSession({ status: "live", accessLevel: "members" });
    try {
      await interceptDailyGetToken(page, { errorMessage: "Active membership required" });

      await page.goto(`/live/${session.id}`);
      await page.getByRole("button", { name: /Join Live Session/i }).click();

      await expect(page.getByText(/Active membership required/i)).toBeVisible();
    } finally {
      await session.cleanup();
    }
  });
});
