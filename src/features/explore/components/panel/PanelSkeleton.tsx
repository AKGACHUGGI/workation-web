import Block from '@/features/explore/components/Skeleton'
import { EXPLORE_COPY } from '@/features/explore/copy'
import { DONG_SECTION_H } from '@/features/explore/components/panel/panelLayout'

const TYPE_BARS = ['w-62.5', 'w-50', 'w-42.5', 'w-35']
const BRIEF_LINES = ['w-full', 'w-75', 'w-55']
// DongFactGraph 칩 자리 (Figma 436:10491 의 y 22·88·154 / 52·124)
const GRADE_TOPS = ['top-5.5', 'top-22', 'top-38.5']
const PICK_TOPS = ['top-13', 'top-31']

/**
 * ② 로딩 (Figma L3 429:10607). 블록 모양은 L3, 자리·높이는 실제 패널과 같게 둔다.
 * L3 의 섹션 높이는 ②-v6 이전 배치라 DONG_SECTION_H 를 쓰고, 칩 자리도 실제 칩 자리에 둔다
 */
export default function PanelSkeleton() {
  return (
    <div data-testid="panel-skeleton" aria-busy="true" className="flex flex-1 flex-col gap-3 pt-4">
      <span className="sr-only">{EXPLORE_COPY.loadingSr}</span>

      <div
        data-section="header"
        className={`flex shrink-0 flex-col justify-center gap-2 ${DONG_SECTION_H.header}`}
      >
        <Block className="h-6 w-30" />
        <Block className="h-3.5 w-50" />
      </div>

      <div data-section="types" className={`flex shrink-0 flex-col gap-3 ${DONG_SECTION_H.types}`}>
        <Block className="h-3.5 w-22.5" />
        {TYPE_BARS.map((w) => (
          <div key={w} className="flex items-center gap-5">
            <Block className="h-3.5 w-17.5" />
            <Block className={`h-2.5 ${w}`} />
            <Block className="ml-auto h-3.5 w-6" />
          </div>
        ))}
      </div>

      <div data-section="graph" className={`relative shrink-0 ${DONG_SECTION_H.graph}`}>
        <Block shape="circle" className="absolute top-28 left-1/2 size-24 -translate-1/2" />
        <Block shape="pill" className="absolute top-0 right-0 h-6 w-21.5" />
        {GRADE_TOPS.map((top) => (
          <Block key={top} shape="card" className={`absolute left-0 h-10 w-27.5 ${top}`} />
        ))}
        {PICK_TOPS.map((top) => (
          <Block key={top} shape="card" className={`absolute right-0 h-10 w-27.5 ${top}`} />
        ))}
      </div>

      <div data-section="detail" className={`shrink-0 ${DONG_SECTION_H.detail}`}>
        <Block shape="slot" className="size-full" />
      </div>

      <div
        data-section="briefing"
        className={`bg-bg-subtle flex shrink-0 flex-col gap-1.5 rounded-xl px-3.5 py-3 ${DONG_SECTION_H.briefing}`}
      >
        <div className="flex h-4.5 items-center">
          <Block className="h-3.5 w-37.5" />
        </div>
        <div>
          {BRIEF_LINES.map((w) => (
            <div key={w} className="flex h-4.5 items-center">
              <Block className={`h-3 ${w}`} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-1.5">
        <div className="flex h-4.5 items-center">
          <Block className="h-3.5 w-30" />
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex h-7.5 items-start gap-5">
            <Block className="h-3.5 w-22.5" />
            <Block className="h-3.5 w-40" />
            <Block className="ml-auto h-3.5 w-22.75" />
          </div>
        ))}
      </div>

      <div className="mt-auto shrink-0 pt-3 pb-4">
        <div className="flex h-3.25 items-center">
          <Block className="h-2.5 w-65" />
        </div>
      </div>
    </div>
  )
}
