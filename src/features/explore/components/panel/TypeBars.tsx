import { EXPLORE_COPY } from '@/features/explore/copy'
import type { DongDetail } from '@/features/explore/types'
import { DONG_SECTION_H } from '@/features/explore/components/panel/panelLayout'

type Props = { types: DongDetail['types'] }

/** ② 유형 막대 4개 (Figma 436:10461). 응답 순서 = 점수 높은 순, 첫째가 1위 */
export default function TypeBars({ types }: Props) {
  return (
    <section
      aria-labelledby="explore-types"
      data-section="types"
      className={`flex shrink-0 flex-col gap-1.5 ${DONG_SECTION_H.types}`}
    >
      <h3 id="explore-types" className="text-explore-sm text-text-primary font-bold">
        {EXPLORE_COPY.typesTitle}
      </h3>
      <ul className="flex flex-col gap-1.5">
        {types.map((t, i) => {
          const top = i === 0
          return (
            <li key={t.name} data-top={top || undefined} className="flex flex-col gap-0.5">
              <div className="flex h-4 items-center">
                <span
                  data-name
                  className={`text-caption-xs text-text-primary w-21 shrink-0 ${top ? 'font-bold' : 'font-medium'}`}
                >
                  {t.name}
                </span>
                <span className="bg-chart-bar-muted relative h-2 flex-1 overflow-hidden rounded-sm">
                  <span
                    data-fill
                    className={`absolute inset-y-0 left-0 rounded-sm ${top ? 'bg-brand-primary' : 'bg-chart-bar'}`}
                    style={{ width: `${t.score}%` }}
                  />
                </span>
                <span
                  className={`text-caption-xs w-11 shrink-0 text-right font-bold ${top ? 'text-text-brand' : 'text-text-primary'}`}
                >
                  {t.score}
                </span>
              </div>
              <p className="text-explore-2xs text-text-tertiary">{t.reason}</p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
