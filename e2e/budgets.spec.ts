/**
 * E2E Tests for Budgets Flow
 * 
 * Tests the complete budget management flow:
 * - Creating budgets
 * - Viewing budgets
 * - Editing budgets
 * - Deleting budgets
 * - Budget progress tracking
 */

import { test, expect } from '@playwright/test'

test.describe('Budgets', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard (where budgets are displayed)
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('should display budgets section', async ({ page }) => {
    // Check for budgets section
    await expect(page.locator('text=Budgets')).toBeVisible()
    await expect(page.locator('button:has-text("Add Budget")')).toBeVisible()
  })

  test('should create a new budget', async ({ page }) => {
    // Click add budget button
    await page.click('button:has-text("Add Budget")')

    // Wait for modal
    await expect(page.locator('text=Add Budget')).toBeVisible()

    // Select category
    await page.click('button:has-text("Select category")')
    await page.click('[role="option"]:first-child')

    // Fill in amount
    await page.fill('input[name="amount"]', '5000')

    // Select period
    await page.selectOption('select[name="period"]', 'monthly')

    // Submit
    await page.click('button:has-text("Add Budget")')

    // Wait for success
    await page.waitForTimeout(1000)

    // Verify budget appears
    await expect(page.locator('text=₱5,000')).toBeVisible()
  })

  test('should create weekly budget', async ({ page }) => {
    await page.click('button:has-text("Add Budget")')
    await expect(page.locator('text=Add Budget')).toBeVisible()

    await page.click('button:has-text("Select category")')
    await page.click('[role="option"]:first-child')
    await page.fill('input[name="amount"]', '1000')
    await page.selectOption('select[name="period"]', 'weekly')

    await page.click('button:has-text("Add Budget")')
    await page.waitForTimeout(1000)

    await expect(page.locator('text=Weekly')).toBeVisible()
  })

  test('should create yearly budget', async ({ page }) => {
    await page.click('button:has-text("Add Budget")')
    await expect(page.locator('text=Add Budget')).toBeVisible()

    await page.click('button:has-text("Select category")')
    await page.click('[role="option"]:first-child')
    await page.fill('input[name="amount"]', '60000')
    await page.selectOption('select[name="period"]', 'yearly')

    await page.click('button:has-text("Add Budget")')
    await page.waitForTimeout(1000)

    await expect(page.locator('text=Yearly')).toBeVisible()
  })

  test('should edit an existing budget', async ({ page }) => {
    // Find and click edit button
    await page.click('[data-testid="edit-budget"]:first-child, button:has-text("Edit"):first-child')

    // Wait for edit modal
    await expect(page.locator('text=Edit Budget')).toBeVisible()

    // Update amount
    await page.fill('input[name="amount"]', '7500')

    // Save changes
    await page.click('button:has-text("Save")')

    // Wait for success
    await page.waitForTimeout(1000)

    // Verify updated budget
    await expect(page.locator('text=₱7,500')).toBeVisible()
  })

  test('should delete a budget', async ({ page }) => {
    // Get initial budget count
    const initialCount = await page.locator('[data-testid="budget-card"]').count()

    // Find and click delete button
    await page.click('[data-testid="delete-budget"]:first-child, button:has-text("Delete"):first-child')

    // Confirm deletion
    await expect(page.locator('text=Are you sure')).toBeVisible()
    await page.click('button:has-text("Delete")')

    // Wait for deletion
    await page.waitForTimeout(1000)

    // Verify budget count decreased
    const newCount = await page.locator('[data-testid="budget-card"]').count()
    expect(newCount).toBeLessThan(initialCount)
  })

  test('should display budget progress', async ({ page }) => {
    // Check for progress bars
    const progressBars = await page.locator('[role="progressbar"]').all()
    expect(progressBars.length).toBeGreaterThan(0)

    // Verify progress percentage is displayed
    await expect(page.locator('text=%')).toBeVisible()
  })

  test('should show budget warning when exceeded', async ({ page }) => {
    // Look for warning indicators (red color, warning icon, etc.)
    const warningElements = await page.locator('[data-status="exceeded"], .text-red-500').all()
    
    // If there are exceeded budgets, verify warning is shown
    if (warningElements.length > 0) {
      await expect(page.locator('text=exceeded, text=over budget')).toBeVisible()
    }
  })

  test('should filter budgets by period', async ({ page }) => {
    // Click filter dropdown
    await page.click('button:has-text("Filter")')

    // Select "Monthly only"
    await page.click('text=Monthly')

    // Wait for filter
    await page.waitForTimeout(500)

    // Verify only monthly budgets shown
    const budgets = await page.locator('[data-testid="budget-card"]').all()
    for (const budget of budgets) {
      const period = await budget.getAttribute('data-period')
      expect(period).toBe('monthly')
    }
  })

  test('should handle validation errors', async ({ page }) => {
    await page.click('button:has-text("Add Budget")')

    // Try to submit without filling required fields
    await page.click('button:has-text("Add Budget")')

    // Verify validation errors
    await expect(page.locator('text=required, text=Required')).toBeVisible()
  })

  test('should prevent duplicate budgets for same category', async ({ page }) => {
    // Create first budget
    await page.click('button:has-text("Add Budget")')
    await page.click('button:has-text("Select category")')
    const firstCategory = await page.locator('[role="option"]:first-child').textContent()
    await page.click('[role="option"]:first-child')
    await page.fill('input[name="amount"]', '5000')
    await page.selectOption('select[name="period"]', 'monthly')
    await page.click('button:has-text("Add Budget")')
    await page.waitForTimeout(1000)

    // Try to create duplicate budget
    await page.click('button:has-text("Add Budget")')
    await page.click('button:has-text("Select category")')
    await page.click(`[role="option"]:has-text("${firstCategory}")`)
    await page.fill('input[name="amount"]', '3000')
    await page.selectOption('select[name="period"]', 'monthly')
    await page.click('button:has-text("Add Budget")')

    // Verify error message
    await expect(page.locator('text=already exists, text=duplicate')).toBeVisible()
  })

  test('should display budget summary', async ({ page }) => {
    // Check for summary section
    await expect(page.locator('text=Total Budget')).toBeVisible()
    await expect(page.locator('text=Total Spent')).toBeVisible()
    await expect(page.locator('text=Remaining')).toBeVisible()
  })

  test('should update budget progress in real-time', async ({ page }) => {
    // Get initial progress
    const initialProgress = await page.locator('[data-testid="budget-progress"]:first-child').textContent()

    // Create a transaction that affects the budget
    await page.goto('/transactions')
    await page.click('button:has-text("Add Transaction")')
    await page.selectOption('select[name="type"]', 'expense')
    await page.fill('input[name="amount"]', '100')
    await page.fill('input[name="description"]', 'Test for budget')
    await page.click('button:has-text("Select category")')
    await page.click('[role="option"]:first-child')
    const today = new Date().toISOString().split('T')[0]
    await page.fill('input[name="date"]', today)
    await page.click('button:has-text("Add Transaction")')
    await page.waitForTimeout(1000)

    // Go back to dashboard
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Verify progress updated
    const newProgress = await page.locator('[data-testid="budget-progress"]:first-child').textContent()
    expect(newProgress).not.toBe(initialProgress)
  })

  test('should navigate to category transactions from budget', async ({ page }) => {
    // Click on a budget card
    await page.click('[data-testid="budget-card"]:first-child')

    // Should navigate to transactions filtered by that category
    await expect(page).toHaveURL(/transactions/)
    await expect(page.locator('[data-testid="active-filter"]')).toBeVisible()
  })

  test('should display empty state when no budgets', async ({ page }) => {
    // Delete all budgets first (if any exist)
    const budgets = await page.locator('[data-testid="delete-budget"]').all()
    for (const budget of budgets) {
      await budget.click()
      await page.click('button:has-text("Delete")')
      await page.waitForTimeout(500)
    }

    // Verify empty state
    await expect(page.locator('text=No budgets, text=Create your first budget')).toBeVisible()
  })
})

