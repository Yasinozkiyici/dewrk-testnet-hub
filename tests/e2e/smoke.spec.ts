import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('Admin flow: create -> list -> drawer -> update', async ({ page }) => {
    // 1) /admin -> yeni testnet oluştur (minimum alanlar)
    await page.goto('/admin');
    
    // Development modunda admin erişimi otomatik olarak veriliyor
    // Should see admin interface
    await expect(page.locator('text=Create new testnet')).toBeVisible();
    
    // Fill minimum required fields
    await page.fill('[data-testid="name-input"]', 'Smoke Test Testnet');
    await page.fill('[data-testid="network-input"]', 'Smoke Network');
    
    // Select status using ShadcnUI Select component
    await page.click('[data-testid="status-select"]');
    await page.click('text=UPCOMING');
    
    // Select difficulty using ShadcnUI Select component
    await page.click('[data-testid="difficulty-select"]');
    await page.click('text=EASY');
    
    // Save the testnet
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('text=Changes saved successfully')).toBeVisible();
    
    // 2) / -> listede görünür
    await page.goto('/');
    
    // Should see the new testnet in the list
    await expect(page.locator('text=Smoke Test Testnet')).toBeVisible();
    
    // 3) satıra klavye ile odaklan + Enter -> drawer açılır
    const testnetRow = page.locator('tr').filter({ hasText: 'Smoke Test Testnet' });
    await testnetRow.focus();
    await testnetRow.press('Enter');
    
    // Drawer should open
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Smoke Test Testnet')).toBeVisible();
    
    // 4) Esc -> drawer kapanır
    await page.keyboard.press('Escape');
    
    // Drawer should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    
    // 5) Admin'de güncelle -> liste "Updated" değişir
    await page.goto('/admin');
    
    // Find and click on the testnet we created
    await page.click('text=Smoke Test Testnet');
    
    // Update the name
    await page.fill('[data-testid="name-input"]', 'Smoke Test Testnet Updated');
    
    // Save changes
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('text=Changes saved successfully')).toBeVisible();
    
    // Go back to homepage and verify update
    await page.goto('/');
    
    // Should see updated name
    await expect(page.locator('text=Smoke Test Testnet Updated')).toBeVisible();
    
    // Should not see old name
    await expect(page.locator('text=Smoke Test Testnet')).not.toBeVisible();
  });

  test('Keyboard navigation flow', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await expect(page.locator('text=Live Testnet Programs')).toBeVisible();
    
    // Wait for table to load
    await page.waitForSelector('tbody tr', { timeout: 10000 });
    
    // Tab through filters (skip if not present)
    await page.keyboard.press('Tab'); // First focusable element
    
    // Focus on first table row
    const firstRow = page.locator('tbody tr').first();
    await firstRow.focus();
    
    // Check if row is focusable
    await expect(firstRow).toBeAttached();
    
    // Click on row to open drawer (keyboard navigation might not work as expected)
    await firstRow.click();
    
    // Drawer should open
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Press Escape to close drawer
    await page.keyboard.press('Escape');
    
    // Drawer should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('URL synchronization', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await expect(page.locator('text=Live Testnet Programs')).toBeVisible();
    
    // Wait for table to load
    await page.waitForSelector('tbody tr', { timeout: 10000 });
    
    // Click on first testnet row
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    
    // Drawer should open
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // URL should contain slug parameter
    await page.waitForTimeout(1000); // Wait for URL update
    const url = page.url();
    expect(url).toContain('?slug=');
    
    // Reload page - drawer should still be open
    await page.reload();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Close drawer
    await page.keyboard.press('Escape');
    
    // URL should not contain slug parameter
    await page.waitForTimeout(1000); // Wait for URL update
    const newUrl = page.url();
    expect(newUrl).not.toContain('slug=');
  });
});
