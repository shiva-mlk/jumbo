import { expect, test } from '@playwright/test'
import { gotoHydrated } from './helpers'

test.describe('Store overview', () => {
  test('lists a page of stores with their details', async ({ page }) => {
    await gotoHydrated(page, '/')

    const cards = page.getByRole('article')
    await expect(cards).toHaveCount(12)

    const first = cards.first()
    await expect(first.getByRole('heading', { level: 2 })).toBeVisible()
    await expect(first.getByText(/\d{4}\s?[A-Z]{2}/)).toBeVisible()
    await expect(first.getByText(/Open|Closed/)).toBeVisible()
  })

  test('reports how many stores were found', async ({ page }) => {
    await gotoHydrated(page, '/')

    await expect(page.getByText('806 stores')).toBeVisible()
  })

  test('shows a different page of stores and reflects it in the URL', async ({
    page
  }) => {
    await gotoHydrated(page, '/')

    const firstOnPageOne = await page.getByRole('article').first().innerText()

    await page.getByRole('button', { name: 'Next page' }).click()

    await expect(page).toHaveURL(/[?&]page=2/)
    await expect(
      page.getByRole('button', { name: 'Go to page 2' })
    ).toHaveAttribute('aria-current', 'page')

    const firstOnPageTwo = await page.getByRole('article').first().innerText()
    expect(firstOnPageTwo).not.toBe(firstOnPageOne)
  })

  test('opens a page directly from the URL', async ({ page }) => {
    await gotoHydrated(page, '/?page=3')

    await expect(
      page.getByRole('button', { name: 'Go to page 3' })
    ).toHaveAttribute('aria-current', 'page')
  })

  test('disables the previous button on the first page', async ({ page }) => {
    await gotoHydrated(page, '/')

    await expect(
      page.getByRole('button', { name: 'Previous page' })
    ).toBeDisabled()
  })

  test('serves the Dutch translation under /nl', async ({ page }) => {
    await gotoHydrated(page, '/nl')

    await expect(
      page.getByRole('heading', { name: 'Winkels', level: 1 })
    ).toBeVisible()
    await expect(page.getByText('806 winkels')).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('lang', 'nl-NL')
  })
})
