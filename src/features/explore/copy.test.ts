import { describe, expect, it } from 'vitest'
import {
  EXPLORE_COPY,
  GROUP_COLOR,
  TAG_GROUP,
  TAG_ICON,
  TAG_ORDER,
  TAG_SHORT,
  legendTags,
  pinTags,
} from '@/features/explore/copy'

describe('태그 상수', () => {
  it('12개, food 없음, 아이콘·짧은 이름·묶음이 모두 있다', () => {
    expect(TAG_ORDER).toHaveLength(12)
    expect(TAG_ORDER).not.toContain('food')
    for (const id of TAG_ORDER) {
      expect(TAG_ICON[id]).toBeDefined()
      expect(TAG_SHORT[id]).toBeTruthy()
      expect(GROUP_COLOR[TAG_GROUP[id]]).toMatch(/^var\(--color-explore-group-/)
    }
  })
})

describe('pinTags', () => {
  it('아이콘이 있는 태그 중 앞 2개', () => {
    expect(pinTags(['coast', 'cafe', 'beach'])).toEqual(['coast', 'cafe'])
    expect(pinTags(['unknown', 'beach'])).toEqual(['beach'])
    expect(pinTags([])).toEqual([])
  })
})

describe('legendTags', () => {
  it('핀에 그려진 태그만, TAG_ORDER 순, 중복 없이', () => {
    expect(legendTags([{ tags: ['beach', 'cafe', 'park'] }, { tags: ['cafe', 'coast'] }])).toEqual([
      'coast',
      'cafe',
      'beach',
    ])
  })
})

describe('EXPLORE_COPY', () => {
  it('지도 문구', () => {
    expect(EXPLORE_COPY.sigunguTip('강릉시')).toBe('강릉시 · 눌러서 확대')
    expect(EXPLORE_COPY.pinsError).toBe('동네 목록을 불러오지 못했어요.')
  })
})
