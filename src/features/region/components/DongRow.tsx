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

/** 행정동 한 줄. W-03·W-08 재사용 */
export default function DongRow({ name, kind, subtitle, gradeLabel, grade, href, leading }: Props) {
  return (
    <li className="border-border-default flex items-center gap-3 border-b py-3 last:border-b-0">
      {leading}
      <Link to={href} className="flex flex-1 items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-body-base text-text-primary font-medium">{name}</span>
            <Tag>{DONG_KIND_LABEL[kind]}</Tag>
          </div>
          <span className="text-caption-xs text-text-secondary">{subtitle}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-caption-xs text-text-tertiary">{gradeLabel}</span>
          {grade ? (
            <GradeBadge grade={grade} size="sm" />
          ) : (
            <span className="text-caption-xs text-text-tertiary">—</span>
          )}
          <ChevronRight size={16} className="text-text-tertiary" />
        </div>
      </Link>
    </li>
  )
}
