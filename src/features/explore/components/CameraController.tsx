import { useEffect, useRef } from 'react'
import { useMap } from '@vis.gl/react-google-maps'
import {
  easeInOutCubic,
  fitView,
  flyPath,
  interpolateView,
  onScreen,
} from '@/features/explore/cameraMath'
import type { MapView } from '@/features/explore/cameraMath'
import { HOP_MS, ZOOM_OUT_EXIT } from '@/features/explore/view'
import type { CameraCommand } from '@/features/explore/view'

type Props = {
  camera: CameraCommand | null
  /** ①·② 에서 사용자가 ① 줌보다 ZOOM_OUT_EXIT 단계 넘게 줄였을 때 (⓪ 으로) */
  onZoomOut?: () => void
}

/** 사용자가 지도를 직접 움직이기 시작하는 입력. 애니메이션을 끊는다 */
const GESTURES = ['pointerdown', 'wheel', 'touchstart', 'keydown'] as const

function reducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

function currentView(map: google.maps.Map): MapView | null {
  const center = map.getCenter()
  const zoom = map.getZoom()
  return center && zoom !== undefined ? { center: center.toJSON(), zoom } : null
}

/**
 * 페이지가 보낸 이동 명령을 지도에 적용한다. center·zoom 을 requestAnimationFrame 으로 보간해
 * moveCamera 한다 (fitBounds·panTo 는 멀면 애니메이션 없이 뛴다). hop 이면 축소 → 이동 → 확대
 * (동 → 동은 늘, 시군구 → 시군구는 목표가 지금 화면 밖일 때만).
 * 첫 명령·움직임 줄이기 설정이면 바로.
 * 지도가 늦게 준비돼도 마지막 명령을 실행한다. 사용자가 끌거나 휠을 굴리면 애니메이션을 멈춘다
 */
export default function CameraController({ camera, onZoomOut }: Props) {
  const map = useMap()
  const frame = useRef<number | null>(null)
  const moved = useRef(false)
  /** 사용자 입력 뒤인지. 프로그램 이동으로 바뀐 줌은 축소 감지에서 뺀다 */
  const gesture = useRef(false)
  /** 이 줌보다 작아지면 ⓪ 으로. ⓪ 이면 null */
  const exitZoom = useRef<number | null>(null)
  const zoomOut = useRef(onZoomOut)
  useEffect(() => {
    zoomOut.current = onZoomOut
  })

  useEffect(() => {
    if (!map) return
    const div = map.getDiv()
    const onGesture = () => {
      gesture.current = true
      if (frame.current !== null) cancelAnimationFrame(frame.current)
      frame.current = null
    }
    for (const type of GESTURES)
      div.addEventListener(type, onGesture, { capture: true, passive: true })
    const zoomListener = map.addListener('zoom_changed', () => {
      if (frame.current !== null || !gesture.current || exitZoom.current === null) return
      const zoom = map.getZoom()
      if (zoom === undefined || zoom >= exitZoom.current) return
      exitZoom.current = null
      zoomOut.current?.()
    })
    return () => {
      for (const type of GESTURES) div.removeEventListener(type, onGesture, { capture: true })
      zoomListener.remove()
    }
  }, [map])

  useEffect(() => {
    if (!map || !camera) return
    const div = map.getDiv()
    const size = { width: div.clientWidth, height: div.clientHeight }
    const target =
      camera.kind === 'bounds'
        ? fitView(camera.bounds, camera.padding, size)
        : { center: camera.center, zoom: camera.zoom }
    const fitted = camera.sigungu && fitView(camera.sigungu.bounds, camera.sigungu.padding, size)
    exitZoom.current = fitted ? fitted.zoom - ZOOM_OUT_EXIT : null
    gesture.current = false

    const from = currentView(map)
    const first = !moved.current
    moved.current = true
    if (!target) {
      // 지도 div 크기를 아직 모름 → SDK 에 맡긴다
      if (camera.kind === 'bounds') map.fitBounds(camera.bounds, camera.padding)
      return
    }
    if (first || !from || camera.duration <= 0 || reducedMotion()) {
      map.moveCamera(target)
      return
    }

    const hop =
      camera.hop === 'always' || (camera.hop === 'far' && !onScreen(from, target.center, size))
    const path = hop
      ? flyPath(from, target, size.width)
      : (e: number) => interpolateView(from, target, e)
    const duration = hop ? HOP_MS : camera.duration
    let start: number | null = null
    const step = (now: number) => {
      start ??= now
      const t = Math.min(1, (now - start) / duration)
      map.moveCamera(path(easeInOutCubic(t)))
      frame.current = t < 1 ? requestAnimationFrame(step) : null
    }
    frame.current = requestAnimationFrame(step)
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current)
      frame.current = null
    }
  }, [map, camera])

  return null
}
