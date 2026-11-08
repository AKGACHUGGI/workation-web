export const MAX_COMPARE = 3

/**
 * `dongs=` 쿼리 파싱. 순서 유지 · 중복 제거 · validIds 에 없는 id 는 dropped · 앞 MAX_COMPARE 개.
 * validIds 가 없으면(티어 응답 전) 검증을 건너뛴다.
 */
export function parseDongsParam(
  raw: string | null,
  validIds?: ReadonlySet<string>,
): { ids: string[]; dropped: string[] } {
  if (!raw) return { ids: [], dropped: [] }
  const unique = Array.from(new Set(raw.split(',').filter(Boolean)))
  const dropped: string[] = []
  const kept: string[] = []
  for (const id of unique) {
    if (validIds && !validIds.has(id)) dropped.push(id)
    else kept.push(id)
  }
  return { ids: kept.slice(0, MAX_COMPARE), dropped }
}
