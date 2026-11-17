import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import CameraController from '@/features/explore/components/CameraController'
import { fitView } from '@/features/explore/cameraMath'
import type { LatLng } from '@/features/explore/types'
import { DEFAULT_BOUNDS, HOP_MS, SIGUNGU_PADDING, ZOOM_OUT_EXIT } from '@/features/explore/view'
import type { CameraCommand } from '@/features/explore/view'

/** moveCamera 로 바뀐 시점을 기억하고 zoom_changed 를 바로 보내는 가짜 지도 */
function fakeMap() {
  const div = document.createElement('div')
  Object.defineProperty(div, 'clientWidth', { value: 1024 })
  Object.defineProperty(div, 'clientHeight', { value: 768 })
  const zoomListeners = new Set<() => void>()
  const state = { center: { lat: 38, lng: 128.7 } as LatLng, zoom: 8 }
  const map = {
    state,
    getDiv: () => div,
    getCenter: () => ({ toJSON: () => state.center }),
    getZoom: () => state.zoom,
    fitBounds: vi.fn(),
    moveCamera: vi.fn((v: { center?: LatLng; zoom?: number }) => {
      const zoomed = v.zoom !== undefined && v.zoom !== state.zoom
      if (v.center) state.center = v.center
      if (v.zoom !== undefined) state.zoom = v.zoom
      if (zoomed) zoomListeners.forEach((l) => l())
    }),
    addListener: (_: string, l: () => void) => {
      zoomListeners.add(l)
      return { remove: () => zoomListeners.delete(l) }
    },
    /** 사용자가 휠로 줌을 바꾼 것처럼 */
    userZoom(zoom: number) {
      fireEvent.wheel(div)
      state.zoom = zoom
      zoomListeners.forEach((l) => l())
    },
  }
  return map
}

const mapRef = vi.hoisted(() => ({ current: null as unknown }))
vi.mock('@vis.gl/react-google-maps', () => ({ useMap: () => mapRef.current }))

let frames: Map<number, FrameRequestCallback>
let nextFrame = 0
/** 대기 중인 프레임을 now(ms) 시각으로 한 번 돌린다 */
function tick(now: number) {
  const pending = [...frames.values()]
  frames.clear()
  pending.forEach((cb) => cb(now))
}

beforeEach(() => {
  frames = new Map()
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    frames.set(++nextFrame, cb)
    return nextFrame
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
})
afterEach(() => {
  vi.unstubAllGlobals()
})

const sigungu = { bounds: { west: 128.6, south: 37.5, east: 129.1, north: 37.95 }, padding: 40 }
const home: CameraCommand = {
  seq: 1,
  kind: 'bounds',
  bounds: DEFAULT_BOUNDS,
  padding: 0,
  duration: 750,
  hop: null,
  sigungu: null,
}
const toSigungu: CameraCommand = {
  seq: 2,
  kind: 'bounds',
  ...sigungu,
  duration: 750,
  hop: null,
  sigungu,
}
const toDong = (seq: number, center: LatLng, hop = false): CameraCommand => ({
  seq,
  kind: 'view',
  center,
  zoom: 13,
  hop: hop ? 'always' : null,
  duration: 850,
  sigungu,
})
const sigunguZoom = fitView(sigungu.bounds, SIGUNGU_PADDING, { width: 1024, height: 768 })!.zoom

function setup() {
  const map = fakeMap()
  mapRef.current = map
  const onZoomOut = vi.fn()
  const view = render(<CameraController camera={home} onZoomOut={onZoomOut} />)
  const send = (camera: CameraCommand) =>
    view.rerender(<CameraController camera={camera} onZoomOut={onZoomOut} />)
  return { map, onZoomOut, send }
}

