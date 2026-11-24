import { expect, test } from '@playwright/test'

test.describe('W-03 지역 상세', () => {
  test('진입·정합: 고성군 10월', async ({ page }) => {
    await page.goto('/regions/51820?month=2025-10')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('고성군, 강원특별자치도')
    await expect(page.getByTestId('score')).toHaveText('50')
    await expect(page.getByText('조용한 곳 프리셋 · 12곳 중 3위 · S')).toBeVisible()
    await expect(page.getByText('하반기 상승형')).toBeVisible()
  })

  test('프리셋 전환: PlanCard 에서 활기 있는 곳', async ({ page }) => {
    await page.goto('/regions/51820?month=2025-10')
    const before = await page.getByTestId('reason').textContent()
    await page.getByLabel('프리셋').selectOption('lively')
    await expect(page).toHaveURL(/preset=lively/)
    await expect(page.getByTestId('score')).toHaveText('47')
    await expect(page.getByText('활기 있는 곳 프리셋 · 12곳 중 7위')).toBeVisible()
    await expect(page.getByTestId('reason')).not.toHaveText(before ?? '')
    await expect(page.getByTestId('reason')).toContainText('10월 활기 있는 곳 프리셋 종합 47점')
  })

  test('행정동 이동: 첫 행(토성면) 클릭', async ({ page }) => {
    await page.goto('/regions/51820?month=2025-10&preset=lively')
    await page
      .getByRole('link', { name: /토성면/ })
      .first()
      .click()
    await expect(page).toHaveURL('/dongs/5182034000?month=2025-10&preset=lively')
  })

  test('채팅: 사이드바 계획 카드 아래, 끝까지 내려도 채팅은 화면에 붙어 있고 계획 카드는 따라오지 않는다', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/regions/51820?month=2025-10')
    const ask = page.locator('section[aria-labelledby="region-ask-title"]')
    const plan = page.getByRole('complementary')
    await expect(ask.getByRole('heading', { name: '고성군에 물어보기' })).toBeVisible()
    const [planBox, askBox] = [await plan.boundingBox(), await ask.boundingBox()]
    expect(askBox!.y).toBeGreaterThan(planBox!.y + planBox!.height - 1)
    expect(Math.abs(askBox!.x - planBox!.x)).toBeLessThan(1)

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(plan).not.toBeInViewport()
    await expect(ask.getByRole('textbox', { name: '고성군에 물어보기' })).toBeInViewport()
    const stuck = await ask.boundingBox()
    expect(stuck!.y + stuck!.height).toBeLessThanOrEqual(800)
  })

  test('채팅: 조용한 동네 → 자세히 → 동 상세(달 유지)', async ({ page }) => {
    await page.goto('/regions/51820?month=2025-10')
    const ask = page.locator('section[aria-labelledby="region-ask-title"]')
    await ask.getByRole('button', { name: '조용한 동네 어디야?' }).click()
    await ask
      .getByRole('link', { name: /자세히 →$/ })
      .first()
      .click()
    await expect(page).toHaveURL(/\/dongs\/\d{10}\?month=2025-10/)
  })

  test('채팅: 조용한 동네 → 동 이름으로 비교(동 답 + 자세히) → 거진읍 상세(달 유지)', async ({
    page,
  }) => {
    await page.goto('/regions/51820?month=2025-10')
    const ask = page.locator('section[aria-labelledby="region-ask-title"]')
    const log = ask.getByRole('log', { name: '물어본 대화' })
    await ask.getByRole('button', { name: '조용한 동네 어디야?' }).click()
    await expect(log).toContainText('조용한 순으로')

    const input = ask.getByRole('textbox', { name: '고성군에 물어보기' })
    await input.fill('거진읍이랑 토성면 비교해 줘')
    await input.press('Enter')
    const second = log.locator('[data-turn="done"]').nth(1)
    await expect(second).toContainText('조용함은 거진읍 B등급, 토성면 C등급이에요.')
    await expect(second.getByRole('link', { name: '토성면 자세히 →' })).toBeVisible()
    await second.getByRole('link', { name: '거진읍 자세히 →' }).click()
    await expect(page).toHaveURL(/\/dongs\/5182025300\?month=2025-10$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('거진읍, 고성군')
  })
})
