import { describe, expect, it } from 'vitest'
import {
  GROUP_META,
  TAG_ICON,
  TAG_ORDER,
  TAG_SHORT,
  gradeLabel,
  gradeParts,
  sharedTags,
} from '@/features/explore/copy'
import type { ExploreDong } from '@/features/explore/types'

const dong = (id: string, tagIds: string[]): ExploreDong => ({
  id,
  name: id,
  sigunguId: '51150',
  center: { lat: 37.8, lng: 128.8 },
  bbox: [128.7, 37.7, 128.9, 37.9],
  grades: null,
  tags: tagIds.map((tagId) => ({ tagId, placeCount: 1 })),
  coastKm: null,
  similar: [],
})

describe('태그 상수', () => {
  it('12개, food 없음, 아이콘·짧은 이름이 모두 있다', () => {
    expect(TAG_ORDER).toHaveLength(12)
    expect(TAG_ORDER).not.toContain('food')
    for (const id of TAG_ORDER) {
      expect(TAG_ICON[id]).toBeDefined()
      expect(TAG_SHORT[id]).toBeTruthy()
    }
  })
  it('묶음 색은 explore 토큰 변수', () => {
    expect(GROUP_META.work.color).toBe('var(--color-explore-group-work)')
    expect(GROUP_META.trait.label).toBe('동네 성격')
  })
})

describe('gradeLabel', () => {
  it('세 지표 등급을 · 로 잇는다', () => {
    expect(gradeLabel({ quiet: 'S', peer: 'A', evening: 'B' })).toBe(
      '동네 조용함 S · 또래 밀도 A · 저녁 활기 B',
    )
  })
  it('null 지표는 빼고, 모두 없으면 null', () => {
    expect(gradeLabel({ quiet: null, peer: 'A', evening: null })).toBe('또래 밀도 A')
    expect(gradeLabel({ quiet: null, peer: null, evening: null })).toBeNull()
    expect(gradeLabel(null)).toBeNull()
    expect(gradeParts(null)).toEqual([])
  })
})

describe('sharedTags', () => {
  it('a 의 태그 순서대로 b 에도 있는 태그', () => {
    expect(
      sharedTags(dong('a', ['coast', 'cafe', 'beach']), dong('b', ['beach', 'coast'])),
    ).toEqual(['coast', 'beach'])
  })
})
