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

    await page.getByRole('button', { name: '강릉시 그래프로' }).click()
    await expect(page).toHaveURL(new RegExp(`sgg=${GANGNEUNG}$`))
    await page.getByRole('button', { name: '전체 지도로' }).click()
    await expect(page.getByRole('heading', { name: '지역을 골라 보세요' })).toBeVisible()

    // 지도 핀 클릭 대신 같은 URL 로 바로 ② (핀 클릭 = openDong 은 단위 테스트)
    await page.goto(`/explore?sgg=${GANGNEUNG}&dong=${JUMUNJIN}`)
    await expect(page.getByRole('heading', { level: 2, name: '주문진읍' })).toBeVisible()
    const top = page.getByRole('region', { name: '워케이션 유형' }).getByRole('listitem').first()
    await expect(top).toContainText('장기체류형')
    await expect(top).toContainText('61')
  })

  test('① 관계 줄: 유형·바닷가·생활권/관광지는 고정, 조용함 등급 칩을 켜고 끄면 사실 노드가 생기고 빠진다', async ({
    page,
  }) => {
    await page.goto(`/explore?sgg=${GANGNEUNG}`)
    const graph = page.getByRole('group', { name: '강릉시 지식그래프' })
    await expect(graph.locator('[data-kind="dong"]')).toHaveCount(21)
    const row = page.getByRole('group', { name: '관계' })
    await expect(row.getByRole('button')).toHaveText(['조용함 등급', '저녁 활기 등급'])
    await expect(row).toContainText('워케이션 유형')
    await expect(page.getByText(/1위 유형|가까움/)).toHaveCount(0)

    const quiet = graph.getByRole('button', { name: /^사실 조용함/ })
    await expect(quiet).toHaveCount(0)
    await row.getByRole('button', { name: '조용함 등급' }).click()
    await expect(quiet.first()).toBeVisible()
    await row.getByRole('button', { name: '조용함 등급' }).click()
    await expect(quiet).toHaveCount(0)
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

  test('동네에 물어보기: 입력 → 답(칩 없음), 맛집 → 안내 + 예시 칩, 칩 → 답 후 칩 사라짐', async ({
    page,
  }) => {
    await page.goto(`/explore?sgg=${GANGNEUNG}&dong=${JUMUNJIN}`)
    const chips = page.getByRole('group', { name: '예시 질문' })
    const input = page.getByRole('textbox', { name: '이 동네에 물어보기' })
    const log = page.getByRole('log', { name: '물어본 대화' })
    await expect(chips).toHaveCount(0)

    await input.fill('이 동네 조용해?')
    await input.press('Enter')
    await expect(log).toContainText('조용함은 B등급(31점)이에요.')
    await expect(chips).toHaveCount(0)

    await input.fill('맛집 있어?')
    await input.press('Enter')
    await expect(log).toContainText('식당·카페는 아직 몰라요')
    await expect(chips.getByRole('button')).toHaveCount(3)

    await chips.getByRole('button', { name: '이 동네 조용해?' }).click()
    await expect(log.locator('[data-turn="done"]')).toHaveCount(3)
    await expect(chips).toHaveCount(0)
  })
})
