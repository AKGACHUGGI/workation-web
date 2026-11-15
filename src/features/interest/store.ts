import { MAX_AGE_DAYS, MAX_EVENTS, STORAGE_KEY } from '@/features/interest/constants'
import type { InterestEvent } from '@/features/interest/types'
import { METRIC_KEYS } from '@/features/metric/types'
import { TERRAINS } from '@/features/popular/types'

/**
 * 관심 기록 저장소 (localStorage). 읽기·쓰기는 모두 try/catch 로 감싸,
 * 저장소가 막힌 브라우저에서도 예외 없이 "기록 없음" 으로 동작한다 (설계 5-5).
 */

const DAY = 86_400_000

type Stored = { anonId: string; events: unknown[] }

/** 저장 실패 시 이 탭 안에서만 쓰는 익명 ID */
let memoryAnonId: string | null = null
let version = 0
const listeners = new Set<() => void>()

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

const isTerrains = (v: unknown) =>
  Array.isArray(v) && v.every((t) => (TERRAINS as readonly unknown[]).includes(t))

const isSnapshot = (v: unknown) =>
  v === null ||
  (isObj(v) &&
    isObj(v.scores) &&
    METRIC_KEYS.every((k) => typeof (v.scores as Record<string, unknown>)[k] === 'number') &&
    isTerrains(v.terrain))

/** 저장소 값이 깨져 있어도 화면 계산이 넘어지지 않게, 계산에 쓰는 칸만 모양을 확인한다 */
function isEvent(v: unknown): v is InterestEvent {
  if (!isObj(v) || typeof v.at !== 'number' || !Number.isFinite(v.at) || !isObj(v.payload)) {
    return false
  }
  const p = v.payload
  if (v.kind === 'search') return v.target === null && isTerrains(p.terrain)
  if (v.kind === 'region_view' || v.kind === 'dong_view') {
    return (
      typeof v.target === 'string' &&
      (p.sigunguId === null || typeof p.sigunguId === 'string') &&
      isSnapshot(p.snapshot)
    )
  }
  return false
}

function read(): Stored | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isObj(parsed)) return null
    return {
      anonId: typeof parsed.anonId === 'string' ? parsed.anonId : '',
      events: Array.isArray(parsed.events) ? parsed.events : [],
    }
  } catch {
    return null
  }
}

function write(data: Stored): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

function notify() {
  version += 1
  for (const cb of listeners) cb()
}

function onStorage(e: StorageEvent) {
  // 다른 탭의 기록 (key null 은 다른 탭의 localStorage.clear())
  if (e.key === STORAGE_KEY || e.key === null) notify()
}

/**
 * 새 v4 UUID (소문자). crypto.randomUUID 는 보안 컨텍스트(HTTPS·localhost)에만 있어,
 * LAN http 주소로 열었을 때는 crypto.getRandomValues 로 같은 형식을 만든다.
 */
export function newAnonId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const b = crypto.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 0x0f) | 0x40 // 버전 4
  b[8] = (b[8] & 0x3f) | 0x80 // variant 10xx
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

/** 브라우저 익명 ID. 없으면 만들어 저장하고, 저장에 실패하면 이 탭의 메모리 값을 쓴다 */
export function getAnonId(): string {
  const stored = read()
  if (stored?.anonId) return stored.anonId
  const id = memoryAnonId ?? newAnonId()
  memoryAnonId = id
  write({ anonId: id, events: stored?.events ?? [] })
  return id
}

/** MAX_AGE_DAYS 안의 기록 (오래된 것부터). 읽기 실패나 깨진 값이면 [] */
export function getEvents(): InterestEvent[] {
  const stored = read()
  if (!stored) return []
  const since = Date.now() - MAX_AGE_DAYS * DAY
  return stored.events.filter(isEvent).filter((e) => e.at >= since)
}

/** 기록 한 건을 덧붙이고 마지막 MAX_EVENTS 건만 남긴다. 저장에 성공하면 true, 실패하면 false */
export function appendEvent(e: InterestEvent): boolean {
  const anonId = getAnonId()
  const events = [...getEvents(), e].slice(-MAX_EVENTS)
  const ok = write({ anonId, events })
  if (ok) notify()
  return ok
}

/** 같은 탭의 appendEvent 와 다른 탭의 storage 이벤트를 모두 알린다 */
export function subscribe(cb: () => void): () => void {
  listeners.add(cb)
  if (listeners.size === 1) window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(cb)
    if (listeners.size === 0) window.removeEventListener('storage', onStorage)
  }
}

/** useSyncExternalStore 스냅숏. 기록이 바뀔 때마다 커진다 */
export function getVersion(): number {
  return version
}
