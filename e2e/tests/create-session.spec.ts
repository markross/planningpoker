import { test, expect } from '@playwright/test'

test.describe('Create session flow', () => {
  test('creates a session and navigates to session page', async ({ page }) => {
    await page.goto('/')

    // Wait for auth to complete (loading screen disappears)
    await expect(page.getByText('Planning Poker')).toBeVisible({ timeout: 10_000 })

    // Enter name
    await page.getByPlaceholder('Enter your name').fill('Alice')
    await page.getByRole('button', { name: 'Set name' }).click()

    // Wait for create button and click
    const createBtn = page.getByRole('button', { name: 'Create session' })
    await expect(createBtn).toBeVisible()
    await createBtn.click()

    // Should navigate to /session/:code
    await page.waitForURL(/\/session\/[A-Z0-9]{6}/, { timeout: 15_000 })

    // Session page should show header with session code
    await expect(page.getByRole('heading', { name: 'Planning Poker' })).toBeVisible()

    // Should show estimate cards
    await expect(page.getByRole('group', { name: 'Estimate cards' })).toBeVisible()

    // Should show player in the player list
    await expect(page.getByText('Alice')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('(you)')).toBeVisible()

    // Phase should be waiting (lobby)
    await expect(page.getByText('Waiting for votes')).toBeVisible()
  })

  test('session page shows all 8 estimate cards', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Planning Poker')).toBeVisible({ timeout: 10_000 })

    await page.getByPlaceholder('Enter your name').fill('Alice')
    await page.getByRole('button', { name: 'Set name' }).click()

    const createBtn = page.getByRole('button', { name: 'Create session' })
    await expect(createBtn).toBeVisible()
    await createBtn.click()

    await page.waitForURL(/\/session\//, { timeout: 15_000 })

    const cards = page.getByRole('group', { name: 'Estimate cards' }).getByRole('button')
    await expect(cards).toHaveCount(8)

    for (const value of ['1', '2', '3', '5', '8', '13', '21', '?']) {
      await expect(cards.filter({ hasText: value }).first()).toBeVisible()
    }
  })
})
