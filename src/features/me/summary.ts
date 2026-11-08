import type { MeSummary } from '@/features/me/types'

/** '2025-03-14T…' → '2025.03' */
export function formatJoinedMonth(iso: string): string {
  return `${iso.slice(0, 4)}.${iso.slice(5, 7)}`
}

/** 프로필 헤더 한 줄: '강릉 2회 · 고성 1회 체류 · 팁 7개 · 사진 12장 · 2025.03 가입' */
export function buildActivitySummary(s: MeSummary): string {
  const stays =
    s.stays.length === 0
      ? '아직 체류 기록 없음'
      : `${s.stays.map((x) => `${x.regionName} ${x.count}회`).join(' · ')} 체류`
  return `${stays} · 팁 ${s.tipCount}개 · 사진 ${s.photoCount}장 · ${formatJoinedMonth(s.createdAt)} 가입`
}
