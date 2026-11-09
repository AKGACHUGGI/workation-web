import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import GoogleMapProvider from '@/components/map/GoogleMapProvider'
import MapPlaceholder from '@/components/map/MapPlaceholder'
import ExploreMap from '@/features/explore/components/ExploreMap'
import ExploreSkeleton from '@/features/explore/components/ExploreSkeleton'
import MapLegend from '@/features/explore/components/MapLegend'
import MatchModeToggle from '@/features/explore/components/MatchModeToggle'
import OffscreenChips from '@/features/explore/components/OffscreenChips'
import PathBar from '@/features/explore/components/PathBar'
import TagBar from '@/features/explore/components/TagBar'
import ZoomStage from '@/features/explore/components/ZoomStage'
import DongDetail from '@/features/explore/components/panel/DongDetail'
import ExplorePanel from '@/features/explore/components/panel/ExplorePanel'
import PlaceDetail from '@/features/explore/components/panel/PlaceDetail'
import RangeSummary from '@/features/explore/components/panel/RangeSummary'
import SelectedTagsCard from '@/features/explore/components/panel/SelectedTagsCard'
import { EXPLORE_COPY } from '@/features/explore/copy'
import { indexGraph } from '@/features/explore/indexGraph'
import { layoutBranches } from '@/features/explore/layout'
import { groupByProvince, matchDongs, splitByView } from '@/features/explore/match'
import { summarizeTags } from '@/features/explore/summary'
import type { Bounds } from '@/features/explore/types'
import { useExploreGraphQuery } from '@/features/explore/useExploreGraphQuery'
import { useExploreState } from '@/features/explore/useExploreState'
import {
  DEFAULT_BOUNDS,
  DEFAULT_VIEW,
  DONG_PADDING,
  VIEW_DEBOUNCE_MS,
  ZOOM_STAGES,
  areaBounds,
  bboxToBoundsOf,
  breadcrumbAt,
  debounce,
  zoomStage,
} from '@/features/explore/view'
import type { CameraCommand, MapView, ZoomStageKey } from '@/features/explore/view'

