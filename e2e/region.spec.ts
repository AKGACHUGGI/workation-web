import { expect, test } from '@playwright/test'

test.describe('W-03 지역 상세', () => {
  test('진입·정합: 고성군 10월', async ({ page }) => {
    await page.goto('/regions/51820?month=2025-10')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('고성군, 강원특별자치도')
    await expect(page.getByTestId('score')).toHaveText('50')
    await expect(page.getByText('조용한 곳 프리셋 · 12곳 중 3위 · S')).toBeVisible()
    await expect(page.getByText('하반기 상승형')).toBeVisible()
  })

  test('프리셋 전환: PlanCard 에서 활기 있는 한 달', async ({ page }) => {
    await page.goto('/regions/51820?month=2025-10')
    const before = await page.getByTestId('reason').textContent()
    await page.getByLabel('프리셋').selectOption('lively')
    await expect(page).toHaveURL(/preset=lively/)
    await expect(page.getByTestId('score')).toHaveText('47')
    await expect(page.getByText('활기 있는 한 달 프리셋 · 12곳 중 7위')).toBeVisible()
    await expect(page.getByTestId('reason')).not.toHaveText(before ?? '')
    await expect(page.getByTestId('reason')).toContainText('10월 활기 있는 한 달 프리셋 종합 47점')
  })

  test('행정동 이동: 첫 행(토성면) 클릭', async ({ page }) => {
    await page.goto('/regions/51820?month=2025-10&preset=lively')
    await page
      .getByRole('link', { name: /토성면/ })
      .first()
      .click()
    await expect(page).toHaveURL('/dongs/5182034000?month=2025-10&preset=lively')
  })
})
