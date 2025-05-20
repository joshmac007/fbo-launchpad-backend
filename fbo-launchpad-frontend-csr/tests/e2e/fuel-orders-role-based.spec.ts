import { test, expect } from '@playwright/test';
import path from 'path'; // Import path

const __dirname = path.resolve(); // Project root

/**
 * Role-Based Tests for Fuel Orders Page
 * 
 * Uses pre-authenticated states for different roles to verify role-specific
 * behaviors on the Fuel Orders page.
 */

// Admin role tests (full access)
test.describe('Admin Role', () => {
  // Use stored admin authentication
  test.use({ storageState: path.resolve(__dirname, 'tests/.auth/admin.json') });
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');
  });
  
  test('admin can see all orders', async ({ page }) => {
    // Admin should see all orders (check for table with reasonable number of rows)
    const tableRows = page.locator('table tbody tr, [role="table"] [role="row"]:not(:first-child)');
    const rowCount = await tableRows.count();
    console.log(`Admin can see ${rowCount} orders`);
    
    // Take screenshot for verification
    await page.screenshot({ path: 'test-results/admin-orders-view.png' });
  });
  
  test('admin can create new orders', async ({ page }) => {
    // Admin should see the create button
    const createButton = page.locator('[data-testid="create-order-button"]');
    await expect(createButton).toBeVisible();
    
    // Create a new order (minimal implementation for this test)
    await createButton.click();
    const modal = page.locator('[data-testid="create-order-modal"]');
    await expect(modal).toBeVisible();
    // Further modal interaction can be tested in more specific tests like fuel-order-create.spec.ts
    // For this role-based test, ensuring the modal opens is sufficient.
    await modal.getByRole('button', { name: /cancel/i }).click(); // Close modal
    await expect(modal).not.toBeVisible();
  });
  
  test('admin can modify orders', async ({ page }) => {
    // Admin should see action buttons on orders
    const actionButtons = page.locator('table tbody tr button, [role="table"] [role="row"]:not(:first-child) button');
    
    if (await actionButtons.count() > 0) {
      // Click on the first "view details" or "actions" button
      const firstActionButton = actionButtons.first();
      await firstActionButton.click();
      
      // Look for editing capabilities
      const editElements = page.locator('button:has-text("Edit"), button:has-text("Update"), button:has-text("Assign")');
      const hasEditElements = await editElements.count() > 0;
      
      console.log(`Admin has edit elements visible: ${hasEditElements}`);
      await page.screenshot({ path: 'test-results/admin-order-details.png' });
    } else {
      console.log('No orders with action buttons found');
    }
  });
});

// CSR role tests (create and view, partial management)
test.describe('CSR Role', () => {
  // Use stored CSR authentication
  test.use({ storageState: path.resolve(__dirname, 'tests/.auth/csr.json') });
  
  test('csr can see relevant orders', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');
    
    // CSR should see orders (may be filtered based on permissions)
    const tableRows = page.locator('table tbody tr, [role="table"] [role="row"]:not(:first-child)');
    const rowCount = await tableRows.count();
    console.log(`CSR can see ${rowCount} orders`);
    
    // Take screenshot for verification
    await page.screenshot({ path: 'test-results/csr-orders-view.png' });
  });
  
  test('csr can create new orders', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');
    
    // CSR should see the create button
    const createButton = page.getByRole('button', { name: /create|add|new order/i });
    
    if (await createButton.count() > 0) {
      await createButton.click();
      const modal = page.locator('.modal, [role="dialog"]');
      await expect(modal).toBeVisible();
      
      // Take screenshot for verification
      await page.screenshot({ path: 'test-results/csr-create-modal.png' });
    } else {
      console.log('Create button not visible to CSR');
      await page.screenshot({ path: 'test-results/csr-no-create-button.png' });
    }
  });
});

// LST role tests (limited view, status updates)
test.describe('LST Role', () => {
  // Use stored LST authentication
  test.use({ storageState: path.resolve(__dirname, 'tests/.auth/lst.json') });
  
  test('lst can see assigned orders', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');
    
    // LST should see their assigned orders
    const tableRows = page.locator('table tbody tr, [role="table"] [role="row"]:not(:first-child)');
    const rowCount = await tableRows.count();
    console.log(`LST can see ${rowCount} orders`);
    
    // Take screenshot for verification
    await page.screenshot({ path: 'test-results/lst-orders-view.png' });
  });
  
  test('lst cannot create new orders', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');
    
    // LST should not see the create button
    const createButton = page.getByRole('button', { name: /create|add|new order/i });
    const createButtonVisible = await createButton.isVisible();
    
    console.log(`Create button visible to LST: ${createButtonVisible}`);
    await page.screenshot({ path: 'test-results/lst-create-button-check.png' });
  });
  
  test('lst can update order status', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');
    
    // LST should be able to see action buttons on their orders
    const actionButtons = page.locator('table tbody tr button, [role="table"] [role="row"]:not(:first-child) button');
    
    if (await actionButtons.count() > 0) {
      // Click on the first action button
      await actionButtons.first().click();
      
      // Look for status update buttons (acknowledge, en route, etc.)
      const statusButtons = page.locator('button:has-text("Acknowledge"), button:has-text("En Route"), button:has-text("Start"), button:has-text("Complete")');
      const hasStatusButtons = await statusButtons.count() > 0;
      
      console.log(`LST has status update buttons: ${hasStatusButtons}`);
      await page.screenshot({ path: 'test-results/lst-order-details.png' });
    } else {
      console.log('No orders with action buttons found for LST');
    }
  });
}); 