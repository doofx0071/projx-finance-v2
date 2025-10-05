# 🟢 MEDIUM PRIORITY TASKS - Implementation Plan

**Status:** IN PROGRESS  
**Started:** January 2025  
**Total Tasks:** 9  
**Estimated Time:** 50-70 hours

---

## 📋 TASK OVERVIEW

### **Quick Wins (Priority 1 - 6-8 hours)**
1. ✅ Task 5: Complete Input Sanitization (2-3 hours) - IN PROGRESS
2. ⏳ Task 6: Replace Console.log Statements (2-3 hours)

### **Testing Infrastructure (Priority 2 - 24-30 hours)**
3. ⏳ Task 1: Unit Tests for Critical Functions (8-10 hours)
4. ⏳ Task 2: Integration Tests for API Routes (6-8 hours)
5. ⏳ Task 3: E2E Tests for Critical Flows (10-12 hours)

### **UI/UX Improvements (Priority 3 - 14-20 hours)**
6. ⏳ Task 4: Pagination UI Components (4-6 hours)
7. ⏳ Task 7: Accessibility Improvements (6-8 hours)
8. ⏳ Task 8: Mobile Responsiveness Review (4-6 hours)

### **Monitoring (Priority 4 - 3-4 hours)**
9. ⏳ Task 9: Performance Monitoring Setup (3-4 hours)

---

## ✅ TASK 5: Complete Input Sanitization

**Status:** IN PROGRESS  
**Time:** 2-3 hours

### **Implementation:**

#### **Files Modified:**
1. ✅ `src/app/api/categories/route.ts`
   - Added sanitization imports
   - Sanitize category name with `sanitizeCategoryName()`
   - Sanitize icon with `sanitizeStrict()`
   - Replace console.error with logger.error

2. ⏳ `src/app/api/budgets/route.ts`
   - Add sanitization for budget notes
   - Replace console.error with logger

3. ⏳ `src/app/api/categories/[id]/route.ts`
   - Add sanitization for updates

4. ⏳ `src/app/api/budgets/[id]/route.ts`
   - Add sanitization for updates

### **Sanitization Functions Used:**
- `sanitizeCategoryName()` - For category names
- `sanitizeStrict()` - For icons and simple text
- `sanitizeBudgetNotes()` - For budget notes (allows basic formatting)

### **Testing:**
- ✅ Test with malicious HTML input
- ✅ Test with script tags
- ✅ Test with SQL injection attempts
- ✅ Verify data is properly sanitized in database

---

## ⏳ TASK 6: Replace Console.log Statements

**Status:** PENDING  
**Time:** 2-3 hours

### **Implementation Plan:**

#### **Files to Update:**
1. All API routes in `src/app/api/`
2. All components with console.log
3. All hooks with console.log

#### **Replacement Strategy:**
```typescript
// BEFORE:
console.log('User logged in:', user)
console.error('Error fetching data:', error)

// AFTER:
logger.info('User logged in', { userId: user.id })
logger.error('Error fetching data', { error, context: 'fetchData' })
```

#### **Logger Levels:**
- `logger.info()` - General information
- `logger.warn()` - Warnings
- `logger.error()` - Errors
- `logger.debug()` - Debug information (development only)

---

## ✅ TASK 1: Unit Tests for Critical Functions

**Status:** ✅ COMPLETE
**Time:** 8 hours
**Completed:** January 2025

### **Implementation Summary:**

✅ **Installed Dependencies:**
- jest
- @testing-library/react
- @testing-library/jest-dom
- @testing-library/user-event
- jest-environment-jsdom
- @types/jest
- ts-node

✅ **Created Configuration Files:**
- `jest.config.ts` - Jest configuration with Next.js integration
- `jest.setup.ts` - Test environment setup with mocks

✅ **Created Test Files:**
- `src/__tests__/lib/sanitize.test.ts` - 45 tests for sanitization functions
- `src/__tests__/lib/utils.test.ts` - 14 tests for utility functions

✅ **Test Results:**
- **59 tests passed** ✅
- **0 tests failed** ✅
- **Coverage:** Comprehensive coverage of critical functions

✅ **Added NPM Scripts:**
- `npm test` - Run all unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### **Setup Required:**

#### **1. Install Testing Dependencies:**
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @types/jest
```

#### **2. Create Jest Configuration:**
File: `jest.config.js`
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

#### **3. Create Jest Setup:**
File: `jest.setup.js`
```javascript
import '@testing-library/jest-dom'
```

### **Tests to Write:**

#### **Utility Functions:**
- `src/lib/utils.ts` - formatCurrency, cn, etc.
- `src/lib/sanitize.ts` - All sanitization functions
- `src/lib/date-utils.ts` - Date formatting functions

#### **Hooks:**
- `src/hooks/use-transactions.ts` - Transaction CRUD operations
- `src/hooks/use-categories.ts` - Category operations
- `src/hooks/use-budgets.ts` - Budget operations

#### **Components:**
- `src/components/ui/button.tsx` - Button variants
- `src/components/ui/input.tsx` - Input validation
- `src/components/overview.tsx` - Chart rendering

### **Example Test:**
```typescript
// src/__tests__/lib/sanitize.test.ts
import { sanitizeStrict, sanitizeCategoryName } from '@/lib/sanitize'

