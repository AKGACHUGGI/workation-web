import { describe, expect, it } from 'vitest'
import {
  DONG_R,
  MIN_GAP,
  SIGUNGU_R,
  TYPE_R,
  centerOut,
  radialLayout,
  twoRings,
} from '@/features/explore/radialLayout'
import type { Point } from '@/features/explore/radialLayout'
import { SIGUNGU_NODE, typeNodeId } from '@/features/explore/sigunguGraph'
import type { PinDong, TypeName } from '@/features/explore/types'

const SIZE = { w: 399, h: 400 }
const C = { x: SIZE.w / 2, y: SIZE.h / 2 }
const S = Math.min(SIZE.w, SIZE.h)
/** 화면 기준 각도: 0° = 오른쪽, 90° = 아래 (시계 방향) */
const angle = (p: Point) => ((Math.atan2(p.y - C.y, p.x - C.x) * 180) / Math.PI + 360) % 360
const angleDiff = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180)
const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y)

const pin = (id: string, name: string, topType: TypeName | null, topScore: number | null) =>
  ({
    id,
    name,
    center: null,
    tags: [],
    topType,
    topScore,
    coastal: false,
    life: null,
    grades: { quiet: null, evening: null },
  }) satisfies PinDong

/** 강릉 실측과 같은 모양: 없음 5 · 몰입 2 · 네트워킹 4 · 로컬 10 = 21 */
const PINS: PinDong[] = [
  ...['가면', '나면', '다면', '라면', '마면'].map((n, i) => pin(`n${i}`, n, null, null)),
  pin('i1', '송정동', '몰입형', 63),
  pin('i2', '연곡면', '몰입형', 50),
  pin('w1', '경포동', '네트워킹형', 74),
  pin('w2', '중앙동', '네트워킹형', 71),
  pin('w3', '옥천동', '네트워킹형', 64),
  pin('w4', '초당동', '네트워킹형', 64),
  ...[97, 96, 90, 89, 88, 87, 85, 64, 60, 46].map((s, i) =>
    pin(`l${i}`, `로컬${i}동`, '로컬살이형', s),
  ),
]
const STEP = 360 / 21

describe('centerOut', () => {
  it('가운데부터 바깥으로 번갈아', () => {
    expect(centerOut(1)).toEqual([0])
    expect(centerOut(4)).toEqual([1, 2, 0, 3])
    expect(centerOut(5)).toEqual([2, 1, 3, 0, 4])
  })
})

