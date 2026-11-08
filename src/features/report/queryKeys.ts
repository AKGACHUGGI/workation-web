import type { ReportPreset } from '@/features/report/types'

export const reportKeys = {
  all: ['report'] as const,
  detail: (id: string, p: { year: number; preset: ReportPreset }) => ['report', id, p] as const,
}
