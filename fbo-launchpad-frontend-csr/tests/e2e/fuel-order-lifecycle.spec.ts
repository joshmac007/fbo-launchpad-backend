import { test, expect } from '@playwright/test';
import path from 'path'; // Import path

const __dirname = path.resolve(); // Project root

/**
 * Fuel Order Lifecycle E2E Test
 * 
 * This test suite verifies the complete lifecycle of a fuel order from creation to completion:
 * 1. Admin/CSR creates a new order
 * 2. LST acknowledges the order
 * 3. LST sets order to en route
 * 4. LST starts fueling
 * 5. LST completes the order with meter readings
 * 6. Admin/CSR reviews the completed order
 */

// Test variables to share data between tests
const testData = {
  orderNumber: '',
  tailNumber: `TEST-${Math.floor(Math.random() * 10000)}`,
  requestedAmount: '500'
};

// Run tests in order
test.describe.configure({ mode: 'serial' });

test.describe('Fuel Order Lifecycle - Admin Tasks', () => {
  test.use({ storageState: path.resolve(__dirname, 'tests/.auth/admin.json') });

  test('Admin creates a new fuel order', async ({ page }) => {
    // No need to call setupAuthenticatedState(page, 'admin');
    
    // Navigate to orders page
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');
    
    // Click create new order button
    const createButton = page.getByRole('button', { name: /create|add|new order/i });
    await createButton.click();
    
    // Wait for modal to appear
    const modal = page.locator('.modal, [role="dialog"]');
    await expect(modal).toBeVisible();
    
    // Fill out the order form
    await modal.locator('input[id="tailNumberCreate"], input[name="tailNumber"]').first().fill(testData.tailNumber);

    // Ensure the fuel type select element itself is ready
    const fuelTypeSelect = modal.getByLabel(/fuel type/i);
    await fuelTypeSelect.waitFor({ state: 'visible', timeout: 7000 });
    await expect(fuelTypeSelect).toBeEnabled({ timeout: 5000 });

    // Log current options for debugging before attempting selection
    console.log('Attempting to select Fuel Type. Logging available options first...');
    const initialOptions = await fuelTypeSelect.locator('option').evaluateAll(elements => 
      elements.map(el => ({ value: (el as HTMLOptionElement).value, text: el.textContent }))
    );
    console.log('Available fuel type options at time of selection:', initialOptions);

    await page.screenshot({ path: 'test-results/lifecycle-before-fuel-type-select.png' });
    
    // Attempt to select the option
    try {
      // First try by value, which is more robust if text changes
      await fuelTypeSelect.selectOption('Jet A');
      console.log('Successfully selected Fuel Type by value: Jet A');
    } catch (e: any) {
      console.log(`Failed to select Fuel Type by value 'Jet A'. Error: ${e.message}. Trying by label 'Jet A' as fallback.`);
      try {
        // Fallback: try by visible text/label
        await fuelTypeSelect.selectOption({ label: 'Jet A' });
        console.log('Successfully selected Fuel Type by label: Jet A');
      } catch (e2: any) {
        console.error(`Failed to select Fuel Type by value AND by label. Error: ${e2.message}`);
        // Log current options again if different from initial, though page might have closed
        try {
            const finalOptions = await fuelTypeSelect.locator('option').evaluateAll(elements => 
              elements.map(el => ({ value: (el as HTMLOptionElement).value, text: el.textContent }))
            );
            console.log('Available fuel type options after failed attempts:', finalOptions);
        } catch (evalError) {
            console.log('Could not log options after failed select, page might be closed.');
        }
        await page.screenshot({ path: 'test-results/lifecycle-fuel-type-select-failed.png' });
        throw e2; // Re-throw the second error
      }
    }

    await modal.getByLabel(/requested amount/i).fill(testData.requestedAmount);
    await modal.getByLabel(/location on ramp/i).fill('Test Ramp Location');
    
    // Enhanced LST and Truck selection
    const assignedLstSelectLocator = modal.locator('select[id="assigned-lst"], select[data-testid="assigned-lst-select"]');
    const assignedTruckSelectLocator = modal.locator('select[id="assigned-fuel-truck"], select[data-testid="assigned-truck-select"]');

    // Select LST
    try {
      console.log('[LifecycleTest] Waiting for Assigned LST select element...');
      await assignedLstSelectLocator.waitFor({ state: 'visible', timeout: 10000 });
      await expect(assignedLstSelectLocator).toBeEnabled({ timeout: 5000 }); // Ensure select itself is enabled
      console.log('[LifecycleTest] Assigned LST select element is visible and enabled.');

      // Log available options before attempting to select
      const lstOptionsDebug = await assignedLstSelectLocator.locator('option').evaluateAll(elements => 
        elements.map(el => ({ value: (el as HTMLOptionElement).value, text: el.textContent?.trim() || '' }))
      );
      console.log('[LifecycleTest] DEBUG - Available LST options before selection:', lstOptionsDebug);
      await page.screenshot({ path: 'test-results/lifecycle-lst-options-before-select.png' });

      // Attempt to select the first actual LST option (not auto-assign)
      const actualLstOptionToSelect = lstOptionsDebug.find(opt => opt.value && opt.value !== ''); // Find first non-empty value, could be -1
      
      if (actualLstOptionToSelect) {
        console.log(`[LifecycleTest] Attempting to select LST option with value: "${actualLstOptionToSelect.value}" and text: "${actualLstOptionToSelect.text}"`);
        await assignedLstSelectLocator.selectOption(actualLstOptionToSelect.value);
        console.log(`[LifecycleTest] Successfully selected Assigned LST: ${actualLstOptionToSelect.text} (value: ${actualLstOptionToSelect.value})`);
      } else {
        // Fallback or if only auto-assign is there, select that if it exists, or throw error
        const autoAssignOption = lstOptionsDebug.find(opt => opt.value === '-1');
        if (autoAssignOption) {
          console.log('[LifecycleTest] No actual LST options found, attempting to select Auto-assign LST.');
          await assignedLstSelectLocator.selectOption('-1');
          console.log('[LifecycleTest] Selected Auto-assign LST.');
        } else {
          throw new Error('[LifecycleTest] No LST options (neither actual nor auto-assign) available to select after waiting.');
        }
      }
    } catch (e: any) {
      console.error(`[LifecycleTest] Failed to select Assigned LST. Error: ${e.message}`);
      const lstOptionsAfterError = await assignedLstSelectLocator.locator('option').evaluateAll(elements => 
        elements.map(el => ({ value: (el as HTMLOptionElement).value, text: el.textContent?.trim() || '' }))
      ).catch(() => []); // Catch error if select is gone
      console.error('[LifecycleTest] LST options at time of error:', lstOptionsAfterError);
      await page.screenshot({ path: 'test-results/lifecycle-lst-select-critical-failed.png' });
      throw e; // Re-throw as this is critical for lifecycle
    }

    // Select Truck (similar enhanced logic)
    try {
      console.log('[LifecycleTest] Waiting for Assigned Truck select element...');
      await assignedTruckSelectLocator.waitFor({ state: 'visible', timeout: 10000 });
      await expect(assignedTruckSelectLocator).toBeEnabled({ timeout: 5000 });
      console.log('[LifecycleTest] Assigned Truck select element is visible and enabled.');

      const truckOptionsDebug = await assignedTruckSelectLocator.locator('option').evaluateAll(elements => 
        elements.map(el => ({ value: (el as HTMLOptionElement).value, text: el.textContent?.trim() || '' }))
      );
      console.log('[LifecycleTest] DEBUG - Available Truck options before selection:', truckOptionsDebug);
      await page.screenshot({ path: 'test-results/lifecycle-truck-options-before-select.png' });

      const actualTruckOptionToSelect = truckOptionsDebug.find(opt => opt.value && opt.value !== '');

      if (actualTruckOptionToSelect) {
        console.log(`[LifecycleTest] Attempting to select Truck option with value: "${actualTruckOptionToSelect.value}" and text: "${actualTruckOptionToSelect.text}"`);
        await assignedTruckSelectLocator.selectOption(actualTruckOptionToSelect.value);
        console.log(`[LifecycleTest] Selected Assigned Truck: ${actualTruckOptionToSelect.text} (value: ${actualTruckOptionToSelect.value})`);
      } else {
        const autoAssignTruckOption = truckOptionsDebug.find(opt => opt.value === '-1');
        if (autoAssignTruckOption) {
          console.log('[LifecycleTest] No actual Truck options found, attempting to select Auto-assign Truck.');
          await assignedTruckSelectLocator.selectOption('-1');
          console.log('[LifecycleTest] Selected Auto-assign Truck.');
        } else {
          throw new Error('[LifecycleTest] No Truck options (neither actual nor auto-assign) available to select after waiting.');
        }
      }
    } catch (e: any) {
      console.error(`[LifecycleTest] Failed to select Assigned Truck. Error: ${e.message}`);
      const truckOptionsAfterError = await assignedTruckSelectLocator.locator('option').evaluateAll(elements => 
        elements.map(el => ({ value: (el as HTMLOptionElement).value, text: el.textContent?.trim() || '' }))
      ).catch(() => []);
      console.error('[LifecycleTest] Truck options at time of error:', truckOptionsAfterError);
      await page.screenshot({ path: 'test-results/lifecycle-truck-select-critical-failed.png' });
      throw e; // Re-throw as this is critical for lifecycle
    }
    
    await page.screenshot({ path: 'test-results/lifecycle-create-order-form-filled.png' });
    
    // Submit the form (scoped to modal)
    await modal.getByRole('button', { name: /submit|create order/i }).click();
    
    // Wait for success notification
    await expect(page.getByText(/order created|success/i)).toBeVisible({ timeout: 10000 });
    
    // Capture the order number from the table or notification
    try {
      const orderRow = page.locator(`tr:has-text("${testData.tailNumber}")`).first();
      const orderIdElement = orderRow.locator('td').first(); // Assuming Order ID is the first cell
      testData.orderNumber = await orderIdElement.textContent() || '';
      console.log(`Created order number: ${testData.orderNumber}`);
      if (!testData.orderNumber) {
        console.log('Warning: Captured order number is empty.');
      }
    } catch (e) {
      console.log('Could not capture order number, will use tail number to identify order');
      await page.screenshot({ path: 'test-results/lifecycle-capture-order-id-failed.png' });
    }
    
    // Take screenshot after creation
    await page.screenshot({ path: 'test-results/lifecycle-order-created.png' });
  });
});

