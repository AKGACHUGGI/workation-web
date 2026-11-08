import type { MetricScores } from '@/features/metric/types'
import type { TierItem } from '@/features/tier/types'
import { SIGUNGU } from '@/mocks/sigungu'

/**
 * 10월 시군구 지표 점수(백분위 0~100). 세 모드 종합 점수가 스펙 §9 표를 재현하도록 역산했다.
 * 계산표는 docs/superpowers/plans/2026-11-07-W-02-티어리스트-plan.md "Mock 수치 설계".
 */
export const SIGUNGU_SCORES_2025_10: Record<string, MetricScores> = {
  '51830': { quiet: 70, crowd: 41, peer: 9, overnight: 90, vibe: 46 }, // 양양군
  '52110': { quiet: 60, crowd: 45, peer: 100, overnight: 1, vibe: 94 }, // 전주시
  '51820': { quiet: 55, crowd: 37, peer: 48, overnight: 76, vibe: 30 }, // 고성군
  '50130': { quiet: 76, crowd: 13, peer: 84, overnight: 25, vibe: 80 }, // 서귀포시
  '46150': { quiet: 45, crowd: 40, peer: 92, overnight: 5, vibe: 56 }, // 순천시
  '50110': { quiet: 40, crowd: 46, peer: 76, overnight: 10, vibe: 94 }, // 제주시
  '51210': { quiet: 30, crowd: 43, peer: 21, overnight: 80, vibe: 82 }, // 속초시
  '51150': { quiet: 12, crowd: 10, peer: 80, overnight: 86, vibe: 25 }, // 강릉시
  '52800': { quiet: 20, crowd: 27, peer: 13, overnight: 70, vibe: 54 }, // 부안군
  '52140': { quiet: 18, crowd: 25, peer: 35, overnight: 20, vibe: 48 }, // 정읍시
  '51170': { quiet: 10, crowd: 18, peer: 6, overnight: 78, vibe: 70 }, // 동해시
  '46770': { quiet: 14, crowd: 10, peer: 4, overnight: 60, vibe: 4 }, // 고흥군
}

export const SIGUNGU_ITEMS_2025_10: TierItem[] = SIGUNGU.map((s) => ({
  id: s.id,
  name: s.name,
  province: s.province,
  photoUrl: s.photoUrl,
  terrain: s.terrain,
  scores: SIGUNGU_SCORES_2025_10[s.id],
  inherited: [],
}))
