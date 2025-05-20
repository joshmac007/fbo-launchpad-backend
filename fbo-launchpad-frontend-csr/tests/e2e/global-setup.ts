import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import http from 'http';

/**
 * Global setup module for Playwright tests.
 * 
 * This runs once before all tests to:
 * 1. Create necessary directories for test artifacts
 * 2. Check if the development server is running
 * 3. Ensure the authentication setup is ready
 */
async function globalSetup() {
  console.log('Running global setup for Playwright tests...');
  
  // Create directories for test artifacts
  const directories = [
    '.auth',
    'test-results',
    'playwright-report'
  ];
  
  for (const dir of directories) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    } catch (error) {
      console.error(`Error creating directory ${dir}:`, error);
    }
  }
  
  // Check if development server is running
  const isServerRunning = await checkServer('localhost', 3000);
  if (!isServerRunning) {
    console.error('⚠️ Development server is not running on port 3000!');
    console.error('Tests may fail unless you start the server with "npm run dev"');
  } else {
    console.log('✅ Development server is running on port 3000');
  }
  
  // Check if authentication files exist
  const authFiles = [
    '.auth/admin.json',
    '.auth/csr.json',
    '.auth/lst.json'
  ];
  
  let allAuthFilesExist = true;
  for (const file of authFiles) {
    if (!fs.existsSync(file)) {
      allAuthFilesExist = false;
      console.log(`Authentication state file not found: ${file}`);
    }
  }
  
  if (!allAuthFilesExist) {
    console.log('Some authentication state files are missing.');
    console.log('This is normal for first run - auth.setup.ts will create them.');
  } else {
    console.log('✅ Authentication state files found');
  }
}

/**
 * Checks if a server is running on the specified host and port
 * @param host The host to check
 * @param port The port to check
 * @returns Promise resolving to true if server is running, false otherwise
 */
function checkServer(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get({
      hostname: host,
      port: port,
      path: '/',
      timeout: 3000
    }, (res) => {
      resolve(true);
      req.destroy();
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

export default globalSetup; 