/**
 * E2E Tests for Transactions Flow
 * 
 * Tests the complete transaction management flow:
 * - Creating transactions
 * - Viewing transactions
 * - Editing transactions
 * - Deleting transactions
 * - Filtering transactions
 */

import { test, expect } from '@playwright/test'

test.describe('Transactions', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to transactions page
    await page.goto('/transactions')
    await page.waitForLoadState('networkidle')
  })

  test('should display transactions page', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Transactions/)

    // Check for main elements
    await expect(page.locator('h1:has-text("Transactions")')).toBeVisible()
    await expect(page.locator('button:has-text("Add Transaction")')).toBeVisible()
  })

  test('should create a new expense transaction', async ({ page }) => {
    // Click add transaction button
    await page.click('button:has-text("Add Transaction")')

    // Wait for modal to open
    await expect(page.locator('text=Add Transaction')).toBeVisible()

    // Fill in transaction details
    await page.selectOption('select[name="type"]', 'expense')
    await page.fill('input[name="amount"]', '150.50')
    await page.fill('input[name="description"]', 'Test Expense Transaction')
    
    // Select a category (assuming first category)
    await page.click('button:has-text("Select category")')
    await page.click('[role="option"]:first-child')

    // Select date (use today's date)
    const today = new Date().toISOString().split('T')[0]
    await page.fill('input[name="date"]', today)

    // Submit the form
    await page.click('button:has-text("Add Transaction")')

    // Wait for success message or modal to close
    await page.waitForTimeout(1000)

    // Verify transaction appears in the list
    await expect(page.locator('text=Test Expense Transaction')).toBeVisible()
    await expect(page.locator('text=₱150.50')).toBeVisible()
  })

  test('should create a new income transaction', async ({ page }) => {
    // Click add transaction button
    await page.click('button:has-text("Add Transaction")')

    // Wait for modal to open
    await expect(page.locator('text=Add Transaction')).toBeVisible()

    // Fill in transaction details
    await page.selectOption('select[name="type"]', 'income')
    await page.fill('input[name="amount"]', '5000')
    await page.fill('input[name="description"]', 'Test Income Transaction')
    
    // Select a category
    await page.click('button:has-text("Select category")')
    await page.click('[role="option"]:first-child')

    // Select date
    const today = new Date().toISOString().split('T')[0]
    await page.fill('input[name="date"]', today)

    // Submit the form
    await page.click('button:has-text("Add Transaction")')

    // Wait for success
    await page.waitForTimeout(1000)

    // Verify transaction appears
    await expect(page.locator('text=Test Income Transaction')).toBeVisible()
    await expect(page.locator('text=₱5,000')).toBeVisible()
  })

  test('should edit an existing transaction', async ({ page }) => {
    // Find and click edit button on first transaction
    await page.click('[data-testid="edit-transaction"]:first-child, button:has-text("Edit"):first-child')

    // Wait for edit modal
    await expect(page.locator('text=Edit Transaction')).toBeVisible()

    // Update the amount
    await page.fill('input[name="amount"]', '200')

    // Update description
    await page.fill('input[name="description"]', 'Updated Transaction Description')

    // Save changes
    await page.click('button:has-text("Save")')

    // Wait for success
    await page.waitForTimeout(1000)

    // Verify updated transaction
    await expect(page.locator('text=Updated Transaction Description')).toBeVisible()
    await expect(page.locator('text=₱200')).toBeVisible()
  })

  test('should delete a transaction', async ({ page }) => {
    // Get initial transaction count
    const initialCount = await page.locator('[data-testid="transaction-row"]').count()

    // Find and click delete button on first transaction
    await page.click('[data-testid="delete-transaction"]:first-child, button:has-text("Delete"):first-child')

    // Confirm deletion in dialog
    await expect(page.locator('text=Are you sure')).toBeVisible()
    await page.click('button:has-text("Delete")')

    // Wait for deletion
    await page.waitForTimeout(1000)

    // Verify transaction count decreased
    const newCount = await page.locator('[data-testid="transaction-row"]').count()
    expect(newCount).toBeLessThan(initialCount)
  })

  test('should filter transactions by type', async ({ page }) => {
    // Click filter dropdown
    await page.click('button:has-text("Filter")')

    // Select "Expenses only"
    await page.click('text=Expenses only')

    // Wait for filter to apply
    await page.waitForTimeout(500)

    // Verify only expense transactions are shown
    const transactions = await page.locator('[data-testid="transaction-row"]').all()
    for (const transaction of transactions) {
      const type = await transaction.getAttribute('data-type')
      expect(type).toBe('expense')
    }
  })

  test('should search transactions', async ({ page }) => {
    // Type in search box
    await page.fill('input[placeholder*="Search"]', 'Test')

    // Wait for search to apply
    await page.waitForTimeout(500)

    // Verify filtered results
    const transactions = await page.locator('[data-testid="transaction-row"]').all()
    for (const transaction of transactions) {
      const text = await transaction.textContent()
      expect(text?.toLowerCase()).toContain('test')
    }
  })

  test('should handle validation errors', async ({ page }) => {
    // Click add transaction
    await page.click('button:has-text("Add Transaction")')

    // Try to submit without filling required fields
    await page.click('button:has-text("Add Transaction")')

    // Verify validation errors appear
    await expect(page.locator('text=required, text=Required')).toBeVisible()
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true)

    // Try to create a transaction
    await page.click('button:has-text("Add Transaction")')
    await page.fill('input[name="amount"]', '100')
    await page.fill('input[name="description"]', 'Test')
    await page.click('button:has-text("Add Transaction")')

    // Verify error message
    await expect(page.locator('text=error, text=failed')).toBeVisible()

    // Restore online mode
    await page.context().setOffline(false)
  })

  test('should navigate between pages', async ({ page }) => {
    // Click on dashboard link
    await page.click('a[href="/dashboard"]')
    await expect(page).toHaveURL('/dashboard')

    // Navigate back to transactions
    await page.click('a[href="/transactions"]')
    await expect(page).toHaveURL('/transactions')
  })

  test('should display transaction details', async ({ page }) => {
    // Click on first transaction to view details
    await page.click('[data-testid="transaction-row"]:first-child')

    // Verify details are displayed
    await expect(page.locator('[data-testid="transaction-details"]')).toBeVisible()
    await expect(page.locator('text=Amount')).toBeVisible()
    await expect(page.locator('text=Description')).toBeVisible()
    await expect(page.locator('text=Category')).toBeVisible()
    await expect(page.locator('text=Date')).toBeVisible()
  })

  test('should sort transactions by date', async ({ page }) => {
    // Click sort button
    await page.click('button:has-text("Sort")')

    // Select "Oldest first"
    await page.click('text=Oldest first')

    // Wait for sort to apply
    await page.waitForTimeout(500)

    // Verify transactions are sorted (check first and last dates)
    const firstDate = await page.locator('[data-testid="transaction-date"]:first-child').textContent()
    const lastDate = await page.locator('[data-testid="transaction-date"]:last-child').textContent()
    
    // First date should be older than last date
    expect(new Date(firstDate!).getTime()).toBeLessThanOrEqual(new Date(lastDate!).getTime())
  })

  test('should export transactions', async ({ page }) => {
    // Click export button
    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("Export")')

    // Wait for download
    const download = await downloadPromise

    // Verify download
    expect(download.suggestedFilename()).toContain('transactions')
    expect(download.suggestedFilename()).toMatch(/\.(csv|xlsx|pdf)$/)
  })
})

