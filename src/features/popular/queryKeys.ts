import type { MonthParam } from '@/features/metric/month'

export const popularKeys = {
  all: ['popular'] as const,
  list: (params: { month: MonthParam }) => ['popular', params] as const,
}
