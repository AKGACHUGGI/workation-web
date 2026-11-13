import { useState } from 'react'
import type { ReactNode } from 'react'
import GoogleMapProvider from '@/components/map/GoogleMapProvider'
import MapPlaceholder from '@/components/map/MapPlaceholder'
import { useGeoQuery } from '@/features/dong/useGeoQuery'
import BackToAllButton from '@/features/explore/components/BackToAllButton'
import ExploreMap from '@/features/explore/components/ExploreMap'
import DongPanel from '@/features/explore/components/panel/DongPanel'
import PinsErrorCard from '@/features/explore/components/PinsErrorCard'
import ExplorePanel from '@/features/explore/components/panel/ExplorePanel'
import GuidePanel from '@/features/explore/components/panel/GuidePanel'
import PanelMessage from '@/features/explore/components/panel/PanelMessage'
import type { GraphPick } from '@/features/explore/components/panel/SigunguGraph'
import SigunguGraphSkeleton from '@/features/explore/components/panel/SigunguGraphSkeleton'
import SigunguPanel from '@/features/explore/components/panel/SigunguPanel'
import { EXPLORE_COPY } from '@/features/explore/copy'
import { RELATIONS } from '@/features/explore/sigunguGraph'
import type { RelationKey } from '@/features/explore/sigunguGraph'
import type { SimilarDong } from '@/features/explore/types'
import { useDelayedLoading } from '@/features/explore/useDelayedLoading'
import { useExploreCamera } from '@/features/explore/useExploreCamera'
import { useExploreState } from '@/features/explore/useExploreState'
import { usePinsQuery } from '@/features/explore/usePinsQuery'
import { useSigunguMeta } from '@/features/explore/useSigunguMeta'

const DEFAULT_RELS: ReadonlySet<RelationKey> = new Set(
  RELATIONS.filter((r) => r.defaultOn).map((r) => r.key),
)

/** W-09 지도 탐색 v6 (/explore). ⓪ 안내 → ① 시군구 지식그래프 → ② 동 패널 */
export default function ExplorePage() {
  const s = useExploreState()
  const pins = usePinsQuery(s.sgg)
  const geo = useGeoQuery(s.sgg ?? undefined)
  const meta = useSigunguMeta(s.sgg)
  // 패널 스켈레톤용 (지도 핀 스켈레톤은 ExploreMap 이 같은 훅으로 따로 늦춘다)
  const pinsLoading = useDelayedLoading(s.sgg !== null && pins.isPending)
  const camera = useExploreCamera(s.sgg, geo.data)

  const [collapsed, setCollapsed] = useState(false)
  /** 지도 핀 ↔ 그래프 동 노드 미리 강조 (URL 에 넣지 않음) */
  const [hoveredDong, setHoveredDong] = useState<string | null>(null)
  const [relsOn, setRelsOn] = useState<ReadonlySet<RelationKey>>(DEFAULT_RELS)
  const [pick, setPick] = useState<GraphPick | null>(null)

  // 시군구가 바뀌면 그래프 선택·미리 강조를 지운다 (렌더 중 상태 맞추기)
  const [stateSgg, setStateSgg] = useState(s.sgg)
  if (stateSgg !== s.sgg) {
    setStateSgg(s.sgg)
    setPick(null)
    setHoveredDong(null)
  }

  const toggleRel = (key: RelationKey) =>
    setRelsOn((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  // ② [← 그래프]: ① 로, 그 동 선택 상태 유지 (스펙 §5)
  const backFromDong = (dongId: string) => {
    setPick({ kind: 'dong', id: dongId })
    s.backToSigungu()
  }
  // 비슷한 동: 그 동의 시군구(행정동 코드 앞 5자리)로 이동 + 패널 교체
  const openSimilar = (similar: SimilarDong) => s.openDong(similar.id, similar.id.slice(0, 5))

  let panel: ReactNode
  if (!s.sgg) {
    panel = <GuidePanel />
  } else if (s.dong) {
    panel = (
      <DongPanel
        dongId={s.dong}
        onBack={backFromDong}
        onClose={s.backToSigungu}
        onOpenSimilar={openSimilar}
      />
    )
  } else if (pins.isError) {
    panel = (
      <PanelMessage
        message={EXPLORE_COPY.pinsError}
        actionLabel={EXPLORE_COPY.retry}
        onAction={() => pins.refetch()}
      />
    )
  } else if (pinsLoading) {
    panel = <SigunguGraphSkeleton ids={geo.data?.features.map((f) => f.properties.id) ?? []} />
  } else if (pins.data && meta) {
    panel = (
      <SigunguPanel
        name={meta.name}
        province={meta.province}
        pins={pins.data.dongs}
        relsOn={relsOn}
        onToggleRel={toggleRel}
        pick={pick}
        onPick={setPick}
        hoveredDong={hoveredDong}
        onHoverDong={setHoveredDong}
        onOpenDong={(id) => s.openDong(id)}
      />
    )
  } else {
    panel = (
      <div aria-busy="true" className="flex-1">
        <span className="sr-only">{EXPLORE_COPY.loadingSr}</span>
      </div>
    )
  }

  return (
    <div className="min-w-desktop h-explore flex">
      <h1 className="sr-only">{EXPLORE_COPY.pageTitle}</h1>
      <section aria-label={EXPLORE_COPY.mapRegion} className="relative min-w-0 flex-1">
        <GoogleMapProvider
          fallback={
            <MapPlaceholder title={EXPLORE_COPY.mapNoKey} className="rounded-none border-0" />
          }
        >
          <ExploreMap
            sgg={s.sgg}
            pins={pins.data?.dongs ?? []}
            pinsLoading={pins.isPending}
            geo={geo.data}
            hoveredDong={hoveredDong}
            selectedDong={s.dong}
            onPickSigungu={s.openSigungu}
            onPickDong={(id) => s.openDong(id)}
            onHoverDong={setHoveredDong}
            camera={camera}
          />
        </GoogleMapProvider>
        {s.sgg && (
          <div className="absolute top-4 left-4">
            <BackToAllButton onClick={s.closeAll} />
          </div>
        )}
        {pins.isError && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="pointer-events-auto">
              <PinsErrorCard onRetry={() => pins.refetch()} />
            </div>
          </div>
        )}
      </section>
      <ExplorePanel collapsed={collapsed} onToggleCollapsed={() => setCollapsed((c) => !c)}>
        {panel}
      </ExplorePanel>
    </div>
  )
}
