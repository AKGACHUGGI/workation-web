import {
  BOOST_CAP,
  HALF_LIFE_DAYS,
  MIX,
  PLACE_SAT,
  SIGUNGU_SHARE,
  VIEW_SIGNAL,
} from '@/features/interest/constants'
import type { BoostFn, BoostUnit, InterestEvent, InterestProfile } from '@/features/interest/types'
import { PRESET_WEIGHTS } from '@/features/metric/constants'
import { composite } from '@/features/metric/score'
import { METRIC_KEYS } from '@/features/metric/types'
import type { MetricScores, Weights } from '@/features/metric/types'
import { TERRAINS } from '@/features/popular/types'
import type { Terrain } from '@/features/popular/types'

const DAY = 86_400_000

/** 기록이 없을 때와 같은 결과를 주는 가산점 함수 (항상 0) */
export const NO_BOOST: BoostFn = () => 0

/** 기록의 무게. 반감기마다 절반으로 준다 */
export const decay = (at: number, now: number) => 0.5 ** ((now - at) / (HALF_LIFE_DAYS * DAY))

/** metric 에 v(지표별 값)를 합이 1 이 되게 나눈 뒤 w 를 곱해 더한다. 합이 0 이면 더하지 않는다 */
function addNormalized(metric: Weights, v: Weights, w: number) {
  const sum = METRIC_KEYS.reduce((a, k) => a + v[k], 0)
  if (sum <= 0) return
  for (const k of METRIC_KEYS) metric[k] += (v[k] / sum) * w
}

/** 지표 점수에서 50 을 넘는 만큼을 관심 쪽으로 본다: a_k = max(0, score_k - 50) / 50 */
function aboveMid(scores: MetricScores): Weights {
  const out = {} as Weights
  for (const k of METRIC_KEYS) out[k] = Math.max(0, scores[k] - 50) / 50
  return out
}

/** 기록 배열과 현재 시각으로 관심 프로필을 만든다 (설계 5-3) */
export function buildProfile(events: InterestEvent[], now: number): InterestProfile {
  const metric = {} as Weights
  for (const k of METRIC_KEYS) metric[k] = 0
  const terrain = {} as Record<Terrain, number>
  for (const t of TERRAINS) terrain[t] = 0
  const place: Record<string, number> = {}
  let strength = 0

  for (const e of events) {
    const w = decay(e.at, now)
    strength += w
    if (e.kind === 'search') {
      const { preset } = e.payload
      if (preset === 'quiet' || preset === 'lively')
        addNormalized(metric, PRESET_WEIGHTS[preset], w)
      for (const t of e.payload.terrain) terrain[t] += w
      continue
    }
    place[e.target] = (place[e.target] ?? 0) + w
    const { sigunguId, snapshot } = e.payload
    if (e.kind === 'dong_view' && sigunguId) {
      place[sigunguId] = (place[sigunguId] ?? 0) + w * SIGUNGU_SHARE
    }
    if (snapshot) {
      addNormalized(metric, aboveMid(snapshot.scores), w * VIEW_SIGNAL)
      for (const t of snapshot.terrain) terrain[t] += w * VIEW_SIGNAL
    }
  }
  return { metric, terrain, place, strength }
}

/**
 * 프로필에 비춘 그 지역의 가산점 (0 ~ BOOST_CAP) (설계 5-4).
 * 지표·지형 일치도는 그 갈래가 전체 세기에서 차지하는 몫을 곱해, 다른 기록이 세기를 키우면
 * 옛 관심이 함께 묽어지게 한다.
 */
export function boostFor(p: InterestProfile, u: BoostUnit): number {
  if (p.strength === 0) return 0
  // 세기 반영도. 기록 1건 0.39, 3건 0.78: 한 번 본 것으로 상한까지 가지 않게
  const s = 1 - Math.exp(-p.strength / 2)
  const metricSum = METRIC_KEYS.reduce((a, k) => a + p.metric[k], 0)
  const metricMatch =
    metricSum > 0 ? (composite(u.scores, p.metric) / 100) * Math.min(1, metricSum / p.strength) : 0
  const terrainMatch = u.terrain?.length
    ? Math.min(1, Math.max(...u.terrain.map((t) => p.terrain[t])) / p.strength)
    : 0
  // 행정동 조회는 기록 때 시군구에 절반, 여기서 다시 절반이 곱해져
  // 같은 시군구의 다른 행정동에는 1/4 이 간다
  const pw = (p.place[u.id] ?? 0) + (u.sigunguId ? (p.place[u.sigunguId] ?? 0) * SIGUNGU_SHARE : 0)
  const placeMatch = 1 - Math.exp(-pw / PLACE_SAT) // 조회 1건(pw 1)에 1 - e^-0.5 ≈ 0.39
  return (
    BOOST_CAP *
    (MIX.metric * s * metricMatch + MIX.terrain * s * terrainMatch + MIX.place * placeMatch)
  )
}
