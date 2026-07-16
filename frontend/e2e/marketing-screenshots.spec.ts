import path from "node:path";
import fs from "node:fs/promises";
import { test, type Page } from "@playwright/test";

const screenshotDir = path.resolve(process.cwd(), "..", "docs", "assets", "screenshots");

async function ensureDir() {
  await fs.mkdir(screenshotDir, { recursive: true });
}

async function save(page: Page, name: string) {
  await page.screenshot({ path: path.join(screenshotDir, `${name}.png`), fullPage: true });
}

test("capture marketplace screenshots", async ({ page }) => {
  await ensureDir();

  await page.goto("/");
  await save(page, "01-home");

  await page.goto("/login");
  await save(page, "02-login");

  await page.getByLabel("Email").fill("customer@northstar.local");
  await page.getByLabel("Password").fill("DemoPass123!");
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL(/dashboard/);
  await save(page, "03-dashboard");

  await page.goto("/resources");
  await save(page, "04-resources");

  await page.getByRole("link", { name: /view details/i }).first().click();
  await page.waitForLoadState("networkidle");
  await save(page, "05-resource-detail");

  await page.goto("/bookings");
  await page.waitForLoadState("networkidle");
  await save(page, "06-bookings");

  const browser = page.context().browser();
  if (!browser) {
    throw new Error("Browser instance was not available for admin screenshot capture.");
  }

  const adminContext = await browser.newContext({ baseURL: "http://localhost:3000" });
  const adminPage = await adminContext.newPage();

  await adminPage.goto("/login");
  await adminPage.getByLabel("Email").fill("admin@northstar.local");
  await adminPage.getByLabel("Password").fill("DemoPass123!");
  await adminPage.getByRole("button", { name: /log in/i }).click();
  await adminPage.waitForURL(/dashboard/);
  await adminPage.goto("/admin");
  await adminPage.waitForLoadState("networkidle");
  await save(adminPage, "07-admin");

  await adminContext.close();
});
