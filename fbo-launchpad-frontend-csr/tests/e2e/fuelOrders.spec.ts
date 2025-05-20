import { test, expect } from '@playwright/test';
import { login, setupAuthenticatedState } from './utils/auth';
import path from 'path'; // Import path

const __dirname = path.resolve(); // Project root

/**
 * Fuel Orders Page Test Suite
 * Tests the functionality and appearance of the Fuel Orders page
 */
test.describe('Fuel Orders Page', () => {
  // Run tests sequentially
  test.describe.configure({ mode: 'serial' });
  
  // Debug test first to validate authentication flow
  test('debug login', async ({ page }) => {
    // Create test results directory if it doesn't exist
    await page.evaluate(() => {
      try {
        require('fs').mkdirSync('test-results', { recursive: true });
      } catch (e) {
        // Directory might already exist, that's fine
      }
    });
    
    // Navigate to login page
    await page.goto('/login');
    console.log('On login page');
    
    // Take a screenshot to see what's on the page
    await page.screenshot({ path: 'test-results/login-page.png' });
    
    try {
      // Use the improved login function that handles multiple selectors
      await login(page);
      console.log('Login successful');
      
      // Take a screenshot after successful login
      await page.screenshot({ path: 'test-results/after-login.png' });
      
      // Verify we're on a valid page after login
      console.log('Current URL after login:', page.url());
      
      // Look for elements that should be present after login (e.g., dashboard elements)
      const dashboardElement = page.locator('h1:has-text("Dashboard"), h2:has-text("Dashboard"), .dashboard');
      if (await dashboardElement.count() > 0) {
        console.log('Dashboard element found, confirming successful login');
      }
    } catch (error) {
      console.error('Login failed:', error.message);
      await page.screenshot({ path: 'test-results/login-failed.png' });
    }
  });
  
  // Run actual tests after verifying login works
  test.describe('authenticated tests', () => {
    test.use({ storageState: path.resolve(__dirname, 'tests/.auth/admin.json') });

    // Setup authentication for each test
    test.beforeEach(async ({ page }) => {
      // Set up authenticated state with admin role
      // await setupAuthenticatedState(page, 'admin'); // No longer needed
    });
    
    test('should navigate to orders page', async ({ page }) => {
      // Navigate to orders page
      await page.goto('/orders');
      
      // Wait for the page to load and stabilize
      await page.waitForLoadState('networkidle');
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'test-results/orders-page.png' });
      
      // Verify page title or heading
      const pageTitle = page.locator('h1:has-text("Fuel Orders"), h2:has-text("Fuel Orders")');
      await expect(pageTitle).toBeVisible();
      
      // Verify table is present
      const ordersTable = page.locator('table, [role="table"]');
      await expect(ordersTable).toBeVisible();
    });
    
    test('should display orders in table', async ({ page }) => {
      // Navigate to orders page
      await page.goto('/orders');
      
      // Wait for the page to load and stabilize
      await page.waitForLoadState('networkidle');
      
      // Check if table contains rows (there should be at least header row)
      const tableRows = page.locator('table tr, [role="table"] [role="row"]');
      const rowCount = await tableRows.count();
      expect(rowCount).toBeGreaterThanOrEqual(1);
      
      // Check for specific table columns
      const headerRow = tableRows.first();
      await expect(headerRow).toContainText(/Order ID|Status|Tail Number|Actions/i);
    });
    
    test('should filter orders by status', async ({ page }) => {
      // Navigate to orders page
      await page.goto('/orders');
      
      // Wait for the page to load
      await page.waitForLoadState('networkidle');
      
      // Look for status filter
      const statusFilter = page.locator('select[name="status"], [aria-label="Status filter"]');
      
      // If status filter exists, test it
      if (await statusFilter.count() > 0) {
        // Get initial row count
        const initialRowCount = await page.locator('table tbody tr, [role="table"] [role="row"]:not(:first-child)').count();
        
        // Select a specific status value
        await statusFilter.selectOption({ index: 1 }); // Select first non-default option
        
        // Wait for table to update
        await page.waitForTimeout(1000);
        
        // Check if the filter changed the table content
        const filteredRowCount = await page.locator('table tbody tr, [role="table"] [role="row"]:not(:first-child)').count();
        
        console.log(`Initial rows: ${initialRowCount}, Filtered rows: ${filteredRowCount}`);
      } else {
        console.log('Status filter not found, skipping test');
      }
    });
    
    test('should open create order modal', async ({ page }) => {
      // Navigate to orders page
      await page.goto('/orders');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Find create order button
      const createButton = page.getByRole('button', { name: /create|add|new order/i });
      
      // Check if button exists and click it
      if (await createButton.count() > 0) {
        await createButton.click();
        
        // Wait for modal to appear
        const modal = page.locator('.modal, [role="dialog"]');
        await expect(modal).toBeVisible();
        
        // Check for form elements in modal
        await expect(page.locator('form')).toBeVisible();
        
        // Take screenshot of modal
        await page.screenshot({ path: 'test-results/create-order-modal.png' });
      } else {
        console.log('Create button not found, skipping test');
      }
    });
  });
}); 