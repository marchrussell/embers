import type { Page } from "@playwright/test";

/**
 * Injects a lightweight Daily.co mock before the page loads.
 *
 * The mock:
 * - Replaces `DailyIframe.createFrame` so no real iframe is created
 * - Simulates the `joined-meeting` event after a short delay so the
 *   app enters the "hasJoined" state
 * - Tracks `leave()` calls so tests can assert the leave flow
 *
 * Must be called before `page.goto()`.
 */
export async function mockDailyIframe(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const mockFrame = {
      _listeners: {} as Record<string, (() => void)[]>,
      on(event: string, cb: () => void) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(cb);
        // Simulate joined-meeting after a short delay
        if (event === "joined-meeting") {
          setTimeout(() => cb(), 150);
        }
        return this;
      },
      join: () => Promise.resolve(),
      leave() {
        // Trigger left-meeting so the app cleans up
        const cbs = this._listeners["left-meeting"] ?? [];
        cbs.forEach((cb) => cb());
      },
      destroy: () => {},
    };

    // @ts-ignore — override before the ESM bundle loads
    window.DailyIframe = {
      createFrame: () => mockFrame,
    };
  });
}

/**
 * Intercepts the `daily-get-token` Supabase edge function call and returns
 * a synthetic token response. This prevents hitting the real edge function
 * and avoids needing a live Daily.co room.
 *
 * Call after `page.goto()` is not yet invoked (routes are set up before navigation).
 */
export async function interceptDailyGetToken(
  page: Page,
  overrides: {
    role?: "host" | "guest" | "audience";
    waitingRoom?: boolean;
    errorMessage?: string;
  } = {}
): Promise<void> {
  await page.route(
    /\/functions\/v1\/daily-get-token/,
    async (route) => {
      if (overrides.errorMessage) {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({ error: overrides.errorMessage }),
        });
        return;
      }

      if (overrides.waitingRoom) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ waitingRoom: true }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          token: "test-token-abc123",
          roomUrl: "https://march.daily.co/test-room",
          role: overrides.role ?? "audience",
        }),
      });
    }
  );
}
