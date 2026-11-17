import { ChevronRight } from 'lucide-react'
import { EXPLORE_COPY } from '@/features/explore/copy'
import { diffParts } from '@/features/explore/labels'
import type { SimilarDong } from '@/features/explore/types'

type Props = { similar: SimilarDong[]; coastal: boolean; onPick: (similar: SimilarDong) => void }

/**
 * ② 비슷한 동 (Figma 436:10590). 백엔드가 고른 순서 그대로, 공통 사실은 드문 것부터 최대 3개 (스펙 §3-3).
 * 행은 그래프의 눌리는 칩과 같은 상자 + › 로 눌림을 보이고, 이름 > 점수 차 > 공통 사실 순으로 위계를 둔다.
 * 점수 차는 좋고 나쁨이 아니라 방향이라(조용함 −6 이 나쁜 게 아님) 신호색 대신 굵기로만 값을 띄운다
 */
export default function SimilarList({ similar, coastal, onPick }: Props) {
  if (similar.length === 0) return null
  const title = coastal ? EXPLORE_COPY.similarCoastTitle : EXPLORE_COPY.similarPlainTitle
  return (
    <section className="flex shrink-0 flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <h3 id="explore-similar" className="text-explore-sm text-text-primary shrink-0 font-bold">
          {title}
        </h3>
        <span className="text-explore-2xs text-text-tertiary truncate">
          {EXPLORE_COPY.similarHint}
        </span>
      </div>
      <ul aria-labelledby="explore-similar" className="flex flex-col gap-1.5">
        {similar.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onPick(s)}
              className="border-border-default bg-bg-surface hover:border-text-primary relative flex w-full cursor-pointer flex-col items-start gap-1 rounded-lg border py-2 pr-7 pl-2.5 text-left transition-colors"
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="text-caption-xs truncate">
                  <span className="text-text-secondary">{s.sigungu}</span>{' '}
                  <span className="text-text-primary font-bold">{s.name}</span>
                </span>
                <span className="bg-bg-surface-strong text-explore-2xs text-text-primary shrink-0 rounded-full px-1.5 py-px font-bold">
                  {EXPLORE_COPY.cardCommon(s.common)}
                </span>
              </span>
              <span data-diff className="flex flex-wrap items-baseline gap-x-2.5 gap-y-px">
                {diffParts(s.diff).map((d) => (
                  <span key={d.key} className="text-explore-xs flex items-baseline gap-1">
                    <span className="text-text-tertiary">{d.label}</span>
                    <span
                      className={`font-bold tabular-nums ${d.sign === 0 ? 'text-text-tertiary' : 'text-text-primary'}`}
                    >
                      {d.value}
                    </span>
                  </span>
                ))}
              </span>
              {s.commonTop.length > 0 && (
                <span data-common className="flex flex-wrap gap-1">
                  {s.commonTop.map((fact) => (
                    <span
                      key={fact}
                      className="bg-bg-subtle text-explore-2xs text-text-secondary rounded-sm px-1.5 py-px"
                    >
                      {fact}
                    </span>
                  ))}
                </span>
              )}
              <ChevronRight
                aria-hidden
                className="text-text-secondary absolute top-1/2 right-2 size-3.5 -translate-y-1/2"
              />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
