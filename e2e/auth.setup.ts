/**
 * Authentication Setup for E2E Tests
 * 
 * This file sets up authentication state that can be reused across all E2E tests.
 * It logs in once and saves the authentication state to a file.
 */

import { test as setup, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const authFile = 'playwright/.auth/user.json'

// Test credentials - these should match your test user in Supabase
const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
}

setup('authenticate', async ({ page }) => {
  // Ensure the auth directory exists
  const authDir = path.dirname(authFile)
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true })
  }

  // Navigate to sign in page
  await page.goto('/signin')

  // Wait for the page to load
  await page.waitForLoadState('networkidle')

  // Fill in the login form
  await page.fill('input[name="email"]', TEST_USER.email)
  await page.fill('input[name="password"]', TEST_USER.password)

  // Click the sign in button
  await page.click('button[type="submit"]')

  // Wait for navigation to dashboard
  await page.waitForURL('/dashboard', { timeout: 30000 })

  // Verify we're logged in by checking for user-specific content
  await expect(page.locator('text=Dashboard')).toBeVisible()

  // Save the authentication state
  await page.context().storageState({ path: authFile })

  console.log('✅ Authentication setup complete')
})

