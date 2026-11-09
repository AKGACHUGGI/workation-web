import { useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useToast } from '@/components/ui/toast/useToast'
import { EXPLORE_COPY, MAX_TAGS, TAG_ORDER } from '@/features/explore/copy'
import type { GraphIndex } from '@/features/explore/indexGraph'
import type { MatchMode } from '@/features/explore/types'

const KNOWN_TAGS = new Set<string>(TAG_ORDER)

export type ExploreState = {
  tags: string[]
  match: MatchMode
  dong: string | null
  place: string | null
  toggleTag: (tagId: string) => void
  setMatch: (mode: MatchMode) => void
  openDong: (dongId: string) => void
  openPlace: (placeId: string, dongId: string) => void
  closePlace: () => void
  closeDong: () => void
}

/** 스펙 §5 보정 규칙. 고칠 게 없으면 null */
export function sanitizeExploreParams(
  params: URLSearchParams,
  index?: GraphIndex,
): URLSearchParams | null {
  const next = new URLSearchParams(params)
  const rawTags = params.get('tags')
  if (rawTags !== null) {
    const known = [...new Set(rawTags.split(',').filter((id) => KNOWN_TAGS.has(id)))]
    if (known.length === 0 || known.length > MAX_TAGS) next.delete('tags')
    else if (known.join(',') !== rawTags) next.set('tags', known.join(','))
  }
  const match = params.get('match')
  if (match !== null && match !== 'any' && match !== 'all') next.delete('match')

  const dong = params.get('dong')
  const place = params.get('place')
  if (place !== null && dong === null) next.delete('place')
  if (index && dong !== null) {
    const d = index.dongById.get(dong)
    if (!d || d.excluded) {
      next.delete('dong')
      next.delete('place')
    } else if (place !== null) {
      const p = index.placeById.get(place)
      if (!p || p.dongId !== dong) next.delete('place')
    }
  }
  return next.toString() === params.toString() ? null : next
}

/** 태그 토글. 3개가 찬 상태에서 새 태그면 'limit' */
export function toggleTagList(selected: string[], tagId: string): string[] | 'limit' {
  if (selected.includes(tagId)) return selected.filter((id) => id !== tagId)
  if (selected.length >= MAX_TAGS) return 'limit'
  return [...selected, tagId]
}

/** /explore URL 상태 (tags·match·dong·place). index 는 그래프를 받은 뒤 넘긴다 */
export function useExploreState(index: GraphIndex | undefined): ExploreState {
  const [params, setParams] = useSearchParams()
  const toast = useToast()
  const fixed = useMemo(() => sanitizeExploreParams(params, index), [params, index])

  useEffect(() => {
    if (fixed) setParams(fixed, { replace: true })
  }, [fixed, setParams])

  const effective = fixed ?? params
  const tagsRaw = effective.get('tags')
  const tags = useMemo(() => (tagsRaw ? tagsRaw.split(',') : []), [tagsRaw])
  const match: MatchMode = effective.get('match') === 'all' ? 'all' : 'any'
  const dong = effective.get('dong')
  const place = effective.get('place')

  const update = useCallback(
    (edit: (next: URLSearchParams) => void, replace: boolean) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          edit(next)
          return next
        },
        { replace },
      ),
    [setParams],
  )

  const toggleTag = useCallback(
    (tagId: string) => {
      const next = toggleTagList(tags, tagId)
      if (next === 'limit') {
        toast.show(EXPLORE_COPY.tagLimit)
        return
      }
      update((p) => (next.length > 0 ? p.set('tags', next.join(',')) : p.delete('tags')), true)
    },
    [tags, toast, update],
  )

  const setMatch = useCallback(
    (mode: MatchMode) =>
      update((p) => (mode === 'all' ? p.set('match', 'all') : p.delete('match')), true),
    [update],
  )

  const openDong = useCallback(
    (dongId: string) =>
      update((p) => {
        p.set('dong', dongId)
        p.delete('place')
      }, false),
    [update],
  )

  const openPlace = useCallback(
    (placeId: string, dongId: string) =>
      update((p) => {
        p.set('dong', dongId)
        p.set('place', placeId)
      }, false),
    [update],
  )

  const closePlace = useCallback(() => update((p) => p.delete('place'), false), [update])

  const closeDong = useCallback(
    () =>
      update((p) => {
        p.delete('dong')
        p.delete('place')
      }, false),
    [update],
  )

  return {
    tags,
    match,
    dong,
    place,
    toggleTag,
    setMatch,
    openDong,
    openPlace,
    closePlace,
    closeDong,
  }
}
