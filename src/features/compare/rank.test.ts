import { describe, expect, it } from 'vitest'
import { rankInSigungu } from '@/features/compare/rank'
import type { TierItem } from '@/features/tier/types'

const item = (id: string, sgg: string, quiet: number): TierItem => ({
  id,
  name: id,
  province: '강원특별자치도',
  sigungu: { id: sgg, name: sgg },
  photoUrl: '',
  scores: { quiet, crowd: 0, peer: 0, overnight: 0, vibe: 0 },
  inherited: ['overnight'],
  terrain: ['coast'],
})

const items = [
  item('토성면', '51820', 68),
  item('죽왕면', '51820', 55),
  item('거진읍', '51820', 37),
  item('간성읍', '51820', 28),
  item('현내면', '51820', 20),
  item('연동', '50110', 85),
  item('이도2동', '50110', 85),
  item('노형동', '50110', 60),
]

describe('rankInSigungu', () => {
  it('거진읍은 고성군 내 3/5', () => {
    expect(rankInSigungu(items, '거진읍')).toEqual({ rank: 3, total: 5 })
  })
  it('동점은 같은 순위', () => {
    expect(rankInSigungu(items, '연동')).toEqual({ rank: 1, total: 3 })
    expect(rankInSigungu(items, '이도2동')).toEqual({ rank: 1, total: 3 })
    expect(rankInSigungu(items, '노형동')).toEqual({ rank: 3, total: 3 })
  })
  it('없는 id 는 null', () => {
    expect(rankInSigungu(items, '없음')).toBeNull()
  })
})
