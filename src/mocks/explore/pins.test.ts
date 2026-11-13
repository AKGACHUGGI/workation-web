import { describe, expect, it } from 'vitest'
import { GANGNEUNG_PINS, allPins, pinsMock } from '@/mocks/explore/pins'

describe('pinsMock', () => {
  it('강릉시 21동 실측 값', () => {
    const res = pinsMock('51150')!
    expect(res.sigunguId).toBe('51150')
    expect(res.dongs).toHaveLength(21)
    expect(res.dongs.every((d) => d.id in GANGNEUNG_PINS)).toBe(true)
    expect(res.dongs.find((d) => d.id === '5115025000')).toEqual({
      id: '5115025000',
      name: '주문진읍',
      center: { lat: 37.88818, lng: 128.75354 },
      tags: ['coast', 'cafe', 'long_stay', 'beach', 'market'],
      topType: '로컬살이형',
      topScore: 60,
      coastal: true,
      life: '생활권',
      grades: { quiet: 'B', evening: 'A' },
    })
  })
  it('강릉 바닷가 동 10곳', () => {
    expect(pinsMock('51150')!.dongs.filter((d) => d.coastal)).toHaveLength(10)
  })
  it('강릉 유형 실측: 로컬 10 · 네트워킹 4 · 몰입 2 · 유형 없음 5 (topScore 도 null)', () => {
    const dongs = pinsMock('51150')!.dongs
    const count = (t: string | null) => dongs.filter((d) => d.topType === t).length
    expect([count('로컬살이형'), count('네트워킹형'), count('몰입형'), count(null)]).toEqual([
      10, 4, 2, 5,
    ])
    expect(dongs.filter((d) => d.topType === null).every((d) => d.topScore === null)).toBe(true)
  })
  it('다른 시군구는 같은 입력이면 같은 값, 태그는 TAG_TABLE 키', () => {
    const a = pinsMock('51210')!
    expect(pinsMock('51210')).toEqual(a)
    expect(a.dongs.length).toBeGreaterThan(0)
    const yeongrang = a.dongs.find((d) => d.id === '5121051000')!
    expect(yeongrang.tags).toEqual(['cafe', 'long_stay', 'beach', 'park'])
    for (const d of a.dongs) {
      expect(d.topType === null).toBe(d.topScore === null)
      if (d.topScore !== null) {
        expect(d.topScore).toBeGreaterThanOrEqual(40)
        expect(d.topScore).toBeLessThanOrEqual(94)
      }
    }
  })
  it('없는 시군구 → null', () => {
    expect(pinsMock('99999')).toBeNull()
  })
  it('allPins: 12개 시군구 동 전부', () => {
    expect(allPins().get('5211357500')?.name).toBe('금암동')
  })
})
