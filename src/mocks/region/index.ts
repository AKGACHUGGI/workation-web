import { monthLabel } from '@/features/metric/month'
import type { MonthParam } from '@/features/metric/month'
import type { PresetKey } from '@/features/metric/types'
import type { NotesResponse, PollResponse, RegionDetailResponse } from '@/features/region/types'
import { region51820_202510 } from '@/mocks/region/51820-2025-10'
import { makeRegionMock } from '@/mocks/region/generate'
import { SIGUNGU_MANUAL } from '@/mocks/region/manual'
import { notes51820 } from '@/mocks/region/notes-51820'
import { poll51820 } from '@/mocks/region/poll-51820'

const HANDWRITTEN: Record<string, RegionDetailResponse> = {
  '51820|2025-10': region51820_202510,
}

/** 없는 id 면 null (api.ts 가 NotFoundError 로 바꾼다) */
export function getRegionMock(id: string, month: MonthParam): RegionDetailResponse | null {
  if (!(id in SIGUNGU_MANUAL)) return null
  return HANDWRITTEN[`${id}|${month}`] ?? makeRegionMock(id, month)
}

export function getNotesMock(id: string): NotesResponse {
  return id === '51820' ? notes51820 : { total: 0, items: [] }
}

export function getPollMock(id: string, month: MonthParam, preset: PresetKey): PollResponse {
  const name = SIGUNGU_MANUAL[id]?.name ?? id
  const suffix =
    preset === 'quiet'
      ? '실제로 조용했나요?'
      : preset === 'lively'
        ? '실제로 활기 있었나요?'
        : '어땠나요?'
  const question = `${monthLabel(month)} ${name}, ${suffix}`
  if (id === '51820') return { ...poll51820, question }
  return { question, yes: 0, no: 0, total: 0, photos: [] }
}
