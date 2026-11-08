import type { ActivityKey } from '@/features/dong/types'
import type { Grade } from '@/features/metric/types'
import { DONG_KIND_LABEL } from '@/features/region/copy'
import type { DongKind } from '@/features/region/types'

export type DongSummaryInput = {
  dominant: ActivityKey
  weekdayPeakHour: number
  vibeGrade: Grade
  kind: DongKind
}

/** 히어로 메타·동네 성격 섹션에 같은 문장을 쓴다 (스펙 §6) */
export function buildDongSummary({
  dominant,
  weekdayPeakHour,
  vibeGrade,
  kind,
}: DongSummaryInput): string {
  const h = weekdayPeakHour
  switch (dominant) {
    case 'weekendTourist': {
      const evening =
        vibeGrade === 'S' || vibeGrade === 'A'
          ? '저녁까지 활기가 이어집니다'
          : '저녁엔 일찍 조용해집니다'
      return `주말에 사람이 몰리고 평일 낮 ${h}시가 피크인 ${DONG_KIND_LABEL[kind]} 동네, ${evening}`
    }
    case 'eveningDowntown':
      return `저녁 ${h}시에 가장 붐비는 상권형 동네, 낮엔 상대적으로 조용합니다`
    case 'weekdayWork':
      return `평일 낮 ${h}시에 붐비고 주말엔 한산한 업무형 동네`
    case 'dawnResidential':
      return '아침·밤에 사람이 있고 낮엔 비는 주거형 동네, 일하기엔 가장 조용합니다'
  }
}

export function localLifeLabel(v: number): '생활권' | '혼합' | '방문지' {
  if (v >= 70) return '생활권'
  if (v >= 50) return '혼합'
  return '방문지'
}

/** 생활권 지수는 티어 지표가 아니라 고정 경계 (≥70 A, ≥50 B, 그 외 C) */
export function localLifeGrade(v: number): Grade {
  if (v >= 70) return 'A'
  if (v >= 50) return 'B'
  return 'C'
}

export function pollQuestion(name: string, vibeGrade: Grade): string {
  return vibeGrade === 'S' || vibeGrade === 'A'
    ? `${name} 저녁, 정말 활기찬가요?`
    : `${name} 저녁, 정말 조용한가요?`
}

/** Figma W-04 표기: 두 자리 시각 ('03시', '18시') */
export function formatHour(h: number): string {
  return `${String(h).padStart(2, '0')}시`
}
