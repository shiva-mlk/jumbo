import { expect, test } from '@playwright/test'
import { gotoHydrated } from './helpers'

test.describe('Error handling', () => {
  test('answers an unknown store with a branded 404', async ({ page }) => {
    const response = await gotoHydrated(page, '/stores/does-not-exist')

    expect(response?.status()).toBe(404)
    await expect(
      page.getByRole('heading', { name: 'Page not found' })
    ).toBeVisible()
    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.getByRole('contentinfo')).toBeVisible()
  })

  test('answers an unknown route with a 404', async ({ page }) => {
    const response = await gotoHydrated(page, '/no-such-page')

    expect(response?.status()).toBe(404)
    await expect(
      page.getByRole('heading', { name: 'Page not found' })
    ).toBeVisible()
  })

  test('translates the error page', async ({ page }) => {
    await gotoHydrated(page, '/nl/stores/does-not-exist')

    await expect(
      page.getByRole('heading', { name: 'Pagina niet gevonden' })
    ).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('lang', 'nl-NL')
  })

  test('offers a way back to the overview', async ({ page }) => {
    await gotoHydrated(page, '/stores/does-not-exist')

    await page.getByRole('button', { name: 'Back to all stores' }).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(
      page.getByRole('heading', { name: 'Stores', level: 1 })
    ).toBeVisible()
  })
})
