import { test, expect } from '@playwright/test'

test.describe('Join session flow', () => {
  test('navigates to session page via join code', async ({ page }) => {
    // First create a session to get a valid code
    await page.goto('/')
    await page.getByPlaceholder('Enter your name').fill('Alice')
    await page.getByRole('button', { name: 'Set name' }).click()
    await page.getByRole('button', { name: 'Create session' }).click()

    await page.waitForURL(/\/session\//)
    const url = page.url()
    const sessionCode = url.split('/session/')[1]

    // Go back home and join via code
    await page.goto('/')

    // Name should be persisted
    await expect(page.getByRole('button', { name: 'Create session' })).toBeVisible()

    await page.getByPlaceholder('e.g. ABC123').fill(sessionCode)
    await page.getByRole('button', { name: 'Join' }).click()

    await page.waitForURL(`/session/${sessionCode}`)
    await expect(page.getByText('Alice')).toBeVisible()
  })

  test('join via direct link prompts for name', async ({ browser }) => {
    // Create a session in a separate context (isolated localStorage)
    const creatorContext = await browser.newContext()
    const creatorPage = await creatorContext.newPage()
    await creatorPage.goto('/')
    await creatorPage.getByPlaceholder('Enter your name').fill('Alice')
    await creatorPage.getByRole('button', { name: 'Set name' }).click()
    await creatorPage.getByRole('button', { name: 'Create session' }).click()
    await creatorPage.waitForURL(/\/session\//)
    const sessionCode = creatorPage.url().split('/session/')[1]
    await creatorPage.close()
    await creatorContext.close()

    // Open direct link in a fresh context (no name in localStorage)
    const joinerContext = await browser.newContext()
    const joinerPage = await joinerContext.newPage()
    await joinerPage.goto(`/session/${sessionCode}`)

    // Should show name prompt
    await expect(joinerPage.getByText('Enter your name to join')).toBeVisible()

    await joinerPage.getByPlaceholder('Enter your name').fill('Bob')
    await joinerPage.getByRole('button', { name: 'Set name' }).click()

    // Should now see the session
    await expect(joinerPage.getByText('Bob')).toBeVisible({ timeout: 10_000 })
    await expect(joinerPage.getByText('(you)')).toBeVisible()

    await joinerPage.close()
    await joinerContext.close()
  })
})