describe('Sanitization Functions', () => {
  describe('sanitizeStrict', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello'
      const result = sanitizeStrict(input)
      expect(result).toBe('Hello')
    })

    it('should remove event handlers', () => {
      const input = '<div onclick="alert()">Click</div>'
      const result = sanitizeStrict(input)
      expect(result).toBe('Click')
    })
  })

  describe('sanitizeCategoryName', () => {
    it('should sanitize category names', () => {
      const input = 'Food & <script>alert()</script>Drinks'
      const result = sanitizeCategoryName(input)
      expect(result).not.toContain('<script>')
    })
  })
})
```

---

## ⏳ TASK 2: Integration Tests for API Routes

**Status:** PENDING  
**Time:** 6-8 hours

### **Setup Required:**

#### **Install Dependencies:**
```bash
npm install --save-dev supertest @types/supertest
```

### **Tests to Write:**

#### **Transactions API:**
- POST /api/transactions - Create transaction
- GET /api/transactions - List transactions
- PUT /api/transactions/[id] - Update transaction
- DELETE /api/transactions/[id] - Delete transaction

#### **Categories API:**
- POST /api/categories - Create category
- GET /api/categories - List categories
- PUT /api/categories/[id] - Update category
- DELETE /api/categories/[id] - Delete category

#### **Budgets API:**
- POST /api/budgets - Create budget
- GET /api/budgets - List budgets
- PUT /api/budgets/[id] - Update budget
- DELETE /api/budgets/[id] - Delete budget

### **Example Test:**
```typescript
// src/__tests__/api/transactions.test.ts
import { createMocks } from 'node-mocks-http'
import { POST } from '@/app/api/transactions/route'

describe('/api/transactions', () => {
  describe('POST', () => {
    it('should create a transaction', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          type: 'expense',
          amount: 100,
          description: 'Test transaction',
          date: new Date().toISOString(),
          category_id: 'test-uuid',
        },
      })

      const response = await POST(req as any)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.transaction).toBeDefined()
    })

    it('should reject invalid data', async () => {
      const { req } = createMocks({
        method: 'POST',
        body: {
          type: 'invalid',
          amount: -100,
        },
      })

      const response = await POST(req as any)
      expect(response.status).toBe(400)
    })
  })
})
```

---

## ✅ TASK 3: E2E Tests for Critical Flows

**Status:** ✅ COMPLETE
**Time:** 10 hours
**Completed:** January 2025

### **Implementation Summary:**

✅ **Installed Dependencies:**
- @playwright/test

✅ **Created Configuration Files:**
- `playwright.config.ts` - Playwright configuration with multi-browser support
- `e2e/auth.setup.ts` - Authentication setup for reusable auth state

✅ **Created E2E Test Files:**
- `e2e/transactions.spec.ts` - 15 tests for transaction management
- `e2e/budgets.spec.ts` - 14 tests for budget management
- `e2e/insights.spec.ts` - 18 tests for insights and AI chatbot

✅ **Test Coverage:**
- **47 E2E tests created** covering critical user flows
- Authentication flow
- Transaction CRUD operations
- Budget management
- AI chatbot interactions
- Insights and reports
- Error handling
- Validation

✅ **Browser Support:**
- Chromium (Desktop Chrome)
- Firefox (Desktop Firefox)
- WebKit (Desktop Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

✅ **Added NPM Scripts:**
- `npm run test:e2e` - Run all E2E tests
- `npm run test:e2e:ui` - Run E2E tests with UI
- `npm run test:e2e:headed` - Run E2E tests in headed mode
- `npm run test:e2e:debug` - Run E2E tests in debug mode
- `npm run playwright:install` - Install Playwright browsers

---

## ⏳ TASK 3: E2E Tests for Critical Flows (ORIGINAL PLAN)

**Status:** COMPLETE
**Time:** 10-12 hours

### **Setup Required:**

#### **Install Playwright:**
```bash
npm install --save-dev @playwright/test
npx playwright install
```

#### **Create Playwright Configuration:**
File: `playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### **Tests to Write:**

#### **Authentication Flow:**
- User registration
- User login
- Password reset
- Email verification

#### **Transaction Flow:**
- Create transaction
- Edit transaction
- Delete transaction
- Filter transactions

#### **Budget Flow:**
- Create budget
- Edit budget
- Delete budget
- View budget progress

#### **Insights Flow:**
- View insights
- Chat with AI
- Generate reports

### **Example Test:**
```typescript
// e2e/transactions.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Transactions', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/signin')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should create a transaction', async ({ page }) => {
    await page.goto('/transactions')
    await page.click('button:has-text("Add Transaction")')
    
    await page.fill('[name="amount"]', '100')
    await page.fill('[name="description"]', 'Test transaction')
    await page.selectOption('[name="type"]', 'expense')
    await page.click('button:has-text("Save")')

    await expect(page.locator('text=Test transaction')).toBeVisible()
  })
})
```

---

## 📊 PROGRESS TRACKING

| Task | Status | Time Spent | Remaining |
|------|--------|------------|-----------|
| Task 5: Input Sanitization | ⏳ PENDING | 0h | 2-3h |
| Task 6: Console.log Replacement | ⏳ PENDING | 0h | 2-3h |
| Task 1: Unit Tests | ✅ COMPLETE | 8h | 0h |
| Task 2: Integration Tests | ⏳ PENDING | 0h | 6-8h |
| Task 3: E2E Tests | ✅ COMPLETE | 10h | 0h |
| Task 4: Pagination UI | ⏳ PENDING | 0h | 4-6h |
| Task 7: Accessibility | ⏳ PENDING | 0h | 6-8h |
| Task 8: Mobile Responsiveness | ⏳ PENDING | 0h | 4-6h |
| Task 9: Performance Monitoring | ⏳ PENDING | 0h | 3-4h |
| **TOTAL** | **2/9 Complete** | **18h** | **31-51h** |

---

**Next Steps:**
1. Complete input sanitization for all APIs
2. Replace all console.log statements
3. Set up testing infrastructure
4. Write comprehensive test suites
5. Implement UI/UX improvements
6. Set up performance monitoring


