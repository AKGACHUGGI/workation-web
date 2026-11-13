import { SIGUNGU_NODE, typeNodeId } from '@/features/explore/sigunguGraph'
import { TYPE_NAMES } from '@/features/explore/types'
import type { PinDong, TypeName } from '@/features/explore/types'

/** 동 노드 반지름. 점수 비례 크기는 뜻이 잘 안 읽혀 모두 같게 둔다 (2026-11-13 사용자 결정) */
export const DONG_R = 9
/** 유형 노드 반지름 (v6 사실 노드 52×52 보다 조금 크게, 5글자 "네트워킹형"이 들어간다) */
export const TYPE_R = 30
/** 가운데 시군구 노드 반지름 (유형보다 크게) */
export const SIGUNGU_R = 34
/** 같은 링 이웃 동 중심 사이 최소 거리 = 동 지름 + 이름 여백 */
export const MIN_GAP = 2 * DONG_R + 22

/** 반지름 = 그래프 영역 짧은 변 × 비율 (스펙 §4-6) */
const RING = { type: 0.17, inner: 0.3, outer: 0.42 } as const

export type Size = { w: number; h: number }
export type Point = { x: number; y: number; r: number }

const rad = (deg: number) => (deg * Math.PI) / 180

function ringRadius(size: Size) {
  const s = Math.min(size.w, size.h)
  return { type: s * RING.type, inner: s * RING.inner, outer: s * RING.outer }
}

/** n개 동이 바깥 링 한 줄에 들어가지 않으면 true (동은 전체를 같은 간격 360/n 으로 나눠 앉는다) */
export function twoRings(n: number, size: Size): boolean {
  return n > 0 && ringRadius(size).outer * rad(360 / n) < MIN_GAP
}

/** 전체 i번째 동 자리. 각도 = startDeg + (i + 0.5) × 360/n. 두 줄이면 홀수 번째는 안쪽 링 */
export function dongSlot(i: number, n: number, startDeg: number, size: Size): Point {
  const ring = ringRadius(size)
  const r = twoRings(n, size) && i % 2 === 1 ? ring.inner : ring.outer
  const a = rad(startDeg + ((i + 0.5) * 360) / n)
  return { x: size.w / 2 + r * Math.cos(a), y: size.h / 2 + r * Math.sin(a), r: DONG_R }
}

/** 0..n-1 을 가운데부터 바깥으로 번갈아 (n=4 → [1, 2, 0, 3]) */
export function centerOut(n: number): number[] {
  const mid = (n - 1) / 2
  return [...Array(n).keys()].sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid) || a - b)
}

const byName = (a: PinDong, b: PinDong) => a.name.localeCompare(b.name, 'ko')

/**
 * ① 방사형 배치 (스펙 §4). 가운데 시군구, 안쪽 링 유형, 바깥 링 동.
 * 각도 몫 = 동 수 비례. 유형 없음 무리는 가운데가 아래(90°), 유형은 이어서 시계 방향 몰입 → 네트워킹 → 로컬.
 * 무리 안: 유형은 점수 높은 순으로 가운데부터 번갈아, 유형 없음은 이름 가나다순
 */
export function radialLayout(pins: PinDong[], size: Size): Map<string, Point> {
  const out = new Map<string, Point>()
  const cx = size.w / 2
  const cy = size.h / 2
  out.set(SIGUNGU_NODE, { x: cx, y: cy, r: SIGUNGU_R })
  const n = pins.length
  if (n === 0) return out

  const step = 360 / n
  const none = pins.filter((p) => p.topType === null).sort(byName)
  const groups: { type: TypeName | null; dongs: PinDong[] }[] = [
    { type: null, dongs: none },
    ...TYPE_NAMES.map((t) => ({
      type: t,
      dongs: pins
        .filter((p) => p.topType === t)
        .sort((a, b) => (b.topScore ?? 0) - (a.topScore ?? 0) || byName(a, b)),
    })),
  ].filter((g) => g.dongs.length > 0)

  const start = 90 - (none.length * step) / 2
  const typeR = ringRadius(size).type
  let i = 0
  for (const g of groups) {
    const k = g.dongs.length
    const order = g.type === null ? [...Array(k).keys()] : centerOut(k)
    g.dongs.forEach((p, rank) => out.set(p.id, dongSlot(i + order[rank], n, start, size)))
    if (g.type !== null) {
      const mid = rad(start + (i + k / 2) * step)
      out.set(typeNodeId(g.type), {
        x: cx + typeR * Math.cos(mid),
        y: cy + typeR * Math.sin(mid),
        r: TYPE_R,
      })
    }
    i += k
  }
  return out
}
