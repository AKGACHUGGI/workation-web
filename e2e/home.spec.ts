import { expect, test } from '@playwright/test'

test.describe('W-01 탐색(홈) — mock, 지도 키 없음', () => {
  test('진입: 인기 지역 12곳, 첫 카드 고성군 즐겨찾기 1위, 분위기 없음 → 히트맵 플레이스홀더에 양양군 51', async ({
    page,
  }) => {
    await page.goto('/?month=2025-10')
    await expect(page.getByRole('heading', { name: '인기 지역 12곳' })).toBeVisible()
    // 히트맵 패널도 /regions/ 링크를 그리므로 카드 그리드로 범위를 좁힌다
    const cards = page.getByTestId('popular-grid').getByRole('link')
    await expect(cards.first()).toContainText('고성군')
    await expect(cards.first()).toContainText('즐겨찾기 1위')
    // 분위기를 안 고르면 지표 5개 같은 가중치 (조용한 곳이면 54)
    await expect(
      page.getByRole('group', { name: '분위기' }).getByRole('button', { pressed: true }),
    ).toHaveCount(0)
    await expect(page.getByRole('link', { name: '양양군 51' })).toBeVisible()
  })

  test('정렬·필터: 조회 많은 순 → 제주시, 해안 필터 → 카드 감소', async ({ page }) => {
    await page.goto('/?month=2025-10')
    await page.getByRole('button', { name: /정렬/ }).click()
    await page.getByRole('option', { name: '조회 많은 순' }).click()
    await expect(page).toHaveURL(/sort=views/)
    const cards = page.getByTestId('popular-grid').getByRole('link')
    await expect(cards.first()).toContainText('제주시')

    const before = await cards.count()
    // 산간·도시 칩은 지웠다. mock 에는 해안이 아닌 시군구가 있어 해안 필터로 카드가 준다.
    // 예시 칩 문구에도 '해안' 이 들어가므로 카테고리 nav 의 버튼으로 한정
    await page
      .getByRole('navigation', { name: '카테고리' })
      .getByRole('button', { name: '해안', exact: true })
      .click()
    await expect(page).toHaveURL(/terrain=coast/)
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
