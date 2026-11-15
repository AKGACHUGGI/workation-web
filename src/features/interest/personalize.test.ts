import { expect, test } from 'vitest'
import { personalize } from '@/features/interest/personalize'
import { toGrades } from '@/features/metric/score'

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
  expect(r[7].score).toBe(120)
})

test('never drops below base grade', () => {
  const boost = BASE.map((_, i) => (i === 0 ? 0 : 100))
  expect(personalize(BASE, boost)[0].grade).toBe('S')
})
