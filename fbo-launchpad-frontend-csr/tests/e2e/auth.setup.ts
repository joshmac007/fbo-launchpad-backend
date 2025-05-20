/// <reference types="node" />

import { FullConfig, chromium } from '@playwright/test';
import { login } from './utils/auth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // For ES module __dirname equivalent

// Get current directory in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Global Authentication Setup
 * 
 * This function runs once before all tests. It logs in as different users
 * and saves their authentication states (cookies, localStorage) to JSON files.
 * These files are then used by tests via `test.use({ storageState: '...' })`
 * to start tests in an authenticated state, significantly speeding up execution.
 */
async function globalSetup(config: FullConfig) {
  console.log('Starting global authentication setup...');

  const authDir = path.resolve(__dirname, '../.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
    console.log(`Created .auth directory at ${authDir}`);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const baseURL = config.projects[0].use?.baseURL || 'http://localhost:3000';

  const navigateToPage = async (url: string, description: string) => {
    try {
      console.log(`Navigating to ${description}: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      console.log(`Successfully navigated to ${description}: ${page.url()}`);
    } catch (e: any) {
      console.error(`Error navigating to ${description} (${url}): ${e.message}`);
      await page.screenshot({ path: path.join(authDir, `error_navigating_to_${description.toLowerCase().replace(/\s+/g, '_')}.png`) });
      throw e; // Re-throw to stop setup if base navigation fails
    }
  };

  // Initial navigation to establish context
  await navigateToPage(baseURL, 'Base URL');

  // Admin user
  try {
    console.log('Starting Admin user authentication...');
    await login(page, 'admin@fbolaunchpad.com', 'Admin123!', baseURL);
    await page.waitForURL('**/dashboard', { timeout: 15000 }).catch((e) => 
      console.log('Admin: Did not redirect to dashboard within timeout, attempting to save auth state anyway. Error: ' + e.message)
    );
    await page.context().storageState({ path: path.join(authDir, 'admin.json') });
    console.log('Admin authentication state saved successfully.');
  } catch (error: any) {
    console.error(`CRITICAL: Failed to authenticate admin: ${error.message}`, error.stack);
    await page.screenshot({ path: path.join(authDir, 'admin-auth-CRITICAL-FAILURE.png') }); 
  }

  // Add a delay before next login
  console.log('Pausing for 10 seconds before CSR login attempt...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  console.log('Resuming for CSR login.');

  // CSR user
  await navigateToPage(baseURL, 'Base URL for CSR login attempt');
  try {
    console.log('Clearing context for CSR user...');
    await page.context().clearCookies(); 
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    console.log('Context cleared. Starting CSR user authentication...');
    await login(page, 'csr@fbolaunchpad.com', 'Csr123!', baseURL);
    await page.waitForURL('**/dashboard', { timeout: 15000 }).catch((e) => 
      console.log('CSR: Did not redirect to dashboard within timeout, attempting to save auth state anyway. Error: ' + e.message)
    );
    await page.context().storageState({ path: path.join(authDir, 'csr.json') });
    console.log('CSR authentication state saved successfully.');
  } catch (error: any) {
    console.error(`CRITICAL: Failed to authenticate CSR: ${error.message}`, error.stack);
    await page.screenshot({ path: path.join(authDir, 'csr-auth-CRITICAL-FAILURE.png') }); 
  }

  // Add a delay before next login
  console.log('Pausing for 10 seconds before LST login attempt...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  console.log('Resuming for LST login.');

  // LST user
  await navigateToPage(baseURL, 'Base URL for LST login attempt');
  try {
    console.log('Clearing context for LST user...');
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    console.log('Context cleared. Starting LST user authentication...');
    await login(page, 'lst@fbolaunchpad.com', 'Lst123!', baseURL);
    await page.waitForURL('**/dashboard', { timeout: 15000 }).catch((e) => 
      console.log('LST: Did not redirect to dashboard within timeout, attempting to save auth state anyway. Error: ' + e.message)
    );
    await page.context().storageState({ path: path.join(authDir, 'lst.json') });
    console.log('LST authentication state saved successfully.');
  } catch (error: any) {
    console.error(`CRITICAL: Failed to authenticate LST: ${error.message}`, error.stack);
    await page.screenshot({ path: path.join(authDir, 'lst-auth-CRITICAL-FAILURE.png') }); 
  }

  console.log('Closing browser after global setup.');
  await browser.close();
  console.log('Global authentication setup finished.');
}

export default globalSetup; 