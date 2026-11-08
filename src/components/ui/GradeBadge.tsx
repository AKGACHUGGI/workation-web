import { GRADE_BG, GRADE_FG } from '@/components/ui/gradeClass'
import type { Grade } from '@/features/metric/types'

type Props = { grade: Grade; size?: 'sm' | 'md'; className?: string }

/** Figma GradeBadge 7:129. S·A·B·C 등급 배지 */
export default function GradeBadge({ grade, size = 'md', className = '' }: Props) {
  const sizeClass = size === 'sm' ? 'h-4 min-w-4 px-1' : 'h-6 min-w-6 px-2'
  return (
    <span
      aria-label={`등급 ${grade}`}
      className={`text-caption-badge inline-flex items-center justify-center rounded-md ${sizeClass} ${GRADE_FG[grade]} ${GRADE_BG[grade]} ${className}`}
    >
      {grade}
    </span>
  )
}
