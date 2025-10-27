import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('Admin flow with live preview mirrors public listing', async ({ page }) => {
    await page.goto('/admin');

    await expect(page.locator('text=Live preview')).toBeVisible();

    await page.fill('[data-testid="name-input"]', 'Smoke Test Testnet');
    await page.fill('[data-testid="network-input"]', 'Smoke Network');

    await page.click('[data-testid="status-select"]');
    await page.click('text=UPCOMING');

    await page.click('[data-testid="difficulty-select"]');
    await page.click('text=EASY');

    await page.fill('textarea[name="gettingStarted.0.body"]', 'Install the CLI and authenticate.');
    await expect(page.locator('aside').filter({ hasText: 'Install the CLI and authenticate.' })).toBeVisible();

    await page.click('button[type="submit"]');
    await expect(page.locator('text=Changes saved')).toBeVisible();

    await page.goto('/testnets');
    await expect(page.locator('text=Testnet Programs')).toBeVisible();

    const testnetRow = page.locator('tbody tr').filter({ hasText: 'Smoke Test Testnet' }).first();
    await testnetRow.focus();
    await testnetRow.press('Enter');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await page.keyboard.press('Escape');

    await page.goto('/admin');
    await page.click('text=Smoke Test Testnet');
    await page.fill('[data-testid="name-input"]', 'Smoke Test Testnet Updated');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Changes saved')).toBeVisible();

    await page.goto('/testnets');
    await expect(
      page.locator('tbody tr').filter({ hasText: 'Smoke Test Testnet Updated' })
    ).toHaveCount(1);
  });

  test('Header shortcuts focus search and apply filters', async ({ page }) => {
    await page.goto('/testnets');
    await expect(page.locator('text=Testnet Programs')).toBeVisible();

    await page.keyboard.press('/');
    const searchInput = page.locator('header input[type="search"]').first();
    await expect(searchInput).toBeFocused();

    await searchInput.fill('network');
    await page.keyboard.press('Enter');
    await expect.poll(() => page.url()).toContain('q=network');

    await page.keyboard.press('Escape');
    await expect.poll(() => page.url()).not.toContain('q=network');

    await page.click('#status-select');
    await page.click('text=LIVE');
    await page.click('button:has-text("Apply")');
    await expect.poll(() => page.url()).toContain('status=LIVE');
  });

  test('Drawer synchronises with URL state', async ({ page }) => {
    await page.goto('/testnets');
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    await expect.poll(() => page.url()).toContain('slug=');

    await page.reload();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect.poll(() => page.url()).not.toContain('slug=');
  });
});