test.describe('Fuel Order Lifecycle - LST Tasks', () => {
  test.use({ storageState: path.resolve(__dirname, 'tests/.auth/lst.json') });

  test('LST acknowledges the order', async ({ page }) => {
    // No need to call setupAuthenticatedState(page, 'lst');
    
    // Navigate to orders page
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');
    
    // Find the order by tail number or order number
    const orderIdentifier = testData.orderNumber || testData.tailNumber;
    console.log(`LST Acknowledging: Searching for order: ${orderIdentifier}`);
    const orderRow = page.locator(`tr:has-text("${orderIdentifier}"), [role="row"]:has-text("${orderIdentifier}")`).first();
    
    // Ensure the order row is visible before trying to interact
    await expect(orderRow).toBeVisible({ timeout: 10000 });

    // Click view/actions button on this row (assuming first button is for actions/details)
    await orderRow.locator('button').first().click();
    
    // Wait for order details modal
    const orderDetailsModal = page.locator('.modal:has-text("Order Details"), [role="dialog"]:has-text("Order Details")').first();
    await expect(orderDetailsModal).toBeVisible({ timeout: 10000 });
    
    // Take screenshot of order details
    await page.screenshot({ path: 'test-results/lifecycle-order-details-lst.png' });
    
    // Click acknowledge button
    const acknowledgeButton = orderDetailsModal.getByRole('button', { name: /acknowledge/i });
    
    if (await acknowledgeButton.isEnabled({ timeout: 5000 })) {
      await acknowledgeButton.click();
      await expect(page.getByText(/acknowledged|updated|success/i)).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: 'test-results/lifecycle-order-acknowledged.png' });
    } else {
      console.log('Acknowledge button not found or not enabled, order may already be acknowledged or in a different state.');
      await page.screenshot({ path: 'test-results/lifecycle-acknowledge-button-issue.png' });
      const closeButton = orderDetailsModal.getByRole('button', { name: /close|cancel|ok/i });
      if (await closeButton.isVisible()) await closeButton.click();
    }
  });

  test('LST sets order to en route', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');
    
    const orderIdentifier = testData.orderNumber || testData.tailNumber;
    console.log(`LST En Route: Searching for order: ${orderIdentifier}`);
    const orderRow = page.locator(`tr:has-text("${orderIdentifier}"), [role="row"]:has-text("${orderIdentifier}")`).first();
    await expect(orderRow).toBeVisible({ timeout: 10000 });
    await orderRow.locator('button').first().click();
    
    const orderDetailsModal = page.locator('.modal:has-text("Order Details"), [role="dialog"]:has-text("Order Details")').first();
    await expect(orderDetailsModal).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'test-results/lifecycle-order-details-enroute.png' });
    
    const enRouteButton = orderDetailsModal.getByRole('button', { name: /en route|set en route/i });
    if (await enRouteButton.isEnabled({ timeout: 5000 })) {
      await enRouteButton.click();
      await expect(page.getByText(/en route|updated|success/i)).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: 'test-results/lifecycle-order-enroute.png' });
    } else {
      console.log('En Route button not found or not enabled.');
      await page.screenshot({ path: 'test-results/lifecycle-enroute-button-issue.png' });
      const closeButton = orderDetailsModal.getByRole('button', { name: /close|cancel|ok/i });
      if (await closeButton.isVisible()) await closeButton.click();
    }
  });

  test('LST starts fueling the order', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');

    const orderIdentifier = testData.orderNumber || testData.tailNumber;
    console.log(`LST Start Fueling: Searching for order: ${orderIdentifier}`);
    const orderRow = page.locator(`tr:has-text("${orderIdentifier}"), [role="row"]:has-text("${orderIdentifier}")`).first();
    await expect(orderRow).toBeVisible({ timeout: 10000 });
    await orderRow.locator('button').first().click();

    const orderDetailsModal = page.locator('.modal:has-text("Order Details"), [role="dialog"]:has-text("Order Details")').first();
    await expect(orderDetailsModal).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'test-results/lifecycle-order-details-start.png' });

    const startButton = orderDetailsModal.getByRole('button', { name: /start fueling|start/i });
    if (await startButton.isEnabled({ timeout: 5000 })) {
      await startButton.click();
      await expect(page.getByText(/fueling started|updated|success/i)).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: 'test-results/lifecycle-order-started.png' });
    } else {
      console.log('Start Fueling button not found or not enabled.');
      await page.screenshot({ path: 'test-results/lifecycle-start-button-issue.png' });
      const closeButton = orderDetailsModal.getByRole('button', { name: /close|cancel|ok/i });
      if (await closeButton.isVisible()) await closeButton.click();
    }
  });

  test('LST completes the order with meter readings', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');

    const orderIdentifier = testData.orderNumber || testData.tailNumber;
    console.log(`LST Complete Order: Searching for order: ${orderIdentifier}`);
    const orderRow = page.locator(`tr:has-text("${orderIdentifier}"), [role="row"]:has-text("${orderIdentifier}")`).first();
    await expect(orderRow).toBeVisible({ timeout: 10000 });
    await orderRow.locator('button').first().click();

    const orderDetailsModal = page.locator('.modal:has-text("Order Details"), [role="dialog"]:has-text("Order Details")').first();
    await expect(orderDetailsModal).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'test-results/lifecycle-order-details-complete-action.png' });

    const completeOrderButton = orderDetailsModal.getByRole('button', { name: /complete order|complete/i });
    if (await completeOrderButton.isEnabled({ timeout: 5000 })) {
      await completeOrderButton.click();
      
      const meterModal = page.locator('.modal:has-text("Meter Readings"), [role="dialog"]:has-text("Meter Readings")').first();
      await expect(meterModal).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: 'test-results/lifecycle-meter-readings-modal.png' });

      await meterModal.getByLabel(/start meter/i).fill('1000');
      await meterModal.getByLabel(/end meter/i).fill('1500');
      const notesField = meterModal.getByLabel(/notes|comments/i);
      if (await notesField.count() > 0) {
        await notesField.fill('Test fueling completed successfully by LST.');
      }
      await page.screenshot({ path: 'test-results/lifecycle-meter-readings-filled.png' });
      await meterModal.getByRole('button', { name: /submit|save|confirm complete/i }).click();
      
      await expect(page.getByText(/order completed|success/i)).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: 'test-results/lifecycle-order-completed-by-lst.png' });
    } else {
      console.log('Complete Order button not found or not enabled.');
      await page.screenshot({ path: 'test-results/lifecycle-complete-button-issue.png' });
      const closeButton = orderDetailsModal.getByRole('button', { name: /close|cancel|ok/i });
      if (await closeButton.isVisible()) await closeButton.click();
    }
  });
});

