import { buildProfile } from '@/features/interest/profile'
import { getEvents } from '@/features/interest/store'
import type { ChatInterest, InterestProfile } from '@/features/interest/types'

const DONG_CODE = /^\d{10}$/
const RECENT_MAX = 3

/** 0 보다 큰 칸만 남긴다 */
function positive<K extends string>(o: Record<K, number>): Partial<Record<K, number>> {
  return Object.fromEntries(Object.entries<number>(o).filter(([, v]) => v > 0)) as Partial<
    Record<K, number>
  >
}

/** 관심 프로필 → 채팅 요청용 관심 기록. 시군구 5자리 코드는 recent 에서 뺀다 */
export function toChatInterest(p: InterestProfile): ChatInterest {
  return {
    metric: positive(p.metric),
    terrain: positive(p.terrain),
    recent: Object.entries(p.place)
      .filter(([code]) => DONG_CODE.test(code))
      .sort((a, b) => b[1] - a[1])
      .slice(0, RECENT_MAX)
      .map(([code]) => code),
  }
}

/** 지금 브라우저 기록으로 만든 채팅 요청용 관심 기록. 기록이 없으면 빈 값 */
export function chatInterest(): ChatInterest {
  return toChatInterest(buildProfile(getEvents(), Date.now()))
}
