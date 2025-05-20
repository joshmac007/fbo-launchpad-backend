import { test, expect } from '@playwright/test';
import path from 'path'; // Import path

const __dirname = path.resolve(); // Project root

test.describe('Fuel Order Creation by Admin', () => {
  test.use({ storageState: path.resolve(__dirname, 'tests/.auth/admin.json') });

  test('Admin can create a new fuel order', async ({ page }) => {
    // 1. User is already logged in as admin due to storageState.
    // No need for: await page.goto('http://localhost:3000/');
    // No need for: await page.getByLabel('Email').fill('admin@fbolaunchpad.com');
    // No need for: await page.getByLabel('Password').fill('Admin123!');
    // No need for: await page.getByRole('button', { name: /log in|sign in/i }).click();
    // No need for: await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {});

    // 2. Navigate directly to /orders page
    await page.goto('/orders'); // Using relative path with baseURL from config
    await page.waitForLoadState('networkidle'); // Wait for page to be ready

    // 3. Click "Create New Order" button
    await page.getByRole('button', { name: /create new order/i }).click();
    await page.waitForLoadState('networkidle'); // Added wait
    
    // Ensure the modal is visible and get a locator for it
    const modal = page.locator('[data-testid="create-order-modal"], .modal:has-text("Create New Order")').first();
    await expect(modal).toBeVisible({ timeout: 15000 }); // Increased timeout

    // 4. Fill out the order form (scoped to modal)
    await modal.getByLabel(/tail number/i).fill('NTEST123');
    await modal.getByLabel(/fuel type/i).selectOption('JET_A');
    await modal.getByLabel(/requested amount/i).fill('500');
    await modal.getByLabel(/location on ramp/i).fill('Test Ramp');
    
    // Select LST and truck (assuming dropdowns are populated)
    // More robust selection (checking options count) can be added if needed,
    // similar to fuel-order-lifecycle.spec.ts, but keeping it simple for now.
    const assignedLstSelect = modal.getByLabel(/assigned lst/i);
    try {
      await assignedLstSelect.waitFor({ state: 'visible', timeout: 5000 });
      if (await assignedLstSelect.locator('option').count() > 1) {
          await assignedLstSelect.selectOption({ index: 1 });
          console.log('[CreateOrderTest] Selected LST.');
      } else {
          console.log('[CreateOrderTest] Skipping LST selection: Not enough options.');
          await page.screenshot({ path: 'test-results/create-order-lst-skipped.png' });
      }
    } catch (e:any) {
      console.error(`[CreateOrderTest] Failed to select LST: ${e.message}`);
      await page.screenshot({ path: 'test-results/create-order-lst-failed.png' });
    }

    const assignedTruckSelect = modal.getByLabel(/assigned truck/i);
    try {
      await assignedTruckSelect.waitFor({ state: 'visible', timeout: 5000 });
      if (await assignedTruckSelect.locator('option').count() > 1) {
          await assignedTruckSelect.selectOption({ index: 1 });
          console.log('[CreateOrderTest] Selected Truck.');
      } else {
          console.log('[CreateOrderTest] Skipping Truck selection: Not enough options.');
          await page.screenshot({ path: 'test-results/create-order-truck-skipped.png' });
      }
    } catch (e:any) {
      console.error(`[CreateOrderTest] Failed to select Truck: ${e.message}`);
      await page.screenshot({ path: 'test-results/create-order-truck-failed.png' });
    }
    // Fill other required fields as needed

    // 7. Submit the form (scoped to modal)
    await modal.getByRole('button', { name: /submit|create/i }).click();

    // 8. Expect a success toast
    // If the toast is unreliable, alternative checks (like order in table) can be added.
    await expect(page.getByText(/order created|successfully created|success/i).first()).toBeVisible({ timeout: 15000 });
  });
});