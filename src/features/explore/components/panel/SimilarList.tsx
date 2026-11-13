import { EXPLORE_COPY } from '@/features/explore/copy'
import { diffLabel } from '@/features/explore/labels'
import type { SimilarDong } from '@/features/explore/types'

type Props = { similar: SimilarDong[]; coastal: boolean; onPick: (similar: SimilarDong) => void }

/** ② 비슷한 동 (Figma 436:10590). 백엔드가 고른 순서 그대로, 공통 사실은 드문 것부터 최대 3개 (스펙 §3-3) */
export default function SimilarList({ similar, coastal, onPick }: Props) {
  if (similar.length === 0) return null
  const title = coastal ? EXPLORE_COPY.similarCoastTitle : EXPLORE_COPY.similarPlainTitle
  return (
    <section className="flex shrink-0 flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <h3 id="explore-similar" className="text-explore-sm text-text-primary font-bold">
          {title}
        </h3>
        <span className="text-explore-2xs text-text-tertiary">{EXPLORE_COPY.similarHint}</span>
      </div>
      <ul aria-labelledby="explore-similar" className="flex flex-col gap-1.5">
        {similar.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onPick(s)}
              className="hover:bg-bg-subtle flex w-full flex-col items-start gap-px rounded-sm text-left"
            >
              <span className="flex items-center gap-1.5">
                <span className="text-caption-xs text-text-primary font-medium">{`${s.sigungu} ${s.name}`}</span>
                <span className="bg-bg-subtle text-explore-2xs text-text-secondary rounded-full px-1.5 py-px font-bold">
                  {EXPLORE_COPY.cardCommon(s.common)}
                </span>
                <span className="text-explore-2xs text-text-secondary">
                  {s.commonTop.join(' · ')}
                </span>
              </span>
              <span className="text-explore-2xs text-text-tertiary">{diffLabel(s.diff)}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
