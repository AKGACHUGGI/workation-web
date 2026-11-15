import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/** 티어표 전체 카드 중 이름이 들어간 카드의 순번 (0부터) */
async function cardIndex(page: Page, name: string): Promise<number> {
  const cards = page.getByTestId('tier-card')
  await expect(cards.first()).toBeVisible()
  const texts = await cards.allTextContents()
  return texts.findIndex((t) => t.includes(name))
}

test.describe('개인화 랭킹', () => {
  test('시군구 상세를 본 뒤 티어표에서 그 지역이 앞으로 온다', async ({ browser }) => {
    // 기록이 없는 새 브라우저 컨텍스트에서 시작한다
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto('/tier?month=2025-10')
    const before = await cardIndex(page, '고성군')
    expect(before).toBeGreaterThanOrEqual(0)

    await page.goto('/regions/51820?month=2025-10')
    // 상세는 들어온 순간의 기록으로 고정되어 기본 점수 그대로다
    await expect(page.getByTestId('score')).toHaveText('50')

    await page.goto('/tier?month=2025-10')
    await expect.poll(() => cardIndex(page, '고성군')).toBeLessThan(before)

    await context.close()
  })
})
