import { useLayoutEffect, useRef, useState } from 'react'
import { Globe } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { NAV_ITEMS } from '@/components/layout/navItems'
import type { NavItem } from '@/components/layout/navItems'
import ThemeToggle from '@/components/layout/ThemeToggle'
import BrandGlyph from '@/components/ui/BrandGlyph'
import AuthMenu from '@/features/auth/components/AuthMenu'
import { carryQuery } from '@/hooks/carryQuery'

/** 탭 1개 내용: 아이콘 28 · 라벨 14 Medium · 2px 밑줄 자리(실제 밑줄은 TabIndicator) */
function TabBody({ item }: { item: NavItem }) {
  const Icon = item.icon
  return (
    <>
      <Icon size={28} strokeWidth={1.5} aria-hidden />
      <span className="text-body-sm font-medium">{item.label}</span>
      <span aria-hidden className="h-0.5 w-full" />
    </>
  )
}

const TAB = 'flex flex-col items-center gap-1.5 px-1 pt-3'

/** 진행 방향 앞 끝은 빨리, 뒤 끝은 늦게 따라와 늘어났다 튕기며 붙는다 */
const LEAD = '260ms cubic-bezier(0.34, 1.56, 0.64, 1)'
const TRAIL = '420ms cubic-bezier(0.34, 1.56, 0.64, 1) 60ms'

/** animate: 첫 배치는 제자리에 바로 그리고 이후 이동만 미끄러진다 */
type Edge = { left: number; right: number; dir: 1 | -1; animate: boolean }

/** 활성 탭 아래로 미끄러지는 2px 잉크 밑줄. 활성 탭이 없으면 숨긴다 */
function TabIndicator({ pathname }: { pathname: string }) {
  const self = useRef<HTMLSpanElement>(null)
  const [edge, setEdge] = useState<Edge | null>(null)

  useLayoutEffect(() => {
    // 부모 ref는 자식 layout effect 뒤에 붙으므로 자기 부모(nav)를 직접 잰다
    const el = self.current?.parentElement
    if (!el) return
    const measure = () => {
      const active = el.querySelector<HTMLElement>('[aria-current="page"]')
      if (!active) return setEdge(null)
      const left = active.offsetLeft
      const right = el.clientWidth - left - active.offsetWidth
      setEdge((prev) => ({
        left,
        right,
        dir: prev && left < prev.left ? -1 : 1,
        animate: prev !== null,
      }))
    }
    measure()
    document.fonts?.ready.then(measure)
    // 웹폰트 로드·창 크기 변화로 탭 폭이 바뀌면 다시 잰다
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [pathname])

  const transition = edge?.animate
    ? edge.dir === 1
      ? `right ${LEAD}, left ${TRAIL}`
      : `left ${LEAD}, right ${TRAIL}`
    : 'none'
  return (
    <span
      ref={self}
      aria-hidden
      hidden={!edge}
      data-slot="tab-indicator"
      className="bg-text-primary pointer-events-none absolute bottom-0 h-0.5 rounded-full motion-reduce:transition-none!"
      style={{ left: edge?.left, right: edge?.right, transition }}
    />
  )
}

/**
 * Figma Web/NavbarV2 (54:258). 높이 80 · 좌우 32 · 하단 헤어라인.
 * 좌: 로고(빨간 바탕 핀·노트북 32 + 워케이션맵) · 중앙: 제품 탭 3개 · 우: 언어 · 해/달 · 계정 필(AuthMenu).
 * 메뉴 이동 시 month·preset 쿼리 유지
 */
export default function Navbar() {
  const { search, pathname } = useLocation()
  const current = new URLSearchParams(search)
  return (
    <header className="border-border-default bg-bg-surface h-navbar min-w-desktop sticky top-0 z-10 border-b">
      <div className="flex h-full items-center justify-between px-8">
        <Link to={carryQuery('/', current)} className="flex w-60 items-center gap-2">
          <span className="bg-brand-primary text-text-on-brand flex size-8 items-center justify-center rounded-lg">
            <BrandGlyph size={20} />
          </span>
          <span className="font-display text-display-logo text-text-brand">워케이션맵</span>
        </Link>
        <nav aria-label="주 메뉴" className="relative flex items-end gap-8">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.label}
              to={carryQuery(item.to, current)}
              end={item.end}
              className={({ isActive }) =>
                `${TAB} ${isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`
              }
            >
              <TabBody item={item} />
            </NavLink>
          ))}
          <TabIndicator pathname={pathname} />
        </nav>
        <div data-slot="auth-menu" className="flex w-60 items-center justify-end gap-2">
          {/* 언어는 아직 기능이 없어 동작을 연결하지 않는다 */}
          <button
            type="button"
            aria-label="언어"
            className="text-text-primary hover:bg-bg-subtle flex size-10 items-center justify-center rounded-full"
          >
            <Globe size={18} aria-hidden />
          </button>
          <ThemeToggle />
          <AuthMenu />
        </div>
      </div>
    </header>
  )
}
