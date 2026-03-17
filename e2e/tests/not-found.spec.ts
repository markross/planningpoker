import { test, expect } from '@playwright/test'

test.describe('404 page', () => {
  test('shows not found for unknown routes', async ({ page }) => {
    await page.goto('/some/unknown/route')

    await expect(page.getByText('Page not found')).toBeVisible()
    await expect(page.getByRole('link', { name: /home/i })).toBeVisible()
  })

  test('can navigate back home from 404', async ({ page }) => {
    await page.goto('/some/unknown/route')

    await page.getByRole('link', { name: /home/i }).click()
    await page.waitForURL('/')

    await expect(page.getByRole('heading', { name: 'Planning Poker' })).toBeVisible()
  })
})
