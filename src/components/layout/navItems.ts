export type NavItem = { to: string; label: string; end?: boolean }

/** 네비 메뉴. 지자체 리포트(W-06)의 노출 여부는 열린 항목이라 1차에는 넣지 않는다. */
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: '탐색', end: true },
  { to: '/tier', label: '티어리스트' },
  { to: '/compare', label: '동네 비교' },
]
