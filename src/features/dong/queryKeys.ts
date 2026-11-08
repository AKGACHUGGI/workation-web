import type { MonthParam } from '@/features/metric/month'

export const dongKeys = {
  all: ['dong'] as const,
  detail: (id: string, month: MonthParam) => ['dong', id, { month }] as const,
  notes: (id: string, sort: 'helpful') => ['dong', id, 'notes', { sort }] as const,
  poll: (id: string, month: MonthParam) => ['dong', id, 'poll', { month }] as const,
}

export const geoKeys = {
  sgg: (sggId: string) => ['geo', sggId] as const,
}
