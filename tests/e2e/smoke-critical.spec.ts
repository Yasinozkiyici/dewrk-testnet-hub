import { test, expect } from '@playwright/test';

/**
 * Critical Smoke Tests
 * 
 * Bu testler deployment sonrası kritik akışları kontrol eder:
 * - Homepage loads
 * - Testnet list loads
 * - Testnet detail opens
 * - API endpoints respond
 * - No critical errors
 */

test.describe('Critical Smoke Tests', () => {
  test('homepage should load without errors', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/Dewrk|Testnet/i);
    
    // Check hero section
    await expect(page.locator('h1, h2')).toBeVisible();
    
    // Check testnet table
    await expect(page.locator('table, [role="table"]')).toBeVisible({ timeout: 10000 });
    
    // Check no critical console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    // Filter out non-critical errors (third-party scripts, etc.)
    const criticalErrors = errors.filter(
      (error) => !error.includes('favicon') && 
                 !error.includes('analytics') &&
                 !error.includes('advertisement')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('testnet list API should respond', async ({ page }) => {
    // Intercept API call
    const apiResponse = page.waitForResponse((response) => 
      response.url().includes('/api/testnets') && response.status() === 200
    );
    
    await page.goto('/');
    
    // Wait for API response
    const response = await apiResponse;
    const data = await response.json();
    
    // Verify response structure
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
  });

  test('testnet detail drawer should open', async ({ page }) => {
    await page.goto('/');
    
    // Wait for table to load
    await expect(page.locator('table, [role="table"]')).toBeVisible({ timeout: 10000 });
    
    // Click first testnet row
    const firstRow = page.locator('tr').filter({ hasNotText: 'Name' }).first();
    await firstRow.click({ timeout: 5000 });
    
    // Verify drawer opens
    await expect(page.locator('[role="dialog"], [aria-modal="true"]')).toBeVisible({ timeout: 3000 });
    
    // Verify drawer has content
    await expect(page.locator('h1, h2')).toBeVisible();
  });

  test('health endpoint should return ok', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('ok');
  });

  test('should navigate to all main sections', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to Testnets
    await page.click('text=/testnets/i');
    await expect(page).toHaveURL(/\/testnets/);
    
    // Navigate to Ecosystems
    await page.click('text=/ecosystems/i');
    await expect(page).toHaveURL(/\/ecosystems/);
    
    // Navigate to Leaderboards
    await page.click('text=/leaderboards/i');
    await expect(page).toHaveURL(/\/leaderboards/);
    
    // Navigate to Guides
    await page.click('text=/guides/i');
    await expect(page).toHaveURL(/\/guides/);
    
    // Navigate to API
    await page.click('text=/api/i');
    await expect(page).toHaveURL(/\/api/);
  });

  test('should handle 404 gracefully', async ({ page }) => {
    const response = await page.goto('/non-existent-page');
    expect(response?.status()).toBe(404);
    
    // Should show 404 page, not crash
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load without JavaScript errors on critical paths', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    // Navigate through critical paths
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    await page.goto('/testnets');
    await page.waitForTimeout(1000);
    
    await page.goto('/admin');
    await page.waitForTimeout(1000);
    
    // Check for critical JavaScript errors
    const criticalErrors = errors.filter(
      (error) => !error.includes('favicon') &&
                 !error.includes('ResizeObserver') &&
                 !error.includes('Non-Error promise rejection')
    );
    
    expect(criticalErrors.length).toBe(0);
  });
});

