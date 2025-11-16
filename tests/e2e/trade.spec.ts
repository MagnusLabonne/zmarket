import { test, expect } from "@playwright/test";

test.describe("ZRC market surface", () => {
  test("renders hero and trading modules", async ({ page }) => {
    await page.goto("/zcash");
    await expect(page.getByRole("heading", { name: "Zcash ZRC-20 Orderbok" })).toBeVisible();
    await expect(page.getByRole("button", { name: /connect wallet/i })).toBeVisible();
    await expect(page.getByText("Öppna order")).toBeVisible();
    await expect(page.getByText("Ordertyp")).toBeVisible();
    await expect(page.getByText("Handelshistorik")).toBeVisible();
  });
});

