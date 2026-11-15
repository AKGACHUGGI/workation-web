import { useMemo, useRef, useSyncExternalStore } from 'react'
import { boostFor, buildProfile, NO_BOOST } from '@/features/interest/profile'
import { getEvents, getVersion, subscribe } from '@/features/interest/store'
import type { BoostFn } from '@/features/interest/types'

/**
 * 지금 저장된 기록으로 만든 가산점 함수. 기록이 없으면 NO_BOOST.
 * _version 은 계산에 쓰지 않고, 어느 저장소 버전의 결과인지 useMemo 의존성으로만 쓴다.
 */
function boostAtVersion(_version: number): BoostFn {
  const profile = buildProfile(getEvents(), Date.now())
  if (profile.strength === 0) return NO_BOOST
  return (u) => boostFor(profile, u)
}

/**
 * 관심 기록으로 만든 가산점 함수. 기록이 없으면 NO_BOOST 를 돌려준다.
 * - live(기본 true): 기록이 바뀔 때마다(같은 탭·다른 탭) 다시 계산한다.
 * - live false: 처음 그릴 때의 기록으로 고정한다. freezeKey 가 바뀌면 그 시점 기록으로 다시 고정한다.
 *   상세 화면이 자기 조회 기록 때문에 보는 도중 점수·순위가 바뀌지 않게 하기 위해서다 (설계 5-4).
 */
export function useBoost(opts?: { live?: boolean; freezeKey?: string }): BoostFn {
  const live = opts?.live ?? true
  const freezeKey = opts?.freezeKey
  const version = useSyncExternalStore(subscribe, getVersion)

  const frozen = useRef<{ key: string | undefined; version: number } | null>(null)
  if (frozen.current === null || frozen.current.key !== freezeKey) {
    frozen.current = { key: freezeKey, version }
  }
  const effective = live ? version : frozen.current.version

  // effective 버전이 바뀔 때만 그 시점 기록으로 다시 만든다
  return useMemo(() => boostAtVersion(effective), [effective])
}
