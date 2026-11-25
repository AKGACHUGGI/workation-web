import { describe, expect, it } from 'vitest'
import { AGE_GROUPS, AGE_GROUP_LABEL } from '@/features/auth/ageGroup'

describe('AGE_GROUPS', () => {
  it('10대부터 90대까지 9개이고 모든 값에 라벨이 있다', () => {
    expect(AGE_GROUPS.length).toBe(9)
    expect(AGE_GROUPS[0]).toBe('10s')
    expect(AGE_GROUPS[AGE_GROUPS.length - 1]).toBe('90s')
    for (const g of AGE_GROUPS) expect(AGE_GROUP_LABEL[g]).toBeTruthy()
  })
})
