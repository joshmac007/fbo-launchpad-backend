# FBO LaunchPad Frontend Testing Guide

This document outlines the testing frameworks, tools, and procedures for the FBO LaunchPad frontend application, with a focus on the Fuel Orders Page feature.

## Testing Frameworks

The project uses the following testing frameworks:

- **Vitest**: Primary testing framework for unit and integration tests
- **@testing-library/react**: For React component testing
- **@testing-library/user-event**: For simulating user interactions
- **Playwright**: For cross-browser end-to-end testing

## Unit & Integration Tests

Unit and integration tests are written using Vitest and React Testing Library. These tests ensure components work correctly in isolation and when integrated with other components.

### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Cross-Browser Testing

We've implemented two approaches for cross-browser testing:

1. **Automated Testing with Playwright**: For consistent, repeatable tests across multiple browsers
2. **Manual Testing with Helper Tools**: For human verification of visual consistency and functional behavior

### Automated Testing with Playwright

Playwright tests can be found in the `tests/e2e` directory.

```bash
# Install Playwright browsers
npx playwright install

# Run Playwright tests in headless mode (all browsers)
npx playwright test

# Run tests for specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run tests with browser UI visible
npx playwright test --headed
```

### Manual Testing Tools

We've created several tools to streamline manual browser testing:

#### 1. Browser Compatibility Test Script

This script helps you test the application across multiple browsers by automatically opening them with the correct URL.

```bash
# Make script executable if not already
chmod +x browser-compatibility-test.sh

# Run the script
./browser-compatibility-test.sh
```

#### 2. Responsive Design Tester

A visual tool for testing the application across multiple device sizes simultaneously.

```bash
# Make script executable if not already
chmod +x test-responsive.sh

# Run the script to open the testing tool
./test-responsive.sh
```

#### 3. Testing Checklist

For systematic manual testing, follow the checklist in `browser-testing-checklist.md`.

## Documenting Test Results

After completing browser testing, document your findings in `memory-bank/browser-compatibility.md`. Include:

- Browsers and versions tested
- Any browser-specific issues encountered
- Visual or functional differences between browsers
- Mobile/responsive behavior observations

## Best Practices

1. **Test-Driven Development**: Write tests before implementing features when possible
2. **Comprehensive Coverage**: Aim for high test coverage, focusing on critical user flows
3. **Regular Testing**: Run tests frequently during development
4. **Browser Testing**: Test across various browsers prior to releases
5. **Responsive Testing**: Verify UI works well across different screen sizes
6. **Document Issues**: Record any browser-specific issues in browser-compatibility.md

## Testing Standards

- Unit tests should be isolated and fast
- Integration tests should verify component interactions
- E2E tests should cover critical user flows
- Visual tests should verify UI consistency across browsers
- All tests should be maintainable and have clear objectives

## Continuous Integration

Tests are run automatically as part of the CI/CD pipeline to ensure code quality before deployment. 