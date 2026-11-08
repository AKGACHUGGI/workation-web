import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const cards = (page: Page, grade: 'S' | 'A' | 'B' | 'C') =>
  page.getByRole('region', { name: `${grade} 등급` }).getByTestId('tier-card')
const param = (page: Page, key: string) => new URL(page.url()).searchParams.get(key)

test.describe('W-02 티어리스트', () => {
  test('프리셋 전환', async ({ page }) => {
    await page.goto('/tier?month=2025-10')
    await expect(cards(page, 'S').first()).toContainText('양양군')
    await page.getByRole('button', { name: '활기 있는 한 달' }).click()
    await expect(cards(page, 'S').first()).toContainText('전주시')
    await expect.poll(() => param(page, 'preset')).toBe('lively')
  })

  test('직접 설정 유지', async ({ page }) => {
    await page.goto('/tier?month=2025-10')
    await page.getByRole('button', { name: '직접 설정' }).click()
    const toggles = page.getByRole('group', { name: '포함 지표' })
    const peer = toggles.getByRole('button', { name: '또래 밀도' })
    // 기본 선택은 조용·시기·숙박. 또래를 켰다가 다시 꺼서 토글 동작을 확인한다
    await expect(peer).toHaveAttribute('aria-pressed', 'false')
    await peer.click()
    await expect.poll(() => param(page, 'metrics')).toBe('quiet,crowd,peer,overnight')
    await peer.click()
    await expect.poll(() => param(page, 'metrics')).toBe('quiet,crowd,overnight')

    const first = cards(page, 'S').first()
    await expect(first).toContainText('양양군')
    await expect(first.locator('[data-metric="peer"]')).toHaveAttribute('data-dim', 'true')
    await expect(first.locator('[data-metric="vibe"]')).toHaveAttribute('data-dim', 'true')

    await page.reload()
    await expect(cards(page, 'S').first().locator('[data-metric="peer"]')).toHaveAttribute(
      'data-dim',
      'true',
    )
    expect(param(page, 'preset')).toBe('custom')
    expect(param(page, 'metrics')).toBe('quiet,crowd,overnight')
  })

  test('행정동 범위', async ({ page }) => {
    await page.goto('/tier?month=2025-10')
    await page.getByRole('tab', { name: '행정동' }).click()
    await page.getByRole('tab', { name: '개별 지표' }).click()
    await expect(page.getByRole('tab', { name: '숙박 성향' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )

    const filter = page.getByRole('group', { name: '시군구 필터' })
    await filter.getByRole('button', { name: '고성군' }).click()
    const all = page.getByTestId('tier-card')
    await expect(all).toHaveCount(5)
    for (const card of await all.all()) await expect(card).toContainText('고성군')

    await filter.getByRole('button', { name: '전체' }).click()
    await expect(cards(page, 'S')).toHaveCount(6)
    await page
      .getByRole('region', { name: 'S 등급' })
      .getByRole('button', { name: /개 더보기$/ })
      .click()
    expect(await cards(page, 'S').count()).toBeGreaterThan(6)
  })
})
