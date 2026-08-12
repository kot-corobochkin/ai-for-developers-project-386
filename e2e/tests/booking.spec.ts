import { expect, test } from "@playwright/test";

test.describe("публичное бронирование", () => {
  test("гость выбирает встречу, бронирует слот и видит её в админке", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Запланируйте время" })).toBeVisible();
    await expect(page.getByText("Короткая встреча", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: /Короткая встреча/ }).click();

    await expect(page.getByRole("heading", { name: "Короткая встреча" })).toBeVisible();
    await page.locator("button.day:not(:disabled)").nth(1).click();
    const slot = page.locator(".slot").first();
    await expect(slot).toBeVisible();
    const slotLabel = await slot.innerText();
    await slot.click();

    await page.getByLabel("Имя и фамилия").fill("Playwright Guest");
    await page.getByLabel("Email").fill("playwright@example.com");
    await page.getByRole("button", { name: "Подтвердить встречу" }).click();

    await expect(page.getByText("Встреча подтверждена")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Короткая встреча" })).toBeVisible();

    await page.getByRole("button", { name: "Управление" }).click();
    await page.getByRole("button", { name: "Бронирования" }).click();
    const bookingRow = page.locator(".table-row").filter({ hasText: "Playwright Guest" }).filter({ hasText: slotLabel });
    await expect(bookingRow).toHaveCount(1);
    await expect(bookingRow).toContainText("playwright@example.com");
  });

  test("после бронирования слот исчезает из доступных", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Короткая встреча/ }).click();
    await page.locator("button.day:not(:disabled)").nth(1).click();
    const slot = page.locator(".slot").first();
    await expect(slot).toBeVisible();
    const bookedSlotLabel = await slot.innerText();
    await slot.click();
    await page.getByLabel("Имя и фамилия").fill("First Guest");
    await page.getByLabel("Email").fill("first@example.com");
    await page.getByRole("button", { name: "Подтвердить встречу" }).click();
    await expect(page.getByText("Встреча подтверждена")).toBeVisible();

    await page.getByRole("button", { name: "Создать ещё одну встречу" }).click();
    await page.getByRole("button", { name: /Короткая встреча/ }).click();
    await expect(page.locator(".slot").first()).toBeVisible();

    // The previously selected slot is removed by the backend and must not be offered again.
    await expect(page.locator(".slot").filter({ hasText: bookedSlotLabel })).toHaveCount(0);
  });
});