/** W-09 지도 탐색 (/explore) */
export default function ExplorePage() {
  const graph = useExploreGraphQuery()
  const index = useMemo(() => (graph.data ? indexGraph(graph.data) : undefined), [graph.data])
  const s = useExploreState(index)

  const [view, setView] = useState<MapView>(DEFAULT_VIEW)
  const [camera, setCamera] = useState<CameraCommand | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  /** ② 들어가기 직전 ① 의 범위. "태그 지도로 돌아가기 · N곳" 개수를 이 범위로 센다 */
  const [tagBounds, setTagBounds] = useState<Bounds | null>(null)
  const seq = useRef(0)
  const viewRef = useRef(view)
  const tagViewRef = useRef<MapView | null>(null)
  const prevDong = useRef<string | null>(null)

  useEffect(() => {
    viewRef.current = view
  }, [view])

  // 지도가 멈춘 뒤 200ms 후 경로 바·확대 단계·범위 요약 갱신 (스펙 §3)
  const onViewChange = useMemo(() => debounce(setView, VIEW_DEBOUNCE_MS), [])
  useEffect(() => () => onViewChange.cancel(), [onViewChange])

  const fitBounds = useCallback(
    (bounds: Bounds, padding = 0) =>
      setCamera({ seq: ++seq.current, kind: 'bounds', bounds, padding }),
    [],
  )
  const moveCamera = useCallback(
    (v: Pick<MapView, 'center' | 'zoom'>) =>
      setCamera({ seq: ++seq.current, kind: 'view', center: v.center, zoom: v.zoom }),
    [],
  )

  // ② 진입: 동 bbox + 패딩 80. ② 해제: 직전 지도 뷰 복원 (스펙 §3-3, §4)
  useEffect(() => {
    if (!index) return
    const dong = s.dong ? index.dongById.get(s.dong) : undefined
    if (dong && s.dong !== prevDong.current) {
      if (!prevDong.current) {
        tagViewRef.current = viewRef.current
        setTagBounds(viewRef.current.bounds)
      }
      fitBounds(bboxToBoundsOf(dong.bbox), DONG_PADDING)
    } else if (!s.dong && prevDong.current) {
      moveCamera(tagViewRef.current ?? DEFAULT_VIEW)
      tagViewRef.current = null
      setTagBounds(null)
    }
    prevDong.current = s.dong
  }, [index, s.dong, fitBounds, moveCamera])

  const matches = useMemo(() => (index ? matchDongs(index, s.tags, 'any') : []), [index, s.tags])
  const shown = useMemo(
    () => (s.match === 'all' ? matches.filter((m) => m.all) : matches),
    [matches, s.match],
  )
  const countBounds = s.dong ? (tagBounds ?? DEFAULT_BOUNDS) : view.bounds
  const anyInView = useMemo(
    () => (index ? splitByView(index, matches, countBounds).inView : []),
    [index, matches, countBounds],
  )
  const allInView = useMemo(() => anyInView.filter((m) => m.all), [anyInView])
  const { inView, offscreen } = useMemo(
    () => (index ? splitByView(index, shown, countBounds) : { inView: [], offscreen: [] }),
    [index, shown, countBounds],
  )
  const offscreenGroups = useMemo(
    () => (index ? groupByProvince(index, offscreen) : []),
    [index, offscreen],
  )
  const rows = useMemo(() => (index ? summarizeTags(index, view.bounds) : []), [index, view.bounds])
  const selectedTags = useMemo(
    () => (index ? index.res.tags.filter((t) => s.tags.includes(t.id)) : []),
    [index, s.tags],
  )
  const selectedDong = (index && s.dong && index.dongById.get(s.dong)) || null
  const selectedPlace = (index && s.place && index.placeById.get(s.place)) || null
  const layout = useMemo(
    () => (index && selectedDong ? layoutBranches(index, selectedDong, s.tags) : null),
    [index, selectedDong, s.tags],
  )

  const onPickCrumb = useCallback(
    (level: 'province' | 'sigungu' | 'dong', id: string) => {
      if (!index) return
      const dong = level === 'dong' ? index.dongById.get(id) : undefined
      const bounds = dong
        ? bboxToBoundsOf(dong.bbox)
        : level === 'dong'
          ? null
          : areaBounds(index, level, id)
      if (bounds) fitBounds(bounds)
    },
    [index, fitBounds],
  )
  const onPickStage = useCallback(
    (key: ZoomStageKey) => {
      const target = ZOOM_STAGES.find((z) => z.key === key)!
      moveCamera({ center: viewRef.current.center, zoom: target.zoom })
    },
    [moveCamera],
  )
  // 지도 허브 옆 `+N곳 더` → 패널의 그 태그 장소 목록으로
  const onMore = useCallback((tagId: string) => {
    setCollapsed(false)
    requestAnimationFrame(() =>
      document
        .getElementById(`explore-places-${tagId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    )
  }, [])

  const emptyCombo =
    Boolean(index) &&
    !selectedDong &&
    s.tags.length > 0 &&
    inView.length === 0 &&
    offscreenGroups.length === 0
  const legendMode = selectedDong ? 'dong' : s.tags.length > 0 ? 'tags' : 'overview'

  let panel = <ExploreSkeleton part="panel" />
  if (index) {
    if (selectedPlace) {
      panel = (
        <PlaceDetail
          index={index}
          place={selectedPlace}
          onBackToDong={s.closePlace}
          onOpenPlace={s.openPlace}
        />
      )
    } else if (selectedDong && layout) {
      panel = (
        <DongDetail
          index={index}
          dong={selectedDong}
          tagIds={s.tags}
          layout={layout}
          onToggle={s.toggleTag}
          onOpenDong={s.openDong}
          onOpenPlace={s.openPlace}
          onClose={s.closeDong}
        />
      )
    } else if (s.tags.length > 0) {
      panel = (
        <SelectedTagsCard
          index={index}
          tagIds={s.tags}
          anyCount={anyInView.length}
          allMatches={allInView}
          rows={rows}
          onToggle={s.toggleTag}
          onOpenDong={s.openDong}
        />
      )
    } else {
      panel = <RangeSummary rows={rows} selected={s.tags} onToggle={s.toggleTag} />
    }
  }

  return (
    <div className="min-w-desktop h-explore flex flex-col">
      <h1 className="sr-only">{EXPLORE_COPY.pageTitle}</h1>
      <div className="border-border-default flex h-12 shrink-0 items-center justify-between gap-4 border-b px-6">
        {index ? (
          <PathBar crumbs={breadcrumbAt(index, view.center, view.zoom)} onPick={onPickCrumb} />
        ) : (
          <span />
        )}
        <ZoomStage stage={zoomStage(view.zoom)} onPick={onPickStage} />
      </div>
      <div className="flex min-h-0 flex-1">
        <section aria-label={EXPLORE_COPY.mapRegion} className="relative min-w-0 flex-1">
          {graph.isPending ? (
            <ExploreSkeleton part="map" />
          ) : graph.isError || !index ? (
            <div className="bg-bg-subtle flex h-full items-center justify-center">
              <div
                role="alert"
                className="bg-bg-surface shadow-float flex flex-col items-center gap-3 rounded-xl px-8 py-6"
              >
                <p className="text-body-base text-text-primary font-medium">
                  {EXPLORE_COPY.loadError}
                </p>
                <button
                  type="button"
                  onClick={() => graph.refetch()}
                  className="bg-selected-bg text-selected-fg text-body-sm rounded-lg px-4 py-2 font-bold"
                >
                  {EXPLORE_COPY.retry}
                </button>
              </div>
            </div>
          ) : (
            <>
              <GoogleMapProvider
                fallback={
                  <MapPlaceholder title={EXPLORE_COPY.mapNoKey} className="rounded-none border-0" />
                }
              >
                <ExploreMap
                  index={index}
                  view={view}
                  camera={camera}
                  onViewChange={onViewChange}
                  tagIds={s.tags}
                  shownMatches={shown}
                  inView={inView}
                  selectedDong={selectedDong}
                  layout={layout}
                  selectedPlace={selectedPlace}
                  onOpenDong={s.openDong}
                  onOpenPlace={s.openPlace}
                  onFitBounds={fitBounds}
                  onMore={onMore}
                />
              </GoogleMapProvider>

              <div className="pointer-events-none absolute inset-x-4 top-4 flex flex-col items-start gap-2">
                <div className="pointer-events-auto w-full">
                  <TagBar tags={index.res.tags} selected={s.tags} onToggle={s.toggleTag} />
                </div>
                {selectedDong ? (
                  <button
                    type="button"
                    onClick={s.closeDong}
                    className="bg-bg-surface shadow-float text-caption-xs text-text-primary pointer-events-auto inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-bold"
                  >
                    <ChevronLeft size={14} aria-hidden />
                    {EXPLORE_COPY.backToTags(inView.length)}
                  </button>
                ) : s.tags.length > 1 ? (
                  <div className="pointer-events-auto">
                    <MatchModeToggle
                      mode={s.match}
                      anyCount={anyInView.length}
                      allCount={allInView.length}
                      onChange={s.setMatch}
                    />
                  </div>
                ) : null}
              </div>

              {emptyCombo && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="bg-bg-surface shadow-float pointer-events-auto flex items-center gap-3 rounded-xl px-5 py-3">
                    <span className="text-body-sm text-text-primary font-medium">
                      {EXPLORE_COPY.emptyCombo}
                    </span>
                    {s.match === 'all' && (
                      <button
                        type="button"
                        onClick={() => s.setMatch('any')}
                        className="text-body-sm text-text-brand font-bold"
                      >
                        {EXPLORE_COPY.showAny}
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="pointer-events-none absolute bottom-4 left-4 flex flex-col items-start gap-2">
                {!selectedDong && s.tags.length > 0 && (
                  <div className="pointer-events-auto">
                    <OffscreenChips groups={offscreenGroups} onPick={fitBounds} />
                  </div>
                )}
                <div className="pointer-events-auto">
                  <MapLegend mode={legendMode} tags={selectedTags} />
                </div>
              </div>
            </>
          )}
        </section>
        {!graph.isError && (
          <ExplorePanel collapsed={collapsed} onToggleCollapsed={() => setCollapsed((c) => !c)}>
            {panel}
          </ExplorePanel>
        )}
      </div>
    </div>
  )
}
