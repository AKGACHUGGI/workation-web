import { describe, expect, it } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import renderWithRouter from '@/test/renderWithRouter'
import TierSection from '@/features/tier/components/TierSection'
import type { TierGroup } from '@/features/tier/types'
import { DONG_ITEMS_2025_10 } from '@/mocks/tier/dong-2025-10'
import { SIGUNGU_ITEMS_2025_10 } from '@/mocks/tier/sigungu-2025-10'

const dongGroup: TierGroup = {
  grade: 'S',
  entries: DONG_ITEMS_2025_10.slice(0, 10).map((item) => ({
    item,
    score: item.scores.quiet,
    grade: 'S',
  })),
}

describe('TierSection', () => {
  it('등급 패널: 글자·범위·설명·개수', () => {
    renderWithRouter(
      <TierSection
        group={dongGroup}
        description="평균 이상"
        collapsible={false}
        selected={null}
        tab="value"
        monthLabel="10월"
      />,
    )
    const section = screen.getByRole('region', { name: 'S 등급' })
    expect(within(section).getByText('상위 25%')).toBeInTheDocument()
    expect(within(section).getByText('10개 지역')).toBeInTheDocument()
    expect(within(section).getAllByTestId('tier-card')).toHaveLength(10)
  })

  it('행정동 범위는 6개까지, 더보기로 펼치고 접는다', async () => {
    renderWithRouter(
      <TierSection
        group={dongGroup}
        description=""
        collapsible
        selected={null}
        tab="metric"
        monthLabel="10월"
      />,
    )
    expect(screen.getAllByTestId('tier-card')).toHaveLength(6)
    await userEvent.click(screen.getByRole('button', { name: '+ 4개 더보기' }))
    expect(screen.getAllByTestId('tier-card')).toHaveLength(10)
    await userEvent.click(screen.getByRole('button', { name: '접기' }))
    expect(screen.getAllByTestId('tier-card')).toHaveLength(6)
  })

  it('0개면 안내 문구', () => {
    renderWithRouter(
      <TierSection
        group={{ grade: 'C', entries: [] }}
        description=""
        collapsible
        selected={null}
        tab="value"
        monthLabel="10월"
      />,
    )
    expect(screen.getByText('이 등급에 해당하는 동네가 없습니다')).toBeInTheDocument()
  })

  it('카드 링크: 시군구 → /regions, 행정동 → /dongs, 공유 쿼리 유지', () => {
    const yangyang = SIGUNGU_ITEMS_2025_10.find((i) => i.name === '양양군')!
    const geojin = DONG_ITEMS_2025_10.find((i) => i.name === '거진읍')!
    renderWithRouter(
      <TierSection
        group={{
          grade: 'S',
          entries: [
            { item: yangyang, score: 54, grade: 'S' },
            { item: geojin, score: 37, grade: 'S' },
          ],
        }}
        description=""
        collapsible={false}
        selected={null}
        tab="value"
        monthLabel="10월"
      />,
      { route: '/tier?month=2025-10&preset=lively&tab=metric' },
    )
    const [a, b] = screen.getAllByTestId('tier-card')
    expect(a).toHaveAttribute('href', '/regions/51830?month=2025-10&preset=lively')
    expect(b).toHaveAttribute('href', '/dongs/5182025300?month=2025-10&preset=lively')
    expect(b).toHaveTextContent('강원특별자치도 · 고성군')
    expect(a).toHaveTextContent('54점')
  })
})
