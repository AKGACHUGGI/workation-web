import { Compass, FileText, House, Map, Trophy } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

/**
 * Figma Web/NavbarV2 제품 탭 3개 (지역 찾기 → 랭킹 → 동네 고르기) + 지도 탐색(W-09) + 리포트(W-06).
 * 리포트는 /reports 로 들어가 첫 시군구로 넘어간다 (router.tsx). 어느 시군구를 보든 탭이 활성.
 */
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: '지역 찾기', icon: Map, end: true },
  { to: '/tier', label: '랭킹', icon: Trophy },
  { to: '/compare', label: '동네 고르기', icon: House },
  { to: '/explore', label: '지도 탐색', icon: Compass },
  { to: '/reports', label: '리포트', icon: FileText },
]
