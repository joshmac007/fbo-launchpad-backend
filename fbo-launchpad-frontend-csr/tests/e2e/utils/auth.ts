import { Page, Locator } from '@playwright/test';

/**
 * Authentication utility for Playwright tests
 * Contains functions for user authentication and login state management
 */

// Flexible selectors for login form elements
const EMAIL_SELECTORS = [
  'input[type="email"]', 
  'input[name="email"]',
  '[placeholder*="email" i]',
  'input[id*="email" i]',
  'label:has-text("Email") + input, label:has-text("Email") ~ input'
];

const PASSWORD_SELECTORS = [
  'input[type="password"]',
  'input[name="password"]',
  '[placeholder*="password" i]',
  'input[id*="password" i]',
  'label:has-text("Password") + input, label:has-text("Password") ~ input'
];

const BUTTON_SELECTORS = [
  'button[type="submit"]',
  'button:has-text("Log In")',
  'button:has-text("Sign In")',
  'button:has-text("Login")',
  'input[type="submit"]',
  'form button'
];

/**
 * Find the first matching form element using multiple selectors
 * @param page The Playwright page object
 * @param selectors Array of CSS selectors to try
 * @returns The first matching locator or null if none found
 */
async function findFormElement(page: Page, selectors: string[]): Promise<Locator | null> {
  for (const selector of selectors) {
    const locator = page.locator(selector);
    if (await locator.count() > 0) {
      return locator.first();
    }
  }
  return null;
}

/**
 * Login to the application with the specified credentials
 * @param page The Playwright page object
 * @param email The user's email (defaults to admin@fbolaunchpad.com)
 * @param password The user's password (defaults to Admin123!)
 * @param baseURL Optional base URL for navigation
 * @returns Promise that resolves when login is complete
 */
export async function login(
  page: Page, 
  email: string = 'admin@fbolaunchpad.com', 
  password: string = 'Admin123!',
  baseURL?: string
): Promise<void> {
  const loginURL = baseURL ? `${baseURL.replace(/\/$/, '')}/login` : '/login';
  
  // Navigate to login page
  console.log(`Navigating to login page: ${loginURL}`);
  try {
    await page.goto(loginURL, { waitUntil: 'networkidle', timeout: 10000 });
    console.log(`Successfully navigated to login page: ${page.url()}`);
  } catch (e: any) {
    console.error(`Error navigating to login page (${loginURL}): ${e.message}`);
    await page.screenshot({ path: 'test-results/error_navigating_to_login.png' });
    throw e; // Re-throw to stop login if navigation fails
  }
  
  // Wait for the page to load (redundant if waitUntil: 'networkidle' is used, but safe)
  await page.waitForLoadState('networkidle');
  
  // Find form elements using flexible selectors
  const emailInput = await findFormElement(page, EMAIL_SELECTORS);
  const passwordInput = await findFormElement(page, PASSWORD_SELECTORS);
  const loginButton = await findFormElement(page, BUTTON_SELECTORS);
  
  // Verify all elements were found
  if (!emailInput || !passwordInput || !loginButton) {
    let errorMessage = 'Login form elements not found:';
    if (!emailInput) errorMessage += ' [Email Input Missing]';
    if (!passwordInput) errorMessage += ' [Password Input Missing]';
    if (!loginButton) errorMessage += ' [Login Button Missing]';
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/login-form-error.png' });
    
    throw new Error(errorMessage);
  }
  
  // Fill in login credentials
  await emailInput.fill(email);
  await passwordInput.fill(password);
  
  // Click login button
  await loginButton.click();
  
  // Wait for navigation to complete or timeout after 10 seconds
  try {
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  } catch (error) {
    // If navigation timeout occurs, check where we are
    if (page.url().includes('login')) {
      // Still on login page, check for error messages
      // Broaden the error message selector and wait for it to be potentially visible
      const errorLocator = page.locator('.error, [role="alert"], .text-danger, .text-red-500, [class*="error" i], [class*="invalid" i], div:contains("Invalid credentials"), div:contains("Login failed")').first();
      let errorText = 'No specific error message found on login page.';
      try {
        await errorLocator.waitFor({ timeout: 3000 }); // Wait briefly for error to appear
        if (await errorLocator.isVisible()) {
          errorText = await errorLocator.textContent() || 'Error element found but no text.';
        }
      } catch (e) {
        // Error locator didn't become visible or timed out
        console.log('Could not find or make visible a specific login error message.');
      }
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/login-failed.png' });
      
      throw new Error(`Login failed. Last URL: ${page.url()}. Error: ${errorText}`);
    }
    
    // Otherwise we are on a different page - might be acceptable redirect for some user roles
    console.log(`Login redirected to: ${page.url()}`);
  }
}

/**
 * Create an authenticated state context for reuse across tests
 * @param page The Playwright page object 
 * @param userType Optional role type (admin, csr, lst) for different permissions
 * @returns Promise that resolves when authentication is complete
 */
export async function setupAuthenticatedState(
  page: Page,
  userType: 'admin' | 'csr' | 'lst' = 'csr'
): Promise<void> {
  // Set credentials based on user type
  let email = 'csr@fbolaunchpad.com';
  let password = 'Csr123!';
  
  switch (userType) {
    case 'admin':
      email = 'admin@fbolaunchpad.com';
      password = 'Admin123!';
      break;
    case 'csr':
      email = 'csr@fbolaunchpad.com';
      password = 'Csr123!';
      break;
    case 'lst':
      email = 'lst@fbolaunchpad.com';
      password = 'Lst123!';
      break;
  }
  
  // Perform login
  await login(page, email, password);
  
  // Store authentication state in localStorage (if possible)
  try {
    await page.evaluate((role) => {
      localStorage.setItem('user_role', role);
    }, userType);
  } catch (error) {
    console.warn('Unable to set localStorage for user_role:', error);
  }
}

/**
 * Log out of the application
 * @param page The Playwright page object
 * @returns Promise that resolves when logout is complete
 */
export async function logout(page: Page): Promise<void> {
  // Navigate to a protected page
  await page.goto('/dashboard');
  
  try {
    // Try different selectors for user menu
    const userMenuSelectors = [
      '[data-testid="user-menu"]',
      '.user-menu',
      'button:has(svg)',
      'nav button:has-text("Account")',
      'header button:last-child'
    ];
    
    const userMenu = await findFormElement(page, userMenuSelectors);
    if (!userMenu) {
      throw new Error('User menu not found');
    }
    
    await userMenu.click();
    
    // Try different selectors for logout button
    const logoutSelectors = [
      '[data-testid="logout-button"]',
      'button:has-text("Logout")',
      'a:has-text("Logout")',
      'button:has-text("Sign Out")',
      'a:has-text("Sign Out")'
    ];
    
    const logoutButton = await findFormElement(page, logoutSelectors);
    if (!logoutButton) {
      throw new Error('Logout button not found');
    }
    
    await logoutButton.click();
    
    // Wait for redirection to login page
    await page.waitForURL('**/login');
    
    // Verify logout by checking for login form
    const emailInput = await findFormElement(page, EMAIL_SELECTORS);
    if (!emailInput) {
      throw new Error('Logout failed, login form not found after logout');
    }
  } catch (error) {
    // Fallback: Clear localStorage and cookies manually
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    await page.context().clearCookies();
    
    // Navigate to login page to ensure logout
    await page.goto('/login');
  }
} 