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

test.describe('Voting flow', () => {
  test('single player can vote and see card selected', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Planning Poker')).toBeVisible({ timeout: 10_000 })
    await page.getByPlaceholder('Enter your name').fill('Alice')
    await page.getByRole('button', { name: 'Set name' }).click()
    await page.getByRole('button', { name: 'Create session' }).click()
    await page.waitForURL(/\/session\//, { timeout: 15_000 })

    // Click estimate card "5"
    const cardGroup = page.getByRole('group', { name: 'Estimate cards' })
    const card5 = cardGroup.getByRole('button', { name: '5', exact: true })
    await card5.click()

    // Card should be pressed
    await expect(card5).toHaveAttribute('aria-pressed', 'true')

    // Player should show "Voted" status
    await expect(page.getByText('Voted')).toBeVisible()

    // Phase should change to voting
    await expect(page.getByText('Voting in progress')).toBeVisible()
  })

  test('single player can reveal and see results', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Planning Poker')).toBeVisible({ timeout: 10_000 })
    await page.getByPlaceholder('Enter your name').fill('Alice')
    await page.getByRole('button', { name: 'Set name' }).click()
    await page.getByRole('button', { name: 'Create session' }).click()
    await page.waitForURL(/\/session\//, { timeout: 15_000 })

    // Vote
    const cardGroup = page.getByRole('group', { name: 'Estimate cards' })
    await cardGroup.getByRole('button', { name: '8', exact: true }).click()

    // Reveal
    await page.getByRole('button', { name: 'Reveal votes' }).click()

    // Should show results
    await expect(page.getByText('Results')).toBeVisible()
    await expect(page.getByText('Votes revealed')).toBeVisible()
    await expect(page.getByText('Average')).toBeVisible()

    // Cards should be disabled
    const cards = cardGroup.getByRole('button')
    const firstCard = cards.first()
    await expect(firstCard).toBeDisabled()

    // New round button should appear
    await expect(page.getByRole('button', { name: 'New round' })).toBeVisible()
  })

  test('clear resets for a new round', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Planning Poker')).toBeVisible({ timeout: 10_000 })
    await page.getByPlaceholder('Enter your name').fill('Alice')
    await page.getByRole('button', { name: 'Set name' }).click()
    await page.getByRole('button', { name: 'Create session' }).click()
    await page.waitForURL(/\/session\//, { timeout: 15_000 })

    // Vote and reveal
    const cardGroup = page.getByRole('group', { name: 'Estimate cards' })
    await cardGroup.getByRole('button', { name: '3', exact: true }).click()
    await page.getByRole('button', { name: 'Reveal votes' }).click()
    await expect(page.getByText('Results')).toBeVisible()

    // Clear / new round
    await page.getByRole('button', { name: 'New round' }).click()

    // Should be back to lobby
    await expect(page.getByText('Waiting for votes')).toBeVisible()
    await expect(page.getByText('Results')).not.toBeVisible()

    // Cards should be enabled again
    const firstCard = cardGroup.getByRole('button').first()
    await expect(firstCard).toBeEnabled()
  })

  test('two players vote, reveal, and see results', { timeout: 60_000 }, async ({ browser }) => {
    // Alice creates session (own browser context = isolated storage)
    const { page: alicePage, sessionCode } = await createSessionAsUser(browser, 'Alice')

    // Bob joins (own browser context = isolated storage)
    const bobPage = await joinSessionAsUser(browser, sessionCode, 'Bob')

    // Both should see each other via realtime player subscription
    await expect(bobPage.getByText('Alice')).toBeVisible({ timeout: 10_000 })
    await expect(bobPage.getByText('Bob')).toBeVisible({ timeout: 10_000 })
    await expect(alicePage.getByText('Bob')).toBeVisible({ timeout: 10_000 })

    // Alice votes 5
    const aliceCards = alicePage.getByRole('group', { name: 'Estimate cards' })
    await aliceCards.getByRole('button', { name: '5', exact: true }).click()

    // Bob votes 8
    const bobCards = bobPage.getByRole('group', { name: 'Estimate cards' })
    await bobCards.getByRole('button', { name: '8', exact: true }).click()

    // Both should see "Voting in progress" via realtime vote subscription
    await expect(alicePage.getByText('Voting in progress')).toBeVisible({ timeout: 10_000 })
    await expect(bobPage.getByText('Voting in progress')).toBeVisible({ timeout: 10_000 })

    // Alice reveals
    await alicePage.getByRole('button', { name: 'Reveal votes' }).click()

    // Both should see results via broadcast
    await expect(alicePage.getByText('Votes revealed')).toBeVisible({ timeout: 5000 })
    await expect(bobPage.getByText('Votes revealed')).toBeVisible({ timeout: 10_000 })

    // Results visible on Alice's page
    await expect(alicePage.getByText('Results')).toBeVisible()
    await expect(alicePage.getByText('Average')).toBeVisible()

    // Bob clicks new round
    await bobPage.getByRole('button', { name: 'New round' }).click()

    // Both should reset via broadcast
    await expect(bobPage.getByText('Waiting for votes')).toBeVisible({ timeout: 5000 })
    await expect(alicePage.getByText('Waiting for votes')).toBeVisible({ timeout: 10_000 })

    await alicePage.close()
    await bobPage.close()
  })
})
