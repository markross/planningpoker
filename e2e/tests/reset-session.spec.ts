import { test, expect, type Page, type Browser } from '@playwright/test'

async function createSessionAsUser(
  browser: Browser,
  name: string,
): Promise<{ page: Page; sessionCode: string }> {
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto('/')
  await expect(page.getByText('Planning Poker')).toBeVisible({ timeout: 10_000 })
  await page.getByPlaceholder('Enter your name').fill(name)
  await page.getByRole('button', { name: 'Set name' }).click()
  const createBtn = page.getByRole('button', { name: 'Create session' })
  await expect(createBtn).toBeVisible()
  await createBtn.click()
  await page.waitForURL(/\/session\//, { timeout: 15_000 })
  const sessionCode = page.url().split('/session/')[1]
  return { page, sessionCode }
}

async function joinSessionAsUser(
  browser: Browser,
  sessionCode: string,
  name: string,
): Promise<Page> {
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto(`/session/${sessionCode}`)

  // Should prompt for name (fresh context has no localStorage)
  await page.getByPlaceholder('Enter your name').fill(name)
  await page.getByRole('button', { name: 'Set name' }).click()

  await expect(page.getByText(name)).toBeVisible({ timeout: 10_000 })
  return page
}

test.describe('Reset session', () => {
  test('reset button shows confirmation dialog', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Planning Poker')).toBeVisible({ timeout: 10_000 })
    await page.getByPlaceholder('Enter your name').fill('Alice')
    await page.getByRole('button', { name: 'Set name' }).click()
    await page.getByRole('button', { name: 'Create session' }).click()
    await page.waitForURL(/\/session\//, { timeout: 15_000 })

    // Reset button should be visible
    await expect(page.getByRole('button', { name: 'Reset session' })).toBeVisible()

    // Dismiss the confirmation dialog
    page.on('dialog', (dialog) => dialog.dismiss())
    await page.getByRole('button', { name: 'Reset session' }).click()

    // Should still be in session (dialog was dismissed)
    await expect(page.getByText('Alice')).toBeVisible()
  })

  test('reset returns initiator to name entry screen', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Planning Poker')).toBeVisible({ timeout: 10_000 })
    await page.getByPlaceholder('Enter your name').fill('Alice')
    await page.getByRole('button', { name: 'Set name' }).click()
    await page.getByRole('button', { name: 'Create session' }).click()
    await page.waitForURL(/\/session\//, { timeout: 15_000 })

    // Accept the confirmation dialog
    page.on('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: 'Reset session' }).click()

    // Should show name entry screen
    await expect(page.getByText('Enter your name to join')).toBeVisible({ timeout: 10_000 })
  })

  test('reset removes all players and returns everyone to name entry', { timeout: 60_000 }, async ({ browser }) => {
    // Alice creates session
    const { page: alicePage, sessionCode } = await createSessionAsUser(browser, 'Alice')

    // Bob joins
    const bobPage = await joinSessionAsUser(browser, sessionCode, 'Bob')

    // Both should see each other
    await expect(bobPage.getByText('Alice')).toBeVisible({ timeout: 10_000 })
    await expect(alicePage.getByText('Bob')).toBeVisible({ timeout: 10_000 })

    // Alice resets — accept the confirmation dialog
    alicePage.on('dialog', (dialog) => dialog.accept())
    await alicePage.getByRole('button', { name: 'Reset session' }).click()

    // Alice should see name entry screen
    await expect(alicePage.getByText('Enter your name to join')).toBeVisible({ timeout: 10_000 })

    // Bob should ALSO see name entry screen (via broadcast)
    await expect(bobPage.getByText('Enter your name to join')).toBeVisible({ timeout: 10_000 })

    // Both can re-enter names and rejoin
    await alicePage.getByPlaceholder('Enter your name').fill('Alice')
    await alicePage.getByRole('button', { name: 'Set name' }).click()
    await expect(alicePage.getByText('Alice')).toBeVisible({ timeout: 10_000 })

    await bobPage.getByPlaceholder('Enter your name').fill('Bob')
    await bobPage.getByRole('button', { name: 'Set name' }).click()
    await expect(bobPage.getByText('Bob')).toBeVisible({ timeout: 10_000 })

    await alicePage.close()
    await bobPage.close()
  })
})