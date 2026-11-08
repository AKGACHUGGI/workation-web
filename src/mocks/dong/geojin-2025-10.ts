import type { DongDetailResponse } from '@/features/dong/types'
import { DONG_MANUAL } from '@/mocks/dong/manual'

const m = DONG_MANUAL['5182025300']

/**
 * 거진읍 · 2025-10 (스펙 §9 테스트 픽스처).
 * 주중 피크 11시 = 100, 가장 한산 3시 = 48 · 주말 피크 13시 = 100, 가장 한산 3시 = 47.
 */
export const GEOJIN_2025_10 = {
  id: '5182025300',
  name: m.name,
  sigungu: m.sigungu,
  province: m.province,
  kind: m.kind,
  tags: m.tags,
  photos: [
    { url: m.photoUrl },
    { url: m.photoUrl },
    { url: m.photoUrl },
    { url: m.photoUrl },
    { url: m.photoUrl },
  ],
  landmarks: m.landmarks,
  accessNote: m.accessNote,
  month: '2025-10',
  stats: { dayInflow: 0.79, localLife: 75, peerShare: 39, eveningVibe: 0.18, eveningSurplus: 0.85 },
  hourly: {
    //        0   1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20  21  22  23
    weekday: [
      58, 53, 50, 48, 49, 53, 62, 74, 86, 94, 98, 100, 97, 95, 93, 91, 88, 84, 78, 72, 68, 65, 62,
      60,
    ],
    weekend: [
      55, 51, 49, 47, 48, 50, 56, 64, 74, 84, 92, 97, 99, 100, 98, 96, 93, 89, 82, 75, 69, 64, 60,
      57,
    ],
  },
  peaks: {
    weekday: { peakHour: 11, lowHour: 3, lowValue: 48 },
    weekend: { peakHour: 13, lowHour: 3, lowValue: 47 },
  },
  activityMix: { eveningDowntown: 25, weekendTourist: 32, weekdayWork: 24, dawnResidential: 19 },
  seasonType: 'second_half_rise',
  quieterTwins: [
    {
      id: '4677036000',
      name: '봉래면',
      sigunguId: '46770',
      sigunguName: '고흥군',
      similarity: 0.78,
      visitorRatio: 0.41,
      photoUrl: '/mock-photos/46770.jpg',
    },
    {
      id: '5117057000',
      name: '삼화동',
      sigunguId: '51170',
      sigunguName: '동해시',
      similarity: 0.74,
      visitorRatio: 0.63,
      photoUrl: '/mock-photos/51170.jpg',
    },
    {
      id: '5214036000',
      name: '산내면',
      sigunguId: '52140',
      sigunguName: '정읍시',
      similarity: 0.68,
      visitorRatio: 0.37,
      photoUrl: '/mock-photos/52140.jpg',
    },
  ],
  bbox: m.bbox,
} satisfies DongDetailResponse
