import { test, expect } from '@playwright/test';

/**
 * Critical Admin Actions E2E Tests
 * 
 * Bu testler kritik admin aksiyonlarını kapsar:
 * - Testnet oluşturma
 * - Testnet güncelleme
 * - Testnet silme (future)
 * - Cache invalidation
 * - Error handling
 */

test.describe('Critical Admin Actions', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin page
    await page.goto('/admin');
    
    // Verify admin access (development mode allows access)
    await expect(page.locator('h1, h2')).toBeVisible();
  });

  test('should create testnet and invalidate cache', async ({ page }) => {
    const testnetName = `E2E Test Testnet ${Date.now()}`;
    
    // Fill form
    await page.fill('[data-testid="name-input"]', testnetName);
    await page.fill('[data-testid="network-input"]', 'Ethereum');
    
    // Select status
    await page.click('[data-testid="status-select"]');
    await page.click('text=LIVE');
    
    // Select difficulty
    await page.click('[data-testid="difficulty-select"]');
    await page.click('text=EASY');
    
    await page.fill('[data-testid="short-description-input"]', 'E2E test description');
    await page.fill('[data-testid="est-time-input"]', '30');
    
    // Submit form
    await page.click('[data-testid="save-button"]');
    
    // Wait for success
    await expect(page.locator('[data-testid="success-toast"], text=/success/i')).toBeVisible({ timeout: 10000 });
    
    // Verify redirect to edit page with slug
    await page.waitForURL(/\/admin\?slug=/, { timeout: 5000 });
    
    // Navigate to homepage
    await page.goto('/');
    
    // Verify testnet appears in list (cache should be invalidated)
    await expect(page.locator(`text=${testnetName}`)).toBeVisible({ timeout: 10000 });
  });

  test('should update testnet and reflect changes immediately', async ({ page }) => {
    // First create a testnet
    const testnetName = `E2E Update Test ${Date.now()}`;
    
    await page.fill('[data-testid="name-input"]', testnetName);
    await page.fill('[data-testid="network-input"]', 'Polygon');
    await page.click('[data-testid="status-select"]');
    await page.click('text=UPCOMING');
    await page.click('[data-testid="difficulty-select"]');
    await page.click('text=MEDIUM');
    await page.fill('[data-testid="short-description-input"]', 'Initial description');
    
    await page.click('[data-testid="save-button"]');
    await page.waitForURL(/\/admin\?slug=/, { timeout: 5000 });
    
    // Update the testnet
    const updatedName = `${testnetName} Updated`;
    await page.fill('[data-testid="name-input"]', updatedName);
    await page.click('[data-testid="status-select"]');
    await page.click('text=LIVE');
    await page.fill('[data-testid="short-description-input"]', 'Updated description');
    
    await page.click('[data-testid="save-button"]');
    await expect(page.locator('[data-testid="success-toast"], text=/success/i')).toBeVisible({ timeout: 10000 });
    
    // Navigate to homepage
    await page.goto('/');
    
    // Verify updated testnet appears with new data
    await expect(page.locator(`text=${updatedName}`)).toBeVisible({ timeout: 10000 });
    
    // Open drawer to verify details
    const tableRow = page.locator('tr').filter({ hasText: updatedName });
    await tableRow.click();
    
    await expect(page.locator('text=Updated description')).toBeVisible();
    await expect(page.locator('text=LIVE')).toBeVisible();
  });

  test('should handle validation errors gracefully', async ({ page }) => {
    // Try to submit empty form
    await page.click('[data-testid="save-button"]');
    
    // Should show validation errors
    const nameInput = page.locator('[data-testid="name-input"]');
    await expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    
    // Form should not submit
    await expect(page.locator('[data-testid="success-toast"]')).not.toBeVisible();
  });

  test('should handle network errors with user-friendly message', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/admin/testnets/upsert', route => {
      route.abort('failed');
    });
    
    // Fill form
    await page.fill('[data-testid="name-input"]', 'Error Test Testnet');
    await page.fill('[data-testid="network-input"]', 'Ethereum');
    await page.click('[data-testid="status-select"]');
    await page.click('text=LIVE');
    
    // Submit
    await page.click('[data-testid="save-button"]');
    
    // Should show error toast
    await expect(page.locator('[data-testid="error-toast"], text=/error/i, text=/failed/i')).toBeVisible({ timeout: 5000 });
    
    // Form should still be visible (not redirected)
    await expect(page.locator('[data-testid="name-input"]')).toBeVisible();
  });

  test('should show loading state during save', async ({ page }) => {
    // Fill form
    await page.fill('[data-testid="name-input"]', 'Loading Test Testnet');
    await page.fill('[data-testid="network-input"]', 'Arbitrum');
    await page.click('[data-testid="status-select"]');
    await page.click('text=LIVE');
    
    // Submit
    const saveButton = page.locator('[data-testid="save-button"]');
    await saveButton.click();
    
    // Should show loading state
    await expect(saveButton).toBeDisabled();
    await expect(saveButton).toContainText(/saving|loading/i, { timeout: 1000 });
    
    // Wait for completion
    await expect(page.locator('[data-testid="success-toast"], text=/success/i')).toBeVisible({ timeout: 10000 });
    await expect(saveButton).toBeEnabled();
  });

  test('should update live preview as form changes', async ({ page }) => {
    // Fill form fields
    await page.fill('[data-testid="name-input"]', 'Preview Testnet');
    await page.fill('[data-testid="network-input"]', 'Base');
    await page.click('[data-testid="status-select"]');
    await page.click('text=LIVE');
    await page.click('[data-testid="difficulty-select"]');
    await page.click('text=HARD');
    await page.fill('[data-testid="short-description-input"]', 'Preview description');
    
    // Check preview updates
    await expect(page.locator('[data-testid="preview-name"], text=Preview Testnet')).toBeVisible({ timeout: 2000 });
    await expect(page.locator('[data-testid="preview-network"], text=Base')).toBeVisible();
    await expect(page.locator('[data-testid="preview-status"], text=LIVE')).toBeVisible();
    await expect(page.locator('[data-testid="preview-difficulty"], text=HARD')).toBeVisible();
  });

  test('should handle rate limiting gracefully', async ({ page }) => {
    // Mock rate limit response
    await page.route('**/api/admin/testnets/upsert', route => {
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'rate_limit' })
      });
    });
    
    // Fill and submit form
    await page.fill('[data-testid="name-input"]', 'Rate Limit Test');
    await page.fill('[data-testid="network-input"]', 'Ethereum');
    await page.click('[data-testid="status-select"]');
    await page.click('text=LIVE');
    
    await page.click('[data-testid="save-button"]');
    
    // Should show rate limit error
    await expect(page.locator('[data-testid="error-toast"], text=/rate.*limit/i')).toBeVisible({ timeout: 5000 });
  });
});

