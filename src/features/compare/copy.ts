import type { DongDetailResponse } from '@/features/dong/types'

export const COMPARE_COPY = {
  title: '동네 비교',
  description:
    '행정동 2~3개의 24시간 곡선과 지표를 나란히 봅니다. 즐겨찾기나 동네 프로필에서 추가할 수 있습니다.',
  comparing: '비교 중',
  add: '+ 행정동 추가',
  max: '최대 3개',
  maxTooltip: '최대 3개까지 비교할 수 있습니다',
  emptyColumn: '비교할 동네를 추가하세요',
  emptyHint: 'W-04 동네 프로필이나 즐겨찾기에서 추가할 수 있습니다',
  columnError: '불러오지 못했습니다',
  retry: '다시 시도',
  droppedToast: '일부 동네는 비교할 수 없어 제외했습니다',
  footer:
    '모바일에서는 제공하지 않는 웹 전용 화면(F-07). 마지막 비교 목록은 이 기기에 저장됩니다. 링크를 공유하면 같은 비교를 볼 수 있습니다.',
} as const

export type ShortMetricCopy = Record<'quiet' | 'vibe' | 'peer' | 'localLife', string>

/** 비교 열의 지표 카드 4종 짧은 부제 (스펙 §3-3) */
export function shortMetricCopy(
  detail: DongDetailResponse,
  rank: { rank: number; total: number } | null,
): ShortMetricCopy {
  const { stats, sigungu } = detail
  const inflow = `낮 유입 ${stats.dayInflow.toFixed(2)}`
  return {
    quiet: rank ? `${sigungu.name} 내 ${rank.rank}위 · ${inflow}` : inflow,
    vibe: `저녁 유동 ÷ 체류 ${stats.eveningVibe.toFixed(2)}`,
    peer: `20~40대 ${stats.peerShare}%`,
    localLife: `거주+근무 ${stats.localLife}%`,
  }
}
