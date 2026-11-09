import { EXPLORE_COPY } from '@/features/explore/copy'

type Props = { part: 'map' | 'panel' }

/** 로딩 (Figma 374:8056): 지도 자리 + 흐린 태그 바 자리 + 안내 문구 / 패널 블록 */
export default function ExploreSkeleton({ part }: Props) {
  const block = 'bg-bg-subtle animate-pulse rounded-xl'
  if (part === 'panel') {
    return (
      <div aria-busy="true" aria-label={EXPLORE_COPY.loading} className="flex flex-col gap-4">
        <div className={`${block} h-7 w-48`} />
        <div className={`${block} h-20`} />
        <div className={`${block} h-64`} />
      </div>
    )
  }
  return (
    <div aria-busy="true" className="bg-bg-subtle relative flex h-full items-center justify-center">
      <div className="bg-bg-surface opacity-dim absolute inset-x-4 top-4 h-11 rounded-full" />
      <p className="text-body-sm text-text-secondary">{EXPLORE_COPY.loading}</p>
    </div>
  )
}
