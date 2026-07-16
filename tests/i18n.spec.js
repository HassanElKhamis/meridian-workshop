const { test, expect } = require('@playwright/test');

/**
 * i18n tests — verify language switching works and translations apply.
 * Dashboard heading in Japanese is '概要' (Overview), not 'ダッシュボード'.
 */

test.describe('i18n / Language', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows language selector button', async ({ page }) => {
    const langButton = page.locator('.language-switcher .language-button');
    await expect(langButton, 'Language switcher button visible').toBeVisible();
  });

  test('switching to Japanese changes page content', async ({ page }) => {
    await page.locator('.language-button').click();
    await page.waitForTimeout(300);
    await page.locator('.dropdown-item').filter({ hasText: '日本語' }).click();
    await page.waitForTimeout(500);
    // Dashboard heading in Japanese is '概要' (Overview)
    const heading = page.locator('h2').first();
    const text = await heading.textContent();
    expect(text).toContain('概要');
  });

  test('switching back to English restores labels', async ({ page }) => {
    // Switch to Japanese
    await page.locator('.language-button').click();
    await page.waitForTimeout(300);
    await page.locator('.dropdown-item').filter({ hasText: '日本語' }).click();
    await page.waitForTimeout(500);

    // Switch back to English
    await page.locator('.language-button').click();
    await page.waitForTimeout(300);
    await page.locator('.dropdown-item').filter({ hasText: 'English' }).click();
    await page.waitForTimeout(500);

    // Should see English heading again
    const heading = page.locator('h2').first();
    const text = await heading.textContent();
    expect(text.toLowerCase()).toContain('overview');
  });
});