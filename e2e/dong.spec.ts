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

  test('채팅: 예시 질문 → 답, 지도 링크 #ask 로 오면 섹션이 보인다', async ({ page }) => {
    await page.goto(`/dongs/${GEOJIN}?month=2025-10#ask`)
    const ask = page.locator('#ask')
    await expect(ask.getByRole('heading', { name: '이 동네에 물어보기' })).toBeInViewport()
    await ask.getByRole('button', { name: '이 동네 조용해?' }).click()
    await expect(ask.getByRole('log', { name: '물어본 대화' })).toContainText('조용함은')
  })

  test('채팅: 사이드바 계획 카드 아래, 끝까지 내려도 채팅은 화면에 붙어 있고 계획 카드는 따라오지 않는다', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto(`/dongs/${GEOJIN}?month=2025-10`)
    const ask = page.locator('#ask')
    const plan = page.getByRole('complementary')
    await expect(ask.getByRole('heading', { name: '이 동네에 물어보기' })).toBeVisible()
    const [planBox, askBox] = [await plan.boundingBox(), await ask.boundingBox()]
    expect(askBox!.y).toBeGreaterThan(planBox!.y + planBox!.height - 1)
    expect(Math.abs(askBox!.x - planBox!.x)).toBeLessThan(1)

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(plan).not.toBeInViewport()
    await expect(ask.getByRole('textbox', { name: '이 동네에 물어보기' })).toBeInViewport()
    const stuck = await ask.boundingBox()
    expect(stuck!.y + stuck!.height).toBeLessThanOrEqual(800)
  })

  // 지도 패널에서 옮겨 온 흐름 (시군구 채팅 스펙 §9)
  test('채팅: 같은 시군구 비교 2문장 → 예시 교체, 다른 시군구 → 안내, 이어 묻기', async ({
    page,
  }) => {
    await page.goto(`/dongs/${GEOJIN}?month=2025-10#ask`)
    const ask = page.locator('#ask')
    const chips = ask.getByRole('group', { name: '예시 질문' })
    const input = ask.getByRole('textbox', { name: '이 동네에 물어보기' })
    const log = ask.getByRole('log', { name: '물어본 대화' })
    await expect(chips.getByRole('button')).toHaveCount(3)

    await chips.getByRole('button', { name: '이 동네 조용해?' }).click()
    await expect(log).toContainText('조용함은 B등급')

    await input.fill('토성면이랑 비교하면?')
    await input.press('Enter')
    await expect(log).toContainText('조용함은 거진읍 B등급, 토성면 C등급이에요.')
    await expect(log).toContainText('저녁 활기는 거진읍 C등급, 토성면 A등급이에요.')
    await expect(chips.getByRole('button', { name: '둘이 비슷해?' })).toBeVisible()

    await input.fill('효자2동이랑 비교해 줘')
    await input.press('Enter')
    await expect(log).toContainText('지금은 같은 시군구 안의 동네끼리만 비교할 수 있어요.')
    await expect(log.locator('[data-turn="done"]')).toHaveCount(3)
    await expect(log.getByRole('link')).toHaveCount(0)
  })
})
