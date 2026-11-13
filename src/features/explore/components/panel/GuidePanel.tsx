import { EXPLORE_COPY } from '@/features/explore/copy'

/** ⓪ 안내만 (스펙 §3-1). 데이터가 없어 로딩도 없다. Figma ⓪ 의 태그 막대는 쓰지 않는다 (§11) */
export default function GuidePanel() {
  return (
    <div className="flex flex-col gap-4 pt-5">
      <h2 className="text-heading-xl text-text-primary">{EXPLORE_COPY.guideTitle}</h2>
      <p className="bg-bg-subtle text-body-sm text-text-secondary rounded-xl p-4">
        {EXPLORE_COPY.guideBody}
      </p>
    </div>
  )
}
