import { useQuery } from '@tanstack/react-query'
import { fetchRegionNotes } from '@/features/region/api'
import { regionKeys } from '@/features/region/queryKeys'
import type { NotesSort } from '@/features/region/types'

export function useRegionNotesQuery(id: string, sort: NotesSort = 'helpful') {
  return useQuery({
    queryKey: regionKeys.notes(id, { sort }),
    queryFn: () => fetchRegionNotes(id, sort),
  })
}
