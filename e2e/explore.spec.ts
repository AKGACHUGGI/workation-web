import { expect, test } from '@playwright/test'

const GANGNEUNG = '51150'
const JUMUNJIN = '5115025000'
const YEONGOK = '5115037000'
const NOHAK = '5121057000'

test.describe('W-09 지도 탐색 v6', () => {
  test('강릉시 지식그래프 → 연곡면 카드 공통 3 → 동 패널, 주문진읍 동 패널 1위 장기체류형 61', async ({
    page,
  }) => {
    await page.goto('/explore')
    await expect(page.getByRole('heading', { name: '지역을 골라 보세요' })).toBeVisible()

    // 지도 키가 없는 E2E 에서는 시군구 경계를 누를 수 없어 URL 로 ① 에 들어간다
    await page.goto(`/explore?sgg=${GANGNEUNG}`)
    const graph = page.getByRole('group', { name: '강릉시 지식그래프' })
    await expect(graph.locator('[data-kind="dong"]')).toHaveCount(21)

    await graph.getByRole('button', { name: '연곡면', exact: true }).click()
    await expect(page.getByRole('region', { name: '연곡면' })).toContainText('공통 3')
    await expect(page).not.toHaveURL(/dong=/)

    await page.getByRole('button', { name: '동네 자세히 보기' }).click()
    await expect(page).toHaveURL(new RegExp(`dong=${YEONGOK}`))
    await expect(page.getByRole('heading', { level: 2, name: '연곡면' })).toBeVisible()

    // 지도 핀 클릭 대신 같은 URL 로 바로 ② (핀 클릭 = openDong 은 단위 테스트)
    await page.goto(`/explore?sgg=${GANGNEUNG}&dong=${JUMUNJIN}`)
    await expect(page.getByRole('heading', { level: 2, name: '주문진읍' })).toBeVisible()
    const top = page.getByRole('region', { name: '워케이션 유형' }).getByRole('listitem').first()
    await expect(top).toContainText('장기체류형')
    await expect(top).toContainText('61')
  })

  test('주말 토글 → 시간대 칩 주말, 한산한 달 → 강릉시 기준 막대, 브리핑 위치 그대로', async ({
    page,
  }) => {
    await page.goto(`/explore?sgg=${GANGNEUNG}&dong=${JUMUNJIN}`)
    const briefing = page.getByRole('heading', { name: '이 동네에서 일하는 하루' })
    await expect(briefing).toBeVisible()
    const before = await briefing.boundingBox()

    await page.getByRole('tab', { name: '주말' }).click()
    await expect(page.getByRole('button', { name: /^도로 한산/ })).toContainText('주말 3시')

    await page.getByRole('button', { name: /^한산한 달/ }).click()
    await expect(page.getByTestId('detail-slot')).toContainText('강릉시 기준')

    const after = await briefing.boundingBox()
    expect(after?.y).toBe(before?.y)
  })

  test('비슷한 동 첫 행 → 노학동 패널·URL 갱신, 뒤로 가기 → 주문진읍', async ({ page }) => {
    await page.goto(`/explore?sgg=${GANGNEUNG}&dong=${JUMUNJIN}`)
    await page.getByRole('list', { name: '비슷한 바닷가 동' }).getByRole('button').first().click()
    await expect(page).toHaveURL(new RegExp(`dong=${NOHAK}`))
    await expect(page.getByRole('heading', { level: 2, name: '노학동' })).toBeVisible()

    await page.goBack()
    await expect(page).toHaveURL(new RegExp(`dong=${JUMUNJIN}`))
    await expect(page.getByRole('heading', { level: 2, name: '주문진읍' })).toBeVisible()
  })
})
