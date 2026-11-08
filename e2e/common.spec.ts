import { expect, test } from '@playwright/test'

test.describe('공통 기반', () => {
  test('네비게이션으로 각 페이지에 들어가면 페이지 제목이 보인다', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('어떤 워케이션을 찾고 있나요?')

    await page.getByRole('link', { name: '티어리스트' }).click()
    await expect(page).toHaveURL(/\/tier$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('티어리스트')

    await page.getByRole('link', { name: '동네 비교' }).click()
    await expect(page).toHaveURL(/\/compare$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('동네 비교')
  })

  test('month 쿼리는 페이지를 옮겨도 유지된다', async ({ page }) => {
    await page.goto('/?month=2025-10')
    await page.getByRole('link', { name: '티어리스트' }).click()
    await expect(page).toHaveURL(/\/tier\?month=2025-10$/)
    await page.getByRole('link', { name: '동네 비교' }).click()
    await expect(page).toHaveURL(/\/compare\?month=2025-10$/)
  })

  test('잘못된 month 는 기본 달로 고쳐진다', async ({ page }) => {
    await page.goto('/tier?month=2099-01')
    await expect(page).toHaveURL(/month=2025-12/)
  })
})
