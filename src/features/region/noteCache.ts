import type { InfiniteData, QueryClient } from '@tanstack/react-query'
import type { Note } from '@/features/region/types'

type NoteList = { items: Note[]; total?: number }
type Cached = NoteList | InfiniteData<NoteList> | undefined

/** 노트가 들어 있는 캐시: 지역·동 노트(['region'|'dong', id, 'notes', …]) · 내 팁(['me', 'tips']) */
const isNoteQuery = (key: readonly unknown[]) =>
  key[2] === 'notes' || (key[0] === 'me' && key[1] === 'tips')

function mapItems(data: Cached, fn: (items: Note[]) => Note[]): Cached {
  if (!data) return data
  if ('pages' in data)
    return { ...data, pages: data.pages.map((p) => ({ ...p, items: fn(p.items) })) }
  return { ...data, items: fn(data.items) }
}

/** 같은 노트가 보이는 모든 목록에서 고친다 */
export function patchNote(qc: QueryClient, id: string, patch: (n: Note) => Note) {
  qc.setQueriesData<Cached>({ predicate: (q) => isNoteQuery(q.queryKey) }, (old) =>
    mapItems(old, (items) => items.map((n) => (n.id === id ? patch(n) : n))),
  )
}

/** 모든 목록에서 뺀다 (total 도 1 줄인다) */
export function removeNote(qc: QueryClient, id: string) {
  qc.setQueriesData<Cached>({ predicate: (q) => isNoteQuery(q.queryKey) }, (old) => {
    if (!old || 'pages' in old) return mapItems(old, (items) => items.filter((n) => n.id !== id))
    if (!old.items.some((n) => n.id === id)) return old
    return {
      ...old,
      items: old.items.filter((n) => n.id !== id),
      ...(old.total !== undefined && { total: old.total - 1 }),
    }
  })
}

export const tipKeys = {
  replies: (tipId: string) => ['tip', tipId, 'replies'] as const,
}
