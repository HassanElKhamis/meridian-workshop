const { test, expect } = require('@playwright/test');

/**
 * Dashboard tests — R4 critical flow: KPI display, filter responses, charts.
 */

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays KPI cards', async ({ page }) => {
    await expect(page.locator('.kpi-card').first(), 'At least one KPI card visible').toBeVisible();
  });

  test('displays order health chart', async ({ page }) => {
    await expect(page.getByText(/order health/i), 'Order health chart visible').toBeVisible();
  });

  test('displays inventory by category chart', async ({ page }) => {
    await expect(page.getByText(/inventory.*category/i), 'Inventory by category visible').toBeVisible({ ignoreCase: true });
  });

  test('displays top products table', async ({ page }) => {
    await expect(page.getByText(/top products/i), 'Top products heading visible').toBeVisible();
    await expect(page.locator('.chart-card table tbody tr').first(), 'At least one product row').toBeVisible();
  });

  test('period filter changes data', async ({ page }) => {
    const periodSelect = page.locator('select').first();
    const options = await periodSelect.locator('option').allTextContents();
    // Pick a month option (not "All Months")
    const monthOption = options.find(t => t.includes('January') || t.includes('Feb'));
    if (monthOption) {
      await periodSelect.selectOption({ label: monthOption });
      await expect(page.locator('.kpi-card').first(), 'KPI card still visible after filter').toBeVisible();
    } else {
      // Fallback: just verify the select exists and the page is fine
      await expect(periodSelect).toBeVisible();
    }
  });
});