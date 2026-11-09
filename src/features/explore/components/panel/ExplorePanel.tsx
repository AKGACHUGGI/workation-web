import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { EXPLORE_COPY } from '@/features/explore/copy'

type Props = { collapsed: boolean; onToggleCollapsed: () => void; children: ReactNode }

/** 오른쪽 440px 패널. 접으면 손잡이만 남고 지도가 넓어진다 (URL 에 남기지 않음) */
export default function ExplorePanel({ collapsed, onToggleCollapsed, children }: Props) {
  return (
    <div className="relative flex shrink-0">
      <button
        type="button"
        onClick={onToggleCollapsed}
        aria-label={collapsed ? EXPLORE_COPY.expandPanel : EXPLORE_COPY.collapsePanel}
        aria-expanded={!collapsed}
        className="bg-bg-surface border-border-default shadow-float absolute top-4 -left-8 z-10 inline-flex h-12 w-8 items-center justify-center rounded-l-lg border border-r-0"
      >
        {collapsed ? <ChevronLeft size={16} aria-hidden /> : <ChevronRight size={16} aria-hidden />}
      </button>
      {!collapsed && (
        <aside
          aria-label={EXPLORE_COPY.pageTitle}
          className="w-explore-panel border-border-default bg-bg-surface flex h-full flex-col overflow-y-auto border-l px-6 pt-6"
        >
          {children}
        </aside>
      )}
    </div>
  )
}
