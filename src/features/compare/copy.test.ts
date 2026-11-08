import { describe, expect, it } from 'vitest'
import { shortMetricCopy } from '@/features/compare/copy'
import type { DongDetailResponse } from '@/features/dong/types'

const detail = {
  sigungu: { id: '51820', name: '고성군' },
  stats: { dayInflow: 0.79, localLife: 75, peerShare: 39, eveningVibe: 0.18, eveningSurplus: 0.85 },
} as DongDetailResponse

describe('shortMetricCopy', () => {
  it('거진읍 10월 부제 4종', () => {
    expect(shortMetricCopy(detail, { rank: 3, total: 5 })).toEqual({
      quiet: '고성군 내 3위 · 낮 유입 0.79',
      vibe: '저녁 유동 ÷ 체류 0.18',
      peer: '20~40대 39%',
      localLife: '거주+근무 75%',
    })
  })
  it('순위가 없으면(티어 제외 동) 낮 유입만', () => {
    expect(shortMetricCopy(detail, null).quiet).toBe('낮 유입 0.79')
  })
})
