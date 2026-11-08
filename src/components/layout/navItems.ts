import { Calendar, House, Map, MessageCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type NavItem = {
  /** 연결 화면이 없으면 undefined → 비활성 탭 */
  to?: string
  label: string
  icon: LucideIcon
  end?: boolean
  /** 아이콘 오른쪽 위 NEW 배지 */
  isNew?: boolean
}

/**
 * Figma Web/NavbarV2 제품 탭 4개 (지역 → 시기 → 동네 + 워케이션 노트).
 * 워케이션 노트는 아직 연결 화면이 없어 비활성. 지자체 리포트(W-06) 노출 여부는 열린 항목이라 넣지 않는다.
 */
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: '지역 찾기', icon: Map, end: true },
  { to: '/tier', label: '시기 보기', icon: Calendar },
  { to: '/compare', label: '동네 고르기', icon: House },
  { label: '워케이션 노트', icon: MessageCircle, isNew: true },
]
