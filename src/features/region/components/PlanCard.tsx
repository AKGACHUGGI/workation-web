import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PRESET_LABEL } from '@/features/metric/constants'
import { MONTHS, monthLabel } from '@/features/metric/month'
import type { MonthParam } from '@/features/metric/month'
import type { PresetKey } from '@/features/metric/types'

const STAY_OPTIONS = ['1주', '2주', '한 달'] as const

type Props = {
  score: number
  /** '12곳 중 3위 · S' */
  headline: string
  month: MonthParam
  onMonthChange: (m: MonthParam) => void
  preset: PresetKey
  onPresetChange: (p: PresetKey) => void
  /** '직접 설정은 티어리스트에서' 링크 */
  customLinkHref: string
  onFavorite: () => void
  onShare: () => void
  summary: { label: string; value: string }[]
}

const select =
  'border-border-default text-body-sm text-text-primary w-full rounded-lg border px-3 py-2'

/** 사이드바 sticky 카드 */
export default function PlanCard({
  score,
  headline,
  month,
  onMonthChange,
  preset,
  onPresetChange,
  customLinkHref,
  onFavorite,
  onShare,
  summary,
}: Props) {
  const [stay, setStay] = useState<(typeof STAY_OPTIONS)[number]>('2주')
  return (
    <aside className="border-border-default bg-bg-surface shadow-float w-sidebar sticky top-24 flex flex-col gap-4 rounded-2xl border p-6">
      <div>
        <span className="text-number-4xl text-text-primary">{Math.round(score)}</span>
        <span className="text-body-sm text-text-secondary ml-1">점 · 종합</span>
        <p className="text-body-sm text-text-primary mt-1">{headline}</p>
      </div>
      <label className="text-caption-xs text-text-tertiary flex flex-col gap-1">
        방문 월
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
      <label className="text-caption-xs text-text-tertiary flex flex-col gap-1">
        체류 기간
        <select
          className={select}
          value={stay}
          onChange={(e) => setStay(e.target.value as (typeof STAY_OPTIONS)[number])}
        >
          {STAY_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="text-caption-xs text-text-tertiary flex flex-col gap-1">
        프리셋
        <select
          className={select}
          value={preset}
          onChange={(e) => onPresetChange(e.target.value as PresetKey)}
        >
          {(['quiet', 'lively', 'custom'] as const).map((p) => (
            <option key={p} value={p}>
              {PRESET_LABEL[p]}
            </option>
          ))}
        </select>
        {preset === 'custom' && (
          <Link to={customLinkHref} className="text-caption-xs text-text-secondary underline">
            직접 설정은 티어리스트에서
          </Link>
        )}
      </label>
      <button
        type="button"
        onClick={onFavorite}
        className="bg-brand-primary text-body-sm text-text-inverse hover:bg-brand-hover rounded-lg px-4 py-3 font-medium"
      >
        이 지역 즐겨찾기
      </button>
      <button
        type="button"
        onClick={onShare}
        className="border-border-default text-body-sm text-text-primary hover:border-border-strong rounded-lg border px-4 py-3"
      >
        공유하기
      </button>
      <dl className="border-border-default text-body-sm flex flex-col gap-2 border-t pt-4">
        {summary.map((s) => (
          <div key={s.label} className="flex items-center justify-between">
            <dt className="text-text-tertiary">{s.label}</dt>
            <dd className="text-text-primary font-medium">{s.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  )
}
