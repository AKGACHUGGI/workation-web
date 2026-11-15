import { expect, test } from 'vitest'
import { personalize } from '@/features/interest/personalize'
import { toGrades } from '@/features/metric/score'
import { GRADES } from '@/features/metric/types'

// 기본 등급 S S A A B B C C
const BASE = [90, 80, 70, 60, 50, 40, 30, 20]

test('zero boost keeps base scores and grades', () => {
  const r = personalize(
    BASE,
    BASE.map(() => 0),
  )
  expect(r.map((x) => x.score)).toEqual(BASE)
  expect(r.map((x) => x.grade)).toEqual(toGrades(BASE))
})

test('climbs at most one grade', () => {
  const boost = BASE.map((_, i) => (i === 7 ? 100 : 0))
  const r = personalize(BASE, boost)
  expect(r[7].grade).toBe('B')
  // 개인 점수 120 은 위 등급(A) 개인 점수 최솟값 60 으로 눌린다. 기본 점수 20 아래로는 내려가지 않는다
  expect(r[7].score).toBe(60)
  expect(r[7].score).toBeGreaterThanOrEqual(BASE[7])
})

test('never drops below base grade', () => {
  const boost = BASE.map((_, i) => (i === 0 ? 0 : 100))
  expect(personalize(BASE, boost)[0].grade).toBe('S')
})

/** 등급 순서(S→C), 같은 등급 안은 점수 내림차순으로 줄 세운다 */
function ordered(r: { score: number; grade: (typeof GRADES)[number] }[]) {
  return [...r].sort(
    (a, b) => GRADES.indexOf(a.grade) - GRADES.indexOf(b.grade) || b.score - a.score,
  )
}

/** 결정적 의사 난수 (선형 합동) */
function lcg(seed: number) {
  let x = seed
  return () => {
    x = (x * 1_103_515_245 + 12_345) % 2 ** 31
    return x / 2 ** 31
  }
}

test('no score inversion across grades', () => {
  // 기본 등급 S S A A B B C C. 2번(50 → 62)이 S 로 올라가고 3번(45 → 52)은 개인 등급 A 라 A 에 남는다.
  // 1번(51)은 개인 등급 A 로 밀렸지만 하락 금지로 S 에 남아, 묶기 전에는 "S 51" 아래 "A 52" 가 된다
  const base = [60, 51, 50, 45, 30, 29, 10, 9]
  const r = personalize(base, [0, 0, 12, 7, 0, 0, 0, 0])
  expect(r[1].grade).toBe('S')
  expect(r[3].grade).toBe('A')
  expect(r[3].score).toBe(51)
  const scores = ordered(r).map((x) => x.score)
  for (let i = 1; i < scores.length; i++) expect(scores[i]).toBeLessThanOrEqual(scores[i - 1])
})

test('no inversion and never below base on random data', () => {
  const rand = lcg(20261115)
  for (let round = 0; round < 20; round++) {
    const base = Array.from({ length: 250 }, () => Math.round(rand() * 1000) / 10)
    const boost = base.map(() => (rand() < 0.3 ? rand() * 15 : 0))
    const r = personalize(base, boost)
    const scores = ordered(r).map((x) => x.score)
    for (let i = 1; i < scores.length; i++) expect(scores[i]).toBeLessThanOrEqual(scores[i - 1])
    r.forEach((x, i) => {
      expect(x.score).toBeGreaterThanOrEqual(base[i])
      expect(x.score).toBeLessThanOrEqual(base[i] + boost[i])
    })
  }
})

test('clamps displayed score at 100', () => {
  const r = personalize([95, 50, 40, 30], [15, 0, 0, 0])
  expect(r[0].score).toBe(100)
  expect(r[0].grade).toBe('S')
})
