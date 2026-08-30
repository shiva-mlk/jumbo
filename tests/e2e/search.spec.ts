import { expect, test } from '@playwright/test'
import { gotoHydrated } from './helpers'

test.describe('Search', () => {
  test('narrows the results to a city', async ({ page }) => {
    await gotoHydrated(page, '/')

    await page.getByRole('combobox', { name: 'Search stores' }).fill('kollum')

    await expect(page.getByText('1 store')).toBeVisible()
    await expect(page.getByRole('article')).toHaveCount(1)
    await expect(page).toHaveURL(/[?&]q=kollum/)
  })

  test('can be driven entirely from the keyboard', async ({ page }) => {
    await gotoHydrated(page, '/')

    const input = page.getByRole('combobox', { name: 'Search stores' })
    await input.fill('eind')

    await expect(input).toHaveAttribute('aria-expanded', 'true')

    const listbox = page.getByRole('listbox')
    await expect(listbox).toBeVisible()

    await input.press('ArrowDown')

    await expect(input).toBeFocused()
    const activeId = await input.getAttribute('aria-activedescendant')
    expect(activeId).toBeTruthy()
    await expect(page.locator(`#${activeId}`)).toHaveAttribute('aria-selected', 'true')

    await input.press('Enter')

    await expect(listbox).toBeHidden()
    await expect(input).toHaveValue('EINDHOVEN')
    await expect(page.getByText('16 stores')).toBeVisible()
  })

  test('closes the suggestions with Escape without searching', async ({ page }) => {
    await gotoHydrated(page, '/')

    const input = page.getByRole('combobox', { name: 'Search stores' })
    await input.fill('eind')
    await expect(page.getByRole('listbox')).toBeVisible()

    await input.press('Escape')

    await expect(page.getByRole('listbox')).toBeHidden()
    await expect(input).toHaveValue('eind')
  })

  test('reports when nothing matches', async ({ page }) => {
    await gotoHydrated(page, '/')

    await page.getByRole('combobox', { name: 'Search stores' }).fill('zzzzzz')

    await expect(page.getByRole('status').filter({ hasText: 'No stores match' })).toBeVisible()
    await expect(page.getByRole('article')).toHaveCount(0)
  })

  test('clears the search and restores every store', async ({ page }) => {
    await gotoHydrated(page, '/?q=kollum')
    await expect(page.getByText('1 store')).toBeVisible()

    await page.getByRole('button', { name: 'Clear search' }).click()

    await expect(page.getByText('806 stores')).toBeVisible()
  })

  test('resets to the first page when a new search starts', async ({ page }) => {
    await gotoHydrated(page, '/?page=5')

    await page.getByRole('combobox', { name: 'Search stores' }).fill('eindhoven')

    await expect(page).not.toHaveURL(/[?&]page=5/)
    await expect(page.getByText('16 stores')).toBeVisible()
  })
})
