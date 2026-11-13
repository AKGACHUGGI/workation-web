import { EXPLORE_COPY } from '@/features/explore/copy'
import { gradeChipLabel, hourChipLabel, monthChipLabel } from '@/features/explore/labels'
import type { DayGroup, DetailKind, DongDetail } from '@/features/explore/types'
import { DONG_SECTION_H } from '@/features/explore/components/panel/panelLayout'

type Props = {
  dong: DongDetail
  day: DayGroup
  onDay: (day: DayGroup) => void
  detail: DetailKind
  onDetail: (kind: DetailKind) => void
}

// Figma 436:10491 (400×212) 좌표. 가운데 원은 링 자리(132) 안쪽에 둔다
const W = 400
const H = 212
const CENTER = { x: 200, y: 112 }
const CHIP_W = 110
const CHIP_H = 40
const GRADE_SLOTS = [
  { key: 'quiet', top: 22 },
  { key: 'peer', top: 88 },
  { key: 'evening', top: 154 },
] as const
const HOUR_TOP = 52
const MONTH_TOP = 124
const DAYS: DayGroup[] = ['weekday', 'weekend']

/** '도로 한산 · 평일 9시' → ['도로 한산', '평일 9시'] (칩 두 줄) */
function splitAt(label: string, sep: string): [string, string] {
  const i = label.indexOf(sep)
  return i < 0 ? [label, ''] : [label.slice(0, i), label.slice(i + sep.length)]
}

const CHIP =
  'absolute flex h-10 w-27.5 flex-col items-start justify-center gap-px rounded-lg pl-2.5 text-left'

function ChipText({ label, sep }: { label: string; sep: string }) {
  const [title, sub] = splitAt(label, sep)
  return (
    <>
      <span className="text-explore-xs text-text-primary font-bold">{title}</span>
      <span className="text-explore-2xs text-text-secondary">{sub}</span>
    </>
  )
}

/**
 * ② 동 근거 그래프 (Figma 436:10491 배치): 가운데 동 원 + 등급·시간대·한산한 달 칩 + 평일·주말 토글.
 * Figma·스펙 §3-3 의 24시간 링은 상세 칸 막대와 같은 정보라 빼고 원만 둔다 (2026-11-13 사용자 결정)
 */
export default function DongFactGraph({ dong, day, onDay, detail, onDetail }: Props) {
  const dayLabel = EXPLORE_COPY.dayLabel[day]
  const grades = GRADE_SLOTS.flatMap((slot) => {
    const g = dong.grades[slot.key]
    return g ? [{ ...slot, label: gradeChipLabel(slot.key, g) }] : []
  })
  // 값이 없으면 문구 함수가 null → 그 칩을 숨긴다
  const selectable = [
    { kind: 'hour' as const, top: HOUR_TOP, label: hourChipLabel(dong.hourly, day) },
    { kind: 'month' as const, top: MONTH_TOP, label: monthChipLabel(dong.months) },
  ].flatMap((c) => (c.label === null ? [] : [{ ...c, label: c.label }]))

  return (
    <section
      aria-label={EXPLORE_COPY.factGraphLabel}
      data-section="graph"
      className={`relative w-full shrink-0 ${DONG_SECTION_H.graph}`}
    >
      <svg
        aria-hidden
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 size-full"
      >
        {grades.map((g) => (
          <line
            key={g.key}
            x1={CHIP_W}
            y1={g.top + CHIP_H / 2}
            x2={CENTER.x}
            y2={CENTER.y}
            className="stroke-border-default"
          />
        ))}
        {selectable.map((c) => (
          <line
            key={c.kind}
            x1={W - CHIP_W}
            y1={c.top + CHIP_H / 2}
            x2={CENTER.x}
            y2={CENTER.y}
            className={detail === c.kind ? 'stroke-text-primary' : 'stroke-border-default'}
            strokeWidth={detail === c.kind ? 1.5 : 1}
          />
        ))}
      </svg>

      <div
        data-node="dong"
        className="border-text-primary bg-bg-surface absolute top-28 left-1/2 flex size-24 -translate-1/2 flex-col items-center justify-center rounded-full border-2"
      >
        <span className="text-caption-xs text-text-primary font-bold">{dong.name}</span>
        <span className="text-explore-2xs text-text-secondary">
          {EXPLORE_COPY.factGraphCenterSub(dayLabel)}
        </span>
      </div>

      {grades.map((g) => (
        <div
          key={g.key}
          data-chip="grade"
          aria-label={g.label}
          className={`${CHIP} bg-bg-surface border-border-default left-0 cursor-default border`}
          style={{ top: g.top }}
        >
          <ChipText label={g.label} sep=" / " />
        </div>
      ))}

      {selectable.map((c) => {
        const on = detail === c.kind
        return (
          <button
            key={c.kind}
            type="button"
            aria-pressed={on}
            aria-label={c.label}
            onClick={() => onDetail(c.kind)}
            className={`${CHIP} right-0 ${on ? 'bg-bg-subtle border-text-primary border-2' : 'bg-bg-surface border-border-default border'}`}
            style={{ top: c.top }}
          >
            <ChipText label={c.label} sep=" · " />
          </button>
        )
      })}

      <div
        role="tablist"
        aria-label={EXPLORE_COPY.dayToggleLabel}
        className="bg-bg-subtle absolute top-0 right-0 inline-flex rounded-full p-0.5"
      >
        {DAYS.map((d) => {
          const on = d === day
          return (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onDay(d)}
              className={`text-explore-xs rounded-full px-2.5 py-0.75 ${on ? 'bg-bg-inverse text-text-inverse font-bold' : 'text-text-secondary'}`}
            >
              {EXPLORE_COPY.dayLabel[d]}
            </button>
          )
        })}
      </div>
    </section>
  )
}
