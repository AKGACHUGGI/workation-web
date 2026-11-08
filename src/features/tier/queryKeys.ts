import type { MonthParam, TierScope } from '@/features/tier/types'

/** 탭·프리셋·필터는 키에 넣지 않는다 (프론트 재계산) */
export const tierKeys = {
  all: ['tier'] as const,
  list: ({ month, scope }: { month: MonthParam; scope: TierScope }) =>
    ['tier', { month, scope }] as const,
}
