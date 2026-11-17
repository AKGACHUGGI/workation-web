import type { Bounds, LatLng } from '@/features/explore/types'

/** 지도 시점. zoom 은 소수 줌 (벡터 지도) */
export type MapView = { center: LatLng; zoom: number }
type World = { x: number; y: number }

/** Google 지도 타일 한 장 크기(px). 줌 0 에서 세계 = 256px */
const TILE = 256

/** 위경도 → 웹 메르카토르 세계 좌표 (0~1) */
function toWorld({ lat, lng }: LatLng): World {
  const s = Math.sin((lat * Math.PI) / 180)
  return { x: lng / 360 + 0.5, y: 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI) }
}

function fromWorld({ x, y }: World): LatLng {
  return {
    lat: (360 / Math.PI) * Math.atan(Math.exp((0.5 - y) * 2 * Math.PI)) - 90,
    lng: (x - 0.5) * 360,
  }
}

/**
 * bounds 를 지도 div(size) 안에 padding(px) 을 두고 꽉 차게 보는 시점 (fitBounds 와 같은 계산, 소수 줌).
 * div 가 패딩보다 작으면 null
 */
export function fitView(
  bounds: Bounds,
  padding: number,
  size: { width: number; height: number },
): MapView | null {
  const w = size.width - 2 * padding
  const h = size.height - 2 * padding
  if (w <= 0 || h <= 0) return null
  const nw = toWorld({ lat: bounds.north, lng: bounds.west })
  const se = toWorld({ lat: bounds.south, lng: bounds.east })
  const dx = Math.max(se.x - nw.x, 1e-9)
  const dy = Math.max(se.y - nw.y, 1e-9)
  return {
    center: fromWorld({ x: (nw.x + se.x) / 2, y: (nw.y + se.y) / 2 }),
    zoom: Math.log2(Math.min(w / (dx * TILE), h / (dy * TILE))),
  }
}

/** point 가 view 화면(size) 안에 보이는지 */
export function onScreen(
  view: MapView,
  point: LatLng,
  size: { width: number; height: number },
): boolean {
  const c = toWorld(view.center)
  const p = toWorld(point)
  const scale = TILE * 2 ** view.zoom
  return (
    Math.abs(p.x - c.x) * scale <= size.width / 2 && Math.abs(p.y - c.y) * scale <= size.height / 2
  )
}

/** fly-to 곡률 (van Wijk & Nuij 2003 의 ρ, d3.interpolateZoom 기본값) */
const RHO = Math.SQRT2

/**
 * from → to 를 축소 → 이동 → 확대로 잇는 경로 (van Wijk & Nuij 2003, d3.interpolateZoom 과 같은 식).
 * 두 지점이 함께 보일 만큼 물러났다가 다가간다. 돌려주는 함수는 e = 0~1 (이미 easing 된 값)
 */
export function flyPath(from: MapView, to: MapView, width: number): (e: number) => MapView {
  const a = toWorld(from.center)
  const b = toWorld(to.center)
  // 화면 너비를 세계 좌표 길이로 (작을수록 확대)
  const w0 = width / (TILE * 2 ** from.zoom)
  const w1 = width / (TILE * 2 ** to.zoom)
  const dx = b.x - a.x
  const dy = b.y - a.y
  const d2 = dx * dx + dy * dy
  const at = (u: number, w: number): MapView => ({
    center: fromWorld({ x: a.x + u * dx, y: a.y + u * dy }),
    zoom: Math.log2(width / (TILE * w)),
  })
  if (d2 < 1e-18) {
    const S = Math.log(w1 / w0) / RHO
    return (e) => at(e, w0 * Math.exp(RHO * e * S))
  }
  const d1 = Math.sqrt(d2)
  const rho2 = RHO * RHO
  const b0 = (w1 * w1 - w0 * w0 + rho2 * rho2 * d2) / (2 * w0 * rho2 * d1)
  const b1 = (w1 * w1 - w0 * w0 - rho2 * rho2 * d2) / (2 * w1 * rho2 * d1)
  const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0)
  const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1)
  const S = (r1 - r0) / RHO
  return (e) => {
    const s = e * S
    const u = (w0 / (rho2 * d1)) * (Math.cosh(r0) * Math.tanh(RHO * s + r0) - Math.sinh(r0))
    return at(u, (w0 * Math.cosh(r0)) / Math.cosh(RHO * s + r0))
  }
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

/**
 * from → to 사이 시점 (e = 0~1, 이미 easing 된 값). 줌은 선형, 중심은 한 점을 고정한 채 확대·축소하듯
 * 움직인다 (줌이 같으면 그냥 평행 이동). 그래서 확대할 때 목표가 화면 밖으로 튀지 않는다
 */
export function interpolateView(from: MapView, to: MapView, e: number): MapView {
  const a = toWorld(from.center)
  const b = toWorld(to.center)
  const zoom = from.zoom + (to.zoom - from.zoom) * e
  const end = 2 ** (from.zoom - to.zoom)
  const u = Math.abs(1 - end) < 1e-6 ? e : (1 - 2 ** (from.zoom - zoom)) / (1 - end)
  return { center: fromWorld({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u }), zoom }
}
