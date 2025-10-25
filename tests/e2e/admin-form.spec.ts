import { test, expect } from '@playwright/test';

test.describe('Admin Form E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin page
    await page.goto('/admin');
  });

  test('should create new testnet and see instant update on homepage', async ({ page }) => {
    // Fill out the form
    await page.fill('[data-testid="name-input"]', 'E2E Test Testnet');
    await page.fill('[data-testid="network-input"]', 'Ethereum');
    
    // Select status using ShadcnUI Select component
    await page.click('[data-testid="status-select"]');
    await page.click('text=LIVE');
    
    // Select difficulty using ShadcnUI Select component
    await page.click('[data-testid="difficulty-select"]');
    await page.click('text=EASY');
    await page.fill('[data-testid="short-description-input"]', 'This is a test testnet for E2E testing');
    await page.fill('[data-testid="est-time-input"]', '60');
    await page.fill('[data-testid="reward-type-input"]', 'ETH');
    await page.fill('[data-testid="tags-input"]', 'e2e, test, automation');
    
    // Add a task
    await page.click('[data-testid="add-task-button"]');
    await page.fill('[data-testid="task-title-0"]', 'Complete E2E test task');
    await page.fill('[data-testid="task-description-0"]', 'This is a test task for E2E testing');
    await page.fill('[data-testid="task-reward-0"]', '100 ETH');
    
    // Add social links
    await page.fill('[data-testid="website-url-input"]', 'https://e2e-test.example.com');
    await page.fill('[data-testid="twitter-url-input"]', 'https://twitter.com/e2e-test');
    
    // Submit the form
    await page.click('[data-testid="save-button"]');
    
    // Wait for success toast
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    
    // Wait for redirect to edit page
    await page.waitForURL(/\/admin\?slug=/);
    
    // Navigate to homepage
    await page.goto('/');
    
    // Check that the new testnet appears in the list
    await expect(page.locator('text=E2E Test Testnet')).toBeVisible();
    await expect(page.locator('text=Ethereum')).toBeVisible();
    await expect(page.locator('text=LIVE')).toBeVisible();
    await expect(page.locator('text=EASY')).toBeVisible();
    
    // Check that the testnet appears in the table
    const tableRow = page.locator('tr').filter({ hasText: 'E2E Test Testnet' });
    await expect(tableRow).toBeVisible();
    
    // Click on the testnet to open drawer
    await tableRow.click();
    
    // Check drawer content
    await expect(page.locator('[data-testid="testnet-drawer"]')).toBeVisible();
    await expect(page.locator('text=This is a test testnet for E2E testing')).toBeVisible();
    await expect(page.locator('text=Complete E2E test task')).toBeVisible();
  });

  test('should update existing testnet and see instant changes', async ({ page }) => {
    // First, create a testnet (assuming one exists or create one)
    await page.goto('/admin');
    
    // If no testnet exists, create one first
    const existingTestnet = page.locator('[data-testid="testnet-list"] a').first();
    if (await existingTestnet.count() === 0) {
      // Create a testnet first
      await page.fill('[data-testid="name-input"]', 'Update Test Testnet');
      await page.fill('[data-testid="network-input"]', 'Polygon');
      
      // Select status using ShadcnUI Select component
      await page.click('[data-testid="status-select"]');
      await page.click('text=UPCOMING');
      
      // Select difficulty using ShadcnUI Select component
      await page.click('[data-testid="difficulty-select"]');
      await page.click('text=MEDIUM');
      await page.fill('[data-testid="short-description-input"]', 'Initial description');
      await page.click('[data-testid="save-button"]');
      await page.waitForURL(/\/admin\?slug=/);
    } else {
      // Click on existing testnet
      await existingTestnet.click();
    }
    
    // Update the testnet
    await page.fill('[data-testid="name-input"]', 'Updated Test Testnet');
    
    // Select status using ShadcnUI Select component
    await page.click('[data-testid="status-select"]');
    await page.click('text=LIVE');
    await page.fill('[data-testid="short-description-input"]', 'Updated description');
    
    // Submit the form
    await page.click('[data-testid="save-button"]');
    
    // Wait for success toast
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    
    // Navigate to homepage
    await page.goto('/');
    
    // Check that the updated testnet appears with new data
    await expect(page.locator('text=Updated Test Testnet')).toBeVisible();
    await expect(page.locator('text=LIVE')).toBeVisible();
    
    // Click on the testnet to open drawer
    const tableRow = page.locator('tr').filter({ hasText: 'Updated Test Testnet' });
    await tableRow.click();
    
    // Check drawer shows updated content
    await expect(page.locator('[data-testid="testnet-drawer"]')).toBeVisible();
    await expect(page.locator('text=Updated description')).toBeVisible();
  });

  test('should show validation errors for invalid data', async ({ page }) => {
    // Try to submit form with invalid data
    await page.fill('[data-testid="name-input"]', ''); // Empty name
    await page.fill('[data-testid="est-time-input"]', '-10'); // Negative time
    await page.fill('[data-testid="website-url-input"]', 'not-a-url'); // Invalid URL
    
    // Submit the form
    await page.click('[data-testid="save-button"]');
    
    // Check for validation errors
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="est-time-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="website-url-error"]')).toBeVisible();
    
    // Form should not submit
    await expect(page.locator('[data-testid="success-toast"]')).not.toBeVisible();
  });

  test('should show live preview updates', async ({ page }) => {
    // Fill out form fields
    await page.fill('[data-testid="name-input"]', 'Preview Test Testnet');
    await page.fill('[data-testid="network-input"]', 'Arbitrum');
    // Select status using ShadcnUI Select component
    await page.click('[data-testid="status-select"]');
    await page.click('text=LIVE');
    
    // Select difficulty using ShadcnUI Select component
    await page.click('[data-testid="difficulty-select"]');
    await page.click('text=HARD');
    await page.fill('[data-testid="short-description-input"]', 'This is a preview test');
    await page.fill('[data-testid="tags-input"]', 'preview, test, arbitrum');
    
    // Check that preview updates in real-time
    await expect(page.locator('[data-testid="preview-name"]')).toHaveText('Preview Test Testnet');
    await expect(page.locator('[data-testid="preview-network"]')).toHaveText('Arbitrum');
    await expect(page.locator('[data-testid="preview-status"]')).toHaveText('LIVE');
    await expect(page.locator('[data-testid="preview-difficulty"]')).toHaveText('HARD');
    await expect(page.locator('[data-testid="preview-description"]')).toHaveText('This is a preview test');
    
    // Check tags in preview
    await expect(page.locator('[data-testid="preview-tag-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-tag-test"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-tag-arbitrum"]')).toBeVisible();
  });

  test('should handle form state persistence', async ({ page }) => {
    // Fill out form
    await page.fill('[data-testid="name-input"]', 'State Test Testnet');
    await page.fill('[data-testid="network-input"]', 'Base');
    // Select status using ShadcnUI Select component
    await page.click('[data-testid="status-select"]');
    await page.click('text=PAUSED');
    
    // Navigate away and back
    await page.goto('/');
    await page.goto('/admin');
    
    // Check that form is empty (new form)
    await expect(page.locator('[data-testid="name-input"]')).toHaveValue('');
    await expect(page.locator('[data-testid="network-input"]')).toHaveValue('');
  });

  test('should show loading state during save', async ({ page }) => {
    // Fill out form
    await page.fill('[data-testid="name-input"]', 'Loading Test Testnet');
    await page.fill('[data-testid="network-input"]', 'Optimism');
    // Select status using ShadcnUI Select component
    await page.click('[data-testid="status-select"]');
    await page.click('text=LIVE');
    
    // Select difficulty using ShadcnUI Select component
    await page.click('[data-testid="difficulty-select"]');
    await page.click('text=EASY');
    
    // Submit the form
    await page.click('[data-testid="save-button"]');
    
    // Check loading state
    await expect(page.locator('[data-testid="save-button"]')).toHaveText('Saving…');
    await expect(page.locator('[data-testid="save-button"]')).toBeDisabled();
    
    // Wait for completion
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="save-button"]')).toHaveText('Save Changes');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/testnets', route => {
      route.abort('failed');
    });
    
    // Fill out form
    await page.fill('[data-testid="name-input"]', 'Error Test Testnet');
    await page.fill('[data-testid="network-input"]', 'Ethereum');
    // Select status using ShadcnUI Select component
    await page.click('[data-testid="status-select"]');
    await page.click('text=LIVE');
    
    // Select difficulty using ShadcnUI Select component
    await page.click('[data-testid="difficulty-select"]');
    await page.click('text=MEDIUM');
    
    // Submit the form
    await page.click('[data-testid="save-button"]');
    
    // Check error toast
    await expect(page.locator('[data-testid="error-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-toast"]')).toContainText('Failed to save changes');
  });
});
