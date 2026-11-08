import { Globe, MapPin } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { NAV_ITEMS } from '@/components/layout/navItems'
import type { NavItem } from '@/components/layout/navItems'
import AuthMenu from '@/features/auth/components/AuthMenu'
import { carryQuery } from '@/hooks/carryQuery'

/** 탭 1개 내용: 아이콘 28 · 라벨 14 Medium · 2px 잉크 밑줄(활성) */
function TabBody({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon
  return (
    <>
      <Icon size={28} strokeWidth={1.5} aria-hidden />
      <span className="text-body-sm font-medium">{item.label}</span>
      <span
        aria-hidden
        className={`h-0.5 w-full ${active ? 'bg-text-primary' : 'bg-transparent'}`}
      />
    </>
  )
}

const TAB = 'flex flex-col items-center gap-1.5 px-1 pt-3'

/**
 * Figma Web/NavbarV2 (54:258). 높이 80 · 좌우 32 · 하단 헤어라인.
 * 좌: 로고(빨간 핀 32 + 워케이션맵) · 중앙: 제품 탭 3개 · 우: 팁 남기기 · 언어 · 계정 필(AuthMenu).
 * 메뉴 이동 시 month·preset 쿼리 유지
 */
export default function Navbar() {
  const { search } = useLocation()
  const current = new URLSearchParams(search)
  return (
    <header className="border-border-default bg-bg-surface h-navbar min-w-desktop sticky top-0 z-10 border-b">
      <div className="flex h-full items-center justify-between px-8">
        <Link to={carryQuery('/', current)} className="flex w-60 items-center gap-2">
          <span className="bg-brand-primary text-text-inverse flex size-8 items-center justify-center rounded-lg">
            <MapPin size={18} aria-hidden />
          </span>
          <span className="font-display text-display-logo text-text-brand">워케이션맵</span>
        </Link>
        <nav aria-label="주 메뉴" className="flex items-end gap-8">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.label}
              to={carryQuery(item.to, current)}
              end={item.end}
              className={({ isActive }) =>
                `${TAB} ${isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`
              }
            >
              {({ isActive }) => <TabBody item={item} active={isActive} />}
            </NavLink>
          ))}
        </nav>
        <div data-slot="auth-menu" className="flex w-60 items-center justify-end gap-2">
          {/* 팁 남기기·언어는 아직 기능이 없어 동작을 연결하지 않는다 */}
          <button
            type="button"
            className="text-body-sm text-text-primary hover:bg-bg-subtle rounded-full px-3 py-2.5 font-medium"
          >
            팁 남기기
          </button>
          <button
            type="button"
            aria-label="언어"
            className="text-text-primary hover:bg-bg-subtle flex size-10 items-center justify-center rounded-full"
          >
            <Globe size={18} aria-hidden />
          </button>
          <AuthMenu />
        </div>
      </div>
    </header>
  )
}