test.describe('Fuel Order Lifecycle - Admin Review Task', () => {
  test.use({ storageState: path.resolve(__dirname, 'tests/.auth/admin.json') });

  test('Admin reviews the completed order', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');
    
    const orderIdentifier = testData.orderNumber || testData.tailNumber;
    console.log(`Admin Review: Searching for order: ${orderIdentifier}`);
    const orderRow = page.locator(`tr:has-text("${orderIdentifier}"), [role="row"]:has-text("${orderIdentifier}")`).first();
    await expect(orderRow).toBeVisible({ timeout: 10000 });
    await orderRow.locator('button').first().click();
    
    const orderDetailsModal = page.locator('.modal:has-text("Order Details"), [role="dialog"]:has-text("Order Details")').first();
    await expect(orderDetailsModal).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'test-results/lifecycle-order-details-review.png' });
    
    const reviewButton = orderDetailsModal.getByRole('button', { name: /review order|mark as reviewed/i });
    if (await reviewButton.isEnabled({ timeout: 5000 })) {
      await reviewButton.click();
      // Handle potential confirmation dialog for review action
      const confirmDialog = page.locator('[role="dialog"]:has-text("Confirm Review"), .confirmation-dialog').first();
      if (await confirmDialog.isVisible({timeout: 2000})){
          await confirmDialog.getByRole('button', {name: /confirm|yes|proceed/i}).click();
      }
      await expect(page.getByText(/order reviewed|success/i)).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: 'test-results/lifecycle-order-reviewed.png' });
    } else {
      console.log('Review Order button not found or not enabled.');
      await page.screenshot({ path: 'test-results/lifecycle-review-button-issue.png' });
      const closeButton = orderDetailsModal.getByRole('button', { name: /close|cancel|ok/i });
      if (await closeButton.isVisible()) await closeButton.click();
    }
  });

  test('Lifecycle complete - verify order status', async ({ page }) => {
    await page.goto('/orders');
    await page.waitForLoadState('networkidle');
    
    const orderIdentifier = testData.orderNumber || testData.tailNumber;
    console.log(`Final Verification: Searching for order: ${orderIdentifier}`);
    const orderRow = page.locator(`tr:has-text("${orderIdentifier}"), [role="row"]:has-text("${orderIdentifier}")`).first();
    await expect(orderRow).toBeVisible({ timeout: 10000 });
    
    const statusCell = orderRow.locator('td:has-text("Reviewed"), [role="cell"]:has-text("Reviewed")').first();
    await expect(statusCell).toBeVisible({ timeout: 5000 });
    
    await page.screenshot({ path: 'test-results/lifecycle-final-status.png' });
    console.log('Fuel order lifecycle test completed successfully');
  });
}); 