import { GRADE_BG, GRADE_FG } from '@/components/ui/gradeClass'
import type { Grade } from '@/features/metric/types'

type Props = { grade: Grade; size?: 'sm' | 'md'; className?: string }

/** Figma GradeBadge 7:129. sm: px 6 · py 2 · 12/16 Bold, md: px 8 · py 4 · 14/20 Bold, 모서리 radius/sm */
export default function GradeBadge({ grade, size = 'md', className = '' }: Props) {
  const sizeClass =
    size === 'sm' ? 'px-1.5 py-0.5 text-caption-xs font-bold' : 'px-2 py-1 text-body-sm font-bold'
  return (
    <span
      aria-label={`등급 ${grade}`}
      className={`inline-flex items-center justify-center rounded-sm ${sizeClass} ${GRADE_FG[grade]} ${GRADE_BG[grade]} ${className}`}
    >
      {grade}
    </span>
  )
}
