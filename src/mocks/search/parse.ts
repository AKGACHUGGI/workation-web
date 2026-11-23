import { DEMO_SENTENCE, SEARCH_EXAMPLES } from '@/features/search/examples'
import type { SearchIntent } from '@/features/search/types'

const FIXED: Record<string, SearchIntent> = {
  [SEARCH_EXAMPLES[0]]: {
    month: '2025-11',
    preset: 'quiet',
    terrain: ['coast'],
    tags: [
      { axis: 'month', label: '11월' },
      { axis: 'preset', label: '조용한 곳' },
      { axis: 'terrain', label: '해안' },
    ],
  },
  [SEARCH_EXAMPLES[1]]: {
    preset: 'lively',
    terrain: ['coast'],
    stay: 'month',
    peer: true,
    tags: [
      { axis: 'preset', label: '활기 있는 한 달' },
      { axis: 'terrain', label: '해안' },
      { axis: 'stay', label: '한 달' },
      { axis: 'peer', label: '또래' },
    ],
  },
  [SEARCH_EXAMPLES[2]]: {
    month: '2025-04',
    place: ['surf'],
    stay: 'two_weeks',
    tags: [
      { axis: 'month', label: '4월' },
      { axis: 'place', label: '서핑' },
      { axis: 'stay', label: '2주' },
    ],
  },
  [DEMO_SENTENCE]: {
    month: '2025-10',
    preset: 'quiet',
    tags: [
      { axis: 'month', label: '10월' },
      { axis: 'preset', label: '조용한 곳' },
    ],
  },
}

export function getSearchParseMock(text: string): SearchIntent {
  return FIXED[text.trim()] ?? { tags: [] }
}
