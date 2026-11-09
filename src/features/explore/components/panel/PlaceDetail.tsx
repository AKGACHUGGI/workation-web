import { useState } from 'react'
import { ChevronLeft, Info } from 'lucide-react'
import { Link } from 'react-router-dom'
import Tag from '@/components/ui/Tag'
import { EXPLORE_COPY, GROUP_META, TAG_ICON } from '@/features/explore/copy'
import { placesOf } from '@/features/explore/indexGraph'
import type { GraphIndex } from '@/features/explore/indexGraph'
import type { ExplorePlace } from '@/features/explore/types'

type Props = {
  index: GraphIndex
  place: ExplorePlace
  onBackToDong: () => void
  onOpenPlace: (placeId: string, dongId: string) => void
}

const SIBLINGS = 3

/** ③ 장소 패널 (스펙 §3-4). 소개 문장은 데이터에 없으므로 넣지 않는다 */
export default function PlaceDetail({ index, place, onBackToDong, onOpenPlace }: Props) {
  const [failed, setFailed] = useState(false)
  const dong = index.dongById.get(place.dongId)!
  const sgg = index.sigunguById.get(dong.sigunguId)
  const tag = index.tagById.get(place.tag)!
  const meta = GROUP_META[tag.group]
  const Icon = TAG_ICON[tag.id]
  const siblings = placesOf(index, dong.id, tag.id)
    .filter((p) => p.id !== place.id)
    .slice(0, SIBLINGS)

  return (
    <div className="flex flex-col gap-5 pb-4">
      <button
        type="button"
        onClick={onBackToDong}
        className="text-body-sm text-text-secondary inline-flex items-center gap-1 self-start"
      >
        <ChevronLeft size={16} aria-hidden />
        {EXPLORE_COPY.backToDong(dong.name)}
      </button>

      {place.image && !failed ? (
        <img
          src={place.image}
          alt={place.name}
          onError={() => setFailed(true)}
          className="aspect-video w-full rounded-xl object-cover"
        />
      ) : (
        <span
          role="img"
          aria-label={place.name}
          className="flex aspect-video w-full items-center justify-center rounded-xl"
          style={{ background: meta.bg, color: meta.color }}
        >
          <Icon size={40} aria-hidden />
        </span>
      )}

      <div className="flex flex-col gap-2">
        <h2 className="text-heading-xl text-text-primary flex items-center gap-2">
          {place.name}
          <Tag>{EXPLORE_COPY.placeKind}</Tag>
        </h2>
        <span
          className="text-caption-xs inline-flex items-center gap-1 self-start rounded-full border px-2 py-0.5 font-medium"
          style={{ borderColor: meta.color, background: meta.bg, color: meta.color }}
        >
          <Icon size={12} aria-hidden />
          {tag.label}
        </span>
        <button
          type="button"
          onClick={onBackToDong}
          className="text-body-sm text-text-secondary self-start underline-offset-2 hover:underline"
        >
          {EXPLORE_COPY.belongsTo(dong.name, sgg?.name ?? '')}
        </button>
      </div>

      <p className="bg-bg-subtle text-caption-xs text-text-secondary flex items-center gap-2 rounded-lg px-3 py-2">
        <Info size={14} aria-hidden />
        {EXPLORE_COPY.source}
      </p>

      {siblings.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-heading-lg text-text-primary" id="explore-siblings">
            {EXPLORE_COPY.siblingsTitle}
          </h3>
          <ul aria-labelledby="explore-siblings" className="flex flex-col gap-1">
            {siblings.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onOpenPlace(p.id, dong.id)}
                  className="hover:bg-bg-subtle text-body-sm text-text-primary flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left font-medium"
                >
                  <span
                    aria-hidden
                    className="text-text-inverse inline-flex size-6 items-center justify-center rounded-full"
                    style={{ background: meta.color }}
                  >
                    <Icon size={12} />
                  </span>
                  {p.name}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link
        to={`/dongs/${dong.id}`}
        className="bg-brand-primary hover:bg-brand-hover text-text-inverse text-body-base sticky bottom-0 rounded-lg py-3 text-center font-bold"
      >
        {EXPLORE_COPY.profileCtaOf(dong.name)}
      </Link>
    </div>
  )
}
