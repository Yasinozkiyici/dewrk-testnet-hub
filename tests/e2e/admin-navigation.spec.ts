import { test, expect } from '@playwright/test';

/**
 * Admin Navigation E2E Tests
 * 
 * Tests sidebar navigation, breadcrumbs, and section routing.
 */

test.describe('Admin Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin page
    await page.goto('/admin');
    
    // Verify admin access
    await expect(page.locator('text=/Dewrk Admin|Dashboard/i')).toBeVisible();
  });

  test('should navigate through sidebar sections', async ({ page }) => {
    // Check dashboard link
    await page.click('text=/Dashboard/i');
    await expect(page).toHaveURL(/\/admin$/);

    // Expand Content section
    await page.click('text=/Content/i');
    
    // Navigate to Testnets
    await page.click('text=/Testnets/i');
    await expect(page).toHaveURL(/\/admin\/content\/testnets/);

    // Check breadcrumbs
    await expect(page.locator('text=/Admin.*Content.*Testnets/i')).toBeVisible();
  });

  test('should highlight active section in sidebar', async ({ page }) => {
    // Navigate to testnets
    await page.click('text=/Content/i');
    await page.click('text=/Testnets/i');
    
    // Verify testnets link is highlighted
    const testnetLink = page.locator('a').filter({ hasText: /Testnets/i });
    await expect(testnetLink).toHaveClass(/bg-\[var\(--mint\)\]/);
  });

  test('should show breadcrumbs correctly', async ({ page }) => {
    await page.click('text=/Content/i');
    await page.click('text=/Testnets/i');
    
    // Verify breadcrumbs show: Admin > Content > Testnets
    const breadcrumbs = page.locator('nav').filter({ hasText: 'Admin' });
    await expect(breadcrumbs).toBeVisible();
    await expect(breadcrumbs).toContainText('Content');
    await expect(breadcrumbs).toContainText('Testnets');
  });

  test('should navigate to activity log', async ({ page }) => {
    await page.click('text=/Activity/i');
    
    // Verify activity log page loads
    await expect(page).toHaveURL(/\/admin\/activity/);
    await expect(page.locator('h1')).toContainText('Activity Log');
  });

  test('should navigate to settings', async ({ page }) => {
    await page.click('text=/Settings/i');
    
    // Verify settings page loads
    await expect(page).toHaveURL(/\/admin\/settings/);
  });

  test('should handle section collapse/expand', async ({ page }) => {
    // Expand Content section
    await page.click('text=/Content/i');
    
    // Verify testnets link is visible
    await expect(page.locator('text=/Testnets/i')).toBeVisible();
    
    // Collapse Content section
    await page.click('text=/Content/i');
    
    // Verify testnets link is hidden
    await expect(page.locator('text=/Testnets/i')).not.toBeVisible();
  });
});

