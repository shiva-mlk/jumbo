import { expect, test } from '@playwright/test'
import { gotoHydrated } from './helpers'

test.describe('Accessibility', () => {
  test('exposes the page landmarks', async ({ page }) => {
    await gotoHydrated(page, '/')

    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByRole('contentinfo')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('offers a skip link as the first tab stop', async ({ page }) => {
    await gotoHydrated(page, '/')

    await page.keyboard.press('Tab')

    const skipLink = page.getByRole('link', { name: 'Skip to content' })
    await expect(skipLink).toBeFocused()
    await expect(skipLink).toBeVisible()
  })

  test('declares the document language', async ({ page }) => {
    await gotoHydrated(page, '/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB')
  })

  test('switches language and keeps the page working', async ({ page }) => {
    await gotoHydrated(page, '/')

    await page.getByRole('navigation', { name: 'Change language' }).getByText('NL').click()

    await expect(page).toHaveURL(/\/nl/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'nl-NL')
    await expect(page.getByRole('heading', { name: 'Winkels', level: 1 })).toBeVisible()
  })
})
