import { ChevronRight } from 'lucide-react'
import GradeBadge from '@/components/ui/GradeBadge'
import { EXPLORE_COPY } from '@/features/explore/copy'
import {
  GRADE_LABEL,
  gradeChipLabel,
  hourChipLabel,
  monthChipLabel,
} from '@/features/explore/labels'
import type { DayGroup, DetailKind, DongDetail } from '@/features/explore/types'
import { DONG_SECTION_H } from '@/features/explore/components/panel/panelLayout'

type Props = {
  dong: DongDetail
  day: DayGroup
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
 * 눌리는 칩(시간대·한산한 달)만 테두리와 › 아이콘을 두고, 등급 칩은 테두리 없는 옅은 바탕 + GradeBadge 로
 * 오른쪽 칩과 크기·모양을 맞추되 눌리지 않는 정보임을 보인다 (눌림 구분 2026-11-13, 바탕 2026-11-17).
 * ② 동 근거 그래프 (Figma 436:10491 배치): 가운데 동 원 + 등급·시간대·한산한 달 칩.
 * 평일·주말 토글은 시간대 막대에만 영향이 있어 상세 칸(DetailSlot)으로 옮겼다. day 는 시간대 칩 글자에만 쓴다.
 * Figma·스펙 §3-3 의 24시간 링은 상세 칸 막대와 같은 정보라 빼고 원만 둔다 (2026-11-13 사용자 결정)
 */
export default function DongFactGraph({ dong, day, detail, onDetail }: Props) {
  const grades = GRADE_SLOTS.flatMap((slot) => {
    const g = dong.grades[slot.key]
    return g ? [{ ...slot, grade: g.grade, label: gradeChipLabel(slot.key, g) }] : []
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
      </div>

      {grades.map((g) => (
        <div
          key={g.key}
          data-chip="grade"
          aria-label={g.label}
          className={`${CHIP} bg-bg-subtle left-0 cursor-default`}
          style={{ top: g.top }}
        >
          <span aria-hidden className="flex items-center gap-1">
            <span className="text-explore-xs text-text-primary font-bold">
              {GRADE_LABEL[g.key]}
            </span>
            <GradeBadge grade={g.grade} size="sm" />
          </span>
          <span aria-hidden className="text-explore-2xs text-text-secondary">
            {splitAt(g.label, ' / ')[1]}
          </span>
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
            className={`${CHIP} right-0 cursor-pointer pr-7 transition-colors ${on ? 'bg-bg-subtle border-text-primary border-2' : 'bg-bg-surface border-border-default hover:border-text-primary border'}`}
            style={{ top: c.top }}
          >
            <ChipText label={c.label} sep=" · " />
            {/* 눌러서 아래 상세 칸을 바꾸는 칩이라는 표시 (등급 칩에는 없음) */}
            <ChevronRight
              data-chevron
              aria-hidden
              className="text-text-secondary absolute top-1/2 right-2 size-3.5 -translate-y-1/2"
            />
          </button>
        )
      })}
    </section>
  )
}
