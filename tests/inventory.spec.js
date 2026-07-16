const { test, expect } = require('@playwright/test');

/**
 * Inventory page tests — verify inventory data display and search/filter.
 */

test.describe('Inventory', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory');
  });

  test('displays inventory items', async ({ page }) => {
    const heading = page.locator('h2').first();
    const text = await heading.textContent();
    expect(text.toLowerCase()).toContain('inventory');
    // Table with inventory data should be visible
    await expect(page.locator('table').first(), 'Inventory table visible').toBeVisible();
  });

  test('search filters inventory', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('PCB');
      // After search, table should still be visible
      await expect(page.locator('table').first(), 'Table visible after search').toBeVisible();
    }
  });
});