import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import GradeBadge from '@/components/ui/GradeBadge'
import Tag from '@/components/ui/Tag'
import { DONG_KIND_LABEL } from '@/features/region/copy'
import type { DongKind } from '@/features/region/types'
import type { Grade } from '@/features/metric/types'

type Props = {
  name: string
  kind: DongKind
  subtitle: string
  /** 우측 등급 라벨 (예: '동네 조용함') */
  gradeLabel: string
  /** null 이면 '—' (티어 집계 제외 동) */
  grade: Grade | null
  href: string
  /** W-08 비교 선택 모드의 체크박스 등 */
  leading?: ReactNode
}

/**
 * 행정동 한 줄 (Figma DongRow 7:256). 이름 16/24 Medium, 아래 줄에 생활권(brand)/관광지(회색) 태그 + 설명.
 * W-03·W-08 재사용
 */
export default function DongRow({ name, kind, subtitle, gradeLabel, grade, href, leading }: Props) {
  const kindTag =
    kind === 'living' ? (
      <Tag tone="brand">{DONG_KIND_LABEL[kind]}</Tag>
    ) : (
      <Tag>{DONG_KIND_LABEL[kind]}</Tag>
    )
  return (
    <li className="border-border-default flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
      {leading}
      <Link to={href} className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-body-base text-text-primary font-medium">{name}</span>
          <div className="flex items-center gap-1.5">
            {kindTag}
            <span className="text-caption-xs text-text-tertiary truncate">{subtitle}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="text-caption-xs text-text-tertiary">{gradeLabel}</span>
          {grade ? (
            <GradeBadge grade={grade} size="sm" />
          ) : (
            <span className="text-caption-xs text-text-tertiary">—</span>
          )}
        </div>
        <ChevronRight size={20} aria-hidden className="text-text-secondary shrink-0" />
      </Link>
    </li>
  )
}
