import { isMock } from '@/lib/mock'

/**
 * W-01 인기 지역 조회수용. POST /api/regions/{id}/view (W-01 스펙 §5-1 계약).
 * api<T>() 를 쓰지 않는 유일한 예외: 페이지 이탈과 무관하게 보내야 하고 응답을 쓰지 않는다. 실패는 무시.
 */
export function recordRegionView(id: string): void {
  if (isMock || typeof navigator === 'undefined' || typeof navigator.sendBeacon !== 'function')
    return
  try {
    navigator.sendBeacon(`${import.meta.env.VITE_API_BASE_URL}/api/regions/${id}/view`)
  } catch {
    // 무시
  }
}
