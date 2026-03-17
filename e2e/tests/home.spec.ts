import { test, expect } from '@playwright/test'

test.describe('Home page', () => {
  test('shows title and name entry form', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Planning Poker' })).toBeVisible()
    await expect(page.getByPlaceholder('Enter your name')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Set name' })).toBeVisible()
  })

  test('shows create and join forms after entering name', async ({ page }) => {
    await page.goto('/')

    await page.getByPlaceholder('Enter your name').fill('Alice')
    await page.getByRole('button', { name: 'Set name' }).click()

    await expect(page.getByRole('button', { name: 'Create session' })).toBeVisible()
    await expect(page.getByPlaceholder('e.g. ABC123')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Join' })).toBeVisible()
  })

  test('persists name across page reload', async ({ page }) => {
    await page.goto('/')

    await page.getByPlaceholder('Enter your name').fill('Alice')
    await page.getByRole('button', { name: 'Set name' }).click()
    await expect(page.getByRole('button', { name: 'Create session' })).toBeVisible()

    await page.reload()

    // Name should be pre-filled and forms visible
    await expect(page.getByRole('button', { name: 'Create session' })).toBeVisible()
  })
})