describe('radialLayout', () => {
  const layout = radialLayout(PINS, SIZE)

  it('시군구는 가운데, 유형은 안쪽 링, 동은 바깥 링 (21동은 한 줄)', () => {
    expect(layout.get(SIGUNGU_NODE)).toEqual({ x: C.x, y: C.y, r: SIGUNGU_R })
    for (const t of ['몰입형', '네트워킹형', '로컬살이형'] as const) {
      const p = layout.get(typeNodeId(t))!
      expect(p.r).toBe(TYPE_R)
      expect(dist(p, { ...C, r: 0 })).toBeCloseTo(S * 0.19, 5)
    }
    expect(twoRings(21, SIZE)).toBe(false)
    for (const p of PINS) {
      const d = layout.get(p.id)!
      expect(d.r).toBe(DONG_R)
      expect(dist(d, { ...C, r: 0 })).toBeCloseTo(S * 0.42, 5)
    }
  })

  it('유형 없음 무리는 가운데가 아래(90°), 이름 가나다순으로 시계 방향', () => {
    const none = ['n0', 'n1', 'n2', 'n3', 'n4'].map((id) => angle(layout.get(id)!))
    expect(none[2]).toBeCloseTo(90, 5)
    expect([...none].sort((a, b) => a - b)).toEqual(none)
  })

  it('각도 몫은 동 수에 비례, 시계 방향으로 몰입 → 네트워킹 → 로컬', () => {
    const start = 90 - (5 * STEP) / 2
    // 몰입형(2동)·네트워킹형(4동)은 서로 붙지 않게 최소 각도만큼 벌어진다 (각 1° 안팎)
    expect(angleDiff(angle(layout.get(typeNodeId('몰입형'))!), start + 6 * STEP)).toBeLessThan(2)
    expect(angleDiff(angle(layout.get(typeNodeId('네트워킹형'))!), start + 9 * STEP)).toBeLessThan(
      2,
    )
    expect(angle(layout.get(typeNodeId('로컬살이형'))!)).toBeCloseTo(start + 16 * STEP, 5)
  })

  it('무리 1등(점수 최고)이 무리 가운데 — 유형 노드와 반 칸 이내', () => {
    for (const [t, top] of [
      ['몰입형', 'i1'],
      ['네트워킹형', 'w1'],
      ['로컬살이형', 'l0'],
    ] as const) {
      const diff = angleDiff(angle(layout.get(top)!), angle(layout.get(typeNodeId(t))!))
      expect(diff).toBeLessThanOrEqual(STEP / 2 + 2) // 유형 원 벌림 몫 2° 까지
    }
  })

  it('유형 원끼리, 유형 원과 시군구 원이 겹치지 않는다 (작은 무리가 이웃해도)', () => {
    const tiny = [
      pin('a', '가동', '몰입형', 50),
      pin('b', '나동', '네트워킹형', 50),
      ...Array.from({ length: 32 }, (_, i) => pin(`l${i}`, `로컬${i}동`, '로컬살이형', 60)),
    ]
    for (const set of [PINS, tiny]) {
      const m = radialLayout(set, SIZE)
      const center = m.get(SIGUNGU_NODE)!
      const types = (['몰입형', '네트워킹형', '로컬살이형'] as const).map((t) =>
        m.get(typeNodeId(t))!,
      )
      for (let a = 0; a < types.length; a++) {
        expect(dist(types[a], center)).toBeGreaterThanOrEqual(TYPE_R + SIGUNGU_R + 4)
        for (let b = a + 1; b < types.length; b++) {
          expect(dist(types[a], types[b])).toBeGreaterThanOrEqual(2 * TYPE_R + 4)
        }
      }
    }
  })

  it('같은 입력이면 같은 좌표', () => {
    expect(radialLayout(PINS, SIZE)).toEqual(layout)
  })

  it('이어진 동이 없는 유형은 노드가 없다, 유형 없는 동이 없으면 몰입형이 아래에서 시작', () => {
    const local = PINS.filter((p) => p.topType === '로컬살이형')
    const only = radialLayout(local, SIZE)
    expect(only.has(typeNodeId('몰입형'))).toBe(false)
    expect(only.has(typeNodeId('로컬살이형'))).toBe(true)
    expect(only.size).toBe(1 + 1 + 10)
  })

  it('34동(전주시 규모): 두 줄, 어느 두 동도 MIN_GAP 이상 떨어지고 영역 안', () => {
    const types: (TypeName | null)[] = [null, '몰입형', '네트워킹형', '로컬살이형']
    const many = Array.from({ length: 34 }, (_, i) =>
      pin(`d${i}`, `동${i}`, types[i % 4], types[i % 4] ? 40 + i : null),
    )
    expect(twoRings(34, SIZE)).toBe(true)
    const m = radialLayout(many, SIZE)
    const dongs = many.map((p) => m.get(p.id)!)
    for (let a = 0; a < dongs.length; a++) {
      for (let b = a + 1; b < dongs.length; b++) {
        expect(dist(dongs[a], dongs[b])).toBeGreaterThanOrEqual(MIN_GAP)
      }
      const d = dongs[a]
      expect(d.x - d.r).toBeGreaterThanOrEqual(0)
      expect(d.x + d.r).toBeLessThanOrEqual(SIZE.w)
      expect(d.y - d.r).toBeGreaterThanOrEqual(0)
      expect(d.y + d.r + 14).toBeLessThanOrEqual(SIZE.h) // 아래 이름 칸
    }
  })

  it('빈 목록이면 시군구 노드만', () => {
    expect([...radialLayout([], SIZE).keys()]).toEqual([SIGUNGU_NODE])
  })
})
