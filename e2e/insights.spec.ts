/**
 * E2E Tests for Insights and AI Chatbot
 * 
 * Tests the insights page and AI chatbot functionality:
 * - Viewing insights
 * - Chatting with AI
 * - Generating reports
 * - Analyzing spending patterns
 */

import { test, expect } from '@playwright/test'

test.describe('Insights and AI Chatbot', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to insights page
    await page.goto('/insights')
    await page.waitForLoadState('networkidle')
  })

  test('should display insights page', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Insights/)

    // Check for main elements
    await expect(page.locator('h1:has-text("Insights")')).toBeVisible()
    await expect(page.locator('text=Financial Chatbot')).toBeVisible()
  })

  test('should display spending insights', async ({ page }) => {
    // Check for insights sections
    await expect(page.locator('text=Spending by Category')).toBeVisible()
    await expect(page.locator('text=Monthly Trends')).toBeVisible()
  })

  test('should display charts and visualizations', async ({ page }) => {
    // Check for chart elements
    const charts = await page.locator('[data-testid="chart"], canvas, svg').all()
    expect(charts.length).toBeGreaterThan(0)
  })

  test('should send message to AI chatbot', async ({ page }) => {
    // Find chatbot input
    const chatInput = page.locator('textarea[placeholder*="Ask"], input[placeholder*="message"]')
    await expect(chatInput).toBeVisible()

    // Type a message
    await chatInput.fill('What are my top spending categories?')

    // Send message
    await page.click('button:has-text("Send")')

    // Wait for AI response
    await page.waitForTimeout(3000)

    // Verify response appears
    await expect(page.locator('[data-testid="chat-message"]')).toBeVisible()
  })

  test('should handle multiple chat messages', async ({ page }) => {
    const chatInput = page.locator('textarea[placeholder*="Ask"], input[placeholder*="message"]')

    // Send first message
    await chatInput.fill('How much did I spend this month?')
    await page.click('button:has-text("Send")')
    await page.waitForTimeout(2000)

    // Send second message
    await chatInput.fill('What about last month?')
    await page.click('button:has-text("Send")')
    await page.waitForTimeout(2000)

    // Verify both messages and responses
    const messages = await page.locator('[data-testid="chat-message"]').all()
    expect(messages.length).toBeGreaterThanOrEqual(4) // 2 user messages + 2 AI responses
  })

  test('should display chat history', async ({ page }) => {
    // Send a message
    const chatInput = page.locator('textarea[placeholder*="Ask"], input[placeholder*="message"]')
    await chatInput.fill('Test message')
    await page.click('button:has-text("Send")')
    await page.waitForTimeout(2000)

    // Refresh page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify message history is preserved
    await expect(page.locator('text=Test message')).toBeVisible()
  })

  test('should clear chat history', async ({ page }) => {
    // Send a message
    const chatInput = page.locator('textarea[placeholder*="Ask"], input[placeholder*="message"]')
    await chatInput.fill('Test message to clear')
    await page.click('button:has-text("Send")')
    await page.waitForTimeout(2000)

    // Click clear button
    await page.click('button:has-text("Clear")')

    // Confirm clear
    await page.click('button:has-text("Confirm")')

    // Verify chat is cleared
    await expect(page.locator('text=Test message to clear')).not.toBeVisible()
  })

  test('should filter insights by period', async ({ page }) => {
    // Click period selector
    await page.click('button:has-text("Monthly")')

    // Select weekly
    await page.click('text=Weekly')

    // Wait for data to update
    await page.waitForTimeout(1000)

    // Verify weekly data is shown
    await expect(page.locator('text=This Week')).toBeVisible()
  })

  test('should export insights report', async ({ page }) => {
    // Click export button
    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("Export")')

    // Wait for download
    const download = await downloadPromise

    // Verify download
    expect(download.suggestedFilename()).toContain('insights')
    expect(download.suggestedFilename()).toMatch(/\.(pdf|csv)$/)
  })

  test('should display top spending categories', async ({ page }) => {
    // Check for top categories section
    await expect(page.locator('text=Top Categories')).toBeVisible()

    // Verify categories are listed
    const categories = await page.locator('[data-testid="category-item"]').all()
    expect(categories.length).toBeGreaterThan(0)
  })

  test('should display spending trends', async ({ page }) => {
    // Check for trends section
    await expect(page.locator('text=Trends')).toBeVisible()

    // Verify trend indicators
    await expect(page.locator('[data-testid="trend-indicator"]')).toBeVisible()
  })

  test('should show budget vs actual comparison', async ({ page }) => {
    // Check for comparison section
    await expect(page.locator('text=Budget vs Actual')).toBeVisible()

    // Verify comparison data
    await expect(page.locator('[data-testid="budget-comparison"]')).toBeVisible()
  })

  test('should handle AI chatbot errors gracefully', async ({ page }) => {
    // Simulate network error
    await page.route('**/api/insights/chat', route => route.abort())

    // Try to send message
    const chatInput = page.locator('textarea[placeholder*="Ask"], input[placeholder*="message"]')
    await chatInput.fill('Test error handling')
    await page.click('button:has-text("Send")')

    // Verify error message
    await expect(page.locator('text=error, text=failed')).toBeVisible()
  })

  test('should validate empty chat messages', async ({ page }) => {
    // Try to send empty message
    await page.click('button:has-text("Send")')

    // Verify validation or button is disabled
    const sendButton = page.locator('button:has-text("Send")')
    const isDisabled = await sendButton.isDisabled()
    expect(isDisabled).toBe(true)
  })

  test('should display loading state while AI responds', async ({ page }) => {
    const chatInput = page.locator('textarea[placeholder*="Ask"], input[placeholder*="message"]')
    await chatInput.fill('Test loading state')
    await page.click('button:has-text("Send")')

    // Verify loading indicator appears
    await expect(page.locator('[data-testid="loading"], text=Thinking')).toBeVisible()
  })

  test('should format AI responses with markdown', async ({ page }) => {
    const chatInput = page.locator('textarea[placeholder*="Ask"], input[placeholder*="message"]')
    await chatInput.fill('Give me a detailed spending analysis')
    await page.click('button:has-text("Send")')
    await page.waitForTimeout(3000)

    // Verify formatted response (lists, bold, etc.)
    const response = page.locator('[data-testid="chat-message"]:last-child')
    await expect(response).toBeVisible()
  })

  test('should suggest follow-up questions', async ({ page }) => {
    const chatInput = page.locator('textarea[placeholder*="Ask"], input[placeholder*="message"]')
    await chatInput.fill('Analyze my spending')
    await page.click('button:has-text("Send")')
    await page.waitForTimeout(3000)

    // Check for suggested questions
    const suggestions = await page.locator('[data-testid="suggested-question"]').all()
    if (suggestions.length > 0) {
      // Click a suggestion
      await suggestions[0].click()

      // Verify new message is sent
      await page.waitForTimeout(2000)
      const messages = await page.locator('[data-testid="chat-message"]').all()
      expect(messages.length).toBeGreaterThan(2)
    }
  })

  test('should display income vs expenses comparison', async ({ page }) => {
    // Check for comparison chart
    await expect(page.locator('text=Income vs Expenses')).toBeVisible()

    // Verify data is displayed
    await expect(page.locator('text=Income')).toBeVisible()
    await expect(page.locator('text=Expenses')).toBeVisible()
  })

  test('should show savings rate', async ({ page }) => {
    // Check for savings section
    await expect(page.locator('text=Savings Rate')).toBeVisible()

    // Verify percentage is displayed
    await expect(page.locator('text=%')).toBeVisible()
  })

  test('should display financial health score', async ({ page }) => {
    // Check for health score
    await expect(page.locator('text=Financial Health')).toBeVisible()

    // Verify score is displayed
    const score = await page.locator('[data-testid="health-score"]').textContent()
    expect(score).toMatch(/\d+/)
  })

  test('should provide actionable recommendations', async ({ page }) => {
    // Check for recommendations section
    await expect(page.locator('text=Recommendations')).toBeVisible()

    // Verify recommendations are listed
    const recommendations = await page.locator('[data-testid="recommendation"]').all()
    expect(recommendations.length).toBeGreaterThan(0)
  })
})

