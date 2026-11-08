import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
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
  /** 즐겨찾기에 있음 → 라벨 '즐겨찾기에 있음' + aria-pressed */
  favorite?: boolean
}

/** Selector 칸: 위 12/16 Medium 라벨 + 아래 14/20 값. select 는 칸 전체를 덮는 투명 네이티브 요소 */
const cell = 'flex flex-col gap-0.5 px-3 py-2.5'
const cellLabel = 'text-caption-segment text-text-primary'
const cellSelect =
  'text-body-sm text-text-secondary w-full cursor-pointer appearance-none bg-transparent outline-none'

/** 사이드바 sticky 계획 카드 (Figma PlanCard 54:208) */
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
  favorite = false,
}: Props) {
  const [stay, setStay] = useState<(typeof STAY_OPTIONS)[number]>('2주')
  return (
    <aside className="border-border-default bg-bg-surface shadow-float w-sidebar sticky top-24 mt-6 flex shrink-0 flex-col gap-4 self-start rounded-xl border p-6">
      <div className="flex items-end justify-between">
        <div className="flex items-end gap-1">
          <span className="text-heading-2xl text-text-primary">{Math.round(score)}</span>
          <span className="text-body-sm text-text-secondary">점 · 종합</span>
        </div>
        <p className="text-body-sm text-text-primary font-medium">{headline}</p>
      </div>

      <div className="border-border-strong divide-border-strong flex flex-col divide-y overflow-hidden rounded-lg border">
        <div className="divide-border-strong grid grid-cols-2 divide-x">
          <label className={cell}>
            <span className={cellLabel}>방문 월</span>
            <select
              className={cellSelect}
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
          <label className={cell}>
            <span className={cellLabel}>체류 기간</span>
            <select
              className={cellSelect}
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
        </div>
        <label className={`${cell} relative`}>
          <span className={cellLabel}>프리셋</span>
          <select
            className={`${cellSelect} pr-6`}
            value={preset}
            onChange={(e) => onPresetChange(e.target.value as PresetKey)}
          >
            {(['quiet', 'lively', 'custom'] as const).map((p) => (
              <option key={p} value={p}>
                {PRESET_LABEL[p]}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            aria-hidden
            className="text-text-primary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
          />
        </label>
      </div>
      {preset === 'custom' && (
        <Link to={customLinkHref} className="text-caption-xs text-text-secondary -mt-2 underline">
          직접 설정은 티어리스트에서
        </Link>
      )}

      <button
        type="button"
        onClick={onFavorite}
        aria-pressed={favorite}
        className="bg-brand-primary text-body-base text-text-inverse hover:bg-brand-hover h-12 rounded-lg px-6 font-medium"
      >
        {favorite ? '즐겨찾기에 있음' : '이 지역 즐겨찾기'}
      </button>
      <button
        type="button"
        onClick={onShare}
        className="border-text-primary bg-bg-surface text-body-base text-text-primary hover:bg-bg-subtle h-12 rounded-lg border px-6 font-medium"
      >
        공유하기
      </button>
      <p className="text-caption-xs text-text-tertiary text-center">
        즐겨찾기는 로그인 시 기기 간 동기화돼요
      </p>

      <dl className="border-border-default text-body-sm flex flex-col gap-2.5 border-t pt-4">
        {summary.map((s) => (
          <div key={s.label} className="flex items-start justify-between gap-4">
            <dt className="text-text-secondary">{s.label}</dt>
            <dd className="text-text-primary text-right font-medium">{s.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  )
}
