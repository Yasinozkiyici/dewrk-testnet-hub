import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('Homepage should have no critical accessibility violations', async ({ page }) => {
    await page.goto('http://localhost:4000/');
    
    // Wait for page to load
    await expect(page.locator('text=Live Testnet Programs')).toBeVisible();
    
    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    // Check for critical violations
    const criticalViolations = accessibilityScanResults.violations.filter(
      violation => violation.impact === 'critical'
    );
    
    expect(criticalViolations).toHaveLength(0);
    
    // Log all violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found:');
      accessibilityScanResults.violations.forEach(violation => {
        console.log(`- ${violation.id}: ${violation.description} (Impact: ${violation.impact})`);
      });
    }
  });

  test('Homepage with drawer open should have no critical accessibility violations', async ({ page }) => {
    await page.goto('http://localhost:4000/');
    
    // Wait for page to load
    await expect(page.locator('text=Live Testnet Programs')).toBeVisible();
    
    // Click on first testnet row to open drawer
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    
    // Wait for drawer to open
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    // Check for critical violations
    const criticalViolations = accessibilityScanResults.violations.filter(
      violation => violation.impact === 'critical'
    );
    
    expect(criticalViolations).toHaveLength(0);
    
    // Log all violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found (with drawer):');
      accessibilityScanResults.violations.forEach(violation => {
        console.log(`- ${violation.id}: ${violation.description} (Impact: ${violation.impact})`);
      });
    }
  });

  test('Admin page should have no critical accessibility violations', async ({ page }) => {
    // Set admin key header
    await page.setExtraHTTPHeaders({ 'x-admin-key': 'dev-admin-key' });
    
    await page.goto('http://localhost:4000/admin');
    
    // Wait for page to load
    await expect(page.locator('text=Create new testnet')).toBeVisible();
    
    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    // Check for critical violations
    const criticalViolations = accessibilityScanResults.violations.filter(
      violation => violation.impact === 'critical'
    );
    
    expect(criticalViolations).toHaveLength(0);
    
    // Log all violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found (admin):');
      accessibilityScanResults.violations.forEach(violation => {
        console.log(`- ${violation.id}: ${violation.description} (Impact: ${violation.impact})`);
      });
    }
  });

  test('Tab order should be correct: Filters → Table → Drawer', async ({ page }) => {
    await page.goto('http://localhost:4000/');
    
    // Wait for page to load
    await expect(page.locator('text=Live Testnet Programs')).toBeVisible();
    
    // Tab through filters
    await page.keyboard.press('Tab'); // Search input
    const searchInput = await page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeFocused();
    
    await page.keyboard.press('Tab'); // Network select
    await page.keyboard.press('Tab'); // Difficulty select
    await page.keyboard.press('Tab'); // Status select
    await page.keyboard.press('Tab'); // Sort select
    
    // Tab to table
    await page.keyboard.press('Tab'); // First table row
    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeFocused();
    
    // Open drawer with Enter
    await page.keyboard.press('Enter');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Close drawer with Escape
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });
});
