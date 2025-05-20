import { test, expect, Locator } from '@playwright/test';

/**
 * Authentication Debug Test Suite
 * Purpose: Identify and fix authentication issues in Playwright tests
 */
test.describe('Authentication Flow Debug', () => {
  // Run tests serially
  test.describe.configure({ mode: 'serial' });
  
  // Test variables for flexible login selectors
  const EMAIL_SELECTORS = [
    'input[type="email"]', 
    'input[name="email"]',
    '[placeholder*="email" i]',
    'input[id*="email" i]'
  ];
  
  const PASSWORD_SELECTORS = [
    'input[type="password"]',
    'input[name="password"]',
    '[placeholder*="password" i]',
    'input[id*="password" i]'
  ];
  
  const BUTTON_SELECTORS = [
    'button[type="submit"]',
    'button:has-text("Log In")',
    'button:has-text("Sign In")',
    'button:has-text("Login")',
    'input[type="submit"]'
  ];
  
  // Take screenshots at key points to help debug
  test('debug login page elements', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    console.log('On login page');
    
    // Take a screenshot to see what's on the page
    await page.screenshot({ path: 'test-results/login-page.png' });
    
    // Log HTML structure of the login form to understand elements
    const formHTML = await page.evaluate(() => {
      const form = document.querySelector('form');
      return form ? form.outerHTML : 'No form found';
    });
    
    console.log('Form HTML:', formHTML);
    
    // Check for email input using multiple selectors
    let emailFound = false;
    for (const selector of EMAIL_SELECTORS) {
      const count = await page.locator(selector).count();
      console.log(`Email selector "${selector}": ${count} elements found`);
      if (count > 0) {
        emailFound = true;
        await page.locator(selector).first().highlight();
        await page.screenshot({ path: `test-results/email-input-${selector.replace(/[^\w]/g, '-')}.png` });
      }
    }
    
    // Check for password input using multiple selectors
    let passwordFound = false;
    for (const selector of PASSWORD_SELECTORS) {
      const count = await page.locator(selector).count();
      console.log(`Password selector "${selector}": ${count} elements found`);
      if (count > 0) {
        passwordFound = true;
        await page.locator(selector).first().highlight();
        await page.screenshot({ path: `test-results/password-input-${selector.replace(/[^\w]/g, '-')}.png` });
      }
    }
    
    // Check for login button using multiple selectors
    let buttonFound = false;
    for (const selector of BUTTON_SELECTORS) {
      const count = await page.locator(selector).count();
      console.log(`Button selector "${selector}": ${count} elements found`);
      if (count > 0) {
        buttonFound = true;
        await page.locator(selector).first().highlight();
        await page.screenshot({ path: `test-results/login-button-${selector.replace(/[^\w]/g, '-')}.png` });
      }
    }
    
    // Report overall findings
    console.log('Authentication form discovery:');
    console.log(`- Email input found: ${emailFound}`);
    console.log(`- Password input found: ${passwordFound}`);
    console.log(`- Login button found: ${buttonFound}`);
  });
  
  // Try to login with the best selectors found
  test('attempt login with best selectors', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Take a screenshot of the initial state
    await page.screenshot({ path: 'test-results/before-login-attempt.png' });
    
    // Use the first working selector for each element
    let emailInput: Locator | null = null;
    for (const selector of EMAIL_SELECTORS) {
      const locator = page.locator(selector);
      if (await locator.count() > 0) {
        emailInput = locator.first();
        console.log(`Using email selector: ${selector}`);
        break;
      }
    }
    
    let passwordInput: Locator | null = null;
    for (const selector of PASSWORD_SELECTORS) {
      const locator = page.locator(selector);
      if (await locator.count() > 0) {
        passwordInput = locator.first();
        console.log(`Using password selector: ${selector}`);
        break;
      }
    }
    
    let loginButton: Locator | null = null;
    for (const selector of BUTTON_SELECTORS) {
      const locator = page.locator(selector);
      if (await locator.count() > 0) {
        loginButton = locator.first();
        console.log(`Using button selector: ${selector}`);
        break;
      }
    }
    
    // If all elements are found, attempt login
    if (emailInput && passwordInput && loginButton) {
      console.log('All form elements found, attempting login');
      
      // Fill credentials
      await emailInput.fill('admin@fbolaunchpad.com');
      await passwordInput.fill('Admin123!');
      
      // Take screenshot before clicking login
      await page.screenshot({ path: 'test-results/filled-login-form.png' });
      
      // Click login button
      await loginButton.click();
      console.log('Clicked login button');
      
      // Wait for navigation or timeout
      try {
        await page.waitForURL('**/dashboard', { timeout: 10000 });
        console.log('Successfully navigated to dashboard');
        await page.screenshot({ path: 'test-results/successful-login.png' });
      } catch (error) {
        console.log('Navigation timeout, checking current URL');
        console.log('Current URL:', page.url());
        await page.screenshot({ path: 'test-results/after-login-timeout.png' });
        
        // Check if we're still on the login page
        if (page.url().includes('login')) {
          console.log('Still on login page, login likely failed');
          
          // Check for error messages
          const errorText = await page.locator('.error, [role="alert"]').textContent();
          console.log('Error message (if any):', errorText);
        } else {
          console.log('Not on login page, may have redirected elsewhere');
        }
      }
    } else {
      console.log('Missing form elements:');
      console.log(`- Email input: ${emailInput ? 'Found' : 'Missing'}`);
      console.log(`- Password input: ${passwordInput ? 'Found' : 'Missing'}`);
      console.log(`- Login button: ${loginButton ? 'Found' : 'Missing'}`);
      await page.screenshot({ path: 'test-results/missing-form-elements.png' });
    }
  });
}); 