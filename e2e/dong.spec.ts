import { expect, test } from '@playwright/test'

const GEOJIN = '5182025300'

test.describe('W-04 동네 프로필', () => {
  test('진입: 제목·점수·등급·태그', async ({ page }) => {
    await page.goto(`/dongs/${GEOJIN}?month=2025-10`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('거진읍, 고성군')
    await expect(page.getByTestId('quiet-score')).toHaveText('37')
    await expect(page.getByLabel('등급 B').first()).toBeVisible()
    await expect(page.getByText('주말 관광형').first()).toBeVisible()
    await expect(page.getByText('지도 키가 설정되지 않았습니다')).toBeVisible()
  })

  test('곡선 토글: 주말 → 13시, 월 칩 9월 → URL', async ({ page }) => {
    await page.goto(`/dongs/${GEOJIN}?month=2025-10`)
    // '가장 한산'·'주말 피크'는 ScoreCard 요약·PlanCard 에도 있으므로 곡선 섹션으로 한정한다
    const curve = page.locator('section[aria-labelledby="curve-title"]')
    await curve.getByRole('tab', { name: '주말' }).click()
    await expect(curve.getByText('주말 피크').locator('..')).toContainText('13시 · 100')
    await expect(curve.getByText('가장 한산').locator('..')).toContainText('03시 · 47')
    await curve.getByRole('button', { name: '9월' }).click()
    await expect(page).toHaveURL(/month=2025-09/)
  })

  test('유사 동네 → 비교', async ({ page }) => {
    await page.goto(`/dongs/${GEOJIN}?month=2025-10`)
    await page.getByRole('link', { name: /봉래면/ }).click()
    await expect(page).toHaveURL(/\/compare\?dongs=5182025300(,|%2C)4677036000&month=2025-10/)
  })
})
