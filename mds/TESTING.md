# Testing Guide for PHPinancia

This document provides comprehensive information about testing in the PHPinancia application.

## Table of Contents

- [Overview](#overview)
- [Test Types](#test-types)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)

---

## Overview

PHPinancia uses a comprehensive testing strategy with three types of tests:

1. **Unit Tests** - Test individual functions and components in isolation
2. **Integration Tests** - Test API routes and data flow
3. **E2E Tests** - Test complete user flows in a real browser

**Testing Stack:**
- **Jest** - Unit and integration testing framework
- **React Testing Library** - Component testing utilities
- **Playwright** - End-to-end testing framework

**Coverage Target:** 70%+ code coverage for critical paths

---

## Test Types

### 1. Unit Tests

**Location:** `src/__tests__/`

**Purpose:** Test individual functions, utilities, and components in isolation

**Examples:**
- Utility functions (formatCurrency, formatDate, cn)
- Sanitization functions (sanitizeStrict, sanitizeBasic, etc.)
- Custom hooks (useTransactions, useCategories, useBudgets)
- UI components (Button, Input, Card, etc.)

**Run with:**
```bash
npm test
```

### 2. Integration Tests

**Location:** `src/__tests__/api/`

**Purpose:** Test API routes and database interactions

**Examples:**
- POST /api/transactions - Create transaction
- GET /api/transactions - List transactions
- PUT /api/transactions/[id] - Update transaction
- DELETE /api/transactions/[id] - Delete transaction

**Run with:**
```bash
npm test -- --testPathPattern=api
```

### 3. E2E Tests

**Location:** `e2e/`

**Purpose:** Test complete user flows in a real browser

**Examples:**
- User authentication flow
- Creating and managing transactions
- Budget creation and tracking
- AI chatbot interactions
- Insights and reports

**Run with:**
```bash
npm run test:e2e
```

---

## Setup

### Initial Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Install Playwright browsers:**
```bash
npm run playwright:install
```

3. **Set up test environment variables:**

Create a `.env.test` file:
```env
# Test Database (use a separate test database)
NEXT_PUBLIC_SUPABASE_URL=https://your-test-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-test-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-test-service-role-key

# Test User Credentials
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!

# Other test configs
UPSTASH_REDIS_REST_URL=https://test.upstash.io
UPSTASH_REDIS_REST_TOKEN=test-token
MISTRAL_API_KEY=test-mistral-key
```

4. **Create test user in Supabase:**

Run this SQL in your test database:
```sql
-- Create test user
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('test@example.com', crypt('TestPassword123!', gen_salt('bf')), NOW());
```

---

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- sanitize.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="sanitize"
```

### E2E Tests

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run E2E tests with UI (interactive mode)
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run specific E2E test file
npx playwright test e2e/transactions.spec.ts

# Run tests on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run All Tests

```bash
# Run unit tests + E2E tests
npm run test:all
```

---

## Writing Tests

### Unit Test Example

```typescript
// src/__tests__/lib/utils.test.ts
import { formatCurrency } from '@/lib/utils'

describe('formatCurrency', () => {
  it('should format positive amounts correctly', () => {
    const result = formatCurrency(1000)
    expect(result).toContain('1,000')
    expect(result).toContain('₱')
  })

  it('should format negative amounts correctly', () => {
    const result = formatCurrency(-500)
    expect(result).toContain('500')
    expect(result).toContain('-')
  })
})
```

### Component Test Example

```typescript
// src/__tests__/components/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click Me</Button>)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click Me</Button>)
    
    fireEvent.click(screen.getByText('Click Me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### E2E Test Example

```typescript
// e2e/transactions.spec.ts
import { test, expect } from '@playwright/test'

test('should create a new transaction', async ({ page }) => {
  await page.goto('/transactions')
  await page.click('button:has-text("Add Transaction")')
  
  await page.fill('input[name="amount"]', '150.50')
  await page.fill('input[name="description"]', 'Test Transaction')
  await page.click('button:has-text("Save")')
  
  await expect(page.locator('text=Test Transaction')).toBeVisible()
})
```

---

## Best Practices

### General

1. **Write tests first (TDD)** - Write failing tests, then implement features
2. **Test behavior, not implementation** - Focus on what the code does, not how
3. **Keep tests simple and focused** - One test should test one thing
4. **Use descriptive test names** - Test names should explain what is being tested
5. **Avoid test interdependence** - Tests should be able to run in any order

### Unit Tests

1. **Test edge cases** - Empty strings, null, undefined, negative numbers, etc.
2. **Mock external dependencies** - Mock API calls, database queries, etc.
3. **Test error handling** - Verify errors are handled gracefully
4. **Use data-driven tests** - Test multiple inputs with the same test logic

### E2E Tests

1. **Use data-testid attributes** - Add `data-testid` to elements for reliable selection
2. **Wait for elements** - Use `waitForSelector`, `waitForLoadState`, etc.
3. **Clean up test data** - Delete test data after tests complete
4. **Use Page Object Model** - Create reusable page objects for complex pages
5. **Test critical paths first** - Focus on user flows that generate revenue

---

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Coverage Reports

### View Coverage Report

After running `npm run test:coverage`, open:
```
coverage/lcov-report/index.html
```

### Coverage Thresholds

Current thresholds (defined in `jest.config.ts`):
- **Branches:** 70%
- **Functions:** 70%
- **Lines:** 70%
- **Statements:** 70%

---

## Troubleshooting

### Common Issues

**Issue:** Tests fail with "Cannot find module '@/...'"
**Solution:** Check `moduleNameMapper` in `jest.config.ts`

**Issue:** Playwright tests timeout
**Solution:** Increase timeout in `playwright.config.ts` or use `test.setTimeout(60000)`

**Issue:** Tests pass locally but fail in CI
**Solution:** Check environment variables, database state, and timing issues

**Issue:** Flaky E2E tests
**Solution:** Add proper waits, use `waitForLoadState('networkidle')`, avoid hard-coded timeouts

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated:** January 2025  
**Maintained by:** PHPinancia Development Team

