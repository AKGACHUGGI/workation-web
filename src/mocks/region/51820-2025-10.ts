import type { RegionDetailResponse } from '@/features/region/types'
import { SIGUNGU_MANUAL } from '@/mocks/region/manual'

const m = SIGUNGU_MANUAL['51820']

/** 분석 결과 기준 기대값 (스펙 §9). E2E·테스트 픽스처 */
export const region51820_202510 = {
  id: m.id,
  name: m.name,
  province: m.province,
  tags: m.tags,
  seasonType: m.seasonType,
  photos: m.photos,
  month: '2025-10',
  stats: {
    crowdIndex: 68,
    dayInflow: 0.76,
    quietRank: 6,
    peerShare: 41,
    overnightCoef: 0.98,
    weekendRatio: 1.05,
  },
  months: [53, 41, 41, 46, 60, 60, 80, 100, 52, 68, 52, 47].map((crowd, i) => ({
    month: i + 1,
    crowd,
  })),
  bestMonths: [2, 3],
  avoidMonths: [7, 8],
  peerOffpeakMonths: [12, 2],
  dongs: [
    {
      id: '5182034000',
      name: '토성면',
      kind: 'tourist',
      landmark: '송지호 해안',
      quietScore: 68,
      peakMonth: 8,
      crowdOfPeak: 61,
    },
    {
      id: '5182033000',
      name: '죽왕면',
      kind: 'tourist',
      landmark: '송지호 · 왕곡마을',
      quietScore: 55,
      peakMonth: 8,
      crowdOfPeak: 58,
    },
    {
      id: '5182025300',
      name: '거진읍',
      kind: 'living',
      landmark: '거진항',
      quietScore: 37,
      peakMonth: 8,
      crowdOfPeak: 72,
    },
    {
      id: '5182025000',
      name: '간성읍',
      kind: 'living',
      landmark: '고성군청',
      quietScore: 28,
      peakMonth: 10,
      crowdOfPeak: 100,
    },
    {
      id: '5182031000',
      name: '현내면',
      kind: 'tourist',
      landmark: '화진포 · 통일전망대',
      quietScore: 20,
      peakMonth: 8,
      crowdOfPeak: 55,
    },
  ],
  excludedDongs: [{ name: '수동면', reason: 'special_facility' }],
  links: m.links,
} satisfies RegionDetailResponse
