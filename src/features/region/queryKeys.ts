import type { MonthParam } from '@/features/metric/month'
import type { PresetKey } from '@/features/metric/types'
import type { NotesSort } from '@/features/region/types'

export const regionKeys = {
  all: ['region'] as const,
  detail: (id: string, p: { month: MonthParam }) => ['region', id, p] as const,
  notes: (id: string, p: { sort: NotesSort }) => ['region', id, 'notes', p] as const,
  poll: (id: string, p: { month: MonthParam; preset: PresetKey }) =>
    ['region', id, 'poll', p] as const,
}
