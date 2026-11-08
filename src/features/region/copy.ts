import type { DongKind, LinkKind, SeasonType } from '@/features/region/types'

export const SEASON_LABEL: Record<SeasonType, string> = {
  summer_beach: '여름 해변형',
  spring_autumn: '봄·가을형',
  second_half_rise: '하반기 상승형',
  flat: '연중 평탄형',
}

export const DONG_KIND_LABEL: Record<DongKind, string> = {
  living: '생활권',
  tourist: '관광지',
}

export const LINK_KIND_LABEL: Record<LinkKind, string> = {
  support: '지원사업',
  stay: '숙박',
  tour: '관광',
}

/** 숙박 계수 구간 문구 */
export function overnightCopy(coef: number): string {
  if (coef >= 0.9) return '방문객 대부분 숙박'
  if (coef >= 0.7) return '숙박·당일 혼합'
  return '당일 방문 위주'
}

/** 백분위 구간 문구 */
export function rankCopy(percentile: number): string {
  if (percentile >= 75) return '상위권'
  if (percentile >= 50) return '중상위'
  if (percentile >= 25) return '중하위'
  return '하위권'
}

export type WeekendType = '주중형' | '균형형' | '주말형'

/** 주말 ÷ 주중 낮 체류 비율 유형 */
export function weekendCopy(ratio: number): WeekendType {
  if (ratio < 0.9) return '주중형'
  if (ratio < 1.15) return '균형형'
  return '주말형'
}

/** §3-5 설명 문장 */
export function weekendSentence(ratio: number): string {
  const p = Math.round((ratio - 1) * 100)
  const type = weekendCopy(ratio)
  if (type === '균형형') {
    const signed = p >= 0 ? `+${p}` : `${p}`
    const verb = p >= 0 ? '늘어나는' : '줄어드는'
    return `주말에 낮 체류인구가 ${signed}% ${verb} 수준으로 주중·주말 차이가 작습니다. 요일과 상관없이 비슷한 밀도를 기대할 수 있습니다.`
  }
  if (type === '주말형') {
    return `주말에 낮 체류인구가 ${p}% 늘어납니다. 조용한 체류가 목적이면 주중 도착·주말 외곽 동네 이동을 권합니다.`
  }
  return `주말에 낮 체류인구가 ${Math.abs(p)}% 줄어듭니다. 주말이 오히려 한산한 지역입니다.`
}
