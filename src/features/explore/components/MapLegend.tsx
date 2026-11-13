import { EXPLORE_COPY, GROUP_COLOR, TAG_GROUP, TAG_ICON, TAG_SHORT } from '@/features/explore/copy'

type Props = { stage: 'overview' | 'pins'; tags: string[] }

const swatch = 'h-2.5 w-3.5 shrink-0 rounded-xs'
const item = 'flex items-center gap-1.5'

/** 범례 (Figma ⓪ 387:8674 · ① 388:8747). ① 은 핀 아이콘 뜻과 관광공사 출처 (스펙 §3-2) */
export default function MapLegend({ stage, tags }: Props) {
  return (
    <div className="bg-bg-surface shadow-float flex max-w-md flex-col gap-2 rounded-xl px-3.5 py-3">
      <ul className="text-caption-xs text-text-secondary flex flex-wrap items-center gap-x-3.5 gap-y-1">
        {stage === 'overview' ? (
          <>
            <li className={item}>
              <span
                aria-hidden
                className={`${swatch} bg-brand-soft-border border-brand-primary border`}
              />
              {EXPLORE_COPY.legendHeat}
            </li>
            <li className={item}>
              <span
                aria-hidden
                className={`${swatch} border-text-secondary border border-dashed`}
              />
              {EXPLORE_COPY.legendClickToZoom}
            </li>
          </>
        ) : (
          <>
            <li className={item}>
              <span
                aria-hidden
                className={`${swatch} bg-bg-surface border-border-default border`}
              />
              {EXPLORE_COPY.legendPin}
            </li>
            <li className={item}>
              <span aria-hidden className={`${swatch} bg-bg-inverse`} />
              {EXPLORE_COPY.legendSelected}
            </li>
            <li className={item}>
              <span aria-hidden className={`${swatch} border-explore-map-boundary border`} />
              {EXPLORE_COPY.legendDongBoundary}
            </li>
          </>
        )}
      </ul>
      {stage === 'pins' && tags.length > 0 && (
        <ul className="text-caption-xs text-text-secondary flex flex-wrap items-center gap-x-3.5 gap-y-1">
          {tags.map((t) => {
            const Icon = TAG_ICON[t]
            return (
              <li key={t} className={item}>
                <span
                  aria-hidden
                  className="flex size-4 items-center justify-center rounded-full"
                  style={{ background: GROUP_COLOR[TAG_GROUP[t]] }}
                >
                  <Icon size={10} className="text-text-inverse" />
                </span>
                {TAG_SHORT[t]}
              </li>
            )
          })}
        </ul>
      )}
      {stage === 'pins' && (
        <p className="text-caption-xs text-text-tertiary">{EXPLORE_COPY.legendTagSource}</p>
      )}
    </div>
  )
}
