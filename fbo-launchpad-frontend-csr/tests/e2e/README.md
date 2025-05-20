# Fuel Orders E2E Testing

This directory contains end-to-end tests for the Fuel Orders page using Playwright.

## Test Files

- `fuelOrders.spec.ts` - Basic functionality tests for the Fuel Orders page
- `fuel-orders-role-based.spec.ts` - Role-specific tests for Admin, CSR, and LST users
- `fuel-order-create.spec.ts` - Simple test for creating a new fuel order
- `fuel-order-lifecycle.spec.ts` - Complete lifecycle test from order creation to review

## Running Tests

### Setup

Before running tests, ensure you have the required dependencies:

```bash
npm install
```

### Authentication Setup

The tests require pre-authenticated states for different user roles. Run:

```bash
npm run test:e2e:auth
```

This creates authentication state files in the `.auth` directory for different user roles.

### Running Basic Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run with browser visible
npm run test:e2e:headed

# Run in debug mode
npm run test:e2e:debug
```

### Running Role-Based Tests

```bash
npm run test:e2e:roles
```

### Running Lifecycle Test

The lifecycle test demonstrates the complete flow of a fuel order:

1. Admin creates a new order
2. LST acknowledges the order
3. LST sets order to en route
4. LST starts fueling
5. LST completes the order with meter readings
6. Admin reviews the completed order

Run the lifecycle test with:

```bash
# Run lifecycle test
npm run test:e2e:lifecycle

# Run with browser visible
npm run test:e2e:lifecycle:headed

# Run in debug mode
npm run test:e2e:lifecycle:debug

# Run with Firefox
npm run test:e2e:lifecycle:firefox
```

### Browser Testing

For cross-browser testing:

```bash
# Default browser (Chromium)
npm run test:browser

# Specific browsers
npm run test:browser:chrome
npm run test:browser:firefox
npm run test:browser:safari
npm run test:browser:mobile

# Debug mode
npm run test:browser:debug
```

## Test Artifacts

Screenshots and test reports are saved in:

- `test-results/` - Screenshots taken during test execution
- `playwright-report/` - HTML report of test results

View the report after running tests with:

```bash
npx playwright show-report
```

## Debugging Tests

For troubleshooting:

```bash
# Test authentication is working
npm run test:e2e:debug-auth

# Run lifecycle test in debug mode
npm run test:e2e:lifecycle:debug
```

## Custom Test Runner

A custom test runner script (`run-e2e-tests.sh`) is available that:

1. Checks if the application is running (starts it if not)
2. Runs the specified test with options
3. Generates a test report
4. Stops the application if it was started by the script

Options:
```
./run-e2e-tests.sh [--test=testfile.spec.ts] [--browser=chromium|firefox|webkit] [--headed] [--debug]
``` 