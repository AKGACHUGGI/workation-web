/** '3일 전', '2개월 전', '방금' */
export function relativeTime(iso: string, now: Date = new Date()): string {
  const diff = Math.max(0, now.getTime() - new Date(iso).getTime())
  const day = 24 * 60 * 60 * 1000
  if (diff < 60 * 60 * 1000) return '방금'
  if (diff < day) return `${Math.floor(diff / (60 * 60 * 1000))}시간 전`
  if (diff < 30 * day) return `${Math.floor(diff / day)}일 전`
  if (diff < 365 * day) return `${Math.floor(diff / (30 * day))}개월 전`
  return `${Math.floor(diff / (365 * day))}년 전`
}
