import { expect, test } from '@playwright/test'
import { gotoHydrated } from './helpers'

test.describe('Store detail', () => {
  test('opens from a card in the overview', async ({ page }) => {
    await gotoHydrated(page, '/')

    const firstCard = page.getByRole('article').first()
    const name = await firstCard.getByRole('heading', { level: 2 }).innerText()

    await firstCard.getByRole('link', { name }).click()

    await expect(page).toHaveURL(/\/stores\/\w+/)
    await expect(page.getByRole('heading', { name, level: 1 })).toBeVisible()
  })

  test('shows the address, hours and website link', async ({ page }) => {
    await gotoHydrated(page, '/stores/3126')

    await expect(
      page.getByRole('heading', { name: 'Jumbo Eindhoven Nederlandplein', level: 1 })
    ).toBeVisible()
    await expect(page.getByText('Nederlandplein 103')).toBeVisible()

    const rows = page.getByRole('row')
    await expect(rows).toHaveCount(7)
    await expect(page.getByRole('rowheader', { name: 'Monday' })).toBeVisible()
    await expect(page.getByRole('rowheader', { name: 'Sunday' })).toBeVisible()

    const website = page.getByRole('link', { name: /Visit website/ })
    await expect(website).toHaveAttribute('target', '_blank')
    await expect(website).toHaveAttribute('rel', /noopener/)
  })

  test('shows facilities and shopping options', async ({ page }) => {
    await gotoHydrated(page, '/stores/3126')

    await expect(page.getByRole('heading', { name: 'About this store' })).toBeVisible()
    await expect(page.getByText('Wi-Fi')).toBeVisible()
    await expect(page.getByText('Home delivery')).toBeVisible()
  })

  test('renders a map for a store that has coordinates', async ({ page }) => {
    await gotoHydrated(page, '/stores/3126')

    await expect(page.locator('.leaflet-container')).toBeVisible()
  })

  test('explains when a store has no location instead of showing an empty map', async ({
    page
  }) => {
    await gotoHydrated(page, '/stores/4954')

    await expect(page.getByText('No location is available for this store.')).toBeVisible()
    await expect(page.locator('.leaflet-container')).toHaveCount(0)
  })

  test('returns to the overview', async ({ page }) => {
    await gotoHydrated(page, '/stores/3126')

    await page.getByRole('link', { name: 'Back to all stores' }).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('heading', { name: 'Stores', level: 1 })).toBeVisible()
  })
})
