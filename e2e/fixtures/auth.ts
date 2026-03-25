import path from "path";

export const ADMIN_STORAGE = path.resolve("e2e/.auth/admin.json");
export const MEMBER_STORAGE = path.resolve("e2e/.auth/member.json");

/**
 * Auth helpers. Use `test.use({ storageState: ADMIN_STORAGE })` inside a
 * describe block to run those tests as the admin role:
 *
 *   describe("admin flows", () => {
 *     test.use({ storageState: ADMIN_STORAGE });
 *     test("can join as host", async ({ page }) => { ... });
 *   });
 */
export { expect,test } from "@playwright/test";
