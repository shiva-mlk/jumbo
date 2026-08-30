import type { Page, Response } from '@playwright/test'

export async function gotoHydrated(page: Page, url: string): Promise<Response | null> {
  const response = await page.goto(url)

  await page.waitForFunction(() => {
    const root = document.querySelector('#__nuxt') as (Element & { __vue_app__?: unknown }) | null
    return Boolean(root?.__vue_app__)
  })

  return response
}
