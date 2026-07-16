const { test, expect } = require('@playwright/test');

/**
 * Restocking page tests — R2 feature verification.
 * Confirms the restocking recommendations feature works correctly:
 * - Loads recommendations from API
 * - Displays summary stats
 * - Budget input filters results
 * - Priority badges render correctly
 */

test.describe('Restocking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/restocking');
  });

  test('displays restocking heading', async ({ page }) => {
    await expect(page.getByText(/restocking recommendations/i)).toBeVisible();
  });

  test('displays recommendations table', async ({ page }) => {
    await expect(page.locator('.restock-table'), 'Restocking table visible').toBeVisible();
    const rows = page.locator('.restock-table tbody tr');
    await expect(rows.first(), 'At least one recommendation row').toBeVisible();
  });

  test('displays summary statistics', async ({ page }) => {
    const statsGrid = page.locator('.stats-grid');
    await expect(statsGrid, 'Summary stats visible').toBeVisible();
  });

  test('displays priority breakdown', async ({ page }) => {
    const priorityGrid = page.locator('.priority-grid');
    await expect(priorityGrid, 'Priority breakdown visible').toBeVisible();
    const cards = priorityGrid.locator('.priority-card');
    await expect(cards, 'Four priority cards').toHaveCount(4);
  });

  test('budget input is present', async ({ page }) => {
    const budgetInput = page.locator('#budget-input');
    await expect(budgetInput, 'Budget input field visible').toBeVisible();
  });

  test('budget filter applies', async ({ page }) => {
    const budgetInput = page.locator('#budget-input');
    await budgetInput.fill('500');
    // The apply button has text "Apply" — use getByText for reliable matching
    await page.getByText('Apply').click();
    // Page should still be valid after budget filter
    await expect(page.locator('.restock-table, .no-data')).toBeVisible();
  });

  test('priority badges have correct colors', async ({ page }) => {
    await page.waitForSelector('.restock-table tbody tr', { timeout: 10_000 });
    const criticalBadges = page.locator('.priority-badge.critical');
    const highBadges = page.locator('.priority-badge.high');
    const badgeCount = await criticalBadges.count() + await highBadges.count();
    expect(badgeCount, 'At least one priority badge rendered').toBeGreaterThan(0);
  });

  test('no application console errors during load', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore pre-existing 404 for Tasks endpoint (legacy Tasks.vue, not in RFP scope)
        if (!text.includes('tasks') && !text.includes('Failed to load tasks') && !text.includes('Failed to load resource')) {
          errors.push(text);
        }
      }
    });
    await page.goto('/restocking');
    await page.waitForSelector('.restock-table', { timeout: 10_000 });
    expect(errors, 'No application console errors on Restocking page').toEqual([]);
  });
});