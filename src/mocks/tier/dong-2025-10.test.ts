import { describe, expect, it } from 'vitest'
import { DONG_ITEMS_2025_10 } from '@/mocks/tier/dong-2025-10'
import { SIGUNGU_SCORES_2025_10 } from '@/mocks/tier/sigungu-2025-10'

const inSgg = (sgg: string) => DONG_ITEMS_2025_10.filter((d) => d.sigungu?.id === sgg)
const quietRank = (sgg: string, id: string) => {
  const sorted = [...inSgg(sgg)].sort((a, b) => b.scores.quiet - a.scores.quiet)
  return { rank: sorted.findIndex((d) => d.id === id) + 1, total: sorted.length }
}
const byId = (id: string) => DONG_ITEMS_2025_10.find((d) => d.id === id)

describe('10월 행정동 픽스처', () => {
  it('67개, id 중복 없음', () => {
    expect(DONG_ITEMS_2025_10).toHaveLength(67)
    expect(new Set(DONG_ITEMS_2025_10.map((d) => d.id)).size).toBe(67)
  })

  it('고성군 5개, quiet 순서 토성 68 > 죽왕 55 > 거진 37 > 간성 28 > 현내 20, 수동면 제외', () => {
    const goseong = [...inSgg('51820')].sort((a, b) => b.scores.quiet - a.scores.quiet)
    expect(goseong.map((d) => [d.name, d.scores.quiet])).toEqual([
      ['토성면', 68],
      ['죽왕면', 55],
      ['거진읍', 37],
      ['간성읍', 28],
      ['현내면', 20],
    ])
    expect(byId('5182032000')).toBeUndefined()
  })

  it('거진읍·금호동·연동 점수', () => {
    expect(byId('5182025300')?.scores).toEqual({
      quiet: 37,
      crowd: 40,
      peer: 44,
      overnight: 76,
      vibe: 38,
    })
    expect(byId('5121053500')?.scores).toEqual({
      quiet: 3,
      crowd: 35,
      peer: 65,
      overnight: 80,
      vibe: 56,
    })
    expect(byId('5011062000')?.scores).toEqual({
      quiet: 85,
      crowd: 30,
      peer: 95,
      overnight: 10,
      vibe: 99,
    })
  })

  it('시군구 안 quiet 순위: 거진읍 3/5, 금호동 8/8, 연동 4/26', () => {
    expect(quietRank('51820', '5182025300')).toEqual({ rank: 3, total: 5 })
    expect(quietRank('51210', '5121053500')).toEqual({ rank: 8, total: 8 })
    expect(quietRank('50110', '5011062000')).toEqual({ rank: 4, total: 26 })
  })

  it('W-04 유사 동네·W-05 동 id 가 있다', () => {
    for (const id of [
      '5013061000',
      '4677036000',
      '5117057000',
      '5214036000',
      '5182033000',
      '5182034000',
    ]) {
      expect(byId(id)).toBeDefined()
    }
  })

  it('overnight 는 소속 시군구 값, inherited = [overnight], terrain 상속', () => {
    for (const d of DONG_ITEMS_2025_10) {
      expect(d.scores.overnight).toBe(SIGUNGU_SCORES_2025_10[d.sigungu!.id].overnight)
      expect(d.inherited).toEqual(['overnight'])
      expect(d.terrain.length).toBeGreaterThan(0)
    }
  })
})
