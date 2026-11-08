import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatHour, localLifeLabel } from '@/features/dong/summary'
import type { DongDetailResponse } from '@/features/dong/types'
import { useFavorites } from '@/features/me/useFavorites'
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

/** Selector 칸 (W-03 PlanCard 와 같은 값): 위 12/16 Medium 라벨 + 아래 14/20 값 */
const cell = 'flex flex-col gap-0.5 px-3 py-2.5'
const cellLabel = 'text-caption-segment text-text-primary'
const cellSelect =
  'text-body-sm text-text-secondary w-full cursor-pointer appearance-none bg-transparent outline-none'

/** 사이드바 sticky 계획 카드 (Figma 251:3837, PlanCard 54:208 의 동네판) */
export default function DongPlanCard({
  detail,
  month,
  onMonthChange,
  quiet,
  presetLabel,
  sgg,
}: Props) {
  const [stay, setStay] = useState<(typeof STAY)[number]>('2주')
  const { isFavorite, toggle } = useFavorites()
  const saved = isFavorite('dongs', detail.id)
  const compareLink = useCarryLink(`/compare?dongs=${detail.id}`)
  const sggLink = useCarryLink(`/regions/${detail.sigungu.id}`)

  return (
    <aside className="border-border-default bg-bg-surface w-sidebar shadow-float sticky top-24 mt-6 flex shrink-0 flex-col gap-4 self-start rounded-xl border p-6">
      <div className="flex items-end justify-between gap-2">
        <div className="flex items-end gap-1">
          <span className="text-heading-2xl text-text-primary">
            {quiet ? Math.round(quiet.score) : '—'}
          </span>
          <span className="text-body-sm text-text-secondary">점 · {METRIC_LABEL.quiet}</span>
        </div>
        {quiet && (
          <p className="text-body-sm text-text-primary font-medium">
            행정동 {quiet.total}곳 중 백분위 {Math.round(quiet.score)} · {quiet.grade}
          </p>
        )}
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
              onChange={(e) => setStay(e.target.value as (typeof STAY)[number])}
            >
              {STAY.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
        <Link to={sggLink} className={`${cell} hover:bg-bg-subtle relative pr-9`}>
          <span className={cellLabel}>소속 시군구</span>
          <span className="text-body-sm text-text-secondary">
            {detail.sigungu.name}
            {sgg && ` · 종합 ${Math.round(sgg.score)} · ${presetLabel} ${sgg.rank}위`}
          </span>
          <ChevronDown
            size={16}
            aria-hidden
            className="text-text-primary absolute top-1/2 right-3 -translate-y-1/2"
          />
        </Link>
      </div>

      <button
        type="button"
        onClick={() => toggle('dongs', detail.id)}
        aria-pressed={saved}
        className="bg-brand-primary text-body-base text-text-inverse hover:bg-brand-hover h-12 rounded-lg px-6 font-medium"
      >
        {saved ? '즐겨찾기에 있음' : '이 동네 즐겨찾기'}
      </button>
      <Link
        to={compareLink}
        className="border-text-primary text-body-base text-text-primary hover:bg-bg-subtle inline-flex h-12 items-center justify-center rounded-lg border px-6 font-medium"
      >
        다른 동네와 비교
      </Link>
      <p className="text-caption-xs text-text-tertiary text-center">
        즐겨찾기는 로그인 시 기기 간 동기화돼요
      </p>

      <dl className="border-border-default text-body-sm flex flex-col gap-2.5 border-t pt-4">
        <div className="flex justify-between">
          <dt className="text-text-secondary">주중 피크</dt>
          <dd className="text-text-primary font-medium">
            {formatHour(detail.peaks.weekday.peakHour)} · 100
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-secondary">가장 한산</dt>
          <dd className="text-text-primary font-medium">
            {formatHour(detail.peaks.weekday.lowHour)} · {detail.peaks.weekday.lowValue}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-secondary">생활권 지수</dt>
          <dd className="text-text-primary font-medium">
            {detail.stats.localLife} · {localLifeLabel(detail.stats.localLife)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-secondary">소속 지역</dt>
          <dd>
            <Link to={sggLink} className="text-text-primary font-medium hover:underline">
              {detail.sigungu.name} 상세 보기 →
            </Link>
          </dd>
        </div>
      </dl>
    </aside>
  )
}
