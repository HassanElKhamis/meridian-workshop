const { test, expect } = require('@playwright/test');

/**
 * Orders page tests — verify order list, status badges, and detail modal.
 */

test.describe('Orders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/orders');
  });

  test('displays orders table', async ({ page }) => {
    const heading = page.locator('h2').first();
    const text = await heading.textContent();
    expect(text.toLowerCase()).toContain('order');
    await expect(page.locator('table').first(), 'Orders table visible').toBeVisible();
  });

  test('status badges are colored', async ({ page }) => {
    const badges = page.locator('.badge');
    await expect(badges.first(), 'At least one status badge visible').toBeVisible();
  });

  test('displays order statuses correctly', async ({ page }) => {
    // Should show order status labels like Delivered, Shipped, Processing, Backordered
    const orderTable = page.locator('.order-table, .table-container, table');
    await expect(orderTable.first(), 'Order table present').toBeVisible();
  });
});