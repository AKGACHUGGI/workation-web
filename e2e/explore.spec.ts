import { expect, test } from '@playwright/test'

const JUMUNJIN = '5115025000'

test.describe('W-09 지도 탐색', () => {
  test('태그 → 동 표시: 카페 많음 + 해수욕장 → 14, 모두 → 5', async ({ page }) => {
    await page.goto('/explore')
    const bar = page.getByRole('toolbar', { name: '태그' })
    await bar.getByRole('button', { name: '카페 많음' }).click()
    await bar.getByRole('button', { name: '해수욕장' }).click()
    await expect(page.getByRole('tab', { name: '하나라도 있는 동 14' })).toBeVisible()
    await page.getByRole('tab', { name: '모두 있는 동 5' }).click()
    await expect(page).toHaveURL(/match=all/)
    await expect(page.getByRole('tab', { name: '모두 있는 동 5', selected: true })).toBeVisible()
  })

  test('동 → 그래프 → 장소: 주문진읍 → 카페 많음 · 7 → 출처 표기', async ({ page }) => {
    await page.goto('/explore?tags=cafe,beach')
    await page
      .getByRole('list', { name: '모두 있는 동 · 장소 많은 순' })
      .getByRole('button', { name: /주문진읍/ })
      .click()
    await expect(page).toHaveURL(new RegExp(`dong=${JUMUNJIN}`))
    await expect(page.getByRole('region', { name: '카페 많음 · 7곳' })).toBeVisible()
    await page.getByRole('button', { name: /주문진항 로스터리/ }).click()
    await expect(page.getByText('사진·장소 정보 출처: 한국관광공사')).toBeVisible()
  })

  test('뒤로 가기 2번 → ① (표시 14)', async ({ page }) => {
    await page.goto('/explore?tags=cafe,beach')
    await page
      .getByRole('list', { name: '모두 있는 동 · 장소 많은 순' })
      .getByRole('button', { name: /주문진읍/ })
      .click()
    await page.getByRole('button', { name: /주문진항 로스터리/ }).click()
    await expect(page).toHaveURL(/place=/)
    await page.goBack()
    await expect(page.getByRole('region', { name: '카페 많음 · 7곳' })).toBeVisible()
    await page.goBack()
    await expect(page).not.toHaveURL(/dong=/)
    await expect(page.getByRole('tab', { name: '하나라도 있는 동 14' })).toBeVisible()
  })
})
