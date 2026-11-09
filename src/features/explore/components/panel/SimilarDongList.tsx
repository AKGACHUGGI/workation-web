import { ChevronRight } from 'lucide-react'
import { EXPLORE_COPY, sharedTags } from '@/features/explore/copy'
import type { GraphIndex } from '@/features/explore/indexGraph'
import type { ExploreDong } from '@/features/explore/types'

type Props = { index: GraphIndex; dong: ExploreDong; onOpenDong: (dongId: string) => void }

const SIMILAR_LIMIT = 3

/** ② 비슷한 동네 (백엔드 상위 5 중 앞 3개). 클릭 → 그 동이 새 중심인 ② */
export default function SimilarDongList({ index, dong, onOpenDong }: Props) {
  const similar = dong.similar
    .map((id) => index.dongById.get(id))
    .filter((d): d is ExploreDong => Boolean(d) && !d!.excluded)
    .slice(0, SIMILAR_LIMIT)
  if (similar.length === 0) return null
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <h3 className="text-heading-lg text-text-primary" id="explore-similar">
          {EXPLORE_COPY.similarTitle}
        </h3>
        <span className="text-caption-xs text-text-tertiary">{EXPLORE_COPY.similarCaption}</span>
      </div>
      <ul aria-labelledby="explore-similar" className="flex flex-col">
        {similar.map((other) => {
          const labels = sharedTags(dong, other)
            .map((id) => index.tagById.get(id)?.label ?? id)
            .join(' · ')
          return (
            <li key={other.id}>
              <button
                type="button"
                onClick={() => onOpenDong(other.id)}
                className="hover:bg-bg-subtle flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left"
              >
                <span
                  aria-hidden
                  className="border-text-primary size-3 shrink-0 rounded-full border-2"
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-body-sm text-text-primary">
                    <span className="font-bold">{other.name}</span>{' '}
                    <span className="text-caption-xs text-text-tertiary">
                      {index.sigunguById.get(other.sigunguId)?.name}
                    </span>
                  </span>
                  {labels && (
                    <span className="text-caption-xs text-text-secondary">
                      {EXPLORE_COPY.sharedTags(labels)}
                    </span>
                  )}
                </span>
                <ChevronRight className="text-text-tertiary" size={16} aria-hidden />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
