import { expect, test } from '@playwright/test'

test.describe('W-01 탐색(홈) — mock, 지도 키 없음', () => {
  test('진입: 인기 지역 12곳, 첫 카드 고성군 즐겨찾기 1위, 히트맵 플레이스홀더에 양양군 54', async ({
    page,
  }) => {
    await page.goto('/?month=2025-10')
    await expect(page.getByRole('heading', { name: '인기 지역 12곳' })).toBeVisible()
    // 히트맵 패널도 /regions/ 링크를 그리므로 카드 그리드로 범위를 좁힌다
    const cards = page.getByTestId('popular-grid').getByRole('link')
    await expect(cards.first()).toContainText('고성군')
    await expect(cards.first()).toContainText('즐겨찾기 1위')
    await expect(page.getByRole('link', { name: '양양군 54' })).toBeVisible()
  })

  test('정렬·필터: 조회 많은 순 → 제주시, 도시 필터 → 카드 감소', async ({ page }) => {
    await page.goto('/?month=2025-10')
    await page.getByRole('button', { name: /정렬/ }).click()
    await page.getByRole('option', { name: '조회 많은 순' }).click()
    await expect(page).toHaveURL(/sort=views/)
    const cards = page.getByTestId('popular-grid').getByRole('link')
    await expect(cards.first()).toContainText('제주시')

    const before = await cards.count()
    // 예시 칩('또래가 많고 저녁이 활기찬 도시에서 한 달')도 '도시'를 포함하므로 카테고리 nav + exact 로 한정
    await page
      .getByRole('navigation', { name: '카테고리' })
      .getByRole('button', { name: '도시', exact: true })
      .click()
    await expect(page).toHaveURL(/terrain=city/)
    await expect.poll(() => cards.count()).toBeLessThan(before)
  })

  test('검색: 예시 칩 → 조건 태그 + URL, 태그 삭제 → 축 제거', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /11월에 조용한 해안/ }).click()
    await expect(page.getByText('AI가 이해한 조건')).toBeVisible()
    await expect(page).toHaveURL(/month=2025-11/)
    await expect(page).toHaveURL(/preset=quiet/)
    await expect(page).toHaveURL(/terrain=coast/)
    await page.getByRole('button', { name: '해안 삭제' }).click()
    await expect(page).not.toHaveURL(/terrain=/)
    await expect(page).toHaveURL(/month=2025-11/)
  })
})
