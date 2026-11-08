import { useState } from 'react'
import { Heart, Columns2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import GradeBadge from '@/components/ui/GradeBadge'
import { GRADE_FG } from '@/components/ui/gradeClass'
import { useRequireLogin } from '@/features/auth/useRequireLogin'
import { formatHour } from '@/features/dong/summary'
import type { DongDetailResponse } from '@/features/dong/types'
import { METRIC_LABEL } from '@/features/metric/constants'
import { MONTHS, monthLabel } from '@/features/metric/month'
import type { MonthParam } from '@/features/metric/month'
import type { Grade } from '@/features/metric/types'
import { useCarryLink } from '@/hooks/useCarryLink'

type Props = {
  detail: DongDetailResponse
  month: MonthParam
  onMonthChange: (m: MonthParam) => void
  quiet: { score: number; grade: Grade; total: number } | null
  /** usePresetMode().presetLabel — '조용한 곳' / '직접 설정 (조용 · 시기 · 숙박)' */
  presetLabel: string
  /** 소속 시군구 요약: tier sigungu 응답 + usePresetMode().mode 로 rankIn */
  sgg: { score: number; rank: number } | null
}

const STAY = ['1주', '2주', '한 달'] as const

export default function DongPlanCard({
  detail,
  month,
  onMonthChange,
  quiet,
  presetLabel,
  sgg,
}: Props) {
  const [stay, setStay] = useState<(typeof STAY)[number]>('2주')
  const requireLogin = useRequireLogin()
  const compareLink = useCarryLink(`/compare?dongs=${detail.id}`)
  const sggLink = useCarryLink(`/regions/${detail.sigungu.id}`)
  const select =
    'border-border-default bg-bg-surface text-body-sm text-text-primary h-10 rounded-lg border px-3'

  return (
    <aside className="border-border-default bg-bg-surface w-sidebar shadow-float sticky top-20 flex shrink-0 flex-col gap-4 self-start rounded-2xl border p-6">
      <div className="flex items-end gap-2">
        {quiet ? (
          <>
            <span className={`text-number-4xl ${GRADE_FG[quiet.grade]}`}>
              {Math.round(quiet.score)}
            </span>
            <span className="text-body-sm text-text-secondary pb-1">점 · {METRIC_LABEL.quiet}</span>
          </>
        ) : (
          <span className="text-number-4xl text-text-tertiary">—</span>
        )}
      </div>
      {quiet && (
        <p className="text-body-sm text-text-secondary flex items-center gap-2">
          행정동 {quiet.total}곳 중 백분위 {Math.round(quiet.score)} ·{' '}
          <GradeBadge grade={quiet.grade} size="sm" />
        </p>
      )}

      <label className="flex flex-col gap-1">
        <span className="text-caption-xs text-text-tertiary">방문 월</span>
        <select
          className={select}
          value={month}
          onChange={(e) => onMonthChange(e.target.value as MonthParam)}
        >
          {MONTHS.map((m) => (
            <option key={m} value={m}>
              {monthLabel(m)}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-caption-xs text-text-tertiary">체류 기간</span>
        <select
          className={select}
          value={stay}
          onChange={(e) => setStay(e.target.value as (typeof STAY)[number])}
        >
          {STAY.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <Link
        to={sggLink}
        className="bg-bg-subtle hover:bg-bg-surface-strong flex flex-col gap-1 rounded-xl p-3"
      >
        <span className="text-caption-xs text-text-tertiary">소속 시군구</span>
        <span className="text-body-sm text-text-primary font-medium">
          {detail.sigungu.name}
          {sgg && ` · 종합 ${Math.round(sgg.score)} · ${presetLabel} ${sgg.rank}위`}
        </span>
      </Link>

      <button
        type="button"
        onClick={() => requireLogin(() => {})}
        className="bg-brand-primary text-body-sm text-text-inverse hover:bg-brand-hover inline-flex h-11 items-center justify-center gap-2 rounded-lg font-medium"
      >
        <Heart size={16} aria-hidden /> 이 동네 즐겨찾기
      </button>
      <Link
        to={compareLink}
        className="border-border-default text-body-sm text-text-primary hover:border-border-strong inline-flex h-11 items-center justify-center gap-2 rounded-lg border font-medium"
      >
        <Columns2 size={16} aria-hidden /> 다른 동네와 비교
      </Link>

      <dl className="border-border-default text-body-sm flex flex-col gap-2 border-t pt-4">
        <div className="flex justify-between">
          <dt className="text-text-secondary">주중 피크</dt>
          <dd className="text-text-primary">{formatHour(detail.peaks.weekday.peakHour)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-secondary">가장 한산</dt>
          <dd className="text-text-primary">{formatHour(detail.peaks.weekday.lowHour)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-secondary">생활권 지수</dt>
          <dd className="text-text-primary">{detail.stats.localLife}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-secondary">소속 지역</dt>
          <dd>
            <Link to={sggLink} className="text-text-primary underline">
              상세 보기 →
            </Link>
          </dd>
        </div>
      </dl>
    </aside>
  )
}
