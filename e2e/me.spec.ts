import { expect, test } from '@playwright/test'

async function loginViaMock(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: '카카오로 시작하기' }).click()
  await expect(page.getByRole('dialog', { name: '거의 다 됐어요' })).toBeVisible()
  await page.getByRole('checkbox').nth(0).check()
  await page.getByRole('checkbox').nth(1).check()
  await page.getByRole('button', { name: '시작하기' }).click()
}

test.describe('W-08 마이페이지 (mock)', () => {
  test('비로그인 → 로그인 → 마이페이지', async ({ page }) => {
    await page.goto('/me?month=2025-10')
    await expect(page.getByRole('dialog', { name: '당신의 장소를 찾으세요' })).toBeVisible()
    await loginViaMock(page)
    await expect(page.getByRole('heading', { level: 1, name: '두이' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '즐겨찾기 지역 3곳' })).toBeVisible()
  })

  test('즐겨찾기 해제 · 되돌리기', async ({ page }) => {
    await page.goto('/me?month=2025-10')
    await loginViaMock(page)
    await expect(page.getByRole('heading', { name: '즐겨찾기 지역 3곳' })).toBeVisible()
    await page
      .getByRole('link', { name: /고성군, 강원특별자치도/ })
      // ListingCard 하트는 카드 링크의 형제(링크 밖)라 부모(카드)에서 찾는다
      .locator('xpath=..')
      .getByRole('button', { name: '즐겨찾기', exact: true })
      .click()
    await expect(page.getByRole('heading', { name: '즐겨찾기 지역 2곳' })).toBeVisible()
    await page.getByRole('button', { name: '되돌리기' }).click()
    await expect(page.getByRole('heading', { name: '즐겨찾기 지역 3곳' })).toBeVisible()
  })

  test('동네 비교 담기', async ({ page }) => {
    await page.goto('/me?month=2025-10')
    await loginViaMock(page)
    await page.getByRole('button', { name: '선택해서 비교' }).click()
    await page.getByRole('checkbox', { name: '거진읍' }).check()
    await page.getByRole('checkbox', { name: '죽왕면' }).check()
    await page.getByRole('link', { name: '비교하기' }).click()
    await expect(page).toHaveURL(/\/compare\?dongs=5182025300%2C5182033000&month=2025-10/)
  })
})
