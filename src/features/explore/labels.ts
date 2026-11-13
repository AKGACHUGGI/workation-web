import type {
  DayGroup,
  DetailKind,
  DongDetail,
  GradeValue,
  HourlyDay,
  SimilarDong,
} from '@/features/explore/types'

export type GradeKey = 'quiet' | 'peer' | 'evening'

export const GRADE_LABEL: Record<GradeKey, string> = {
  quiet: '조용함',
  peer: '또래 밀도',
  evening: '저녁 활기',
}

export const DAY_LABEL: Record<DayGroup, string> = { weekday: '평일', weekend: '주말' }

/** 비슷한 동 점수 차의 짧은 이름 (Figma ②: `조용함 +8 · 또래 +13 · 저녁 −15`) */
const DIFF_LABEL: Record<GradeKey, string> = { quiet: '조용함', peer: '또래', evening: '저녁' }

/** ② 눌리는 칩 이름. 칩 첫 줄과 상세 칸 제목 앞 연결 표시에 같이 쓴다 */
export const DETAIL_CHIP_TITLE: Record<DetailKind, string> = {
  hour: '도로 한산',
  month: '한산한 달',
}

/** `도로 한산 · 평일 9시`. 한산 시각이 없으면 null (칩 숨김) */
export function hourChipLabel(hourly: Record<DayGroup, HourlyDay>, day: DayGroup): string | null {
  const h = hourly[day].quietHour
  return h === null ? null : `${DETAIL_CHIP_TITLE.hour} · ${DAY_LABEL[day]} ${h}시`
}

/** `한산한 달 · 2·4·9월`. 한산한 달이 없으면 null (칩 숨김) */
export function monthChipLabel(months: DongDetail['months']): string | null {
  return months.quiet.length === 0
    ? null
    : `${DETAIL_CHIP_TITLE.month} · ${months.quiet.join('·')}월`
}

/** `저녁 활기 A / 62점` — 순위·월 문구 없음 (스펙 §2) */
export function gradeChipLabel(key: GradeKey, g: GradeValue): string {
  return `${GRADE_LABEL[key]} ${g.grade} / ${g.score}점`
}

function signed(n: number): string {
  if (n === 0) return '±0'
  return n > 0 ? `+${n}` : `−${Math.abs(n)}`
}

/** 점수 차 = 상대 − 이 동. null 지표는 뺀다 */
export function diffLabel(diff: SimilarDong['diff']): string {
  return (['quiet', 'peer', 'evening'] as const)
    .flatMap((k) => {
      const v = diff[k]
      return v === null ? [] : [`${DIFF_LABEL[k]} ${signed(v)}`]
    })
    .join(' · ')
}
