export const COMPARE_STORAGE_KEY = 'workation.compare.dongs'

/** 마지막 비교 목록. 없거나 깨졌으면 [] */
export function readStoredDongs(): string[] {
  try {
    const raw = localStorage.getItem(COMPARE_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

/** 실패(용량·프라이빗 모드)는 조용히 무시 */
export function writeStoredDongs(ids: string[]): void {
  try {
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(ids))
  } catch {
    /* ignore */
  }
}