describe('CameraController', () => {
  it('첫 명령은 바로, 다음 명령은 프레임마다 보간해 duration 뒤 목표에 닿는다', () => {
    const { map, send } = setup()
    expect(map.moveCamera).toHaveBeenCalledTimes(1)
    expect(frames.size).toBe(0)

    send(toSigungu)
    tick(0)
    tick(375)
    expect(map.state.zoom).toBeGreaterThan(8)
    expect(map.state.zoom).toBeLessThan(sigunguZoom)
    tick(750)
    expect(map.state.zoom).toBeCloseTo(sigunguZoom)
    expect(frames.size).toBe(0)
  })

  it('애니메이션 중 사용자가 누르면 멈춘다', () => {
    const { map, send } = setup()
    send(toSigungu)
    tick(0)
    tick(100)
    fireEvent.pointerDown(map.getDiv())
    expect(frames.size).toBe(0)
    const zoom = map.state.zoom
    tick(750)
    expect(map.state.zoom).toBe(zoom)
  })

  it('움직임 줄이기 설정이면 바로 이동', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    const { map, send } = setup()
    send(toSigungu)
    expect(frames.size).toBe(0)
    expect(map.state.zoom).toBeCloseTo(sigunguZoom)
  })

  it('①: 사용자가 ① 줌보다 ZOOM_OUT_EXIT 넘게 줄이면 onZoomOut 한 번', () => {
    const { map, onZoomOut, send } = setup()
    send(toSigungu)
    ;[0, 750].forEach(tick)
    map.userZoom(sigunguZoom - ZOOM_OUT_EXIT + 0.1)
    expect(onZoomOut).not.toHaveBeenCalled()
    map.userZoom(sigunguZoom - ZOOM_OUT_EXIT - 0.1)
    map.userZoom(sigunguZoom - ZOOM_OUT_EXIT - 0.5)
    expect(onZoomOut).toHaveBeenCalledTimes(1)
  })

  it('⓪ → ① 확대 시작(낮은 줌)·프로그램 이동은 축소로 보지 않는다', () => {
    const { map, onZoomOut, send } = setup()
    fireEvent.wheel(map.getDiv()) // 앞선 사용자 입력이 있어도
    send(toSigungu)
    tick(0)
    tick(50) // 아직 ① 줌보다 훨씬 낮다
    expect(map.state.zoom).toBeLessThan(sigunguZoom - ZOOM_OUT_EXIT)
    ;[375, 750].forEach(tick)
    expect(onZoomOut).not.toHaveBeenCalled()
  })

  it('② 동 → 다른 동 hop 은 중간에 크게 축소해도 ⓪ 으로 가지 않는다', () => {
    const { map, onZoomOut, send } = setup()
    send(toDong(2, { lat: 37.75, lng: 128.9 }))
    ;[0, 850].forEach(tick)
    expect(map.state.zoom).toBeCloseTo(13)

    // 먼 시군구의 동 (약 300km) → 가운데에서 ① 기준보다 낮게 축소된다
    send(toDong(3, { lat: 35.2, lng: 129.1 }, true))
    const zooms: number[] = []
    for (let t = 0; t <= HOP_MS; t += 50) {
      tick(t)
      zooms.push(map.state.zoom)
    }
    expect(Math.min(...zooms)).toBeLessThan(sigunguZoom - ZOOM_OUT_EXIT) // 축소 구간이 있다
    expect(map.state.zoom).toBeCloseTo(13)
    expect(map.state.center.lat).toBeCloseTo(35.2)
    expect(onZoomOut).not.toHaveBeenCalled()
  })

  it('②: 사용자가 줄이면 ① 기준으로 ⓪, ⓪ 에서는 줄여도 아무 일 없음', () => {
    const { map, onZoomOut, send } = setup()
    map.userZoom(5)
    expect(onZoomOut).not.toHaveBeenCalled()
    send(toDong(2, { lat: 37.75, lng: 128.9 }))
    ;[0, 850].forEach(tick)
    map.userZoom(sigunguZoom - ZOOM_OUT_EXIT - 0.1)
    expect(onZoomOut).toHaveBeenCalledTimes(1)
  })

  it('시군구 → 가까운 시군구(far, 화면 안)는 그냥 보간, 먼 시군구는 hop', () => {
    const { map, send } = setup()
    send(toSigungu)
    ;[0, 750].forEach(tick)
    const startZoom = map.state.zoom

    // 바로 옆 시군구: 가운데가 지금 화면 안 → SIGUNGU 시간 안에 줌이 단조
    const near = { west: 128.9, south: 37.3, east: 129.3, north: 37.7 }
    send({ ...toSigungu, seq: 3, bounds: near, hop: 'far', sigungu: { bounds: near, padding: 40 } })
    const nearZooms: number[] = []
    for (let t = 0; t <= 750; t += 50) {
      tick(t)
      nearZooms.push(map.state.zoom)
    }
    expect(frames.size).toBe(0)
    expect(Math.min(...nearZooms)).toBeGreaterThanOrEqual(
      Math.min(startZoom, map.state.zoom) - 1e-6,
    )

    // 먼 시군구 (약 300km): 화면 밖 → HOP_MS 동안 축소했다가 확대
    const far = { west: 128.9, south: 35.0, east: 129.3, north: 35.4 }
    send({ ...toSigungu, seq: 4, bounds: far, hop: 'far', sigungu: { bounds: far, padding: 40 } })
    const before = map.state.zoom
    const farZooms: number[] = []
    for (let t = 0; t <= 750; t += 50) {
      tick(t)
      farZooms.push(map.state.zoom)
    }
    expect(frames.size).toBe(1) // 750ms 에 아직 이동 중
    expect(Math.min(...farZooms)).toBeLessThan(before - 1)
    tick(HOP_MS)
    expect(map.state.center.lat).toBeCloseTo(35.2, 1)
  })
})
