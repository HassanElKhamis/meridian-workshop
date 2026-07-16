const { test, expect } = require('@playwright/test');

/**
 * Navigation tests — verify all RFP critical flows are accessible.
 * Meridian's IT team requires automated coverage of every page load
 * and navigation link.
 */

test.describe('Navigation', () => {
  test('loads the Dashboard as the home page', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h2', { timeout: 10_000 });
    const heading = page.locator('h2').first();
    const text = await heading.textContent();
    expect(text.toLowerCase()).toContain('overview');
  });

  test('navigates to Inventory page', async ({ page }) => {
    await page.goto('/');
    await page.locator('a').filter({ hasText: /invent/i }).first().click();
    await expect(page).toHaveURL(/\/inventory/);
  });

  test('navigates to Orders page', async ({ page }) => {
    await page.goto('/');
    await page.locator('a').filter({ hasText: /order/i }).first().click();
    await expect(page).toHaveURL(/\/orders/);
  });

  test('navigates to Demand Forecast page', async ({ page }) => {
    await page.goto('/');
    await page.locator('a').filter({ hasText: /demand|forecast/i }).first().click();
    await expect(page).toHaveURL(/\/demand/);
  });

  test('navigates to Spending/Finance page', async ({ page }) => {
    await page.goto('/');
    await page.locator('a').filter({ hasText: /finance/i }).first().click();
    await expect(page).toHaveURL(/\/spending/);
  });

  test('navigates to Reports page', async ({ page }) => {
    await page.goto('/');
    await page.locator('a').filter({ hasText: /report/i }).first().click();
    await expect(page).toHaveURL(/\/reports/);
  });

  test('navigates to Restocking page', async ({ page }) => {
    await page.goto('/');
    await page.locator('a').filter({ hasText: /restock/i }).first().click();
    await expect(page).toHaveURL(/\/restocking/);
  });

  test('active nav link is highlighted', async ({ page }) => {
    await page.goto('/');
    const overviewLink = page.locator('a').filter({ hasText: /overview/i }).first();
    await expect(overviewLink, 'Overview link has active class').toHaveClass(/active/);
  });
});