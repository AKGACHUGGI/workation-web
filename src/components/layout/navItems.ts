import { House, Map, Trophy } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

/**
 * Figma Web/NavbarV2 제품 탭 3개 (지역 찾기 → 랭킹 → 동네 고르기).
 * 지자체 리포트(W-06) 노출 여부는 열린 항목이라 넣지 않는다.
 */
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: '지역 찾기', icon: Map, end: true },
  { to: '/tier', label: '랭킹', icon: Trophy },
  { to: '/compare', label: '동네 고르기', icon: House },
]
