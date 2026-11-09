import { useState } from 'react'
import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
import GradeBadge from '@/components/ui/GradeBadge'
import Tag from '@/components/ui/Tag'
import SimilarDongList from '@/features/explore/components/panel/SimilarDongList'
import {
  EXPLORE_COPY,
  GROUP_META,
  TAG_ICON,
  TAG_SHORT,
  gradeLabel,
  gradeParts,
} from '@/features/explore/copy'
import { placesOf } from '@/features/explore/indexGraph'
import type { GraphIndex } from '@/features/explore/indexGraph'
import type { BranchLayout } from '@/features/explore/layout'
import type { ExploreDong } from '@/features/explore/types'

type Props = {
  index: GraphIndex
  dong: ExploreDong
  tagIds: string[]
  layout: BranchLayout
  onToggle: (tagId: string) => void
  onOpenDong: (dongId: string) => void
  onOpenPlace: (placeId: string, dongId: string) => void
  onClose: () => void
}

const PREVIEW = 3

/** ② 동 중심 패널 (스펙 §3-3) */
export default function DongDetail({
  index,
  dong,
  tagIds,
  layout,
  onToggle,
  onOpenDong,
  onOpenPlace,
  onClose,
}: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const sgg = index.sigunguById.get(dong.sigunguId)
  const province = sgg ? index.provinceById.get(sgg.provinceId) : undefined
  const grades = gradeParts(dong.grades)
  const branchTags = index.res.tags.filter((t) => tagIds.includes(t.id) && t.display === 'branch')

  return (
    <div className="flex flex-col gap-6 pb-4">
      <header className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-heading-xl text-text-primary flex items-center gap-2">
            {dong.name}
            <Tag>{EXPLORE_COPY.dongKind}</Tag>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-caption-xs text-text-secondary inline-flex items-center gap-1"
          >
            {EXPLORE_COPY.clearSelection}
            <X size={14} aria-hidden />
          </button>
        </div>
        <p className="text-body-sm text-text-secondary">
          {province?.name} · {sgg?.name}
        </p>
        {grades.length > 0 && (
          <div className="flex flex-col gap-1">
            <p
              aria-label={gradeLabel(dong.grades) ?? undefined}
              className="text-body-sm text-text-primary flex flex-wrap items-center gap-1.5"
            >
              {grades.map((g, i) => (
                <span key={g.metric} aria-hidden className="inline-flex items-center gap-1">
                  {i > 0 && <span className="text-text-tertiary">·</span>}
                  {g.label}
                  <GradeBadge grade={g.grade} size="sm" />
                </span>
              ))}
            </p>
            <p className="text-caption-xs text-text-tertiary">{EXPLORE_COPY.gradeCaption}</p>
          </div>
        )}
      </header>

      <section className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <h3 className="text-heading-lg text-text-primary" id="explore-traits">
            {EXPLORE_COPY.traitsTitle}
          </h3>
          <span className="text-caption-xs text-text-tertiary">{EXPLORE_COPY.traitsCaption}</span>
        </div>
        <div role="group" aria-labelledby="explore-traits" className="flex flex-wrap gap-2">
          {dong.tags.map(({ tagId, placeCount }) => {
            const tag = index.tagById.get(tagId)
            if (!tag) return null
            const on = tagIds.includes(tagId)
            const meta = GROUP_META[tag.group]
            const Icon = TAG_ICON[tagId]
            const sub =
              tagId === 'coast' && dong.coastKm !== null
                ? `해안 ${dong.coastKm}km`
                : placeCount !== null
                  ? EXPLORE_COPY.traitPlaces(placeCount)
                  : null
            return (
              <button
                key={tagId}
                type="button"
                aria-pressed={on}
                onClick={() => onToggle(tagId)}
                style={
                  on
                    ? { borderColor: meta.color, background: meta.bg, color: meta.color }
                    : undefined
                }
                className="text-body-sm border-border-default text-text-primary inline-flex h-8 items-center gap-1 rounded-full border px-3 font-medium"
              >
                <Icon size={14} aria-hidden color={on ? 'currentColor' : meta.color} />
                {tag.label}
                {sub && <span className="text-caption-xs opacity-dim">{sub}</span>}
              </button>
            )
          })}
        </div>
      </section>

      {branchTags.map((tag) => {
        const places = placesOf(index, dong.id, tag.id)
        const meta = GROUP_META[tag.group]
        const Icon = TAG_ICON[tag.id]
        const titleId = `explore-places-title-${tag.id}`
        // 지도(허브 없음)와 같은 판정: layoutBranches 의 missing
        if (layout.missing.includes(tag.id)) {
          return (
            <p key={tag.id} className="text-body-sm text-text-tertiary">
              {EXPLORE_COPY.noPlaces(TAG_SHORT[tag.id] ?? tag.label)}
            </p>
          )
        }
        const open = expanded === tag.id
        return (
          <section
            key={tag.id}
            id={`explore-places-${tag.id}`}
            aria-labelledby={titleId}
            className="border-border-default flex flex-col gap-2 border-t pt-4"
          >
            <div className="flex items-baseline justify-between">
              <h3 id={titleId} className="text-heading-lg" style={{ color: meta.color }}>
                {EXPLORE_COPY.placeSection(tag.label, places.length)}
              </h3>
              {places.length > PREVIEW && (
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : tag.id)}
                  className="text-caption-xs text-text-secondary"
                >
                  {open ? EXPLORE_COPY.seeLess : EXPLORE_COPY.seeAll}
                </button>
              )}
            </div>
            <ul className="flex flex-col gap-1">
              {(open ? places : places.slice(0, PREVIEW)).map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    data-place={p.id}
                    onClick={() => onOpenPlace(p.id, dong.id)}
                    className="hover:bg-bg-subtle flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left"
                  >
                    <span
                      aria-hidden
                      className="text-text-inverse inline-flex size-6 shrink-0 items-center justify-center rounded-full"
                      style={{ background: meta.color }}
                    >
                      <Icon size={12} />
                    </span>
                    <span className="text-body-sm text-text-primary flex-1 font-medium">
                      {p.name}
                    </span>
                    <span className="text-caption-xs text-text-tertiary">{TAG_SHORT[tag.id]}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      <SimilarDongList index={index} dong={dong} onOpenDong={onOpenDong} />

      <p className="text-caption-xs text-text-tertiary">{EXPLORE_COPY.dataLimit}</p>

      <Link
        to={`/dongs/${dong.id}`}
        className="bg-brand-primary hover:bg-brand-hover text-text-inverse text-body-base sticky bottom-0 rounded-lg py-3 text-center font-bold"
      >
        {EXPLORE_COPY.profileCta}
      </Link>
    </div>
  )
}
