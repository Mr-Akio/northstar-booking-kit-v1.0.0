import { expect, test } from "@playwright/test";

test("customer can log in, browse a resource, create a booking, and cancel it", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("customer@northstar.local");
  await page.getByLabel("Password").fill("DemoPass123!");
  await page.getByRole("button", { name: /log in/i }).click();

  await expect(page).toHaveURL(/dashboard/);

  await page.goto("/resources");
  await page.getByRole("link", { name: /view details/i }).first().click();
  await page.getByRole("link", { name: /book this resource/i }).click();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const start = new Date(tomorrow);
  start.setHours(10, 0, 0, 0);
  const end = new Date(tomorrow);
  end.setHours(12, 0, 0, 0);
  const toLocalInput = (value: Date) => {
    const pad = (part: number) => String(part).padStart(2, "0");
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
  };

  await page.getByLabel("Start").fill(toLocalInput(start));
  await page.getByLabel("End").fill(toLocalInput(end));
  await page.getByLabel("Guests").fill("2");
  await page.getByLabel("Notes").fill("Playwright booking flow");
  await page.getByRole("button", { name: /create booking/i }).click();

  await expect(page).toHaveURL(/booking-confirmation/);
  await page.getByRole("link", { name: /go to my bookings/i }).click();

  await expect(page).toHaveURL(/bookings$/);
  await page.getByRole("link", { name: /view details/i }).first().click();
  await page.getByRole("button", { name: /cancel booking/i }).click();
  await expect(page.getByText(/^Cancelled$/).first()).toBeVisible();
});
