import { Link, NavLink, useLocation } from 'react-router-dom'
import PageContainer from '@/components/layout/PageContainer'
import { NAV_ITEMS } from '@/components/layout/navItems'
import AuthMenu from '@/features/auth/components/AuthMenu'
import { carryQuery } from '@/hooks/carryQuery'

/** Figma Web/NavbarV2. 로고 · 메뉴 · 로그인. 메뉴 이동 시 month·preset 쿼리 유지 */
export default function Navbar() {
  const { search } = useLocation()
  const current = new URLSearchParams(search)
  return (
    <header className="border-border-default bg-bg-surface h-navbar sticky top-0 z-10 border-b">
      <PageContainer className="flex h-full items-center justify-between">
        <Link
          to={carryQuery('/', current)}
          className="font-display text-display-logo text-text-primary"
        >
          워케이션맵
        </Link>
        <nav aria-label="주 메뉴" className="flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={carryQuery(item.to, current)}
              end={item.end}
              className={({ isActive }) =>
                `text-title-md ${isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div data-slot="auth-menu">
          <AuthMenu />
        </div>
      </PageContainer>
    </header>
  )
}
